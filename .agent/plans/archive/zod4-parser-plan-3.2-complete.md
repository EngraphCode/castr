# Plan: Session 3.2 — Zod → IR Parser

**Status:** ✅ Complete  
**Priority:** 3.2  
**Prerequisite for:** True Round-Trip Validation (Session 3.3)

> See also: [Acceptance Criteria](../../acceptance-criteria/zod-parser-acceptance-criteria.md)

---

## ✅ Session 3.2 Completion Summary

**Quality Gates:** All passing — 1,002+ tests

| Gate          | Status |
| ------------- | ------ |
| Build         | ✅     |
| Type-check    | ✅     |
| Lint          | ✅     |
| Format        | ✅     |
| Tests (unit)  | ✅     |
| Tests (snap)  | ✅     |
| Tests (gen)   | ✅     |
| Tests (char)  | ✅     |
| Tests (xform) | ✅     |

### Key Accomplishments

1. **Parser Implementation Complete** — All Zod 4 patterns parsed to IR
2. **Build Errors Fixed** — Resolved all DTS/TS compilation issues
3. **Circular Reference Tests Updated** — Now expect getter syntax (Zod 4 native)
4. **Documentation Updated** — Zod→OpenAPI pipeline now documented in READMEs
5. **ADR-032 Corrected** — `.describe()` IS parsed (converted to meta)
6. **Subpath Export Added** — `@engraph/castr/parsers/zod` now works

### Breaking Change: getEndpointDefinitionList Removed

This function and its module (`legacy-compat.js`) were removed from the public API.
All 57 dependent tests were updated to use direct imports.

---

## Architecture Decisions Made

### 1. Central Dispatcher Pattern

`zod-parser.core.ts` contains `parseZodSchemaFromNode()` which dispatches to specialized
parsers based on the base Zod method detected.

### 2. createDefaultMetadata Helper

All parsers use `createDefaultMetadata()` to create required `CastrSchemaNode` instances.

### 3. ts-morph for All Parsing

All Zod source parsing uses ts-morph AST analysis. No string manipulation or regex.

### 4. .describe() Handling

- `.describe()` IS parsed and converted to `.meta({ description })`
- `.meta()` takes precedence if both exist on the same schema
- Output MUST always use `.meta()`, never `.describe()`

### 5. Recursion Strategy

- **Reader (parser):** Supports getter-based recursion only; `z.lazy()` rejected
- **Writer (output):** Uses getter-based native recursion exclusively

---

## Key Assumptions (Verified)

1. ✅ **Idiomatic Zod 4 only** — Standard Zod 4 input; Zod 3 and Zod 4 mini rejected
2. ✅ **Getter-based recursion only** — `z.lazy()` is not supported
3. ✅ **Metadata via `.meta()`** — `.describe()` converted to meta during parsing
4. ✅ **IR is the target** — Parser outputs CastrSchema directly
5. ✅ **strict-by-default** — Parser assumes `.strict()` unless `.passthrough()` detected

---

## Fixture Locations

```text
lib/tests-fixtures/zod-parser/
├── happy-path/
│   ├── primitives.zod4.ts          + primitives.expected.json ✅
│   ├── string-formats.zod4.ts      + string-formats.expected.json ✅
│   ├── objects.zod4.ts             + objects.expected.json ✅
│   ├── arrays-tuples.zod4.ts       + arrays-tuples.expected.json ✅
│   ├── unions.zod4.ts              + unions.expected.json ✅
│   ├── intersections.zod4.ts       + intersections.expected.json ✅
│   ├── recursion.zod4.ts           + recursion.expected.json ✅
│   ├── metadata.zod4.ts            + metadata.expected.json ✅
│   ├── constraints.zod4.ts         + constraints.expected.json ✅
│   └── generated-petstore-expanded.zod4.ts + generated-petstore-expanded.expected.json ✅
└── sad-path/
    └── zod3-syntax.patterns.ts     + zod3-syntax.expected-error.json ✅
```

---

## Success Criteria (All Met)

1. ✅ Parse all Zod 4 patterns produced by our writer
2. ✅ Reject Zod 3-only syntax with clear errors
3. ✅ Reconstruct IR from parsed Zod (verified by round-trip tests)
4. ✅ All 10 quality gates pass
5. ✅ TDD: Failing tests written first

---

## References

- [ADR-031](../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032](../../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
- [Archive: Session 3.1b](./zod4-ir-improvements-plan-3.1b-complete.md)
- [Zod 4 Documentation](https://zod.dev/v4)
