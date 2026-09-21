import { useMemo } from 'react';
import { matchAll, openQuestions } from '../domain/match';
import { STAGE_ORDER } from '../domain/types';
import type { Church, Profile, Stage } from '../domain/types';
import { Empty, VerdictChip } from '../components/common';
import type { Actions } from '../store';

const STAGE_LABEL: Record<Stage, string> = {
  shortlist: 'Shortlist',
  researching: 'Researching',
  visiting: 'Visiting',
  conversations: 'Talking with elders',
  committed: 'Committed',
  'ruled-out': 'Ruled out',
};

const STAGE_HELP: Record<Stage, string> = {
  shortlist: 'Worth a look. Nothing invested yet.',
  researching: 'Reading what they publish and working out what they do not say.',
  visiting: 'Sitting under the preaching often enough to judge it fairly.',
  conversations: 'Asking the questions that a website cannot answer.',
  committed: 'Membership, covenant, and submission to these elders.',
  'ruled-out': 'Closed, with the reason written down.',
};

export function PlanView({
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
  const candidates = useMemo(() => churches.filter((c) => c.kind === 'candidate'), [churches]);
  const questions = useMemo(() => openQuestions(profile, candidates), [profile, candidates]);
  const results = useMemo(
    () => new Map(matchAll(profile, candidates).map((r) => [r.churchId, r])),
    [profile, candidates],
  );
  const committed = candidates.filter((c) => c.stage === 'committed');

  return (
    <div className="view">
      <header className="view__head">
        <div>
          <h1>The plan</h1>
          <p className="view__lede">
            Scoring narrows the field; it does not make the decision. This page is the part that
            does — the questions still unanswered, and the move from visiting to membership.
          </p>
        </div>
      </header>

      <section className="section">
        <h2>Where each church stands</h2>
        <div className="funnel">
          {STAGE_ORDER.map((stage) => {
            const inStage = candidates.filter((c) => c.stage === stage);
            return (
              <div key={stage} className={`funnel__col funnel__col--${stage}`}>
                <div className="funnel__head">
                  <h3>{STAGE_LABEL[stage]}</h3>
                  <span className="funnel__count">{inStage.length}</span>
                </div>
                <p className="funnel__help">{STAGE_HELP[stage]}</p>
                <ul>
                  {inStage.map((c) => {
                    const result = results.get(c.id);
                    return (
                      <li key={c.id}>
                        <button className="funnel__church" onClick={() => onOpen(c.id)}>
                          {c.name}
                        </button>
                        {result && <VerdictChip verdict={result.verdict} />}
                        <select
                          className="funnel__move"
                          value={c.stage}
                          onChange={(e) => actions.setStage(c.id, e.target.value as Stage)}
                          aria-label={`Move ${c.name}`}
                        >
                          {STAGE_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {STAGE_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>What to ask, and who to ask it of</h2>
        <p className="view__lede">
          Generated from the axes you weighted heavily and have no answer for. Decisive questions —
          the ones that could rule a church out outright — come first.
        </p>
        {questions.length === 0 ? (
          <Empty>Nothing outstanding. Every church in play is answered on every axis you weighted.</Empty>
        ) : (
          questions.map(({ church, unknowns }, index) => (
            // Only the first is open. Early on, every church has the same
            // fifteen unanswered questions, and stacking them all expanded
            // turns a work list into a wall.
            <details key={church.id} className="qblock" open={index === 0}>
              <summary className="qblock__head">
                <span className="qblock__name">{church.name}</span>
                <span className="qblock__count">
                  {unknowns.filter((u) => u.decisive).length} decisive · {unknowns.length} total
                </span>
              </summary>
              <ol className="questions">
                {unknowns.slice(0, 8).map((u) => (
                  <li key={u.axisId}>
                    <div className="questions__axis">
                      {u.axisName}
                      {u.decisive && <span className="chip chip--decisive">decisive</span>}
                    </div>
                    <p>{u.diagnostic}</p>
                  </li>
                ))}
              </ol>
              <p className="qblock__more">
                {unknowns.length > 8 && `${unknowns.length - 8} more · `}
                <button className="link" onClick={() => onOpen(church.id)}>
                  Open {church.name}
                </button>
              </p>
            </details>
          ))
        )}
      </section>

      <section className="section">
        <h2>Before you commit</h2>
        {committed.length > 1 && (
          <div className="callout callout--warn">
            <p>
              You have {committed.length} churches marked committed. That is one more than the
              number a person can actually be a member of.
            </p>
          </div>
        )}
        <div className="checklist">
          <p>
            A high score is not a reason to join, and the last stretch is not a scoring problem.
            What should be true before you sign a covenant:
          </p>
          <ul>
            <li>
              <strong>No decisive question is still open.</strong> Every axis you marked as a
              dealbreaker is answered, from the church rather than from inference.
            </li>
            <li>
              <strong>You have heard enough preaching to judge it fairly.</strong> Several months,
              not a sample. One good sermon proves very little.
            </li>
            <li>
              <strong>You have met the elders and asked them hard things directly.</strong> How they
              answer when pressed tells you more than the doctrinal statement does — especially on
              how they handle correction of one of their own.
            </li>
            <li>
              <strong>You know what you are giving up.</strong> Nothing here scores 100. Name the
              friction you are accepting, in writing, before you accept it — so that in two years
              you remember you chose it rather than missed it.
            </li>
            <li>
              <strong>You can submit to these men in the things you disagree about.</strong> This is
              the real question, and no model can answer it for you.
            </li>
            <li>
              <strong>Someone there knows you.</strong> Membership that begins as an anonymous
              transaction usually stays one.
            </li>
          </ul>
          <p className="checklist__coda">
            On eldership: if you are opening to it, the question shifts. You are not only asking
            whether you can sit under this teaching — you are asking whether these are men you want
            to be formed by, and whether there is an actual path from member to elder here rather
            than a closed room. Ask who is in that pipeline now, and ask the last man who went
            through it what it cost him.
          </p>
        </div>
      </section>
    </div>
  );
}
