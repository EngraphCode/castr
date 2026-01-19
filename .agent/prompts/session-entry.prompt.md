# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

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

### 6. Quality Gates (All 10 Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

---

## 📋 Current Focus: Round-Trip Validation (Session 2.7)

**Status:** 🟡 IN PROGRESS (Phase 1 Complete)

Session 2.6 (OpenAPI Compliance) is **✅ COMPLETE** — all phases finished on January 19, 2026.

### Session 2.7 Progress

| Phase | Focus                        | Status                           |
| ----- | ---------------------------- | -------------------------------- |
| 1     | `sortDeep()` utility (TDD)   | ✅ Complete (17 unit tests)      |
| 2     | Arbitrary fixtures           | ✅ Complete (5 symlinks created) |
| 3     | Round-trip integration tests | 🟡 Next                          |
| 4     | Normalized fixtures + script | 🔲 Pending                       |

**Completed this session:**

- Created `lib/src/shared/utils/sortDeep.ts` with 17 unit tests
- Created 5 arbitrary fixture symlinks in `lib/tests-roundtrip/__fixtures__/arbitrary/`
- All 10 quality gates pass (1,279+ tests)

**Next steps:**

1. Create round-trip integration test file (`round-trip.integration.test.ts`)
2. Implement losslessness tests (arbitrary specs)
3. Implement idempotency tests (normalized specs)
4. Create fixture generation script

**Entry point:** [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md) → Session 2.7 section

**Active plan:** [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md)

---

## 📚 Essential Reading

| Priority | Document                                                            | Purpose               |
| -------- | ------------------------------------------------------------------- | --------------------- |
| 1        | [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md)   | Active work           |
| 2        | [openapi-acceptance-criteria.md](../openapi-acceptance-criteria.md) | Formal specification  |
| 3        | [requirements.md](../requirements.md)                               | Field-level reqs      |
| 4        | [RULES.md](../RULES.md)                                             | Engineering standards |
| 5        | [testing-strategy.md](../testing-strategy.md)                       | TDD at all levels     |

**Reference Specifications:**

- OpenAPI schemas: `.agent/reference/openapi_schema/`
- JSON Schema 2020-12: `.agent/reference/json-schema-2020-12/`

---

## 🗂️ Key Files (ADR-029 Structure)

| Layer            | Location                                | Entry Point                                                    |
| ---------------- | --------------------------------------- | -------------------------------------------------------------- |
| IR               | `lib/src/ir/`                           | `schema.ts`                                                    |
| Parsers          | `lib/src/parsers/{format}/`             | `index.ts`                                                     |
| Writers          | `lib/src/writers/{format}/`             | `index.ts`                                                     |
| Validation       | `lib/src/shared/load-openapi-document/` | [README](../../lib/src/shared/load-openapi-document/README.md) |
| Round-trip tests | `lib/tests-roundtrip/`                  | [README](../../lib/tests-roundtrip/README.md)                  |

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state
2. **Read this document** — Understand current focus
3. **Read active plan** — [openapi-compliance-plan.md](../plans/openapi-compliance-plan.md)
4. **Ask:** What impact are we creating for the user?
5. **Write tests first** — TDD at all levels
6. **Run quality gates** — All 10 must pass before commit

---

## ⚠️ Common Pitfalls

1. **Accepting content loss** — NEVER acceptable. Expand IR if needed.
2. **Building utilities before tests** — TDD means tests first
3. **Jumping to solutions** — Articulate the problem first
4. **Forgetting user value** — Every change needs clear user impact
5. **"Pragmatic" shortcuts** — In this project, pragmatic = highest quality
