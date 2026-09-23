import { useRef, useState } from 'react';
import { useAppState } from './store';
import { MatchesView } from './views/MatchesView';
import { ProfileView } from './views/ProfileView';
import { ChurchView } from './views/ChurchView';
import { PlanView } from './views/PlanView';
import { MapView } from './views/MapView';
import { useInstallPrompt, useServiceWorker } from './pwa';

type Tab = 'matches' | 'map' | 'plan' | 'profile';

type SaveFile = (file: { filename: string; data: string }) => Promise<unknown>;

/**
 * Resolves a host-mediated file save if the page is running somewhere that
 * provides one, and null everywhere else. Deliberately tolerant: any failure
 * here just means falling back to a normal download link.
 */
async function mediatedSave(): Promise<SaveFile | null> {
  const host = (globalThis as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
  if (typeof host?.use !== 'function') return null;
  try {
    const ns = (await host.use('downloads')) as { save?: SaveFile } | null;
    return typeof ns?.save === 'function' ? ns.save.bind(ns) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const { state, byId, actions } = useAppState();
  const [tab, setTab] = useState<Tab>('matches');
  const [openChurch, setOpenChurch] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sw = useServiceWorker();
  const { canInstall, install } = useInstallPrompt();

  const church = openChurch ? byId.get(openChurch) : undefined;

  function open(id: string) {
    setOpenChurch(id);
    window.scrollTo({ top: 0 });
  }

  function addChurch() {
    const name = window.prompt('Name of the church');
    if (!name?.trim()) return;
    open(actions.addChurch(name.trim()));
  }

  async function exportState() {
    const data = JSON.stringify(state, null, 2);
    const filename = `church-finder-${new Date().toISOString().slice(0, 10)}.json`;

    // Some hosts sandbox the page and make a plain download link inert, offering
    // a mediated save instead. Use it when it is there; fall back to the anchor
    // everywhere else, which is what the dev server and a static build need.
    const save = await mediatedSave();
    if (save) {
      await save({ filename, data });
      return;
    }

    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importState(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed?.profile?.preferences || !Array.isArray(parsed.churches)) {
        window.alert('That file does not look like a church-finder export.');
        return;
      }
      actions.replaceState(parsed);
      setOpenChurch(null);
    } catch {
      window.alert('Could not read that file.');
    }
  }

  return (
    <div className="app">
      {sw.needRefresh && (
        <div className="banner" role="status">
          <span>A new version is ready. Your notes are saved either way.</span>
          <span className="banner__actions">
            <button className="button button--small" onClick={sw.update}>
              Reload
            </button>
            <button className="link" onClick={sw.dismiss}>
              Later
            </button>
          </span>
        </div>
      )}
      {sw.offlineReady && !sw.needRefresh && (
        <div className="banner banner--quiet" role="status">
          <span>Installed and ready to use offline.</span>
          <button className="link" onClick={sw.dismiss}>
            Dismiss
          </button>
        </div>
      )}

      <nav className="nav">
        <div className="nav__brand">
          <span className="nav__mark" aria-hidden="true" />
          <span>Church Finder</span>
        </div>
        <div className="nav__tabs">
          {(
            [
              ['matches', 'Matches'],
              ['map', 'Map'],
              ['plan', 'Plan'],
              ['profile', 'Profile'],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              className={tab === value && !church ? 'is-active' : ''}
              onClick={() => {
                setTab(value);
                setOpenChurch(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="nav__actions">
          {canInstall && (
            <button className="link" onClick={install} title="Install as an app on this device">
              Install
            </button>
          )}
          <button className="button button--small" onClick={addChurch}>
            Add church
          </button>
          <button className="link" onClick={() => void exportState()}>
            Export
          </button>
          <button className="link" onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importState(file);
              e.target.value = '';
            }}
          />
        </div>
      </nav>

      <main>
        {church ? (
          <ChurchView
            church={church}
            profile={state.profile}
            churches={state.churches}
            actions={actions}
            onBack={() => setOpenChurch(null)}
          />
        ) : tab === 'matches' ? (
          <MatchesView profile={state.profile} churches={state.churches} onOpen={open} />
        ) : tab === 'map' ? (
          <MapView
            profile={state.profile}
            churches={state.churches}
            actions={actions}
            onOpen={open}
          />
        ) : tab === 'plan' ? (
          <PlanView
            profile={state.profile}
            churches={state.churches}
            actions={actions}
            onOpen={open}
          />
        ) : (
          <ProfileView profile={state.profile} actions={actions} />
        )}
      </main>

      <footer className="foot">
        <p>
          Everything is stored in this browser only. The denominational archetypes describe families,
          not congregations — and no real church here ships with doctrinal data filled in, because
          only the church itself can supply that.
        </p>
        <button
          className="link link--danger"
          onClick={() => {
            if (window.confirm('Reset everything back to the seed data? Your notes will be lost.')) {
              actions.reset();
              setOpenChurch(null);
            }
          }}
        >
          Reset
        </button>
      </footer>
    </div>
  );
}
