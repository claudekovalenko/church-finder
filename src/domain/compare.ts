import { describeValue, getAxis } from './axes';
import { checkDealbreaker, matchChurch } from './match';
import type { AxisDatum, AxisId, AxisPreference, Church, Profile } from './types';

/**
 * How one church stands on one of your values, in words rather than a score.
 *
 * - `overlap`: what they have is what you are looking for, or close to it.
 * - `partial`: some common ground, some distance.
 * - `rub`: little or no overlap — or it crosses a line you have drawn.
 * - `unknown`: nothing recorded yet. Not a bad sign; a question to go and ask.
 */
export type Overlap = 'overlap' | 'partial' | 'rub' | 'unknown';

export const OVERLAP_LABEL: Record<Overlap, string> = {
  overlap: 'Overlaps',
  partial: 'Partly',
  rub: 'Rubs',
  unknown: 'Not yet known',
};

/** Fit at or above this reads as overlap; below the second, as a rub. */
const OVERLAP_AT = 0.75;
const PARTIAL_AT = 0.4;

export function overlapOf(fit: number | undefined, crossesLine = false): Overlap {
  if (fit === undefined) return 'unknown';
  if (crossesLine) return 'rub';
  if (fit >= OVERLAP_AT) return 'overlap';
  if (fit >= PARTIAL_AT) return 'partial';
  return 'rub';
}

export interface ChurchCell {
  churchId: string;
  overlap: Overlap;
  datum?: AxisDatum;
  /** The nearest anchor label for what the church has, if known. */
  has?: string;
  hasDetail?: string;
  /** The church is past a dealbreaker on this value. */
  crossesLine: boolean;
}

export interface ValueRow {
  axisId: AxisId;
  name: string;
  weight: number;
  /** What you are looking for, in words. */
  lookingFor: string;
  lookingForDetail: string;
  /** The question to ask when a church's cell is unknown. */
  ask: string;
  cells: ChurchCell[];
}

export interface ChurchSummary {
  churchId: string;
  counts: Record<Overlap, number>;
  /**
   * 0-1. Of the weight of the values you know about for this church, how much
   * overlaps. Deliberately not the match score: this is "of what we know,
   * how much do we share", which is the question the page is asking.
   */
  sharedShare: number;
  /** 0-1. Share of your weighted values that have any answer at all. */
  knownShare: number;
}

export interface Comparison {
  rows: ValueRow[];
  summaries: ChurchSummary[];
}

/** Your target in words: the nearest anchor on the axis, and what it means. */
export function describeLookingFor(pref: AxisPreference): { label: string; detail: string } {
  const anchor = describeValue(pref.axisId, pref.target);
  return { label: anchor.label, detail: anchor.description };
}

export function compare(profile: Profile, churches: Church[]): Comparison {
  // Values you have switched off (weight 0) are not part of what you are
  // looking for, so they are not compared either.
  const prefs = profile.preferences
    .filter((p) => p.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const results = new Map(churches.map((c) => [c.id, matchChurch(profile, c)]));

  const rows: ValueRow[] = prefs.map((pref) => {
    const axis = getAxis(pref.axisId);
    const lookingFor = describeLookingFor(pref);
    return {
      axisId: pref.axisId,
      name: axis.name,
      weight: pref.weight,
      lookingFor: lookingFor.label,
      lookingForDetail: lookingFor.detail,
      ask: axis.diagnostic,
      cells: churches.map((church) => {
        const datum = church.values[pref.axisId];
        if (!datum) return { churchId: church.id, overlap: 'unknown', crossesLine: false };
        const fit = results.get(church.id)!.breakdown.find((b) => b.axisId === pref.axisId)?.fit;
        const crossesLine = checkDealbreaker(pref, datum) !== null;
        const anchor = describeValue(pref.axisId, datum.value);
        return {
          churchId: church.id,
          overlap: overlapOf(fit, crossesLine),
          datum,
          has: anchor.label,
          hasDetail: anchor.description,
          crossesLine,
        };
      }),
    };
  });

  const totalWeight = prefs.reduce((sum, p) => sum + p.weight, 0);
  const summaries: ChurchSummary[] = churches.map((church, i) => {
    const counts: Record<Overlap, number> = { overlap: 0, partial: 0, rub: 0, unknown: 0 };
    let known = 0;
    let shared = 0;
    for (const row of rows) {
      const cell = row.cells[i];
      counts[cell.overlap] += 1;
      if (cell.overlap === 'unknown') continue;
      known += row.weight;
      if (cell.overlap === 'overlap') shared += row.weight;
      else if (cell.overlap === 'partial') shared += row.weight / 2;
    }
    return {
      churchId: church.id,
      counts,
      sharedShare: known > 0 ? shared / known : 0,
      knownShare: totalWeight > 0 ? known / totalWeight : 0,
    };
  });

  return { rows, summaries };
}
