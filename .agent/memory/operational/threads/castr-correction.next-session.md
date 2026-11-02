# Castr correction

## Continuation route

State at the 2 November 2026 boundary (Bilby hunts Dreamscape, d71882), written for a
successor on any platform: everything that matters is here or in the files this section
names, never only in an agent's private memory. Verify each line against the live
repository before acting.

- **Destination:** [the specification](../../../../docs/SPECIFICATION.md), version 0.5.0,
  status `ratified` since 2 November 2026 (`SHA:0e2ca07a` on `feat/prepare-for-migration`,
  not yet on `main`). It is the only description of Castr's destination. The owner: "this work has drifted and drifted and now I think we need a
  destination that can only change with process and agreement"; "approval happens locally,
  only I or mantagen can approve". Mantagen is a human collaborator. Approval is spoken
  locally in a working session and the agent records the words, the date and the content
  hash in the change log (SPEC-CC-2); an agent never writes an approval it was not given
  in that session. Merging the specification's pull request is mechanics an agent performs
  (the drafting agent had written "no agent merges"; the owner ruled on 23 September that
  this was invented, and SPEC-CC-4 is retired).
- **The ratification walk ran on 2 November 2026.** The owner asked for every open
  question to go through the decision matrix of the Engraph Open Curriculum Ecosystem (its
  `principles.md` §Decision Lenses, with the survival tests in its
  `route-blocks-and-questions-to-director` and `owner-attention-at-action-moments` rules),
  then for the survivors as decision cards with enough on each card to decide. The
  survivors were the specification's checklist entries and two profile mismatches raised
  by OCE's `docs/architecture/oce-integrity-and-castr.md`. All 30 were decided. Draft
  0.5.0 carries every decision; its change-log row names what changed and which wording
  is the drafting agent's, and the checklist section is removed.
- **Approval, 2 November 2026, in this session, verbatim:** "I approve draft 0.5.0 , if we
  need to review and change it later that is fine." Recorded per SPEC-CC-2 in
  `SHA:0e2ca07a`: the status set to `ratified` (the only change above the change log), the
  words, the date and the SHA-256 of the bytes above the change-log heading
  (`f7dc6661…52edb2`, re-verified from the commit). Rows 0.2.0 to 0.4.1 read "none".
  From ratification the whole document changes only by approved amendment (SPEC-CC-1).
  The SPEC-CC-3 check does not exist yet; it is written test-first on the same branch and
  lands with the ratified file. The branch is the one the owner named for this work on
  1 November ("We are on a new branch"); it merges after the alert cure, because only alert
  cures merge while `main` has open dependency alerts (SPEC-G-1).
- **Next owner interaction:** the reflection on MEASURE's table, which decides what travels
  into OCE. Until then the work needs no owner decision: the alert cure, the SPEC-CC-3 check,
  the branch's pull request, PROBE and MEASURE run in that order (the course, and the plan
  approved by the owner on 2 November).
- **Owner rulings of 1 and 2 November 2026, verbatim where quoted:** the two goals,
  "bringing Castr into a requires compliant and functioning shape" and "migrating Castr
  into OCE", which "do not supersede previous plans, they are part of enacting the
  previous plans"; no consolidation pass unless it serves those goals (quoted in full in
  `repo-continuity.md`); every linked worktree deleted (done on 1 November; branches and
  the stash kept); "All Castr work happens via AST not via string manipulation. Where
  string manipulation is unavoidable, ask _why_" (now in SPEC-AR-3 and in ADR-026's
  amendment), with a further card the same day: where string manipulation seems unavoidable
  the work stops and asks the owner, and an exception exists only as an owner-approved
  entry in the specification (none is approved); and, the same day, "No strings refers to the
  compiler/decompiler/ and associated state and systems, not to the logger, loggers use
  strings"; "Strike the condition, Castr will move
  into OCE and be fully integrated" (§10); "Where appropriate make sure that logging is
  explicit and informative, and make sure that we respect "strict, everywhere, all the
  time"" (SPEC-PR-8).
- **Course:** [castr-course.md](../../../plans/active/castr-course.md). Order, fixed by the
  owner on 21 September: ALERTS, RATIFY, MEASURE (a throwaway probe scoring today's
  generator on the pinned Oak corpus against the source document with an independent
  validator; its verdict — evolve the present model or rebuild — decides what MOVE
  carries), MOVE (into the Engraph Open Curriculum Ecosystem repository as workspaces,
  fully integrated there; this repository is then archived), PLOT. ALERTS is open again:
  30 open dependency alerts on `main` on 2 November (3 critical, 8 high). The course now
  runs ALERTS, RATIFY (lands with the SPEC-CC-3 check), MEASURE (decides nothing), the
  reflection with the owner (decides what travels), CURRENCY and RULES (both only for code
  that travels), MOVE, PLOT; PROBE is read-only and runs any time before the reflection.
- **Owner decisions by card, 2 November 2026, after the approval (verbatim):** MEASURE:
  "Measure without making decisions, drop the thresholds, we figure out what we have, then
  we reflect on it" (the agent had proposed an 80% `exact` threshold; it is dropped).
  CURRENCY: "After MEASURE, scoped (Recommended)" — after MEASURE, scoped to the code that
  travels, none on archived code, `agent-tools` outside it either way. Lint rules: "At
  move the OCE rules will apply, the point of applying them early is to fix issues in
  isolation before moving" — the agent's reading, to be confirmed at the reflection, is a
  RULES leg after CURRENCY and before MOVE on the code that travels, which restores the
  owner's 1 November order "dependencies, then rules". These replace the agent's earlier
  departure (rules applied at MOVE), which the owner had never approved. vitest 4 and tsup
  8 stay held at OCE's majors.
- **Evidence:** [the specification review record](../../../research/castr-specification-review-2026-09-21.md)
  keeps what six reviewers measured on 21 September (the Oak API specification's feature
  inventory, its eight `allOf` sites that accept no value — the owner fixes those at
  source — the consumer's code-generation contract, Zod 4.5.4's behaviour, and the list of
  documents that disagree with the specification). Not one measurement was re-verified by
  the session that wrote the record.
- **Evidence gathered on 1 November 2026:** [the Sonar analysis](../../../analysis-and-reports/sonar-issues-2026-11-01.md)
  (380 open issues on `main`; 211 in Practice tooling, 117 in code the specification
  condemns; nothing urgent). The Scalar probe and the lint-configuration findings are in
  the napkin's 2 November section.
- **Landed on `main` since the 21 September close:** #111 (dependency alerts to zero,
  `SHA:fc94488f`) and #109 (component identity chain, `SHA:8b0aa438`, two review rounds).
  The owner's ruling on #109 was "land it frozen"; the working rule drawn from it is the
  agent's wording, not the owner's: nothing more goes into the present writer code, and a
  review finding against the present model is cured only when it blocks a landing,
  otherwise dropped with the reason stated to the owner. The present model fails SPEC-AR-1 (OpenAPI vocabulary as structure,
  mandatory Zod output text on every node) and the writers fail SPEC-AR-3 (text emission);
  building on it as if it will last is the error the course exists to end.
- **Merging:** the owner granted agents `gh pr merge` for green-and-clean pull requests on
  21 September; the permission rule lives in the agent's local, unversioned settings on
  the host that was used, so a new host may need it again. Green and clean means every
  check passing, no unresolved review thread, no new static-analysis issue, and zero open
  dependency alerts on `main`.
- **Written off on 21 September 2026 by owner ruling:** every dirty worktree and orphaned
  branch, and pull requests #11–#13, #15–#18, #20, #21, #23, #26, #27 and #81 (closed; commits
  reachable at `refs/pull/<n>/head`). Nothing of theirs is evaluated or recovered. The plans
  `unmerged-work-to-main-or-deleted.md` and
  `castr-documentation-and-fidelity-correction.md` carry `status: superseded` and are in
  `.agent/plans/archive/`.
- **Standing owner rulings that govern every session:** long-term architectural excellence
  over short-term expediency, always; strict, everywhere, all the time; no failing test,
  check or validator is ever tolerated ("'Red by design' is utterly unacceptable, that was
  never true"); no work is routed to any list or future plan, under any name — a finding
  is cured in its own next pull request or dropped with the reason stated, and a known gap
  lives in a tested `NOT-YET-BUILT` rejection; green in a pull request means no
  static-analysis issue in new code, and the specification is met only while `main` has
  zero issues; dependency-update pull requests land on green without analysis; the
  Practice-enhancement lane in this repository is stopped (a more advanced Practice comes
  later from the owner's other estates); the Practice is always vendor-agnostic, so
  everything that matters is written to the repository, never only to one platform's
  memory; where the owner names a Director session, team members own their own work and
  contact the Director only for a second opinion or a suspected rabbit hole (owner's word
  of 23 September 2026 as relayed by the Director, Wick binds Temper; the owner's own
  message that day named the Director as the route for questions).
- **Behavioural corrections from the owner, 21 September, that a successor inherits:**
  "slow right down" — one thing at a time, one gate at a time, never parallel gates on
  this host; a permissive instruction ("dependency PRs land without analysis") is not a
  licence to skip care (two errors followed: a misread `pnpm why` output cited the wrong
  consumer, and a copy-pasted test failed the static-analysis duplication gate); a record
  is never written ahead of its outcome; an owner statement naming who decides is never
  widened by the agent into a prohibition on who executes (the invented merge clause).
- **Behavioural corrections of 1 and 2 November 2026 that a successor inherits:** run
  every owner-bound question through OCE's decision matrix before asking it, and ask the
  survivors as self-contained decision cards with the recommended answer first, never in
  prose (the owner asked for exactly this after an unmatrixed prose question); quote the
  owner's words, and label a rule the agent derived as derived; read a register row to its
  status column before calling it open (QD-1 and QD-10 were closed by the owner on
  26 August); when a plan reorders the owner's sequence, state the change and every hold
  it inherits.
- **What the 2 November boundary left in context only:** the two Cricket panels' returns
  (their corrections are in the napkin's 2 November entries), the full text of the
  decision cards (every answer is verbatim in the napkin's 2 November entry, and the
  non-default answers are quoted in the specification), and the scratch frames and probe
  scripts. Bounds of this scan: the owner's view of the stated plan departures is known
  only from silence, and the comms watcher saw no other agent in the two days.
- **Collaboration state:** Bilby hunts Dreamscape holds claims on the files it edited
  (`active-claims.json`, gitignored) and closes them at its session's end. On arrival,
  register on the comms stream and arm the all-channels watcher before any edit.
- **Host:** on 2 November the load averages were 2 to 6 on 14 cores with no linked
  worktrees; on 21 to 23 September the machine was swap-starved. Check `uptime` before
  running gates.

## History (dated evidence; none of it is live direction)

### Continuation route of 23 September 2026 (superseded on 2 November 2026)

State at the second 23 September 2026 close (Mussel mends Buoy, 372325, after Poppy calls
Topsoil's close the same morning), written for a successor on any platform: everything that matters is here or in the files this section
names, never only in an agent's private memory. Verify each line against the live
repository before acting.

- **Pull request #110 merged on 23 September 2026** as `SHA:75f47abd` (head
  `SHA:4080cbf8`, 16 of 16 checks, no unresolved thread, no dependency alert on `main`),
  carrying the specification, the course plan, the review record and this record. The
  owner's instruction was "land 110 properly, and then we will re-assess". Its one review
  round (Copilot, 17 threads on `SHA:9b3ae0de`) was verified finding by finding and cured
  in draft 0.4.0: every changed clause is on the ratification checklist, the two
  superseded plans are archived, and the session-continuation prompt, roadmap and practice
  index name the course plan as primary. One finding, a new source-anchored boundary check
  for C-1 acceptance, was kept out of the text as a missing requirement rather than a
  contradiction; it and the reading of a source `default` stand on the ratification
  checklist as two decisions for the owner. The pull request's `REVIEW-TALLY` comment
  records each disposition. The merged branch `claude/castr-destination-spec-2026-09-21`
  is left in place; deleting it needs the owner's word.
- **What the 23 September close deliberately left in context only:** the six reviewer
  transcripts (their measured facts are in the review record; nothing else of theirs is
  needed); the drafting reasoning behind each specification clause (the clause and its
  owner quotation are the decision-sufficient compression); the exact wording of the
  decision cards (the decisions are in the specification's change log and the course
  plan). Bounds of that close's own scan: it could not see review comments that arrived on
  #110 after `SHA:9b3ae0de`, and no measurement in the review record was re-verified. The
  next session re-verified only the facts the round-1 cures rest on: Zod 4.5.4's
  `z.iso.datetime()` rejects offsets and `z.lazy` is read by calling its getter (both
  executed), and Draft-07 has no vocabulary mechanism.
- **What the second 23 September close left in context only:** the three reviewers'
  reports on the round-1 cures (the corrections taken are in the specification and the
  commit messages of `SHA:ee970674`, `SHA:8c9b3c50` and `SHA:4080cbf8`; the suggestions
  dropped, with reasons, are in the napkin's 23 September section for Mussel mends Buoy),
  and the 17 thread replies' wording (on the pull request).
- **Next owner interaction:** the owner re-assesses the course now that #110 has landed
  (owner, 23 September 2026). Input prepared for it: the napkin's concept-exploration
  entry on how one review round moved the ratification checklist from 15 entries to 31,
  with three proposals, each with its warrant and falsifier. The course's next leg, unless
  the re-assessment changes it, is the ratification walk — one decision card per entry of
  the specification's ratification checklist, each in
  plain language with its reason and its cost, recording confirm, change or strike; then
  the owner's spoken approval recorded per SPEC-CC-2 and the status set to `ratified`.
- **Course:** [castr-course.md](../../../plans/active/castr-course.md). Order, fixed by the
  owner on 21 September: ALERTS (done: `main` has zero open dependency alerts since
  `SHA:fc94488f`), RATIFY, MEASURE (a throwaway probe scoring today's generator on the
  pinned Oak corpus against the source document with an independent validator; its verdict
  — evolve the present model or rebuild — decides what MOVE carries), MOVE (into the
  Engraph Open Curriculum Ecosystem repository as workspaces; all wiring and the removal of
  every other description of the destination happen once, there, with no tombstones; this
  repository is then archived), PLOT.
- **Collaboration state:** no claims are active (Mussel mends Buoy's claim on the #110
  files closed at the merge). Bora seeks Turbulence's five stale claims
  from 9–10 September were closed on the owner's word ("Bora is gone") on 21 September. On
  arrival, register on the comms stream and arm the all-channels watcher before any edit.
- **Host:** on 21 September the machine was swap-starved with 36 worktree registrations and
  `fseventsd` near 100% CPU; on 23 September swap stood at 21.5 of 22.5 GB and the load
  near the 14-core count. Check `uptime` before running gates. The Codex comms watcher
  started 9 September from the `castr-correction-custody` worktree, which belonged to no
  live session, was stopped on 23 September under the owner's instruction to stop all
  processes at the close.

- Governing sequence for every inherited PR and dirty worktree: the
  [12 September value-proof sequence](../../../plans/archive/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
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

| Agent                  | Platform    | Model            | Session prefix | Agent UUID                           | Role                                           | First session | Last session |
| ---------------------- | ----------- | ---------------- | -------------- | ------------------------------------ | ---------------------------------------------- | ------------- | ------------ |
| Bora seeks Turbulence  | codex       | gpt-6-astra      | 01a072         | 2b847d50-adfe-50d7-a93c-c5ac58ba45a2 | coordinator and PR shepherd                    | 2026-09-06    | 2026-09-10   |
| Coal weaves Pumice     | claude-code | claude-fable-5-1 | f67c69         | d0dfc3a1-ed69-535c-96bd-03c07648c274 | handover analysis, value-proof sequence        | 2026-09-12    | 2026-09-20   |
| Foxglove weaves Acorn  | codex       | gpt-6-astra      | 01a088         | a6955478-7b8e-59e9-870e-dcef0d6e81cd | final Cricket I2 proof                         | 2026-09-10    | 2026-09-10   |
| Candle weaves Residue  | claude-code | claude-fable-5-1 | a4c7fb         | 6803f4ef-dcc2-5305-a2c8-b82944f21b0f | bootstrap merge-driver cure, PR lifecycle      | 2026-09-20    | 2026-09-21   |
| Poppy calls Topsoil    | claude-code | claude-fable-5-1 | bf551f         | (seed-derived; not registered)       | PR closure, PR #109, destination specification | 2026-09-21    | 2026-09-23   |
| Mussel mends Buoy      | claude-code | claude-opus-5-5  | 372325         | b69485ad-3a77-5c8a-b2c0-cc764d734103 | PR #110 round-1 cure and merge                 | 2026-09-23    | 2026-09-23   |
| Smith stirs Ashes      | claude-code | claude-opus-5-5  | 7bd175         | 02ed168a-55c7-5450-8fdb-b7fd399d9c86 | Sonar analysis (sub-agent)                     | 2026-11-01    | 2026-11-01   |
| Bilby hunts Dreamscape | claude-code | claude-opus-5-5  | d71882         | 767b6de5-9347-5fdb-bbdf-eeb98791ec13 | review, ratification walk, draft 0.5.0         | 2026-11-01    | 2026-11-02   |
