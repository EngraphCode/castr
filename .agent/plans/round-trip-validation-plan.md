# Round-Trip Validation Plan

**Date:** January 13, 2026  
**Status:** Ready for Implementation  
**Prerequisites:** ✅ Sessions 2.1-2.5 complete, ✅ ADR-029 canonical structure implemented

---

## 🚀 Next Session Entry Point

**ADR-029 is complete.** The codebase is now organized per canonical structure:
- IR types in `lib/src/ir/`
- Parsers in `lib/src/parsers/openapi/` and `lib/src/parsers/zod/`
- Writers in `lib/src/writers/{openapi,zod,typescript,markdown}/`

**Start here:** Implement `sortDeep()` utility using TDD (first unchecked item below).

---

## Strategic Goal

Prove the IR architecture with two quantifiable claims:

| Claim            | Test                                             | User Value                   |
| ---------------- | ------------------------------------------------ | ---------------------------- |
| **Idempotency**  | Spec₁ → IR → Spec₂ → IR → Spec₃; Spec₂ === Spec₃ | Stable, predictable output   |
| **Losslessness** | Spec₀ → IR → Spec₁; no semantic loss             | Safe for production adoption |

---

## Acceptance Criteria

### Case 1: Deterministic (Byte-for-Byte)

```
Given: Castr-normalized spec
When: Processed twice through buildIR() → writeOpenApi()
Then: JSON.stringify(sortDeep(Spec₁)) === JSON.stringify(sortDeep(Spec₂))
```

**Metric:** 100% of normalized fixtures pass

### Case 2: Information-Preserving (Semantic Equivalence)

```
Given: Arbitrary valid spec
When: Processed through buildIR() → writeOpenApi()
Then: All paths, operations, schemas, constraints preserved
```

**Metric:** Zero missing fields in semantic diff

---

## Fixture Strategy

| Tier           | Purpose                   | Location                                                          |
| -------------- | ------------------------- | ----------------------------------------------------------------- |
| **Normalized** | Byte-for-byte idempotency | `tests-roundtrip/__fixtures__/normalized/`                        |
| **Arbitrary**  | Semantic equivalence      | `tests-roundtrip/__fixtures__/arbitrary/` (symlinks to examples/) |
| **Edge Cases** | Stress testing            | `tests-roundtrip/__fixtures__/edge-cases/`                        |

### Normalized Fixtures (Create)

- `normalized-tictactoe.json` — Process `tictactoe.yaml`
- `normalized-petstore.json` — Process `petstore.yaml` (3.0 → 3.1)

### Edge Case Fixtures (Create)

- `nullable-types.yaml` — OAS 3.1 type arrays
- `circular-refs.yaml` — Self-referencing schemas
- `composition.yaml` — allOf/oneOf/anyOf

---

## Expected Transformations (Not Failures)

| Input                        | Output                 | Reason                      |
| ---------------------------- | ---------------------- | --------------------------- |
| `nullable: true`             | `type: [string, null]` | OAS 3.1 canonical form      |
| Arbitrary key order          | Sorted keys            | Deterministic serialization |
| Empty arrays                 | Omitted                | Canonical representation    |
| `additionalProperties` added | Enrichment             | Not information loss        |

---

## Test Structure

```
lib/tests-roundtrip/
├── __fixtures__/
│   ├── normalized/
│   ├── arbitrary/
│   └── edge-cases/
├── round-trip.deterministic.test.ts
├── round-trip.semantic.test.ts
└── utils/
    ├── sort-deep.ts
    └── semantic-diff.ts
```

---

## Implementation Order

- [x] Create fixture directory structure
- [x] Consolidate IR→OpenAPI implementations (ADR-028)
- [x] Define canonical source structure (ADR-029)
- [x] **Implement ADR-029 migration** ← Session 2.6 complete
- [x] Update VISION.md terminology
- [ ] Implement `sortDeep()` utility (TDD) ← **START HERE**
- [ ] Implement `semanticDiff()` utility (TDD)
- [ ] Create normalized fixtures
- [ ] Create edge-case fixtures
- [ ] Write deterministic tests
- [ ] Write semantic equivalence tests
- [ ] Document discovered issues

---

## Decisions Made

| Question                   | Decision   | Rationale                                               |
| -------------------------- | ---------- | ------------------------------------------------------- |
| Converter consolidation    | ✅ Done    | ADR-028 — Single `writeOpenApi()` in `writers/openapi/` |
| Canonical structure        | ✅ Defined | ADR-029 — `parsers/` + `writers/` + `ir/`               |
| Real-world APIs in Tier 2  | No         | Use official OpenAPI examples                           |
| additionalProperties added | Enrichment | Document, not failure                                   |

---

## References

- [ADR-027: Round-Trip Validation](../../docs/architectural_decision_records/ADR-027-round-trip-validation.md)
- [ADR-028: IR→OpenAPI Consolidation](../../docs/architectural_decision_records/ADR-028-ir-openapi-consolidation.md)
- [ADR-029: Canonical Source Structure](../../docs/architectural_decision_records/ADR-029-canonical-source-structure.md)
- [Existing IR fidelity test](../../lib/tests-e2e/ir-fidelity.test.ts)
