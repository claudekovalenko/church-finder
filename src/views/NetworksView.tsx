import { useState } from 'react';
import { FIT_HELP, FIT_LABEL, NETWORKS, NOTABLE_CHURCHES } from '../data/networks';
import type { Fit } from '../data/networks';

const FITS: Fit[] = ['aligned', 'partly', 'outside'];

/**
 * The national picture, kept apart from the local decision. Nothing here is
 * scored: networks describe what churches have promised, and the Traditions
 * list is where a family gets scored against your profile.
 */
export function NetworksView({ onOpen }: { onOpen: (id: string) => void }) {
  const [showOutside, setShowOutside] = useState(false);

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>Networks across the US</h1>
          <p className="view__lede">
            Denominations, networks and directories, sorted against your convictions — and a few
            congregations worth knowing as reference points. A network tells you what a church has
            promised; only the congregation tells you what it does.
          </p>
        </div>
      </header>

      {FITS.filter((fit) => fit !== 'outside' || showOutside).map((fit) => (
        <section key={fit} className="section">
          <h2>{FIT_LABEL[fit]}</h2>
          <p className="view__lede">{FIT_HELP[fit]}</p>
          <ul className="networks">
            {NETWORKS.filter((n) => n.fit === fit).map((n) => (
              <li key={n.id} className={`network network--${fit}`}>
                <div className="network__head">
                  <h3>{n.name}</h3>
                  <span className="chip chip--kind">{n.kind}</span>
                </div>
                <p className="network__stance">{n.stance}</p>
                <p className="network__note">{n.note}</p>
                <p className="network__links">
                  {n.finder && (
                    <a href={n.finder} target="_blank" rel="noreferrer">
                      Find a church
                    </a>
                  )}
                  {n.traditionId && fit !== 'outside' && (
                    <button className="link" onClick={() => onOpen(n.traditionId!)}>
                      Score this family
                    </button>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!showOutside && (
        <p>
          <button className="link" onClick={() => setShowOutside(true)}>
            Show the {NETWORKS.filter((n) => n.fit === 'outside').length} groups ruled out, and why
          </button>
        </p>
      )}

      <section className="section">
        <h2>Healthy churches worth knowing</h2>
        <p className="view__lede">
          Not candidates — none is near Buena Park — but pictures of what health looks like in your
          corner of the church, and preaching you can sit under online while you look.
        </p>
        <ul className="networks">
          {NOTABLE_CHURCHES.map((c) => (
            <li key={c.name} className="network">
              <div className="network__head">
                <h3>{c.name}</h3>
                <span className="chip chip--kind">{c.city}</span>
              </div>
              <p className="network__stance">{c.family}</p>
              <p className="network__note">{c.why}</p>
              {c.caution && <p className="network__caution">{c.caution}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
