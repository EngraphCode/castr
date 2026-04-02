# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

---

## What This Library Does

Transforms data definitions between supported formats via a canonical Intermediate Representation (IR):

```text
Any Input Format -> Parser -> IR (CastrDocument) -> Writers -> Any Output Format
```

Notes:

- TypeScript and Zod code generation use `ts-morph`
- OpenAPI output is produced as a typed object model
- JSON Schema output is produced as plain JSON Schema 2020-12 objects
- `lib` / `@engraph/castr` is the core compiler package; transport/runtime/framework helpers belong in separate companion workspaces if they are added

---

## Critical Rules

1. After parsing, input is discarded. Only the IR matters.
2. No content loss by default. Lossy behaviour must be explicit and governed.
3. Strict and complete everywhere, all the time: partial support, partial validation, partial docs, or partial proofs do not count as done.
4. Unsupported or invalid behaviour must fail fast with a helpful error.
5. Output must be deterministic.
6. Parsers and writers must stay in lockstep around canonical supported patterns.
7. No escape hatches in product code: no non-const assertions, `any`, `!`, or lint-disables to hide architecture problems.
8. TDD at all levels.
9. All quality-gate failures are blocking.
10. **All supported keywords must be fully supported.** Once a keyword is parsed into the IR, every downstream surface must either emit it losslessly or fail fast with an actionable error. Silent omission is a doctrine violation.

---

## Current State: Schema Completeness Arc Complete; OAS 3.2 Version Plumbing Next

### Completed Predecessor Plans

- [proof-system-and-doctrine-remediation.md](../plans/current/complete/proof-system-and-doctrine-remediation.md) — RC-1/RC-2 closed on Monday, 23 March 2026
- [architecture-review-packs.md](../plans/current/complete/architecture-review-packs.md) — seven-pack sweep staged completion record
- [anchor-and-dynamic-references.md](../plans/current/complete/anchor-and-dynamic-references.md) — Schema Completeness Arc Phase 2 completed on Sunday, 30 March 2026

### Cross-Pack Triage (Start Here)

- [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md) — root-cause clusters, dependency graph, and the slice ordering

### Recent Work

- All seven-pack architecture review findings (RC-1 through RC-7) are durably closed.
- **JSON Schema parser expansion** completed Tuesday, 25 March 2026:
  - `parseJsonSchemaDocument()` expanded from `$defs`-only extractor to full document parser
  - Supports standalone schemas, `$defs` bundles, and mixed documents
  - Root schema naming: `title` > `$id` > `"Root"`
  - `$anchor`/`$dynamicRef`/`$dynamicAnchor` supported: parsed into IR, lossless round-trip, Zod/TS fail-fast for dynamic keywords
  - 13 new unit tests, standalone fixture, 11 new integration round-trip proofs (scenario 5)
  - `writeJsonSchemaDocument` ↔ `parseJsonSchemaDocument` standalone round-trip proof added
- **`patternProperties`/`propertyNames` full-stack implementation** completed Wednesday, 26 March 2026:
  - IR model extended with both fields + runtime validator updated (6 new tests)
  - JSON Schema parser: keywords parsed from both JSON Schema and OpenAPI 3.1 input
  - JSON Schema writer: both keywords emitted to output
  - OpenAPI parser: `addPatternProperties()`/`addPropertyNames()` in 2020-12 builder
  - Zod + TypeScript writers: fail-fast with actionable error messages (2 new fail-fast tests)
  - Round-trip proof: `2020-12-keywords.json` fixture extended, Scenario 5 50/50 green
  - All quality gates green (`pnpm qg` exit 0)
  - Plan: [pattern-properties-and-property-names.md](../plans/current/complete/pattern-properties-and-property-names.md)
- **`prefixItems` tuple writer fix + `contains` keyword support** completed Wednesday, 26 March 2026:
  - Part A: Zod writer emits `z.tuple([...])`, TypeScript writer emits `[A, B]` tuple types
  - Part B: `contains` added to IR model, JSON Schema parser/writer, OpenAPI builder, Zod/TS fail-fast
  - Round-trip proofs: `ContainsSchema` in `2020-12-keywords.json`, Scenario 5 green
  - All quality gates green (`pnpm qg` exit 0)
  - Plan: [prefixitems-tuple-and-contains.md](../plans/current/complete/prefixitems-tuple-and-contains.md)
- **`if`/`then`/`else` conditional applicator support** completed Thursday, 27 March 2026:
  - IR model extended with `if`, `then`, `else` fields + runtime validator updated
  - JSON Schema parser: `parseConditionalApplicators()` with boolean schema support
  - JSON Schema writer: `writeConditionalApplicators()` in 2020-12 fields
  - Zod + TypeScript writers: fail-fast with actionable error messages (3 new tests)
  - Round-trip proof: `ConditionalApplicatorSchema` in `2020-12-keywords.json`, Scenario 5 green
  - All quality gates green (`pnpm qg` exit 0)
  - Plan: [if-then-else-conditional-applicators.md](../plans/current/complete/if-then-else-conditional-applicators.md)
- **Canonical egress normal form alignment** completed Friday, 28 March 2026:
  - Audit confirmed nullability (`[type, "null"]`) and `$ref` sibling policy (bare `$ref`) were already canonical
  - `example`/`examples` emission fixed: JSON Schema writer now suppresses OAS-only `example` and folds into `examples` (3 new unit tests)
  - ADR-042 documents the canonical normal form
  - All quality gates green (`pnpm qg` exit 0)
- **Input-Output Pair Compatibility Model** established Friday, 28 March 2026:
  - New governing doctrine enshrined in `principles.md`, `requirements.md`, `AGENT.md`, and `.agent/rules/input-output-pair-compatibility.md`
  - Feature support defined by input-output pairs, constrained by the output format
  - IR is the format-independent superset; fail-fast is only for genuinely impossible output mappings
  - Many existing Zod/TS fail-fast guards reclassified as **implementation gaps** requiring semantic output (not impossibilities)
- **Schema Completeness Arc — Phase 1** completed Friday, 28 March 2026:
  - All 9 Zod fail-fast guards upgraded to semantic `.refine()` runtime validation closures
  - `booleanSchema: true` upgraded: Zod → `z.any()`, TS → `unknown`
  - TS fail-fast error messages audited: "Genuinely impossible" prefix with detailed type-system explanations
  - New `refinements/` subdirectory: `object.ts` and `array.ts` — ADR-026 compliant (character-code constants, no regex/replace)
  - All quality gates green, 41/41 Zod tests + 14/14 TS tests passing
  - Format tensions table: **zero 🐛 markers remaining** in the Zod column

### Current Successor Workstream

- **Schema Completeness Arc**: ✅ COMPLETE — Phase 1, Phase 1.5, and Phase 2 are all closed. See [anchor-and-dynamic-references.md](../plans/current/complete/anchor-and-dynamic-references.md) for the final phase.
- **Primary active plan**: [oas-3.2-version-plumbing.md](../plans/active/oas-3.2-version-plumbing.md) — READY; this is the next atomic slice.
- **Companion active plan**: [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md) — planned successor once version plumbing lands.
- **Paused workstreams**:
  - [json-schema-parser.md](../plans/current/paused/json-schema-parser.md) — historical parser context only; do not reactivate unchanged.

### Deferred Future Threads

- Reference resolution enhancements: external `$ref` resolution, `$anchor`-based reference resolution (`$ref: "#myAnchor"`), `$dynamicRef`/`$dynamicAnchor` runtime scope resolution
- Parked research note: [multiformat-target-support.md](../research/multiformat-target-support.md)

### Format Tensions: IR Keywords vs Output Format Capabilities

The IR is format-neutral, but not all output formats can express every keyword. Support is defined by **input-output pairs**, constrained by the **output format** ([Input-Output Pair Compatibility Model](../directives/principles.md)). "Supported" means semantic preservation — not necessarily 1:1 mapping. Fail-fast is only for genuinely impossible output mappings. This table records the completed schema-completeness state against the current OpenAPI 3.1 output target; the planned OAS 3.2 version migration is tracked separately in the active plans.

Legend: ✅ supported | ❌ genuinely impossible | 🔲 not yet in IR

| IR Keyword                  | JSON Schema | OpenAPI 3.1  |      Zod       |  TypeScript   | Category                                                            |
| --------------------------- | :---------: | :----------: | :------------: | :-----------: | ------------------------------------------------------------------- |
| `patternProperties`         |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | Zod: semantic `.refine()`. TS: genuinely impossible.                |
| `propertyNames`             |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | Zod: semantic `.refine()`. TS: genuinely impossible.                |
| `dependentSchemas`          |     ✅      |      ✅      | ✅ `.refine()` | ✅ union type | TS: discriminated union with `never` markers for absent triggers.   |
| `dependentRequired`         |     ✅      |      ✅      | ✅ `.refine()` | ✅ union type | TS: discriminated union with `never` markers for absent triggers.   |
| `unevaluatedProperties`     |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | TS: genuinely impossible (no "unevaluated" concept in type system). |
| `prefixItems`               |     ✅      |      ✅      | ✅ `z.tuple()` |  ✅ `[A, B]`  | Fully supported.                                                    |
| `unevaluatedItems`          |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | Zod: semantic `.refine()`. TS: genuinely impossible.                |
| `contains`                  |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | Zod: semantic `.refine()`. TS: genuinely impossible.                |
| `minContains`/`maxContains` |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | Zod: semantic `.refine()`. TS: genuinely impossible.                |
| `booleanSchema`             |     ✅      | ❌ fail-fast |  ✅ `z.any()`  | ✅ `unknown`  | Zod: `z.any()`. TS: `unknown`. OAS: genuinely impossible.           |
| `if`/`then`/`else`          |     ✅      |      ✅      | ✅ `.refine()` | ❌ fail-fast  | TS: genuinely impossible (arbitrary runtime predicates).            |
| `$anchor`                   |     ✅      |      ✅      |  ✅ (ignored)  | ✅ (ignored)  | Reference marker only — no code-gen impact, preserved in round-trip |
| `$dynamicRef`               |     ✅      |      ✅      |  ❌ fail-fast  | ❌ fail-fast  | Genuinely impossible: dynamic scope resolution has no static equiv. |
| `$dynamicAnchor`            |     ✅      |      ✅      |  ❌ fail-fast  | ❌ fail-fast  | Genuinely impossible: dynamic scope resolution has no static equiv. |

> [!IMPORTANT]
> **Phase 1.5 complete: all four ❓ markers resolved.** `dependentRequired` and `dependentSchemas` are now ✅ (expressed as discriminated union types). `unevaluatedProperties` (schema-valued) and `if/then/else` are ❌ genuinely impossible.
>
> **Phase 2 complete: all three 🔲 markers resolved.** `$anchor`, `$dynamicRef`, `$dynamicAnchor` are now in the IR and all downstream surfaces. Zero 🔲 markers remain.

### Canonical Identity

- [IDENTITY.md](../IDENTITY.md)

### Immediate Predecessor

- [identity-doctrine-alignment.md](../plans/current/complete/identity-doctrine-alignment.md)

### Primary Active Plan

- [oas-3.2-version-plumbing.md](../plans/active/oas-3.2-version-plumbing.md)

### Companion Active Plan

- [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md)

### Parked Research Note

- [multiformat-target-support.md](../research/multiformat-target-support.md)

### Paused Workstreams

- [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)

### Pack Notes (Reference)

- [pack-2-canonical-ir-truth-and-runtime-validation.md](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md) — primary source for RC-3
- [pack-3-openapi-architecture.md](../research/architecture-review-packs/pack-3-openapi-architecture.md)
- [pack-4-json-schema-architecture.md](../research/architecture-review-packs/pack-4-json-schema-architecture.md)
- [pack-5-zod-architecture.md](../research/architecture-review-packs/pack-5-zod-architecture.md) — primary source for RC-4
- [pack-6-context-mcp-rendering-and-generated-surface.md](../research/architecture-review-packs/pack-6-context-mcp-rendering-and-generated-surface.md) — primary source for RC-5

## Current Repo Truth (Thursday, 2 April 2026)

IDENTITY doctrine alignment is complete:

- `unknownKeyBehavior` is removed from IR, parsers, and writers
- parser honesty is restored: non-object IR schemas no longer get `additionalProperties: false`
- public strictness/compatibility knobs are removed (`nonStrictObjectPolicy`, `strictObjects`, `additionalPropertiesDefaultValue`)
- non-strict object input is rejected at parser boundaries
- writers emit strict-only object output (`additionalProperties: false`, `z.strictObject()`)
- `CastrSchemaProperties` detection is now brand-based and cross-realm safe
- the full repo-root Definition of Done chain was last recorded green on Sunday, 30 March 2026

Current OpenAPI and generation truth:

- live code still targets OpenAPI 3.1.x today; OAS 3.2 version plumbing is the current active slice
- `schemas-only` now genuinely suppresses `endpoints`, `mcpTools`, and helper exports
- MCP tool schemas are normalised to a governed Draft 07 allowlist before AJV validation
- runtime clients, handler generation, framework bindings, and tRPC-style code-first integrations are companion-workspace concerns, not core `@engraph/castr` promises

RC-3 (IR and runtime validator gaps) is complete:

- `isCastrSchema` validates type, items, composition, required, additionalProperties (boolean-only), unevaluatedProperties (boolean or valid CastrSchema), and metadata (full CastrSchemaNode)
- `additionalProperties` enforced as boolean-only per IDENTITY doctrine; schema-valued `unevaluatedProperties` kept as it is actively used by OpenAPI 3.1 / JSON Schema 2020-12 parsers
- `trace` added to `VALID_HTTP_METHODS`
- test file split: `validators.schema.unit.test.ts` for schema/node tests, `validators.unit.test.ts` for document/operation tests

Proof-system and durable-doctrine remediation (Slice 1) is complete:

- `vitest.e2e` is fixed and promoted to the canonical gate chain (`pnpm test:e2e`)
- `ir-fidelity.test.ts` now asserts IR structural equality (the correct property), not code-gen identity
- `openapi-fidelity.test.ts` moved from `src/tests-e2e/` to `tests-e2e/`
- `test:scalar-guard` documented as off-chain development aid
- CLI identity changed from `data-descriptions-tooling` to `castr`
- acceptance criteria, ADR-035, and transform README already had current-state caveats from prior sessions
- `pnpm qg` is green with the new `test:e2e` gate

Pack verdict provenance:

- Packs 1 through 7 closed on Sunday, 22 March 2026 with point-in-time `yellow` / `red` review verdicts.
- Those verdicts are historical review snapshots, not current unresolved state.
- Current truth is the cross-pack triage record: all findings are resolved.

Recent completed slices (all gates green, all reviews closed):

- Core-vs-companion wording closure (2026-04-02): feature-parity planning inputs, Oak negotiation docs, and handoff surfaces now align with ADR-043; no live planning input still treats tRPC/runtime helpers as core `lib` promises
- Schema Completeness Arc Phase 1 (2026-03-28): all 9 Zod fail-fast guards upgraded to semantic `.refine()` closures, TS `booleanSchema` upgraded, TS error messages audited — zero 🐛 markers remaining
- Silent keyword drop fix + Boolean schema support (2026-03-27): all 2020-12 IR keywords now emit losslessly or fail-fast, `booleanSchema` added to IR/parser/writers
- Input-Output Pair Compatibility Model (2026-03-28): governing doctrine for feature support defined by input-output pairs

- RC-7 close remaining findings (2026-03-25): all RC-1/RC-2 findings verified and marked resolved in cross-pack triage, JSON Schema `parseJsonSchemaDocument()` fail-fast rejection seam for unsupported keywords, writer scope caveats
- RC-6 durable-doc over-claims remediation (2026-03-24): `public-api-preservation.test.ts` expanded from 6 legacy exports to full ~30 current surface, `scalar-pipeline.md` reframed eliminated `makeSchemaResolver()` as historical
- RC-5 downstream surface drift remediation (2026-03-24): `schemas-only` genuinely schemas-only, dead `templatePath` removed, MCP Draft 07 allowlist, proof-suite honest naming, template-context immutability
- RC-4 format-specific drift remediation (2026-03-24): OpenAPI requestBody egress, contradictory chain rejection, nested member fail-fast, reference declaration proof, format lockstep closure
- Proof-system and durable-doctrine remediation RC-1/RC-2 (2026-03-23): `test:e2e` promoted to canonical chain, CLI identity fixed, proof-suite naming and doc-scope honesty restored
- IDENTITY doctrine alignment (2026-03-21): parser honesty restored, dead strictness surfaces removed, cross-realm-safe runtime detection hardened
- Doctor rescue-loop redesign (2026-03-20): `rescueRetryCount` 1,159 → 1, `nonStandardRescue` 20,770ms → 31ms, `pnpm test:transforms` 25.88s → 6.92s
- Doctor runtime characterisation (2026-03-13): identified rescue loop as the cost centre
- int64/bigint semantics remediation (2026-03-13): first-class `integerSemantics` in IR

User-reported issue rule:

- if the user says there are gate or runtime issues, treat that as active session truth that must be reproduced immediately
- do not use an earlier local green run to dismiss a user-reported failure
- record the difference honestly as "last reproduced locally" versus "currently user-reported"

## Immediate Priority

The schema-completeness work is no longer the critical path. That arc is complete. The current next atomic slice is OAS 3.2 version plumbing.

**Critical path, in order:**

1. **Execute [oas-3.2-version-plumbing.md](../plans/active/oas-3.2-version-plumbing.md)** — this is the primary active plan.
2. **Keep docs honest while that work is pending** — current product output is still OpenAPI 3.1.x until the plumbing slice lands.
3. **Treat [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md) as the successor arc** — do not blur it into the version-plumbing slice.

**Rules:**

1. **If the user reports a fresh gate or runtime issue, reproduce it first.**
2. **Do not start implementation until a decision-complete plan exists.** The current one is `oas-3.2-version-plumbing.md`.
3. **Update handoff docs when truth changes** — roadmap, session-entry, active-plan markers, and napkin must stay honest.

## What This Session Should Do

OAS 3.2 version plumbing.

1. **Read the primary active plan first** — [oas-3.2-version-plumbing.md](../plans/active/oas-3.2-version-plumbing.md).
2. **If implementation is requested, keep the slice to version acceptance, normalisation, output, and handoff plumbing only.**
3. **Leave OAS 3.2 feature expansion to the companion successor plan unless the user explicitly redirects the work.**
4. **For doc-only or review-only work, keep the current 3.1 product truth explicit while pointing the next session at the 3.2 plan stack.**

## Quality Gates

Canonical definition: [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)

Canonical full chain, when code changes are made:

- `pnpm clean`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm format:check`
- `pnpm type-check`
- `pnpm lint`
- `pnpm madge:circular`
- `pnpm madge:orphans`
- `pnpm depcruise`
- `pnpm knip`
- `pnpm portability:check`
- `pnpm test`
- `pnpm character`
- `pnpm test:snapshot`
- `pnpm test:gen`
- `pnpm test:transforms`
- `pnpm test:e2e`

Quick alias: `pnpm qg` (runs the full canonical chain via turbo).

For review-only changes to plans, prompts, and notes:

- `pnpm format:check`
- `pnpm portability:check`

Treat every failure as blocking.

## Review State

Current honest state:

- `pnpm qg` was last recorded green on Sunday, 30 March 2026 (including `test:e2e`, after Schema Completeness Arc Phase 2)
- Schema Completeness Arc Phase 2 completed on Sunday, 30 March 2026 — [anchor-and-dynamic-references.md](../plans/current/complete/anchor-and-dynamic-references.md)
- RC-1/RC-2 (proof-system and durable-doctrine remediation) completed on Monday, 23 March 2026
- RC-3 (IR and runtime validator gaps) completed on Monday, 24 March 2026 — [ir-and-runtime-validator-remediation.md](../plans/current/complete/ir-and-runtime-validator-remediation.md)
- RC-4 (format-specific drift) completed on Monday, 24 March 2026 — [format-specific-drift-remediation.md](../plans/current/complete/format-specific-drift-remediation.md)
- RC-5 (downstream surface drift) completed on Monday, 24 March 2026 — all five Pack 6 findings resolved in-session
- RC-6 (durable-doc over-claims) completed on Monday, 24 March 2026 — `public-api-preservation.test.ts` expanded, `scalar-pipeline.md` reframed
- RC-7 (close remaining findings) completed on Tuesday, 25 March 2026 — JSON Schema fail-fast seam, all triage rows marked resolved
- the cross-pack triage is done and lives at [cross-pack-triage.md](../research/architecture-review-packs/cross-pack-triage.md) — all findings ✅
- the architecture review remediation arc is complete
- the paused `json-schema-parser.md` holds historical parser context; it must not reactivate unchanged

## Closed-Out Context

All three Zod/transform investigations are now closed:

- [zod-limitations-architecture-investigation.md](../plans/current/complete/zod-limitations-architecture-investigation.md)
- [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/complete/recursive-unknown-key-preserving-zod-emission-investigation.md)
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/complete/transform-proof-budgeting-and-runtime-architecture-investigation.md)

Residual future threads consolidated in:

- [zod-and-transform-future-investigations.md](../plans/future/zod-and-transform-future-investigations.md)

## Follow-On Work, Not A Blocker Here

- [temporal-first-js-ts-date-time-doctrine.md](../plans/future/temporal-first-js-ts-date-time-doctrine.md)
- [zod-and-transform-future-investigations.md](../plans/future/zod-and-transform-future-investigations.md)

Custom portable types remain deliberately unsupported for now and are not a planned workstream.

## Essential Reading

1. [roadmap.md](../plans/roadmap.md)
2. [requirements.md](../directives/requirements.md)
3. [principles.md](../directives/principles.md)
4. [testing-strategy.md](../directives/testing-strategy.md)
5. [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md)
