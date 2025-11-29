# Phase 3 - Session 3.5: Bidirectional Tooling

**Status:** Completed ✅
**Prerequisites:** Session 3.4 (IR Enhancements) ✅
**Reference:** `.agent/plans/PHASE-3-TS-MORPH-IR.md`
**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm lint && pnpm test:all && pnpm character`

---

## 🎯 Goal

Prove the "Lossless" nature of the Information Retrieval (IR) layer by implementing a reverse generator (`IR -> OpenAPI 3.1`). This ensures that our IR captures all necessary metadata to reconstruct a valid OpenAPI specification, paving the way for advanced features like spec normalization and migration.

## ⚠️ Critical Rules

1. **TDD is MANDATORY:** Write failing tests for the generator first.
2. **Semantic Equivalence:** The generated OpenAPI spec might not be byte-for-byte identical (ordering, whitespace), but it must be _semantically_ identical to the input.
3. **Schema Validation:** The output must be a valid OpenAPI 3.1 document, verified against the official JSON Schema.

---

## 📋 Implementation Plan

### 1. Reverse Generator (`IR -> OpenAPI`)

**Objective:** Implement the logic to convert `IRDocument` back into an `OpenAPIObject`.

- **[x] TDD: Generator Skeleton**
  - Create `lib/src/generators/openapi/openapi-generator.test.ts`.
  - Test case: Empty IR returns minimal valid OpenAPI object.
  - Implement `generateOpenAPI(ir: IRDocument): OpenAPIObject` in `lib/src/generators/openapi/index.ts`.
- **[x] TDD: Info & Servers**
  - Test case: `info` object and `servers` array are correctly mapped.
- **[x] TDD: Components (Schemas)**
  - Test case: `IRSchema` nodes are converted back to `SchemaObject`.
  - Handle recursion, `allOf`, `oneOf`, `anyOf`.
- **[x] TDD: Operations & Paths**
  - Test case: `IROperation` nodes are converted back to `OperationObject`.
  - Reconstruct `PathsObject` from flat operation list.
  - Handle parameters (query, path, header, cookie) and request/response bodies.

### 2. Schema Validation

**Objective:** Ensure generated specs are valid OpenAPI 3.1.

- **[x] Add Validator**
  - Install a schema validator (e.g., `ajv` or use existing tooling if available).
  - Create a helper `validateOpenAPI(doc: OpenAPIObject): void` that throws if invalid.
- **[x] Integration Test**
  - Verify that `generateOpenAPI` output passes validation for all test fixtures.

### 3. Round-Trip Verification

**Objective:** Prove `OpenAPI -> IR -> OpenAPI` preserves semantics.

- **[x] Fidelity Test Suite**
  - Create `lib/tests-e2e/openapi-fidelity.test.ts`.
  - For each example spec (TicTacToe, Petstore, etc.): 1. Parse Original (`OpenAPI_1`). 2. Build IR (`IR_1`). 3. Generate OpenAPI (`OpenAPI_2`). 4. Compare `OpenAPI_1` and `OpenAPI_2`.
  - **Comparison Logic:** Use a semantic comparison (ignoring key order) or a "canonicalize" step before diffing.

---

## ✅ Verification

1. **Valid Output:** Generated specs pass OpenAPI 3.1 schema validation.
2. **Round-Trip:** `OpenAPI -> IR -> OpenAPI` results in a semantically equivalent document.
3. **Green Quality Gate:** All tests pass.
