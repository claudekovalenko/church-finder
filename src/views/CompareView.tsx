import { useEffect, useMemo, useState } from 'react';
import { compare, OVERLAP_LABEL, type Overlap } from '../domain/compare';
import type { Church, Profile } from '../domain/types';
import { Empty, Meter, ProvenanceTag } from '../components/common';

type Filter = 'all' | 'overlap' | 'differ' | 'unknown';

const SELECTION_KEY = 'church-finder/compare-selection';

function loadSelection(): string[] | null {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}

/**
 * Your values down one side, what each church actually has beside them.
 *
 * The Matches page answers "how well does this church score". This page
 * answers a different question: value by value, where is the common ground,
 * where does it rub, and what do you still not know?
 */
export function CompareView({
  profile,
  churches,
  onOpen,
}: {
  profile: Profile;
  churches: Church[];
  onOpen: (id: string) => void;
}) {
  const [includeTraditions, setIncludeTraditions] = useState(false);
  const [includeRuledOut, setIncludeRuledOut] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const pool = useMemo(
    () =>
      churches.filter(
        (c) =>
          (includeTraditions || c.kind === 'candidate') &&
          (includeRuledOut || c.stage !== 'ruled-out'),
      ),
    [churches, includeTraditions, includeRuledOut],
  );

  const [selected, setSelected] = useState<string[]>(
    () =>
      loadSelection() ??
      churches
        .filter((c) => c.kind === 'candidate' && c.stage !== 'ruled-out')
        .slice(0, 3)
        .map((c) => c.id),
  );

  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selected));
    } catch {
      // Remembering the selection is a convenience; nothing breaks without it.
    }
  }, [selected]);

  // Only churches with a visible chip are compared, so nothing on the page is
  // there without a way to take it off.
  const chosen = useMemo(() => {
    const byId = new Map(pool.map((c) => [c.id, c]));
    return selected.map((id) => byId.get(id)).filter((c): c is Church => Boolean(c));
  }, [pool, selected]);

  const { rows, summaries } = useMemo(() => compare(profile, chosen), [profile, chosen]);

  const shownRows = rows.filter((row) => {
    if (filter === 'all') return true;
    const kinds = row.cells.map((c) => c.overlap);
    if (filter === 'overlap') return kinds.includes('overlap');
    if (filter === 'unknown') return kinds.includes('unknown');
    return kinds.some((k) => k === 'rub' || k === 'partial');
  });

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>Compare</h1>
          <p className="view__lede">
            What you are looking for, and what each church actually has, value by value — so you
            can see where the common ground is, where it rubs, and what you still need to ask.
          </p>
        </div>
      </header>

      <section className="compare-pick" aria-label="Churches to compare">
        <div className="compare-pick__chips">
          {pool.map((c) => (
            <button
              key={c.id}
              className={`pick ${selected.includes(c.id) ? 'is-on' : ''}`}
              aria-pressed={selected.includes(c.id)}
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="compare-pick__opts">
          <button className="link" onClick={() => setIncludeTraditions((v) => !v)}>
            {includeTraditions ? 'Hide traditions' : 'Include traditions'}
          </button>
          <button className="link" onClick={() => setIncludeRuledOut((v) => !v)}>
            {includeRuledOut ? 'Hide ruled out' : 'Include ruled out'}
          </button>
        </div>
      </section>

      {chosen.length === 0 ? (
        <Empty>Pick one or more churches above to compare them against your values.</Empty>
      ) : (
        <>
          <ul className="compare-summary">
            {chosen.map((church, i) => {
              const s = summaries[i];
              const known = s.counts.overlap + s.counts.partial + s.counts.rub;
              return (
                <li key={church.id} className="compare-summary__item">
                  <button className="card__name" onClick={() => onOpen(church.id)}>
                    {church.name}
                  </button>
                  {known === 0 ? (
                    <p className="compare-summary__none">
                      Nothing recorded yet — every value is still a question.
                    </p>
                  ) : (
                    <Meter
                      value={s.sharedShare}
                      tone={s.sharedShare >= 0.6 ? 'accent' : 'warn'}
                      label={`${Math.round(s.sharedShare * 100)}% shared ground, of what you know`}
                    />
                  )}
                  <p className="compare-summary__counts">
                    <Count kind="overlap" n={s.counts.overlap} />
                    <Count kind="partial" n={s.counts.partial} />
                    <Count kind="rub" n={s.counts.rub} />
                    <Count kind="unknown" n={s.counts.unknown} />
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="toolbar">
            <div className="segmented">
              {(
                [
                  ['all', 'All'],
                  ['overlap', 'Overlap'],
                  ['differ', 'Differences'],
                  ['unknown', 'Unknown'],
                ] as [Filter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? 'is-active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {shownRows.length === 0 && <Empty>No values match this filter.</Empty>}

          <ul className="cards">
            {shownRows.map((row) => (
              <li key={row.axisId} className="card value-row">
                <div className="value-row__head">
                  <h3>{row.name}</h3>
                  <span className="value-row__weight" title="How much this matters to you">
                    matters {row.weight}/10
                  </span>
                </div>

                <div className="value-row__want">
                  <div className="value-row__label">You are looking for</div>
                  <strong>{row.lookingFor}</strong>
                  <p className="value-row__detail">{row.lookingForDetail}</p>
                </div>

                <ul className="value-row__churches">
                  {row.cells.map((cell, i) => (
                    <li key={cell.churchId} className={`has has--${cell.overlap}`}>
                      <div className="has__top">
                        <button className="has__church" onClick={() => onOpen(cell.churchId)}>
                          {chosen[i].name}
                        </button>
                        <span className={`pill pill--${cell.overlap}`}>
                          {cell.crossesLine ? 'Crosses your line' : OVERLAP_LABEL[cell.overlap]}
                        </span>
                      </div>
                      {cell.datum ? (
                        <>
                          <div className="has__what">
                            <span className="value-row__label">They have</span>{' '}
                            <strong>{cell.has}</strong>
                          </div>
                          {cell.datum.note && <p className="has__note">{cell.datum.note}</p>}
                          <ProvenanceTag
                            provenance={cell.datum.provenance}
                            confidence={cell.datum.confidence}
                          />
                        </>
                      ) : (
                        <p className="has__none">Nothing recorded yet.</p>
                      )}
                    </li>
                  ))}
                </ul>

                {row.cells.some((c) => c.overlap === 'unknown') && (
                  <p className="value-row__ask">
                    <span className="value-row__label">To find out, ask</span> {row.ask}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Count({ kind, n }: { kind: Overlap; n: number }) {
  if (n === 0) return null;
  return (
    <span className={`count count--${kind}`}>
      {n} {OVERLAP_LABEL[kind].toLowerCase()}
    </span>
  );
}
