# Round-Trip Test Suite

This directory contains integration tests that verify specifications survive complete transformation pipelines:

```text
  OpenAPI → IR → OpenAPI (Scenario 1) ✅
      Zod → IR → Zod     (Scenario 2) 🔲
OpenAPI → IR → Zod → IR → OpenAPI (Scenario 3) 🔲
    Zod → IR → OpenAPI → IR → Zod (Scenario 4) 🔲
```

---

## Validation Framework

All round-trip scenarios use two validation categories:

### Losslessness — Arbitrary Input → Normalized Output

**Test:** `parse(input) ≅ parse(write(parse(input)))`

- Arbitrary input transforms to semantically equivalent normalized output
- Uses IR-level comparison (Vitest's toEqual)

### Idempotency — Normalized Input → Identical Output

**Test:** `write(parse(output)) === output`

- Castr-normalized input MUST produce byte-identical output
- Uses byte-level comparison (string equality)

---

## Test Files

| File                                                  | Purpose                                   | Tests |
| ----------------------------------------------------- | ----------------------------------------- | ----- |
| `input-coverage.integration.test.ts`                  | Verifies OpenAPI syntax is parsed to IR   | 48    |
| `output-coverage.integration.test.ts`                 | Verifies IR fields are written to OpenAPI | 25    |
| `__tests__/round-trip.integration.test.ts`            | Losslessness and idempotency validation   | 45    |
| `__tests__/version-validation.integration.test.ts`    | Version-specific validation rules         | 20    |
| `__tests__/scalar-behavior.integration.test.ts`       | Documents Scalar validator behavior       | 16    |
| `__tests__/parser-field-coverage.integration.test.ts` | Parser field extraction verification      | 45    |
| `__tests__/writer-field-coverage.integration.test.ts` | Writer field output verification          | 47    |

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

- `arbitrary/` — Real-world OpenAPI specs for round-trip testing
- `normalized/` — Castr-normalized output for idempotency testing
- `valid/` — Valid 3.0.x and 3.1.x specifications
- `invalid/` — Version validation test cases

### Zod Fixtures

Located in `../tests-fixtures/zod-parser/happy-path/`:

- Schema declaration fixtures for Zod → IR → Zod round-trip

---

## Running Tests

```bash
# Run all roundtrip tests
pnpm test:roundtrip

# Run specific test file
cd lib && npx vitest run --config vitest.roundtrip.config.ts __tests__/round-trip.integration.test.ts
```
