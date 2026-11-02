import { useState } from 'react';
import { AXES, CATEGORY_LABELS } from '../domain/axes';
import { DEFAULT_CALLING } from '../domain/profile';
import type { Axis, AxisPreference, Calling, Profile, ScoringMode } from '../domain/types';
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

      <CallingSection calling={profile.calling ?? DEFAULT_CALLING} actions={actions} />

      <label className="field">
        <span className="field__label">What you are looking for in a church, in your own words</span>
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

const CALLING_FIELDS: { key: keyof Calling; label: string; hint: string }[] = [
  { key: 'mission', label: 'The mission', hint: 'What would you give your life to?' },
  {
    key: 'family',
    label: 'The family',
    hint: 'The household you want to build, and what you want your children to become.',
  },
  { key: 'place', label: 'The place', hint: 'Where, and why there.' },
  {
    key: 'planting',
    label: 'Church planting',
    hint: 'Whether, when, and how you would want to be sent.',
  },
  {
    key: 'forAWife',
    label: 'What a wife would be signing up for',
    hint: 'Said plainly, so nobody finds out later.',
  },
];

function callingAsText(calling: Calling): string {
  return CALLING_FIELDS.filter((f) => calling[f.key].trim())
    .map((f) => `${f.label}\n${calling[f.key].trim()}`)
    .join('\n\n');
}

/**
 * The calling sits above the axes because it is the reason for them: the
 * church you are looking for is the one that can form and send the person
 * described here.
 */
function CallingSection({ calling, actions }: { calling: Calling; actions: Actions }) {
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const set = (key: keyof Calling, value: string) => {
    setCopy('idle');
    actions.updateProfile({ calling: { ...calling, [key]: value } });
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(callingAsText(calling));
      setCopy('copied');
    } catch {
      // Sandboxed hosts and older browsers refuse the clipboard; show the
      // text so it can be selected by hand instead.
      setCopy('failed');
    }
  };

  return (
    <section className="section calling">
      <div className="calling__head">
        <div>
          <h2>Your calling</h2>
          <p className="view__lede">
            What you are actually going after, written plainly enough that someone joining your
            life would know what they are saying yes to. The first draft came from what you have
            said; rewrite it until it sounds like you.
          </p>
        </div>
        <button className="button button--small" onClick={share}>
          {copy === 'copied' ? 'Copied' : 'Copy as text'}
        </button>
      </div>
      {CALLING_FIELDS.map((f) => (
        <label key={f.key} className="field">
          <span className="field__label">{f.label}</span>
          <textarea
            rows={3}
            value={calling[f.key]}
            placeholder={f.hint}
            onChange={(e) => set(f.key, e.target.value)}
          />
        </label>
      ))}
      {copy === 'failed' && (
        <label className="field">
          <span className="field__label">This browser blocked copying — select the text here</span>
          <textarea readOnly rows={10} value={callingAsText(calling)} onFocus={(e) => e.target.select()} />
        </label>
      )}
    </section>
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
