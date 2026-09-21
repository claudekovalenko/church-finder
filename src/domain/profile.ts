import { AXES } from './axes';
import type { AxisPreference, Profile } from './types';

/**
 * The starting profile: a Reformed Baptist frame, credobaptist and
 * complementarian, ordered continuationist rather than cessationist or
 * unbounded charismatic, expository, missional, and unwilling to sit under
 * leadership with no real accountability.
 *
 * Every number here is meant to be argued with. Change them on the Profile
 * page; the file is only the starting point.
 */
export const REFORMED_BAPTIST_CONTINUATIONIST: AxisPreference[] = [
  {
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
  {
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
  {
    axisId: 'gender-roles',
    target: 5,
    weight: 9,
    mode: 'atMost',
    tolerance: 45,
    dealbreaker: {
      above: 65,
      reason: 'Complementarian: the office of elder is restricted to qualified men.',
    },
  },
  {
    axisId: 'soteriology',
    target: 5,
    weight: 8,
    mode: 'atMost',
    tolerance: 50,
    dealbreaker: {
      above: 85,
      reason:
        'A church that functionally denies human inability is preaching a different gospel, whatever it says on paper.',
    },
  },
  {
    axisId: 'spiritual-gifts',
    target: 55,
    weight: 8,
    // Proximity, not "more is better": cessationism is a real mismatch, and so
    // is unvetted charismatic practice. The target sits at ordered
    // continuationism, and both directions cost you.
    mode: 'proximity',
    tolerance: 30,
    dealbreaker: {
      above: 90,
      reason:
        'The gifts are real, but they are governed by Scripture and weighed by elders. Revelation that outranks the text is out.',
    },
  },
  {
    axisId: 'preaching',
    target: 10,
    weight: 9,
    mode: 'atMost',
    tolerance: 45,
  },
  {
    axisId: 'confession',
    target: 85,
    weight: 7,
    mode: 'atLeast',
    tolerance: 50,
  },
  {
    axisId: 'cultural-posture',
    target: 90,
    weight: 8,
    mode: 'atLeast',
    tolerance: 45,
    dealbreaker: {
      below: 30,
      reason:
        'A church that has revised the historic Christian ethic has revised its doctrine of Scripture first.',
    },
  },
  {
    axisId: 'polity',
    target: 85,
    weight: 9,
    mode: 'atLeast',
    tolerance: 50,
    dealbreaker: {
      below: 25,
      reason:
        'No recognised elders and no accountability. You have seen where that goes; zeal without oversight is not a place to plant yourself.',
    },
  },
  {
    axisId: 'membership',
    target: 80,
    weight: 6,
    mode: 'atLeast',
    tolerance: 50,
  },
  {
    axisId: 'leader-development',
    target: 85,
    weight: 7,
    mode: 'atLeast',
    tolerance: 50,
  },
  {
    axisId: 'lay-mobilisation',
    target: 80,
    weight: 7,
    mode: 'atLeast',
    tolerance: 45,
  },
  {
    axisId: 'local-evangelism',
    target: 85,
    weight: 8,
    mode: 'atLeast',
    tolerance: 45,
  },
  {
    axisId: 'global-missions',
    target: 90,
    weight: 8,
    mode: 'atLeast',
    tolerance: 45,
  },
  {
    axisId: 'worship-style',
    target: 50,
    weight: 3,
    // Genuinely open here, so a wide tolerance and a low weight. This axis
    // should never be what decides it.
    mode: 'proximity',
    tolerance: 60,
  },
];

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: 'Reformed Baptist, ordered continuationist',
  summary: [
    'Closest to a Reformed Baptist confession. Credobaptist by conviction, complementarian,',
    'and continuationist — the manifestations of the Spirit are real, but bounded by Scripture',
    'and weighed by elders rather than left to run. Expository preaching, historic ethics,',
    'a plurality of accountable elders. Missional: the gospel to this country and our own',
    'people sent to the ends of the earth. Drawn to the every-member zeal of disciple-making',
    'movements, unwilling to accept their lack of oversight. Open to eldership in time.',
  ].join(' '),
  preferences: REFORMED_BAPTIST_CONTINUATIONIST,
  updatedAt: new Date().toISOString(),
};

/** A blank slate for someone starting from scratch rather than this profile. */
export function emptyProfile(name = 'New profile'): Profile {
  return {
    id: `profile-${Date.now()}`,
    name,
    summary: '',
    preferences: AXES.map((axis) => ({
      axisId: axis.id,
      target: 50,
      weight: 5,
      mode: 'proximity' as const,
      tolerance: 45,
    })),
    updatedAt: new Date().toISOString(),
  };
}
