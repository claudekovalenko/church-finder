/**
 * Core types for the church-matching model.
 *
 * Every theological position in this app is expressed on a 0-100 spectrum.
 * That is a deliberate simplification: real convictions are not scalars. The
 * point is not to reduce doctrine to a number, but to make *comparison*
 * tractable and to surface which questions still need answering.
 */

export type AxisId = string;

/** Where a value sits on an axis, with the label that explains what it means. */
export interface AxisAnchor {
  value: number;
  label: string;
  description: string;
}

export type AxisCategory =
  | 'non-negotiable'
  | 'conviction'
  | 'practice'
  | 'mission'
  | 'style';

export interface Axis {
  id: AxisId;
  name: string;
  category: AxisCategory;
  /** The question this axis is really asking about a church. */
  question: string;
  /** What to actually ask a pastor or elder to pin this down. */
  diagnostic: string;
  /** Label for the 0 end of the spectrum. */
  lowLabel: string;
  /** Label for the 100 end of the spectrum. */
  highLabel: string;
  anchors: AxisAnchor[];
}

/**
 * How a target is compared to a church's value.
 * - `proximity`: closer to the target is better in both directions. Use this
 *   where both extremes are wrong (e.g. gifts: cessationism on one side,
 *   unbounded charismaticism on the other).
 * - `atLeast`: anything at or above the target is full credit. Use this for
 *   "more is simply better" axes (missions zeal, elder accountability).
 * - `atMost`: anything at or below the target is full credit.
 */
export type ScoringMode = 'proximity' | 'atLeast' | 'atMost';

export interface AxisPreference {
  axisId: AxisId;
  /** Where you sit / what you are looking for, 0-100. */
  target: number;
  /** Relative importance, 0-10. A 0 drops the axis from scoring entirely. */
  weight: number;
  mode: ScoringMode;
  /**
   * Distance (in axis points) at which fit falls to zero. Smaller = pickier.
   * A tolerance of 40 means a church 40 points off gets no credit on this axis.
   */
  tolerance: number;
  /**
   * A hard limit. A church with a *known* value past this line is ruled out
   * regardless of how well it scores everywhere else.
   */
  dealbreaker?: {
    above?: number;
    below?: number;
    /** Why this is a line you will not cross. Shown in the rule-out notice. */
    reason: string;
  };
}

export interface Profile {
  id: string;
  name: string;
  /** Free-text summary of where you are, in your own words. */
  summary: string;
  preferences: AxisPreference[];
  updatedAt: string;
}

/** Where a piece of data about a church came from, and how much to trust it. */
export type Provenance =
  | 'stated' // the church says this publicly (doctrinal statement, sermon, bylaws)
  | 'observed' // you saw or heard it yourself
  | 'inferred' // deduced from affiliation, name, or network
  | 'assumed'; // placeholder; really just a guess

export interface AxisDatum {
  value: number;
  /** 0-1. How sure you are of this value. */
  confidence: number;
  provenance: Provenance;
  /** URL or short citation backing the value. */
  source?: string;
  note?: string;
}

/**
 * A church moves through these as you discern. The whole point of the app is
 * to end at `committed` for exactly one church.
 */
export type Stage =
  | 'shortlist'
  | 'researching'
  | 'visiting'
  | 'conversations'
  | 'committed'
  | 'ruled-out';

export const STAGE_ORDER: Stage[] = [
  'shortlist',
  'researching',
  'visiting',
  'conversations',
  'committed',
  'ruled-out',
];

export interface VisitNote {
  id: string;
  date: string;
  /** What you did: a service, a members' class, coffee with an elder. */
  kind: string;
  body: string;
}

/**
 * `tradition` entries are generic denominational archetypes — they describe a
 * family, not a congregation, and are useful for ruling whole categories in or
 * out. `candidate` entries are actual churches you are considering.
 */
export type ChurchKind = 'tradition' | 'candidate';

export interface Church {
  id: string;
  name: string;
  kind: ChurchKind;
  /** City/region, or for traditions, a one-line description of the family. */
  locale?: string;
  website?: string;
  /** Denomination, network, or association as the church itself states it. */
  affiliation?: string;
  /** Archetype this church inherits unconfirmed defaults from. */
  traditionId?: string;
  stage: Stage;
  summary: string;
  notes: string;
  values: Partial<Record<AxisId, AxisDatum>>;
  visits: VisitNote[];
}

export interface AxisBreakdown {
  axisId: AxisId;
  /** 0-1, how well the church matches you on this axis alone. */
  fit: number;
  weight: number;
  /** Share of the final score this axis accounts for, 0-1. */
  share: number;
  target: number;
  value: number;
  confidence: number;
  provenance: Provenance;
}

export interface Dealbreaker {
  axisId: AxisId;
  axisName: string;
  value: number;
  reason: string;
  /** False when the church's value is only a guess — worth confirming first. */
  firm: boolean;
}

export interface Unknown {
  axisId: AxisId;
  axisName: string;
  weight: number;
  /** The question to actually put to a pastor or elder. */
  diagnostic: string;
  /** True if this axis could rule the church out entirely. */
  decisive: boolean;
}

export type Verdict =
  | 'strong-fit'
  | 'possible-fit'
  | 'weak-fit'
  | 'ruled-out'
  | 'too-little-data';

export interface MatchResult {
  churchId: string;
  /** 0-100, computed over the axes you have data for. */
  score: number;
  /**
   * 0-1. How much of your weighted concern is actually answered by known data.
   * A high score at low confidence means "promising, but you are guessing".
   */
  confidence: number;
  /**
   * 0-1. Of the data that *is* known, how much of it came from the church
   * stating it or from you observing it — as opposed to being inferred from an
   * affiliation or simply assumed.
   *
   * This is a different question from confidence, and the distinction matters:
   * you can be highly confident in a guess. A church profile prefilled from a
   * denominational archetype is complete, fairly confident, and entirely
   * uncorroborated, and it should not be allowed to present as a strong fit.
   */
  corroboration: number;
  verdict: Verdict;
  dealbreakers: Dealbreaker[];
  strengths: AxisBreakdown[];
  frictions: AxisBreakdown[];
  breakdown: AxisBreakdown[];
  /** Highest-weight axes with no data, i.e. your next questions. */
  unknowns: Unknown[];
}
