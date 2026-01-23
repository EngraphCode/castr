# Plan: Session 3.2 — Zod → IR Parser

**Status:** 🟡 Phase 2: Parser Implementation In Progress (BUILD BROKEN)  
**Priority:** 3.2  
**Prerequisite for:** True Round-Trip Validation (Session 3.3)

> See also: [Acceptance Criteria](./acceptance-criteria/zod-parser-acceptance-criteria.md)

---

## 🔴 CURRENT STATE: Build Broken

The build is failing with DTS errors. **The next session MUST start by fixing these before any new work.**

### Build Errors (as of 2026-01-23)

```
src/parsers/zod/zod-parser.primitives.ts(163,10): error TS6133: 'parseZodExpression' is declared but its value is never read.
src/parsers/zod/zod-parser.primitives.ts(313,19): error TS2367: This comparison appears to be unintentional because the types '"literal"' and '"null"' have no overlap.
```

### Modified Files (Uncommitted)

Key files that have been modified/added:

| File                         | State    | Notes                                       |
| ---------------------------- | -------- | ------------------------------------------- |
| `zod-ast.ts`                 | Modified | Core AST utilities, was corrupted but fixed |
| `zod-ast.helpers.ts`         | New      | Extracted helpers to reduce complexity      |
| `zod-ast.declarations.ts`    | New      | Schema declaration finder                   |
| `zod-parser.core.ts`         | New      | Central dispatcher                          |
| `zod-parser.defaults.ts`     | New      | Default metadata factory                    |
| `zod-parser.primitives.ts`   | Modified | **HAS BUILD ERRORS**                        |
| `zod-parser.object.ts`       | Modified | Clean rewrite, needs lint fixes             |
| `zod-parser.composition.ts`  | Modified | Array/tuple/enum parsing                    |
| `zod-parser.union.ts`        | Modified | Union parsing                               |
| `zod-parser.intersection.ts` | Modified | Intersection parsing                        |
| `zod-parser.references.ts`   | Modified | Reference resolution                        |
| `zod-parser.detection.ts`    | Modified | Zod 3 rejection                             |

---

## ⚠️ Challenges Encountered

### 1. Dependency Cycles

Several parser modules import from each other creating cycles:

```
zod-parser.core.ts → zod-parser.*.ts → zod-parser.core.ts
```

**Solution needed:** The parsers need `parseZodSchemaFromNode` from core, but core dispatches to them. Consider:

- Lazy resolution via function injection
- Central registry pattern
- Breaking the cycle by restructuring exports

### 2. CastrSchemaProperties Class Wrapper

The IR's `CastrSchema.properties` field requires a `CastrSchemaProperties` class instance, not a plain object:

```typescript
// ❌ Wrong
properties: {
  id: {
    type: 'string';
  }
}

// ✅ Correct
properties: new CastrSchemaProperties({ id: { type: 'string' } });
```

### 3. CastrSchemaNode Required on All Schemas

Every `CastrSchema` requires a `metadata: CastrSchemaNode` field. Use `createDefaultMetadata()` from `zod-parser.defaults.ts`.

### 4. Strict TypeScript Checks

The repo uses `exactOptionalPropertyTypes: true`. Optional properties must be typed with explicit `| undefined`:

```typescript
// ❌ Wrong
baseCallNode?: CallExpression;

// ✅ Correct
baseCallNode?: CallExpression | undefined;
```

### 5. Lint Rules

- **Cognitive complexity max: 12** — Functions must be refactored if they exceed this
- **Max statements: 20** — Functions must be split
- **Expected `{` after if condition** — No single-line if bodies allowed
- **Unused variables** — All `chainedMethods` params need underscore prefix if unused

---

## 📋 Resume Checklist for Next Session

### Step 1: Fix Build Errors (BLOCKING)

1. Open `lib/src/parsers/zod/zod-parser.primitives.ts`
2. Remove unused `parseZodExpression` function or mark with underscore
3. Fix the type comparison at line 313 (likely comparing wrong enum values)
4. Run `pnpm build` — must pass

### Step 2: Fix Lint Errors

Run `pnpm lint` and fix:

- Unused `chainedMethods` parameters (prefix with `_`)
- Single-line if statements (add braces)
- Cognitive complexity (split large functions)

### Step 3: Run Quality Gates

```bash
cd lib
pnpm build && pnpm type-check && pnpm lint && pnpm format:check
```

### Step 4: Continue Parser Implementation

See task.md in brain artifacts for detailed checklist.

---

## Architecture Decisions Made

### 1. Central Dispatcher Pattern

`zod-parser.core.ts` contains `parseZodSchemaFromNode()` which dispatches to specialized parsers based on the base Zod method detected.

### 2. createDefaultMetadata Helper

All parsers use `createDefaultMetadata()` to create required `CastrSchemaNode` instances with sensible defaults.

### 3. ts-morph for All Parsing

All Zod source parsing uses ts-morph AST analysis. No string manipulation or regex.

---

## Key Assumptions

1. **Idiomatic Zod 4 only** — Standard Zod 4 input (including our output); reject Zod 3 and Zod 4 mini
2. **Getter-based recursion only** — `z.lazy()` is not supported
3. **Metadata via `.meta()` only** — description comes from `.meta({ description })`
4. **IR is the target** — Parser outputs CastrSchema, not intermediate structures
5. **strict-by-default** — Parser assumes `.strict()` unless `.passthrough()` is detected

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

## Success Criteria (Unchanged)

1. ✅ Parse all Zod 4 patterns produced by our writer
2. ✅ Reject Zod 3-only syntax with clear errors
3. ✅ Reconstruct IR from parsed Zod (verified by round-trip tests)
4. ✅ All 10 quality gates pass
5. ✅ TDD: Failing tests written first

---

## References

- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md) — Zod output strategy
- [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md) — Zod input strategy
- [Archive: Session 3.1b](./archive/zod4-ir-improvements-plan-3.1b-complete.md) — Native recursion implementation
- [Zod 4 Documentation](https://zod.dev/v4)
