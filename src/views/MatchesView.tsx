import { useMemo, useState } from 'react';
import { getAxis } from '../domain/axes';
import { matchAll } from '../domain/match';
import type { AxisBreakdown, Church, MatchResult, Profile } from '../domain/types';
import { AnchorLabel, AxisTrack, Empty, Meter, ProvenanceTag, Score, VerdictChip } from '../components/common';

type Filter = 'candidates' | 'traditions' | 'all';

export function MatchesView({
  profile,
  churches,
  onOpen,
}: {
  profile: Profile;
  churches: Church[];
  onOpen: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>('candidates');
  const [showRuledOut, setShowRuledOut] = useState(false);

  const visible = useMemo(() => {
    return churches.filter((c) => {
      if (filter === 'candidates') return c.kind === 'candidate';
      if (filter === 'traditions') return c.kind === 'tradition';
      return true;
    });
  }, [churches, filter]);

  const results = useMemo(() => matchAll(profile, visible), [profile, visible]);
  const byId = useMemo(() => new Map(churches.map((c) => [c.id, c])), [churches]);

  const shown = showRuledOut ? results : results.filter((r) => r.verdict !== 'ruled-out');
  const hiddenCount = results.length - shown.length;

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>Matches</h1>
          <p className="view__lede">
            Scored against your profile, with confidence shown separately. A high score at low
            confidence means promising but unverified — not a reason to commit.
          </p>
        </div>
      </header>

      <div className="toolbar">
        <div className="segmented">
          {(
            [
              ['candidates', 'Churches'],
              ['traditions', 'Traditions'],
              ['all', 'Everything'],
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
        {hiddenCount > 0 && (
          <button className="link" onClick={() => setShowRuledOut(true)}>
            Show {hiddenCount} ruled out
          </button>
        )}
        {showRuledOut && (
          <button className="link" onClick={() => setShowRuledOut(false)}>
            Hide ruled out
          </button>
        )}
      </div>

      {shown.length === 0 && <Empty>Nothing to show with these filters.</Empty>}

      <ul className="cards">
        {shown.map((result) => {
          const church = byId.get(result.churchId);
          if (!church) return null;
          return (
            <MatchCard key={result.churchId} church={church} result={result} onOpen={onOpen} />
          );
        })}
      </ul>
    </div>
  );
}

function MatchCard({
  church,
  result,
  onOpen,
}: {
  church: Church;
  result: MatchResult;
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`card card--${result.verdict}`}>
      <div className="card__head">
        <div className="card__title">
          <button className="card__name" onClick={() => onOpen(church.id)}>
            {church.name}
          </button>
          <div className="card__meta">
            <VerdictChip verdict={result.verdict} />
            {church.kind === 'tradition' && <span className="chip chip--kind">tradition</span>}
            <span className="chip chip--stage">{church.stage.replace('-', ' ')}</span>
          </div>
          {church.locale && <p className="card__locale">{church.locale}</p>}
        </div>
        <Score value={result.score} confidence={result.confidence} />
      </div>

      {church.summary && <p className="card__summary">{church.summary}</p>}

      <div className="card__confidence">
        <Meter
          value={result.confidence}
          tone={result.confidence < 0.35 ? 'warn' : 'muted'}
          label={
            <>
              {Math.round(result.confidence * 100)}% of what matters to you is actually answered
              {result.confidence > 0 && (
                <>
                  {' · '}
                  <span className={result.corroboration < 0.4 ? 'is-warn' : undefined}>
                    {Math.round(result.corroboration * 100)}% of it first-hand
                  </span>
                </>
              )}
            </>
          }
        />
        {result.confidence >= 0.35 && result.corroboration < 0.4 && (
          <p className="card__caveat">
            Most of this profile is inferred rather than stated or observed, so it is held below a
            strong fit until you confirm it from the church itself.
          </p>
        )}
      </div>

      {result.dealbreakers.length > 0 && (
        <div className="dealbreakers">
          {result.dealbreakers.map((d) => (
            <div key={d.axisId} className={`dealbreaker ${d.firm ? '' : 'dealbreaker--soft'}`}>
              <strong>{d.firm ? 'Rules it out' : 'Probably rules it out'} — {d.axisName}</strong>
              <p>{d.reason}</p>
              {!d.firm && <p className="dealbreaker__caveat">Based on a low-confidence value. Confirm before closing the door.</p>}
            </div>
          ))}
        </div>
      )}

      {(result.strengths.length > 0 || result.frictions.length > 0) && (
        <div className="split">
          <Column title="Where it fits" rows={result.strengths} tone="good" />
          <Column title="Where it rubs" rows={result.frictions} tone="bad" />
        </div>
      )}

      {result.unknowns.length > 0 && (
        <div className="unknowns">
          <button className="link" onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide' : 'Show'} {result.unknowns.length} open question
            {result.unknowns.length === 1 ? '' : 's'}
          </button>
          {open && (
            <ol className="questions">
              {result.unknowns.map((u) => (
                <li key={u.axisId}>
                  <div className="questions__axis">
                    {u.axisName}
                    {u.decisive && <span className="chip chip--decisive">decisive</span>}
                  </div>
                  <p>{u.diagnostic}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </li>
  );
}

function Column({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: AxisBreakdown[];
  tone: 'good' | 'bad';
}) {
  if (rows.length === 0) return null;
  return (
    <div className={`column column--${tone}`}>
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => (
          <li key={row.axisId}>
            <div className="column__row">
              <span className="column__axis">{getAxis(row.axisId).name}</span>
              <ProvenanceTag provenance={row.provenance} confidence={row.confidence} />
            </div>
            <div className="column__value">
              <AnchorLabel axisId={row.axisId} value={row.value} />
            </div>
            <AxisTrack axisId={row.axisId} target={row.target} value={row.value} />
          </li>
        ))}
      </ul>
    </div>
  );
}
