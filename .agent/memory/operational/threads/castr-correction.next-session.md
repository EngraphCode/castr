# Castr correction

## Continuation route

- Order of work: the
  [terminal state and priorities](../../../plans/active/castr-documentation-and-fidelity-correction.md#terminal-state-and-priorities)
  of the value-proof sequence. Zero open inherited PRs, zero dirty worktrees, zero
  unpushed work, reached by proof and preservation or by closure and discard.
- Controlling queue: [parent plan](../../../plans/proof-programme/parent-plan.md#current-execution-state).
- Next acceptance: land PR #101 and PR #102, then close the inherited PRs (owner
  priority, 20 September). The next code slice is Q-32 and then the
  [Q-07 brief](../../../plans/proof-programme/parent-plan.md#slice-briefs), the
  hygiene-gate gap: its failing test on unpatched main with the lint restriction and the
  relocation cure; #21 closes in the disposition phase through the register transfer,
  and Q-07 resolves its register row.
- Governing sequence for every inherited PR and dirty worktree: the
  [12 September value-proof sequence](../../../plans/active/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
  Containers are evidence about gaps; a gap is proven only by a failing test on
  unpatched main, and proof lands with its cure in one green-and-clean PR.
- Live state at the 20 September third close (Candle weaves Residue, a4c7fb): three PRs
  landed on main through the lifecycle. PR #103 (the bootstrap merge-driver cure) merged
  as `8a53cc78` at 20:41Z; PR #102 (the retrospective) as `8ca0db05` at 21:35Z; PR #101
  (the value-proof sequence, its priority order, the corrected premises, the regenerated
  evidence and this record's previous close) as `0ad80a41` at 21:56Z after twelve review
  rounds, the last six on a records-class PR past its budget. The cured merge driver
  fired in anger on #101's final merge from main, routing `napkin.md` and
  `pending-graduations.md` to a hand union. PR #21 was closed by GitHub at 21:56:03Z
  through a closing keyword in a #101 commit message; its closure record and #11's
  per-delta record are in the research README's closure records, and #11 closes when
  this record is on main. Open PRs at this close: #11, #12, #13, #15, #16, #17, #18, #20,
  #23, #26, #27 and #81, twelve in all.
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
  1. Delivered: the bootstrap merge-driver cure is PR #103, merged as `8a53cc78`, red
     test first, the pure derivation unit-tested with no FS or git I/O, no machine-local
     path stored. Every checkout now needs its own `agent-tools/dist` build for
     memory-file merges: 16 of the 36 registered worktrees had none at the close and
     halt on a memory-path merge with a module error naming their own missing driver
     until `pnpm install` runs there.
  2. The stash is not the owner's decision and "least privilege" is not "never": Codex
     needs to run code and reach the network in some contexts. The question is which
     surface carries a context-dependent capability; it is
     [Q-018](../open-questions.md) and stays open. Do not drop the stash.
- Next safe step, in order, under the owner priority stated 20 September (open PR count
  to zero through the PR lifecycle, every piece of lingering and orphaned work resolved,
  then the known Castr defects): (a) done: PRs #101, #102 and #103 are on main; (b) the
  eleven remaining inherited PRs, each closed through its recorded disposition (ledger §Source PR
  dispositions; the 20 September review's §12 table) or its proven parts extracted, one
  landing slot at a time, starting with #11 (record on main, close, retain the branch) and
  #23 (Q-13, the doctrine reading of the preliminary inventory), while #81 keeps its C09
  exception; (c) the ten dirty worktrees, the stash (Q-018 stays open), the
  prunable temp-directory registrations and the branches, per §Terminal state item 2;
  (d) the revised repair plan (Q-32), then the hygiene-gate red test (Q-07) with the
  relocation re-derived from PR #21. Use the OCE `pr-lifecycle` and `proportionality`
  skills for every PR (owner instruction, 20 September).
- Follow-ups routed from PR #103's review and this session's measurements, each for its
  own PR: (1) the registration's readback covers the registering checkout only; either
  enumerate every linked worktree's effective binding or qualify the "arms every linked
  worktree" clause in CONTRIBUTING, the semantic-merge skill and the registration TSDoc;
  (2) a refused name-key write after a successful driver-key write reports "not armed"
  while the tripwire is armed, so read the driver key back before reporting; (3) a
  failed readback drops git's stderr; (4) the `.gitattributes` mapping covers
  `.agent/memory/**/*.md` only, so the JSON registers under `.agent/state/collaboration/`
  still line-merge; (5) `verify-pr.sh` re-arms the driver on every exit path in the old
  absolute-path shape and retires with its containers once #101 lands; (6) two team
  prompts under `.agent/prompts/agentic-engineering/` require `pnpm install && pnpm build`
  in a worktree for gates and now also for memory merges, and harness-created worktrees
  are never installed (Q-019); (7) `resolveRepoRoot` reads the ambient project-directory
  variable unless `projectDir: undefined` is passed, a hazard for bootstrap code run from
  a worktree. Estate facts: nine temp-directory worktree registrations are prunable
  skeletons; the shell profile exports a GitHub token into every child process, so rotate
  it if any transcript leaves the machine.
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

| Agent                 | Platform | Model            | Session prefix | Agent UUID                           | Role                                      | First session | Last session |
| --------------------- | -------- | ---------------- | -------------- | ------------------------------------ | ----------------------------------------- | ------------- | ------------ |
| Bora seeks Turbulence | codex    | gpt-6-astra      | 01a072         | 2b847d50-adfe-50d7-a93c-c5ac58ba45a2 | coordinator and PR shepherd               | 2026-09-06    | 2026-09-10   |
| Coal weaves Pumice    | claude   | claude-fable-5-1 | f67c69         | d0dfc3a1-ed69-535c-96bd-03c07648c274 | handover analysis, value-proof sequence   | 2026-09-12    | 2026-09-20   |
| Foxglove weaves Acorn | codex    | gpt-6-astra      | 01a088         | a6955478-7b8e-59e9-870e-dcef0d6e81cd | final Cricket I2 proof                    | 2026-09-10    | 2026-09-10   |
| Candle weaves Residue | claude   | claude-fable-5-1 | a4c7fb         | 6803f4ef-dcc2-5305-a2c8-b82944f21b0f | bootstrap merge-driver cure, PR lifecycle | 2026-09-20    | 2026-09-20   |
