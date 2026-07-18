# Plan: Parallel Remediation Execution Program

**Status:** ACTIVE (program record; owner-approved 2026-07-17)
**Findings:** all 46 review IDs (C1–C6, H1–H7, M1–M13, L1–L19, N1) — full disposition table below
**Owner decisions:** recorded 2026-07-17 (scope; unowned findings; doctrine gating; timing)
**Related:** [README.md](./README.md), [02-ir-fidelity-proof-harness.md](../active/02-ir-fidelity-proof-harness.md),
[roadmap.md](../roadmap.md), [initial review](../../report/initial-review/)

---

## What this is

The owner-approved execution program that parallelises the remediation backlog (02–07 plus the
findings no plan owned) into **file-disjoint lanes**, each run by an isolated worktree agent on a
feature branch off `main`, one PR per lane, merges owner-invoked. It supersedes the sequential
numbering of plans 02–07 as an execution order (the plans remain the per-finding authority); it does
not supersede their acceptance criteria, which each lane carries verbatim.

Method note: the lane decomposition came from applying the concept-exploration workflow (four
movements) to the remediation roadmap and the plan of record, a firsthand file-collision
verification pass, and an `assumptions-expert` readiness review (verdict READY-WITH-CHANGES; all
changes applied — see §Readiness).

## Owner decisions (2026-07-17)

1. **Scope: product remediation + reconciliation only.** Practice-estate landings (D2/D4 branches,
   Oak parity program, Phase 9 closure) stay deferred at their existing named position — not parked.
2. **Unowned findings fixed in this program** (H5, H6, M6, M8, M9, M11, M13, most L-series, N1) —
   folded into lanes or micro-lanes; every ID disposed.
3. **Doctrine edits pre-authorized** in the strictest-of-three direction; exact wording reviewed by
   the owner at that lane's PR.
4. **Proceed now**; the pending estate-overhaul (W2) does not block product fixes.

## Execution rules (every lane)

- Branch `fix/remediation-<lane>-<slug>` off `main`, in an isolated worktree.
- Proof-first TDD: failing test authored first, red run captured, fix lands with proof as **one
  green cycle** — never a red-only landing.
- New transform tests/fixtures are additive: `lib/tests-transforms/__tests__/` +
  `lib/tests-transforms/__fixtures__/edge-cases/`; never edit
  `lib/tests-transforms/utils/transform-helpers.ts` fixture arrays.
- Gates: targeted vitest during the cycle; full `pnpm check:ci` before hand-off. Never `pnpm qg`
  directly. All warnings blocking.
- Stage by explicit pathspec; conventional commits ≤100-char lines via `git commit -F <file>`.
- Diff must stay inside the lane's owned files ∪ its new test/fixture files. Sanctioned overlap:
  additive one-line exports in barrel `index.ts` files.
- Before PR: adversarial verification (DoD re-run + diff-scope check) then the lane's reviewer
  panel; findings fixed and re-verified. PRs owner-merged only.

## Lane table

This document is the **authoritative, durable home** of the lane contracts. The full per-lane
specifications (owned files, forbidden zones, proof-first specs, deterministic DoD commands,
reviewer sets) live in §Lane specifications below; lane PR descriptions **reference** that section
rather than restating it. Summary:

| Lane       | Findings                                        | Scope centre                                                      | Size | Depends on                             |
| ---------- | ----------------------------------------------- | ----------------------------------------------------------------- | ---- | -------------------------------------- |
| L-A        | H7 (vacuous negatives), L13, harness convention | `tests-transforms` substrate + rendering test truth               | S/M  | none — merges first                    |
| L-B        | C6 (in full), H7 substring tests, M7, L16       | `writers/zod/refinements/**`, `generators/collections.ts`         | L    | L-A merged; rebase after feature merge |
| L-C        | C5                                              | `parsers/zod/composition/**`, `parsers/zod/types/**`              | M    | rebase after L-I + feature             |
| L-D        | C2, C3, M10, M12                                | OpenAPI operations/security IR + component names                  | L    | rebase on L-A                          |
| L-E        | M3, C4, L3, L5                                  | single-source guards + `ir/serialization.ts`                      | M    | none — merges second                   |
| L-F        | H1, H2, H4, L9–L12, L14 (+H6/L8 verify)         | `parsers/json-schema/**` + IR fields + `writers/shared/**`        | L    | rebase after L-E, L-A, feature         |
| L-H        | H3, M6, H5, L6, L19                             | `context/endpoints/**`, MCP responses, CLI options                | M    | none; H5 owner gate at PR              |
| L-I        | M4, M5                                          | test hygiene: runner relocation, logger sink, no-IO guard         | S    | merges before L-C rebase               |
| L-J        | M1, M2, L1, L2, L4                              | eslint rules + doctrine wording + horizontal sweep                | L    | ALL other lanes merged (wave 3)        |
| L-K1       | M8, M9 (wording)                                | `compatibility/*target-capabilities*`                             | S    | none                                   |
| L-K2       | M11, L17                                        | `shared/maybe-pretty.ts`                                          | S    | none                                   |
| L-K3+K5+K7 | L7, L15, N1                                     | batched micro-PR (MCP error fields; bundle clock; TS type-writer) | S    | none                                   |
| L-K6       | L18                                             | `lib/package.json` devDep (lockfile — merges alone)               | S    | none                                   |
| L-K8       | M13                                             | `parsers/openapi/components/**` document threading                | S    | after L-D merges                       |
| L-K9       | M9 (mapping)                                    | `writers/typescript/**` itemSchema sequential contract            | M    | after L-KBATCH merges                  |

The universal L-A and L-E edges (see §Merge waves) apply to every lane and are not repeated in the
Depends-on column.

## Lane specifications (authoritative)

Common to every lane: proof-first red evidence captured before the fix; targeted vitest commands
plus full `pnpm check:ci` green; diff confined to owned files ∪ the lane's new test/fixture files ∪
additive one-line barrel exports; conventional commits. New transform tests/fixtures are additive
under `lib/tests-transforms/__tests__/` and `lib/tests-transforms/__fixtures__/edge-cases/`;
`lib/tests-transforms/utils/transform-helpers.ts` is never edited. All paths below are under
`lib/` unless noted.

### L-A — Proof-harness substrate + test-truth (H7, L13)

- **Owned:** NEW `tests-transforms/utils/fidelity-harness.ts` (+ outcome recorder); NEW
  `tests-transforms/__fixtures__/edge-cases/README.md` + smoke fixture + smoke test;
  `src/rendering/templates/schemas-with-metadata.test.ts` (vacuous negatives → assert on
  `result.content`); `src/rendering/templating.unit.test.ts` (files-content equality across runs);
  harness note in `docs/architecture/`; DoD line in `.agent/directives/DEFINITION_OF_DONE.md`.
- **Forbidden:** all product code; `transform-helpers.ts`.
- **Proof-first:** smoke test written against the not-yet-created helper (red), then implement. The
  H7/L13 edits are assertion-strengthening; if one goes red a real suppression bug surfaced — fix
  or report, never weaken.
- **DoD:** the two rendering test files + transforms config run + `pnpm check:ci` green.
- **Reviewers:** test-reviewer, code-reviewer, architecture-expert-betty.

### L-B — Zod writer 2020-12 semantics, executes ADR-047 (C6, H7 substring tests, M7, L16)

- **Owned:** `src/schema-processing/writers/zod/refinements/{object,array,index}.ts` including the
  two placebo sites (`writeDependentSchemasRefinement`, `writeConditionalApplicatorRefinement`) —
  silent-wrong `return true` → real-or-fail-fast in ONE cycle (no interim throw; principles.md
  forbids placeholder fail-fast for expressible features);
  `writers/zod/generators/collections.ts` (recursion wiring; L16 array-`items` assert-or-throw);
  `writers/zod/__tests__/fail-fast.unit.test.ts` (rewrite to executed-validator tests) + NEW
  behaviour test file; `docs/architecture/zod-round-trip-limitations.md`; ADR-047 Consequences.
- **Forbidden:** `writers/zod/index.ts` (L-D's); `parsers/**`; `writers/shared/**`.
- **Proof-first:** compile emitted Zod (vm+transpile) and assert conforming input passes /
  violating input fails per keyword — red today (`return true` validates nothing; `typeof item ===
'integer'` is always false).
- **DoD:** no `.refine(... return true ...)` and no `typeof x === '<jsonSchemaType>'` remain in
  `writers/zod/`; emission order sorted (M7); inexpressible keywords fail fast with a throw proof;
  `pnpm check:ci` green.
- **Reviewers:** zod-expert, json-schema-expert, test-reviewer, code-reviewer.

### L-C — Zod parser strict whitelist (C5)

- **Owned:** `src/schema-processing/parsers/zod/composition/**`, `parsers/zod/types/**`,
  `parsers/zod/modifiers/**` if the chain dispatcher requires, their unit tests;
  `tests-fixtures/zod-parser/**` only if a fixture relied on silent drop.
- **Forbidden:** `writers/zod/**`; `zod-parser.runner.integration.test.ts` (L-I's).
- **Proof-first:** failing tests asserting **non-empty `errors`** (construct + location) for:
  mixed-coerce union member, tuple middle-member drop, `z.nativeEnum`, `.refine()` on a primitive
  chain, object-level `.refine()` — all currently `errors: []`.
- **DoD:** parser suite + transforms scenarios 2/4/6 + `pnpm check:ci` green; no
  `return undefined`/`continue` path drops a construct without a `PARSE_ERROR`.
- **Reviewers:** zod-expert, test-reviewer, code-reviewer.

### L-D — OpenAPI fidelity: security AND-groups + component-name identity (C2, C3, M10, M12)

- **Owned:** C2 — `src/schema-processing/parsers/openapi/operations/fields/builder.operations.fields.ts`,
  `ir/models/schema.operations.ts` (`IRSecurityRequirement` → requirement set),
  `ir/models/schema-document.ts`, `writers/openapi/openapi-writer.ts`,
  `writers/openapi/operations/openapi-writer.operations.fields.ts`,
  `context/mcp/template-context.mcp.security.from-ir.ts` + test. C3 —
  `parsers/openapi/schemas/builder.schemas.ts` (drop parse-time `toIdentifier`; original name = IR
  identity), `writers/openapi/components/openapi-writer.components.ts` (+ siblings if needed),
  `src/shared/utils/identifier-utils.ts`, `writers/typescript/helpers.ts`,
  `writers/zod/index.ts` (`$ref`-name path). M10 — `!== undefined` guards in the operations
  builders + `schemas/builder.enums.ts`. M12 — typed access replacing `Reflect.get/set`.
- **Forbidden:** `parsers/openapi/builder.core.ts` (L-F); `parsers/openapi/components/**` (L-K8);
  `context/endpoints/**`, `template-context.mcp.responses.ts` (L-H); `writers/zod/refinements/**`,
  `generators/**` (L-B); `writers/openapi/schema/**` (L-F).
- **Proof-first:** NEW fidelity transform tests: AND-group `[{apiKey: [], oauth2: ['read']}]`
  round-trips as ONE requirement object (red: splits to OR); `Basic.Thing` + `$ref` round-trips
  resolving with the dotted key preserved (red: dangles); `''` description ≠ absent (red: dropped).
- **DoD:** new fidelity tests + MCP/openapi-writer suites + `pnpm check:ci` green; zero `Reflect.`
  in the operations-fields builder.
- **Reviewers:** openapi-expert, security-expert, type-reviewer, test-reviewer, code-reviewer,
  mcp-expert.

### L-E — Single-source guards (M3, C4, L3, L5)

- **Owned:** `src/shared/type-utils/{types,type-guards,index}.ts` + unit tests;
  `src/shared/openapi/version.ts`; `src/shared/doctor/preflight-validator.ts`;
  `src/shared/load-openapi-document/additional-operations-validation/index.ts`;
  `src/schema-processing/ir/serialization.ts`; ~21 importer files (import-line repoints **plus
  call-site type adjustments** where the consolidated guard's return type differs — semantic
  changes stay forbidden); the four local `isCastrSchema` look-alikes (`builder.circular.ts`,
  `mcp.parameters.ts`, `mcp.schemas.json-schema.ts`, `mcp.inline-json-schema.ts`); NEW C4 fixture
  test. The canonical deep `isCastrSchema` in `ir/validation/validators.schema.ts` is KEPT.
- **Proof-first:** `isRecord({}) === true`, `isRecord([]) === false`, `isRecord(null) === false`
  (red against the divergent copies); C4 `buildIR({type:'object',properties:{}}) → serializeIR →
deserializeIR` round-trips (red: throws).
- **DoD:** exactly one `isRecord` + one `isCastrSchema`; `knip`/`depcruise` clean;
  `pnpm check:ci` green.
- **Reviewers:** type-reviewer, code-reviewer, test-reviewer.

### L-F — JSON-Schema keyword fidelity pipeline (H1, H2, H4, L9–L12, L14; H6/L8 verify)

- **Owned:** `src/schema-processing/parsers/json-schema/**` (keyword table + arbitrary-depth
  `$ref` rewriter; `$ref` siblings; content keywords; L10/L11 truth; L12 closed-world);
  `parsers/openapi/builder.core.ts` (OpenAPI-side `$ref` siblings);
  `conversion/json-schema/keywords/keyword-object.ts` (L14 fail-fast);
  `ir/models/schema.ts` (+`contentMediaType`/`contentSchema`);
  `ir/validation/validators.schema.ts` (new-field validation);
  `writers/shared/{json-schema-fields,json-schema-object,json-schema-2020-12-fields}.ts`;
  `writers/openapi/schema/openapi-writer.schema.ts` (L9); NEW fidelity tests/fixtures.
- **Forbidden:** `parsers/openapi/operations/**`, `parsers/openapi/schemas/**`,
  `parsers/openapi/components/**`; `writers/zod/**`; `src/shared/type-utils/**`;
  `ir/models/schema.operations.ts`, `schema-document.ts`.
- **Proof-first:** failing tests — boolean `exclusiveMinimum` nested in `then` normalised at depth;
  deep `#/definitions/Outer/properties/inner` rewritten; `$ref` siblings carried; content keywords
  round-trip; `contentEncoding` emitted; `patternProperties`-only object closed-world.
- **DoD:** json-schema parser + writers/shared suites + scenario-5 + new fidelity file +
  `pnpm check:ci` green; H6/L8 probes re-run and residue recorded (resolved by the feature merge).
- **Reviewers:** json-schema-expert, openapi-expert, type-reviewer, test-reviewer.

### L-H — Endpoints/MCP/CLI correctness (H3, M6, H5, L6, L19)

- **Owned:** `src/schema-processing/context/endpoints/**` (wildcard status tokens; delete dead
  `getOperationForEndpoint`); `context/mcp/template-context.mcp.responses.ts` + test (success
  selection incl. `2XX`/`default`); `context/template-context.ts` (`defaultStatusBehavior`,
  `complexityThreshold`); `src/cli/helpers.ts`, `src/cli/helpers.options.ts`; behaviour docs.
- **Forbidden:** `template-context.mcp.security.from-ir.ts` (L-D); `context/mcp/schemas/**`;
  `src/rendering/**`.
- **H5 verdict path:** implement `defaultStatusBehavior` (the documented behaviour,
  strictest-of-three) with proof. For each remaining documented-but-dead option the lane lands a
  **verdict with evidence** — implement where the documented semantics are complete, otherwise
  remove together with the doc correction — and the owner-invoked PR merge is the approval gate.
  Nothing is silently removed.
- **Proof-first:** failing tests — `'4XX'`/`'5XX'` preserved or fail-fast (red: `parseInt` → 4);
  `outputSchema` present for `'2XX'`-only success (red: skipped); `spec-compliant` filtering
  effective (red: unread); invalid `--default-status` throws (red: silent undefined).
- **DoD:** context + cli suites + `pnpm check:ci` green; L6 deleted (knip clean).
- **Reviewers:** mcp-expert, openapi-expert, code-reviewer, test-reviewer.

### L-I — Test hygiene (M4, M5)

- **Owned:** relocate `parsers/zod/zod-parser.runner.integration.test.ts` to the e2e/generated
  suite (drop `UPDATE_SNAPSHOTS` write branch + soft-skip); `src/shared/utils/logger.ts` + test
  (injected sink; delete types-only test); NEW architecture guard in `src/architecture/`
  (no fs.\* IO / no `vi.spyOn(console, …)` under the `pnpm test` glob — durable gate).
- **Forbidden:** `parsers/zod/**` source; `lib/eslint.config.ts` (L-J's).
- **Proof-first:** logger-sink test red (no injection point); guard red while the runner test still
  does IO, green after relocation.
- **DoD:** utils + architecture suites + full unit gate + `pnpm check:ci` green.
- **Reviewers:** test-reviewer, code-reviewer.

### L-J — Doctrine enforcement sweep (M1, M2, L1, L2, L4) — wave 3, runs alone

- **Owned:** `lib/eslint.config.ts`; NEW `lib/eslint-rules/**` + fixture tests; the surviving
  `Object.*`/`Reflect.*` uses (148/74 files today; fewer post-lanes) — refactor or governed
  allowance; lodash function-call-form fixes (~20 files); `principles.md` + ADR-026 wording —
  **owner wording-approval at PR before the doc-edit commit** (direction pre-authorized).
- **Proof-first:** rule fixture tests red (rules absent) → rules land → `src` refactored green.
- **Reviewers:** config-expert, architecture-expert-fred, code-reviewer, type-reviewer.

### Micro-lanes

- **L-K1** (M8+M9): `src/schema-processing/compatibility/integer-target-capabilities.traversal.ts`
  (add the six missing child-bearing keyword visits) + `item-schema-target-capabilities.ts` message
  honesty — the lane lands the policy-honest wording as its verdict; the PR merge is the approval
  gate. Proof: `int64` nested under `patternProperties`/`if` caught (red: skipped). Reviewers:
  code-reviewer, type-reviewer, json-schema-expert.
- **L-K2** (M11+L17): `src/shared/maybe-pretty.ts` fail-fast + typed omit. Proof: invalid TS input
  throws naming the source (red: silently returned). Reviewers: code-reviewer, test-reviewer.
- **L-K3+K5+K7 batch** (L7, L15, N1; one PR, one commit each):
  `src/validation/mcp-error-formatting.ts` populate `expected`/`received` or remove;
  `src/shared/load-openapi-document/bundle/bundle-infrastructure.ts` inject clock / drop
  time+cwd from output-bound metadata; `writers/typescript/type-writer/core.ts` literal
  unions/tuples or honest fail-fast — each lands as a lane verdict with evidence, approved at the
  PR merge. Reviewers: mcp-expert, type-reviewer, code-reviewer.
- **L-K6** (L18): `lib/package.json` devDep `ajv-draft-04` (+ root removal if verified unused);
  lockfile change — merges alone. Reviewers: config-expert.
- **L-K8** (M13): `src/schema-processing/parsers/openapi/components/builder.components.ts` +
  sibling component builders — thread the real document instead of the empty placeholder. Starts
  after L-D merges. Proof: end-to-end reproduction attempt first (red-first if it reproduces, else
  structural proof + note). Reviewers: openapi-expert, code-reviewer.
- **L-K9** (M9 representable-mapping remainder; added 2026-07-17 from L-K1's PR review — the
  reviewer correctly rejected wording-only closure because TypeScript can model the sequential
  item contract): implement the TS-writer/context `itemSchema` mapping so generation emits the
  contract instead of failing fast. Owned: `src/schema-processing/writers/typescript/**` + the
  context surfaces where `itemSchema` reaches the TS writer + tests; the L-K1 guard message then
  drops its unimplemented-mapping fail-fast for TS. **Starts after L-KBATCH merges** (shared
  type-writer files). Proof: red-first — a fixture with `itemSchema` currently fails fast; after,
  it emits the sequential contract. Reviewers: type-reviewer, openapi-expert, code-reviewer.
- **L-K10** (MCP nullability fold; added 2026-07-18 from PR #20's review — pre-existing class
  defect exposed by the multi-auth fixture correction, probe-verified by the L-E triage agent):
  three ad-hoc CastrSchema→JSON-Schema converters on the MCP context surface drop
  `metadata.nullable` while `writers/shared/json-schema-fields.ts#writeTypeField` folds it
  correctly — `castrSchemaToJsonSchemaForMcp`
  (`context/mcp/schemas/template-context.mcp.schemas.json-schema.ts`),
  `castrSchemaToJsonSchemaSimple` (`context/mcp/template-context.mcp.parameters.ts`), and
  `castrSchemaToJsonSchema` (`context/mcp/schemas/template-context.mcp.inline-json-schema.ts`).
  Fix is class-level: fold nullability once, converging on the shared writer machinery (the
  fourth-consumer consolidation), then regenerate the PR #20 snapshots. Owned:
  `src/schema-processing/context/mcp/**` (the three converters) + an MCP regression test
  asserting the null union across all four emission surfaces (request body, output schema,
  parameter sections, `$ref`-inlined). **Starts after L-E merges** (same three files as L-E's
  guard-consolidation diff). L-H's Forbidden entry for this surface stands — this is a dedicated
  lane, not an L-H extension. Proof: red-first — nullable IR emits scalar-only MCP schema today.
  Reviewers: mcp-expert, json-schema-expert, code-reviewer, test-reviewer.

## Merge waves

**The dependency edges are normative; any merge sequence must be a linearisation of them.** The
edges (blocker → blocked, with the shared surface that forces the order):

- L-A → every later lane (harness convention adopted on rebase; L-A merges first)
- L-E → every later lane except L-A (guard import/typing repoints; L-E merges second)
- L-I → L-C (the relocated runner test lives in L-C's directory)
- L-D → feature slice (`writers/zod/index.ts` C3 `$ref`-name path)
- feature slice → L-C (`parsers/zod/types/zod-parser.object.ts` + parser policy files)
- feature slice → L-F (`builder.core.ts`, `validators.schema.ts`,
  `json-schema-parser.object-fields.ts`, `json-schema-fields.ts`)
- feature slice → L-B (`generators/collections.ts`)
- L-D → L-K8 (`buildSchemaComponents`-adjacent signatures)
- L-E → L-K10 (the three MCP converter files are in L-E's guard-consolidation diff)
- every lane → L-J (horizontal sweep runs last)

Waves and the reference linearisation:

- **Wave 1** (dispatch simultaneously): L-A, L-C, L-D, L-E, L-F, L-H, L-I, L-K1, L-K2, L-K6,
  batched L-K3+K5+K7. Reference merge order: L-A, L-E, L-I, micros (L-K6 alone in its lockfile
  slot), L-H, L-D, **feature slice**, L-C, L-F — L-C and L-F take their final rebase over the
  feature merge, per the edges above.
- **Wave 2:** L-B (starts on L-A's merge; final rebase after the feature merge), L-K8 (starts on
  L-D's merge), L-K9 (starts on L-KBATCH's merge).
- **Wave 3:** L-J alone.

Critical path ≈ L-A → L-B → L-J.

## Feature-slice integration (position 3)

Trigger: L-D (C3) merges. Then rebase `feat/explicit-additional-properties-rebased` onto `main`,
full `pnpm check:ci` (the branch's Oak round-trip proof — its only red — is expected green once C3
is fixed; still-red = fresh reproduced regression, pre-empts the sequence), reviewer loop
(code-reviewer, type-reviewer, test-reviewer, openapi-expert, zod-expert, json-schema-expert,
mcp-expert), PR including the paused-plan status update, owner merge. The feature branch is itself
the resolution of H6/L8 — hence it merges before L-F's final rebase.

## Disposition table (all 46 IDs)

| Disposition                                       | IDs                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Already fixed (plan 01, merged)                   | C1                                                                                                                                                                                                                                                                                                                                                                                                       |
| Fixed by lane                                     | C2, C3 (L-D); C4 (L-E); C5 (L-C); C6 (L-B); H1, H2, H4 (L-F); H3, H5 (L-H); H7 (L-A + L-B); M1, M2 (L-J); M3 (L-E); M4, M5 (L-I); M6 (L-H); M7 (L-B); M8 (L-K1); M9 wording (L-K1) + mapping (L-K9); M10, M12 (L-D); M11 (L-K2); M13 (L-K8); L1, L2, L4 (L-J); L3, L5 (L-E); L6, L19 (L-H); L7 (L-K3); L9, L10, L11, L12, L14 (L-F); L13 (L-A); L15 (L-K5); L16 (L-B); L17 (L-K2); L18 (L-K6); N1 (L-K7) |
| Resolved by the feature slice, verified by lane   | H6, L8 (feature merge + L-F residue check)                                                                                                                                                                                                                                                                                                                                                               |
| Owner-disposition at PR (named, not parked)       | M9 (wording in L-K1; mapping implementation in L-K9), N1 direction, H5 dead-option cluster remainder, `complexityThreshold`                                                                                                                                                                                                                                                                              |
| New findings from PR reviews (routed, 2026-07-18) | MCP nullability fold (L-K10, from PR #20); Zod-writer carried `$ref` siblings (L-B, from PR #16 thread 8); the remaining named positions (L-C primitive-parser `.describe()` drop, `.meta()` unknown-key drop, `length(n)`/regex-flag gaps; L-H `outputSchema` derivation gap; L-F `cloneWithoutSharedKeywords`) are carried in the thread record §Pending decisions until dispositioned                 |

## Readiness

`assumptions-expert` audit (2026-07-17): READY-WITH-CHANGES, applied — (1) C6 interim-throw removed
from L-A (blast radius + principles.md forbids placeholder fail-fast for expressible features; C6
lands once in L-B, silent-wrong → real-or-fail-fast in one cycle); (2) feature-branch collisions
named as explicit merge-order edges; (3) L-E granted call-site type adjustments (guard return types
diverge). Validated firsthand: the two `return true` sites (`writers/zod/refinements/object.ts:130`,
`:183–190`), four `isRecord` definitions, M1 breadth 148 uses / 74 files, 46-ID coverage, per-lane
`pnpm check:ci` as the complete gate.

## Verification (program end)

Per lane: its DoD commands, re-runnable. Per Critical: named proof red→green (C2 AND-security
round-trip; C3 dotted-name `$ref` round-trip — the feature branch's Oak test is the gate-level
proof; C4 empty-properties serialize→deserialize; C5 non-empty `errors`; C6 executed-validator
accept/reject pairs). Program end: `pnpm check:ci` green on `main`; packaging e2e green; this
disposition table complete; feature branch merged; delivery ledger updated.

## Non-goals

Practice-estate landings (deferred, named position); the estate-overhaul (independent); D3/CI
modernisation (deprioritised); no new abstractions beyond what findings require;
strictest-of-three governs every disagreement.
