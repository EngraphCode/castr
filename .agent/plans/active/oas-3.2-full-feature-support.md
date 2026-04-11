# OAS 3.2 Full Feature Support

**Status:** ACTIVE — Primary active plan  
**Created:** 2026-03-31  
**Promoted:** 2026-04-03  
**Predecessor:** [oas-3.2-version-plumbing.md](../current/complete/oas-3.2-version-plumbing.md) (✅ complete, Thursday 2 April 2026)  
**Dependency:** Version plumbing is complete; keep feature work separate from the canonical-version baseline slice  
**Updated:** 2026-04-11 — Phase B is closed: `QUERY` now lands end to end, hierarchical-tag proof is green, repo-root `pnpm check` is green, and Phase C is the immediate next proof sweep

---

## Goal

Implement full support for all OAS 3.2.0 features across the IR, parsers, and writers. Each feature follows the Input-Output Pair Compatibility Model: the IR must carry the feature, and each output format either emits it semantically or fails fast with an actionable error.

---

## OAS 3.2 Feature Inventory

| #   | Feature                | OAS Object      | New Fields                          | Complexity      |
| --- | ---------------------- | --------------- | ----------------------------------- | --------------- |
| 1   | `QUERY` HTTP method    | PathItem        | `query` operation                   | Low             |
| 2   | `additionalOperations` | PathItem        | `additionalOperations` map          | Medium          |
| 3   | Hierarchical tags      | Tag             | `parent`, `kind`, `summary`         | Low             |
| 4   | Example semantics      | Example Object  | `dataValue`, `serializedValue`      | Medium          |
| 5   | `itemSchema` streaming | Media Type      | `itemSchema`                        | Medium          |
| 6   | OAuth2 Device flow     | Security Scheme | `deviceAuthorization` under `flows` | Low             |
| 7   | XML `nodeType`         | XML Object      | `nodeType`                          | Low             |
| 8   | Path templating        | Path            | ABNF formalization                  | Low (validator) |

---

## Input-Output Pair Support Matrix

Each feature must be classified per output format using the compatibility model.

### Feature 1: `QUERY` HTTP Method

| Surface     | Support                                  | Rationale                                                |
| ----------- | ---------------------------------------- | -------------------------------------------------------- |
| IR          | ✅ Add `'query'` to `IRHttpMethod` union | Trivial enum addition                                    |
| OAS Parser  | ✅ Accept `query` in path item parsing   | Already iterates methods                                 |
| OAS Writer  | ✅ Emit `query` operations               | Same pattern as existing methods                         |
| JSON Schema | N/A                                      | JSON Schema has no operation concept                     |
| Zod         | ✅                                       | Zod schemas for query parameters work same as any method |
| TypeScript  | ✅                                       | Types are method-agnostic                                |

**IR changes:** `IRHttpMethod` union + `VALID_HTTP_METHODS` set
**Effort:** Small — ~10 lines + tests

### Feature 2: `additionalOperations`

| Surface     | Support                                                      | Rationale                            |
| ----------- | ------------------------------------------------------------ | ------------------------------------ |
| IR          | ✅ Add `additionalOperations` to `CastrDocument` or per-path | Map of custom method → operation     |
| OAS Parser  | ✅ Parse `additionalOperations` from PathItem                | New extraction function              |
| OAS Writer  | ✅ Emit `additionalOperations` in output                     | New emission function                |
| JSON Schema | N/A                                                          | No operation concept                 |
| Zod         | ✅                                                           | Schema generation is method-agnostic |
| TypeScript  | ✅                                                           | Type generation is method-agnostic   |

**IR changes:** Separate storage on `CastrDocument` per ADR-046 — preserves `IRHttpMethod` type safety, ensures lossless round-trip
**Effort:** Medium — new operation extraction path, ~50-100 lines + tests

### Feature 3: Hierarchical Tags

| Surface     | Support                                                 | Rationale                                 |
| ----------- | ------------------------------------------------------- | ----------------------------------------- |
| IR          | ✅ Fields come from `@scalar/openapi-types` `TagObject` | `parent`, `kind`, `summary` already typed |
| OAS Parser  | ✅ Pass through (already preserves tag objects)         | Verify new fields survive                 |
| OAS Writer  | ✅ Emit as-is                                           | Already emits tag objects                 |
| JSON Schema | N/A                                                     | Tags are an OAS concept                   |
| Zod         | N/A                                                     | Tags don't affect schema generation       |
| TypeScript  | N/A                                                     | Tags don't affect type generation         |

**IR changes:** Type naturally includes `parent`, `kind`, `summary` via Scalar's `OpenAPIV3_2.TagObject`
**Effort:** Small — verify pass-through + round-trip proof, ~20 lines

### Feature 4: Example Semantics (`dataValue` / `serializedValue`)

| Surface     | Support                                                      | Rationale                                                              |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| IR          | ✅ Fields come from `@scalar/openapi-types` `ExampleObject`  | `dataValue`, `serializedValue` already typed                           |
| OAS Parser  | ✅ Parse `dataValue`, `serializedValue` from Example Objects | New field extraction                                                   |
| OAS Writer  | ✅ Emit both fields                                          | New emission fields                                                    |
| JSON Schema | ✅ (partial)                                                 | Schema-level `examples` unchanged; component examples carry new fields |
| Zod         | N/A                                                          | Examples are documentation-only                                        |
| TypeScript  | N/A                                                          | Examples are documentation-only                                        |

**IR changes:** Scalar's `OpenAPIV3_2.ExampleObject` includes both fields natively. Affects `IRExampleComponent`, `IRMediaType.examples`, `CastrParameter.examples`, `IRResponseHeader.examples`.
**Effort:** Medium — multiple touch points in IR model + round-trip, ~60-80 lines

### Feature 5: `itemSchema` Streaming

| Surface     | Support                               | Rationale                               |
| ----------- | ------------------------------------- | --------------------------------------- |
| IR          | ✅ Add `itemSchema` to `IRMediaType`  | Schema for stream items                 |
| OAS Parser  | ✅ Parse `itemSchema` from Media Type | New field extraction                    |
| OAS Writer  | ✅ Emit `itemSchema`                  | New field emission                      |
| JSON Schema | N/A                                   | Not a JSON Schema concept               |
| Zod         | ❌ fail-fast                          | No streaming schema concept in Zod      |
| TypeScript  | ❌ fail-fast                          | No streaming schema concept in TS types |

**IR changes:** `IRMediaType.itemSchema?: CastrSchema`
**Effort:** Medium — new IR field + parser + writer + fail-fast, ~40-60 lines

### Feature 6: OAuth2 Device Authorization Flow

| Surface     | Support                                    | Rationale                                       |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| IR          | ✅ Pass through via `SecuritySchemeObject` | Already stores raw security scheme objects      |
| OAS Parser  | ✅ Already pass-through                    | Security schemes stored as raw objects          |
| OAS Writer  | ✅ Already pass-through                    | Emitted as-is                                   |
| JSON Schema | N/A                                        | Not a JSON Schema concept                       |
| Zod         | N/A                                        | Security schemes don't affect schema generation |
| TypeScript  | N/A                                        | Security schemes don't affect type generation   |

**IR changes:** None — Scalar types include `deviceAuthorization` on `OAuthFlows` natively
**Effort:** Low — verify pass-through works, add test, ~10 lines

### Feature 7: XML `nodeType`

| Surface     | Support                         | Rationale                                  |
| ----------- | ------------------------------- | ------------------------------------------ |
| IR          | ✅ Pass through via `XmlObject` | Already stores raw XML objects             |
| OAS Parser  | ✅ Already pass-through         | XML metadata stored as raw objects         |
| OAS Writer  | ✅ Already pass-through         | Emitted as-is                              |
| JSON Schema | ✅                              | XML object preserved in JSON Schema output |
| Zod         | N/A                             | XML doesn't affect Zod schema generation   |
| TypeScript  | N/A                             | XML doesn't affect type generation         |

**IR changes:** None — Scalar types include `nodeType` on `XMLObject` natively
**Effort:** Low — verify pass-through works, add test, ~10 lines

### Feature 8: Path Templating (ABNF)

| Surface      | Support      | Rationale                                     |
| ------------ | ------------ | --------------------------------------------- |
| IR           | ✅ No change | Paths stored as strings                       |
| OAS Parser   | ✅           | Path parsing already handles templates        |
| OAS Writer   | ✅           | Paths emitted as-is                           |
| IR Validator | ⚠️ Optional  | Could add ABNF-based path template validation |
| All Writers  | ✅           | Path strings pass through unchanged           |

**IR changes:** None
**Effort:** Low — verify existing behavior, optional validator enhancement

---

## Implementation Order

Ordered by dependency and increasing complexity:

| Phase | Features                                              | Effort | Dependencies | Status                         |
| ----- | ----------------------------------------------------- | ------ | ------------ | ------------------------------ |
| A     | Version plumbing (separate plan)                      | Small  | None         | ✅ complete                    |
| A₂    | **Type migration: drop `openapi3-ts`, adopt Scalar**  | Medium | Phase A      | ✅ complete                    |
| B     | #1 QUERY method, #3 Hierarchical tags                 | Small  | Phase A₂     | ✅ complete (Saturday, 11 Apr) |
| C     | #6 OAuth2 Device, #7 XML nodeType, #8 Path templating | Small  | Phase A₂     | ▶ next                         |
| D     | #4 Example semantics                                  | Medium | Phase A₂     | queued after Phase C           |
| E     | #5 itemSchema streaming, #2 additionalOperations      | Medium | Phase A₂     | queued after Phase D / Phase C |

Phases A, A₂, and B are complete. The MCP no-params tool-input-schema follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected, and the affected snapshot proofs are green. Phase B also closed on Saturday, 11 April 2026: native `3.2.0` `query` operations now survive parser -> IR -> writer and downstream endpoint/MCP consumers, hierarchical tags have explicit parser/writer proof, and repo-root `pnpm check` is green. Phase C is now the primary next atomic slice, and it should remain the immediate follow-on proof sweep unless a fresh regression redirects the session. Phases D and E remain independent afterwards.

### Metacognitive Refinement: Why Phase C Comes Next

A deeper code audit already established why Phase B had to come first. That work is now landed, which sharpens the next-step recommendation again:

- Feature #1 `QUERY` is now wired honestly across the core operation pipeline: the IR/public method unions include `'query'`, parser extraction and duplicated raw PathItem visitors no longer skip it, writer ordering emits `pathItem.query` explicitly, and downstream MCP hints treat it as read-only/non-destructive without broadening idempotent semantics.
- Feature #3 hierarchical tags now have explicit proof that `parent`, `kind`, and `summary` survive parser -> IR -> writer round-trips through a native OpenAPI 3.2 fixture.
- Phase C (`deviceAuthorization`, XML `nodeType`, path templating) remains the next smallest honest slice because the current evidence still points to proof-oriented pass-through work rather than fresh infrastructure: security schemes are stored raw, XML metadata already round-trips as metadata, and paths already flow through as strings.
- The existing native proof base is now `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`; extend that fixture first for Phase C instead of creating scattered one-off proof fixtures unless a reproduced regression forces a different path.
- Feature #2 `additionalOperations` still belongs later. It touches the same path-item operation area as `QUERY`, but it also carries the ADR-046 separate-storage design, so it should not be bundled into the smallest next slice.
- Repo-root `pnpm check` remains the required aggregate gate before any later phase closes. Use `pnpm check:ci` only when a non-mutating rerun is needed, and do not invoke `pnpm qg` directly.

---

## Phase B: `QUERY` + Hierarchical Tags

**Status:** COMPLETE on Saturday, 11 April 2026.

**What landed:**

- `query` is now part of the public `HttpMethod` union, the IR `IRHttpMethod` union, and runtime method validation.
- OpenAPI parser extraction, duplicated raw PathItem visitors, integer-capability traversal, writer emission/order, endpoint mapping, and MCP hints all treat `query` as a first-class standard method.
- MCP currently treats `query` as read-only/non-destructive without broadening idempotent semantics beyond the existing policy.
- Hierarchical tag fields `summary`, `parent`, and `kind` now have explicit parser/writer proof rather than relying on unproven pass-through.

**Proof base:**

- Native fixture: `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`
- Targeted parser/writer proof suites now cover both `query` and hierarchical tags.
- Repo-root `pnpm check` is green after the slice.

**Next entrypoint:**

- Extend `phase-b-native-3.2.yaml` for Phase C proof work (`deviceAuthorization`, XML `nodeType`, path templating`) unless a fresh gate or runtime regression is reproduced first.

---

## Phase A₂: Type Migration — Drop `openapi3-ts`, Adopt `@scalar/openapi-types`

**Status:** COMPLETE on Friday, 10 April 2026. AP4 closed with a nested raw OpenAPI input seam, restored `components.pathItems` and schema-less `components.mediaTypes` fidelity through IR, a green full repo-root gate chain plus `pnpm madge:circular` / `pnpm knip` / targeted `openapi3-ts` greps, and a closed reviewer loop with no open findings. The parent workstream's MCP no-params tool-input-schema strictness follow-up also closed on Saturday, 11 April 2026. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating rerun is required; do not invoke `pnpm qg` directly. At the time of this close-out, the next execution entrypoint was the then-pending Phase B slice; with Phase B now closed, the active next entrypoint is Phase C.  
**ADRs:** [ADR-044](../../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](../../docs/architectural_decision_records/ADR-045-strict-reexport-module-openapi-types.md)  
**Detailed completion record:** [phase-a2-type-migration.md](../current/complete/phase-a2-type-migration.md)

### Resolved Decisions

- **D1 (REVISED):** Explicit interfaces strip Scalar's `[key: string]: any` pollution. `RemoveIndexSignature<T>` was abandoned — it fails on `Modify<Omit<...>>` composition chains.
- **D2:** `SchemaObject` is a fully explicit ~50-property interface — object-form only, boolean handled at boundaries
- **D3:** Test fixture versions assessed per-fixture during AP3/AP4
- **A1:** `SchemaObject.examples` stays raw `unknown[]`; public metadata surfaces expose `schemaExamples` instead of inventing a fallback example
- **A2-A4:** `querystring` stays distinct, content/media-type refs plus `components.mediaTypes` are preserved losslessly, and the tolerant input boundary is split from the canonical validated document type
- **A5-A6:** writer assignability is closed, and a narrow drift harness guards the critical upstream `@scalar/openapi-types` shape signals

### Execution (Iterative Assessment Points)

1. **AP1 ✅ COMPLETE:** Re-export module with explicit interfaces compiles
2. **AP2 ✅ COMPLETE:** Production code — 0 errors (5 families resolved)
3. **Assumption-driven replacement pass ✅ COMPLETE:** distinct `querystring`, ref-capable content/mediaTypes, canonical/boundary split, and lossless schema examples are all landed in production/public surfaces
4. **AP3 ✅ COMPLETE:** test/support code migrated, checked `@ts-expect-error` directives removed, targeted regressions added, and `openapi-schema-extensions.d.ts` deleted
5. **AP4 ✅ COMPLETE:** the boundary-accurate fixture typing, IR/media-type fidelity fixes, dependency-exit cleanup, gate reruns, and reviewer loop are all closed on Friday, 10 April 2026
6. **Post-close-out follow-up ✅ COMPLETE:** MCP no-params tool-input-schema strictness closed on Saturday, 11 April 2026; parameterless tools now emit a closed empty-object schema and, at that point, Phase B became the next atomic slice. With Phase B now closed, Phase C is the immediate follow-on proof sweep.

> [!NOTE]
> Phase A₂ is closed. Its detailed completion record now lives in `current/complete` so `active/` keeps one honest execution entrypoint. Reopen this slice only if a fresh regression is reproduced.

---

## `additionalOperations` IR Model — RESOLVED (ADR-046)

**Decision: Separate storage on `CastrDocument`.**

Custom-method operations from OAS 3.2 `additionalOperations` will be stored in a dedicated `additionalOperations` field on `CastrDocument`, not folded into the existing `operations` array. Rationale:

1. **Type safety** — `IRHttpMethod` stays a closed union; exhaustiveness checks, `VALID_HTTP_METHODS`, `PATH_ITEM_METHOD_SETTERS`, and sorting logic are preserved
2. **Lossless round-trip** — the writer knows exactly which operations go into `pathItem.additionalOperations` vs `pathItem[method]`
3. **Validation** — custom method names are validated separately (non-empty, no overlap with standard methods)

An `allOperations(doc)` helper will be provided for consumers that need to iterate both lists.

---

## Aggregate Support Matrix (Target State)

| Feature                           | IR  | OAS Writer | JSON Schema |     Zod      |  TypeScript  |
| --------------------------------- | :-: | :--------: | :---------: | :----------: | :----------: |
| QUERY method                      | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |
| additionalOperations              | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |
| Hierarchical tags                 | ✅  |     ✅     |     N/A     |     N/A      |     N/A      |
| Example dataValue/serializedValue | ✅  |     ✅     |     ✅      |     N/A      |     N/A      |
| itemSchema streaming              | ✅  |     ✅     |     N/A     | ❌ fail-fast | ❌ fail-fast |
| OAuth2 Device flow                | ✅  |     ✅     |     N/A     |     N/A      |     N/A      |
| XML nodeType                      | ✅  |     ✅     |     ✅      |     N/A      |     N/A      |
| Path templating                   | ✅  |     ✅     |     N/A     |      ✅      |      ✅      |

**Legend:** ✅ supported | ❌ genuinely impossible | N/A not applicable to format

---

## Quality Gates

Each phase must pass `pnpm check` before the next begins.
