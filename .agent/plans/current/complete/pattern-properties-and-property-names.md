# Plan: `patternProperties` and `propertyNames` Parser/Writer Support

**Status:** ✅ Complete — implemented and verified, all quality gates green (2026-03-26)
**Created:** 2026-03-26
**Predecessor:** [discovery-and-prioritisation.md](./discovery-and-prioritisation.md)
**Related:** [json-schema-parser.md (paused)](../current/paused/json-schema-parser.md), [pack-4-json-schema-architecture.md](../../research/architecture-review-packs/pack-4-json-schema-architecture.md)

---

## User Impact

Schemas using `patternProperties` (e.g. map-like objects with regex-keyed properties) and `propertyNames` (key validation constraints) are common in real-world JSON Schema and OpenAPI 3.1 documents. Currently these keywords cause a hard rejection via `UnsupportedJsonSchemaKeywordError`. Supporting them unlocks parsing of a significant class of real-world schemas.

## Governing Principle: All Supported Keywords Must Be Fully Supported

Once a keyword is parsed into the IR, it **must** be handled by every downstream surface:

- **Lossless writers** (JSON Schema, OpenAPI) — emit the keyword faithfully.
- **Lossy-by-nature writers** (Zod, TypeScript) — **fail fast with an actionable error** if the keyword has no native equivalent. Silent omission is a doctrine violation.

This creates explicit **format tensions** that must be documented honestly:

| Keyword             | JSON Schema | OpenAPI 3.1 |     Zod      |  TypeScript  |
| ------------------- | :---------: | :---------: | :----------: | :----------: |
| `patternProperties` | ✅ lossless | ✅ lossless | ❌ fail-fast | ❌ fail-fast |
| `propertyNames`     | ✅ lossless | ✅ lossless | ❌ fail-fast | ❌ fail-fast |

> [!IMPORTANT]
> **This tension is inherent, not a defect.** Zod has no native equivalent for regex-keyed property schemas or property name validation. TypeScript cannot express these constraints in its type system. The correct response is fail-fast with a helpful error, not silent degradation.
>
> Future work could explore Zod `.refine()` approximations, but that would be a governed, opt-in lossy mode — not a default behaviour.

## Scope

**In scope:**

1. Add `patternProperties` and `propertyNames` to the IR (`CastrSchema`)
2. Add both keywords to `JsonSchema2020` type
3. Parse both keywords in the JSON Schema parser (core + document level)
4. Parse both keywords in the OpenAPI parser (OAS 3.1 allows them via JSON Schema 2020-12)
5. Write both keywords in the JSON Schema writer
6. Write both keywords in the OpenAPI writer (via shared field writers)
7. IR runtime validator: validate both new fields
8. Zod writer: fail fast with a helpful error — Zod has no native `patternProperties` or `propertyNames` equivalent
9. TypeScript writer: fail fast — TypeScript interfaces cannot express these constraints
10. Round-trip proofs (JSON Schema and OpenAPI)
11. Update acceptance criteria, paused plan, session-entry, roadmap

**Out of scope:**

- Zod native support for `patternProperties` / `propertyNames` (no Zod 4 equivalent exists)
- TypeScript native support (TS cannot express regex-keyed types)
- `if`/`then`/`else`, `$dynamicRef`, `contains`, boolean schemas (separate future slices)
- External `$ref` resolution
- OpenAPI parser map-schema enforcement changes (existing traversal in `openapi-document.object-semantics.schemas.ts` already handles these — no changes needed there)

## Assumptions to Validate

1. `patternProperties` values are schemas — same recursive type as `properties` values
2. `propertyNames` is a single schema applied to all property names (string validation)
3. OpenAPI 3.1 inherits both keywords from JSON Schema 2020-12 — no OAS-specific constraints
4. No existing test fixture exercises these keywords (confirmed: currently hard-rejected)

## IR Model Changes

### `CastrSchema` (schema.ts)

```typescript
/**
 * Pattern-based property schemas (for type: 'object').
 * Keys are regex patterns; values are schemas that matching properties must satisfy.
 */
patternProperties?: Record<string, CastrSchema>;

/**
 * Schema applied to all property names (for type: 'object').
 * Constrains which property names are valid (e.g. minLength, pattern, enum).
 */
propertyNames?: CastrSchema;
```

### `JsonSchema2020` (json-schema-parser.types.ts)

```typescript
patternProperties?: Record<string, JsonSchema2020 | ReferenceObject>;
propertyNames?: JsonSchema2020 | ReferenceObject;
```

### `JsonSchemaObject` (json-schema-object.ts)

```typescript
patternProperties?: Record<string, JsonSchemaObject>;
propertyNames?: JsonSchemaObject;
```

## TDD Order

### Phase 1: IR Model + Validator

1. Add `patternProperties` and `propertyNames` to `CastrSchema` interface
2. Write failing validator tests for both new fields
3. Update `isCastrSchema()` to validate both fields
4. Verify validator tests pass

### Phase 2: JSON Schema Parser

1. Add both keywords to `JsonSchema2020` type
2. Remove `patternProperties` and `propertyNames` from `UNSUPPORTED_DOCUMENT_KEYWORDS`
3. Add both keywords to `ROOT_SCHEMA_KEYWORDS`
4. Write failing parser unit tests:
   - `patternProperties` with single pattern and schema
   - `patternProperties` with multiple patterns
   - `patternProperties` alongside `properties`
   - `propertyNames` with string constraints
   - `propertyNames` as `$ref`
   - Document with root-level `patternProperties`
5. Implement `parsePatternProperties()` in `json-schema-parser.object-fields.ts`
6. Implement `parsePropertyNames()` in `json-schema-parser.object-fields.ts`
7. Wire both into `parseObjectFields()`
8. Verify parser unit tests pass

### Phase 3: JSON Schema Writer

1. Add both keywords to `JsonSchemaObject` output type
2. Write failing writer characterisation tests
3. Implement `writePatternProperties()` and `writePropertyNames()` in shared field writers
4. Wire into `writeObjectFields()` or `writeJsonSchema2020RecursiveFields()`
5. Verify writer tests pass

### Phase 4: OpenAPI Parser Integration

1. Verify OpenAPI parser already passes `patternProperties` / `propertyNames` through from OAS 3.1 `SchemaObject` (they exist in the `openapi3-ts/oas31` type)
2. Write failing integration tests for OpenAPI → IR with both keywords
3. Wire parsing into the OpenAPI schema builder's object-field handling
4. Verify integration tests pass

### Phase 5: Zod + TypeScript Writer Fail-Fast

1. Write failing tests: Zod writer throws on IR with `patternProperties` or `propertyNames`
2. Implement fail-fast in Zod schema writer
3. Write failing tests: TypeScript writer throws on IR with `patternProperties` or `propertyNames`
4. Implement fail-fast in TypeScript type writer
5. Verify fail-fast tests pass

### Phase 6: Round-Trip Proofs

1. Add JSON Schema round-trip fixture with `patternProperties` and `propertyNames` to Scenario 5
2. Add OpenAPI round-trip fixture to Scenario 1 (or dedicated sub-scenario)
3. Verify round-trip proofs pass
4. Add cross-format test verifying JSON Schema → IR → Zod fails fast with helpful error
5. Add cross-format test verifying JSON Schema → IR → TypeScript fails fast

### Phase 7: Doc + Handoff

1. Update `json-schema-and-parity-acceptance-criteria.md`
2. Update paused `json-schema-parser.md` (mark both keywords as resolved)
3. Update `session-entry.prompt.md` (move from "Remaining Planned Capabilities")
4. Update `roadmap.md`
5. Record decisions in napkin

## Success Criteria

1. `patternProperties` and `propertyNames` parse losslessly from JSON Schema and OpenAPI 3.1 input
2. Both keywords round-trip through JSON Schema → IR → JSON Schema
3. Both keywords round-trip through OpenAPI → IR → OpenAPI
4. Zod and TypeScript writers fail fast with actionable error messages
5. IR runtime validator accepts schemas with both new fields
6. IR runtime validator rejects malformed `patternProperties` / `propertyNames`
7. All existing tests continue to pass (no regression)
8. All quality gates green (`pnpm qg`)

## Documentation Outputs

- TSDoc on new `CastrSchema` fields
- TSDoc on new parser/writer functions
- Updated acceptance criteria
- Updated session-entry, roadmap, paused plan
- Napkin entries for design decisions

## Quality Gates

```bash
pnpm clean
pnpm install --frozen-lockfile
pnpm build
pnpm format:check
pnpm type-check
pnpm lint
pnpm madge:circular
pnpm madge:orphans
pnpm depcruise
pnpm knip
pnpm portability:check
pnpm test
pnpm character
pnpm test:snapshot
pnpm test:gen
pnpm test:transforms
pnpm test:e2e
```
