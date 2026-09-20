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
  the 12 September zsh predecessor. The two formats differ. The predecessor's header is
  `===== <label> base=<sha> branch=<name> <time>` and its footer `===== done <time>`;
  the current script's header is `===== <label> base=<sha> head=<sha> main=<sha> <time>`
  and its footer `===== done <time> failures=<n>`. The seven older outputs are
  historical evidence, not reproducible by the current script byte for byte.
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

### PR #26 disposition, 20 September 2026

Head `dc9adddf`, base `b62d73ab`; two files, `lib/src/shared/maybe-pretty.ts` and its test.
One delta: `maybePretty` throws (with the offending source and the formatter error as
`cause`) instead of returning the unformatted input, and drops the `plugins` option
through `omit` rather than destructuring. On main at `0ad80a41` the function still
returns the input from its `catch`. The gap register row "Component names starting with
a digit emit invalid TypeScript and `maybePretty` returns the unformatted source" names
#26 as the source of the swallow's cure and the #18 identity slice as the producer's.
Disposition: a claimed uncured gap, transferred to that register row (source branch
`fix/remediation-lk2-maybe-pretty` at `dc9adddf`; red-test obligation: a generated
source Prettier cannot parse must make generation fail, under item 4). #26 closes
without merge with its branch retained.

### PR #20 disposition, 20 September 2026

Head `9e29c4df`, base `b62d73ab`; thirty-two files. Its two new test files were run
against unpatched main at `0ad80a41` (copied in, run, removed):

- `lib/tests-transforms/__tests__/fidelity-empty-properties.integration.test.ts`
  (`pnpm exec vitest run --config vitest.transforms.config.ts <file>`): both cases fail,
  `deserializeIR(serializeIR(buildIR(document)))` throws `Invalid CastrDocument structure`
  for an object schema whose `properties` is `{}` with `additionalProperties: false`. A
  reproduced current gap: an empty properties map is a valid object (register row "Two
  `isRecord` guards with different semantics", doctrine column) and IR persistence must
  round-trip it.
- `lib/src/shared/openapi/version.unit.test.ts` (`pnpm exec vitest run <file>`): six of
  seven pass; `detectOpenApiPreflightSchemaVersion` accepts an array carrying an
  `openapi` property because `version.ts` keeps a local `isRecord` that admits arrays.
  A reproduced current gap of the same family.

The remaining deltas (the `isRecord` unification across sixteen callers, the
`UnknownRecord` type, the MCP inline-schema and parameter guard rewrites, the circular
and preflight validator simplifications, the snapshot changes) are the register row's
"#20 as reference only" material: each caller is re-derived for whether it relied on
non-emptiness before the guards are unified, under item 4. Disposition: two claimed
gaps transferred to that register row with the red tests as retained evidence (source
branch `fix/remediation-le-single-source-guards` at `9e29c4df`; the test files are on
that branch and the commands above reproduce them); the rest is reference material.
#20 closes without merge with its branch retained.

### Register transfers for the seven code containers, 20 September 2026

The gap register of 12 September was built from these containers, so every claimed gap
already has a row naming its container as source. Each record below lists the row (or
rows) the container transfers to, the probe evidence measured on unpatched main at
`0ad80a41` (the table above), and the deltas that are reference material rather than
claimed gaps. Each PR closes without merge with its branch retained at the head named;
the register row, not the PR, then carries the gap, and item 4 lands the red test with
its cure.

- **PR #12** (`7f4d23d6`, six files): transfers to the traversal row ("Capability
  traversal skips `patternProperties`, `propertyNames`, `if`/`then`/`else`, `contains`").
  Probe: its new unit suite fails four of five cases on main; the assertions name the
  candidate's own error text, so the retained evidence is the behaviour (an unsupported
  `itemSchema` position must throw), not the message. Reference material: the
  contextual-diagnostics wording. Branch `fix/remediation-lk1-capability-guards`.
- **PR #13** (`a18d2943`, twenty-six files): transfers to the Zod row ("Zod parser drops
  unrecognised chained methods silently; `.or()` and `.array()` shorthands unparsed").
  Probe: both new fail-fast suites are red on main (57 of 58 cases), because main still
  admits constructs it should reject; the assertions are doctrine-shaped (rejection of
  the unrecognised input) and count as retained evidence. Reference material: the
  blanket catchall rejection, which the ledger already rules out under the ratified
  value semantics (Q-05 owns the nested-loss repair). Branch
  `fix/remediation-lc-zod-parser-whitelist`.
- **PR #15** (`529a7a70`, twenty-five files): transfers to three rows (bundle metadata
  embedding time and cwd, subject to that row's red-test condition; TypeScript literal
  widening and `null` type-array members; MCP validation errors with empty `expected`
  and `received`). Probe: its new integration suite is red on main (three of three),
  asserting `string | null` members, doctrine-shaped. Reference material: the nine
  integration snapshots that move to literal unions. Branch
  `fix/remediation-lkbatch-micro-fixes`.
- **PR #16** (`f94065e4`, forty-two files): transfers to the JSON Schema row ("`$ref`
  siblings, draft-07 `additionalItems`, content keywords not carried round trip"), whose
  source column already requires re-derivation against Q-04 (nested booleans landed
  there; thirteen files conflict). Probe: four new suites are red on main on sibling
  and content keywords (doctrine-shaped); `json-schema-2020-12-fields.unit.test.ts`
  fails on a helper main lacks and the transforms suite on a fixture the branch adds,
  so both are re-run with their companions before they count. The branch's fail-fast
  for `unevaluatedProperties` and `unevaluatedItems`, and its finding that
  `cloneWithoutSharedKeywords` deletes those keywords with `dependentSchemas` and
  `prefixItems` before union-member conversion, transfer to the same row, widened to
  name them: main parses both keywords and emits refinements for them, but its MCP
  draft-07 path strips them silently (tested as stripping) and the union path still
  deletes them. Reference material: the omitted-additional-properties policy, which the
  ledger replaces. Branch `fix/remediation-lf-json-schema-fidelity`.
- **PR #17** (`de4abf4d`, twenty-seven files): transfers to three rows (wildcard
  statuses lost at projection; numeric successes other than `200`–`204`/`2XX` sent to
  the error branch; CLI options mapped to `undefined` silently). Probe: three new
  suites are red on main (16 of 40 cases), doctrine-shaped on status projection and
  option validation. Reference material: the old primary-response selection and the
  unused options, which the 20 September review §9 corrects. Branch
  `fix/remediation-lh-endpoints-mcp-cli`.
- **PR #18** (`9c93ccaa`, fifty-five files), delta by delta, against the ledger's
  6 September section: grouped security requirements and anonymous access, landed
  through Q-03 and PR #50; the operation-level `security: []` override, landed through
  PR #86; document-level `security: []` loss, reproduced on 6 September and transferred
  to its own register row (source: this slice; C08/identity-interactions carrier);
  the `x-` extension under a path item read as a path, reproduced by the probe below
  and transferred to its own register row with the retained suite as evidence; the
  identity slice (wire names, collision-safe generated symbols), transferred to the
  digit-names row whose source column names it for the producer; the description,
  reference and hostile-key deltas, unresolved investigations routed to the ledger's
  owning rows (Q-12, tranches 03 and 06), where the exact subset evidence is
  re-derived. Probe: the operations suite is red on main (extension skipping,
  doctrine-shaped); the helpers suite asserts the candidate's rename entries
  (reference only); the specification-extensions suite and the transforms suite need
  a module and a fixture the branch adds. Branch `fix/remediation-ld-security-and-names`.
- **PR #27** (`a48eced8`, one hundred and four files): transfers to the
  `additionalProperties` row ("Parser rejects explicit `.catchall()` and writer always
  emits `strictObject`") and to the recursive-catchall row, whose source column already
  says the honest error lands with the admission. Probe: its new unit suite could not
  be placed because its directory does not exist on main; it is re-run inside the
  branch's own directory before it counts. Reference material: the fixture rewrite,
  which the review §12 says to justify individually, and the rejected recursive
  catchalls. Branch `feat/explicit-additional-properties-rebased`.

With #20 and #26 above, nine containers transfer; #11 and #21 are recorded above; #23
is Q-13; #81 keeps its C09 exception. Every branch is retained.

### Red-test probes of the seven code containers' new test files, 20 September 2026

Each test file the container adds (none of them exists on main) was copied onto
unpatched main at `0ad80a41`, run under its own vitest config, and removed. "Red on main"
means the file's assertions fail on main; whether an assertion derives from doctrine or
from the candidate's own output is read per test in each container's closure record,
so this table is evidence about behaviour, not yet a disposition. An import or fixture
error means the test depends on a module or fixture the container also adds and is
re-run with them before it counts.

| PR  | New test file                                                                                   | Result on unpatched main                                 | First failure                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| #12 | `lib/src/schema-processing/compatibility/item-schema-target-capabilities.unit.test.ts`          | red; Tests 4 failed                                      | 1 passed (5)                                                                                                  |
| #13 | `lib/src/schema-processing/parsers/zod/composition/zod-parser.fail-fast.unit.test.ts`           | red; Tests 35 failed (35)                                | AssertionError: expected [ { type: 'schema', name: 'S', …(2) } ] to have a length of +0 but got 1             |
| #13 | `lib/src/schema-processing/parsers/zod/types/zod-parser.fail-fast.unit.test.ts`                 | red; Tests 22 failed                                     | 1 passed (23)                                                                                                 |
| #15 | `lib/src/schema-processing/writers/typescript/type-writer.null-type-member.integration.test.ts` | red; Tests 3 failed (3)                                  | AssertionError: expected 'import { z } from "zod"; // Type Defi…' to contain 'alpha: string                   |
| #16 | `lib/src/schema-processing/parsers/json-schema/json-schema-parser.ref-siblings.unit.test.ts`    | red; Tests 23 failed                                     | 7 passed (30)                                                                                                 |
| #16 | `lib/src/schema-processing/parsers/openapi/builder.core.ref-siblings.unit.test.ts`              | red; Tests 3 failed                                      | 1 passed (4)                                                                                                  |
| #16 | `lib/src/schema-processing/writers/openapi/schema/openapi-writer.schema.fidelity.unit.test.ts`  | red; Tests 6 failed                                      | 1 passed (7)                                                                                                  |
| #16 | `lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.unit.test.ts`              | red; Tests 5 failed (5)                                  | TypeError: isThenBranchStaticallyUnreachable is not a function                                                |
| #16 | `lib/src/schema-processing/writers/shared/json-schema-fields.unit.test.ts`                      | red; Tests 7 failed                                      | 3 passed (10)                                                                                                 |
| #16 | `lib/tests-transforms/__tests__/fidelity-json-schema-keywords.integration.test.ts`              | red; Tests 13 failed (13)                                | Error: ENOENT: no such file or directory, open 'lib/tests-transforms/**fixtures**/edge-cases/draft-07-nested- |
| #17 | `lib/src/cli/helpers.test.ts`                                                                   | red; Tests 4 failed                                      | 2 passed (6)                                                                                                  |
| #17 | `lib/src/schema-processing/context/endpoints/template-context.status-codes.unit.test.ts`        | red; Tests 9 failed                                      | 22 passed (31)                                                                                                |
| #17 | `lib/src/schema-processing/context/template-context.default-status.unit.test.ts`                | red; Tests 3 failed (3)                                  | AssertionError: expected [ 'logoutUser', 'listUsers' ] to deeply equal [ 'listUsers' ]                        |
| #18 | `lib/src/schema-processing/parsers/openapi/operations/builder.operations.unit.test.ts`          | red; Tests 2 failed (2)                                  | AssertionError: expected [ '/users', 'x-router' ] to deeply equal [ '/users' ]                                |
| #18 | `lib/src/schema-processing/writers/typescript/helpers.unit.test.ts`                             | red; Tests 5 failed (5)                                  | Error: generated helper does not embed the safeSchemaName-derived rename entries                              |
| #18 | `lib/src/shared/openapi/specification-extensions.unit.test.ts`                                  | import or fixture error; Tests no tests                  | Error: Cannot find module './specification-extensions.js' imported from lib/src/shared/openapi/specification- |
| #18 | `lib/tests-transforms/__tests__/fidelity-security-and-names.integration.test.ts`                | import or fixture error; Tests 16 failed (16)            | Error: Failed to load OpenAPI document (lib/tests-transforms/**fixtures**/edge-cases/security-and-group.yaml) |
| #27 | `lib/src/schema-processing/writers/zod/__tests__/recursive-catchall.unit.test.ts`               | red; no run: the target directory does not exist on main |                                                                                                               |

Reading of the first failures: #13's fail-fast suites fail because main still accepts
unrecognised Zod constructs it should reject (register row "Zod parser drops
unrecognised chained methods silently"); #16's `$ref`-sibling and keyword suites fail
because main drops sibling keywords and content keywords (register row "JSON Schema
`$ref` siblings, draft-07 `additionalItems`, content keywords not carried round trip"),
except `json-schema-2020-12-fields.unit.test.ts`, which fails on a helper main lacks;
#17's suites fail on wildcard statuses and default-status projection (register row
"Wildcard response statuses `1XX`..`5XX` lost at endpoint projection" and the
default-status finding of the 20 September review §9); #18's operations suite fails
because an `x-` extension under a path item is read as a path (register row on
extension skipping), while its helpers suite asserts the candidate's own rename
entries; #15's suite fails on `string | null` type members; #12's suite asserts the
candidate's error text, and its behaviour (throwing on unsupported `itemSchema`) is the
register's traversal row. #27's suite needs its directory created before it can run.

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
