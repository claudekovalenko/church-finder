import { describe, expect, it } from 'vitest';
import { boundsOf, commuteVerdict, distanceMiles, formatDistance, isValidPoint, parseLocation } from './geo';

const IRVINE = { lat: 33.6846, lng: -117.8265 };
const COSTA_MESA = { lat: 33.6411, lng: -117.9187 };
const NASHVILLE = { lat: 36.1627, lng: -86.7816 };

describe('distanceMiles', () => {
  it('is zero for a point against itself', () => {
    expect(distanceMiles(IRVINE, IRVINE)).toBe(0);
  });

  it('measures a short hop across a county', () => {
    // Irvine to Costa Mesa is about 6 miles as the crow flies.
    expect(distanceMiles(IRVINE, COSTA_MESA)).toBeGreaterThan(5);
    expect(distanceMiles(IRVINE, COSTA_MESA)).toBeLessThan(7);
  });

  it('measures across the country', () => {
    // Southern California to Nashville is roughly 1790 miles.
    expect(distanceMiles(IRVINE, NASHVILLE)).toBeGreaterThan(1700);
    expect(distanceMiles(IRVINE, NASHVILLE)).toBeLessThan(1900);
  });

  it('is symmetric', () => {
    expect(distanceMiles(IRVINE, NASHVILLE)).toBeCloseTo(distanceMiles(NASHVILLE, IRVINE), 6);
  });

  it('handles antipodal points without NaN from floating point drift', () => {
    const d = distanceMiles({ lat: 0, lng: 0 }, { lat: 0, lng: 180 });
    expect(Number.isNaN(d)).toBe(false);
    expect(d).toBeCloseTo(12437, -2);
  });
});

describe('formatDistance', () => {
  it('keeps a decimal where it matters and drops it where it does not', () => {
    expect(formatDistance(0.05)).toBe('here');
    expect(formatDistance(6.42)).toBe('6.4 mi');
    expect(formatDistance(23.6)).toBe('24 mi');
  });
});

describe('commuteVerdict', () => {
  it('reads the distance in terms of belonging, not just driving', () => {
    expect(commuteVerdict(3).tone).toBe('good');
    expect(commuteVerdict(20).tone).toBe('ok');
    expect(commuteVerdict(60).tone).toBe('warn');
  });
});

describe('parseLocation', () => {
  it('takes a bare coordinate pair', () => {
    expect(parseLocation('33.6846, -117.8265')).toEqual(IRVINE);
    expect(parseLocation('33.6846,-117.8265')).toEqual(IRVINE);
  });

  it('takes a Google Maps URL with an @ centre', () => {
    expect(parseLocation('https://www.google.com/maps/@33.6846,-117.8265,15z')).toEqual(IRVINE);
  });

  it('prefers the actual pin over the map centre when a place link has both', () => {
    const url =
      'https://www.google.com/maps/place/Somewhere/@33.9,-117.9,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d33.6846!4d-117.8265';
    expect(parseLocation(url)).toEqual(IRVINE);
  });

  it('takes a query-style link', () => {
    expect(parseLocation('https://maps.apple.com/?ll=33.6846,-117.8265&q=Church')).toEqual(IRVINE);
  });

  it('returns null for an address, which it cannot resolve without a geocoder', () => {
    expect(parseLocation('1 Main Street, Irvine CA')).toBeNull();
    expect(parseLocation('')).toBeNull();
    expect(parseLocation('   ')).toBeNull();
  });

  it('rejects out-of-range coordinates rather than placing a pin off the globe', () => {
    expect(parseLocation('91.5, -117.8')).toBeNull();
    expect(parseLocation('33.6, -181')).toBeNull();
  });
});

describe('isValidPoint', () => {
  it('rejects the shapes that actually show up', () => {
    expect(isValidPoint(undefined)).toBe(false);
    expect(isValidPoint(null)).toBe(false);
    expect(isValidPoint({ lat: 33 })).toBe(false);
    expect(isValidPoint({ lat: NaN, lng: 0 })).toBe(false);
    expect(isValidPoint({ lat: 0, lng: 0 })).toBe(true);
  });
});

describe('boundsOf', () => {
  it('is null with nothing to bound', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('gives a single point real extent, so the map has something to fit to', () => {
    const b = boundsOf([IRVINE])!;
    expect(b.north).toBeGreaterThan(b.south);
    expect(b.east).toBeGreaterThan(b.west);
  });

  it('contains every point it was given', () => {
    const b = boundsOf([IRVINE, COSTA_MESA, NASHVILLE])!;
    for (const p of [IRVINE, COSTA_MESA, NASHVILLE]) {
      expect(p.lat).toBeGreaterThanOrEqual(b.south);
      expect(p.lat).toBeLessThanOrEqual(b.north);
      expect(p.lng).toBeGreaterThanOrEqual(b.west);
      expect(p.lng).toBeLessThanOrEqual(b.east);
    }
  });

  it('stays inside legal latitudes when padding near a pole', () => {
    const b = boundsOf([{ lat: 89.99, lng: 0 }])!;
    expect(b.north).toBeLessThanOrEqual(90);
  });
});
