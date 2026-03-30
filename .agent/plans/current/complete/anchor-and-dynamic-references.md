# Phase 2: $anchor, $dynamicRef, $dynamicAnchor — IR Expansion

**Status:** ✅ COMPLETE — Sunday 30 March 2026
**Created:** 2026-03-29
**Predecessor:** Schema Completeness Arc Phase 1.5 (✅ complete, 2026-03-29)

---

## Goal

Resolve the three 🔲 markers in the format tensions table by adding `$anchor`, `$dynamicRef`, and `$dynamicAnchor` to the IR and all downstream surfaces.

These are **IR Rule 3 violations**: features that exist in JSON Schema 2020-12 (a supported input format) but are missing from the IR. The project doctrine says the IR must carry all input features.

---

## Done So Far (Code Changes)

### IR Model ✅

- `$anchor?: string`, `$dynamicRef?: string`, `$dynamicAnchor?: string` added to `CastrSchema` in `ir/models/schema.ts`

### JSON Schema Parser ✅

- `JsonSchema2020` type interface: three new fields added in `json-schema-parser.types.ts`
- `UNSUPPORTED_DOCUMENT_KEYWORDS`: emptied (all three removed) in `parsers/json-schema/index.ts`
- `ROOT_SCHEMA_KEYWORDS`: three keywords added in `parsers/json-schema/index.ts`
- `parseAnchorKeywords()` added in `json-schema-parser.2020-keywords.ts` — simple string pass-through

### JSON Schema / OpenAPI Writer ✅

- `writeJsonSchema2020SimpleFields()` in `writers/shared/json-schema-2020-12-fields.ts` now emits all three keywords

### Zod Writer Fail-Fast ✅

- `rejectDynamicReferenceKeywords()` added in `writers/zod/index.ts`
- Called at the top of `writeSchemaBody()`, after booleanSchema but before type dispatch
- `$anchor` is NOT rejected (it's a reference marker consumed at parse time)

### TypeScript Writer Fail-Fast ✅

- `rejectDynamicReferenceKeywords()` added in `writers/typescript/type-writer/fail-fast.ts`
- **NOT YET WIRED**: needs to be imported in `core.ts` and called in `writeTypeBody()`

---

## Remaining Work

### Wire TS Fail-Fast

- Import `rejectDynamicReferenceKeywords` from `./fail-fast.js` in `core.ts`
- Call it in `writeTypeBody()` (after booleanSchema check, before `$ref` check)
- Export from barrel `index.ts` if needed

### OpenAPI Parser

- Add `$anchor`, `$dynamicRef`, `$dynamicAnchor` to `ExtendedSchemaObject` in `builder.json-schema-2020-12.ts`
- Add parsing in `addOpenAPIExtensions()` — simple string pass-through (same pattern as `dependentRequired`)

### IR Validator

- Add validation for the three new fields in `validators.schema.ts` (all must be strings when present)

### Tests (TDD — RED then GREEN)

- **IR validator tests**: three new fields must be strings when present
- **JSON Schema parser tests**: round-trip the three keywords through parse → write
- **JSON Schema writer tests**: verify emission in output
- **Zod fail-fast tests**: `$dynamicRef` and `$dynamicAnchor` throw; `$anchor` does NOT throw
- **TS fail-fast tests**: same pattern as Zod
- **Round-trip integration proofs**: add to `2020-12-keywords.json` fixture, Scenario 5

### Documentation

- Format tensions table: all three 🔲 → ✅ (JSON Schema/OAS) / ❌ (Zod/TS for $dynamicRef/$dynamicAnchor)
- Session-entry: Phase 2 marked complete
- Roadmap: Phase 2 completion recorded

### Quality Gates

- `pnpm qg` exit 0

---

## Design Decisions

- **`$anchor` is NOT fail-fast** in Zod/TS — it's a reference marker consumed at parse time. If a schema has `$anchor: "address"`, the Zod writer just ignores it (the anchor is for reference resolution, not validation)
- **`$dynamicRef` and `$dynamicAnchor` ARE fail-fast** in Zod/TS — they require runtime scope resolution that has no static code-gen equivalent
- **All three round-trip through JSON Schema/OAS writer** — they are simple string fields that the writer emits as-is
- **`$anchor`-based reference resolution** (e.g., `$ref: "#myAnchor"`) is OUT OF SCOPE — the IR carries the marker, but resolving anchor-based references is a separate future slice. Tracked in [roadmap.md § Deferred: Reference Resolution Enhancements](../roadmap.md).
- **`$dynamicRef`/`$dynamicAnchor` runtime resolution** is OUT OF SCOPE — the IR carries the markers; writers emit or reject; but actual dynamic scope resolution is not implemented. Tracked in [roadmap.md § Deferred: Reference Resolution Enhancements](../roadmap.md).
