# ADR-027: Round-Trip Validation Strategy

**Date:** 2026-01-12  
**Status:** Accepted  
**Context:** Phase 2 Zod → OpenAPI

---

## Summary

Defines **two distinct round-trip validation cases** for proving bidirectional IR architecture correctness.

---

## Decision

Round-trip validation consists of two complementary test categories:

### Case 1: Deterministic (Byte-for-Byte Idempotency)

**Input:** A spec that has already passed through Castr normalization.

**Expectation:** Byte-for-byte identical output on re-processing.

**Rationale:** Castr produces a canonical, deterministic representation. Re-processing a normalized spec proves idempotency — the transformation is stable.

```
Spec₀ → Castr → Spec₁ → Castr → Spec₂
ASSERT: Spec₁ === Spec₂ (byte-for-byte)
```

**Failure indicates:** Non-deterministic serialization, unstable ordering, or hidden state.

### Case 2: Information-Preserving (Semantic Equivalence)

**Input:** An arbitrary valid OpenAPI spec (not previously normalized).

**Expectation:** Semantic equivalence — all information preserved, format may change.

**Rationale:** Arbitrary specs may have non-canonical ordering, stylistic variations, or redundant structures. Castr normalizes these while preserving all semantic content.

```
Spec₀ → Castr → Spec₁
ASSERT: semanticContent(Spec₀) ⊆ semanticContent(Spec₁)
```

**Note:** Using `⊆` because Castr may compute additional fields (dependency graphs, resolved references, default values).

**Failure indicates:** Information loss during parsing or writing — a critical bug.

---

## Consequences

### Testing Strategy

| Test Category          | Fixtures                   | Assertion                             |
| ---------------------- | -------------------------- | ------------------------------------- |
| Deterministic          | Castr-normalized specs     | `deepStrictEqual` on parsed structure |
| Information-Preserving | Arbitrary real-world specs | Semantic diff, no missing fields      |

### Implementation Notes

1. **Deterministic tests** should use `JSON.stringify()` comparison after sorting keys
2. **Information-preserving tests** require a semantic comparator that ignores:
   - Key ordering
   - Whitespace
   - Optional fields with default values
3. Document any expected transformations (e.g., `nullable: true` → `type: ['string', 'null']` in OAS 3.1)

### What This Proves

- The IR is truly canonical — same input always produces same output
- No information is lost during `parse → IR → write` cycles
- The architecture supports any format pair, not just OpenAPI ↔ Zod

---

## References

- [ADR-023: IR-Based Architecture](./ADR-023-ir-based-architecture.md)
- [ADR-024: Complete IR Alignment](./ADR-024-complete-ir-alignment.md)
- Session 2.6: Round-Trip Validation
