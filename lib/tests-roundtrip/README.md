# Round-Trip Test Suite

This directory contains integration tests that verify OpenAPI specifications survive the complete transformation pipeline:

```
OpenAPI Input → buildIR() → IR (CastrDocument) → writeOpenApi() → OpenAPI Output
```

---

## Test Files

| File                                                  | Purpose                                   | Tests |
| ----------------------------------------------------- | ----------------------------------------- | ----- |
| `input-coverage.integration.test.ts`                  | Verifies OpenAPI syntax is parsed to IR   | 48    |
| `output-coverage.integration.test.ts`                 | Verifies IR fields are written to OpenAPI | 25    |
| `__tests__/version-validation.integration.test.ts`    | Version-specific validation rules         | 20    |
| `__tests__/scalar-behavior.integration.test.ts`       | Documents Scalar validator behavior       | 16    |
| `__tests__/parser-field-coverage.integration.test.ts` | Parser field extraction verification      | 45    |
| `__tests__/writer-field-coverage.integration.test.ts` | Writer field output verification          | 37    |

**Total: 191 tests**

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

### Valid Fixtures (11)

- `valid/3.0.x/` — Valid 3.0.x specifications
- `valid/3.1.x/` — Valid 3.1.x specifications

### Invalid Fixtures (11)

- `invalid/3.0.x-with-3.1.x-fields/` — 3.0.x using 3.1.x features
- `invalid/3.1.x-with-3.0.x-fields/` — 3.1.x using deprecated syntax
- `invalid/common/` — Missing required fields

---

## Running Tests

```bash
# Run all roundtrip tests
pnpm test:roundtrip

# Run specific test file
cd lib && npx vitest run --config vitest.roundtrip.config.ts __tests__/scalar-behavior.integration.test.ts
```
