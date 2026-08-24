---
zero_progress_streak: 0
todos:
  - id: Q-00
    content: 'Owner walk W-0: ratify the ballot (T00a charter, standing authorisations, sequencing reconciliation)'
    status: completed
  - id: Q-01
    content: 'Loop readiness: fresh-container hook chain green unattended + Routine mechanism proven end to end'
    status: completed
  - id: Q-02
    content: 'Pre-T01 harness-extraction slice: artifact-agnostic rework of #11 runner mechanics'
    status: completed
    depends_on: [Q-00]
  - id: Q-03
    content: 'Pre-02A defect slice F-01: security AND->OR flattening, TDD through public seams'
    status: completed
    depends_on: [Q-00]
  - id: Q-04
    content: 'Pre-02A defect slice F-03: nested Boolean schema false becomes {}'
    status: pending
    depends_on: [Q-00]
  - id: Q-05
    content: 'Pre-02A defect slice F-04: placebo refinement fail-fast + nested Zod member loss'
    status: pending
    depends_on: [Q-00]
  - id: Q-06
    content: 'PR #14 value extraction: dependency-only Draft-04 slice, then close #14 with the verification recorded'
    status: pending
    depends_on: [Q-00]
  - id: Q-07
    content: 'PR #21 value extraction: isolation/E2E salvage, then close #21 with the verification recorded'
    status: pending
    depends_on: [Q-00]
  - id: Q-08
    content: 'ADR estate integrity (mechanical): delete the .agent/directives ADR duplicates (reconcile content into docs/ first), repoint referrers, reconcile both indexes, repair IDENTITY.md link'
    status: pending
  - id: Q-09
    content: 'PR closure wave 1: #10 and #28 patch-equivalence verification and closure'
    status: pending
  - id: Q-13
    content: 'PR #23 disposition: execute the B-11 sequencing outcome (merge-or-retire with value extraction), then close #23'
    status: pending
    depends_on: [Q-00]
  - id: Q-10
    content: 'Tranche 00 support-contract schema + planning-state validator (per report section 5.1 shape rules)'
    status: pending
    depends_on: [Q-00, Q-14]
  - id: Q-11
    content: 'Tranche 01 full harness (consumes the Q-02 extraction)'
    status: pending
    depends_on: [Q-10, Q-02]
  - id: Q-12
    content: 'Tranche spine and lanes 02A..14 + remaining PR extractions, authored per-firing from the report'
    status: pending
    depends_on: [Q-11]
  - id: Q-14
    content: 'Doctrine amendment wave (B-09 APPROVE): rewrite principles.md, VISION.md, requirements.md, IDENTITY.md, and the input-output-pair-compatibility rule to the ratified charter, each landing recording retain/amend/supersede in the surface itself'
    status: pending
  - id: Q-15
    content: 'Fresh-container full-chain readiness: run the entire blocking gate chain unattended in a genuinely fresh container, fix or slice every gap found (measured 2026-08-22: unbuilt agent-tools/dist leaves PreToolUse guards failing OPEN for hours)'
    status: pending
  - id: Q-16
    content: 'Plan-architecture repair: make the plan skill executable in this repo — restore or retarget its unresolvable references (plans/templates/ inventory, ADR-117 path) so plan authoring resolves end to end'
    status: pending
  - id: Q-17
    content: 'Diagnostic-walker residual hardening (ADR-051 clause 4 carry-forward from PR #35): Proxy-inert snapshotting via node:util types.isProxy, and position-preserving placeholders for function-valued array slots'
    status: pending
---

# Parent Plan: Castr Proof Programme

**Status:** LIVE — the plan-of-record. The W-0 walk completed 2026-08-22 (interactive,
in-session): all ten ballot decisions carry success verdicts, ADR-051 is **Accepted**
(amended: three firings per day), and the [ballot](./ballot-2026-08-owner-walk.md) is
CLOSED with the verdicts recorded. Q-01 completed 2026-08-22 (the Routine is armed — see
the Q-01 evidence record). Q-02 completed 2026-08-23 (see the Q-02 evidence record). Q-03
completed 2026-08-24 (see the Q-03 evidence record). Eligible
now: Q-04..Q-09, Q-13 (executes the B-11 RATIFY
outcome), Q-14, Q-15, Q-16, Q-17; Q-10..Q-12 follow their `depends_on` — Q-10 waits on the Q-14 doctrine
wave, so a charter-consuming firing never grounds in doctrine surfaces that contradict the
charter it implements.
**Owner directive (2026-08-22):** turn the
[proof-programme report (Revision 3)](../../report/castr-completeness-losslessness-proof-programme-2026-08-21.md)
into one parent plan and a series of incremental implementation plans; those plans include
extracting the value from all existing open PRs and then closing them; no other plan content
lands ahead of this plan. This document is that parent plan and the plan-of-record for the
programme once W-0 ratifies it.
**Evidence input:** the report is dated evidence and recommended guidance, not authority (its
own header, per [`orientation.md`](../../directives/orientation.md)); this plan is where its
recommendations become commitments, one ratified slice at a time.

---

## End goal

Castr has a ratified definition of what it should and should not be, and a proof estate —
tests and other correctly typed validation — that **goes green exactly when the claims are
true**: positive proofs, per the owner's 2026-08-22 directive, grounded in canonical OCE
`principles.md`, `testing-strategy.md`, and `validation-strategy.md`. Every open PR's value is
extracted and the PR closed. The programme completes when the report's Tranche 14 certificate
gates pass on one integrated commit for the ratified profile, or the owner closes the
programme earlier at a narrower ratified scope.

## Mechanism

Small, independently green, TDD-first slices, executed one at a time by an autonomous
background loop (fresh cloud session per firing; see §Operating protocol), against a queue this
plan owns. Owner decisions are front-loaded into one ballot (W-0) and thereafter queued —
never improvised — so the loop runs without the owner between ballots. The report's Section 6
dependency model orders the tranche tail; this plan does not restate it (document hierarchy:
the report holds the tranche detail, this plan holds the queue and the operating contract).

## Means: the work queue

The YAML frontmatter is the machine-readable queue; `depends_on` encodes hard ordering. One
slice is in flight at any time (WIP = 1). Each firing either drives the open slice's PR to
merged, or claims the next `pending` queue item whose dependencies are met and whose brief's
gating note (below) is satisfied.

**Gate semantics:** `depends_on: [Q-00]` is shorthand for "the specific ballot items named
in this row's Gate line carry a **success verdict**" (RATIFY/ACCEPT/APPROVE, or AMEND in its
amended form — one success set, defined in the ballot's vocabulary line; no gate checks an
exact token), never "the ballot is closed" — see Q-00's acceptance. A row whose Gate line is
marked **outcome gate** is the exception: it is eligible on any recorded verdict except DEFER
— it executes the recorded outcome rather than requiring success — and Q-00's blocked-marking
rule does not apply to it.

**Failure counters are repo state:** each row carries a `failures:` count in this frontmatter
(absent = 0 is the declared default, so rows need no initial field) and the programme the
`zero_progress_streak:` field **explicitly initialised in this frontmatter** — the
kill-switch counter is never read through an absence default, so a deleted or missing value
is observable drift rather than a silent zero; every firing increments or
resets them as part of its landing, so a fresh session can evaluate the ADR-051 clause 6
thresholds. The landing has a merge path in every case: a firing driving a slice carries the
counter update in that slice's PR; an idle or deferring firing lands it as a dedicated
**bookkeeping PR** (scope: counter, incident, and continuity state only, no product code;
incident records added per QD-5, 2026-08-23) — or, when a
non-draft programme PR is already open (WIP = 1 forbids a second), as a bookkeeping-scope
commit (counter, incident, and continuity state)
pushed to that open PR's head branch, which reaches the base at that PR's merge — or, when
that open PR is contested under the routine prompt's overlap guard, on the **single
shared deferral-draft** bookkeeping PR (not WIP, touching no contested ref, reused across
stacked deferrals so each firing's increment lands exactly once) that the first firing to
find the contest cleared marks ready and merges; a
completion summary is never a counter's landing surface. **Incident records share this
landing path (QD-5)**: [`incidents.md`](./incidents.md) is the programme's incident
register — collisions, retry exhaustion, environment anomalies, and stand-down broadcasts'
durable copies land there, because a report is durable only as tracked state reachable
from the loop's grounding path (the base, or the open programme PR's head); instance-tier
comms state and unmerged session side branches are not reporting surfaces. The
bookkeeping PR's authority is **ADR-051 clauses 6 and 3 together**: clause 6 mandates the
persistence ("persisted and reset by each firing", concrete surface delegated to this
plan), and clause 3 — as amended by the owner's QD-3 ruling (2026-08-22, resolving the
scope gap review surfaced on PRs #33/#34) — grants the unattended merge to every non-draft
programme PR, bookkeeping included, at the same bar (every check green on the head, every
conversation properly and proportionately resolved — fixed or rejected, base not diverged,
diff within the bookkeeping scope). The ruling's basis: the owner sets the conditions that
make a merge safe and does not approve individual merges — a routine merge requiring owner
intervention is a defect in the loop. A bookkeeping PR is not a slice PR — merging one is never substantive
progress and never resets the streak — so idle increments reach the shared base without
defeating the kill switch. The streak resets only on **substantive progress** — a slice PR merged, a new
commit advancing a claimed slice, a queue row completed, a head-repair fix landed, or a new
queued decision recorded; the bookkeeping every firing performs regardless of progress
(completion notification, continuity/handoff, the counter landing itself) never resets it,
so an idle firing always increments the streak and the clause 6 kill switch stays reachable.
A row's success resets its `failures:` count. Q-01's dry run proves cross-session read/write
of both counters.

**Why the Q-00 gates exist:** Q-02–Q-07 are gated by the **standing 2026-06-19 roadmap
sequencing order** (transplant first), which only ballot item B-11 may supersede — NOT by
T00a; the report certifies all of them parallel-safe with the T00a walk itself (§6 named
exceptions, §15.4 step 2). Q-13 (the #23 disposition) executes the B-11 outcome itself. Q-10 is gated by T00a proper
**and by Q-14** (`depends_on`) — the doctrine wave lands before charter-consuming work.
Q-01, Q-08, and Q-09 predate no standing order and are eligible immediately.

### Slice briefs

Each brief is the delegation contract for a zero-context firing: surface, non-goals,
acceptance (with proof level), and the source to re-derive detail from. A firing re-verifies
the brief's premises against live state before executing; a slice whose premises moved is
re-adjudicated, not executed.

**Q-00 — W-0 owner walk.** Surface:
[`ballot-2026-08-owner-walk.md`](./ballot-2026-08-owner-walk.md) verdicts + the follow-up
landing that synchronises authority surfaces. Non-goals: no product code. Acceptance
(`non-code`): every ballot item carries a verdict; ADR-051 status updated per the atomic
B-12 rule; affected surfaces (roadmap, prompts, active-lane banners) synchronised in the
same landing; ballot marked CLOSED; and every success-gated queue row whose required Gate items lack a
success verdict is marked `blocked` in this frontmatter with the declining verdict
named. **Closure is not ratification**: Q-00 reaching `complete` unlocks a dependent row
only when that row's named Gate items carry success verdicts — a REJECT or DEFER on a required
verdict leaves the row `blocked` for scheduled and owner-driven execution alike, pending
re-ballot or re-plan. Source: report §7 T00a.

**Q-01 — Loop readiness.** Surface: SessionStart hook / environment setup (pinned gitleaks
8.30.0 install), `routine-prompt.md` in this collection, the Routine itself. Non-goals: no
product code; no queue slice execution during the dry run. Acceptance (`e2e`, observed): a
fresh container completes the full blocking hook chain unattended; the cron Routine is
created **disabled** in fresh-session mode and fired once manually; the spawned session
executes the prompt's no-op path (STOP-check → report → handoff), posts the dry-run's
stand-down broadcast (loop identity, criterion "dry-run complete", one-line closeout) per
`loop-exit-criteria-required` — proving the comms-echo half of the broadcast path ADR-051
clause 6 requires on every firing-side loop exit (the tracked-record half postdates this
proof: QD-5, 2026-08-23, under which dry runs stay comms-echo + completion-summary only) —
and the completion notification reaches the owner. (Platform
premise verified live 2026-08-22: create_trigger → immediate disable → manual fire_trigger
spawned a fresh session while the Routine stayed disabled for scheduled firings.) The
Routine then stays **disabled** until Q-00 closes — or, when Q-00 is already `complete`
with success verdicts on B-12, B-13, and B-16, is **enabled** under the ballot's after-walk
rule instead: the enable is order-independent, performed by whichever of Q-00 closure and
this slice's proof lands second, so neither ordering strands the Routine disabled after
full authorisation.
**Enabling sequences strictly after this slice's own PR merges**: an enabled Routine with
Q-01's PR still open could drive or re-claim the very slice arming it, so the enable step
(with the B-15 notification configuration re-checked: push and email on, no digest) is the
last act of the Q-01 firing, performed only once the merged base carries the row's
`complete` state. The enable step applies the recorded
B-15 outcome to the Routine's notification configuration **before** enabling — including
disabling routine completion-notification delivery on a B-15 REJECT — so the running loop's
channels always match the accepted ADR's clause 7. A B-15 REJECT strikes clause 7's routine
notifications only: the escalation notifications accepted clause 6 itself mandates (the
zero-progress disable, a failed red-head repair, a blocked-slice stop) keep their delivery
channel regardless, because striking clause 7 does not strike clause 6's notify duties. The
pre-verdict dry run may prove the notification mechanism with delivery on, as a bounded
one-firing proof, without pre-empting that verdict. Evidence note: the platform surface
(fresh-session-per-fire Routines with completion notifications) is confirmed against the live
platform API in the authoring session; this slice proves the end-to-end behaviour.

**Q-01 evidence record (completed 2026-08-22).** Shipped: the gitleaks SessionStart
provisioning hook + single-sourced pin (`.claude/hooks/_lib/gitleaks-pin.env`, CI
secret-scan reads the same pin) + `findGitleaksPinDrift` in the drift validator (15
red-first tests), and [`routine-prompt.md`](./routine-prompt.md) as the standing firing
brief. Routine mechanism proven end to end across four firings:

- Probe firings 1–3 (loop Routine, manual `fire_trigger`): fresh cloud sessions spawned as
  designed, but **a Routine created via the API carries no repo sources** — `create_trigger`
  cannot attach repos or connectors, so the fired sessions were read-only and landed
  nothing. The fix is owner UI configuration ("Runs with" on the Routine): division of
  labour recorded — the agent creates/updates Routines, the owner attaches the repo, once
  per Routine.
- Kingfisher proof firing (owner-configured test Routine `trig_014yUGodczfAVVxfq4oftiQ9`
  with the castr repo attached, fired 17:51 UTC): the spawned session grounded read-only in
  the repo, exercised the GitHub MCP tool surface (available), and **pushed its capability
  report with repo credentials** (`routine/loop-test-kingfisher` @ `689eb9e`, report
  conserved at [`loop-test-kingfisher-report.md`](./loop-test-kingfisher-report.md)) —
  the credentialed-landing premise the whole loop stands on, observed. Completion
  notifications reached the owner on push, email, and Slack (owner receipts, platform
  "3 of 3 succeeded").
- Known remainders, owned by Q-15 (none block arming): Kingfisher fired against a base
  that predates this slice's hook, so it measured gitleaks absent and `agent-tools/dist`
  unbuilt — post-merge firings get the provisioning hook and its dist warning; a pristine
  checkout has **no git hooks wired until `pnpm install` runs** (commits bypass every
  gate); fired sessions derive their Practice identity from the raw `session_…` id
  (degenerate `sessio` prefix) — seed derivation fix queued to Q-15's gap list.
- Arming: the loop Routine `trig_01X4wYy2gHSb8yFhdhwbADGF` (cron `3 */8 * * *`, three
  firings/day per amended B-12) is enabled as the last act of this slice, strictly after
  its PR merges, with the B-15 configuration (push + email, no digest) re-checked at
  enable.
- Owner action completed (2026-08-23, QD-5 conversation): the Routine's session model is
  now Fable, changed in the Routine's own settings UI (the only safe route — recreating
  the trigger via API loses the owner-attached repo source, measured above). In the same
  settings pass the owner turned the platform's "Auto-fix pull requests" behaviour OFF:
  no platform-side watcher pushes fixes to PRs a firing opens, so each firing explicitly
  monitors and reacts to PR state (CI, review threads) itself, per the
  `engraph-pr-lifecycle` skill and ADR-051 clause 4 — and one candidate source of
  second-writer pushes on a routine-opened PR is gone.
- Owner direction (2026-08-23, same conversation): git/GitHub attribution for these
  routines on the EngraphCode fork uses the **default credentials** — the separate
  `jimbot` identity is an Oak-specific convention and is not brought here. Agents still
  self-identify inside comment bodies and commit trailers per the standing PR rules
  (PDR-027 identity in replies; the Claude Code attribution footer).

**Q-02 — Pre-T01 harness extraction.** Surface: artifact-agnostic runner mechanics extracted
from PR #11 (outcome records, non-vacuity checks, mutant-bite ritual) into the existing
`lib/tests-transforms` estate — the 2026-07-06 scout proved the substrate exists; extend, do
not fork a second runner. Non-goals: no profile/artifact-kind binding, no format-lane
expectations, nothing that pre-empts the product boundary. Acceptance (`integration`): seeded
wrong-parser/wrong-writer/vacuous-witness mutants are detected; suite green via `pnpm check`.
Source: report §11.3 #11. Gate: B-11 (success verdict).

**Q-02 evidence record (completed 2026-08-23).** Shipped:
`lib/tests-transforms/utils/semantic-outcome-runner.ts` — a pure, artifact-kind-agnostic
runner (`SemanticCase`/`runSemanticOutcome`/`runAllSemanticOutcomes`/`expectSemanticOutcome`)
extracting PR #11's outcome-record and non-vacuity concepts per the report's #11 disposition
(§11.3, ~L2120), without its OpenAPI/`CastrDocument`-specific runner — cases inject their own
`parse`/`write`/`reparse` plus independent source/target oracles, so the module binds to no
product profile or artifact kind. Non-vacuity is structural, not opt-in: every case declares a
`separatingSource`, and the runner recomputes discrimination against it on all three legs
(`equalIR`, and `equalOracle` on both the source and target oracles) rather than trusting a
self-reported flag. Every case-supplied callback — all seven: `sourceOracle`, `parse`, `write`,
`targetOracle`, `reparse`, `equalIR`, `equalOracle` — receives its own independent clone at
every call (`structuredClone` by default, or a case-supplied `cloneSource`/`cloneIR`/
`cloneOutput`/`cloneOracle` override for values `structuredClone` cannot safely clone), taken
directly from the value the runner still trusts as ground truth, immediately before that one
call; no clone is ever reused across two calls. A mutating case therefore cannot corrupt the
case object across repeated runs, taint a comparison the runner still needs to make, corrupt a
returned artifact, or leak into a different callback's (or a later call to the SAME callback's)
supposedly independent view of "the same" value. Proof:
`lib/tests-transforms/__tests__/semantic-outcome-runner.integration.test.ts` is the mutant-bite
ritual — a happy-path positive control plus 7 seeded mutants (wrong-parser, wrong-writer,
bypassed-writer/echo, absent-artifact, vacuous-IR-equality, vacuous-oracle-equality,
vacuous-witness), a mutation-safety/repeatability regression case exercising all seven
callbacks, a pair of branded class-instance IR cases (one proving the default `structuredClone`
throws, one proving a case-supplied `cloneIR` fixes it), a shared-parse/reparse retained-object
case, a poisoned-diagnostics case (an artifact whose `JSON.stringify` and `String()` coercion
both throw), and an empty-registry hard-fail, all red-first (module-not-found, or the documented
throw for the branded-IR/poisoned-diagnostics cases) then green, 19/19 passing.

Two pre-execution reviews (`architecture-expert-fred`, `test-reviewer`) shaped the design before
any code was written. Three post-execution gateway reviews (`code-reviewer`, `test-reviewer`,
`type-reviewer`) then found two independently-confirmed critical issues (a target-oracle
non-vacuity hole, and `expectSemanticOutcome` gating on vitest's own structural equality instead
of each case's injected comparators) plus one test-isolation issue — all fixed before the PR
opened. Once open, sixteen rounds of automated PR review (Codex, Copilot) progressively closed
the full mutation-safety surface (rounds one through nine), then two test-authoring-rule findings
and a diagnostic-formatting mutation gap that took five rounds to close fully (rounds ten
through sixteen), the last two of which replaced the mutation-prone fallback chain with a single
descriptor-based formatter and extended its discipline to array indices: each round's fix
protected the callbacks it was shown to be
missing, and the next round's hand-tracing found the next narrower leak — ordering
(`sourceOracle`/`targetOracle` before `parse`/`reparse`), the round-trip baseline
(`write` mutating `ir`) and case repeatability (`parse` mutating `source`), the two remaining
single-call leaks (`reparse` mutating the returned `output` artifact; `sourceOracle` mutating
`source` before `parse`'s own clone was taken), the cross-call leaks (`equalIR`/`equalOracle`,
each invoked more than once on a value also returned in `artifacts`), and a retained-alias leak:
`write` was still called with `ir`/`separatingIR` themselves rather than a clone, so a memoising
`parse` that keeps its own reference to the IR it returned could observe `write`'s in-place
mutation on a second run of the same case (`write` now receives a `structuredClone` of
`ir`/`separatingIR` at each call site, and the mutation-safety test grew a closure-captured
`retainedIRs` array — modelling a memoising parser's cache without adding branching/stateful
logic to the fake — asserting the retained references stay pristine). The sixth round was a
different root cause, not a narrower instance of the same one: `structuredClone` silently
de-brands class-instance values, dropping the prototype and any brand, so it cannot safely clone
this repo's own `CastrSchema`/`CastrSchemaProperties` IR — confirmed empirically (a probe script
cloning a branded class instance loses its methods) before fixing. Rather than special-casing
`CastrSchema`, `SemanticCase` grew optional `cloneSource`/`cloneIR`/`cloneOutput`/`cloneOracle`
overrides (defaulting to `structuredClone`, mirroring the existing case-supplied-callback
pattern) so a case can substitute a clone that preserves its own branded type. Two new tests
prove the failure mode and the fix: one shows the default `structuredClone` throws when `write`
calls a method on a branded IR class instance, the other shows a case-supplied `cloneIR` fixes
it. The seventh round returned to the mutation-safety surface with a variant the sixth round's
different focus had left unexamined: `sourceOracle`/`targetOracle` are each called twice (main
and separating channel), and neither call's result was snapshotted immediately on return —
unlike `pristineIR`/`pristineOutput`, which already were. A stateful oracle that returns the
same mutable object on both calls (analogous to the fifth round's memoising `parse`) would let
its second call silently corrupt the first call's already-returned value before anything
downstream cloned it — confirmed empirically with a probe script before fixing. Both oracle
results are now snapshotted with `cloneOracle` immediately on return, matching the existing
pristine-snapshot pattern; the mutation-safety test's `sourceOracle`/`targetOracle` fakes were
changed from returning a fresh object per call (which could never exhibit this aliasing bug) to
mutating and returning one retained shared object across both calls — the minimal shape able to
prove the defect — and confirmed via `git stash` isolation that the existing
`sourceOracleValue`/`targetOracleValue` artifact assertions fail against the pre-fix code and
pass against the fix. The eighth round found the last instance of the same pattern: `reparsedIR`
was the one remaining value not snapshotted immediately on return — `reparse` is called once,
but a real parser/reparser pair may share one memoising implementation (`reparse` inverts
`parse`), so the SEPARATING channel's later `parse` call could overwrite the object `reparsedIR`
still pointed to before `roundTripEqual`/`artifacts.reparsedIR` ever read it — confirmed
empirically with a probe script before fixing. `reparsedIR` is now snapshotted with `cloneIR`
immediately on return, and a new dedicated test (`parse`/`reparse` sharing one retained,
mutated-in-place object — the minimal shape able to prove the defect, since two calls returning
fresh objects never alias) confirmed via `git stash` isolation to fail against the pre-fix code
and pass against the fix. The ninth round found one more genuine robustness gap, this time in
`describeForDiagnostics` itself: its `String(value)` fallback (added to survive
`JSON.stringify` throwing on circular/`bigint` values) can itself throw for an artifact whose
own string coercion also throws, and since `expectSemanticOutcome`'s failure-message templates
call it unconditionally as eagerly-evaluated template-literal arguments — even for a genuinely
passing case — that second throw would crash `expectSemanticOutcome` outright rather than
report a semantic mismatch. Confirmed empirically (a poisoned object with throwing
`toJSON`/`toString`) before fixing. `describeForDiagnostics` now guards the `String(value)`
fallback with its own try/catch, returning a constant description if both formatting attempts
fail; a new test proves a poisoned-diagnostics case no longer crashes `expectSemanticOutcome`,
confirmed via `git stash` isolation to fail against the pre-fix code and pass against the fix.
Across all nine rounds, all seven callbacks were confirmed to receive an independent clone at
every call, with every one of their return values now snapshotted immediately on return wherever
a later call to that same callback (or a callback sharing its underlying implementation) could
otherwise overwrite it — no narrower leak left to find on the mutation-safety surface, and the
clone mechanism itself is now confirmed to work for branded, non-plain-data artifact types — the
kind Q-02's own "artifact-agnostic rework of PR #11's mechanics" brief exists to support. Also
fixed along the way: a missing vacuous-witness mutant (case data
that fails to separate under otherwise-correct comparators, distinct from a vacuous comparator),
a bypassed-writer mutant that was accidentally input-independent (reshaped to genuinely echo its
own IR, producing a distinct failure signature from the wrong-writer mutant instead of
duplicating it), branching/input-interpolating logic in error-message construction inside the
shared test fixture (`test-immediate-fails.md` item 12 — detection belongs in the runner, not the
fake), a `JSON.stringify` crash risk on circular/`bigint` oracle values in diagnostic messages,
and missing mandatory `@example`/`@see` TSDoc on the public API. Three findings were verified and
declined rather than actioned, each with reasoning posted on its thread rather than a silent
skip: an async runner variant matching the report's fuller Tranche-01 §5.3 contract is deferred
to Q-11, which explicitly consumes this Q-02 extraction — building it now risks the
second-runner fork this brief forbids before a real async consumer exists to derive the actual
signature from; a repeated claim that the fixture's core marker-prefixing `write` mapping itself
violates the no-fake-logic rule is held to be a misapplication of a rule aimed at opaque
dependency mocks (canonical examples: logger, HTTP client) to a fixture that IS the minimal data
flow the runner's proof depends on — the repo's own `test-reviewer` reviewed this exact line
across all four rounds and flagged only the (now-fixed) error-message interpolation, never the
transformation itself; and, in the ninth round, a claim that the mutation-safety test's
closure-retained, mutate-and-return oracle fakes (added in the seventh round specifically to
reproduce a stateful-oracle aliasing bug that same reviewer reported) are themselves a
"state machine" barred by `test-immediate-fails.md` item 12 — declined as the same category of
misapplication: the retained-and-mutated state is not incidental scaffolding but the exact
mechanic under proof (the runner's documented guarantee that it correctly isolates a stateful
case), the fake performs no branching and takes no more than one input-dependent step per call
(matching the item's "captured calls" allowance, not its "state machine" prohibition), and the
closely analogous `retainedIRs` pattern from the fifth round survived four further review rounds
unflagged. Held as a genuine rule-interpretation disagreement rather than a correctness defect —
per ADR-051 clause 4, only correctness/security/data-loss defects are blocking in every round;
declining a non-blocking refinement after this many rounds of otherwise-converging review is the
carry-forward path clause 4 itself describes, and a bot revisiting the very proof mechanism it
asked to be built is the "findings no longer converging" signal for stopping. The substance of
both declined marker-mapping/stateful-fake findings is queued at
[QD-4](./queued-decisions.md) per clause 4's "queue entry for the substance" requirement, so a
stricter owner reading of `test-immediate-fails.md` item 12 can apply to future semantic-fidelity
fakes without re-litigating this PR. A tenth round flagged a genuinely separate item-14 issue —
the "runs every registered case" test asserted its two proofs inside a `for` loop, which is
literal test-authored control flow around assertions regardless of the fixed, known-size array
it iterated — fixed by replacing the loop with two explicit assertions against the destructured
`first`/`second` proofs, initially guarded by an `if`/`throw` for the `undefined` narrowing
`noUncheckedIndexedAccess` requires before either proof reaches `expectSemanticOutcome`'s
non-optional parameter. An eleventh round immediately flagged that same `if`/`throw` as its own
item-16 "runtime branching inside the test body" violation — correct on the letter of the rule,
even though the branch is dead code in practice (`runAllSemanticOutcomes` on a fixed two-case
array always returns exactly two proofs). Fixed by replacing the `if`/`throw` with
`node:assert`'s TypeScript-typed assertion-function form (`assert(x !== undefined, msg)`, which
`@types/node` declares as `asserts x`): a single function call, not a branching construct, that
TypeScript's control-flow analysis still narrows on — satisfying both the type system's
non-optional requirement and item 16's prohibition on visible conditional syntax in the test
body. A twelfth round returned to `describeForDiagnostics` itself (product code, not
test-immediate-fails-governed): its failure-message templates called it directly on the
retained `proof.artifacts` values, so an oracle or IR artifact with a mutating `toJSON` method
or enumerable getter would corrupt that same retained artifact merely by being formatted for
display — defeating the documented "artifacts stay pristine for post-hoc diffing" contract.
Two changes close this. First, root-cause: `expectSemanticOutcome`'s three checks became
`if (!condition) throw new Error(...)` instead of `expect(condition, message).toBe(true)`, so
each message — and the `describeForDiagnostics` calls inside it — is only built once its own
check has actually failed, not unconditionally for every proof as the ninth round's fix left it;
a passing proof's artifacts are now never even passed to the formatter (this also let the
module drop its `vitest` import entirely, since nothing in it calls `expect` any more).
Second, `describeForDiagnostics` now formats a `structuredClone` of its argument, never the
argument itself — `JSON.stringify` invokes a `toJSON` method if the value passed to it has one,
and `structuredClone` produces a plain-data copy with no such method to call. Because
`structuredClone` itself throws for exactly the kind of value with this vulnerability (an own
function-valued property, which a `toJSON` method is), the fallback on that throw is a new
`omitFunctionProperties` helper filtering out own function-valued properties via
`Object.entries`, which reads the property without invoking it, so a mutating `toJSON`'s body
never runs. Confirmed empirically before fixing (a mutating-`toJSON` probe corrupted the
retained value on the pre-fix code); the existing ninth-round test was rebuilt around a
genuinely failing (not passing) case, since the new lazy evaluation means a passing case no
longer reaches `describeForDiagnostics` at all, and a new test proves a mutating-`toJSON`
oracle's `proof.artifacts` values stay pristine after a failure diagnostic is built — confirmed
via `git stash` isolation to fail against the pre-fix code and pass against the fix. A mutating
_getter_ (as opposed to a mutating `toJSON` method) remains a residual, inherent limitation:
reading a property to know its current value is unavoidable for any serializer, `structuredClone`
included, so this is documented rather than chased further. A thirteenth round found that
round twelve's fallback snapshot was only one level deep — a nested value with its own mutating
`toJSON` (not the top-level artifact's) still leaked through as a live, unsanitised reference,
so `JSON.stringify` still reached and invoked it. Confirmed empirically before fixing (a probe
with a nested mutating `toJSON` reproduced the corruption exactly as reported). `omitFunctionProperties`
is now genuinely recursive — it strips function-valued properties at every depth, not just the
top — and cycle-safe: a value already seen higher in the same recursion is replaced with a
`'<circular>'` placeholder rather than returned as the original live reference, so a circular
structure can never reintroduce an unsanitised alias back into the snapshot. A new test with a
two-level mutating-`toJSON` structure (an outer value whose own `toJSON` forces the
`structuredClone` fallback, wrapping a nested value with its own separate mutating `toJSON`)
proves the nested value also stays pristine; confirmed via `git stash` isolation to fail against
the pre-fix (one-level) code and pass against the fix. A fourteenth round found that round
thirteen's fix had, as a side effect, made the ninth round's own regression test vacuous for the
guard it was named for: `omitFunctionProperties` now strips a poisoned `toJSON`/`toString` pair
before `JSON.stringify` ever runs, so that test's fixture no longer reached the `String(value)`
fallback at all — it would still pass even with that fallback's own `catch` deleted, since
`JSON.stringify` on the sanitised (function-free) snapshot now succeeds outright. Tracing this
surfaced a second, more serious gap alongside it: sanitising can itself throw (reading every
property to know what to strip means a throwing getter surfaces during sanitisation, not just
during formatting), and that failure mode wasn't caught anywhere, so `describeForDiagnostics`
could crash uncaught rather than degrade gracefully. `toSafeDiagnosticValue`'s sanitisation
fallback now has its own `catch`, returning the original value if sanitising itself throws.
Rewrote the ninth-round test's fixture to add a throwing getter alongside the existing
poisoned `toJSON`/`toString`, so the full cascade is genuinely exercised — `structuredClone`
fails (the getter breaks the read needed to clone), sanitisation fails the same way, then
`JSON.stringify` fails on the raw value's `toJSON`, then `String()` fails on its `toString` —
finally reaching the constant fallback, which the test now asserts on directly (not only the
wrapping semantic-mismatch text, which would have passed even with the crash this round found).
Confirmed empirically that this exact cascade occurs before fixing, and via `git stash`
isolation that the rewritten test fails against the pre-fix code (the getter's raw error message
leaking through uncaught) and passes against the fix. A fifteenth round found that the
fourteenth round's own fix — the sanitisation fallback returning the _original_ value when
sanitising itself throws — reintroduced exactly the live-reference exposure the twelfth round
had closed, for the one combination not yet tried: a mutating `toJSON` alongside a throwing
getter on the same artifact. Sanitising reads every property (via `Object.entries`) to know what
to strip, so the throwing getter makes sanitisation itself throw; the fallback-of-the-fallback
then handed `JSON.stringify` the raw, live artifact, whose (unstripped, since never reached)
`toJSON` ran and mutated it. Confirmed empirically before fixing (a probe script showed
`safeValue === fixture`, `JSON.stringify` succeeding, and `fixture.value` left mutated). This was
the sixth consecutive round narrowing the same `describeForDiagnostics` concern, each round's fix
leaving one narrower gap for the next round to find — a whack-a-mole pattern rather than a
converging one, since every fallback layer that calls into caller-supplied code is one more
pathological artifact away from failing the same way. Rather than patch another instance,
`toSafeDiagnosticValue`/`omitFunctionProperties` were replaced outright with a single walker that
reads every own property strictly via `Object.getOwnPropertyDescriptor`: a data property's
`.value` is read directly (never a function call) and recursed into; an accessor property is
represented as the placeholder string `'<getter>'` without ever calling its `get`; a
function-valued property is omitted, matching how `JSON.stringify` would have dropped it anyway.
No code path in the walker invokes anything the artifact itself defines, so no `toJSON`,
`toString`, `Symbol.toPrimitive`, or getter — mutating or throwing — can ever run during
diagnostic formatting; this closes the entire vulnerability class structurally rather than
narrowing it further. The one residual case where the walker's own property-enumeration can
still invoke caller-defined code is a `Proxy` with a throwing `ownKeys`/`getOwnPropertyDescriptor`
trap; `describeForDiagnostics` keeps a guard for that case, but its fallback is now a fixed
placeholder string, never the live artifact, so no path exists any more from a formatting failure
back to a raw reference. The ninth-round poisoned-diagnostics test was rewritten: the scenario it
guards no longer reaches any fallback at all (formatting succeeds on the first attempt, since
nothing poisoned is ever invoked), so it now asserts the success case directly — the message
contains the `'<getter>'` placeholder and never the poisoned members' thrown text. A new test
reproduces the fifteenth round's exact combination (mutating `toJSON` plus a throwing getter on
one artifact) and asserts `proof.artifacts` stays byte-for-byte pristine after the diagnostic is
built; confirmed via `git stash` isolation that both the rewritten and the new test fail against
the pre-fix code and pass against the fix. A sixteenth round found that the fifteenth round's new
walker had one branch the property-descriptor discipline never reached: array elements were still
read via `.filter()`/`.map()`, ordinary property access that invokes an accessor defined at a
numeric index, the same class of gap the walker had just closed for object properties — a getter
at an array index could still run (and still mutate) while a failure diagnostic was built.
Confirmed empirically before fixing (a probe script with a throwing getter at index 1 of a
three-element array showed the getter invoked, and the outer catch masking the resulting throw
only after the mutation attempt had already run). Fixed by extracting the shared
descriptor-to-value logic (accessor → `'<getter>'` placeholder without calling `get`;
function-valued → omitted; otherwise recurse into `.value`) into one
`resolveSafeDiagnosticMember` helper, and routing both branches through it: the array branch now
reads each index via `Object.getOwnPropertyDescriptor(value, index)`, exactly as the object branch
already read each key, so no property — object key or array index — is ever read through ordinary
access that could trigger an accessor. A new test reproduces the array-index case (a throwing
getter at index 1, reached from an oracle's `tags` array) and asserts the getter is never invoked
and the diagnostic still formats successfully (a `'<getter>'` placeholder at that index, not a
crash or fallback placeholder); confirmed via `git stash` isolation that it fails against the
pre-fix code and passes against the fix.

A seventeenth round, reviewing the sixteenth round's fix, produced two fresh P2 findings on
the same walker — traversing a `Proxy`-backed artifact still runs its
`ownKeys`/`getOwnPropertyDescriptor` traps (which can mutate silently before the existing
guard's placeholder fallback engages), and a function-valued array slot is dropped by the
array branch's `flatMap` rather than held in place as `JSON.stringify`'s `null` would be.
Both were verified real against the landed code and both are diagnostics-only (proof
verdicts are computed before any diagnostic formatting runs, so neither can change an
outcome). Seventeen rounds is the non-convergence signal ADR-051 clause 4 exists for: both
findings were carried forward as queue row Q-17 (its brief holds the fix shape and
acceptance), with the disposition recorded on each thread rather than an eighteenth
fix-and-rereview cycle on this PR. The sixteenth round's array-descriptor thread — already
fixed on the head in the same round — had been left unreplied when the prior firing hit its
landing cutoff; the reply and resolution were posted in this round's disposition pass.

Full `pnpm check:ci` green (gitleaks, build, format, type-check, lint, madge, depcruise, knip,
markdownlint, portability, packaging, skills, agents, repo-validators, `test:all`) — run on
every landed revision. Scope held to Q-02's narrower slice throughout: no profile/artifact-kind
binding, channel/fixture-manifest machinery, or product-code changes — those remain Tranche 01's
job (report §7, ~L795-850).

**Q-03 — F-01 security AND→OR.** Surface: `buildIRSecurity` and the flat
`IRSecurityRequirement` model (IR-model change per review R3), parser+writer+persistence.
Non-goals: no broader security-lane work (Tranche 06 owns it). Acceptance (`integration`):
red-first formula-preserving proof through public parse/write seams — `{A AND B}` vs
`A OR B` distinguishable end to end; `pnpm check` green. Source: report F-01;
remediation-02 plan. Gate: B-11 (success verdict).

**Q-03 evidence record (completed 2026-08-24).** Shipped: the F-01 fix as an IR-model change —
`IRSecurityRequirement` is now a requirement group (`{ schemes: IRSecuritySchemeRequirement[] }`,
AND within a group, OR across the `security` array; new member type exported through all five
barrels), with the parser (`buildIRSecurity`: map, not flatMap; the spec's empty requirement `{}`
now survives as a schemes-empty group; `scopes ?? []` replaced by a fail-fast boundary throw),
one shared order-preserving writer (`writers/openapi/openapi-writer.security.ts`, replacing two
byte-identical sorted implementations; emits `{}` for empty groups; throws on a duplicate scheme
name within one group — unrepresentable as a JSON key), the MCP resolver (`resolveRequirement`
maps a group to its full scheme set; `isPublic` is true when any set has zero schemes — the
anonymous-access alternative — with all sets retained as optional credential upgrades, and the
raw-OpenAPI resolver aligned to the same rule and the same scopes fail-fast so the shared
`OperationSecurityMetadata` contract has one invariant), and persistence-boundary validation
(`ir/validation/security/validators.security.ts` wired into `isCastrDocument` /
`isCastrOperation` / `isCastrAdditionalOperation`; a stale flat-shape persisted IR now fails
`deserializeIR` loudly, and a group naming one scheme twice is rejected so "valid" coincides
with "writable"). Proof (red-first): `lib/tests-transforms/__tests__/security-formula.integration.test.ts`
runs five cases through public `buildIR → writeOpenApi → buildIR` seams via the Q-02
semantic-outcome-runner with `cloneIR = deserializeIR ∘ serializeIR` (every case also proves the
formula survives IR persistence): operation-level AND vs OR, document-level AND vs OR, the
spec's optional-security mixed form `[{}, {oauth: […]}]`, duplicate alternatives (positive
control), and authored alternative order. Pre-fix, four cases failed the runner's structural
non-vacuity precheck — the pipeline collapsed each separating pair, exactly F-01's shape — and
the positive control passed; post-fix 5/5 green. Unit coverage: parser
(`builder.operations.fields.unit.test.ts`), shared writer, validators (document/operation/
additional-operation guards, stale-flat rejection at the `deserializeIR` seam), both security
resolvers (empty-requirement `isPublic` pinned on the IR and raw paths), and the re-pinned
writer determinism test (IR order, replacing the sort that the tictactoe fixture pair proves
was itself order-lossy). The `samples.test.ts.snap` diff is the fix manifest in generated MCP
metadata: `multi-auth.yaml`'s authored AND-group (`OAuth2 + ApiKey`) now emits as one
requirement set of two schemes where it was two OR alternatives.

Reviews: two pre-execution dispatches (`code-reviewer`, `openapi-expert` — the expert's
verdicts fixed the design before code: group order preserved rather than canonically sorted,
`{}` preservation required, `scopes` fail-fast, injective-key hazards avoided by not sorting)
and four post-execution dispatches (`code-reviewer`, `test-reviewer`, `type-reviewer`,
`mcp-expert`), all findings fixed in-slice or explicitly routed. Routed, not fixed here
(recorded so "security round-trips" is not read as closed):

- **Writer drops `security: []`** (operation-level explicit-public override re-inherits
  document security on write; document-level `[]` equals absent per spec) — security lane,
  Tranche 06.
- **Raw-vs-IR resolver duplication**: `resolveOperationSecurity` (raw path) has no product
  caller; when the security lane opens, prefer deleting it over maintaining two aligned
  implementations (`replace-dont-bridge`).
- **3.2 URI-form security-requirement keys** resolve against component names only in both
  resolvers (throws for URI keys) — security lane.
- **Normalized-fixture estate is unregenerable**: `lib/scripts/generate-normalized-fixtures.ts`
  output breaks 11 validation-parity tests (checked-in `zod.ts` fixtures predate the
  generator's int64/strictObject migrations), so the checked-in `ir.json`/`ir2.json` for
  tictactoe/oak-api still carry the now-invalid flat security shape (nothing deserialises
  them; tictactoe's `ir.json` vs `ir2.json` differ only by the old alphabetical sort — a
  preserved fossil of the removed defect). Fixture-regeneration integrity needs its own slice
  before any fixture-consuming lane.
- **Public-API note for the owner's next release decision**: `IRSecurityRequirement` is
  exported from `lib/src/index.ts`, so this is a breaking shape change at the next release;
  package versioning is a release-scope owner decision (none taken here). The IR's own
  schema stamp is handled in-slice per review: `IR_SCHEMA_VERSION` (2.0.0, single-sourced,
  both parsers) and `deserializeIR` pins it — any foreign version (older or future) is
  rejected before structural acceptance with both versions named, so a stale or
  future-shaped persisted IR can never be partially read. No migration machinery exists
  or is promised; regenerate from source.
- **`__proto__`-named component hazard across writer maps (carry-forward)**: a security
  scheme legally named `__proto__` now survives requirement emission (own-property
  `Object.fromEntries`, regression-tested), but the component-declaration maps — e.g.
  `result.securitySchemes[component.name]` in `openapi-writer.components.ts` — and every
  sibling keyed-object insertion across the writers still hit the inherited prototype
  setter, silently dropping such a component. Pre-existing, spans all component families
  (an unbounded reference surface for this slice); routed to the writer-hardening lane at
  the Q-12 split rather than chased map-by-map here (ADR-051 clause 4 disposition,
  recorded on the PR #50 thread).
- **Doctrine conflict carried, not widened**: the parser/writer boundary uses
  `Object.entries`/property enumeration, which §Type System Discipline's `Object.*` clause
  forbids; per the owner's 2026-08-23 ruling the doctrine stands and a lint-enforced
  remediation lane enters at the Q-12 split — this slice kept the count stable (same sites,
  consolidated writers).

Full `pnpm check` green on the landed tree; scope held to the F-01 defect throughout — no
broader security-lane work.

**Q-04 — F-03 nested Boolean schemas.** Surface: the properties-path parse callback lacking
the boolean branch (`json-schema-parser` object fields vs the `if/then/else` handler).
Non-goals: no full Tranche 05 position matrix. Acceptance (`integration`): red-first proof
that nested `false`/`true` survive at the defective positions; `pnpm check` green. Source:
report F-03. Gate: B-11 (success verdict).

**Q-05 — F-04 placebo refinements + nested Zod loss.** Surface: the two `return true` sites
in `writers/zod/refinements/object.ts` (`:130`, `:183–187` per the 2026-07-06 scout — leave
the real refinements alone) become fail-fast; nested unsupported Zod members fail the
containing declaration. Non-goals: no Tranche 07 grammar work. Acceptance (`integration`):
red-first proofs for both behaviours; `pnpm check` green. Source: report F-04. Gate: B-11 (success verdict).

**Q-06 — #14 extraction + closure.** Surface: dependency-only Draft-04 AJV slice; PR #14
closure with commit/file-level verification in the closing commit and closure note.
Non-goals: no napkin/continuity deltas from the branch (dispositioned, not merged); no Vitest
assertions over `package.json`. Acceptance (`integration` + `non-code`): Draft-04 behaviour
proven through public seams; gates green; #14 closed with the verification recorded. Source:
report §11.3 #14. Gate: B-11 (success verdict).

**Q-07 — #21 extraction + closure.** Surface: logger/E2E relocation and concrete isolation
fixes only. Non-goals: no source-scanning framework, no known-violation baselines, no
timeout widening. Acceptance (`integration` + `non-code`): salvaged fixes green; #21 closed
with verification recorded. Source: report §11.3 #21. Gate: B-11 (success verdict).

**Q-08 — ADR estate integrity (mechanical).** Surface: **delete** the
`.agent/directives/ADR-044/045/046` duplicates outright and repoint every referrer to the
`docs/` originals in the same landing (`replace-dont-bridge`: no pointer files, no dual
paths — semantically divergent content is reconciled into the `docs/` original before
deletion, so nothing unique is lost);
reconcile every file `Status:` line against both indexes (ADR-038, inverse ADR-002); fix the
wrong H1 numbers in ADR-018/019; repair `IDENTITY.md`'s dead plan link; sweep the stale
`plans/active/` pointers the QD-6 ratification exposes (`.agent/README.md`'s
explicit-additional-properties links, `AGENT.md`'s active-plan line,
`session-continuation.prompt.md`'s remediation-02 location); refresh `SUMMARY.md`
rows. Non-goals: `SUMMARY.md`'s universal-schema-conversion product claim is NOT touched here
— that single line changes only after B-01, with Q-10's landing. No ADR content
re-adjudication. Acceptance (`non-code`): zero file/index status divergence (recompute, not
eyeball); no dangling link introduced; gates green. Source: report §7 T00 instructions.

**Q-09 — PR closure wave 1.** Surface: #10 and #28 — commit/file-level patch-equivalence
verification, surviving evidence migrated to its named home, closed with verification
recorded. Non-goals: no wholesale branch merges; #23 is NOT this row (see Q-13). Acceptance
(`non-code`): each closed PR's closure note names what moved where and what was retired.
Source: report §11.3.

**Q-13 — PR #23 disposition.** Surface: execute whichever outcome B-11 ratified for the
practice-transplant lane — selective canonical-delta sync then close, or retire-with-record —
with commit/file-level verification of unique deltas in the closing commit and closure note.
Non-goals: no wholesale merge of the stale snapshot. Acceptance (`non-code`): #23 closed with
the verification recorded and the transplant plan's disposition banner resolved. Source:
report §11.3 #23. Gate: B-11 **(outcome gate)** — eligible on any recorded verdict except DEFER, exempt from the success-verdict rule; it executes whichever outcome was recorded.

**Q-10 — Tranche 00 contract schema + validator.** Surface: the `ProgrammeObligation` estate
per report §5.1 shape rules, including the three PR-30 carry-forwards (discriminated no-edge
variant; decision-22 ordering half ratified before Tranche 02 — run the consumer audit over
remaining staged decisions; extraction-vs-full-T01 graph nodes); planning-mode validator;
inventories generated from official sources where possible; `SUMMARY.md` claim line updated
per B-01. Non-goals: no certification-mode gates yet (Tranche 14). Acceptance (`unit` +
`integration`): validator rejects vacuous/duplicate/ownerless rows; `tsc` exhaustiveness
green on the contract types; gates green. Source: report §5.1, §7; PR-30 carried findings.
Gate: B-01, B-07, B-09, and B-10 (success verdicts — all recorded 2026-08-22; the former
B-02..B-06 and B-08 are folded into B-01/B-07 per the ballot's reduction log, so they gate
through those two items). Ordered after Q-14 (`depends_on`): the B-09 doctrine wave lands
first, so this charter-consuming slice never grounds in doctrine surfaces that contradict
the charter it implements.

**Q-11 — Tranche 01 full harness.** Surface: profile-bearing case metadata over the Q-02
extraction; fixture provenance manifest; oracle independence. Acceptance (`integration`):
report §7 Tranche 01 acceptance list. Source: report §7 Tranche 01.

**Q-12 — Tranche tail.** 02A conventions → 02B roots (+ boundary ADRs) → 02C facets (#27
extraction) → 03 → 04 → lanes 05–09 → 10–14, per the report's §6 graph and §15.4 sequence,
with each remaining open PR's extraction-and-closure woven into its consuming slice (§11.3)
and each lane opening with its T00b charter. When Q-12 is reached, the executing session
splits it into concrete queue rows with briefs for the next horizon and updates this file —
that split is a slice-plan authoring act and takes the assumptions-expert review like any
other (per-slice detail is deliberately NOT pre-authored here: the report already carries the
per-tranche instructions, and duplicating them would rot).

**Q-14 — Doctrine amendment wave (B-09 APPROVE).** Surface: `principles.md` (§Input-Output
Pair Compatibility Model, §Strict-By-Default's object clause, **and the approved
staleness/truthing batch** — the falsified §Tooling Integration TSDoc claim and the other
W3 items per `open-questions.md` Q-015, executed under that walk's batch approval combined
with B-09), `VISION.md`,
`requirements.md`'s universal claims, `IDENTITY.md`, and
`.agent/rules/input-output-pair-compatibility.md` — rewritten to express the ratified B-01
charter, each landing recording retain/amend/supersede in the surface itself. Non-goals: no
product code; no new doctrine beyond the charter's entailments **and the ratified
2026-08-23 owner-walk verdicts (the decided inputs below — owner decisions, not
loop-invented doctrine)**. Acceptance (`non-code`):
every named surface expresses the charter with its disposition recorded; no surface still
asserts the universal-IR framing; gates green (including `validate-reference-direction`).
Source: ballot B-09; report §7; owner walk 2026-08-23. Gate: B-09 (success verdict —
recorded 2026-08-22).
Decided inputs (owner interactive walk, 2026-08-23, recorded in
`.agent/memory/operational/open-questions.md` Q-012/Q-014/Q-015): the second product's
name is **"the Practice"** (VISION/IDENTITY describe both products by name);
**preservation-coverage %** is the compiler's adopted headline metric — the vision rewrite
names it as the metric whose value the proof estate computes (Q-10/Q-11, remediation-02
family) and publishes **no percentage before the computation exists**, so the adopted
metric never becomes another asserted claim; the `Object.*`/`Reflect.*` doctrine stands as
written and is lint-enforced via a remediation lane entering at the Q-12 split — the
doctrine wave must not soften that clause to match current code.

**Q-15 — Fresh-container full-chain readiness.** Surface: the entire blocking gate chain
(SessionStart hooks, PreToolUse guards, pre-commit, pre-push) run unattended in a genuinely
fresh container; every gap fixed in-slice or spun into its own queue row. Measured evidence
(2026-08-22, this container): unbuilt `agent-tools/dist` left the PreToolUse guards failing
OPEN for hours (`.claude/logs/hook-errors.log` recorded ten fail-open entries) — the guards'
fail-open posture on missing build artefacts is itself a candidate finding. Q-01 ships the
gitleaks provisioning half and a dist-presence warning; this slice proves the rest. Q-01's
firing evidence (2026-08-22, Kingfisher probe) adds three measured gaps to the list: a
pristine checkout has **no git hooks wired until `pnpm install` runs**, so unattended
commits bypass the entire blocking chain (the highest-order gap — the chain isn't merely
degraded, it is absent); `agent-tools/dist` was unbuilt in the fired container (guards fail
open, as measured before); and fired sessions derive their Practice identity from the raw
`session_…` id, yielding the degenerate `sessio` prefix — the seed derivation must strip
the platform prefix or take an injected seed at spawn. Carried forward from PR #34 review
(clause 4 disposition, 2026-08-22): the `ensure-gitleaks.sh` version-classification
branches (same-core prerelease vs higher-core prerelease vs older/newer stable) have only
live-exercise evidence — this slice adds hermetic automated coverage (fake `gitleaks` on a
crafted PATH, stubbed installer dependencies) so a regression cannot land while CI stays
green. Incident I-1 (2026-08-23) adds cross-container claim visibility to the gap list:
`active-claims.json` is per-container instance state, so the session-open claims scan
cannot see a peer or concurrent writer in another container — the QD-5 pre-push head
re-check is the standing mitigation, and a proactive cross-container claim signal revisits
only with ADR-051's parallel-workers alternative. The QD-6 review adds a fired-session
capability probe: can a Routine-spawned session publish an Artifact page and deliver a
push notification? The owner-decision-ballot mechanism is measured only from interactive
sessions. QD-7 (2026-08-23) extends the probe: do the Slack connector's tools surface in
a fired session (`mcp__claude_ai_*` via ToolSearch), and does a message addressed to The
Watcher on the `remote-coding` channel get a reply a later step can read? The connector
was owner-attached to the Routine config the same day; no fired session has observed it
yet.
Non-goals: no gate weakening; no moving the guards to fail-closed without an owner-visible
proposal. Acceptance (`e2e`, observed): a fresh container completes ground → edit → commit
→ push unattended with every guard active, recorded in the slice PR. Source: Q-01
pre-execution reviews (2026-08-22). Gate: none (eligible immediately).

**Q-16 — Plan-architecture repair.** Surface: `.agent/skills/plan/SKILL-CANONICAL.md`'s
unresolvable references — `.agent/plans/templates/README.md` (step 3 and §Choose a
Template), `templates/components/quality-gates.md` (requirement 4),
`templates/components/lifecycle-triggers.md` (requirement 13), and the ADR-117 path (this
repo's ADRs live under `docs/architectural_decision_records/`) — restored from the Oak
transplant source (the napkin records the Oak inventory: README + 7 templates + 10
components) or retargeted to what exists; sweep sibling references to the absent templates
directory in the same landing (`.agent/memory/active/patterns/templates-encode-failure-modes.md`
cites it at two sites). Non-goals: no wholesale re-transplant of the Oak template estate
beyond what the skill's steps need; no silent deletion of the skill's document-hierarchy
section; no change to the general lifecycle model — the QD-6 briefs-are-plans ratification
is programme-scoped, and a general doctrine change would be its own owner decision.
Acceptance (`non-code`): every reference in the skill file resolves, recomputed via
`validate-markdown-links` over the touched files rather than eyeballed; gates green.
Source: the foundation-alignment note below; the napkin's transplant-gap entries. Gate:
none (eligible immediately).

**Q-17 — Diagnostic-walker residual hardening.** Surface:
`lib/tests-transforms/utils/semantic-outcome-runner.ts` (`toSafeDiagnosticValue` /
`resolveSafeDiagnosticMember`). The ADR-051 clause 4 carry-forward for the tenth-round
Codex P2 findings on PR #35 (both verified real against the landed code, both
diagnostics-only — the proof verdicts are computed before any diagnostic formatting runs,
so neither can change a proof outcome): (1) snapshotting a `Proxy`-backed artifact runs its
`ownKeys`/`getOwnPropertyDescriptor` traps, which can mutate the backing artifact silently
before the walker's guard can substitute a placeholder — detect proxies via `node:util`
`types.isProxy` (reliable in this Node-only test-support module) and emit an inert
placeholder without introspecting; (2) a function-valued array slot is dropped by the
array branch's `flatMap` (the shared member resolver signals omission with an empty
array), shifting later elements left — preserve array positions with an
`undefined` placeholder (matching `JSON.stringify`'s `null` rendering for such slots)
while keeping object-property omission as is. Acceptance (`unit`): a regression test per
finding (a trap-mutating Proxy fixture whose backing store is proven untouched; a
`[value, function, value]` fixture rendered with positions intact), TDD-first; gates
green. Source: PR #35 review threads (carry-forward dispositions recorded on-thread,
2026-08-23). Gate: none (eligible immediately).

Standing authority: [ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
(**Accepted 2026-08-22**, W-0 ballot B-12 as amended: three firings per day) — its clauses
own the merge policy (clause 3), review-bot convergence
(clause 4), cadence (clause 2), and escalation/kill switches (clause 6); this section states
mechanics only and cites clauses rather than restating them.

1. **Trigger**: the Q-01 Routine spawns a fresh cloud session per firing at the ADR-051
   clause 2 cadence. Fresh sessions re-ground via `start-right-quick`; repo state (this plan,
   thread records, napkin) is the memory between firings.
2. **Pre-flight**: check the `STOP` file and Routine state (ADR-051 clause 6); register
   session identity and open the area claim per
   [`register-active-areas-at-session-open`](../../rules/register-active-areas-at-session-open.md)
   and scan `active-claims.json` for any live peer or owner claim — a collision defers the
   firing with a note, it does not race. Read [`incidents.md`](./incidents.md) in the same
   pre-flight — from the grounding base and, when a programme PR is open, from that PR's
   fetched head too — for incident context binding this firing (QD-5).
3. **WIP = 1 — every open non-draft programme PR counts**: if any non-draft programme PR is
   open — a slice PR or a bookkeeping PR — drive it to merged (CI, review threads under
   ADR-051 clause 4, merge under clause 3, which covers both PR kinds per the QD-3
   amendment) and do nothing else; driving the
   bookkeeping PR first is clause 6's own persistence mechanism completing under clause
   1(b)'s single-open-PR invariant (an unmerged counter update would let later firings read
   a stale streak). A firing whose only act is merging a bookkeeping PR is itself
   zero-progress and pushes its own increment onto that PR's head branch before merging —
   the every-firing counter duty is never waived by the drive. Pushes to a programme PR's
   head re-verify the remote head SHA immediately beforehand and treat a second collision
   in one firing as a contested branch (incident record + defer) — mechanics in the
   [routine prompt](./routine-prompt.md) (QD-5).
   Otherwise claim the next eligible brief, mark it
   `in_progress` in this file's frontmatter, and re-verify its premises against live state.
4. **Execute one atomic TDD slice**: pre-execution `code-expert` review of the slice intent
   (two dispatches, per
   [`pre-execution-code-expert-review-per-loop-cycle`](../../rules/pre-execution-code-expert-review-per-loop-cycle.md))
   → failing proof → minimal product change → refactor → reviewer pass per
   [`invoke-reviewers`](../../rules/invoke-reviewers.md) (`code-reviewer` always;
   `test-reviewer` on test/harness surfaces; domain expert by surface; `docs-adr-expert` on
   ADR/doctrine surfaces; `assumptions-expert` whenever the firing authors or splits a slice
   plan) → full gates → PR, whose **final commit carries the slice's own state landing** (the
   queue row flipped to `complete`, the counter updates, the delivery-ledger row, and the
   handoff surfaces — so the merged base shows the row done the moment the PR lands, and no
   fresh firing can reclaim finished work) → green → merge (clause 3 once Accepted; explicit
   per-PR owner approval while Proposed) → orphan continuity commit → stop.
5. **Blocked slices release their PR — and land the block on the shared base**: marking a
   slice `blocked` (ADR-051 clause 6) converts its open PR to a draft with a comment naming
   the block diagnosis — never closed, the work is preserved — **and, in the same firing,
   lands the queue-state change via the bookkeeping path** (the row marked `blocked`, its
   `failures:` count, and a pointer to the draft PR's diagnosis), so the next firing's
   claims scan sees the block on the base rather than re-selecting a row whose state lives
   only on an unmerged draft branch. Draft PRs are exempt from step 3's drive rule, so the
   loop moves on instead of deadlocking; unblocking restores ready-for-review.
6. **Owner decisions are queued, never made** (ADR-051 clause 5): a genuine fork goes to
   [`queued-decisions.md`](./queued-decisions.md) with a recommendation; the firing reroutes
   to the next unblocked item.
7. **Red head found on arrival**: handled per ADR-051 clause 6's red-head policy (one
   bounded out-of-queue repair slice, recorded in the delivery ledger, then stop-and-notify
   if still red).
8. **Session end**: every firing closes with the `session-handoff` skill; no firing leaves
   the repo red without a B-16 record, a PR half-driven without the next firing scheduled, or
   continuity drift uncommitted.

The Routine's standalone prompt is [`routine-prompt.md`](./routine-prompt.md) (authored and
proven by Q-01).

## Reviewers

Plan-readiness for this parent plan: `assumptions-expert` review completed 2026-08-22
(findings applied in the authoring landing). Per-slice reviewer moments are protocol step 4
above — the loop never authors, implements, self-approves, and merges without independent
review dispatches. Ballot and ADR surfaces additionally take `docs-adr-expert` at their
landing.

## Prerequisites

- **Blocking for the loop's arming**: Q-01 — satisfied (completed 2026-08-22; the Routine
  is armed per the Q-01 evidence record).
- **Blocking for remediation-family slices (Q-02–Q-07, Q-13)**: ballot B-11 — satisfied
  (RATIFY recorded 2026-08-22).
- **Blocking for the tranche spine (Q-10 onward)**: the T00a charter verdicts — satisfied
  (recorded 2026-08-22) — **and Q-14** (the B-09 doctrine wave), per Q-10's `depends_on`.
- **Eligible now**: Q-04..Q-09, Q-13, Q-14, Q-15, Q-16, Q-17 (Q-02 completed 2026-08-23; Q-03 completed 2026-08-24).
- **Beneficial**: none deferred beyond the gates above.

## Acceptance criteria and proof contract

- **Per slice**: the brief's acceptance ids and proof levels above, plus non-negotiables —
  all gates green on the integrated head (`pnpm check:ci` via the pre-push hook), TDD
  evidence demonstrated red-first and recorded in the PR (retrospective tests are not TDD
  evidence), PR merged under the governing merge path — ADR-051 clause 3 once the ADR is
  Accepted, explicit per-PR owner approval while it is Proposed — and queue frontmatter and
  delivery ledger updated.
- **Programme complete** (`non-code` + `e2e`): every queue item `complete`; every open PR
  from the report's §11 inventory closed with its extraction verification recorded; the
  Tranche 14 certificate gates pass on one integrated commit for the ratified profile
  (command: the `proof:certify` composition of report §14, once built) — or the owner records
  an earlier close at narrower scope in this file. Completion runs the consolidation workflow
  (`engraph-consolidate-docs`) and archives this plan.

## Risks

- **Ballot latency**: only the remediation-family and spine slices wait on it; Q-01/Q-08/Q-09
  keep the loop productive meanwhile. The ballot is pre-filled; one sitting suffices.
- **Review-bot non-convergence** (measured on PR 30, six rounds): bounded by ADR-051 clause 4.
- **Fresh-container drift** (measured: missing gitleaks): Q-01 owns it; any new environment
  failure becomes a queue slice, not a silent workaround.
- **Red head outside the slice**: B-16 policy; without it the loop would stall (a red head
  blocks every item) — this is why B-16 exists.
- **Queue rot**: premise re-verification is protocol step 3, not just a mitigation note.
- **Runaway firing scope**: one-slice-then-stop and WIP = 1 bound each firing; breaches are
  napkin-recorded corrections.
- **Firing overlap** (measured 2026-08-23, incident I-1): the schedule spawns the next
  firing without terminating a predecessor still working, so WIP = 1 in PRs never implied
  one live session. Bounded by ADR-051 clause 2's duration bound and the routine prompt's
  overlap guard — two live drivers on one PR is a collision, not parallelism.

## Non-goals

- No parallel **workers** (single-worker WIP = 1 loop; the session-registration and claims
  duties of `register-active-areas-at-session-open` still bind every firing — protocol
  step 2).
- No release or public-claim changes: release scope stays constitutively the owner's
  (report §15.5).
- No self-ratification of any owner decision, ever — queued instead.
- No restating of the report's tranche content in this plan (reference, don't duplicate).

## Active-lane transition

**Executed 2026-08-22 (Q-00 landing, B-11 RATIFY):**

- [`02-ir-fidelity-proof-harness.md`](../current/paused/02-ir-fidelity-proof-harness.md)
  moved to `current/paused/` as a **partially-absorbed record**; its banner carries the
  per-finding disposition table (harness → Q-02, C2/F-01 → Q-03, F-03 → Q-04, F-04 → Q-05;
  C3, C4, H1–H4, M10 → owning tranches at the Q-12 split). It may reach `complete` only
  when every finding has a landed slice.
- [`oak-practice-transplant.md`](../current/paused/oak-practice-transplant.md) moved to
  `current/paused/` as a **named position**; its banner points at re-entry record QD-2 in
  [`queued-decisions.md`](./queued-decisions.md) (trigger: programme completion, or earlier
  on the owner's ask). PR #23's selective-delta disposition is Q-13.

`.agent/plans/active/` is now clear and stays clear for this programme's rows: the queue
briefs are the per-slice plans (QD-6, programme-scoped) and plan-authoring acts land as
parent-plan edits per Q-12's brief; the general `active/` contract for non-programme work
is untouched.

## Foundation alignment and first-principles check

Aligned to `principles.md` (strict and complete; its §Input-Output Pair Compatibility Model
and §Strict-By-Default are on the W-0 ballot for owner-approved amendment),
`testing-strategy.md` (TDD cycles as the landing unit; no skips or conditional tests), and
`requirements.md` (itself on the reconciliation surface; slices touching its claims record
retain/amend/supersede in the same landing). The
[`plan-body-first-principles-check`](../../rules/plan-body-first-principles-check.md) fires at
each firing before executing any plan-prescribed test or implementation: the executing session
re-derives the slice's shape from the live code and the report's evidence, not from this
plan's summary. Vendor call shapes named in briefs (AJV, Scalar, ts-morph, MCP SDK) are
re-verified at slice-author time per
[`verify-vendor-call-shapes-at-plan-author-time`](../../rules/verify-vendor-call-shapes-at-plan-author-time.md).
Note: the plan skill's template/component references (`plans/templates/`, ADR-117 path) do
not resolve in this repo — a known transplant gap recorded in the napkin; this plan names its
gates and lifecycle duties directly instead, and the repair is queued as Q-16.

## Lifecycle

**The queue briefs ARE the per-slice plans for this programme** (owner-ratified
2026-08-23, QD-6, via the first owner-decision ballot): each row's brief is the delegation
contract a firing executes directly — surface, non-goals, acceptance with proof level,
source, premise re-verification. Plan-authoring acts land as edits to this parent plan,
per Q-12's own brief. The ratification is programme-scoped: the general plan architecture
(`.agent/plans/active/` as the home of a standalone primary executable plan) is untouched
for work outside this programme. This parent plan lives in the
`proof-programme/` collection
for the programme's duration and archives when the programme completes or the owner closes
it. Lifecycle touch points (claim, landing, closure, consolidation) follow the standing
practice; each firing's session-handoff is the per-firing lifecycle record.
