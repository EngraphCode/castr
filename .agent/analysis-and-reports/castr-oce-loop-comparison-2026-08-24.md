# Castr's autonomous loop and OCE's weekly Codex scans — a comparison

**Commissioned:** owner, 2026-08-24, in the loop-review session's continuation
("Compare the long running Castr project work with routines and the
outcome-informed-practice-learning strategic node work that runs on Codex with
a weekly cadence"). **Author:** Flamebright Burning Caldera (claude-code
cloud, thread `proof-programme-review`). **Evidence:** the castr side from the
[loop review](./proof-programme-loop-review-2026-08-24.md) (every claim there
carries its source); the OCE side read firsthand from the OCE `engraph`
branch — the `outcome-informed-practice-learning` strategic node
(`.agent/plans/strategic/outcome-informed-practice-learning.plan.md`,
ratified 2026-08-01/02), the delivery plans serving it (ten enumerated by
`serves:` search; `exemption-removal` and `open-surface-zero` read in full),
and the 2026-08-24 outage retrospective. **Evidence bound:** neither repo
records its scheduler — castr's cron and OCE's weekly cadence both live
platform-side; the cadence facts and the owner corrections below are
owner-supplied (2026-08-24, this session, verbatim where quoted).

**Owner corrections folded (2026-08-24):** an earlier draft of this
comparison framed the weekly scans as owner-attended. Wrong — the owner: "I
do not intend to be present for the weekly scans or value derivations,
although they do not go as far in that the OCE scans result in research
rather than implementation." Both loops are UNATTENDED; the load-bearing
differences are cadence, vendor seat, and — above all — **output tier**:
castr's loop lands implementation (merged PRs under standing authority),
OCE's scans land research (reports, registers, adjudication inputs).

**Standing owner directive (2026-08-24, verbatim, recorded here as its first
durable home):** "piece by piece, I want the Practice in Castr and OCE to
take the best of each other, until they are Equal in capability." This
extends the existing one-directional parity programmes (Oak→castr transplant;
the castr→OCE back-flow ledger) into a BIDIRECTIONAL equality goal. The
cross-pollination inventory below is its first instalment, raised as PRs in
both repos at the owner's word.

---

## The two loops, side by side

| Dimension                | Castr proof-programme                                                                                                                                         | OCE outcome-informed-practice-learning work                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger                  | Platform cron Routine, `3 */8 * * *` UTC, fresh Claude cloud session per firing                                                                               | Weekly Codex runs (platform-side schedule; owner-supplied fact)                                                                                                             |
| Cadence                  | 3/day (~21 runs/week)                                                                                                                                         | ~1/week                                                                                                                                                                     |
| Attended?                | No — zero-context seats, standing brief (`routine-prompt.md`)                                                                                                 | No (owner correction above) — the owner reads outputs, not runs                                                                                                             |
| Output tier              | **Implementation**: TDD slices merged under ADR-051 clause 3's condition-based authority                                                                      | **Research**: reports, registers, censuses, dispositions feeding later adjudication                                                                                         |
| Authority at run time    | Front-loaded standing authority (W-0 ballot; ADR-051 clauses; merge-by-condition; forks → QD register)                                                        | Bounded to research outputs; consequential changes wait for owner cards/ratification (the plans' `repo-safe` vs `owner-held` acceptance split)                              |
| Memory between runs      | Parent-plan frontmatter (queue + counters), incident register, thread records — durable-only-as-tracked-state doctrine (QD-5)                                 | Plan bodies with dated notes, per-surface register files, director-handoff — same genotype, coarser granularity                                                             |
| Safety machinery         | Built explicitly (STOP file, zero-progress kill switch, duration bound, FIRING-LEASE, now predecessor attestation) because nothing human sits between firings | Mostly inherited from the weekly rhythm: runs cannot overlap a week; research output cannot break the estate; a missed week is a visibly empty week                         |
| Measured failure classes | Firing overlap (I-1, ≥11 h vs 8 h interval); silent missed slots (2 measured); review-cure treadmill (17 rounds); drive-starvation (surfaced)                 | The review-cure treadmill (the corepack arc, ~25 cure commits — on an interactive seat, so the class is cadence-independent); staleness between runs is the structural risk |

## What the output-tier gap actually is

The owner's framing is exact: the OCE scans "do not go as far". The distance
between a research-producing scan and an implementation-producing loop is
precisely the machinery castr built for the proof-programme, and nothing
else:

1. **Standing written authority** for the recurring judgement calls (castr:
   one ballot sitting produced ADR-051's merge/review/escalation clauses);
2. **A machine-consumable queue with mechanical acceptance** (briefs whose
   DONE is `red-first proof + gates green + merge conditions met`, so a seat
   can self-judge completion);
3. **Run-boundary state discipline** (counters, incidents, and continuity
   landing as tracked state through defined routes).

OCE already has everything else the loop needs — the grounding practice, the
reviewer layer, the register discipline, decision cards. If the owner ever
wants a weekly scan's value derivations to LAND rather than accumulate as
inputs, the path is a scan-scoped ballot + a queue with mechanical
acceptance, not new invention. Conversely, the boundedness of OCE's scans is
itself a designed property of the OIPL node ("maintaining the learning
substrate does not become the dominant work") — going further is a choice,
not a deficiency, and the node's own disconfirmation clause should govern it.

## Cadence-independent findings (the strongest cross-estate data)

- **Bot-review non-convergence is a property of the review loop, not of
  autonomy or cadence.** Castr measured 17 untallied rounds under the 8-hour
  loop; OCE measured ~25 cure commits in 3.5 hours on a fully interactive
  seat, the same week. Both estates independently converged on the same cure
  — a tally artefact created at PR-open plus a bounds-not-cures disposition
  for unbounded-reference findings. Castr ratified it into ADR-051 clause 4
  (2026-08-24) with queue row Q-19 to build the instrument; OCE's
  retrospective graduates the same contract (its proposal 2).
- **Convergent evolution throughout:** decision cards, verbatim owner-word
  records, warrant + falsifier on proposals, registers-never-inventories,
  repo-as-memory. The estates are one genotype expressing two phenotypes —
  which is what makes the equality directive tractable piece by piece.

## Cross-pollination inventory (each: what, warrant, falsifier, route)

**OCE → castr:**

- **C-1 — The effect-hypothesis contract on queue briefs.** OIPL's
  three-contract model (capability / effect-hypothesis / feedback) is one
  contract richer than castr's warrant + falsifier: the effect-hypothesis
  names the later outcome that judges whether the work paid off. _Warrant:_
  castr's own review found its proposals carry warrant + falsifier but no
  outcome-judgement clause; OIPL's charter makes that the centre. _Falsifier:_
  briefs whose effect-hypotheses are never consulted at any later decision —
  ceremony, not contract. _Route:_ castr queue-brief convention amendment
  (owner-gated: it touches the parent plan's contract prose).
- **C-2 — Expiry and no-open-ended-state on the QD register.** OCE's node
  schema carries `gate_expiry_default: P21D`; its exemption register forbids
  open-ended states (every row `fix-routed`/`policy-ratified`/`pending`, and
  closure requires zero pending). Castr's QD-1/QD-2/QD-4 sit OPEN with no
  expiry or re-surface trigger beyond per-firing notification lines.
  _Warrant:_ the loop review verified the rows are healthy but unaging; the
  OCE shape is structurally stronger. _Falsifier:_ expiries that only
  generate re-stamp churn without a single row resolving differently.
  _Route:_ QD-register convention amendment (owner-gated).

**castr → OCE:**

- **O-1 — The REVIEW-TALLY artefact, corroborated cross-estate.** Castr's
  ratified clause 4(c) wording and Q-19's PR-comment tally shape (mirroring
  the proven FIRING-LEASE convention) give OCE's retrospective proposal 2 a
  second estate's ratified form to graduate against. _Warrant:_ four measured
  no-tally arcs across the two estates. _Falsifier:_ tallies built and the
  step-back still not firing. _Route:_ OCE pr-lifecycle amendment per its
  own PDR-130 fast lane (the retrospective already carries it; castr's
  ratified text is corroborating evidence, not new authority).
- **O-2 — Counters-as-tracked-state for scheduled work.** If OCE's weekly
  scans multiply into lanes, castr's pattern (explicitly initialised counters
  in plan frontmatter; absence = observable drift; every run lands its
  increment through a defined route) gives "runs since last progress per
  lane" for free. _Warrant:_ castr's counter integrity held across an
  environment outage and a multi-writer incident. _Falsifier:_ counter
  bookkeeping consuming a visible share of scan output — the OIPL charter's
  own proportionality bound. _Route:_ OCE convention note, adopt-at-need.
- **O-3 — Predecessor-slot attestation for any scheduled loop.** Castr
  measured ~16 h of silent scheduler absence invisible to every instrument
  the loop reads; the cure (each run attests its predecessor's expected slot
  from durable traces; a trace-less slot becomes an incident) transfers to
  any unattended cadence, weekly included — where a missed slot costs a whole
  week of staleness. _Warrant:_ castr firings 4–5 (measured); Q-18's
  owner-approved brief. _Falsifier:_ false positives on legitimately
  trace-less runs. _Route:_ OCE convention note, adopt when a scan lane
  becomes schedule-critical.
- **O-4 — The research→implementation path, as evidence.** The
  proof-programme is a live, measured existence proof that an unattended
  loop can safely land implementation under front-loaded authority: four
  attested firings all behaved correctly; eight forks became owner rulings
  without a stall; two runaway/stall classes were measured and cured. If the
  owner ever widens a weekly scan's mandate from research to implementation,
  this is the template and the evidence base. _Warrant:_ the loop review's
  R2/R3. _Falsifier:_ the loop's future failure modes (the review names the
  accepted residual: sustained-absence blindness). _Route:_ recorded as
  evidence for a future OCE owner decision — nothing to enact now.

## Residual asymmetries worth naming

- Castr's loop is the only live proof either estate has that the Practice
  functions with nobody present; the weekly cadence never exercises
  unattended reflexes. Keeping one high-frequency autonomous lane running is
  itself outcome-evidence the OIPL node feeds on.
- OCE's information-governance boundaries (people-derived evidence, privacy,
  safeguarding) have no castr counterpart yet; if castr's loop ever touches
  outcome evidence about people rather than code, the OIPL node's bounds are
  the template to import — a future instalment of the equality directive.
