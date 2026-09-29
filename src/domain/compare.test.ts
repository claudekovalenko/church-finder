import { describe, expect, it } from 'vitest';
import { compare, overlapOf } from './compare';
import { DEFAULT_PROFILE } from './profile';
import type { Church } from './types';

function church(id: string, values: Church['values']): Church {
  return { id, name: id, kind: 'candidate', stage: 'shortlist', summary: '', notes: '', values, visits: [] };
}

describe('overlapOf', () => {
  it('reads fit as overlap, partly, or rubs', () => {
    expect(overlapOf(1)).toBe('overlap');
    expect(overlapOf(0.5)).toBe('partial');
    expect(overlapOf(0.1)).toBe('rub');
    expect(overlapOf(undefined)).toBe('unknown');
  });

  it('calls a crossed line a rub however close the rest looks', () => {
    expect(overlapOf(0.9, true)).toBe('rub');
  });
});

describe('compare', () => {
  const a = church('a', {
    'family-discipleship': { value: 90, confidence: 1, provenance: 'observed' },
    size: { value: 100, confidence: 1, provenance: 'observed' },
    authority: { value: 90, confidence: 1, provenance: 'stated' },
  });
  const b = church('b', {});
  const { rows, summaries } = compare(DEFAULT_PROFILE, [a, b]);
  const row = (id: string) => rows.find((r) => r.axisId === id)!;

  it('lists your values heaviest first, one cell per church', () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].weight).toBeGreaterThanOrEqual(rows[i].weight);
    }
    expect(rows.every((r) => r.cells.length === 2)).toBe(true);
  });

  it('says where a church overlaps and where it rubs', () => {
    expect(row('family-discipleship').cells[0].overlap).toBe('overlap');
    expect(row('size').cells[0].overlap).toBe('rub');
    expect(row('authority').cells[0].crossesLine).toBe(true);
  });

  it('leaves unanswered values as questions, not as bad marks', () => {
    expect(row('family-discipleship').cells[1].overlap).toBe('unknown');
    expect(summaries[1].knownShare).toBe(0);
    expect(summaries[1].sharedShare).toBe(0);
  });

  it('measures shared ground only over what is known', () => {
    // Family overlaps (10), size (6) and authority (10) rub.
    expect(summaries[0].sharedShare).toBeCloseTo(10 / 26, 3);
    expect(summaries[0].counts.overlap).toBe(1);
    expect(summaries[0].counts.rub).toBe(2);
  });
});
