import { describe, expect, it } from 'vitest';
import { migrate, CURRENT_REVISION } from './migrate';
import { DEFAULT_PROFILE } from './domain/profile';
import { AXES } from './domain/axes';
import { TRADITIONS } from './data/traditions';
import type { Church, Profile } from './domain/types';

/** A saved state as revision 1 of the app wrote it. */
function v1State(profileEdits: Partial<Profile> = {}) {
  const newAxes = ['family-discipleship', 'size'];
  const profile: Profile = {
    ...DEFAULT_PROFILE,
    name: 'Reformed Baptist, ordered continuationist',
    summary: 'old summary',
    preferences: DEFAULT_PROFILE.preferences
      .filter((p) => !newAxes.includes(p.axisId))
      .map((p) =>
        p.axisId === 'baptism'
          ? {
              axisId: 'baptism',
              target: 0,
              weight: 10,
              mode: 'proximity' as const,
              tolerance: 35,
              dealbreaker: {
                above: 40,
                reason:
                  'Credobaptist by conviction. A church that baptizes infants is not one you can be a member of in good conscience.',
              },
            }
          : p,
      ),
    ...profileEdits,
  };
  const mariners: Church = {
    id: 'mariners',
    name: 'Mariners Church',
    kind: 'candidate',
    stage: 'researching',
    summary: 'Unclear on their positions — that is the finding, for now.',
    notes: 'old',
    values: {},
    visits: [],
  };
  const traditions = TRADITIONS.map((t) => {
    const values = { ...t.values };
    for (const id of newAxes) delete values[id];
    return { ...t, values };
  });
  return { profile, churches: [mariners, ...traditions] };
}

describe('migrating saved state', () => {
  it('adds the new axes to an old profile', () => {
    const next = migrate(v1State());
    expect(next.profile.preferences.map((p) => p.axisId).sort()).toEqual(
      AXES.map((a) => a.id).sort(),
    );
    expect(next.revision).toBe(CURRENT_REVISION);
  });

  it('replaces an untouched old default, and the untouched name and summary', () => {
    const next = migrate(v1State());
    const baptism = next.profile.preferences.find((p) => p.axisId === 'baptism')!;
    expect(baptism.dealbreaker).toBeUndefined();
    expect(next.profile.name).toBe(DEFAULT_PROFILE.name);
    expect(next.profile.summary).toBe(DEFAULT_PROFILE.summary);
  });

  it('leaves anything you edited yourself alone', () => {
    const state = v1State({ name: 'Mine' });
    state.profile.preferences = state.profile.preferences.map((p) =>
      p.axisId === 'baptism' ? { ...p, weight: 4 } : p,
    );
    const next = migrate(state);
    expect(next.profile.name).toBe('Mine');
    expect(next.profile.preferences.find((p) => p.axisId === 'baptism')!.weight).toBe(4);
  });

  it('fills the new axes in on the saved traditions', () => {
    const next = migrate(v1State());
    for (const t of next.churches.filter((c) => c.kind === 'tradition')) {
      expect(Object.keys(t.values).length, t.id).toBe(AXES.length);
    }
  });

  it('moves Mariners off the list only if you had not already changed it', () => {
    expect(migrate(v1State()).churches[0].stage).toBe('ruled-out');
    const edited = v1State();
    edited.churches[0] = { ...edited.churches[0], stage: 'visiting', summary: 'my note' };
    expect(migrate(edited).churches[0].stage).toBe('visiting');
  });

  it('is idempotent', () => {
    const once = migrate(v1State());
    expect(migrate(once)).toEqual(once);
  });
});
