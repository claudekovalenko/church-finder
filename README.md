# Church Finder

A tool for working out which local church you can sit under in good conscience, and
for moving from browsing to committed membership.

It is not a directory and it does not know about churches near you. It is a model of
*your* convictions, a way to record what a church actually teaches, and an engine that
puts the two side by side and tells you where they meet, where they rub, and — most
usefully — what you still have not found out.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # the scoring engine and the seed data
npm run build    # static files in dist/, deployable anywhere
```

Everything lives in your browser's local storage. There is no account, no server, and
nothing leaves the machine. Use **Export** to get a JSON file you can back up or move
to another browser.

---

## How it thinks

Fifteen axes, each a 0–100 spectrum, grouped into non-negotiables, convictions, church
practice, mission, and style. Each axis is oriented so both ends are positions real
churches actually hold — the axis stays neutral, and your profile decides which end you
want.

For each axis your profile sets four things:

| | |
|---|---|
| **Target** | Where you sit. |
| **Weight** | 0–10. What you are willing to trade away, which matters more than the position itself. |
| **Mode** | How the target is compared. |
| **Tolerance** | The distance at which a church stops earning any credit on that axis. |

The three modes exist because not every disagreement works the same way:

- **`at least`** — more is simply better. Elder accountability, missionary sending,
  evangelistic culture. A church that overshoots your target loses nothing.
- **`at most`** — the mirror image. Expository preaching, for instance.
- **`close to this`** — *both* directions cost you. This is the one that makes the
  model worth building. On spiritual gifts you are neither cessationist nor unbounded
  charismatic, and a naive "more charismatic is better" scale would rank a church that
  treats fresh revelation as binding above a church that practises the gifts under the
  authority of Scripture. Proximity scoring gets that right: cessationism at 0 and
  revelatory charismaticism at 100 score identically badly against a target of 55.

Fit falls off linearly and hits zero at the tolerance, which keeps it explainable — 30
points apart on a 40-point tolerance is a quarter of the credit, and you can say that
out loud. The final score is the weighted average across every axis you have data for.

### Dealbreakers

Any axis can carry a hard limit. Cross it and the church is ruled out whatever it
scores elsewhere, with the reason shown. The default profile sets six: baptism, the
authority of Scripture, who may hold office, a floor on soteriology, a ceiling on
charismatic practice, and a floor on elder oversight.

A dealbreaker only fires firmly on data you are actually confident in. A low-confidence
guess raises the flag and caps the verdict, but it does not close the door — you go and
confirm it first.

### Confidence and corroboration

The score is only half the output. Two other numbers travel with it, and they are not
the same thing:

- **Confidence** — how much of your weighted concern is answered at all. A church you
  have never investigated scores nothing at 0% confidence and is reported as *needs
  answers* rather than being ranked against churches you know something about.
- **Corroboration** — of the data you do have, how much came from the church stating it
  or from you observing it, rather than being inferred from an affiliation or assumed.

You can be extremely confident in a guess, which is why both exist. A profile prefilled
from a denominational archetype is complete, reasonably confident, and entirely
uncorroborated — so the engine holds it below *strong fit* until you confirm it from
the church itself. Low-confidence values are also down-weighted in the score, so a
church cannot ride a stack of assumptions to the top of the list.

### The questions are the point

Every axis you weighted and have no answer for becomes a question — not "spiritual
gifts: unknown" but *"Are prophecy and tongues practised in the gathering, and what
happens when someone gives a word that does not hold up?"* The Plan page collects them
across every church still in play, decisive ones first. Early on, that list is the whole
product.

---

## The data

Two kinds of entry:

**Traditions** are denominational archetypes — Reformed Baptist, Sovereign Grace,
Acts 29, Southern Baptist, PCA, LCMS, ACNA, classical Pentecostal, revivalist
charismatic, disciple-making movements, Rome, Orthodoxy, progressive mainline, and
large non-denominational contemporary. They describe *families*, not congregations,
and they are there to rule whole categories in or out quickly. Per-datum confidence
means "how definitional is this for the family" — paedobaptism for Presbyterians is
0.95, worship style is nobody's 0.5.

**Candidates** are actual churches. They ship with **no doctrinal data filled in at
all**, on purpose. Guessing at a real congregation's positions and then scoring it
against them produces a confident-looking number built on nothing. So every real church
starts at zero confidence, the app says *needs answers*, and hands you the list. That is
the correct answer for a church nobody has investigated yet.

Where a church's own name declares its affiliation, it carries a `traditionId` hint, and
the church page offers to prefill from that archetype — as *inferred* values at half
confidence, flagged as such, for you to confirm or overwrite one at a time.

Provenance is recorded per value (`stated` / `observed` / `inferred` / `assumed`) along
with a source and a note, so that in six months you can tell which judgements were the
church's and which were yours.

---

## Making it yours

The starting profile is a Reformed Baptist frame: credobaptist, complementarian,
monergistic, expository, confessional, historic on ethics, ordered continuationist,
missional, and unwilling to sit under leadership with no real accountability. Every
number in it is meant to be argued with — change them on the Profile page, or edit
`src/domain/profile.ts` to change the defaults.

To change the model itself rather than the profile, edit `src/domain/axes.ts`. Adding an
axis means adding anchors that span 0–100 and a `diagnostic` — the question you would
actually ask a pastor over coffee, since that string is what the app hands you later.
The tests will tell you if you leave a tradition unscored on it.

```
src/domain/axes.ts        the fifteen axes and what their positions mean
src/domain/profile.ts     the default profile
src/domain/match.ts       scoring, dealbreakers, confidence, question generation
src/data/traditions.ts    denominational archetypes
src/data/candidates.ts    the churches under consideration
```

---

## What this cannot do

The model is a filter, not a verdict. It compares stated positions; it cannot tell you
whether the elders are humble, whether the preaching feeds you, whether anyone would
notice if you stopped coming, or whether you can submit to these men in the things you
end up disagreeing about. Those are the questions that actually decide it, and they are
answered by sitting under the preaching for months and asking hard things to people's
faces.

What the tool is good for is making sure you are not still asking the easy questions in
month six, that a rule-out is written down rather than only felt, and that when you do
commit you know exactly which friction you accepted — so that in two years you remember
you chose it rather than missed it.
