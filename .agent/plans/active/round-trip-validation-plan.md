# Plan: Session 3.3b — True Round-Trip Validation

**Status:** ⏸️ Paused  
**Priority:** 3.3b (After 3.3a)  
**Prerequisite:** Session 3.3a (String Manipulation Remediation)  
**Blocked By:** [string-manipulation-remediation.md](./string-manipulation-remediation.md)

> [!NOTE]
> This plan is paused until Session 3.3a (String Manipulation Remediation) is complete.
> The 2 failing round-trip tests are caused by string-matching limitations in the parser.

---

## Objective

Extend existing round-trip validation to include **Zod layer** scenarios, following the same validation approach used for OpenAPI.

---

## Validation Framework

| Test Type      | Formula                                     | Comparison     |
| -------------- | ------------------------------------------- | -------------- |
| **Lossless**   | `parse(input) ≅ parse(write(parse(input)))` | Semantic (IR)  |
| **Idempotent** | `write(parse(output)) === output`           | Byte-identical |

---

## Scenarios

| #   | Scenario                          | Status  |
| --- | --------------------------------- | ------- |
| 1   | OpenAPI → IR → OpenAPI            | ✅      |
| 2   | Zod → IR → Zod                    | ✅      |
| 3   | OpenAPI → IR → Zod → IR → OpenAPI | ⚠️ (\*) |
| 4   | Zod → IR → OpenAPI → IR → Zod     | ✅      |

> (\*) Scenario 3 skipped: Zod writer outputs schema refs as bare identifiers; parser cannot resolve.

---

## Scope: Schema-Level Round-Trip

The Zod parser handles **schema declarations only**. Scenarios 2-4 test schema component round-trips, which is the critical path for IR correctness.

---

## Implementation Plan

### Phase 1: Scenario 2 — Zod ↔ Zod

**TDD Approach:**

1. **Write failing test** for Losslessness
   - Parse Zod fixture → IR
   - Write IR → Zod using new `writeZodSchemas()` helper
   - Parse output → IR
   - Compare IR schema components

2. **Implement** `writeZodSchemas()` helper
   - Writes only schema declarations (no endpoints/MCP)
   - Uses existing `writeZodSchema()` for each component

3. **Write failing test** for Idempotency
   - Verify second pass produces byte-identical output

**Files to modify:**

- `lib/tests-roundtrip/__tests__/round-trip.integration.test.ts`
- `lib/src/test-helpers/` (new helper)

### Phase 2: Scenario 3 — OpenAPI → Zod → OpenAPI

1. Extract schema components from OpenAPI IR
2. Write → Zod → Parse → Compare
3. Verify schema content preserved through Zod layer

### Phase 3: Scenario 4 — Zod → OpenAPI → Zod

1. Parse Zod → IR
2. Write OpenAPI → IR → Zod
3. Compare schema components

---

## Fixtures

**OpenAPI:** `tests-roundtrip/__fixtures__/arbitrary/`  
**Zod:** `tests-fixtures/zod-parser/happy-path/`

---

## Success Criteria

1. ✅ All 4 scenarios pass Losslessness tests
2. ✅ All 4 scenarios pass Idempotency tests
3. ✅ All 10 quality gates pass

---

## References

- [round-trip.integration.test.ts](../../lib/tests-roundtrip/__tests__/round-trip.integration.test.ts)
- [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
