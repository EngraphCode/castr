# ADR-035: Transform Validation Parity & Scenario Matrix

**Date:** 2026-02-20
**Status:** Accepted

## Context

As part of the 3.3b release cycle, we recognized the need to strictly govern how the library proves losslessness and functional equivalence across multiple input and output formats. While AST structural checks and textual output snapshots are helpful, they cannot dynamically guarantee that a transformed schema enforces exact behavioral constraints (e.g., matching `.multipleOf()`, `.gt()`, `.lt()`, formatting) identically to the original input.

We need a structured, scenario-based functional testing strategy that evaluates transpiled generated code dynamically against a deterministic suite of payload fixtures (valid and invalid) to ensure 100% functional equivalence across all translation permutations.

## Decision

We have established a **Transform Sample Scenario Matrix** and a **Validation Parity Testing Harness** to serve as the definitive correctness proof for all conversions.

### 1. Transform Scenarios

All integration tests for schema transformation must be categorized and proven against the current scenario matrix:

- **Scenario 1 (OpenAPI ↔ IR):** Losslessness and idempotency of purely structural OpenAPI data (handled via deep JSON equality).
- **Scenario 2 (Zod → IR → Zod):** Code-generation round-trip. Proves that Zod 4 input, parsed to IR, and written back to Zod 4, preserves semantic value and behaves identically on execution.
- **Scenario 3 (OpenAPI → Zod → OpenAPI):** Intermediate representation stability. Proves that an OpenAPI schema can be represented in Zod without loss of fidelity upon reconstruction to OpenAPI.
- **Scenario 4 (Zod → OpenAPI → Zod):** Cross-format durability through the OpenAPI path.
- **Scenario 5 (JSON Schema ↔ IR):** Losslessness and idempotency of structural JSON Schema conversion.
- **Scenario 6 (Zod → JSON Schema → Zod):** Cross-format durability through the JSON Schema path.
- **Scenario 7 (Multi-cast):** Cross-output consistency across the generated artifacts that share the same IR source.

### 2. Validation Parity Functional Testing

For scenarios that execute Zod code, structural equivalence is insufficient. We will enforce **Validation Parity** wherever the scenario includes shared executable payload fixtures, especially for Scenarios 2, 4, and 6:

1. **Dynamic Execution:** Generated Zod TypeScript must be transpiled and executed within the test environment (`new Function` sandbox).
2. **Deterministic Payload Harness:** The tests must evaluate both the original source schemas and the generated target schemas against shared sets of _Valid_ and _Invalid_ payloads defined in `lib/tests-fixtures/zod-parser/happy-path/payloads.ts`.
3. **Behavioral Equality Assertions:** A successful run requires `originalSchema.safeParse(payload).success === transformedSchema.safeParse(payload).success` for every payload in the matrix.

### 3. Recursive Round-Trip Durability Is a First-Class Proof Obligation

Recursive fixtures are not edge coverage; they are required correctness proofs.

- Optional recursive refs must survive the first Zod parse as direct `$ref` properties with parent-level optionality.
- Nullable and nullish recursive refs must survive as `anyOf: [{$ref}, {type: 'null'}]` through interchange formats.
- Generated Zod must reconstruct canonical recursive getter wrappers such as `.optional()`, `.nullable()`, and `.nullish()`.
- Nested recursion payloads in `payloads.ts` must remain part of the parity harness so recursive behavior is proven dynamically, not only structurally.

This durability is explicitly proven in the recursion fixture across Scenario 2 (Zod → IR → Zod), Scenario 4 (Zod → OpenAPI → Zod), and Scenario 6 (Zod → JSON Schema → Zod).

### 4. Zod 4 Canonical Output Policy

As formalized under this matrix, Writers must emit **Canonical Zod 4 Helpers** where representable (e.g., `z.email()`, `z.url()`, `z.uuid()`). Parsers must strictly accept this canonical output. Non-canonical variants in input (like `z.string().uuid()`) are acceptable during parsing, provided they map losslessly, but generated parity endpoints must enforce the canonical targets (e.g. `z.uuid()`).

## Consequences

- Integration tests are permanently bound to the payload harness. Any new constraints or types added to Castr must include positive and negative parity payloads.
- Parity execution proves the behavior layer explicitly, preventing subtle constraint loss (like `.multipleOf()`) that structural testing might overlook.
- Decreased reliance on string-based snapshot comparison for semantic correctness.
