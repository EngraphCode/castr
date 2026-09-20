# Inherited-estate measurement, 12 September 2026

Tracked home for the commands and outputs behind the measured-state facts in the
[delivery ledger](../../plans/delivery-ledger.md#measured-state-of-the-inherited-estate-12-september-2026)
and the container map in the
[value-proof sequence](../../plans/active/castr-documentation-and-fidelity-correction.md#12-september-value-proof-sequence).
Base: `origin/main` at `21e232295426ac104dc1ff47b2d7543858abf4bf`.

These outputs establish self-consistency of each container on that main, never the
existence of a doctrine gap or the correctness of a cure. Only a failing test on
unpatched main does that.

## Scripts

All scripts are Bash. They resolve the repository from `git rev-parse --show-toplevel`
and measure against `$BASE`, which defaults to the recorded main revision above.
`verify-pr.sh` writes its worktree, patch and logs under `$SCRATCH`, defaulting to a
fresh `mktemp -d`; `pr-evidence.sh` and `wt-evidence.sh` write their reports to stdout,
and `wt-evidence.sh` keeps one `mktemp` listing file that it removes on exit. They do
write shared Git state:
`verify-pr.sh` registers a worktree, its install writes the merge-driver path into the
shared `.git/config` (re-armed from the primary checkout on every exit path), and
`git merge-tree --write-tree` writes Git objects. Merge-conflict output can depend on
the merge-driver build as well as the pinned commits.

- `pr-evidence.sh`: for each open source PR, measured at the head SHA recorded on
  12 September and pinned in the script, the merge-base, commit list, `git cherry`
  patch-id matches, per-file fate on main (`D` absent, `U` unchanged since base, `C`
  changed since base, `=` head identical to main) and the `git merge-tree --write-tree`
  conflict list with the merge driver's messages. The local branch and the live GitHub
  head are printed beside the pinned head, with a `DRIFT` line when either differs.
  The merge result-tree OID is not printed: for containers touching memory files it
  depends on the semantic-merge driver build, so it is not evidence.
- `wt-evidence.sh <worktree-path>...`: for each dirty worktree, every dirty path,
  with untracked directories expanded to their files, with whether its content already
  equals the measured main and whether main changed the path since the worktree's base.
- `verify-pr.sh <label> <merge-base> <head-sha>`: adds a disposable detached worktree
  at the measured main, installs offline from the store, applies the head's `lib/`
  diff with `git apply --3way` excluding integration snapshots, runs the head's own
  test files under the matching vitest config, then `tsc --noEmit`. The vitest
  summary lines are kept whole for every run and the diagnostics are truncated
  separately. It exits with the number of failed steps (apply, each test run, the
  type-check), shown on 13 September by the pr16, pr18 and pr27 reruns exiting 4, 5
  and 5. The worktree is left for inspection; remove it with
  `git worktree remove --force`. Because the repository `postinstall` writes the
  semantic-merge driver path of whichever checkout ran it into the shared
  `.git/config`, the script re-arms the driver from the primary checkout after each run.

## Results

`results/` holds the outputs as produced, with machine-local prefixes replaced by
`<scratch>`, `<repo>` and `<worktrees>` and ANSI codes stripped:

- `pr-evidence.txt`: the mechanical evidence for all 13 PRs, regenerated on
  13 September by `pr-evidence.sh` at the pinned heads; no drift from the 12 September
  heads was reported, and the conflict lists match the 12 September run.
- `wt-evidence.txt`: the mechanical evidence for 10 worktrees, regenerated on
  20 September after the three inventory repairs (content equality for untracked files,
  rename records, counts against HEAD). The 12 September output for all 11, with the
  `castr-local-entry` `examples/` directory as one row, is in git history at
  `f8a744c2`. The eleventh worktree, `castr-q07-zod-fixture-runner`, was unreadable on
  20 September: it lived under the system temp directory, and the temp purge had removed its `.git`
  file and its six dirty files.
- `verify-<label>.txt`: one per probed PR (11, 12, 13, 15, 16, 17, 18, 20, 26, 27).
  `verify-pr16.txt`, `verify-pr18.txt` and `verify-pr27.txt` were regenerated on
  13 September by `verify-pr.sh` at the pinned heads; the other seven were produced by
  the 12 September zsh predecessor. The two formats differ: the predecessor's header
  starts with `branch=` and its footer has no `failures=` field, while the current
  script's header reads `head=... main=...` and its footer carries the failure count.
  The seven older outputs are historical evidence, not reproducible by the current
  script byte for byte.
  Each records the patch file count, apply result and conflicted files, the test files
  run with their vitest summary (pass and fail counts per run), and the type-check
  result.

Two later probes are not scripted: the PR #18 identity-slice subset (an 18-file
pathspec of the same diff) and the manual resolution of PR #20's and PR #27's single
conflicts, both recorded in the napkin entry for the day.

## What the scripts do not cover

- `verify-pr.sh` runs the changed test files from three in-process suites: unit tests
  under the default vitest config, `tests-transforms` under `vitest.transforms.config.ts`
  and `tests-snapshot` under `vitest.snapshot.config.ts`. Characterisation, generated and
  E2E suites changed by a source PR are not executed: `verify-pr27.txt` lists 20 test
  files and vitest reports 18. Its output is selected-test evidence for the applied
  `lib/` patch, never a suite-complete run. Both revisions must be present as objects;
  the script aborts before creating anything when one is missing.
- `pr-evidence.sh` needs every pinned head present as an object. The heads are unmerged
  pull-request commits, so a fresh clone fetches each before running:
  `git fetch origin refs/pull/<n>/head` for every PR number in the script, then
  `git cat-file -e <pinned head>` confirms the object. The script aborts naming the missing
  object and that command; it does not fetch on its own.

## Closure records

Per-delta dispositions for inherited PRs, recorded here before each PR closes
(correction plan §Terminal state item 2; every unique delta is landed with exact
evidence, superseded with a reason, discarded at owner word, unresolved and routed to an
owning row, or, for a claimed uncured gap only, transferred to the gap register).

### PR #11 residual delta against main (measured 20 September 2026)

Head `64feef9e`, merge base `4be99dae`; eight files changed on the branch. Compared file by
file with `origin/main` at `8a53cc78` and with the Q-02 evidence record (PR #35, merged
2026-08-23).

| Delta                                                                                                         | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/tests-transforms/utils/fidelity-harness.ts` (229 lines, OpenAPI-bound `runFidelityProof`)                | Superseded with a reason: Q-02 extracted its outcome-record and non-vacuity concepts into the artifact-agnostic `semantic-outcome-runner.ts`, with structural non-vacuity (`separatingSource` recomputed on three legs), independent source/target oracles and per-callback cloning; the report's #11 disposition forbids restoring the OpenAPI/legacy-root runner. Its four properties are dispositioned individually below.                     |
| Boundary revalidation of writer output through `loadOpenApiDocument`                                          | Landed for the positive direction: `writer-field-coverage.integration.test.ts` reparses emitted Phase D and Phase E output through the shared load boundary (lines 545 and 645 on main), so spec-invalid output would fail those tests. Unresolved investigation routed: no test on main seeds a deliberately spec-invalid written document and asserts the rejection, which #11's second smoke case did; owned by the Tranche 01 harness (Q-11). |
| IR serialization round-trip (`deserializeIR(serializeIR(ir))`)                                                | Already landed: `serialization.unit.test.ts`, `public-api-preservation.test.ts`, and the security-formula and nested-boolean transform suites exercise it on main.                                                                                                                                                                                                                                                                                |
| Byte-stable second-pass rewrite                                                                               | Already landed: scenarios 1, 2 and 5 assert byte-identical output on the second pass.                                                                                                                                                                                                                                                                                                                                                             |
| `sourceAssertions` against the raw loaded source document                                                     | Superseded: the runner's `sourceOracle` is computed directly from the source, never via `parse`, which is the independent-oracle form of the same intent; the report's disposition retains the concept, not the callback.                                                                                                                                                                                                                         |
| `fidelity-harness.smoke.integration.test.ts` (four cases)                                                     | Case 1 (machine-readable outcome) landed in Q-02; case 2 (a seeded spec-invalid written document rejected at the load boundary) routed to Q-11 as above; cases 3 and 4 (source assertions fire and propagate) superseded as above.                                                                                                                                                                                                                |
| `__fixtures__/edge-cases/fidelity-smoke.yaml` and the README rewrite                                          | Superseded: the edge-cases directory on main holds only its README; the fixture existed to drive the OpenAPI-bound harness. The per-fixture corpus shape is owned by Tranche 01 (Q-11), which consumes the Q-02 runner.                                                                                                                                                                                                                           |
| `docs/architecture/fidelity-proof-harness.md` (117 lines)                                                     | Superseded: the runner's module documentation and the `lib/tests-transforms/README.md` row carry the doctrine; the paused plan `02-ir-fidelity-proof-harness.md` records the absorption into the queue (B-11).                                                                                                                                                                                                                                    |
| `DEFINITION_OF_DONE.md` fidelity-suite bullet                                                                 | Superseded: it points at the never-landed architecture document; main's DoD names the E2E and transform suites in its gate table.                                                                                                                                                                                                                                                                                                                 |
| `schemas-with-metadata.test.ts` and `templating.unit.test.ts` (typed result access, second-run file equality) | Already landed: main uses `assertSingleFileResult` / `result.content` and asserts first-run against second-run files.                                                                                                                                                                                                                                                                                                                             |

Unresolved investigation routed: the 20 September review §2.1 names a vacuous parity lane
(transform helpers return when a fixture key is absent) that Q-02's runner does not touch;
it is owned by the revised repair plan (Q-32), not by #11.

Closure: #11 closes without merge when this record is on main; its branch is retained as
history, not preserved value.

### PR #21 closure, 20 September 2026

Closed by GitHub at 21:56:03Z, two seconds after PR #101 merged as `0ad80a41`, through
the words "closes #21" in a round-11 commit message on that PR, not by a deliberate
close. The outcome matches the recorded disposition: the gap register on main carries
the hygiene-gate row (in-process suites importing `node:fs` or `node:child_process` or
reading `process.env`, cured by the lint restriction with this branch's relocation) with
#21 as its candidate source, and queue row Q-07 resolves it with the failing test on
unpatched main. The branch `fix/remediation-li-test-hygiene` is retained at `4a869f98`.
The logger-isolation value landed through PR #100; the large source scanner, the
known-violation baselines and the timeout widening stay excluded. A closing keyword in
commit text is a hazard this record names: describe closures in the plan's words
("closes in the disposition phase") only in files, never in a commit subject or body.

## Disposition inventories in progress

### PR #23 preliminary delta inventory (measured 20 September 2026, head 5fa82e88, base 35efaa45)

Sixty files. Twenty-six are absent from main by path; thirty-four exist on main with main
ahead of the branch. Per unique delta the closure record must state one of: reproduced
current gap with selected cure, already landed with exact evidence, superseded with a
reason, or unresolved investigation routed to an owning row. Mechanical findings so far:

- Moved, present on main: the concept-exploration skill (now under
  `.agent/skills/cognition/`); the statusline thread's substance (58 referencing files).
- Number collision: the branch's PDR-125 (adversarial verification of delegated work) is
  a different record from main's PDR-125 (inter-practice collaboration protocol); any
  extraction renumbers.
- Absent from main by path and by identifier: PDR-126 (machine identities for agent
  fleets), PDR-140 (we do not discard information), PDR-141 and the 343-line
  compound-agent-composition document, PDR-142 (three-tier fleet composition); the
  `lean-task-subagents` skill (305 lines) and its platform copies; the
  `adversarially-verify-subagent-output` rule and its platform copies; the `task-worker`
  template, its worker-reading-discipline behaviour and its Claude, Codex and Cursor
  adapters; `agent-projection.ts` and its unit test; `validate-subagents-template-checks.ts`.
- Code deltas where main has since moved on (branch delta vs its base): the subagent
  validators (codex-toml +138, adapter-validation +83, validate-subagents +61, unit test
  +288), the adapter generator (+137/-41 with its test), and pr-watch (report +28, cli
  +14, tests +104). Each needs an identifier-level comparison with main's current
  modules before extraction or retirement is recorded.
- Records that retire with the branch: its napkin, repo-continuity, pending-graduations
  and thread-record additions (superseded by main's later state), the transplant plan
  `resonance-practice-imports-2026-07.md`, and the experience file, which is conserved
  by the retained branch under the 26 August ruling.

Not yet done: the per-delta reading of every absent artefact against current Practice
doctrine (does main have a consumer for it?), and the identifier-level comparison of the
code deltas. Owning row: Q-13.

Identifier-level result for the code deltas (20 September): every identifier the branch
added to the subagent validators (`decodeTomlBasicKey`, `getCodexPermissionCompositionIssues`,
`getProjectionOnlyKeyIssues`, `getReadingDisciplineIssues`, `templateClassByPath` and their
companions), to the adapter generator (`claudeWorkerFrontmatter`, `cursorWorkerFrontmatter`,
`CLAUDE_WORKER_MODEL`), to `agent-projection.ts` (`AgentClass`, `AgentProjection`,
`readAgentProjection`, `WorkerTool`) and to pr-watch (`isAllGreen`, `allGreenLine`) is absent
from main. They are one feature: a worker agent class beside the reviewer class, with its
projection metadata, Codex permission composition and reading-discipline validation. The
Q-13 record decides it as a unit: either main has a present consumer for a worker class
(then it is a reproduced gap with the branch as a source, re-derived against main's current
validators) or it is retired with the reason that no doctrine on main calls for it. That
is a doctrine reading, not a mechanical one; the owner's 26 August parity ruling and the
stopped wholesale transplant are its inputs.
