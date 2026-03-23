# Transform Test Suite (Sample Input)

This directory contains integration tests that verify representative transform pipelines against sample input.

It is an important proof layer, but Scenarios 6 and 7 currently prove narrower structural subsets than their broadest historical labels imply.

```text
          OpenAPI → IR → OpenAPI (Scenario 1) structural round-trip proof
              Zod → IR → Zod     (Scenario 2) round-trip + validation parity
    OpenAPI → IR → Zod → IR → OpenAPI (Scenario 3) structural cross-format proof
        Zod → IR → OpenAPI → IR → Zod (Scenario 4) cross-format proof + parity subset
  JSON Schema → IR → JSON Schema     (Scenario 5) structural round-trip proof
Zod → IR → JSON Schema → IR → Zod   (Scenario 6) supported-subset proof, narrower than full semantic equivalence
   Single IR → Zod + JSON Schema + OpenAPI (Scenario 7) cross-output consistency smoke check for a limited supported subset
```

---

## Validation Framework

Transform tests in this suite use two validation categories:

### Losslessness — Arbitrary Input → Normalized Output

**Test:** `parse(input) ≅ parse(write(parse(input)))`

- Arbitrary input transforms to semantically equivalent normalized output
- Uses IR-level comparison (Vitest's toEqual)

### Idempotency — Normalized Input → Identical Output

**Test:** `write(parse(output)) === output`

- Castr-normalized input MUST produce byte-identical output
- Uses byte-level comparison (string equality)

Some transform tests are explicit round-trip proofs. Those round-trip assertions are used to prove properties such as losslessness and idempotence, but not every scenario currently discharges both properties at full fixture scope.

---

## Strictness Contract (Scenario Tests)

- No weak/tolerance assertions in scenario strictness proofs (`<=`, "at least", or skip-on-error behavior).
- Parse errors must fail with fixture-scoped context; they must never be handled by early-return branches.
- For scenario strictness checks, parse-error expectations run before schema-count/idempotency assertions.
- Structural strictness closure for Scenarios 2-4 is complete; functional validation parity is tracked in `validation-parity*.integration.test.ts`.

This contract is governed by `.agent/directives/testing-strategy.md` and implemented in the per-scenario test files (`scenario-1-*.ts` through `scenario-7-*.ts`).

---

## Test Files

| File / Pattern                                                   | Purpose                                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `input-coverage.integration.test.ts`                             | Verifies OpenAPI syntax is parsed to IR                                                |
| `output-coverage.integration.test.ts`                            | Verifies IR fields are written to OpenAPI                                              |
| `__tests__/scenario-1-openapi-roundtrip.integration.test.ts`     | Scenario 1: OpenAPI ↔ IR losslessness + idempotency                                    |
| `__tests__/scenario-2-zod-roundtrip.integration.test.ts`         | Scenario 2: Zod → IR → Zod round-trip                                                  |
| `__tests__/scenario-3-openapi-via-zod.integration.test.ts`       | Scenario 3: OpenAPI → Zod → OpenAPI                                                    |
| `__tests__/scenario-4-zod-via-openapi.integration.test.ts`       | Scenario 4: Zod → OpenAPI → Zod                                                        |
| `__tests__/scenario-5-json-schema-roundtrip.integration.test.ts` | Scenario 5: JSON Schema ↔ IR idempotence + losslessness                                |
| `__tests__/scenario-6-zod-via-json-schema.integration.test.ts`   | Scenario 6: Zod → JSON Schema → Zod supported-subset proof                             |
| `__tests__/scenario-7-multi-cast.integration.test.ts`            | Scenario 7: Single IR → Zod + JSON Schema + OpenAPI structural consistency smoke check |
| `__tests__/validation-parity*.integration.test.ts`               | Functional validation-parity for transform scenarios                                   |
| `__tests__/version-validation.integration.test.ts`               | Version-specific validation rules                                                      |
| `__tests__/scalar-behavior.integration.test.ts`                  | Documents Scalar validator behavior                                                    |
| `__tests__/parser-field-coverage.integration.test.ts`            | Parser field extraction verification                                                   |
| `__tests__/writer-field-coverage.integration.test.ts`            | Writer field output verification                                                       |
| `__tests__/content-preservation.unit.test.ts`                    | Regression checks for known content-loss bugs                                          |
| `__tests__/zod-format-functions.integration.test.ts`             | Zod helper/function output coverage checks                                             |
| `utils/transform-helpers.ts`                                     | Shared helpers and fixture constants for scenario tests                                |

---

## Pathological Repair Proof

`__tests__/doctor.integration.test.ts` is the suite's current pathological/heavy repair proof.

- It remains inside the canonical `pnpm test:transforms` gate rather than being split out or weakened.
- Use `pnpm --dir lib doctor:profile` when you need phase-level runtime evidence for the problematic fixture.
- Post rescue-loop redesign (Thursday, 20 March 2026):
  - isolated `doctor.integration.test.ts`: `0.53s real` (was `23.76s` before redesign)
  - full `pnpm test:transforms`: `6.92s real` (was `25.88s` before redesign)
  - doctor profile: `31.79ms` nonStandardRescue with `1` rescue retry (was `20,770ms`, `1,159` retries)
  - `warningCount`: `1,954` (was `1,159`) because the batch preflight finds more properties
- The test carries an explicit `10s` local timeout, which provides ample headroom given the ~0.5s proof runtime.
- The rescue-loop redesign (All-Errors Preflight Batch Rescue) is complete.

---

## Scalar Validator Behavior

The `scalar-behavior.integration.test.ts` documents the actual behavior of `@scalar/openapi-parser`'s `validate()` function. These are **behavior documentation tests**, not assertions of correctness.

### Confirmed Limitations

Scalar does NOT reject these invalid constructs:

| Issue                                       | Expected per Spec        | Scalar Behavior    |
| ------------------------------------------- | ------------------------ | ------------------ |
| `nullable: true` in 3.1.x                   | Reject (not in 3.1.x)    | ❌ Passes silently |
| `exclusiveMinimum: true` (boolean) in 3.1.x | Reject (must be numeric) | ❌ Passes silently |

### Confirmed Working

Scalar correctly validates:

- ✅ All component types: `examples`, `links`, `callbacks`, `pathItems`
- ✅ Extension validation: `x-*` fields accepted at all levels
- ✅ Reference validation: Unresolvable `$ref` rejected, circular refs allowed
- ✅ Version-specific fields: `webhooks`/`jsonSchemaDialect` in 3.0.x rejected
- ✅ Missing response `description` field rejected

---

## OpenAPI 3.0.x vs 3.1.x Key Differences

| Feature              | 3.0.x             | 3.1.x                                 |
| -------------------- | ----------------- | ------------------------------------- |
| Nullable             | `nullable: true`  | `type: ['string', 'null']`            |
| Paths field          | Required          | Optional (if webhooks present)        |
| `examples` in Schema | Single value only | Array supported (JSON Schema 2020-12) |
| `jsonSchemaDialect`  | Not allowed       | Optional                              |
| `webhooks`           | Not allowed       | Optional                              |

---

## Fixtures

Located in `__fixtures__/`:

### OpenAPI Fixtures

- `arbitrary/` — Real-world OpenAPI specs for transform testing with sample input
- `normalized/` — Castr-normalized output for idempotency testing
- `valid/` — Valid 3.0.x and 3.1.x specifications
- `invalid/` — Version validation test cases

### Zod Fixtures

Located in `../tests-fixtures/zod-parser/happy-path/`:

- Schema declaration fixtures for Zod → IR → Zod transform testing

### JSON Schema Fixtures

Located in `__fixtures__/json-schema/`:

- `objects.json` — Objects with required/optional properties, nesting, additionalProperties
- `constraints.json` — Numeric, string, and array constraints
- `string-formats.json` — email, uri, uuid, date-time, ipv4, ipv6, hostname
- `composition.json` — anyOf, oneOf, allOf, not
- `nullable.json` — Type arrays with null
- `2020-12-keywords.json` — prefixItems, const, dependentRequired/Schemas, unevaluatedProperties
- `unions.json` — Simple unions, discriminated, enums
- `intersections.json` — allOf with $ref composition
- `recursion.json` — Self-referential $ref

---

## Running Tests

```bash
# Run all transform tests (sample input suite)
pnpm test:transforms

# Run specific scenario
cd lib && pnpm vitest run --config vitest.transforms.config.ts \
  tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts
```
