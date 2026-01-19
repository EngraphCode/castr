# OpenAPI Compliance Plan

**Date:** January 19, 2026 (Updated)  
**Status:** ✅ Session 2.6 COMPLETE — Session 2.7 READY  
**Prerequisites:** ✅ Sessions 2.1-2.5 complete, ✅ ADR-029  
**Specification:** [openapi-acceptance-criteria.md](../openapi-acceptance-criteria.md)

---

## Objective

Implement FULL OpenAPI 3.0.x and 3.1.x **input and output support** per the formal specification.

> [!IMPORTANT]
> Session 2.6 is about **input and output support** — NOT round-trip validation.
> Round-trip is a SEPARATE session (2.7) that comes AFTER 2.6 is complete. Do not mix concerns.

**Until 2.6 is complete:**

- The system is NOT production-ready
- Input may lose content (fields not parsed)
- Output may be incomplete (fields not written)

---

## Scope

| Capability                 | 3.0.x | 3.1.x | Status                            |
| -------------------------- | ----- | ----- | --------------------------------- |
| **IR Representation**      | ✅    | ✅    | ✅ Complete (10 fields added)     |
| **Input** (parse to IR)    | ✅    | ✅    | ✅ Complete (10 fields extracted) |
| **Output** (write from IR) | ❌    | ✅    | ✅ Complete (10 fields written)   |
| **Round-Trip Validation**  | 🔲    | 🔲    | 🟡 Session 2.7 (READY TO START)   |

---

## Session Structure

### Session 2.6: OpenAPI Compliance (This Plan)

| Sub-session | Focus                        | Status                            |
| ----------- | ---------------------------- | --------------------------------- |
| 2.6.1       | IR Expansion                 | ✅ Complete (10 fields added)     |
| 2.6.2       | Parser Completion            | ✅ Complete (10 fields extracted) |
| 2.6.3       | Writer Completion            | ✅ Complete (10 fields)           |
| 2.6.4       | Input Coverage Tests         | ✅ Complete                       |
| 2.6.5       | Output Coverage Tests        | ✅ Complete                       |
| 2.6.6       | **Strict Validation**        | ✅ Complete                       |
| 2.6.7       | **Enhanced Error Messages**  | ✅ Complete                       |
| 2.6.8       | **Snapshot Fixture Cleanup** | ✅ Complete                       |

### Session 2.7: Round-Trip Validation

**Status:** 🟡 IN PROGRESS — Phase 1 Complete (January 19, 2026)

#### Objective

Prove two claims for production adoption:

| Claim            | User Confidence                               |
| ---------------- | --------------------------------------------- |
| **Idempotency**  | Running Castr twice produces identical output |
| **Losslessness** | No information lost during transformation     |

#### Progress

| Phase | Focus                        | Status                           |
| ----- | ---------------------------- | -------------------------------- |
| 1     | `sortDeep()` utility (TDD)   | ✅ Complete (17 unit tests)      |
| 2     | Arbitrary fixtures           | ✅ Complete (5 symlinks created) |
| 3     | Round-trip integration tests | 🟡 Next                          |
| 4     | Normalized fixtures + script | 🔲 Pending                       |

#### Completed Work (January 19, 2026)

**Phase 1: sortDeep() utility**

- Created `lib/src/shared/utils/sortDeep.ts` — Deterministic key ordering for comparison
- Created `lib/src/shared/utils/sortDeep.unit.test.ts` — 17 unit tests covering primitives, arrays, objects, nested structures, edge cases
- Exported from `lib/src/shared/utils/index.ts`

**Phase 2: Arbitrary fixtures**

- Created 5 symlinks in `lib/tests-roundtrip/__fixtures__/arbitrary/`:
  - `tictactoe-3.1.yaml` → `lib/examples/openapi/v3.1/tictactoe.yaml`
  - `webhook-3.1.yaml` → `lib/examples/openapi/v3.1/webhook-example.yaml`
  - `petstore-3.0.yaml` → `lib/examples/openapi/v3.0/petstore.yaml`
  - `petstore-expanded-3.0.yaml` → `lib/examples/openapi/v3.0/petstore-expanded.yaml`
  - `callback-3.0.yaml` → `lib/examples/openapi/v3.0/callback-example.yaml`

#### Next Steps

1. Create `lib/tests-roundtrip/__tests__/round-trip.integration.test.ts`
2. Implement losslessness tests (arbitrary specs → IR → output → IR comparison)
3. Implement idempotency tests (normalized specs → byte-for-byte comparison)
4. Create fixture generation script for normalized fixtures

#### Test Cases

| Case                      | Input                 | Expected Output                          |
| ------------------------- | --------------------- | ---------------------------------------- |
| Arbitrary OpenAPI         | Any valid 3.0.x/3.1.x | Content preserved (format may normalize) |
| Normalized (Castr output) | Castr-generated spec  | Byte-for-byte identical                  |

---

## Architecture: Upgrade-Before-Parse Pipeline

> [!IMPORTANT]
> The Scalar `upgrade()` function converts all input to **OpenAPI 3.1 syntax BEFORE parsing**.
> Parsers receive **only 3.1 syntax** — no need to handle 3.0-specific constructs.

```
Input → bundle() → validate() → upgrade() → [PARSER] → IR
                                      ^
                                      |
                          3.1 syntax guaranteed here
```

**Key files:**

| File                             | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `orchestrator.ts`                | Pipeline coordination                  |
| `upgrade-validate.ts`            | Scalar upgrade + type guard            |
| `builder.core.ts`                | Schema field extraction (core)         |
| `builder.json-schema-2020-12.ts` | JSON Schema 2020-12 keyword extraction |
| `builder.request-body.ts`        | Media type encoding extraction         |

**Implications for 2.6.2 (now complete):**

- No handling of `nullable: true` (upgraded to `type: [..., 'null']`)
- No handling of tuple-style `items` (upgraded to `prefixItems`)
- Parser is **pure extraction** — map 3.1 fields directly to IR

---

## ✅ Completed Work: 2.6.3 Writer Completion (January 19, 2026)

**15 new unit tests** + **11 new integration tests** for output:

| Field                        | Unit Tests | Integration Tests |
| ---------------------------- | ---------- | ----------------- |
| `xml`, `externalDocs`        | 3          | 2                 |
| `prefixItems`                | 2          | 1                 |
| `unevaluatedProperties`      | 2          | 1                 |
| `unevaluatedItems`           | 2          | 1                 |
| `dependentSchemas`           | 2          | 1                 |
| `dependentRequired`          | 1          | 1                 |
| `minContains`, `maxContains` | 3          | 2                 |
| `encoding`                   | 1          | 1                 |

**Code changes:**

- **MODIFIED:** `openapi-writer.schema.ts` — Added `writeExtensionFields()` with 3 helper functions
- **MODIFIED:** `openapi-writer.operations.ts` — Added `encoding` support
- **MODIFIED:** `openapi-writer.schema.unit.test.ts`, `openapi-writer.operations.unit.test.ts`

**Integration tests:**

- **MODIFIED:** `complete-fields-3.1.yaml` — Added 7 test schemas + upload endpoint
- **MODIFIED:** `writer-field-coverage.integration.test.ts` — 47 tests total

**Quality gates:** All 10 passed, 1,279 tests total.

---

## ✅ Completed Work: 2.6.2 Parser Completion (January 16, 2026)

**16 new unit tests** added for field extraction:

| Field                                       | Tests | Recursive |
| ------------------------------------------- | ----- | --------- |
| `xml`, `externalDocs`                       | 2     | No        |
| `prefixItems`                               | 2     | Yes       |
| `unevaluatedProperties`, `unevaluatedItems` | 4     | Yes       |
| `dependentSchemas`, `dependentRequired`     | 2     | Yes/No    |
| `minContains`, `maxContains`                | 3     | No        |
| `encoding`                                  | 2     | No        |

**Files changed:**

- **NEW:** `builder.json-schema-2020-12.ts` — Extracted helper module for max-lines compliance
- **NEW:** `builder.request-body.unit.test.ts`
- **MODIFIED:** `builder.core.ts`, `builder.core.unit.test.ts`, `builder.request-body.ts`

**11 snapshots updated** to reflect new behavior.

## ✅ Completed Work (January 14, 2026)

### 2.6.6 Strict Validation (COMPLETE)

Implemented strict version-aware validation in `loadOpenApiDocument()`:

- **Pipeline:** `bundle() → validate() → upgrade()`
- Uses `@scalar/openapi-parser`'s `validate()` for version-specific rules
- Fails fast on invalid specs with detailed errors
- 20 version-validation tests (2 skipped for known Scalar limitations)

**Key files:**

- `lib/src/shared/load-openapi-document/orchestrator.ts` — Validation pipeline
- `lib/tests-roundtrip/__tests__/version-validation.integration.test.ts` — Version tests

### 2.6.7 Enhanced Error Messages (COMPLETE)

Created user-friendly validation error formatting with TDD (17 tests):

**Functions implemented:**

- `formatValidationPath()` — Converts JSON pointers to readable paths
- `getValidationHint()` — Provides context-specific hints
- `createValidationErrorMessage()` — Builds complete error message

**Example output:**

```
Invalid OpenAPI 3.0.3 document:

❌ Error 1:
  Location: paths → /test → get → responses → 200
  Issue: must have required property
  Hint: Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)
```

**Key files:**

- `lib/src/shared/load-openapi-document/validation-errors.ts` — Formatting utilities
- `lib/src/shared/load-openapi-document/validation-errors.unit.test.ts` — 13 unit tests
- `lib/src/shared/load-openapi-document/validation-errors.integration.test.ts` — 4 integration tests

### Comprehensive Test Fixtures (22 fixtures)

Created in `lib/tests-roundtrip/__fixtures__/`:

**Valid Fixtures (11):**

- `valid/3.0.x/minimal-valid.yaml`, `valid/3.0.x/minimal-valid.json`
- `valid/3.0.x/complete-fields.yaml`, `valid/3.0.x/nullable-syntax.yaml`
- `valid/3.1.x/minimal-valid.yaml`, `valid/3.1.x/complete-fields.yaml`, `valid/3.1.x/complete-fields.json`
- `valid/3.1.x/webhooks-only.yaml`, `valid/3.1.x/type-array-null.yaml`, `valid/3.1.x/json-schema-dialect.yaml`

**Invalid Fixtures (11):**

- `invalid/3.0.x-with-3.1.x-fields/` — 3.0.x using 3.1.x features
- `invalid/3.1.x-with-3.0.x-fields/` — 3.1.x using deprecated syntax
- `invalid/common/` — Missing required fields

---

## ✅ Completed Work (January 16, 2026)

### 2.6.1 IR Expansion (COMPLETE)

Extended IR schema to support all 10 missing OpenAPI 3.1/JSON Schema 2020-12 fields:

**CastrSchema Interface (9 fields added):**

| Field                   | Type                          | Purpose                    |
| ----------------------- | ----------------------------- | -------------------------- |
| `xml`                   | `XmlObject`                   | XML serialization metadata |
| `externalDocs`          | `ExternalDocumentationObject` | Schema-level docs          |
| `prefixItems`           | `CastrSchema[]`               | JSON Schema 2020-12 tuples |
| `unevaluatedProperties` | `boolean \| CastrSchema`      | JSON Schema 2020-12        |
| `unevaluatedItems`      | `boolean \| CastrSchema`      | JSON Schema 2020-12        |
| `dependentSchemas`      | `Record<string, CastrSchema>` | JSON Schema 2020-12        |
| `dependentRequired`     | `Record<string, string[]>`    | JSON Schema 2020-12        |
| `minContains`           | `number`                      | JSON Schema 2020-12        |
| `maxContains`           | `number`                      | JSON Schema 2020-12        |

**IRMediaType Interface (1 field added):**

| Field      | Type                             | Purpose                      |
| ---------- | -------------------------------- | ---------------------------- |
| `encoding` | `Record<string, EncodingObject>` | multipart/form-data encoding |

**Key file:** `lib/src/ir/schema.ts`

**All fields include:**

- Comprehensive TSDoc with `@see` links to OpenAPI/JSON Schema specs
- Proper type signatures using library types from `openapi3-ts/oas31`
- `@example` blocks where applicable

### Next: 2.6.2 Parser Completion

Update parser to extract all 10 new fields:

- `lib/src/parsers/openapi/builder.core.ts` — Schema field extraction
- `lib/src/parsers/openapi/builder.request-body.ts` — Encoding extraction
- Handle 3.0 → 3.1 upgrades (tuple `items` → `prefixItems`)

### Scalar Validator Behavior (VERIFIED via 16 Integration Tests)

**Test file:** `lib/tests-roundtrip/__tests__/scalar-behavior.integration.test.ts`

**Confirmed Limitations** (Scalar does NOT reject these invalid constructs):

| Issue                                       | Expected per Spec                                | Scalar Behavior    |
| ------------------------------------------- | ------------------------------------------------ | ------------------ |
| `nullable: true` in 3.1.x                   | Reject (not in 3.1.x schema)                     | ❌ Passes silently |
| `exclusiveMinimum: true` (boolean) in 3.1.x | Reject (must be numeric per JSON Schema 2020-12) | ❌ Passes silently |

**Confirmed Working** (Scalar correctly validates):

| Feature                                                         | Behavior                     |
| --------------------------------------------------------------- | ---------------------------- |
| Component types (`examples`, `links`, `callbacks`, `pathItems`) | ✅ Validated correctly       |
| Extension fields (`x-*`)                                        | ✅ Accepted at all levels    |
| Unresolvable `$ref` references                                  | ✅ Rejected correctly        |
| Circular `$ref` references                                      | ✅ Accepted (valid per spec) |
| Missing response `description`                                  | ✅ Rejected correctly        |
| `webhooks` in 3.0.x                                             | ✅ Rejected correctly        |
| `jsonSchemaDialect` in 3.0.x                                    | ✅ Rejected correctly        |

### OpenAPI 3.0.x vs 3.1.x Key Differences

| Feature              | 3.0.x             | 3.1.x                                 |
| -------------------- | ----------------- | ------------------------------------- |
| Nullable             | `nullable: true`  | `type: ['string', 'null']`            |
| Paths field          | **Required**      | Optional (if webhooks present)        |
| `examples` in Schema | Single value only | Array supported (JSON Schema 2020-12) |
| `jsonSchemaDialect`  | Not allowed       | Optional                              |
| `webhooks`           | Not allowed       | Optional                              |

### ADR-026 Compliance

The `validation-errors.ts` module uses **string matching** instead of regex per ADR-026 (No Regex in Parsers). While not strictly a parser, this pattern avoids regex complexity issues.

## 🟡 Pending Work

### 2.6.2 Parser Completion (NEXT)

**Files:** `lib/src/parsers/openapi/builder.*.ts`

Extract new IR fields from OpenAPI input:

- Schema: `xml`, `externalDocs`, JSON Schema 2020-12 keywords
- MediaType: `encoding`
- Handle 3.0 → 3.1 upgrades (e.g., tuple `items` → `prefixItems`)

**Key files to modify:**

- `builder.core.ts` — Schema field extraction
- `builder.request-body.ts` — Encoding extraction

### 2.6.3 Writer Completion (BLOCKED on 2.6.2)

**Files:** `lib/src/writers/openapi/openapi-writer.*.ts`

Write new IR fields to OpenAPI 3.1 output:

- Schema: `xml`, `externalDocs`, JSON Schema 2020-12 keywords
- MediaType: `encoding`

**Key files to modify:**

- `openapi-writer.schema.ts` — Schema field output
- `openapi-writer.operations.ts` — MediaType encoding output

---

## Acceptance Criteria

1. **All fields from [openapi-acceptance-criteria.md](../openapi-acceptance-criteria.md) are implemented**
2. **Input coverage tests pass for ALL 3.0.x fields**
3. **Input coverage tests pass for ALL 3.1.x fields**
4. **Output coverage tests pass for ALL 3.1.x fields**
5. **All 22 fixture files load and process without error**
6. **All snapshot tests pass (after fixture cleanup)**
7. **All quality gates pass**

---

## Test Summary (January 15, 2026)

| Test Suite      | Count | Status  |
| --------------- | ----- | ------- |
| Unit tests      | 894   | ✅ Pass |
| Roundtrip tests | 191   | ✅ Pass |
| Snapshot tests  | 173   | ✅ Pass |
| Generated tests | 20    | ✅ Pass |
| Character tests | 161   | ✅ Pass |

---

## References

**Specifications:**

- [openapi-acceptance-criteria.md](../openapi-acceptance-criteria.md) — Formal specification
- [requirements.md](../requirements.md) — Field-level requirements (comprehensive)
- [openapi_3_0_x_schema.json](../reference/openapi_schema/openapi_3_0_x_schema.json) — OAS 3.0.x schema
- [openapi_3_1_x_schema_without_validation.json](../reference/openapi_schema/openapi_3_1_x_schema_without_validation.json) — OAS 3.1.x schema
- JSON Schema 2020-12 specs: `.agent/reference/json-schema-2020-12/` (if needed for advanced keywords)

**Roadmap:**

- [roadmap.md](./roadmap.md) — Session 2.7 follows after 2.6 complete
