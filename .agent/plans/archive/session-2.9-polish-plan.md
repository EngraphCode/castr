# Session 2.9 Polish Plan

**Date:** January 20, 2026  
**Status:** ✅ Complete (archived January 21, 2026)  
**Prerequisite:** Session 2.8 complete, quality gates green (972 tests)

---

## ⚡ Quick Start (New Session)

1. **Read foundational docs:** [RULES.md](../../directives/RULES.md), [testing-strategy.md](../../directives/testing-strategy.md), [DEFINITION_OF_DONE.md](../../directives/DEFINITION_OF_DONE.md)
2. **Run quality gates** to verify clean state
3. **Work through remaining tasks** below using TDD
4. **Run quality gates** after each task
5. **After completion:** Proceed to [zod4-advanced-features-research.md](../../reference/zod4-advanced-features-research.md)

---

## Context

The OpenAPI → IR → Zod pipeline is **proven** (generation works, validation works, real-world fixtures pass). This plan adds **hardening tests** for edge cases and new Zod 4 features.

**Key reference:** [ADR-031-zod-output-strategy.md](../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)

---

## Objective

Harden the OpenAPI → IR → Zod pipeline with additional test coverage for edge cases and new Zod 4 features.

---

## Gaps to Address

### 1. Format-Specific Function Tests

**Current state:** `z.xor()`, `z.discriminatedUnion()`, `z.int32()`, `z.email()` etc. are generated but not explicitly tested in validation-parity tests.

**Tasks:**

- [ ] Add parity tests for `z.xor()` exclusive union behavior (only one branch matches)
- [ ] Add parity tests for `z.discriminatedUnion()` with discriminator property
- [ ] Add parity tests for integer formats (`z.int()`, `z.int32()`, `z.int64()`)
- [ ] Add parity tests for string formats (`z.email()`, `z.url()`, `z.iso.datetime()`)

**Success metric:** Tests prove format functions validate correctly.

---

### 2. Fail-Fast Coverage Tests

**Current state:** Fail-fast behavior (throw on unsupported) is mandated but not systematically tested.

**Tasks:**

- [ ] Add unit tests for unsupported schema patterns → throws
- [ ] Document which patterns are unsupported in writer README

**Success metric:** Tests prove unsupported patterns throw, not degrade to `z.unknown()`.

---

### 3. Expand Validation Parity Fixtures

**Current state:** Only `petstore-3.0` schemas tested in `validation-parity.integration.test.ts`.

**Tasks:**

- [ ] Add parity tests for `petstore-expanded-3.0` (has `allOf` composition)
- [ ] Add parity tests for `tictactoe-3.1` (3.1 features)
- [ ] Add parity tests for `callback-3.0` (callbacks)

**Success metric:** More real-world fixtures validated.

---

## Definition of Done

- [ ] All new tests pass
- [ ] All 11 quality gates pass
- [ ] Update session-entry.prompt.md to mark 2.9 complete
- [ ] Update roadmap.md to reflect 2.9 complete

---

## Estimated Effort

| Task                  | Complexity |
| --------------------- | ---------- |
| Format function tests | Medium     |
| Fail-fast tests       | Low        |
| Expand fixtures       | Low        |

**Total:** ~2-3 hours of focused work
