import { useRef, useState } from 'react';
import { useAppState } from './store';
import { MatchesView } from './views/MatchesView';
import { ProfileView } from './views/ProfileView';
import { ChurchView } from './views/ChurchView';
import { PlanView } from './views/PlanView';

type Tab = 'matches' | 'plan' | 'profile';

export default function App() {
  const { state, byId, actions } = useAppState();
  const [tab, setTab] = useState<Tab>('matches');
  const [openChurch, setOpenChurch] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church-finder-${new Date().toISOString().slice(0, 10)}.json`;
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
      <nav className="nav">
        <div className="nav__brand">
          <span className="nav__mark" aria-hidden="true" />
          <span>Church Finder</span>
        </div>
        <div className="nav__tabs">
          {(
            [
              ['matches', 'Matches'],
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
          <button className="button button--small" onClick={addChurch}>
            Add church
          </button>
          <button className="link" onClick={exportState}>
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
