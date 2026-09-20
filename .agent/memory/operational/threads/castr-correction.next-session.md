# Castr correction

## Continuation route

- Order of work: the
  [terminal state and priorities](../../../plans/active/castr-documentation-and-fidelity-correction.md#terminal-state-and-priorities)
  of the value-proof sequence. Zero open inherited PRs, zero dirty worktrees, zero
  unpushed work, reached by proof and preservation or by closure and discard.
- Controlling queue: [parent plan](../../../plans/proof-programme/parent-plan.md#current-execution-state).
- Next acceptance: the [Q-07 brief](../../../plans/proof-programme/parent-plan.md#slice-briefs),
  now the hygiene-gate gap: its failing test on unpatched main with the lint
  restriction and the relocation cure; #21 closes when its claimed gaps are exhausted.
- Governing sequence for every inherited PR and dirty worktree: the
  [12 September value-proof sequence](../../../plans/active/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
  Containers are evidence about gaps; a gap is proven only by a failing test on
  unpatched main, and proof lands with its cure in one green-and-clean PR.
- Live state at the 20 September close: PR #101 (branch
  `claude/value-proof-sequence-2026-09-12`) carries the sequence, the priority order,
  the unpushed-work inventory, the corrected premises and the measurement evidence
  regenerated after six further script repairs; its round 4 thread is answered; its
  [reconstructed REVIEW-TALLY](https://github.com/EngraphCode/castr/pull/101#issuecomment-5750596280)
  records budget exceeded at round 3; the wave on the new head was not observed at the
  close. Not merged. The retrospective on the arc is
  [PR #102](https://github.com/EngraphCode/castr/pull/102), also unmerged; its
  `napkin.md` and `pending-graduations.md` edits need a union merge with this branch's.
- Loss event, found 20 September: the `castr-q07-zod-fixture-runner` worktree lived under
  `the system temp directory`; the temp purge removed its `.git` file and all six dirty files between
  13 and 20 September. The 12 September inventory row (git history, `f8a744c2`) is the
  only record; the 143-line E2E test was never committed anywhere and must be re-derived
  from PR #21's runner test. Dirty worktrees now number 10, not 11.
- The next planning input is the owner-commissioned
  [20 September deep review](https://github.com/EngraphCode/castr/pull/101#issuecomment-5750407866)
  on PR #101, read in full and summarised in the plan's §20 September review. It states
  the owner's requested outcome (known defects exercised by required CI, CI red while
  they remain) and asks for one revised, dependency-ordered repair plan in the active
  plan. Its correction that main excludes no default-only operations is verified and
  applied; its compiler and CI findings are not yet in the register.
- Owner instructions at the 13 September close, in force for the next session:
  1. First action on resume: cure the bootstrap merge-driver defect
     (`agent-tools/src/bootstrap/bootstrap.ts`, `registerSemanticMergeDriver` writes the
     installing checkout's absolute path into the shared `.git/config`) under
     principles.md, testing-strategy.md and validation-strategy.md: red test first, the
     pure derivation unit-tested in process with no FS or git I/O, Light assurance tier,
     no machine-local path stored. Own PR from current main; independent of #101.
  2. The stash is not the owner's decision and "least privilege" is not "never": Codex
     needs to run code and reach the network in some contexts. The question is which
     surface carries a context-dependent capability; it is
     [Q-018](../open-questions.md) and stays open. Do not drop the stash.
- Next safe step, in order: (a) the bootstrap cure above, in its own PR from main;
  (b) merge #101 when green and clean, re-fetching the wave on its current head first,
  and reconcile PR #102 against it (union of two memory files); (c) the revised repair
  plan the 20 September review asks for, written into the active plan; (d) the
  hygiene-gate red test on unpatched main with the Q-07 relocation re-derived from
  PR #21, since the worktree that held it is gone. Everything else follows the priority
  order in the plan.
- Completed transition: the Q-09 brief plus the
  [source PR table](../../../plans/delivery-ledger.md#source-pr-dispositions).
- PR custody and next delivery action: [delivery ledger](../../../plans/delivery-ledger.md).
- Transition: Q-09 is complete. PR #90 merged the complete PR #28 preservation
  record as `cb73c4de`; PR #28 then closed without merge and retained its recovery
  branch. PRs #94/#95 delivered PR #10's surviving validator and machine-state
  boundary; #10 then closed and retained its recovery branch. Surviving findings live
  in the correction findings register, and the displaced enum/nullability decision
  lives as Q-017; pending semantic carriers remain open.
- Team: root owns compiler/foundational documentation and integration. Kite hunts
  Eyrie delivered C05 Cricket tooling in PR #88; Bora seeks Turbulence delivered its
  installation in PR #91 as `af840d9b`. PR #92 corrected the premature atomic closeout.
  Final I2 is now complete: the fresh trusted task retained all six final-template
  native returns with `fork_turns: "none"` and same-agent adversarial follow-ups.
  PR #93 delivered the evidence/lifecycle record as `07ebdb23`. Q-06 then delivered
  PR #14's four-file dependency correction through PR #98 at merge `0c3d4bdc`; source
  PR #14 closed without merge with its recovery branch retained. The coordinator now
  begins Q-07/PR #21 from current `origin/main`, starting with fresh reproduction and
  exact source-delta custody. M4 is reproduced; the rest of Q-07 remains pending.
  The broader C05 family retains the obligations
  named below. Coordinate expensive aggregate runs and re-read actual claims before edits.
- Source: PR #81 at `SHA:33be633862864ce8efb22e70abbbe9bce863c510`, never rewritten.

The ledger records delivered C01R, Q-19, C03a, operation-security, Error-oracle
and C05 platform-tooling repairs. Q-22 remains open for its integer,
generator/output and remaining oracle
obligations. Q-09 is complete. C05 retains
PR skill attribution and rule/reference cleanup; C10 retains
observed review/continuity-authoring failures and final isolated-pack acceptance.
C03b/c source drafts remain preserved. PR #18's document-security presence and
identity obligations remain open. Displaced continuation text is
[conserved verbatim](../../../plans/archive/correction-sequencing-2026-09-06.md#9-september-pr86-merge-and-q22-continuation).

## Preparation retained for later slices

C03a’s fresh worktree demonstrated build, CLI generation, strict compilation,
successful parsed values, distinguishing invalid witnesses, deterministic bytes
and actionable missing-input failure. An isolated local-pack rehearsal also passed
from the preserved draft; C10 still requires the final-main committed-fixture run.
C04a can consolidate three duplicate ADRs into their originals and repair three
exact ADR links without importing unrelated stale successor-plan wording.

C08/Q-016 preparation reproduced an additional enforcement gap on `SHA:e025d233`:
ESLint boundary folder patterns ending in `/**/*` leave direct children unknown.
Root-folder descriptors reveal parser dependencies from context and six writer
contract dependencies on context, alongside the known conversion edges. Its
closing proof must cover real resolver and element classification, type imports,
re-exports and production-to-test-helper dependencies. The correction plan retains
this discovery for the architectural repair; no implementation is claimed here.

## Participating agent identities

| Agent                 | Platform | Model            | Session prefix | Agent UUID                           | Role                                    | First session | Last session |
| --------------------- | -------- | ---------------- | -------------- | ------------------------------------ | --------------------------------------- | ------------- | ------------ |
| Bora seeks Turbulence | codex    | gpt-6-astra      | 01a072         | 2b847d50-adfe-50d7-a93c-c5ac58ba45a2 | coordinator and PR shepherd             | 2026-09-06    | 2026-09-10   |
| Coal weaves Pumice    | claude   | claude-fable-5-1 | f67c69         | d0dfc3a1-ed69-535c-96bd-03c07648c274 | handover analysis, value-proof sequence | 2026-09-12    | 2026-09-20   |
| Foxglove weaves Acorn | codex    | gpt-6-astra      | 01a088         | a6955478-7b8e-59e9-870e-dcef0d6e81cd | final Cricket I2 proof                  | 2026-09-10    | 2026-09-10   |
