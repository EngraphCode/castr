# OAS 3.2 Full Feature Support

**Status:** PLANNED — Medium-term implementation arc
**Created:** 2026-03-31
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

**IR changes:** PathItem-level storage for custom operations, OR fold into `CastrOperation` with extended method type
**Effort:** Medium — new operation extraction path, ~50-100 lines + tests

### Feature 3: Hierarchical Tags

| Surface     | Support                                                       | Rationale                           |
| ----------- | ------------------------------------------------------------- | ----------------------------------- |
| IR          | ✅ Extend `TagObject` usage (already uses `openapi3-ts` type) | Need type extension for new fields  |
| OAS Parser  | ✅ Pass through (already preserves tag objects)               | Verify new fields survive           |
| OAS Writer  | ✅ Emit as-is                                                 | Already emits tag objects           |
| JSON Schema | N/A                                                           | Tags are an OAS concept             |
| Zod         | N/A                                                           | Tags don't affect schema generation |
| TypeScript  | N/A                                                           | Tags don't affect type generation   |

**IR changes:** Extend `TagObject` type or add `parent?: string`, `kind?: string`, `summary?: string` to IR tag type
**Effort:** Small — type extension + round-trip proof, ~20 lines

### Feature 4: Example Semantics (`dataValue` / `serializedValue`)

| Surface     | Support                                                          | Rationale                                                              |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| IR          | ✅ Extend `ExampleObject` or create `IRExample` with both fields | Must carry both value types                                            |
| OAS Parser  | ✅ Parse `dataValue`, `serializedValue` from Example Objects     | New field extraction                                                   |
| OAS Writer  | ✅ Emit both fields                                              | New emission fields                                                    |
| JSON Schema | ✅ (partial)                                                     | Schema-level `examples` unchanged; component examples carry new fields |
| Zod         | N/A                                                              | Examples are documentation-only                                        |
| TypeScript  | N/A                                                              | Examples are documentation-only                                        |

**IR changes:** May need custom `IRExampleObject` if `openapi3-ts` types don't include 3.2 fields. Affects `IRExampleComponent`, `IRMediaType.examples`, `CastrParameter.examples`, `IRResponseHeader.examples`.
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

**IR changes:** None if `openapi3-ts` types include the flow; type extension if not
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

**IR changes:** None if `openapi3-ts` types include `nodeType`; type extension if not
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

## Implementation Order (Recommended)

Ordered by dependency and increasing complexity:

| Phase | Features                                              | Effort | Dependencies |
| ----- | ----------------------------------------------------- | ------ | ------------ |
| A     | Version plumbing (separate plan)                      | Small  | None         |
| B     | #1 QUERY method, #3 Hierarchical tags                 | Small  | Phase A      |
| C     | #6 OAuth2 Device, #7 XML nodeType, #8 Path templating | Small  | Phase A      |
| D     | #4 Example semantics                                  | Medium | Phase A      |
| E     | #5 itemSchema streaming, #2 additionalOperations      | Medium | Phase A      |

Phases B and C can run in parallel. Phase D and E are independent.

---

## Type Dependency Decision

`openapi3-ts` does not support OAS 3.2 types. Two options:

1. **Thin type extensions** — extend existing `openapi3-ts/oas31` types with OAS 3.2 fields via module augmentation or wrapper interfaces. Keeps the existing dependency.
2. **Migrate to `oas-types`** — npm package with complete OAS 3.2.0 type definitions. Replaces `openapi3-ts`.

**Recommended: Option 1** for now. Migration to `oas-types` is a larger change that can be evaluated separately. Type extensions are minimal and scoped.

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

---

## Open Questions

> [!IMPORTANT]
> **Type dependency strategy:** Should we migrate from `openapi3-ts` to `oas-types` as part of this arc, or defer that decision? The thin-extension approach works but adds maintenance burden if many fields are needed.

> [!IMPORTANT]
> **`additionalOperations` IR model:** Should custom HTTP methods fold into the existing `CastrOperation` with an extended method type, or should they be stored separately? The former is simpler for writers; the latter preserves the OAS structure more faithfully.
