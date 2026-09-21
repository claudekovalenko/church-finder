import type { Church } from '../domain/types';

/**
 * The actual churches under consideration.
 *
 * Deliberately shipped with **no doctrinal data filled in**. Everything the app
 * knows about a real congregation should come from that congregation — its
 * doctrinal statement, its bylaws, its sermons, or an elder answering the
 * question to your face. Guessing at a real church's positions and then
 * scoring it against them would produce a confident-looking number built on
 * nothing.
 *
 * So each of these starts at zero confidence, which makes the app say
 * "too little data" and hand you the list of questions to go ask. That is the
 * correct answer for a church you have not investigated yet.
 *
 * `traditionId` is set only where the church's own name or stated affiliation
 * declares the family. It is a hint for the "inherit from tradition" button on
 * the church page — it fills values in as *inferred*, at half confidence, for
 * you to confirm or overwrite. It is not treated as fact.
 */
export const CANDIDATES: Church[] = [
  {
    id: 'neighbors-and-nations',
    name: 'Neighbors and Nations',
    kind: 'candidate',
    stage: 'visiting',
    summary: 'Currently attending.',
    notes: [
      'The church you are actually going to right now, so it gets the benefit of',
      'observation the others do not. Fill in the axes from what you have heard',
      'preached and seen practised, not from the website — and mark those as',
      '"observed" so you can tell later which judgements were yours.',
      '',
      'The name suggests both local and global mission, which is one of your',
      'highest weights. Worth confirming what that actually amounts to: who has',
      'been sent, and who is being trained to go.',
    ].join('\n'),
    values: {},
    visits: [],
  },
  {
    id: 'trinity-reformed-baptist',
    name: 'Trinity Reformed Baptist Church',
    kind: 'candidate',
    stage: 'shortlist',
    traditionId: 'reformed-baptist-1689',
    summary: 'Confessional Reformed Baptist, by the name.',
    notes: [
      'On paper this is the closest formal match to your convictions: credobaptist,',
      'Calvinistic, confessional, elder-led.',
      '',
      'The question to go and answer is the gifts. Much of the confessional',
      'Reformed Baptist world is cessationist or open-but-cautious, and you are',
      'neither. Find out whether continuationism is a permitted position here or a',
      'problem here — that is the difference between a church you can grow in and a',
      'church where you would be quietly holding something back for years.',
      '',
      'Also worth asking: is there room to be examined for eldership as someone who',
      'holds the gifts are ongoing?',
    ].join('\n'),
    values: {},
    visits: [],
  },
  {
    id: 'sovereign-grace',
    name: 'Sovereign Grace (local congregation)',
    kind: 'candidate',
    stage: 'shortlist',
    traditionId: 'sovereign-grace-churches',
    summary: 'Worth a visit — the network profile matches you unusually well.',
    notes: [
      'You mentioned checking this out. On the archetype it is the closest fit of',
      'any family in the list, because it is one of the few that is Reformed,',
      'credobaptist, complementarian and continuationist at the same time — with a',
      'formal elder polity and accountability outside the local congregation.',
      '',
      'Find the specific congregation near you and swap this placeholder for it.',
      'Network-level fit is a reason to visit, not a reason to commit; the local',
      'eldership is what you would actually be sitting under.',
      '',
      'Read up on the network’s history around abuse allegations and how it',
      'responded, and ask the local elders about it directly. Given that your stated',
      'concern with movements is oversight and accountability, that conversation is',
      'not optional.',
    ].join('\n'),
    values: {},
    visits: [],
  },
  {
    id: 'mariners',
    name: 'Mariners Church',
    kind: 'candidate',
    stage: 'researching',
    summary: 'Unclear on their positions — that is the finding, for now.',
    notes: [
      'You said you are not clear on where they stand. The app treats that as a',
      'task rather than a verdict: see the question list on this church.',
      '',
      'Start with the published doctrinal statement and work out what it does not',
      'say. For a large contemporary church, the axes most likely to be unstated are',
      'the ones weighted heaviest for you — soteriology, the gifts, who may be an',
      'elder, and whether membership means anything. Absence of a stated position',
      'is itself data; record it as a low value on confessional clarity rather than',
      'leaving the axis blank.',
    ].join('\n'),
    values: {},
    visits: [],
  },
  {
    id: 'the-garden',
    name: 'The Garden',
    kind: 'candidate',
    stage: 'ruled-out',
    summary: 'Ruled out on preaching and pastoral leadership.',
    notes: [
      'Your own reasoning, recorded as you gave it: hard to attend, on two grounds —',
      'concerns about the pastoral leadership, and concerns about the handling of the',
      'text.',
      '',
      'No axis values have been filled in, because these were impressions rather than',
      'positions you had confirmed. If you want this rule-out to hold up under',
      'pressure later, put numbers on Preaching and Oversight and eldership with',
      'provenance "observed", and write down the specific sermon or the specific',
      'decision behind the impression. A rule-out you can articulate is worth far',
      'more than one you can only feel — both for your own conscience, and for the',
      'conversation you may eventually have with someone there.',
    ].join('\n'),
    values: {},
    visits: [],
  },
];
