---
todos:
  - id: Q-00
    content: 'Owner walk W-0: ratify the ballot (T00a charter, standing authorisations, sequencing reconciliation)'
    status: pending
  - id: Q-01
    content: 'Loop readiness: fresh-container hook chain green unattended + Routine mechanism proven end to end'
    status: pending
  - id: Q-02
    content: 'Pre-T01 harness-extraction slice: artifact-agnostic rework of #11 runner mechanics'
    status: pending
    depends_on: [Q-00]
  - id: Q-03
    content: 'Pre-02A defect slice F-01: security AND->OR flattening, TDD through public seams'
    status: pending
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
    depends_on: [Q-00]
  - id: Q-11
    content: 'Tranche 01 full harness (consumes the Q-02 extraction)'
    status: pending
    depends_on: [Q-10, Q-02]
  - id: Q-12
    content: 'Tranche spine and lanes 02A..14 + remaining PR extractions, authored per-firing from the report'
    status: pending
    depends_on: [Q-11]
---

# Parent Plan: Castr Proof Programme

**Status:** Awaiting the W-0 owner walk (Q-00). Q-01, Q-08, and Q-09 are eligible now;
every other slice waits on the ballot.
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

**Why the Q-00 gates exist:** Q-02–Q-07 are gated by the **standing 2026-06-19 roadmap
sequencing order** (transplant first), which only ballot item B-11 may supersede — NOT by
T00a; the report certifies all of them parallel-safe with the T00a walk itself (§6 named
exceptions, §15.4 step 2). Q-13 (the #23 disposition) executes the B-11 outcome itself. Q-10 is gated by T00a proper.
Q-01, Q-08, and Q-09 predate no standing order and are eligible immediately.

### Slice briefs

Each brief is the delegation contract for a zero-context firing: surface, non-goals,
acceptance (with proof level), and the source to re-derive detail from. A firing re-verifies
the brief's premises against live state before executing; a slice whose premises moved is
re-adjudicated, not executed.

**Q-00 — W-0 owner walk.** Surface:
[`ballot-2026-08-owner-walk.md`](./ballot-2026-08-owner-walk.md) verdicts + the follow-up
landing that synchronises authority surfaces. Non-goals: no product code. Acceptance
(`non-code`): every ballot item carries a verdict; ADR-051 status updated; affected surfaces
(roadmap, prompts, active-lane banners) synchronised in the same landing; ballot marked
CLOSED. Source: report §7 T00a.

**Q-01 — Loop readiness.** Surface: SessionStart hook / environment setup (pinned gitleaks
8.30.0 install), `routine-prompt.md` in this collection, the Routine itself. Non-goals: no
product code; no queue slice execution during the dry run. Acceptance (`e2e`, observed): a
fresh container completes the full blocking hook chain unattended; the cron Routine is
created in fresh-session mode, fires once, the spawned session executes the prompt's no-op
path (STOP-check → report → handoff) and the completion notification reaches the owner; the
Routine is then paused until Q-00 closes. Evidence note: the platform surface
(fresh-session-per-fire Routines with completion notifications) is confirmed against the live
platform API in the authoring session; this slice proves the end-to-end behaviour.

**Q-02 — Pre-T01 harness extraction.** Surface: artifact-agnostic runner mechanics extracted
from PR #11 (outcome records, non-vacuity checks, mutant-bite ritual) into the existing
`lib/tests-transforms` estate — the 2026-07-06 scout proved the substrate exists; extend, do
not fork a second runner. Non-goals: no profile/artifact-kind binding, no format-lane
expectations, nothing that pre-empts the product boundary. Acceptance (`integration`): seeded
wrong-parser/wrong-writer/vacuous-witness mutants are detected; suite green via `pnpm check`.
Source: report §11.3 #11. Gate: B-11.

**Q-03 — F-01 security AND→OR.** Surface: `buildIRSecurity` and the flat
`IRSecurityRequirement` model (IR-model change per review R3), parser+writer+persistence.
Non-goals: no broader security-lane work (Tranche 06 owns it). Acceptance (`integration`):
red-first formula-preserving proof through public parse/write seams — `{A AND B}` vs
`A OR B` distinguishable end to end; `pnpm check` green. Source: report F-01;
remediation-02 plan. Gate: B-11.

**Q-04 — F-03 nested Boolean schemas.** Surface: the properties-path parse callback lacking
the boolean branch (`json-schema-parser` object fields vs the `if/then/else` handler).
Non-goals: no full Tranche 05 position matrix. Acceptance (`integration`): red-first proof
that nested `false`/`true` survive at the defective positions; `pnpm check` green. Source:
report F-03. Gate: B-11.

**Q-05 — F-04 placebo refinements + nested Zod loss.** Surface: the two `return true` sites
in `writers/zod/refinements/object.ts` (`:130`, `:183–187` per the 2026-07-06 scout — leave
the real refinements alone) become fail-fast; nested unsupported Zod members fail the
containing declaration. Non-goals: no Tranche 07 grammar work. Acceptance (`integration`):
red-first proofs for both behaviours; `pnpm check` green. Source: report F-04. Gate: B-11.

**Q-06 — #14 extraction + closure.** Surface: dependency-only Draft-04 AJV slice; PR #14
closure with commit/file-level verification in the closing commit and closure note.
Non-goals: no napkin/continuity deltas from the branch (dispositioned, not merged); no Vitest
assertions over `package.json`. Acceptance (`integration` + `non-code`): Draft-04 behaviour
proven through public seams; gates green; #14 closed with the verification recorded. Source:
report §11.3 #14. Gate: B-11.

**Q-07 — #21 extraction + closure.** Surface: logger/E2E relocation and concrete isolation
fixes only. Non-goals: no source-scanning framework, no known-violation baselines, no
timeout widening. Acceptance (`integration` + `non-code`): salvaged fixes green; #21 closed
with verification recorded. Source: report §11.3 #21. Gate: B-11.

**Q-08 — ADR estate integrity (mechanical).** Surface: **delete** the
`.agent/directives/ADR-044/045/046` duplicates outright and repoint every referrer to the
`docs/` originals in the same landing (`replace-dont-bridge`: no pointer files, no dual
paths — semantically divergent content is reconciled into the `docs/` original before
deletion, so nothing unique is lost);
reconcile every file `Status:` line against both indexes (ADR-038, inverse ADR-002); fix the
wrong H1 numbers in ADR-018/019; repair `IDENTITY.md`'s dead plan link; refresh `SUMMARY.md`
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
report §11.3 #23. Gate: B-11.

**Q-10 — Tranche 00 contract schema + validator.** Surface: the `ProgrammeObligation` estate
per report §5.1 shape rules, including the three PR-30 carry-forwards (discriminated no-edge
variant; decision-22 ordering half ratified before Tranche 02 — run the consumer audit over
remaining staged decisions; extraction-vs-full-T01 graph nodes); planning-mode validator;
inventories generated from official sources where possible; `SUMMARY.md` claim line updated
per B-01. Non-goals: no certification-mode gates yet (Tranche 14). Acceptance (`unit` +
`integration`): validator rejects vacuous/duplicate/ownerless rows; `tsc` exhaustiveness
green on the contract types; gates green. Source: report §5.1, §7; PR-30 carried findings.
Gate: T00a (Q-00).

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

## Operating protocol (the background loop)

Standing authority: [ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
(Proposed until B-12; while Proposed, clause-3 merges are NOT in force and every slice PR
waits for explicit per-PR owner approval) — its clauses own the merge policy (clause 3), review-bot convergence
(clause 4), cadence (clause 2), and escalation/kill switches (clause 6); this section states
mechanics only and cites clauses rather than restating them.

1. **Trigger**: the Q-01 Routine spawns a fresh cloud session per firing at the ADR-051
   clause 2 cadence. Fresh sessions re-ground via `start-right-quick`; repo state (this plan,
   thread records, napkin) is the memory between firings.
2. **Pre-flight**: check the `STOP` file and Routine state (ADR-051 clause 6); register
   session identity and open the area claim per
   [`register-active-areas-at-session-open`](../../rules/register-active-areas-at-session-open.md)
   and scan `active-claims.json` for any live peer or owner claim — a collision defers the
   firing with a note, it does not race.
3. **WIP = 1**: if a slice PR is open, drive it (CI, review threads under ADR-051 clause 4,
   merge under clause 3 once the ADR is Accepted, else explicit per-PR owner approval) and do
   nothing else. Otherwise claim the next eligible brief, mark it
   `in_progress` in this file's frontmatter, and re-verify its premises against live state.
4. **Execute one atomic TDD slice**: pre-execution `code-expert` review of the slice intent
   (two dispatches, per
   [`pre-execution-code-expert-review-per-loop-cycle`](../../rules/pre-execution-code-expert-review-per-loop-cycle.md))
   → failing proof → minimal product change → refactor → reviewer pass per
   [`invoke-reviewers`](../../rules/invoke-reviewers.md) (`code-reviewer` always;
   `test-reviewer` on test/harness surfaces; domain expert by surface; `docs-adr-expert` on
   ADR/doctrine surfaces; `assumptions-expert` whenever the firing authors or splits a slice
   plan) → full gates → PR → green → merge (clause 3 once Accepted; explicit per-PR owner approval
   while Proposed) → mark `complete` → update the
   delivery ledger and handoff surfaces → orphan continuity commit → stop.
5. **Owner decisions are queued, never made** (ADR-051 clause 5): a genuine fork goes to
   [`queued-decisions.md`](./queued-decisions.md) with a recommendation; the firing reroutes
   to the next unblocked item.
6. **Red head found on arrival**: handled per ADR-051 clause 6's red-head policy (one
   bounded out-of-queue repair slice, recorded in the delivery ledger, then stop-and-notify
   if still red).
7. **Session end**: every firing closes with the `session-handoff` skill; no firing leaves
   the repo red without a B-16 record, a PR half-driven without the next firing scheduled, or
   continuity drift uncommitted.

The Routine's standalone prompt is authored and proven by Q-01 as
`.agent/plans/proof-programme/routine-prompt.md` (deliberately not linked until it exists).

## Reviewers

Plan-readiness for this parent plan: `assumptions-expert` review completed 2026-08-22
(findings applied in the authoring landing). Per-slice reviewer moments are protocol step 4
above — the loop never authors, implements, self-approves, and merges without independent
review dispatches. Ballot and ADR surfaces additionally take `docs-adr-expert` at their
landing.

## Prerequisites

- **Blocking for the loop's arming**: Q-01.
- **Blocking for remediation-family slices (Q-02–Q-07, Q-13)**: ballot B-11 (the
  standing 2026-06-19 order), via Q-00.
- **Blocking for the tranche spine (Q-10 onward)**: T00a, via Q-00.
- **Eligible immediately**: Q-01, Q-08, Q-09.
- **Beneficial**: none deferred beyond the gates above.

## Acceptance criteria and proof contract

- **Per slice**: the brief's acceptance ids and proof levels above, plus non-negotiables —
  all gates green on the integrated head (`pnpm check:ci` via the pre-push hook), TDD
  evidence demonstrated red-first and recorded in the PR (retrospective tests are not TDD
  evidence), PR merged under ADR-051 clause 3, queue frontmatter and delivery ledger updated.
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

## Non-goals

- No parallel **workers** (single-worker WIP = 1 loop; the session-registration and claims
  duties of `register-active-areas-at-session-open` still bind every firing — protocol
  step 2).
- No release or public-claim changes: release scope stays constitutively the owner's
  (report §15.5).
- No self-ratification of any owner decision, ever — queued instead.
- No restating of the report's tranche content in this plan (reference, don't duplicate).

## Active-lane transition

`.agent/plans/active/` currently holds two plans whose disposition this programme affects,
both now carrying pending-disposition banners pointing here:

- [`02-ir-fidelity-proof-harness.md`](../active/02-ir-fidelity-proof-harness.md) — Q-02–Q-05
  absorb its harness shape and the C2/F-01, F-03, and F-04(placebo) findings; its remaining
  success criteria (C3, C4, H1–H4, M10) belong to their owning tranches and are mapped to
  concrete queue rows at the Q-12 split. If B-11 ratifies, the Q-00 landing moves it to
  `current/paused/` as a **partially-absorbed record** with a per-finding disposition table;
  it may reach `complete` only when every finding has a landed slice. If B-11 goes the other
  way, it reactivates unchanged.
- [`oak-practice-transplant.md`](../active/oak-practice-transplant.md) — pauses as a named
  position if B-11 ratifies (moves to `current/paused/`), else remains primary.

Until the Q-00 landing executes the ratified disposition, the banners keep the lane honest;
after it, per-slice plans land in `active/` as the single primary atomic plan while in
flight.

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
gates and lifecycle duties directly instead.

## Lifecycle

Per-slice plans land in `.agent/plans/active/` as the single primary atomic plan while in
flight and archive on completion; this parent plan lives in the `proof-programme/` collection
for the programme's duration and archives when the programme completes or the owner closes
it. Lifecycle touch points (claim, landing, closure, consolidation) follow the standing
practice; each firing's session-handoff is the per-firing lifecycle record.
