import { getAxis } from './axes';
import type {
  AxisBreakdown,
  AxisDatum,
  AxisPreference,
  Church,
  Dealbreaker,
  MatchResult,
  Profile,
  Provenance,
  ScoringMode,
  Unknown,
  Verdict,
} from './types';

/**
 * How well a single value matches a single preference, 0-1.
 *
 * The falloff is linear and reaches zero at `tolerance` points of distance.
 * A curve would be smoother, but linear is explainable: "you are 30 points
 * apart on a 40-point tolerance, so that axis is scoring a quarter." Being
 * able to say that in the UI is worth more than an elegant curve.
 */
export function axisFit(
  value: number,
  pref: Pick<AxisPreference, 'target' | 'mode' | 'tolerance'>,
): number {
  const distance = directedDistance(value, pref.target, pref.mode);
  if (distance <= 0) return 1;
  const tolerance = Math.max(pref.tolerance, 1);
  return clamp01(1 - distance / tolerance);
}

function directedDistance(value: number, target: number, mode: ScoringMode): number {
  switch (mode) {
    case 'proximity':
      return Math.abs(value - target);
    case 'atLeast':
      return Math.max(0, target - value);
    case 'atMost':
      return Math.max(0, value - target);
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** A known value that crosses a hard line, if there is one. */
export function checkDealbreaker(
  pref: AxisPreference,
  datum: AxisDatum,
): Dealbreaker | null {
  const limit = pref.dealbreaker;
  if (!limit) return null;
  const overAbove = limit.above !== undefined && datum.value > limit.above;
  const underBelow = limit.below !== undefined && datum.value < limit.below;
  if (!overAbove && !underBelow) return null;
  return {
    axisId: pref.axisId,
    axisName: getAxis(pref.axisId).name,
    value: datum.value,
    reason: limit.reason,
    // A guess should not close a door. Only confirmed data rules a church out
    // for good; anything softer is flagged as "probably out, go confirm".
    firm: datum.confidence >= 0.6 && datum.provenance !== 'assumed',
  };
}

export interface MatchOptions {
  /**
   * Below this confidence, a result is reported as `too-little-data` rather
   * than given a verdict it has not earned.
   */
  minimumConfidence?: number;
  /**
   * Below this share of first-hand evidence, a result cannot be called a strong
   * fit however well it scores. Guesswork does not get to be a conclusion.
   */
  minimumCorroboration?: number;
  strongFit?: number;
  possibleFit?: number;
}

const DEFAULTS: Required<MatchOptions> = {
  minimumConfidence: 0.35,
  minimumCorroboration: 0.4,
  strongFit: 80,
  possibleFit: 60,
};

/** Evidence you can point at, as opposed to evidence you produced yourself. */
function isFirstHand(provenance: Provenance): boolean {
  return provenance === 'stated' || provenance === 'observed';
}

export function matchChurch(
  profile: Profile,
  church: Church,
  options: MatchOptions = {},
): MatchResult {
  const opts = { ...DEFAULTS, ...options };
  const active = profile.preferences.filter((p) => p.weight > 0);

  const breakdown: AxisBreakdown[] = [];
  const dealbreakers: Dealbreaker[] = [];
  const unknowns: Unknown[] = [];

  let weightedFit = 0;
  let knownWeight = 0;
  let totalWeight = 0;
  let confidenceWeighted = 0;
  let firstHandWeight = 0;

  for (const pref of active) {
    totalWeight += pref.weight;
    const datum = church.values[pref.axisId];

    if (!datum) {
      unknowns.push({
        axisId: pref.axisId,
        axisName: getAxis(pref.axisId).name,
        weight: pref.weight,
        diagnostic: getAxis(pref.axisId).diagnostic,
        decisive: Boolean(pref.dealbreaker),
      });
      continue;
    }

    const broken = checkDealbreaker(pref, datum);
    if (broken) dealbreakers.push(broken);

    const fit = axisFit(datum.value, pref);
    // An uncertain datum contributes proportionally less weight, so a church
    // whose profile is mostly guesswork cannot ride those guesses to the top.
    const effectiveWeight = pref.weight * clamp01(datum.confidence);
    weightedFit += fit * effectiveWeight;
    knownWeight += effectiveWeight;
    confidenceWeighted += pref.weight * clamp01(datum.confidence);
    if (isFirstHand(datum.provenance)) firstHandWeight += effectiveWeight;

    breakdown.push({
      axisId: pref.axisId,
      fit,
      weight: pref.weight,
      share: 0, // filled in below, once the denominator is known
      target: pref.target,
      value: datum.value,
      confidence: datum.confidence,
      provenance: datum.provenance,
    });
  }

  const score = knownWeight > 0 ? (weightedFit / knownWeight) * 100 : 0;
  const confidence = totalWeight > 0 ? confidenceWeighted / totalWeight : 0;
  const corroboration = knownWeight > 0 ? firstHandWeight / knownWeight : 0;

  for (const row of breakdown) {
    row.share = knownWeight > 0 ? (row.fit * row.weight) / knownWeight : 0;
  }

  const ranked = [...breakdown].sort((a, b) => b.weight - a.weight);
  const strengths = ranked
    .filter((r) => r.fit >= 0.75)
    .sort((a, b) => b.fit * b.weight - a.fit * a.weight)
    .slice(0, 5);
  const frictions = ranked
    .filter((r) => r.fit < 0.6)
    .sort((a, b) => (1 - a.fit) * a.weight - (1 - b.fit) * b.weight)
    .reverse()
    .slice(0, 5);

  unknowns.sort((a, b) => {
    if (a.decisive !== b.decisive) return a.decisive ? -1 : 1;
    return b.weight - a.weight;
  });

  return {
    churchId: church.id,
    score: round(score),
    confidence: round(confidence, 3),
    corroboration: round(corroboration, 3),
    verdict: verdictFor({
      score,
      confidence,
      corroboration,
      dealbreakers,
      stage: church.stage,
      opts,
    }),
    dealbreakers,
    strengths,
    frictions,
    breakdown,
    unknowns,
  };
}

function verdictFor({
  score,
  confidence,
  corroboration,
  dealbreakers,
  stage,
  opts,
}: {
  score: number;
  confidence: number;
  corroboration: number;
  dealbreakers: Dealbreaker[];
  stage: Church['stage'];
  opts: Required<MatchOptions>;
}): Verdict {
  if (stage === 'ruled-out') return 'ruled-out';
  if (dealbreakers.some((d) => d.firm)) return 'ruled-out';
  if (confidence < opts.minimumConfidence) return 'too-little-data';
  // Two things cap a result below "strong fit" without ruling it out:
  // an unconfirmed dealbreaker still hanging over it, and a profile built
  // mostly out of inference rather than out of anything the church said.
  const capped =
    dealbreakers.length > 0 || corroboration < opts.minimumCorroboration;
  if (score >= opts.strongFit) return capped ? 'possible-fit' : 'strong-fit';
  if (score >= opts.possibleFit) return 'possible-fit';
  return 'weak-fit';
}

export function matchAll(
  profile: Profile,
  churches: Church[],
  options?: MatchOptions,
): MatchResult[] {
  return churches
    .map((church) => matchChurch(profile, church, options))
    .sort((a, b) => {
      const rank = verdictRank(a.verdict) - verdictRank(b.verdict);
      if (rank !== 0) return rank;
      if (b.score !== a.score) return b.score - a.score;
      return b.confidence - a.confidence;
    });
}

function verdictRank(v: Verdict): number {
  switch (v) {
    case 'strong-fit':
      return 0;
    case 'possible-fit':
      return 1;
    case 'too-little-data':
      return 2;
    case 'weak-fit':
      return 3;
    case 'ruled-out':
      return 4;
  }
}

function round(n: number, places = 0): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/**
 * The questions worth asking next, across every church still in play, ordered
 * by how much they would change the picture. This is the "what do I do this
 * week" list.
 */
export function openQuestions(
  profile: Profile,
  churches: Church[],
): { church: Church; unknowns: Unknown[] }[] {
  return churches
    .filter((c) => c.stage !== 'ruled-out')
    .map((church) => ({
      church,
      unknowns: matchChurch(profile, church).unknowns,
    }))
    .filter((row) => row.unknowns.length > 0)
    .sort((a, b) => {
      const aDecisive = a.unknowns.filter((u) => u.decisive).length;
      const bDecisive = b.unknowns.filter((u) => u.decisive).length;
      if (aDecisive !== bDecisive) return bDecisive - aDecisive;
      return weightOf(b.unknowns) - weightOf(a.unknowns);
    });
}

function weightOf(unknowns: Unknown[]): number {
  return unknowns.reduce((sum, u) => sum + u.weight, 0);
}
