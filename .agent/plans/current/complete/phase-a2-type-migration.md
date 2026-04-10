# OAS 3.2 Type Migration (Phase A₂)

**Status:** Complete — staged closure record; AP1/AP2/AP3/AP4 closed, repo-root validation green, and reviewer loop closed on Friday, 10 April 2026.  
**Parent:** [OAS 3.2 Full Feature Support](../../active/oas-3.2-full-feature-support.md)  
**ADRs:** [ADR-044](../../../../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](../../../../docs/architectural_decision_records/ADR-045-strict-reexport-module-openapi-types.md)  
**Lifecycle:** Moved from `.agent/plans/active/` to `.agent/plans/current/complete/` during the Friday, 10 April 2026 docs-consolidation pass so `active/` retains one honest execution entrypoint.  
**Updated:** 2026-04-10 — AP4 close-out recorded, reviewer loop closed, and this file promoted into staged-complete as the durable closure record.

This plan replaces `openapi3-ts` with `@scalar/openapi-types` via explicit interfaces in a strict re-export module.

> [!NOTE]
> This file is a completion record, not the active execution plan. Reopen it only if a fresh regression is reproduced on the landed Phase A₂ surface.

---

## Goal

- Drop the `openapi3-ts` dependency.
- Create a strict re-export module using explicit interfaces derived from `@scalar/openapi-types` `OpenAPIV3_2` types.
- Strip `AnyOtherAttribute`'s `[key: string]: any` from all types to restore correct `isReferenceObject()` type-guard narrowing and preserve `noPropertyAccessFromIndexSignature: true`.
- Ensure spec-required fields remain strictly required via explicit interface declarations.
- Remediate all structural incompatibilities between Scalar's type design and our strict tsconfig.

---

## Resolved Design Decisions

### D1: Index Signature Remediation — Explicit Interfaces ✅ (REVISED)

Scalar's `AnyOtherAttribute` adds `[key: string]: any` to every type via intersection through the V3 base types. This causes two critical problems:

1. **`isReferenceObject()` narrows to `never`**: Because `ReferenceObject` with `[key: string]: any` is a structural supertype of every other type, `Exclude<ReferenceObject, T>` collapses both sides to `never`.
2. **TS4111 with `noPropertyAccessFromIndexSignature: true`**: Every dot-property access on any OpenAPI type triggers TS4111.

**Decision:** Define all re-exported types as **explicit interfaces** listing named properties only, without index signatures.

> [!IMPORTANT]
> The earlier `RemoveIndexSignature<T>` approach was abandoned because it fails on Scalar's `Modify<Omit<...>>` composition chains — TypeScript cannot enumerate named properties from intermediate mapped types. This is a fundamental TS limitation with composed structural types.

**Vendor extensions:** `OpenAPIDocument` uses `[ext: \`x-${string}\`]: unknown`— a template literal pattern index signature that allows`doc['x-ext']`bracket access without creating structural overlap with`ReferenceObject`.

### D2: SchemaObject Boolean Inclusion — Object-form only ✅

Scalar's `SchemaObject` includes `boolean` in the union (spec-correct for JSON Schema 2020-12 §4.3.2). Our `SchemaObject` is object-form only.

**Decision:** `SchemaObject` is a fully explicit interface listing all ~50 properties from the V3/V3.1/V3.2 `BaseSchemaObject` chain plus our JSON Schema 2020-12 additions. Boolean schemas are handled at parsing boundaries via explicit `| boolean` unions.

### D3: Test Fixture Versions — Per-fixture assessment during AP3/AP4

Each test fixture using `openapi: '3.0.0'` / `'3.1.0'` needs individual assessment. This is a per-fixture judgement during AP3/AP4.

---

## Current State (2026-04-10)

### ✅ AP1: Re-export module — COMPLETE

`lib/src/shared/openapi-types.ts` rewritten with explicit interfaces for 20+ OpenAPI types. `isReferenceObject()` narrowing verified. `noPropertyAccessFromIndexSignature: true` restored.

### ✅ AP2: Production/model corrections — COMPLETE (0 errors)

All 5 error families resolved:

| Family | Error                                     | Fix Applied                                                                                                                                                                                             |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1     | `JsonSchemaObject` → `SchemaObject` (8→0) | Removed index signature from `JsonSchemaObject`, added explicit named properties for all writer extras (`xml`, `externalDocs`, `discriminator`, `contains`, `$anchor`, `$dynamicRef`, `$dynamicAnchor`) |
| F2     | Content map widening (5→0)                | Widened `visitContentSchemas`, `buildResponseContent`, `buildRequestBodyContent` to accept `ReferenceObject \| MediaTypeObject` with `isReferenceObject` filtering                                      |
| F3     | `undefined` guards (1→0)                  | Added `info` undefined guard in `buildIR` with descriptive error                                                                                                                                        |
| F4     | `querystring` location (2→0)              | Added `querystring` to `toParameterType` and `parametersByLocation` initializer                                                                                                                         |
| F5     | Fixture `description` (3→0)               | Added required `description` field to response objects in `template-context-fixtures.ts`                                                                                                                |

### ✅ AP3: Test/support migration — COMPLETE

Historical starting point: 72 mechanical test/support errors after the seam swap. Those are now cleared.

AP3 outcomes:

- `pnpm --dir lib type-check` is green
- checked `@ts-expect-error` directives were removed across the active `lib` source/test surfaces
- targeted regressions now cover canonical boundary validation, raw `schemaExamples`, distinct `querystring` / `queryString` handling, and media-type component ref round-trips
- `lib/src/schema-processing/conversion/json-schema/openapi-schema-extensions.d.ts` is deleted

### ✅ AP4: Final validation and dependency exit — COMPLETE

Session-verified AP4 close-out on Friday, 10 April 2026:

- introduced a genuinely nested raw OpenAPI input layer so OAS 3.0 bridge syntax stays boundary-only while canonical `OpenAPIDocument` and canonical schema types remain strict downstream
- retyped the remaining spec-compliance fixtures to raw 3.0 vs 3.1 input documents, restoring compile-time version distinction without weakening the canonical seam
- preserved ref-bearing `components.pathItems` and schema-less reusable `components.mediaTypes` through parse → IR → writer, and added direct media-type resolver proof for success, missing target, wrong component type, and cycle fail-fast paths
- removed the verified `schema-processing/ir` barrel cycle, removed the duplicate CLI guard export, and cleared the stale `knip` ignore hint
- strengthened the dependency-exit safety net so protected layers fail on `OpenAPIObject` alias imports, direct `@scalar/openapi-types` imports, and any future `openapi3-ts` reintroduction
- updated the affected transform, architecture, component-access, and snapshot proofs to match the truthful seam and IR behaviour
- `pnpm format:check`, `pnpm type-check`, the targeted Vitest suites, `pnpm madge:circular`, `pnpm knip`, the targeted active-surface `openapi3-ts` grep, and repo-root `pnpm qg` are all green

---

## ✅ Assumption Outcomes

### ✅ A7: `principles.md` doctrine references are stale — RESOLVED

**Evidence:** Principle #5 and other locations referenced `openapi3-ts` instead of the canonical `shared/openapi-types.js`.
**Resolved:** User explicitly granted authority during doc consolidation to update `principles.md` and `requirements.md`. All stale references have been replaced. Doctrine cohesive with implementation.

### ✅ A1: `SchemaObject.examples` remains raw `unknown[]` — RESOLVED

**Decision:** Keep `SchemaObject.examples` as the JSON Schema 2020-12 raw-value array (`unknown[]`), not Scalar's `ExampleObject[]`.

**Evidence:** OAS 3.2 continues to treat the Schema Object as JSON Schema 2020-12 plus named OAS additions, and the JSON Schema `examples` keyword is an array of raw values. A local Scalar runtime probe confirmed the upgrade path leaves schema-level `examples` as raw arrays while normalizing only parameter/media-type example surfaces into named Example Objects.

**Consequence:** Scalar's `OpenAPIV3_2.BaseSchemaObject.examples?: ExampleObject[]` is treated as an upstream mismatch that our strict seam corrects. We do not propagate that mismatch into IR or public surfaces.

**Implementation outcome:** complete. Schema-level `examples` stay lossless end to end, `convert-schema.ts` no longer rewrites object-shaped raw examples by shape, stale schema `examples.default` assumptions are gone, and `schemaExamples` is explicit on the public parameter metadata surfaces.

### ✅ A2: `querystring` remains a distinct query model

**Decision:** Keep `'querystring'` in the seam and IR as a first-class parameter location instead of coercing it to `'query'`.

**Implementation outcome:**

- public parameter metadata uses `ParameterType = 'QueryString'`
- generated request surfaces use `request.queryString`
- MCP input schemas use `queryString`
- mixed `query` + `querystring` operations are rejected with an actionable error instead of being silently merged

### ✅ A3: Content maps and `components.mediaTypes` preserve refs losslessly

**Decision:** Treat content maps and reusable media types as ref-capable surfaces that must survive parse → IR → writer intact.

**Implementation outcome:**

- `IRMediaTypeEntry = IRMediaType | ReferenceObject`
- request bodies, responses, headers, parameters, and `components.mediaTypes` now preserve ref entries instead of dropping them
- shared helpers resolve `#/components/mediaTypes/{name}` when a schema is required
- transform regression coverage proves the refs round-trip through the OpenAPI writer

### ✅ A4: Boundary-only input is split from the canonical validated document

**Decision:** Keep `OpenAPIDocument` as the canonical downstream type and introduce `OpenAPIInputDocument` for raw tolerant input.

**Implementation outcome:**

- canonical `openapi`, `info`, `info.title`, `info.version`, and `server.url` are required again
- `ResponseObject.description` is optional per the 3.2 surface we now model
- `PathItemObject.$ref` is present
- `ParameterObject.content` and `ComponentsObject.mediaTypes` are widened to the ref-capable forms we actually ingest/write
- boundary validation now rejects missing canonical fields instead of weakening the canonical type

### ✅ A5: Writer assignability and explicit output property coverage are closed

**Decision:** Keep the explicit output property list and treat dynamic-property dependence as a bug, not a type escape hatch.

**Implementation outcome:**

- the writer code now compiles without index-signature escape hatches
- the stale schema augmentation file is deleted
- the remaining work is dependency/comment cleanup, not another writer-type remediation pass

### ✅ A6: Explicit-interface completeness now has a drift safety net

**Decision:** Guard the most load-bearing upstream shape signals with a narrow drift harness instead of assuming whole-graph structural assignability.

**Implementation outcome:**

- `lib/src/shared/openapi-types.drift.test.ts` now checks the critical upstream signals we depend on (`querystring`, `content`, `mediaTypes`, `PathItem.$ref`)
- this intentionally does **not** claim whole-graph assignability to Scalar; the seam still corrects vendor mismatches such as schema-level `examples`

---

## Execution Approach

> [!IMPORTANT]
> Use **iterative exploration with assessment points**. At each point, if the error count exceeds expectations, wind back, reflect, and refine understanding before continuing.

### Assessment Point 1: Re-export module compiles ✅ COMPLETE

### Assessment Point 2: `src/` production code migrated ✅ COMPLETE (0 errors)

### Assessment Point 3: Assumption review complete ✅

A2-A6 are resolved, and the locked A1 follow-up is implemented.

### Assessment Point 4: Assumption-driven corrections complete ✅

Distinct `querystring`, ref-capable content/mediaTypes, canonical/boundary split, and raw schema example handling are all landed with regressions.

### Assessment Point 5: Test and support code migrated ✅

The historical 72-error mechanical test/support backlog is cleared; `pnpm --dir lib type-check` is green.

### Assessment Point 6: Final validation and dependency exit ✅ COMPLETE

The AP4 cleanup sweep is closed honestly: the boundary-accurate input seam landed, the verified reviewer findings were addressed, the dependency-exit gates are green, and the reviewer loop is closed with no open findings.

---

## Reviewer Loop Closure

Direct project-agent fan-out was not available in this Codex surface, so the reviewer loop used the installed in-session fallback defined in `.agent/rules/invoke-reviewers.md`: read the adapter in `.codex/agents/<agent>.toml`, then the canonical template in `.agent/sub-agents/templates/<agent>.md`, then review the final AP4 diff in-session.

- `code-reviewer` — **APPROVED**; no open gateway findings remained on the final AP4 diff
- `type-reviewer` — **APPROVED**; the raw input seam, strictness corrections, and IR/media-type contracts all closed cleanly without new widening escapes
- `test-reviewer` — **COMPLIANT**; the added/updated proofs now cover the reviewer-raised behaviour gaps rather than mirroring implementation
- `openapi-expert` — **APPROVED**; the final seam, parser, IR, and writer behaviour is honest for the touched OpenAPI 3.0/3.1/3.2 surfaces

## Verification Record

- `pnpm format:check` - green on Friday, 10 April 2026
- `pnpm type-check` - green on Friday, 10 April 2026
- `pnpm exec vitest run --config vitest.snapshot.config.ts tests-snapshot/spec-compliance/oas-3.0-vs-3.1-feature-parity.test.ts tests-snapshot/spec-compliance/openapi-spec-compliance.test.ts` - green on Friday, 10 April 2026
- `pnpm exec vitest run --config vitest.transforms.config.ts tests-transforms/output-coverage.integration.test.ts tests-transforms/__tests__/parser-field-coverage.integration.test.ts tests-transforms/__tests__/writer-field-coverage.integration.test.ts` - green on Friday, 10 April 2026
- `pnpm --dir lib exec vitest run src/architecture/layer-boundaries.arch.test.ts src/shared/component-access.test.ts src/schema-processing/ir/media-types/index.unit.test.ts src/validation/cli-type-guards.test.ts` - green on Friday, 10 April 2026
- `pnpm madge:circular` - green on Friday, 10 April 2026
- `pnpm knip` - green on Friday, 10 April 2026
- targeted active-surface `openapi3-ts` grep across `README.md`, `docs/USAGE.md`, `docs/EXAMPLES.md`, `docs/MCP_INTEGRATION_GUIDE.md`, `docs/guides/openapi-3.1-migration.md`, `lib/src`, `lib/tests-snapshot`, `scripts`, and `lib/package.json` - clean on Friday, 10 April 2026
- repo-root `pnpm qg` - green on Friday, 10 April 2026

## Explicit Deferred Follow-Up

- The pending MCP no-params input-schema bug (`{ type: "object", "additionalProperties": false }`) was not re-verified during AP4 close-out. Keep it as the next follow-up before feature phases B/C resume, or explicitly defer it in the parent plan if current session truth proves it unrelated.
