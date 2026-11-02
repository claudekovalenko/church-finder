import { AXES } from './axes';
import type { AxisPreference, Calling, Profile } from './types';

/**
 * The starting profile: a home church for a family. Inerrant Scripture,
 * settled doctrine, complementarian, leaning baptistic without making it a
 * wall, ordered continuationist, expository, missional, and unwilling to sit
 * under leadership with no real accountability — and, weighted as heavily as
 * any doctrine, healthy households and children who know the Lord.
 *
 * Every number here is meant to be argued with. Change them on the Profile
 * page; the file is only the starting point.
 */
export const REFORMED_BAPTIST_CONTINUATIONIST: AxisPreference[] = [
  {
    axisId: 'baptism',
    // Leaning baptistic, not against paedobaptism: anything up to open
    // credobaptist membership is full credit, and a paedobaptist church costs
    // something without being ruled out.
    target: 25,
    weight: 5,
    mode: 'atMost',
    tolerance: 70,
  },
  {
    axisId: 'authority',
    target: 0,
    weight: 10,
    mode: 'proximity',
    tolerance: 30,
    dealbreaker: {
      above: 50,
      reason:
        'Scripture is inerrant and the final authority. Anything that binds the conscience alongside it — a magisterium, or a prophetic word that is never tested — is out.',
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
    // Weighted up: a home church should already have its doctrine settled, so
    // your energy goes outward rather than into correcting the pulpit.
    target: 85,
    weight: 9,
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
    axisId: 'family-discipleship',
    // As heavy as any doctrine. The question is whether your children will
    // grow up among families you would want them to become.
    target: 85,
    weight: 10,
    mode: 'atLeast',
    tolerance: 50,
  },
  {
    axisId: 'size',
    // Somewhere your family can be known by name. Too small costs something
    // too — children need other healthy families to grow up alongside — but
    // it is the large end that turns a church into a place you attend.
    target: 35,
    weight: 6,
    mode: 'proximity',
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
    weight: 9,
    mode: 'atLeast',
    tolerance: 45,
  },
  {
    axisId: 'church-planting',
    // Not settled yet, so not a dealbreaker — but a church that has never
    // planted cannot show you how it is done, test whether you are called to
    // it, or send you well if you are.
    target: 80,
    weight: 7,
    mode: 'atLeast',
    tolerance: 50,
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

/**
 * A first draft, put together from what you have said out loud. It is meant to
 * be rewritten in your own words — the point is that it exists on paper.
 */
export const DEFAULT_CALLING: Calling = {
  mission: [
    'Making disciples who make disciples, from a local church with healthy theology —',
    'the Word held as a sword, not danced around — and eternity as the thing to live for.',
  ].join(' '),
  family: [
    'A household where the children grow up among healthy families: a humble marriage,',
    'children who know the Lord for themselves, and a church that helps us raise them.',
  ].join(' '),
  place: [
    'Southern California, because the mission field is here and I have peace about it.',
    'Somewhere a family can put down roots — not set on Los Angeles itself.',
  ].join(' '),
  planting: [
    'Seriously considering it. First, to be known, tested and trained in a sound local',
    'church, so that if I go, I am sent rather than self-appointed.',
  ].join(' '),
  forAWife: [
    'A life aimed at the church and the mission, not at comfort: membership and service',
    'in a local church, a home open to others, and possibly the cost and uncertainty of',
    'planting. Better said clearly now than discovered later.',
  ].join(' '),
};

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: 'A home church for my family',
  summary: [
    'Held with humility — God may well dictate these differently. A home, not just somewhere',
    'to attend: small enough to be known. God-centred and God-loving, people who deeply love',
    'the Lord and let the Word be the Word — inerrant, with doctrine already settled so it',
    'does not need constant correcting. Healthy families: humble, non-contentious marriages,',
    'and honouring, obedient children who experience and know the Lord in a real and profound',
    'way and go on to raise healthy families of their own. Leaning baptistic, though not',
    'against paedobaptism; not concerned whether it is dispensational or covenantal.',
    'Complementarian, with accountable elders. A real missional drive that treats eternity as',
    'the thing to live and give everything for — a base to go out from and change the world.',
    'A church that plants churches, and could train and send me if that is the call.',
  ].join(' '),
  calling: DEFAULT_CALLING,
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
