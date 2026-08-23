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
---

# Parent Plan: Castr Proof Programme

**Status:** LIVE — the plan-of-record. The W-0 walk completed 2026-08-22 (interactive,
in-session): all ten ballot decisions carry success verdicts, ADR-051 is **Accepted**
(amended: three firings per day), and the [ballot](./ballot-2026-08-owner-walk.md) is
CLOSED with the verdicts recorded. Q-01 completed 2026-08-22 (the Routine is armed — see
the Q-01 evidence record). Eligible now: Q-02..Q-09, Q-13 (executes the B-11 RATIFY
outcome), Q-14, Q-15; Q-10..Q-12 follow their `depends_on` — Q-10 waits on the Q-14 doctrine
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
that open PR is contested under the routine prompt's overlap guard, as a **draft**
bookkeeping PR (not WIP, touching no contested ref) that the first firing to find the
contest cleared marks ready and merges; a
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
- Pending owner action (directed 2026-08-23, QD-5 conversation): change the Routine's
  session model to Fable in the Routine's own settings UI. Platform-side setting; the
  owner's UI is the only safe route — recreating the trigger via API loses the
  owner-attached repo source (measured above).

**Q-02 — Pre-T01 harness extraction.** Surface: artifact-agnostic runner mechanics extracted
from PR #11 (outcome records, non-vacuity checks, mutant-bite ritual) into the existing
`lib/tests-transforms` estate — the 2026-07-06 scout proved the substrate exists; extend, do
not fork a second runner. Non-goals: no profile/artifact-kind binding, no format-lane
expectations, nothing that pre-empts the product boundary. Acceptance (`integration`): seeded
wrong-parser/wrong-writer/vacuous-witness mutants are detected; suite green via `pnpm check`.
Source: report §11.3 #11. Gate: B-11 (success verdict).

**Q-03 — F-01 security AND→OR.** Surface: `buildIRSecurity` and the flat
`IRSecurityRequirement` model (IR-model change per review R3), parser+writer+persistence.
Non-goals: no broader security-lane work (Tranche 06 owns it). Acceptance (`integration`):
red-first formula-preserving proof through public parse/write seams — `{A AND B}` vs
`A OR B` distinguishable end to end; `pnpm check` green. Source: report F-01;
remediation-02 plan. Gate: B-11 (success verdict).

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
Pair Compatibility Model, §Strict-By-Default's object clause), `VISION.md`,
`requirements.md`'s universal claims, `IDENTITY.md`, and
`.agent/rules/input-output-pair-compatibility.md` — rewritten to express the ratified B-01
charter, each landing recording retain/amend/supersede in the surface itself. Non-goals: no
product code; no new doctrine beyond the charter's entailments. Acceptance (`non-code`):
every named surface expresses the charter with its disposition recorded; no surface still
asserts the universal-IR framing; gates green (including `validate-reference-direction`).
Source: ballot B-09; report §7. Gate: B-09 (success verdict — recorded 2026-08-22).

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
only with ADR-051's parallel-workers alternative.
Non-goals: no gate weakening; no moving the guards to fail-closed without an owner-visible
proposal. Acceptance (`e2e`, observed): a fresh container completes ground → edit → commit
→ push unattended with every guard active, recorded in the slice PR. Source: Q-01
pre-execution reviews (2026-08-22). Gate: none (eligible immediately).

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
- **Eligible now**: Q-02..Q-09, Q-13, Q-14, Q-15.
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

`.agent/plans/active/` is now clear: per-slice plans land there as the single primary
atomic plan while in flight, and move out per lifecycle when the slice completes.

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
