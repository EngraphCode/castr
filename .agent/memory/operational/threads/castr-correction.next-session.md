# Castr correction

## Continuation route

- Order of work: the executable plan
  [unmerged-work-to-main-or-deleted](../../../plans/active/unmerged-work-to-main-or-deleted.md)
  (landed with its W0-1), which the fifth-close bullet below fed. The correction plan's
  [terminal state and priorities](../../../plans/active/castr-documentation-and-fidelity-correction.md#terminal-state-and-priorities)
  items 2 and 4, and the register-transfer clause of its proof contract, are suspended
  by the owner's rulings recorded there and are corrected by that plan's first landing.
  The end state is unchanged: zero open PRs, zero dirty worktrees, zero unpushed work,
  every delta merged to main or deleted.
- Controlling queue: [parent plan](../../../plans/proof-programme/parent-plan.md#current-execution-state).
- Next acceptance: the executable plan
  [unmerged-work-to-main-or-deleted](../../../plans/active/unmerged-work-to-main-or-deleted.md)
  is the authority; its W0-1 (truth on main) is this PR, then its todos in listed
  order, one PR each.
- Governing sequence for every inherited PR and dirty worktree: the
  [12 September value-proof sequence](../../../plans/active/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
  Containers are evidence about gaps; a gap in product code is proven only by a failing
  test on unpatched main, and proof lands with its cure in one green-and-clean PR;
  documentation-only content is proven by the owner's explicit approval of the text,
  sought in its PR. That sequence's container-closure clauses are suspended (see the
  fifth-close bullet).
- Live state at the 20 September fifth close (Candle weaves Residue, a4c7fb), the input
  for the plan the next session creates and works strictly to:
  Owner rulings at the fifth close, verbatim substance, in force for every future session:
  (1) "closing the PR by closing the PR achieves nothing, it's the WORK that matters...
  work that exists only on a branch and not in a PR or merged is at risk, work that we
  don't want needn't be on a branch... what you have done is kicked the can down the road
  while making it harder to know what we do and do not have." (2) "nothing is dealt with,
  and absolutely purge the idea that work can be routed to a bucket of later, whatever
  that bucket is called." (3) "never disable or skip a check of any kind." (4)
  "post-compaction you will create a plan, you will work strictly to that plan, and you
  will not invent outs for yourself."
  State: main is `SHA:8a9b55a4`. Thirteen PRs are open: #11, #12, #13, #15, #16, #17, #18,
  #20, #21, #26 and #27, reopened at 23:2xZ after ruling (1) reversed the closures of
  this day, plus #23 and #81. No branch was deleted; no work was landed from any of
  them. PRs #103 (`SHA:8a53cc78`), #102 (`SHA:8ca0db05`), #101 (`SHA:0ad80a41`), #104
  (`SHA:11715614`), #105 (`SHA:902a9e0f`) and #106 (`SHA:8a9b55a4`) merged today; the
  first three carry real work, the last three carry records.
  False state on main that the plan corrects before anything else: the proof contract's
  "transferred to the gap register" clause (correction plan §Unit of work and proof
  contract, the "Consequences for containers" paragraph) and item 2's "closes its PR
  through the register transfer" sentence are retracted to the 12 September wording (a
  source PR closes only when every claimed gap is cured on main, disproven, or ruled
  unwanted); queue row Q-34's wording follows; the delivery ledger's live-status cells
  for the eleven PRs above say closed while the PRs are open; the research README's
  closure records describe closures that did not stand. The measurements in those
  records stand: the per-delta tables, the probe table (fifteen of eighteen new test
  files from seven containers are red on unpatched main), and #20's two red suites.
  Defect chain found by applying #26's formatter fail-fast to main (three failures:
  `maybe-pretty.test.ts` "returns input on syntax error", the snapshot
  `name-with-special-characters`, the characterisation case "schema names that are
  JavaScript reserved words"): `builder.schemas.ts:107` stores `toIdentifier(name)` as
  the IR component name while every `$ref` keeps the wire name, so
  `typescript/index.ts:116,137` miss the component and skip the declaration silently,
  `zod/index.ts:129` and `type-writer/core.ts:28` emit the reference verbatim
  (`safeSchemaName` only suffixes built-in globals; the type writer projects nothing),
  `maybe-pretty.ts` swallows the invalid output, the inline snapshot enshrines
  `response: 1Name-With-Special---Characters,` with empty declaration sections,
  `markdown/index.ts:128` swallows a malformed reference into `Ref`, and
  `openapi-writer.components.ts:74` writes components under the mangled IR name, a
  wire-name loss on the OpenAPI round trip. `toIdentifier` already yields valid symbols
  (`_1_Name_With_Special_Characters`, `class_`); no unit test covers
  `identifier-utils.ts`. Doctrine: the IR carries the wire name; rendering makes valid
  symbols through one projection with a fail-fast injectivity check; a dangling
  reference throws; a snapshot changes only where its expectation is the defect, with
  the diff reviewed. PR #18's identity slice is a reference for these seams, derived
  independently.
  Constraints the plan works under: TDD with the failing test first; one gate at a time;
  one landing per PR carrying its proof (for product code the red test on unpatched
  main and its cure; for documentation-only content the text with the owner's approval
  sought explicitly in the PR); every check
  runs and passes, none skipped, disabled, loosened or updated away; every delta of
  every open PR is landed on main or deleted with the reason in the commit, and a branch
  is deleted when nothing on it remains; no routing verbs anywhere; the OCE
  `pr-lifecycle` and `proportionality` skills; the probe method (copy a container's new
  test files onto unpatched main, run, remove) as the way to see what a container proves.
  Housekeeping: an empty local branch `claude/fail-fast-formatter-2026-09-21` sits at
  main with no commits; the tree was returned to main's content by writing the file
  forward. No process of this session remains; a Codex watcher from 10 September
  (Bora seeks Turbulence, pid on this host) still runs from the
  `castr-correction-custody` worktree and is not this session's.
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
- Next safe step: create the plan (an executable repo plan) from the fifth-close bullet,
  with the owner's four rulings as its constraints, and work strictly to it. Its first
  landing corrects the false state on main named there; every later landing takes one
  container or one defect to main or to deletion.
- Defects in the merge-driver registration found by PR #103's review, each landed or
  deleted by the plan, none routed: (1) the registration's readback covers the registering checkout only; either
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
