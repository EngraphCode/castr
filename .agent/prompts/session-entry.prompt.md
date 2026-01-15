# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

---

## ✅ Test Quality Remediation: COMPLETE (January 15, 2026)

The blocking test quality issues identified during Session 2.6 have been fully remediated:

| Task                       | Status | Action Taken                                                                          |
| -------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `it.skip` violations       | ✅     | Deleted redundant tests (already documented in `scalar-behavior.integration.test.ts`) |
| IR field flow verification | ✅     | Added Semantic Integrity Proof test in `output-coverage.integration.test.ts`          |
| Error message enhancement  | ✅     | Reviewed: already well-tested at unit level (17 tests)                                |
| Placeholder test removal   | ✅     | Removed `expect(true).toBe(true)` from `spec-compliance.test.ts`                      |
| Character tests            | ✅     | Fixed in previous session                                                             |

**All 10 quality gates pass:**

- 894 unit | 173 snapshot | 20 generated | 161 character tests

**OpenAPI Compliance work is now UNBLOCKED.**

---

## 🎯 What This Library Does

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

---

## 🔴 Critical Rules (Non-Negotiable)

### 1. The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

### 2. NO CONTENT LOSS

> **This principle is inviolable.** The format can change, the content cannot.

All transforms to and from the IR must preserve every aspect of the input document. If content would be lost, expand the IR — never accept the loss.

### 3. Pure AST via ts-morph

All code generation uses **ts-morph AST manipulation**—no string templates or concatenation.

### 4. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards

### 5. TDD at ALL Levels (Mandatory)

Write failing tests FIRST—unit, integration, AND E2E. Tests are **specifications** that drive implementation.

- **Don't build utilities then write tests** — Write tests that specify behavior, then build what's needed
- **Let tests reveal requirements** — If you don't know what utility to build, you haven't written the test yet

### 6. Quality Gates (All 10 Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

---

**Next Steps — Resume OpenAPI Compliance (Session 2.6):**

| Sub-session | Focus                        | Status                |
| ----------- | ---------------------------- | --------------------- |
| 2.6.1       | IR expansion                 | Partial               |
| 2.6.2       | Parser completion            | Partial               |
| 2.6.3       | Writer completion            | Partial               |
| 2.6.4       | Input coverage tests         | ✅ Complete           |
| 2.6.5       | Output coverage tests        | ✅ Complete           |
| 2.6.6       | Strict Validation            | ✅ Complete           |
| 2.6.7       | Enhanced Error Messages      | ✅ Complete           |
| 2.6.8       | ~~Snapshot Fixture Cleanup~~ | ✅ Done (remediation) |

---

**After Remediation — Resume Session 2.6:**

| Sub-session | Focus                        | Status               |
| ----------- | ---------------------------- | -------------------- |
| 2.6.1       | IR expansion                 | Partial              |
| 2.6.2       | Parser completion            | Partial              |
| 2.6.3       | Writer completion            | Partial              |
| 2.6.4       | Input coverage tests         | ✅ Complete          |
| 2.6.5       | Output coverage tests        | ✅ Complete          |
| 2.6.6       | **Strict Validation**        | ✅ Complete          |
| 2.6.7       | **Enhanced Error Messages**  | ⚠️ Needs enhancement |
| 2.6.8       | **Snapshot Fixture Cleanup** | 🔄 Suspended         |

**Read:** [test-quality-remediation.md](../plans/test-quality-remediation.md) (priority)  
**Then:** [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md) (after remediation)

---

## 🔑 Key Session Insights (January 14, 2026)

### 1. Strict Validation Boundary

The `loadOpenApiDocument()` pipeline now enforces **strict validation** before any transformation:

- Uses `@scalar/openapi-parser`'s `validate()` function
- Rejects invalid documents with version-specific rules
- Pipeline: `bundle() → validate() → upgrade()`

### 2. Enhanced Error Messages for CLI Users

Created `validation-errors.ts` with TDD (17 tests):

- `formatValidationPath()` — Converts JSON pointers to readable paths
- `getValidationHint()` — Provides helpful hints for common errors
- `createValidationErrorMessage()` — Builds complete error message

**Example output:**

```
Invalid OpenAPI 3.0.3 document:

❌ Error 1:
  Location: paths → /test → get → responses → 200
  Issue: must have required property
  Hint: Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)
```

### 3. Comprehensive Test Fixtures

Created **22 test fixtures** in `lib/tests-roundtrip/__fixtures__/`:

- Valid 3.0.x/3.1.x specifications (11 fixtures)
- Invalid cross-version violations (11 fixtures)
- Both YAML and JSON formats

### 4. Scalar Validator Behavior (VERIFIED via 16 Integration Tests)

**Test file:** `lib/tests-roundtrip/__tests__/scalar-behavior.integration.test.ts`

**Confirmed Limitations** (Scalar does NOT reject these invalid constructs):
| Issue | Expected per Spec | Scalar Behavior |
|-------|-------------------|-----------------|
| `nullable: true` in 3.1.x | Reject (not in 3.1.x) | ❌ Passes |
| `exclusiveMinimum: true` (boolean) in 3.1.x | Reject (must be numeric) | ❌ Passes |

**Confirmed Working** (Scalar correctly validates):

- ✅ All component types: `examples`, `links`, `callbacks`, `pathItems`
- ✅ Extension validation: `x-*` fields accepted at all levels
- ✅ Reference validation: Unresolvable `$ref` rejected, circular refs allowed
- ✅ Version-specific fields: `webhooks`/`jsonSchemaDialect` in 3.0.x rejected

### 5. OpenAPI 3.0.x vs 3.1.x Key Differences

| Feature              | 3.0.x             | 3.1.x                                 |
| -------------------- | ----------------- | ------------------------------------- |
| Nullable             | `nullable: true`  | `type: ['string', 'null']`            |
| Paths field          | Required          | Optional (if webhooks present)        |
| `examples` in Schema | Single value only | Array supported (JSON Schema 2020-12) |
| `jsonSchemaDialect`  | Not allowed       | Optional                              |
| `webhooks`           | Not allowed       | Optional                              |

### 6. Character Test Remediation (January 14, 2026)

**Problem:** Character tests used intentionally invalid fixtures to test error handling, but strict validation now rejects them before reaching downstream handlers.

**Resolution:**

- **Deleted 2 obsolete tests** (tested dead code paths):
  - `edge-cases.char.test.ts`: nullable type test
  - `error-handling.char.test.ts`: invalid parameter test
- **Repurposed 1 test** to verify strict validation:
  - `validation.char.test.ts`: now asserts helpful error message format

**Rationale:** Per testing-strategy.md, tests must prove useful behavior. Code paths that can never execute need not be tested.

---

## 📚 Essential Reading

| Priority | Document                                                            | Purpose                   |
| -------- | ------------------------------------------------------------------- | ------------------------- |
| 1        | [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md)   | Active work (Session 2.6) |
| 2        | [openapi-acceptance-criteria.md](../openapi-acceptance-criteria.md) | Formal specification      |
| 3        | [RULES.md](../RULES.md)                                             | Engineering standards     |
| 4        | [testing-strategy.md](../testing-strategy.md)                       | TDD at all levels         |

---

## 🗂️ Key Files (ADR-029 Structure)

### IR Layer (`lib/src/ir/`)

- `schema.ts` — CastrDocument, CastrSchema, CastrOperation
- `serialization.ts` — IR serialization/deserialization

### Parsers (`lib/src/parsers/` — Input → IR)

- `openapi/index.ts` — buildIR (OpenAPI → IR)
- `zod/index.ts` — parseZodSource (Zod → IR)

### Writers (`lib/src/writers/` — IR → Output)

- `openapi/index.ts` — writeOpenApi (IR → OpenAPI)
- `zod/index.ts` — writeZodSchema (IR → Zod)
- `typescript/index.ts` — writeTypeScript (IR → TypeScript)

### Validation & Error Handling

- `lib/src/shared/load-openapi-document/validation-errors.ts` — Error formatting utilities
- `lib/src/shared/load-openapi-document/orchestrator.ts` — Pipeline with strict validation

### Round-Trip Testing

- `lib/tests-roundtrip/` — Round-trip validation tests
- `lib/tests-roundtrip/__fixtures__/` — 22 test fixtures (valid + invalid)

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state
2. **Read this document** — Understand current focus
3. **Read active plan** — [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md)
4. **Ask the First Question** — What impact are we creating?
5. **Write tests first** — TDD at all levels
6. **Run quality gates** — All 10 must pass before commit

---

## ❓ The First Question

> **"What impact are we trying to create for the user with this change?"**

Before coding, understand the user-facing value. Don't build solutions without understanding the problem.

**Second question:** Are we solving the right problem at the right layer?

---

## ⚠️ Common Pitfalls

1. **Accepting content loss** — NEVER acceptable. Expand IR if needed.
2. **Building utilities before writing tests** — TDD means tests first
3. **Jumping to solutions** — Step back and articulate the problem first
4. **Forgetting user value** — Every change should have clear user impact
5. **"Pragmatic" shortcuts** — In this project, pragmatic means highest quality
