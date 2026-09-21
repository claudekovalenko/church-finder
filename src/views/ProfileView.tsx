import { AXES, CATEGORY_LABELS } from '../domain/axes';
import type { Axis, AxisPreference, Profile, ScoringMode } from '../domain/types';
import { AnchorLabel } from '../components/common';
import type { Actions } from '../store';

const MODE_LABEL: Record<ScoringMode, string> = {
  proximity: 'close to this',
  atLeast: 'at least this',
  atMost: 'at most this',
};

const MODE_HELP: Record<ScoringMode, string> = {
  proximity: 'Both directions cost you. Use where either extreme would be wrong.',
  atLeast: 'Anything further along is just as good. Use where more is simply better.',
  atMost: 'Anything short of this is just as good.',
};

export function ProfileView({
  profile,
  actions,
}: {
  profile: Profile;
  actions: Actions;
}) {
  const byCategory = AXES.reduce<Record<string, Axis[]>>((acc, axis) => {
    (acc[axis.category] ??= []).push(axis);
    return acc;
  }, {});

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>Your profile</h1>
          <p className="view__lede">
            Where you sit, and how much each thing weighs. The weights matter more than the
            positions: they decide what you are willing to trade away.
          </p>
        </div>
      </header>

      <label className="field">
        <span className="field__label">In your own words</span>
        <textarea
          rows={5}
          value={profile.summary}
          onChange={(e) => actions.updateProfile({ summary: e.target.value })}
        />
      </label>

      {Object.entries(byCategory).map(([category, axes]) => (
        <section key={category} className="section">
          <h2>{CATEGORY_LABELS[category] ?? category}</h2>
          <div className="prefs">
            {axes.map((axis) => {
              const pref = profile.preferences.find((p) => p.axisId === axis.id);
              if (!pref) return null;
              return (
                <PreferenceRow key={axis.id} axis={axis} pref={pref} actions={actions} />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function PreferenceRow({
  axis,
  pref,
  actions,
}: {
  axis: Axis;
  pref: AxisPreference;
  actions: Actions;
}) {
  const set = (patch: Partial<AxisPreference>) => actions.updatePreference(axis.id, patch);

  return (
    <div className={`pref ${pref.weight === 0 ? 'pref--off' : ''}`}>
      <div className="pref__head">
        <div>
          <h3>{axis.name}</h3>
          <p className="pref__question">{axis.question}</p>
        </div>
        <div className="pref__weight">
          <label>
            <span>Weight</span>
            <input
              type="number"
              min={0}
              max={10}
              value={pref.weight}
              onChange={(e) => set({ weight: clamp(Number(e.target.value), 0, 10) })}
            />
          </label>
        </div>
      </div>

      <div className="pref__slider">
        <input
          type="range"
          min={0}
          max={100}
          value={pref.target}
          onChange={(e) => set({ target: Number(e.target.value) })}
          aria-label={`${axis.name} position`}
        />
        <div className="pref__scale">
          <span>{axis.lowLabel}</span>
          <span>{axis.highLabel}</span>
        </div>
        <p className="pref__reading">
          <AnchorLabel axisId={axis.id} value={pref.target} />
          <span className="pref__number">{pref.target}</span>
        </p>
      </div>

      <div className="pref__controls">
        <label title={MODE_HELP[pref.mode]}>
          <span>Match</span>
          <select
            value={pref.mode}
            onChange={(e) => set({ mode: e.target.value as ScoringMode })}
          >
            {(Object.keys(MODE_LABEL) as ScoringMode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
        <label title="Distance at which a church stops getting any credit on this axis. Smaller means pickier.">
          <span>Tolerance</span>
          <input
            type="number"
            min={5}
            max={100}
            step={5}
            value={pref.tolerance}
            onChange={(e) => set({ tolerance: clamp(Number(e.target.value), 5, 100) })}
          />
        </label>
        <label className="pref__deal">
          <input
            type="checkbox"
            checked={Boolean(pref.dealbreaker)}
            onChange={(e) =>
              set({
                dealbreaker: e.target.checked
                  ? {
                      ...(pref.mode === 'atLeast'
                        ? { below: Math.max(0, pref.target - 60) }
                        : { above: Math.min(100, pref.target + 60) }),
                      reason: 'A line you are not willing to cross.',
                    }
                  : undefined,
              })
            }
          />
          <span>Dealbreaker</span>
        </label>
      </div>

      {pref.dealbreaker && (
        <div className="pref__dealbreaker">
          <div className="pref__limits">
            <label>
              <span>Ruled out below</span>
              <input
                type="number"
                min={0}
                max={100}
                value={pref.dealbreaker.below ?? ''}
                placeholder="—"
                onChange={(e) =>
                  set({
                    dealbreaker: {
                      ...pref.dealbreaker!,
                      below: e.target.value === '' ? undefined : clamp(Number(e.target.value), 0, 100),
                    },
                  })
                }
              />
            </label>
            <label>
              <span>Ruled out above</span>
              <input
                type="number"
                min={0}
                max={100}
                value={pref.dealbreaker.above ?? ''}
                placeholder="—"
                onChange={(e) =>
                  set({
                    dealbreaker: {
                      ...pref.dealbreaker!,
                      above: e.target.value === '' ? undefined : clamp(Number(e.target.value), 0, 100),
                    },
                  })
                }
              />
            </label>
          </div>
          <textarea
            rows={2}
            value={pref.dealbreaker.reason}
            placeholder="Why this is a line you will not cross"
            onChange={(e) =>
              set({ dealbreaker: { ...pref.dealbreaker!, reason: e.target.value } })
            }
          />
        </div>
      )}

      <details className="pref__anchors">
        <summary>What the positions mean</summary>
        <ul>
          {axis.anchors.map((a) => (
            <li key={a.value}>
              <button className="link" onClick={() => set({ target: a.value })}>
                {a.value}
              </button>
              <div>
                <strong>{a.label}</strong>
                <p>{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="pref__diagnostic">
          <strong>Ask a pastor:</strong> {axis.diagnostic}
        </p>
      </details>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
