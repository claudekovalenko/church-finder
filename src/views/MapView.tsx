import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { matchAll } from '../domain/match';
import { boundsOf, commuteVerdict, distanceMiles, formatDistance, isValidPoint, parseLocation } from '../domain/geo';
import type { Church, GeoPoint, MatchResult, Profile, Verdict } from '../domain/types';
import { Empty, VerdictChip } from '../components/common';
import type { Actions } from '../store';

/** Miles from home, drawn as rings so the commute is visible rather than read. */
const RINGS = [5, 12, 25];
const MILE_IN_METRES = 1609.344;

/**
 * Pin colours are deliberately mid-tone hex rather than theme tokens: a pin sits
 * on top of map imagery whose brightness has nothing to do with the page theme,
 * so it has to read against both a dark basemap and a light one.
 */
const VERDICT_COLOUR: Record<Verdict, string> = {
  'strong-fit': '#4c8c4c',
  'possible-fit': '#c9a227',
  'weak-fit': '#7a7367',
  'ruled-out': '#b5563d',
  'too-little-data': '#b3893a',
};

type Placing = { kind: 'home' } | { kind: 'church'; id: string } | null;

export function MapView({
  profile,
  churches,
  actions,
  onOpen,
}: {
  profile: Profile;
  churches: Church[];
  actions: Actions;
  onOpen: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const graticuleRef = useRef<L.LayerGroup | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [placing, setPlacing] = useState<Placing>(null);
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  // The placing handler is rebound on every change, so hold it in a ref and let
  // the map's click listener read through it. Otherwise the listener closes
  // over a stale `placing` and drops pins for whatever was selected first.
  const placingRef = useRef<Placing>(null);
  placingRef.current = placing;

  const candidates = useMemo(() => churches.filter((c) => c.kind === 'candidate'), [churches]);
  const results = useMemo(
    () => new Map(matchAll(profile, candidates).map((r) => [r.churchId, r])),
    [profile, candidates],
  );
  const placed = useMemo(
    () => candidates.filter((c) => isValidPoint(c.location)),
    [candidates],
  );

  const rows = useMemo(() => {
    const home = isValidPoint(profile.home) ? profile.home : null;
    return candidates
      .map((church) => ({
        church,
        result: results.get(church.id),
        miles:
          home && isValidPoint(church.location) ? distanceMiles(home, church.location) : null,
      }))
      .sort((a, b) => {
        if (a.miles === null && b.miles === null) return 0;
        if (a.miles === null) return 1;
        if (b.miles === null) return -1;
        return a.miles - b.miles;
      });
  }, [candidates, results, profile.home]);

  // --- map lifecycle -------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.5, -98.35], // continental US, until there is anything to fit to
      zoom: 4,
      zoomControl: true,
    });
    mapRef.current = map;

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    });

    // Tiles are external images, and some hosts refuse to load them. Rather
    // than leave a blank grey rectangle, count failures and fall back to a
    // drawn backdrop that still carries real spatial information.
    let failures = 0;
    let loadedOne = false;
    tiles.on('tileload', () => {
      loadedOne = true;
    });
    tiles.on('tileerror', () => {
      failures += 1;
      if (!loadedOne && failures >= 4) {
        map.removeLayer(tiles);
        setTilesFailed(true);
      }
    });
    tiles.addTo(map);

    L.control.scale({ imperial: true, metric: false }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);
    graticuleRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const target = placingRef.current;
      if (!target) return;
      const point = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (target.kind === 'home') actions.updateProfile({ home: point });
      else actions.updateChurch(target.id, { location: { ...point, label: 'placed on the map' } });
      setPlacing(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
      graticuleRef.current = null;
    };
    // Mount once. Actions are stable callbacks from the store.
  }, [actions]);

  // --- graticule, only when there is no basemap under the pins -------------
  useEffect(() => {
    const map = mapRef.current;
    const group = graticuleRef.current;
    if (!map || !group) return;

    function draw() {
      if (!map || !group) return;
      group.clearLayers();
      if (!tilesFailed) return;

      const bounds = map.getBounds();
      const span = bounds.getNorth() - bounds.getSouth();
      // Aim for roughly 6-10 lines across the view at any zoom.
      const step = [10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01].find((s) => span / s >= 4) ?? 0.005;
      const style = { className: 'graticule', weight: 1, interactive: false };

      for (let lat = Math.floor(bounds.getSouth() / step) * step; lat <= bounds.getNorth(); lat += step) {
        L.polyline([[lat, bounds.getWest()], [lat, bounds.getEast()]], style).addTo(group);
      }
      for (let lng = Math.floor(bounds.getWest() / step) * step; lng <= bounds.getEast(); lng += step) {
        L.polyline([[bounds.getSouth(), lng], [bounds.getNorth(), lng]], style).addTo(group);
      }
    }

    draw();
    map.on('moveend zoomend', draw);
    return () => {
      map.off('moveend zoomend', draw);
    };
  }, [tilesFailed]);

  // --- markers -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    const group = layersRef.current;
    if (!map || !group) return;
    group.clearLayers();

    const home = isValidPoint(profile.home) ? profile.home : null;

    if (home) {
      for (const miles of RINGS) {
        L.circle([home.lat, home.lng], {
          radius: miles * MILE_IN_METRES,
          className: 'ring',
          weight: 1,
          fillOpacity: 0.02,
          dashArray: '4 5',
          interactive: false,
        })
          .addTo(group)
          .bindTooltip(`${miles} mi`, { permanent: false, direction: 'top' });
      }
      L.marker([home.lat, home.lng], {
        icon: L.divIcon({
          className: 'pin pin--home',
          html: '<span class="pin__dot"></span><span class="pin__label pin__label--below">Home</span>',
          iconSize: [0, 0],
        }),
        keyboard: false,
      }).addTo(group);
    }

    for (const church of placed) {
      const result = results.get(church.id);
      const colour = result ? VERDICT_COLOUR[result.verdict] : VERDICT_COLOUR['too-little-data'];
      const scored = result !== undefined && result.confidence >= 0.35;
      const score = scored ? `<b>${Math.round(result.score)}</b>` : '';
      const miles = home && isValidPoint(church.location) ? distanceMiles(home, church.location) : null;

      const marker = L.marker([church.location!.lat, church.location!.lng], {
        icon: L.divIcon({
          className: 'pin',
          html: `<span class="pin__dot" style="background:${colour}"></span>
                 <span class="pin__label">${escapeHtml(church.name)}${score}</span>`,
          iconSize: [0, 0],
        }),
      }).addTo(group);

      marker.bindPopup(
        `<strong>${escapeHtml(church.name)}</strong><br>` +
          (result && result.confidence >= 0.35
            ? `${Math.round(result.score)} match · ${Math.round(result.confidence * 100)}% answered`
            : 'Not enough data yet') +
          (miles !== null ? `<br>${formatDistance(miles)} from home` : ''),
      );
      marker.on('dblclick', () => onOpen(church.id));
    }

    const points: GeoPoint[] = [...placed.map((c) => c.location!), ...(home ? [home] : [])];
    const bounds = boundsOf(points);
    if (bounds) {
      map.fitBounds(
        [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        ],
        { padding: [40, 40], maxZoom: 14 },
      );
    }
  }, [placed, results, profile.home, onOpen]);

  function applyPaste() {
    const point = parseLocation(paste);
    if (!point) {
      setPasteError(
        'That did not contain coordinates. Paste a maps link, or a "lat, lng" pair.',
      );
      return;
    }
    setPasteError(null);
    const target = placing;
    if (target?.kind === 'church') {
      actions.updateChurch(target.id, { location: { ...point, label: paste.trim().slice(0, 120) } });
    } else {
      actions.updateProfile({ home: point });
    }
    setPaste('');
    setPlacing(null);
    mapRef.current?.setView([point.lat, point.lng], 13);
  }

  const unplaced = candidates.filter((c) => !isValidPoint(c.location));

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>Map</h1>
          <p className="view__lede">
            Where these churches actually are, and how far each one is from home. Distance is
            deliberately kept out of the match score — the drive has nothing to do with the
            doctrine — but it decides whether you can be there midweek, which is most of what
            belonging turns out to mean.
          </p>
        </div>
      </header>

      <div className="place-bar">
        <div className="place-bar__row">
          <button
            className={`button button--small ${placing?.kind === 'home' ? 'is-armed' : ''}`}
            onClick={() => setPlacing(placing?.kind === 'home' ? null : { kind: 'home' })}
          >
            {isValidPoint(profile.home) ? 'Move home' : 'Set home'}
          </button>
          <input
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setPasteError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && applyPaste()}
            placeholder="Paste a maps link or 33.6846, -117.8265"
            aria-label="Paste coordinates"
          />
          <button className="button button--small" onClick={applyPaste} disabled={!paste.trim()}>
            Place
          </button>
        </div>
        {placing && (
          <p className="place-bar__hint">
            Click the map to place{' '}
            <strong>
              {placing.kind === 'home'
                ? 'your home'
                : candidates.find((c) => c.id === placing.id)?.name}
            </strong>
            , or paste a link above. <button className="link" onClick={() => setPlacing(null)}>Cancel</button>
          </p>
        )}
        {pasteError && <p className="place-bar__error">{pasteError}</p>}
        {!placing && !pasteError && (
          <p className="place-bar__hint">
            There is no geocoder here — the app has no backend — so look a church up in your maps
            app and paste the link. Pasting applies to whichever church you have armed below, or to
            home if none is.
          </p>
        )}
      </div>

      <div className={`map-wrap ${tilesFailed ? 'map-wrap--flat' : ''}`}>
        <div ref={containerRef} className="map" />
        {tilesFailed && (
          <p className="map__notice">
            Map imagery is blocked here, so this is showing coordinates, distance rings and a
            scale instead. Panning, zooming and placing all still work, and the basemap appears
            wherever tiles are allowed.
          </p>
        )}
        {placed.length === 0 && (
          <div className="map__empty">
            <p>
              <strong>Nothing placed yet.</strong> Pick a church below, then either click the map
              or paste its maps link.
            </p>
          </div>
        )}
      </div>

      <section className="section">
        <h2>By distance</h2>
        {rows.length === 0 && <Empty>No churches yet. Add one from the top bar.</Empty>}
        <ul className="geo-list">
          {rows.map(({ church, result, miles }) => {
            const commute = miles === null ? null : commuteVerdict(miles);
            const armed = placing?.kind === 'church' && placing.id === church.id;
            return (
              <li key={church.id} className={armed ? 'is-armed' : ''}>
                <div className="geo-list__main">
                  <button className="geo-list__name" onClick={() => onOpen(church.id)}>
                    {church.name}
                  </button>
                  {result && <VerdictChip verdict={result.verdict} />}
                </div>
                <div className="geo-list__distance">
                  {miles === null ? (
                    <span className="geo-list__missing">
                      {isValidPoint(church.location) ? 'set home to measure' : 'not placed'}
                    </span>
                  ) : (
                    <>
                      <strong>{formatDistance(miles)}</strong>
                      <span className={`geo-list__commute geo-list__commute--${commute!.tone}`}>
                        {commute!.label}
                      </span>
                    </>
                  )}
                </div>
                <div className="geo-list__actions">
                  <button
                    className="link"
                    onClick={() => setPlacing(armed ? null : { kind: 'church', id: church.id })}
                  >
                    {armed ? 'cancel' : isValidPoint(church.location) ? 'move' : 'place'}
                  </button>
                  {isValidPoint(church.location) && (
                    <button
                      className="link link--danger"
                      onClick={() => actions.updateChurch(church.id, { location: undefined })}
                    >
                      clear
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {unplaced.length > 0 && (
          <p className="view__lede">
            {unplaced.length} not on the map yet. An unplaced church is not penalised anywhere —
            it simply has no distance to show.
          </p>
        )}
      </section>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

/** Shown next to a score wherever distance is relevant outside the map. */
export function DistanceBadge({ profile, church }: { profile: Profile; church: Church }) {
  if (!isValidPoint(profile.home) || !isValidPoint(church.location)) return null;
  const miles = distanceMiles(profile.home, church.location);
  const commute = commuteVerdict(miles);
  return (
    <span className={`distance distance--${commute.tone}`} title={commute.label}>
      {formatDistance(miles)}
    </span>
  );
}

export type { MatchResult };
