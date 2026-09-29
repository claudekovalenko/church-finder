import { AXES } from './domain/axes';
import { DEFAULT_PROFILE } from './domain/profile';
import { CANDIDATES } from './data/candidates';
import { TRADITIONS } from './data/traditions';
import type { AxisPreference, Church, Profile } from './domain/types';

/**
 * Saved state outlives the defaults it was seeded from. Without this, a new
 * axis or a revised default never reaches anyone who has already opened the
 * app — their copy is in localStorage, and it wins.
 *
 * The rule throughout: only replace what still matches the old seed exactly.
 * Anything you edited yourself is yours and is left alone.
 */
export const CURRENT_REVISION = 2;

export interface StoredState {
  profile: Profile;
  churches: Church[];
  revision?: number;
}

/** Revision 1 defaults that revision 2 changed, exactly as they shipped. */
const V1_PREFERENCES: Record<string, AxisPreference> = {
  baptism: {
    axisId: 'baptism',
    target: 0,
    weight: 10,
    mode: 'proximity',
    tolerance: 35,
    dealbreaker: {
      above: 40,
      reason:
        'Credobaptist by conviction. A church that baptizes infants is not one you can be a member of in good conscience.',
    },
  },
  authority: {
    axisId: 'authority',
    target: 0,
    weight: 10,
    mode: 'proximity',
    tolerance: 40,
    dealbreaker: {
      above: 50,
      reason:
        'Scripture is the final authority. Anything that binds the conscience alongside it — a magisterium, or a prophetic word that is never tested — is out.',
    },
  },
  confession: { axisId: 'confession', target: 85, weight: 7, mode: 'atLeast', tolerance: 50 },
  'global-missions': {
    axisId: 'global-missions',
    target: 90,
    weight: 8,
    mode: 'atLeast',
    tolerance: 45,
  },
};

const V1_PROFILE_NAME = 'Reformed Baptist, ordered continuationist';
const V1_MARINERS_SUMMARY = 'Unclear on their positions — that is the finding, for now.';

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function migrateProfile(profile: Profile, from: number): Profile {
  const defaults = new Map(DEFAULT_PROFILE.preferences.map((p) => [p.axisId, p]));
  let preferences = profile.preferences;

  if (from < 2) {
    preferences = preferences.map((p) => {
      const old = V1_PREFERENCES[p.axisId];
      return old && same(p, old) ? defaults.get(p.axisId)! : p;
    });
  }

  // Any axis the saved profile has never heard of gets its default preference.
  const have = new Set(preferences.map((p) => p.axisId));
  const missing = AXES.filter((a) => !have.has(a.id)).map((a) => defaults.get(a.id)!);
  preferences = [...preferences, ...missing];

  const untouched = from < 2 && profile.name === V1_PROFILE_NAME;
  return {
    ...profile,
    preferences,
    ...(untouched ? { name: DEFAULT_PROFILE.name, summary: DEFAULT_PROFILE.summary } : {}),
  };
}

function migrateChurch(church: Church, from: number): Church {
  const seedTradition = TRADITIONS.find((t) => t.id === church.id);
  if (seedTradition) {
    // New axes need an archetype value, or every tradition goes blank on them.
    const values = { ...church.values };
    for (const [axisId, datum] of Object.entries(seedTradition.values)) {
      if (!values[axisId]) values[axisId] = datum;
    }
    return { ...church, values };
  }

  if (from < 2 && church.id === 'mariners' && church.summary === V1_MARINERS_SUMMARY) {
    const seed = CANDIDATES.find((c) => c.id === 'mariners')!;
    return { ...church, stage: seed.stage, summary: seed.summary, notes: seed.notes };
  }

  return church;
}

export function migrate<T extends StoredState>(state: T): T & { revision: number } {
  const from = state.revision ?? 1;
  return {
    ...state,
    profile: migrateProfile(state.profile, from),
    churches: state.churches.map((c) => migrateChurch(c, from)),
    revision: CURRENT_REVISION,
  };
}
