# Transform Test Suite (Sample Input)

This directory contains integration tests that verify specifications survive complete transformation pipelines:

```text
  OpenAPI → IR → OpenAPI (Scenario 1) ✅
      Zod → IR → Zod     (Scenario 2) 🟡
OpenAPI → IR → Zod → IR → OpenAPI (Scenario 3) 🔴
    Zod → IR → OpenAPI → IR → Zod (Scenario 4) 🟡
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

Some transform tests are explicit round-trip proofs. Those round-trip assertions are used to prove properties such as losslessness and idempotence.

---

## Strictness Contract (Scenario Tests)

- No weak/tolerance assertions in scenario strictness proofs (`<=`, "at least", or skip-on-error behavior).
- Parse errors must fail with fixture-scoped context; they must never be handled by early-return branches.
- For scenario strictness checks, parse-error expectations run before schema-count/idempotency assertions.

This contract is governed by `.agent/directives/testing-strategy.md` and implemented in `__tests__/transform-samples.integration.test.ts`.

---

## Test Files

| File / Pattern                                        | Purpose                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `input-coverage.integration.test.ts`                  | Verifies OpenAPI syntax is parsed to IR                        |
| `output-coverage.integration.test.ts`                 | Verifies IR fields are written to OpenAPI                      |
| `__tests__/transform-samples.integration.test.ts`     | Transform-sample scenarios incl. round-trip/idempotency proofs |
| `__tests__/validation-parity*.integration.test.ts`    | Functional validation-parity for transform scenarios           |
| `__tests__/version-validation.integration.test.ts`    | Version-specific validation rules                              |
| `__tests__/scalar-behavior.integration.test.ts`       | Documents Scalar validator behavior                            |
| `__tests__/parser-field-coverage.integration.test.ts` | Parser field extraction verification                           |
| `__tests__/writer-field-coverage.integration.test.ts` | Writer field output verification                               |
| `__tests__/content-preservation.unit.test.ts`         | Regression checks for known content-loss bugs                  |
| `__tests__/zod-format-functions.integration.test.ts`  | Zod helper/function output coverage checks                     |

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

---

## Running Tests

```bash
# Run all transform tests (sample input suite)
pnpm test:transforms

# Run specific test file
cd lib && pnpm vitest run --config vitest.transforms.config.ts \
  tests-transforms/__tests__/transform-samples.integration.test.ts
```
