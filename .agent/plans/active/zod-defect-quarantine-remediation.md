# Plan (Active): Zod Transform Defect Quarantine Remediation

**Status:** 🔄 Active  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Predecessor:** Phase 4 — JSON Schema + Post-3.3 Parity (complete, archived)

---

## Problem Statement

15 tests are skipped (`it.skip`) across transform scenarios 2 and 4. These cover three Zod fixture files — **unions**, **intersections**, **recursion** — that exercise valid Zod 4 input patterns. Per project rules, skipped tests for internal defects are prohibited (`.agent/directives/testing-strategy.md` §"No skipped tests").

### Current Test Layout

Tests are distributed across per-scenario files in `lib/tests-transforms/__tests__/`:

| File | Skipped |
| ---- | ------- |
| `scenario-2-zod-roundtrip.integration.test.ts` | 9 (3 fixtures × 3 test groups) |
| `scenario-4-zod-via-openapi.integration.test.ts` | 6 (3 fixtures × 2 test groups) |

Shared test infrastructure lives in `lib/tests-transforms/utils/transform-helpers.ts`.

---

## Diagnostic Results (2026-03-08)

### Fixture: `unions.zod4.ts` — ✅ NOW PASSING

Full round-trip (Zod → IR → OpenAPI → Zod → IR) succeeds. All 8 schemas preserved: `BasicUnion`, `MultiTypeUnion`, `ExclusiveUnion`, `ObjectXor`, `DiscriminatedUnion`, `MultiOptionDiscriminated`, `LiteralArray`, `NumericLiteral`.

**Remediation:** Unskip the 5 union tests (losslessness, idempotency, validation parity across scenarios 2 and 4). No code changes needed.

### Fixture: `intersections.zod4.ts` — ❌ FAILING

Pipeline fails at Zod generation: `Schema 'NewItemSchema' not found in components.schemas`.

**Root cause:** `$ref` name resolution mismatch.

1. The Zod parser strips the `Schema` suffix from variable names to produce IR component names (e.g., `NewItemSchema` → `NewItem`)
2. The IR stores `$ref` values using the original Zod variable name (e.g., `$ref: NewItemSchema`)
3. When the OpenAPI writer writes the IR, it uses the component name (`NewItem`) as the key in `components.schemas`, but writes the `$ref` path using the raw IR `$ref` value (`#/components/schemas/NewItemSchema`)
4. The Zod generator then tries to resolve `NewItemSchema` in the components map and fails because the key is `NewItem`

The defect is in the `$ref` → component name mapping: the `$ref` values stored in the IR are not consistently normalized to match the component names used in the IR's own component list.

### Fixture: `recursion.zod4.ts` — ❌ FAILING

Same root cause as intersections: `Schema 'CategorySchema' not found in components.schemas`.

Recursive schemas use `$ref` to reference themselves and each other (e.g., `CategorySchema` recursively references itself, `UserSchema`/`PostSchema` reference each other). The `$ref` values use the raw Zod variable name while the component registry uses the suffix-stripped name.

---

## Remediation Strategy

### Step 1: Unskip Unions (Zero Code Changes)

Simply remove `it.skip` → `it` for the 5 union tests. Run quality gates to confirm GREEN.

**Affected tests (5):**

- `scenario-2-zod-roundtrip.integration.test.ts`: losslessness, idempotency, validation parity for `unions`
- `scenario-4-zod-via-openapi.integration.test.ts`: losslessness, validation parity for `unions`

### Step 2: Fix `$ref` Name Resolution for Intersections + Recursion

The `$ref` values in the IR must use the same names as the IR component registry. This means when the Zod parser strips `Schema` suffix from a variable name to derive the component name, any `$ref` values pointing to that component must also use the stripped name.

**Investigation needed:**

- Locate where the Zod parser populates `$ref` values in the IR
- Determine if the `$ref` is being set from the raw ts-morph identifier name or from the registered component name
- Fix to use the component registry name for all `$ref` values
- This must not break the OpenAPI parser path (which already uses `$ref` paths like `#/components/schemas/Pet` without suffix)

**Likely affected files:**

- `lib/src/schema-processing/parsers/zod/` — where `$ref` values are constructed
- Possibly `lib/src/schema-processing/parsers/zod/registry/schema-name-registry.ts` — the suffix-stripping logic

**After fixing:** Remove `it.skip` → `it` for the 10 remaining tests (intersections + recursion across scenarios 2 and 4).

---

## Verification

After each remediation step:

```bash
pnpm check:ci
```

All 15 previously-skipped tests must pass. All quality gates must remain GREEN. Final target: **0 skipped tests**.

---

## Key Files

| File | Purpose |
| ---- | ------- |
| `lib/tests-transforms/__tests__/scenario-2-zod-roundtrip.integration.test.ts` | Scenario 2 tests (9 skipped) |
| `lib/tests-transforms/__tests__/scenario-4-zod-via-openapi.integration.test.ts` | Scenario 4 tests (6 skipped) |
| `lib/tests-transforms/utils/transform-helpers.ts` | Shared test helpers and fixture constants |
| `lib/src/schema-processing/parsers/zod/registry/schema-name-registry.ts` | Suffix stripping logic |
| `lib/src/schema-processing/parsers/zod/` | Zod parser (where `$ref` values are set) |

## References

- `.agent/directives/testing-strategy.md` — "No skipped tests" rule
- `.agent/plans/current/complete/phase-4-json-schema-and-parity.md` — predecessor plan
- `docs/architectural_decision_records/ADR-035-transform-validation-parity.md` — transform validation framework
