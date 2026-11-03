import { AXES } from './domain/axes';
import { DEFAULT_CALLING, DEFAULT_PROFILE } from './domain/profile';
import { CANDIDATES } from './data/candidates';
import { LOCAL_CHURCHES } from './data/local';
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
export const CURRENT_REVISION = 4;

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

/** Shortlist entries revision 3 shipped as placeholders, keyed by id. */
const V3_PLACEHOLDER_NAMES: Record<string, string> = {
  'trinity-reformed-baptist': 'Trinity Reformed Baptist Church',
  'sovereign-grace': 'Sovereign Grace (local congregation)',
};
const V3_TRINITY_SUMMARY = 'Confessional Reformed Baptist, by the name.';

const V1_PROFILE_NAME = 'Reformed Baptist, ordered continuationist';
const V1_MARINERS_SUMMARY = 'Unclear on their positions — that is the finding, for now.';

/** The summary revision 2 shipped, before church planting was added to it. */
const V2_SUMMARY = [
  'Held with humility — God may well dictate these differently. A home, not just somewhere',
  'to attend: small enough to be known. God-centred and God-loving, people who deeply love',
  'the Lord and let the Word be the Word — inerrant, with doctrine already settled so it',
  'does not need constant correcting. Healthy families: humble, non-contentious marriages,',
  'and honouring, obedient children who experience and know the Lord in a real and profound',
  'way and go on to raise healthy families of their own. Leaning baptistic, though not',
  'against paedobaptism; not concerned whether it is dispensational or covenantal.',
  'Complementarian, with accountable elders. A real missional drive that treats eternity as',
  'the thing to live and give everything for — a base to go out from and change the world.',
].join(' ');

/** The summary revision 3 shipped, before race and politics were added to it. */
const V3_SUMMARY = [
  V2_SUMMARY,
  'A church that plants churches, and could train and send me if that is the call.',
].join(' ');

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
  const summaryUntouched =
    (from < 3 && profile.summary === V2_SUMMARY) || (from < 4 && profile.summary === V3_SUMMARY);
  return {
    ...profile,
    preferences,
    ...(untouched ? { name: DEFAULT_PROFILE.name, summary: DEFAULT_PROFILE.summary } : {}),
    ...(summaryUntouched ? { summary: DEFAULT_PROFILE.summary } : {}),
    // Never written before this revision, so there is nothing of yours to keep.
    calling: profile.calling ?? DEFAULT_CALLING,
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

  // Revision 4 found the actual congregations behind two placeholders. Fill in
  // where they are and who they are, but only over fields you never touched.
  if (from < 4 && V3_PLACEHOLDER_NAMES[church.id] === church.name) {
    const seed = CANDIDATES.find((c) => c.id === church.id)!;
    const untouchedSummary =
      church.id === 'trinity-reformed-baptist' ? church.summary === V3_TRINITY_SUMMARY : true;
    return {
      ...church,
      name: church.id === 'sovereign-grace' ? seed.name : church.name,
      locale: church.locale || seed.locale,
      affiliation: church.affiliation || seed.affiliation,
      website: church.website || seed.website,
      ...(untouchedSummary && church.id === 'trinity-reformed-baptist' ? { summary: seed.summary } : {}),
    };
  }

  if (from < 2 && church.id === 'mariners' && church.summary === V1_MARINERS_SUMMARY) {
    const seed = CANDIDATES.find((c) => c.id === 'mariners')!;
    return { ...church, stage: seed.stage, summary: seed.summary, notes: seed.notes };
  }

  return church;
}

/**
 * The long list arrived in revision 4. Add it once, after your own candidates
 * and before the traditions; after that, a church you delete stays deleted.
 */
function addLongList(churches: Church[], from: number): Church[] {
  if (from >= 4) return churches;
  const have = new Set(churches.map((c) => c.id));
  const add = LOCAL_CHURCHES.filter((c) => !have.has(c.id));
  const firstTradition = churches.findIndex((c) => c.kind === 'tradition');
  const at = firstTradition === -1 ? churches.length : firstTradition;
  return [...churches.slice(0, at), ...add, ...churches.slice(at)];
}

export function migrate<T extends StoredState>(state: T): T & { revision: number } {
  const from = state.revision ?? 1;
  return {
    ...state,
    profile: migrateProfile(state.profile, from),
    churches: addLongList(state.churches.map((c) => migrateChurch(c, from)), from),
    revision: CURRENT_REVISION,
  };
}
