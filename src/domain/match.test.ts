import { describe, expect, it } from 'vitest';
import { axisFit, checkDealbreaker, matchAll, matchChurch, openQuestions } from './match';
import { DEFAULT_PROFILE } from './profile';
import { TRADITIONS } from '../data/traditions';
import { CANDIDATES } from '../data/candidates';
import { AXES } from './axes';
import type { AxisDatum, Church, Provenance } from './types';

function church(id: string, values: Church['values'], stage: Church['stage'] = 'shortlist'): Church {
  return {
    id,
    name: id,
    kind: 'candidate',
    stage,
    summary: '',
    notes: '',
    values,
    visits: [],
  };
}

function datum(value: number, confidence = 1, provenance: Provenance = 'stated'): AxisDatum {
  return { value, confidence, provenance };
}

describe('axisFit', () => {
  it('gives full credit at the target', () => {
    expect(axisFit(55, { target: 55, mode: 'proximity', tolerance: 30 })).toBe(1);
  });

  it('falls off linearly and bottoms out at the tolerance', () => {
    expect(axisFit(70, { target: 55, mode: 'proximity', tolerance: 30 })).toBeCloseTo(0.5);
    expect(axisFit(85, { target: 55, mode: 'proximity', tolerance: 30 })).toBe(0);
    expect(axisFit(100, { target: 55, mode: 'proximity', tolerance: 30 })).toBe(0);
  });

  it('atLeast ignores overshoot', () => {
    expect(axisFit(100, { target: 85, mode: 'atLeast', tolerance: 50 })).toBe(1);
    expect(axisFit(85, { target: 85, mode: 'atLeast', tolerance: 50 })).toBe(1);
    expect(axisFit(60, { target: 85, mode: 'atLeast', tolerance: 50 })).toBeCloseTo(0.5);
  });

  it('atMost ignores undershoot', () => {
    expect(axisFit(0, { target: 20, mode: 'atMost', tolerance: 40 })).toBe(1);
    expect(axisFit(40, { target: 20, mode: 'atMost', tolerance: 40 })).toBeCloseTo(0.5);
  });
});

describe('the spiritual gifts axis is genuinely two-sided', () => {
  // This is the case a naive "more is better" model gets wrong, and the reason
  // the engine supports proximity scoring at all.
  const pref = DEFAULT_PROFILE.preferences.find((p) => p.axisId === 'spiritual-gifts')!;

  it('scores ordered continuationism highest', () => {
    expect(axisFit(55, pref)).toBe(1);
  });

  it('penalises cessationism', () => {
    expect(axisFit(0, pref)).toBe(0);
    expect(axisFit(30, pref)).toBeLessThan(0.3);
  });

  it('penalises unbounded charismatic practice just as much', () => {
    expect(axisFit(95, pref)).toBe(0);
  });

  it('is symmetric — neither extreme is preferred over the other', () => {
    expect(axisFit(40, pref)).toBeCloseTo(axisFit(70, pref));
  });
});

describe('dealbreakers', () => {
  const baptism = DEFAULT_PROFILE.preferences.find((p) => p.axisId === 'baptism')!;

  it('fires on a known paedobaptist position', () => {
    const broken = checkDealbreaker(baptism, datum(85));
    expect(broken?.firm).toBe(true);
  });

  it('does not fire inside the line', () => {
    expect(checkDealbreaker(baptism, datum(25))).toBeNull();
  });

  it('flags but does not firmly rule out when the value is only a guess', () => {
    const broken = checkDealbreaker(baptism, { value: 85, confidence: 0.3, provenance: 'assumed' });
    expect(broken).not.toBeNull();
    expect(broken?.firm).toBe(false);
  });

  it('a soft dealbreaker caps the verdict rather than closing the door', () => {
    const values = Object.fromEntries(
      DEFAULT_PROFILE.preferences.map((p) => [p.axisId, datum(p.target, 1)]),
    );
    values.baptism = { value: 85, confidence: 0.3, provenance: 'assumed' };
    const result = matchChurch(DEFAULT_PROFILE, church('soft', values));
    expect(result.verdict).toBe('possible-fit');
    expect(result.dealbreakers).toHaveLength(1);
  });
});

describe('confidence', () => {
  it('is zero for a church with no data, and the verdict says so', () => {
    const result = matchChurch(DEFAULT_PROFILE, church('blank', {}));
    expect(result.confidence).toBe(0);
    expect(result.verdict).toBe('too-little-data');
    expect(result.unknowns).toHaveLength(DEFAULT_PROFILE.preferences.filter((p) => p.weight > 0).length);
  });

  it('refuses to call a high score a strong fit when the data is thin', () => {
    const result = matchChurch(
      DEFAULT_PROFILE,
      church('thin', { baptism: datum(0, 1), 'worship-style': datum(50, 1) }),
    );
    expect(result.score).toBe(100);
    expect(result.verdict).toBe('too-little-data');
  });

  it('discounts low-confidence data rather than trusting it fully', () => {
    const sure = matchChurch(
      DEFAULT_PROFILE,
      church('sure', Object.fromEntries(DEFAULT_PROFILE.preferences.map((p) => [p.axisId, datum(p.target, 1)]))),
    );
    const unsure = matchChurch(
      DEFAULT_PROFILE,
      church('unsure', Object.fromEntries(DEFAULT_PROFILE.preferences.map((p) => [p.axisId, datum(p.target, 0.3)]))),
    );
    expect(sure.score).toBe(unsure.score);
    expect(unsure.confidence).toBeLessThan(sure.confidence);
  });
});

describe('corroboration — guesses are not allowed to become conclusions', () => {
  const perfectBut = (provenance: Provenance) =>
    matchChurch(
      DEFAULT_PROFILE,
      church(
        provenance,
        Object.fromEntries(
          DEFAULT_PROFILE.preferences.map((p) => [p.axisId, datum(p.target, 0.9, provenance)]),
        ),
      ),
    );

  it('calls a perfect, well-sourced profile a strong fit', () => {
    const r = perfectBut('stated');
    expect(r.score).toBe(100);
    expect(r.corroboration).toBe(1);
    expect(r.verdict).toBe('strong-fit');
  });

  it('counts your own observation as first-hand too', () => {
    expect(perfectBut('observed').verdict).toBe('strong-fit');
  });

  it('refuses to call the same profile a strong fit when it is all inference', () => {
    const r = perfectBut('inferred');
    expect(r.score).toBe(100);
    expect(r.corroboration).toBe(0);
    expect(r.verdict).toBe('possible-fit');
  });

  it('is the share of known data that is first-hand, not of all data', () => {
    const r = matchChurch(
      DEFAULT_PROFILE,
      church('mixed', {
        baptism: datum(0, 1, 'stated'),
        polity: datum(85, 1, 'assumed'),
      }),
    );
    // Baptism carries weight 10, polity weight 9, both at full confidence.
    expect(r.corroboration).toBeCloseTo(10 / 19, 2);
  });

  it('holds a church prefilled from a tradition below strong fit', () => {
    // Exactly what the "prefill from tradition" button produces: complete,
    // moderately confident, entirely inferred.
    const prefilled = Object.fromEntries(
      Object.entries(TRADITIONS.find((t) => t.id === 'reformed-baptist-1689')!.values).map(
        ([axisId, v]) => [
          axisId,
          { value: v!.value, confidence: Math.min(0.5, v!.confidence * 0.5), provenance: 'inferred' as const },
        ],
      ),
    );
    const r = matchChurch(DEFAULT_PROFILE, church('prefilled', prefilled));
    expect(r.score).toBeGreaterThan(80);
    expect(r.verdict).not.toBe('strong-fit');
  });
});

describe('unknowns become the question list', () => {
  it('puts decisive axes first, then the heaviest', () => {
    const result = matchChurch(DEFAULT_PROFILE, church('blank', {}));
    const firstFew = result.unknowns.slice(0, 5);
    expect(firstFew.every((u) => u.decisive)).toBe(true);
    expect(result.unknowns[0].diagnostic).toBeTruthy();
  });

  it('surfaces churches you have not investigated, ahead of ones you have', () => {
    const investigated = church(
      'known',
      Object.fromEntries(DEFAULT_PROFILE.preferences.map((p) => [p.axisId, datum(p.target)])),
    );
    const rows = openQuestions(DEFAULT_PROFILE, [investigated, church('unknown', {})]);
    expect(rows[0].church.id).toBe('unknown');
    expect(rows.find((r) => r.church.id === 'known')).toBeUndefined();
  });

  it('ignores churches already ruled out', () => {
    const rows = openQuestions(DEFAULT_PROFILE, [church('gone', {}, 'ruled-out')]);
    expect(rows).toHaveLength(0);
  });
});

describe('the seeded traditions behave the way the convictions say they should', () => {
  const results = new Map(
    matchAll(DEFAULT_PROFILE, TRADITIONS).map((r) => [r.churchId, r]),
  );

  it('rules out the paedobaptist families on baptism', () => {
    for (const id of ['presbyterian-pca', 'lutheran-lcms', 'anglican-acna']) {
      const r = results.get(id)!;
      expect(r.verdict, id).toBe('ruled-out');
      expect(r.dealbreakers.map((d) => d.axisId), id).toContain('baptism');
    }
  });

  it('rules out Rome and Orthodoxy on authority as well as baptism', () => {
    for (const id of ['roman-catholic', 'eastern-orthodox']) {
      const axes = results.get(id)!.dealbreakers.map((d) => d.axisId);
      expect(axes, id).toContain('authority');
      expect(axes, id).toContain('baptism');
    }
  });

  it('rules out the progressive mainline on ethics', () => {
    expect(results.get('progressive-mainline')!.dealbreakers.map((d) => d.axisId)).toContain(
      'cultural-posture',
    );
  });

  it('rules out disciple-making movements on oversight — and only on oversight', () => {
    const r = results.get('disciple-making-movement')!;
    expect(r.verdict).toBe('ruled-out');
    expect(r.dealbreakers.map((d) => d.axisId)).toEqual(['polity']);
  });

  it('still credits disciple-making movements for the things you admire about them', () => {
    const r = results.get('disciple-making-movement')!;
    const strong = r.strengths.map((s) => s.axisId);
    expect(strong).toContain('lay-mobilisation');
    expect(strong).toContain('local-evangelism');
  });

  it('ranks Sovereign Grace first among the families still in play', () => {
    const live = matchAll(DEFAULT_PROFILE, TRADITIONS).filter((r) => r.verdict !== 'ruled-out');
    expect(live[0].churchId).toBe('sovereign-grace-churches');
  });

  it('keeps confessional Reformed Baptists in play but flags the gifts as the friction', () => {
    const r = results.get('reformed-baptist-1689')!;
    expect(r.verdict).not.toBe('ruled-out');
    expect(r.frictions.map((f) => f.axisId)).toContain('spiritual-gifts');
  });

  it('rules out the revivalist stream on authority', () => {
    expect(results.get('revivalist-charismatic')!.dealbreakers.map((d) => d.axisId)).toContain(
      'authority',
    );
  });

  it('rules out classical Pentecostalism on the eldership question, not on the gifts', () => {
    const axes = results.get('pentecostal-classical')!.dealbreakers.map((d) => d.axisId);
    expect(axes).toContain('gender-roles');
    expect(axes).not.toContain('spiritual-gifts');
  });
});

describe('the named candidates ship without invented data', () => {
  it('carries no doctrinal values for any real congregation', () => {
    for (const c of CANDIDATES) {
      expect(Object.keys(c.values), c.name).toHaveLength(0);
    }
  });

  it('reports them as needing investigation rather than scoring them', () => {
    for (const r of matchAll(DEFAULT_PROFILE, CANDIDATES)) {
      const c = CANDIDATES.find((x) => x.id === r.churchId)!;
      expect(r.verdict, c.name).toBe(c.stage === 'ruled-out' ? 'ruled-out' : 'too-little-data');
    }
  });

  it('only hints at a tradition where the church name states the affiliation', () => {
    const hinted = CANDIDATES.filter((c) => c.traditionId).map((c) => c.id);
    expect(hinted.sort()).toEqual(['sovereign-grace', 'trinity-reformed-baptist']);
    for (const c of CANDIDATES) {
      if (!c.traditionId) continue;
      expect(TRADITIONS.some((t) => t.id === c.traditionId), c.name).toBe(true);
    }
  });
});

describe('model integrity', () => {
  it('gives every church a unique id', () => {
    // A collision here is invisible in the data and disastrous in the UI: two
    // entries share a key, and one silently renders in place of the other.
    const ids = [...TRADITIONS, ...CANDIDATES].map((c) => c.id);
    expect(ids).toHaveLength(new Set(ids).size);
  });

  it('has a preference for every axis and an axis for every preference', () => {
    const axisIds = AXES.map((a) => a.id).sort();
    const prefIds = DEFAULT_PROFILE.preferences.map((p) => p.axisId).sort();
    expect(prefIds).toEqual(axisIds);
  });

  it('gives every axis anchors that span the spectrum', () => {
    for (const axis of AXES) {
      expect(axis.anchors.length, axis.id).toBeGreaterThanOrEqual(3);
      expect(axis.anchors[0].value, axis.id).toBe(0);
      expect(axis.anchors.at(-1)!.value, axis.id).toBe(100);
      expect(axis.diagnostic.length, axis.id).toBeGreaterThan(20);
    }
  });

  it('only sets tradition values on axes that exist', () => {
    const axisIds = new Set(AXES.map((a) => a.id));
    for (const t of TRADITIONS) {
      for (const key of Object.keys(t.values)) {
        expect(axisIds.has(key), `${t.id}.${key}`).toBe(true);
      }
      // Every tradition should speak to every axis, or the comparison is unfair.
      expect(Object.keys(t.values).length, t.id).toBe(AXES.length);
    }
  });

  it('keeps every value and confidence in range', () => {
    for (const t of TRADITIONS) {
      for (const [key, v] of Object.entries(t.values)) {
        expect(v!.value, `${t.id}.${key}`).toBeGreaterThanOrEqual(0);
        expect(v!.value, `${t.id}.${key}`).toBeLessThanOrEqual(100);
        expect(v!.confidence, `${t.id}.${key}`).toBeGreaterThan(0);
        expect(v!.confidence, `${t.id}.${key}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
