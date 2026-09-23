import { useMemo, useState } from 'react';
import { AXES, CATEGORY_LABELS } from '../domain/axes';
import { matchChurch } from '../domain/match';
import { commuteVerdict, distanceMiles, formatDistance, isValidPoint, parseLocation } from '../domain/geo';
import { STAGE_ORDER } from '../domain/types';
import type { Axis, AxisDatum, Church, Profile, Provenance, Stage } from '../domain/types';
import { AnchorLabel, AxisTrack, Meter, ProvenanceTag, Score, VerdictChip } from '../components/common';
import type { Actions } from '../store';

const PROVENANCES: Provenance[] = ['stated', 'observed', 'inferred', 'assumed'];

const STAGE_LABEL: Record<Stage, string> = {
  shortlist: 'Shortlist',
  researching: 'Researching',
  visiting: 'Visiting',
  conversations: 'In conversation with elders',
  committed: 'Committed',
  'ruled-out': 'Ruled out',
};

export function ChurchView({
  church,
  profile,
  churches,
  actions,
  onBack,
}: {
  church: Church;
  profile: Profile;
  churches: Church[];
  actions: Actions;
  onBack: () => void;
}) {
  const result = useMemo(() => matchChurch(profile, church), [profile, church]);
  const traditions = churches.filter((c) => c.kind === 'tradition');
  const hint = church.traditionId ? churches.find((c) => c.id === church.traditionId) : undefined;
  const answered = Object.keys(church.values).length;

  const byCategory = AXES.reduce<Record<string, Axis[]>>((acc, axis) => {
    (acc[axis.category] ??= []).push(axis);
    return acc;
  }, {});

  return (
    <div className="view">
      <button className="link link--back" onClick={onBack}>
        ← All matches
      </button>

      <header className="view__head view__head--church">
        <div>
          <input
            className="title-input"
            value={church.name}
            onChange={(e) => actions.updateChurch(church.id, { name: e.target.value })}
          />
          <div className="card__meta">
            <VerdictChip verdict={result.verdict} />
            {church.kind === 'tradition' && <span className="chip chip--kind">tradition</span>}
          </div>
        </div>
        <Score value={result.score} confidence={result.confidence} />
      </header>

      <div className="grid-2">
        <label className="field">
          <span className="field__label">Stage</span>
          <select
            value={church.stage}
            onChange={(e) => actions.setStage(church.id, e.target.value as Stage)}
          >
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Affiliation</span>
          <input
            value={church.affiliation ?? ''}
            placeholder="Denomination, network, or association"
            onChange={(e) => actions.updateChurch(church.id, { affiliation: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">Website</span>
          <input
            value={church.website ?? ''}
            placeholder="https://"
            onChange={(e) => actions.updateChurch(church.id, { website: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field__label">Location</span>
          <input
            value={church.locale ?? ''}
            onChange={(e) => actions.updateChurch(church.id, { locale: e.target.value })}
          />
        </label>
      </div>

      <LocationField church={church} profile={profile} actions={actions} />

      <div className="progress">
        <Meter
          value={answered / AXES.length}
          tone={result.confidence < 0.35 ? 'warn' : 'accent'}
          label={`${answered} of ${AXES.length} axes answered · ${Math.round(
            result.confidence * 100,
          )}% confidence · ${Math.round(result.corroboration * 100)}% of it first-hand`}
        />
      </div>

      {hint && answered === 0 && (
        <div className="callout">
          <p>
            The name suggests this is <strong>{hint.name}</strong>. You can prefill the axes from
            that archetype as low-confidence guesses, then correct each one against what the church
            actually says.
          </p>
          <button
            className="button"
            onClick={() => actions.inheritFromTradition(church.id, hint.id)}
          >
            Prefill from {hint.name}
          </button>
        </div>
      )}

      {result.dealbreakers.length > 0 && (
        <div className="dealbreakers">
          {result.dealbreakers.map((d) => (
            <div key={d.axisId} className={`dealbreaker ${d.firm ? '' : 'dealbreaker--soft'}`}>
              <strong>
                {d.firm ? 'Rules it out' : 'Probably rules it out'} — {d.axisName}
              </strong>
              <p>{d.reason}</p>
            </div>
          ))}
        </div>
      )}

      <label className="field">
        <span className="field__label">Summary</span>
        <input
          value={church.summary}
          onChange={(e) => actions.updateChurch(church.id, { summary: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea
          rows={8}
          value={church.notes}
          onChange={(e) => actions.updateChurch(church.id, { notes: e.target.value })}
        />
      </label>

      <section className="section">
        <h2>Where they stand</h2>
        <p className="view__lede">
          Fill these in from what the church itself says or from what you have seen. Leaving an axis
          blank is not a penalty — it becomes a question on the Plan page instead.
        </p>
        {Object.entries(byCategory).map(([category, axes]) => (
          <div key={category} className="axis-group">
            <h3>{CATEGORY_LABELS[category] ?? category}</h3>
            {axes.map((axis) => (
              <AxisEditor
                key={axis.id}
                axis={axis}
                datum={church.values[axis.id]}
                target={profile.preferences.find((p) => p.axisId === axis.id)?.target ?? 50}
                onChange={(d) => actions.setValue(church.id, axis.id, d)}
              />
            ))}
          </div>
        ))}
      </section>

      <VisitLog church={church} actions={actions} />

      {church.kind === 'candidate' && (
        <div className="danger">
          <button className="link link--danger" onClick={() => {
            actions.removeChurch(church.id);
            onBack();
          }}>
            Remove this church
          </button>
        </div>
      )}

      {traditions.length > 0 && church.kind === 'candidate' && !church.traditionId && (
        <label className="field">
          <span className="field__label">Link to a tradition (optional)</span>
          <select
            value=""
            onChange={(e) => e.target.value && actions.inheritFromTradition(church.id, e.target.value)}
          >
            <option value="">Choose an archetype to prefill from…</option>
            {traditions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

function AxisEditor({
  axis,
  datum,
  target,
  onChange,
}: {
  axis: Axis;
  datum?: AxisDatum;
  target: number;
  onChange: (datum: AxisDatum | null) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!datum) {
    return (
      <div className="axis axis--unknown">
        <div className="axis__head">
          <h4>{axis.name}</h4>
          <button
            className="button button--small"
            onClick={() =>
              onChange({ value: target, confidence: 0.5, provenance: 'inferred' })
            }
          >
            Record a position
          </button>
        </div>
        <p className="axis__ask">
          <strong>Ask:</strong> {axis.diagnostic}
        </p>
      </div>
    );
  }

  const patch = (p: Partial<AxisDatum>) => onChange({ ...datum, ...p });

  return (
    <div className="axis">
      <div className="axis__head">
        <h4>{axis.name}</h4>
        <div className="axis__reading">
          <AnchorLabel axisId={axis.id} value={datum.value} />
          <ProvenanceTag provenance={datum.provenance} confidence={datum.confidence} />
        </div>
      </div>

      <AxisTrack axisId={axis.id} target={target} value={datum.value} />

      <input
        type="range"
        min={0}
        max={100}
        value={datum.value}
        onChange={(e) => patch({ value: Number(e.target.value) })}
        aria-label={`${axis.name} value`}
      />

      <div className="axis__controls">
        <label>
          <span>How you know</span>
          <select
            value={datum.provenance}
            onChange={(e) => patch({ provenance: e.target.value as Provenance })}
          >
            <option value="stated">They state it</option>
            <option value="observed">You observed it</option>
            <option value="inferred">Inferred</option>
            <option value="assumed">Just a guess</option>
          </select>
        </label>
        <label>
          <span>Confidence {Math.round(datum.confidence * 100)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(datum.confidence * 100)}
            onChange={(e) => patch({ confidence: Number(e.target.value) / 100 })}
          />
        </label>
        <button className="link" onClick={() => setOpen((o) => !o)}>
          {open ? 'Less' : 'Source & note'}
        </button>
        <button className="link link--danger" onClick={() => onChange(null)}>
          Clear
        </button>
      </div>

      {open && (
        <div className="axis__detail">
          <label className="field">
            <span className="field__label">Source</span>
            <input
              value={datum.source ?? ''}
              placeholder="Link to the doctrinal statement, a sermon, or who told you"
              onChange={(e) => patch({ source: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Note</span>
            <textarea
              rows={2}
              value={datum.note ?? ''}
              onChange={(e) => patch({ note: e.target.value })}
            />
          </label>
          <p className="axis__ask">
            <strong>Ask:</strong> {axis.diagnostic}
          </p>
        </div>
      )}

      {!open && datum.note && <p className="axis__note">{datum.note}</p>}
      {PROVENANCES.indexOf(datum.provenance) >= 2 && datum.confidence > 0.7 && (
        <p className="axis__warn">
          High confidence on a value you have not confirmed. Either find the source or lower it.
        </p>
      )}
    </div>
  );
}

function LocationField({
  church,
  profile,
  actions,
}: {
  church: Church;
  profile: Profile;
  actions: Actions;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const placed = isValidPoint(church.location);
  const miles =
    placed && isValidPoint(profile.home) ? distanceMiles(profile.home, church.location!) : null;

  function apply() {
    const point = parseLocation(draft);
    if (!point) {
      setError('No coordinates in that. Paste a maps link, or "lat, lng".');
      return;
    }
    setError(null);
    actions.updateChurch(church.id, { location: { ...point, label: draft.trim().slice(0, 120) } });
    setDraft('');
  }

  return (
    <div className="field">
      <span className="field__label">On the map</span>
      {placed ? (
        <p className="locfield__current">
          {church.location!.lat.toFixed(4)}, {church.location!.lng.toFixed(4)}
          {miles !== null && (
            <>
              {' · '}
              <strong>{formatDistance(miles)}</strong> from home —{' '}
              {commuteVerdict(miles).label}
            </>
          )}
          {' · '}
          <button
            className="link link--danger"
            onClick={() => actions.updateChurch(church.id, { location: undefined })}
          >
            clear
          </button>
        </p>
      ) : (
        <p className="locfield__current locfield__current--empty">
          Not placed. Paste its maps link below, or use the Map tab to click it in.
        </p>
      )}
      <div className="locfield__row">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Paste a maps link or 33.6846, -117.8265"
        />
        <button className="button button--small" onClick={apply} disabled={!draft.trim()}>
          {placed ? 'Move' : 'Place'}
        </button>
      </div>
      {error && <p className="place-bar__error">{error}</p>}
    </div>
  );
}

function VisitLog({ church, actions }: { church: Church; actions: Actions }) {
  const [kind, setKind] = useState('Sunday service');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <section className="section">
      <h2>Visits and conversations</h2>
      <p className="view__lede">
        What you actually saw and heard. Memory smooths things over; these do not.
      </p>
      <form
        className="visit-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          actions.addVisit(church.id, { date, kind, body: body.trim() });
          setBody('');
        }}
      >
        <div className="visit-form__row">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            placeholder="Sunday service, members' class, coffee with an elder…"
          />
        </div>
        <textarea
          rows={4}
          value={body}
          placeholder="What was preached, what was sung, who you met, what you asked, what you noticed."
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="button" type="submit">
          Log it
        </button>
      </form>

      <ul className="visits">
        {church.visits.map((v) => (
          <li key={v.id}>
            <div className="visits__head">
              <strong>{v.kind}</strong>
              <span>{v.date}</span>
              <button className="link link--danger" onClick={() => actions.removeVisit(church.id, v.id)}>
                Delete
              </button>
            </div>
            <p>{v.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
