# Plan: Session 3.3a — Complexity Refactoring (Updated)

**Status:** 🔄 In Progress — Partially Complete  
**Priority:** High (Architectural Debt)  
**Created:** 2026-01-24  
**Last Updated:** 2026-02-12  
**Returns To:** [round-trip-validation-plan.md](round-trip-validation-plan.md) (Session 3.3b)

---

## Summary of Progress

### Phase 1: Directory Restructure ✅ COMPLETE

Created `lib/src/schema-processing/` directory to group schema-related code:

```text
schema-processing/
├── ast/          # AST manipulation
├── context/      # Template context
├── conversion/   # Format conversion (json-schema, zod, typescript)
├── ir/           # Intermediate Representation types
├── parsers/      # OpenAPI and Zod parsers
├── writers/      # Zod, OpenAPI, TypeScript, Markdown writers
└── index.ts      # Public API barrel file
```

**Result:** 6 directories moved, 120+ import paths fixed, all tests pass.

### Phase 2: ESLint String Rules ✅ COMPLETE (Disabled)

Added comprehensive ESLint rules to detect string manipulation patterns:

- 23 patterns detected (startsWith, endsWith, includes, getText, etc.)
- Scoped to `schema-processing/` only (shared utilities excluded)
- **Currently disabled** pending complexity refactoring

### Phase 3: Complexity Refactoring 🔄 IN PROGRESS

**Current State:** 35 lint violations remaining (down from 51 after removing legacy complexity exceptions).

---

## Current Violations (35 Total)

### By Category

| Type                           | Count |
| ------------------------------ | ----- |
| `complexity` (cyclomatic)      | 18    |
| `sonarjs/cognitive-complexity` | 12    |
| `max-lines`                    | 5     |

---

## Work Completed

### Zod Writer Refactoring ✅

Extracted from `writers/zod/index.ts`:

- `formatPropertyKey()` — Quote keys with special characters
- `buildPropertyContext()` — Build context for properties
- `detectCircularReference()` — Detect circular ref patterns
- `shouldUseGetterSyntax()` — Determine if getter syntax needed

**13 unit tests written** (TDD approach). Type-check blocker resolved.

### Zod Parser Constraints ✅

Refactored `zod-parser.constraints.ts` — extracted pure functions, all tests passing.

### OpenAPI Writer Operations & Components 🔄

Partially refactored — extracted request/response writers, further extraction needed.

---

## Next Session: Resume Complexity Refactoring

### Strategy: Extract → Test → Compose

For each complex function:

1. Identify branching logic
2. Extract branches into pure functions
3. Write unit tests (TDD)
4. Compose extracted functions in original

### Remaining Violations by Domain

Run `pnpm lint` for the latest counts. As of 2026-02-12:

| Domain             | Files | Key Functions                                                                             |
| ------------------ | ----- | ----------------------------------------------------------------------------------------- |
| parsers/zod        | 8     | parseZodSchemaFromNode, extractLiteralValue, parseEndpointDefinition, buildEndpointResult |
| writers/openapi    | 4     | writeOpenApiComponents, addPathItemFields, writeMetadataFields, addOptionalFields         |
| parsers/openapi    | 2     | buildIR, processProperty                                                                  |
| writers/zod        | 2     | writeStringSchema, collectMetadata                                                        |
| writers/typescript | 1     | extractPropertyEntry                                                                      |
| ir/schema.ts       | 1     | (max-lines)                                                                               |
| validation         | 1     | isOpenAPIObject                                                                           |

---

## Quality Gate Status

| Gate          | Status                            |
| ------------- | --------------------------------- |
| build         | ✅ Pass                           |
| type-check    | ✅ Pass                           |
| lint          | ❌ 35 errors (complexity + lines) |
| test          | ✅ Pass (1,010+ tests)            |
| test:snapshot | ✅ Pass                           |
| character     | ✅ Pass (152 tests)               |

---

## Key Files

| Location                                                        | Purpose                            |
| --------------------------------------------------------------- | ---------------------------------- |
| `lib/src/schema-processing/`                                    | Schema code directory              |
| `lib/src/schema-processing/writers/zod/properties.ts`           | Extracted pure functions           |
| `lib/src/schema-processing/writers/zod/properties.unit.test.ts` | Unit tests for extracted functions |
| `lib/eslint.config.ts`                                          | ESLint config (string rules off)   |

---

## References

- [RULES.md](../directives/RULES.md) — Single responsibility, pure functions
- [testing-strategy.md](../directives/testing-strategy.md) — TDD approach
- [ADR-026](../../docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md) — No string manipulation
