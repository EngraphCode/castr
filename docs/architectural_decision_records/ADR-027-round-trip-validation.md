# ADR-027: Transform Validation with Sample Input as Correctness Proof

**Date:** 2026-01-12  
**Status:** Accepted  
**Context:** Phase 2 Zod → OpenAPI

---

## Context

We need to prove that the IR-based architecture (ADR-023) correctly preserves information during format transformations. Users adopting Castr in production require confidence that:

1. Their specifications won't be corrupted
2. No semantic information will be lost
3. The tool produces stable, predictable output

Without this proof, production adoption is blocked by fear of data loss.

---

## Core Principle: NO CONTENT LOSS

> **This principle is inviolable.**

A schema transformation library that loses content is fundamentally broken. The IR **MUST** capture ALL semantic content from the input specification. If any OpenAPI content is not preserved through transform execution, the IR must be expanded to capture it.

**NO CONTENT LOSS** means:

- All paths, operations, parameters, schemas, and constraints are preserved
- All document-level metadata (`tags`, `externalDocs`, `info`) is preserved
- All component definitions are preserved
- All security schemes and requirements are preserved

Format may change (normalization), but **information is never lost**.

---

## Decision

We adopt **transform validation with sample input** as the mechanism to prove IR correctness.
Explicit round-trip assertions remain part of this strategy to prove losslessness and idempotence.

### Two Test Cases

| Case                 | Input                  | Expected Output                                    |
| -------------------- | ---------------------- | -------------------------------------------------- |
| **Arbitrary specs**  | Any valid OpenAPI spec | No content loss; format may change (normalization) |
| **Normalized specs** | Castr-normalized spec  | Byte-for-byte identical output                     |

These properties are **consequences of the IR architecture**, not implementation requirements. If the IR is truly canonical and the parsers/writers are correct, transform validation with sample input (including round-trip checks) will pass.

### Property Definitions

| Property         | Definition                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **Idempotency**  | All pipelines are idempotent. Processing a normalized spec produces byte-for-byte identical output. |
| **Losslessness** | Processing any valid spec preserves all semantic information. No content is lost.                   |

---

## Fixture Strategy

**Arbitrary fixtures:** The official OpenAPI demo schemas serve as arbitrary fixtures:

- `examples/openapi/v3.1/tictactoe.yaml`
- `examples/openapi/v3.1/webhook-example.yaml`
- `examples/openapi/v3.1/non-oauth-scopes.yaml`

**Normalized fixtures:** Process the arbitrary fixtures through Castr and save the output to disk. These become the normalized fixtures for byte-for-byte comparison:

- `lib/tests-transforms/__fixtures__/normalized/tictactoe.json`
- etc.

---

## Consequences

### Positive

- Provides quantifiable evidence of correctness
- Tests the entire parse → IR → write pipeline
- Failures indicate architectural bugs (not cosmetic issues)
- Enables production confidence

### Negative

- Some format transformations are expected (e.g., `nullable: true` → `type: [string, null]`)
- Requires careful distinction between "transformation" and "loss"
- IR must capture ALL OpenAPI content (no shortcuts)

### Neutral

- Tests should be high-level behavior tests, not unit tests of comparison utilities
- Implementation approach (comparison libraries, diff tools) is a secondary concern

---

## References

- [ADR-023: IR-Based Architecture](./ADR-023-ir-based-architecture.md)
- [ADR-024: Complete IR Alignment](./ADR-024-complete-ir-alignment.md)
- [roadmap.md](../../.agent/plans/roadmap.md) — Session 2.7 for implementation details
