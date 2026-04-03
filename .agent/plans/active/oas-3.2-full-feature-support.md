# OAS 3.2 Full Feature Support

**Status:** ACTIVE — Primary active plan  
**Created:** 2026-03-31  
**Promoted:** 2026-04-03  
**Predecessor:** [oas-3.2-version-plumbing.md](../current/complete/oas-3.2-version-plumbing.md) (✅ complete, Thursday 2 April 2026)  
**Dependency:** Version plumbing is complete; keep feature work separate from the canonical-version baseline slice

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

| Phase | Features                                              | Effort | Dependencies |
| ----- | ----------------------------------------------------- | ------ | ------------ |
| A     | Version plumbing (separate plan)                      | Small  | None         |
| A₂    | **Type migration: drop `openapi3-ts`, adopt Scalar**  | Medium | Phase A      |
| B     | #1 QUERY method, #3 Hierarchical tags                 | Small  | Phase A₂     |
| C     | #6 OAuth2 Device, #7 XML nodeType, #8 Path templating | Small  | Phase A₂     |
| D     | #4 Example semantics                                  | Medium | Phase A₂     |
| E     | #5 itemSchema streaming, #2 additionalOperations      | Medium | Phase A₂     |

Phase A is complete. **Phase A₂ (type migration) must be completed before all feature phases**, because every subsequent feature relies on the Scalar types. Phases B and C can run in parallel after A₂. Phases D and E are independent.

---

## Phase A₂: Type Migration — Drop `openapi3-ts`, Adopt `@scalar/openapi-types`

**ADRs:** [ADR-044](../../directives/ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](../../directives/ADR-045-strict-reexport-module-openapi-types.md)

### Rationale

`openapi3-ts` does not support OAS 3.2 types. `@scalar/openapi-types` (already a direct dependency) provides a complete `OpenAPIV3_2` namespace including all 3.2 features. This migration eliminates the need for module augmentation and aligns our type system with the Scalar parser boundary.

### Strictness Strategy

Scalar makes all fields optional for user-input tolerance. The OAS spec explicitly REQUIRES 8 fields across 6 types. We restore these via TypeScript intersection narrowing in a single re-export module:

| Type                          | Required Fields Narrowed                   | OAS Spec Reference   |
| ----------------------------- | ------------------------------------------ | -------------------- |
| `ParameterObject`             | `name: string`, `in: ParameterLocation`    | §4.8.12 Fixed Fields |
| `RequestBodyObject`           | `content: Record<string, MediaTypeObject>` | §4.8.13 Fixed Fields |
| `ResponseObject`              | `description: string`                      | §4.8.17 Fixed Fields |
| `ExternalDocumentationObject` | `url: string`                              | §4.8.11 Fixed Fields |
| `TagObject`                   | `name: string`                             | §4.8.22 Fixed Fields |
| `DiscriminatorObject`         | `propertyName: string`                     | §4.8.25 Fixed Fields |

### Steps

1. **Create `lib/src/shared/openapi-types.ts`**
   - Import from `@scalar/openapi-types` `OpenAPIV3_2` namespace
   - Re-export all types used in the codebase (~20 type aliases)
   - Apply intersection narrowing on the 6 types with spec-required fields
   - Provide local `isReferenceObject` runtime guard (replaces the only runtime import from `openapi3-ts`)

2. **Migrate all imports** (~50 files)
   - Replace `from 'openapi3-ts/oas31'` with `from '../shared/openapi-types.js'` (relative paths)
   - Includes both `import type` and `import { isReferenceObject }` sites
   - Map `OpenAPIObject` → `OpenAPIDocument` (Scalar uses `Document`)
   - Map `SchemaObjectType` → union of `NonArraySchemaObjectType | ArraySchemaObjectType`
   - Map `XmlObject` → `XMLObject` (Scalar uses uppercase XML)

3. **Delete `openapi-schema-extensions.d.ts`**
   - Module augmentations for `$dynamicRef`, `$dynamicAnchor`, `unevaluatedItems`, `unevaluatedProperties`, `dependentSchemas`, `$vocabulary` are no longer needed — Scalar's `OpenAPIV3_2.SchemaObject` includes all of these natively via its 3.1 base (`BaseSchemaObject`)

4. **Remove `openapi3-ts` from `package.json`**

5. **Update `BundledOpenApiDocument`**
   - Replace `OpenAPIObject` (openapi3-ts) with types from the strict re-export module
   - Simplify the junction type since both sides are now Scalar-typed

6. **Run full quality gate chain** (`pnpm qg`)

### Verification

- All existing tests must pass with zero changes to test logic (only import paths change)
- `pnpm type-check` confirms strictness narrowings are compatible
- `pnpm knip` confirms `openapi3-ts` is fully removed
- Round-trip proofs continue to pass unchanged

---

## `additionalOperations` IR Model — RESOLVED (ADR-046)

**Decision: Separate storage on `CastrDocument`.**

Custom-method operations from OAS 3.2 `additionalOperations` will be stored in a dedicated `additionalOperations` field on `CastrDocument`, not folded into the existing `operations` array. Rationale:

1. **Type safety** — `IRHttpMethod` stays a closed union; exhaustiveness checks, `VALID_HTTP_METHODS`, `PATH_ITEM_METHOD_SETTERS`, and sorting logic are preserved
2. **Lossless round-trip** — the writer knows exactly which operations go into `pathItem.additionalOperations` vs `pathItem[method]`
3. **Validation** — custom method names are validated separately (non-empty, no overlap with standard methods)

An `allOperations(doc)` helper will be provided for consumers that need to iterate both lists.

---

## Aggregate Support Matrix (Complete)

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
