import type { GeoPoint } from './types';

const EARTH_RADIUS_MILES = 3958.7613;

/**
 * Great-circle distance in miles.
 *
 * Haversine rather than a flat-earth approximation — the error of the flat
 * version is small at these distances, but the formula is three lines either
 * way and this one does not need a caveat about latitude.
 */
export function distanceMiles(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'here';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/**
 * A rough sense of what the drive means for actually belonging somewhere.
 * Sunday morning is survivable at almost any distance; being present midweek,
 * and being close enough that people drop in on each other, is not.
 */
export function commuteVerdict(miles: number): { label: string; tone: 'good' | 'ok' | 'warn' } {
  if (miles <= 5) return { label: 'in the neighbourhood', tone: 'good' };
  if (miles <= 12) return { label: 'an easy drive', tone: 'good' };
  if (miles <= 25) return { label: 'fine on Sunday, a commitment midweek', tone: 'ok' };
  if (miles <= 45) return { label: 'hard to be present midweek', tone: 'warn' };
  return { label: 'too far to be genuinely part of it', tone: 'warn' };
}

export function isValidPoint(p: Partial<GeoPoint> | undefined | null): p is GeoPoint {
  return (
    !!p &&
    typeof p.lat === 'number' &&
    typeof p.lng === 'number' &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

/**
 * Pull coordinates out of whatever the user pasted.
 *
 * There is no geocoder here — the app has no backend and must work offline —
 * so the fastest honest path from "a church's address" to a point on the map
 * is: look it up in a maps app, copy the link or the coordinates, paste. This
 * accepts the shapes those apps actually produce.
 */
export function parseLocation(input: string): GeoPoint | null {
  const text = input.trim();
  if (!text) return null;

  const candidates: [string, string][] = [];

  // Google Maps: .../@33.6189,-117.9298,15z  — the @ pair is the map centre.
  const at = text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (at) candidates.push([at[1], at[2]]);

  // Google/Apple query forms: ?q=33.6,-117.9  ll=  sll=  daddr=
  const query = text.match(/[?&](?:q|ll|sll|daddr|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (query) candidates.push([query[1], query[2]]);

  // Google place links: !3d33.6189!4d-117.9298 — this is the actual pin, so it
  // beats the @ centre when both are present.
  const pin = text.match(/!3d(-?\d+(?:\.\d+)?).*?!4d(-?\d+(?:\.\d+)?)/);
  if (pin) candidates.unshift([pin[1], pin[2]]);

  // A bare pair: "33.6189, -117.9298"
  if (candidates.length === 0) {
    const bare = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (bare) candidates.push([bare[1], bare[2]]);
  }

  for (const [lat, lng] of candidates) {
    const point = { lat: Number(lat), lng: Number(lng) };
    if (isValidPoint(point)) return point;
  }
  return null;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Tight bounds around a set of points, with a little air around the edge. */
export function boundsOf(points: GeoPoint[], padding = 0.15): Bounds | null {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);
  // A single point has zero extent, which would ask the map to zoom infinitely.
  const padLat = Math.max((north - south) * padding, 0.02);
  const padLng = Math.max((east - west) * padding, 0.02);
  return {
    north: Math.min(90, north + padLat),
    south: Math.max(-90, south - padLat),
    east: Math.min(180, east + padLng),
    west: Math.max(-180, west - padLng),
  };
}
