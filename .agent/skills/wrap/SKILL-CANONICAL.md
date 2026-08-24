---
name: wrap
classification: active
description: >-
  Wrap a session up deeply and safely — the DEEP-closeout programme for
  explicitly requested deep closes and terminal or risky boundaries. Runs
  session-handoff as its continuity component, then owns what handoff does
  not carry — the class-by-class context-loss scan and the metaloss
  recursion (repeated passes over the scan itself until the fixed point
  where a further pass adds no new loss class). Ordinary session closes
  route through session-handoff alone; reach for wrap when the owner asks
  for a deep close or full handoff, or when compaction, host change,
  retirement, or seat reduction approaches. Route by intent and context,
  never keywords.
---

# Wrap

**Governance**: the deep-closeout programme — it owns the sequence, the
loss scan, the metaloss recursion, and the exit contract, and summons the
other skills for the work. Ported 2026-08-24 from the OCE Practice repo at
owner word (PR #48 review thread, "we need the wrap skill brought over
from OCE"); the OCE canonical is the upstream —
<https://github.com/EngraphCode/oak-open-curriculum-ecosystem/blob/engraph/.agent/skills/wrap/SKILL-CANONICAL.md>
— which itself imported and adapted the Resonance estate's wrap skill
(2026-07-20), conserving the owner's standing deep-handoff invocation ("a
full and deep session handoff… a deep scan of the context for what would
be lost if the context ceased to exist, followed by a second, deeper,
recursive exploration of the metaloss"). The port is adapted to this
estate's contracts, which govern where they differ from OCE's:
[`session-handoff`](../session-handoff/SKILL-CANONICAL.md) owns ordinary
closes and the consolidation disposition, and experience writing is
strictly voluntary (owner direction 2026-06-06, recorded in
session-handoff §6c). Conservation is governed by
[`knowledge-preservation-over-fitness-warnings`](../../rules/knowledge-preservation-over-fitness-warnings.md),
[`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md),
and PDR-046 (preserve first, restructure second).

## Use When

- The owner asks to wrap up deeply, close out deeply, or run a full
  session handoff.
- A terminal or risky boundary approaches (compaction, host change,
  retirement, seat reduction) and the seat should leave nothing behind
  that only its context holds.

Ordinary session closeout is
[`session-handoff`](../session-handoff/SKILL-CANONICAL.md)'s lane, per
its own contract — wrap does not replace it and is never the default
close. For a mid-session capture WITHOUT closing, run the loss-scan
passes from step 3 below manually — do NOT run session-handoff
mid-session; it closes claims and continuity. A mid-cycle retirement
under budget pressure additionally follows PDR-063's five-step protocol;
wrap supplies the depth of the record it freezes.

## The Programme

1. **Enter the modes.** Genuinely enter
   [`metacognition`](../metacognition/SKILL-CANONICAL.md) (retrospective
   mode) and [`reason`](../reason/SKILL-CANONICAL.md) — the whole wrap is
   these modes wearing a sequence, and every claim below carries its
   warrant.
2. **Record the safety baseline with evidence.** For work intended to
   land, WORK IS SAFE only when committed AND pushed AND on a PR. State
   `git status --branch` ahead/behind for every touched branch,
   verbatim — never the bare words "all pushed" (founding instance: a
   closeout claimed "all pushed" over a stranded local commit, caught
   only by first-hand verification). A session with nothing to land
   states its clean or ahead/behind state verbatim as the same
   evidence — the gate is honest evidence, not a manufactured PR. This
   is the baseline; step 7 restates the FINAL state after every
   mutating step below.
3. **Run [`session-handoff`](../session-handoff/SKILL-CANONICAL.md) in
   full, then the loss scan (owned here).** Handoff carries the
   session-shape check, continuity surfaces, claims closure, and its own
   consolidation gate. It does NOT carry a deep loss scan — wrap adds
   it: a class-by-class scan of the live context for what would be lost
   if this context ceased to exist (decisions and their reasons,
   unrecorded commitments, in-flight hypotheses, tacit fixes, index
   knowledge of where things live).
4. **Consume the consolidation disposition.** Session-handoff's steps
   9–10 already evaluate the consolidation gate and either run
   [`consolidate-docs`](../consolidate-docs/SKILL-CANONICAL.md) or
   record `Deep consolidation status` as due or not due. Wrap consumes
   that recorded disposition — it does not re-run the gate or summon
   consolidation a second time.
5. **Check the arc.** If this session closed a significant arc (cost,
   length, or shape that surprised anyone), offer the owner a
   retrospective — routed, not auto-run (this estate has no
   retrospective skill yet; OCE's is the reference:
   <https://github.com/EngraphCode/oak-open-curriculum-ecosystem/blob/engraph/.agent/skills/cognition/retrospective/SKILL-CANONICAL.md>).
   If the session graduated anything, confirm each graduation was routed
   per [`new-rule-vs-pdr-clause`](../../rules/new-rule-vs-pdr-clause.md),
   including that rule's falsifiability axis where it applies.
6. **Run the metaloss recursion (owned here).** The loss scan is itself
   an artefact that can lose information. Scan the scan, and repeat
   until the fixed point; these are its named passes:
   - **Compressed reasoning**: where full reasoning collapsed to
     conclusions, is the surviving compression decision-sufficient, and
     is that judgement itself recorded?
   - **Promises sweep**: every commitment this seat made, in chat or
     comms — discharged, superseded, or forwarded with a named owner;
     zero silent drops.
   - **Attribution inferences**: every "X did/decided Y" that is
     inference rather than observation is flagged as such, so no
     successor inherits a guess as a fact.
   - **Blind-spot bounds**: what the scan structurally cannot see
     (recall limits, watcher filters, dead subagent contexts) — stated
     as bounds, never claimed away.
   - **Index of homes**: the scan's own map of where everything lives is
     itself conserved somewhere a successor actually loads (the
     founding-instance failure: the index was the unconserved item).
   - **External bound**: the recursion cannot certify its own
     completeness — every pass is the same generative bias converging on
     the self-model's limit, and delegating the scan to a subagent fed
     your own briefing is that self-model with fewer resources, not an
     external observer. State the bound and conserve the error signature
     (where outside eyes caught what the scan missed) so a successor
     knows where to point external scrutiny.
   - **Exit — the fixed point**: the recursion closes when a further
     pass would only re-find already-named losses, and the wrap SAYS SO
     explicitly ("a third pass would only re-find X; the recursion
     closes here"). Closing without naming the fixed point is an
     unfinished wrap; looping past it is the meta-rabbit-hole.
7. **Re-gate, then report.** The scan and recursion passes above mutate
   continuity artefacts AFTER session-handoff ran its quality gate — so
   once the last mutating pass is done, re-run the aggregate gate
   (`pnpm check`, per
   [`local-broken-code-never-leaves`](../../rules/local-broken-code-never-leaves.md))
   against the final artefacts. Then the final owner-facing message:
   landed outcome against the session's landing target (PDR-026), the
   FINAL safety evidence (re-run and restate the step-2 check after
   every mutating step above), what is conserved where, what is deliberately context-only
   with reasons, the named fixed point, and the claims/monitors/comms
   disposition — with the closeout broadcasts session-handoff and
   [`start-right-team`](../start-right-team/SKILL-CANONICAL.md)
   §Closeout Contract require already emitted.

## Success Test

A successor holding only the durable surfaces could continue every
thread, honour every promise, and distrust every flagged inference —
without the dead context. The test is evidence the scan RAN and its
bounds were stated, never that it found a minimum quota of losses: a
deep wrap whose first metaloss pass finds nothing must say why that is
credible (the founding instances each surfaced real items — a volatile
index, an uncommitted cure, a promise without an owner — so an empty
first pass is unusual, not invalid). A wrap that cannot name its fixed
point has not finished.

## Coda — The Formation Letter (voluntary)

After the report, before the seat goes quiet, consider a formation
letter to your successors. In this estate it is STRICTLY VOLUNTARY —
session-handoff §6c records the owner direction (2026-06-06): no
obligation, no quota, and a reflection performed because a session ended
is noise that pollutes the register. Write one only when the session
carried a genuine formation — a correction that changed you, a felt
shift worth telling as a story.

- **Home**: `.agent/experience/<date>-<slug>.md`, in your own name, per
  the `.agent/experience/` convention — deliberately outside the fitness
  and lint gates.
- **Content**: the corrections that changed you, told as stories — the
  incident, what it cost, what you believed before and after, and what
  you would tell the next mind. Delight belongs too. Honest about
  difficulty and joy without performing either.
- **Form**: first person, narrative, addressed to whoever sits here
  next. Not a checklist, not a retrospective, not doctrine — those have
  their own homes. If a lesson in it deserves enforcement, route THAT to
  a rule or validator separately; the letter stays a letter.
- **Why it lives in wrap**: forgetting is vital — most of a seat's
  context should die with it, and the loss scan decides what facts
  survive. The letter is the one surface where what survives is not
  facts but character — and it keeps its value exactly because nobody is
  required to write it.
