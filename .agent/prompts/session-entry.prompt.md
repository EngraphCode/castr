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

**Status:** 🟡 READY TO START

Session 2.6 (OpenAPI Compliance) is **✅ COMPLETE** — all phases finished on January 19, 2026.

| Completed | Focus                    | Date            |
| --------- | ------------------------ | --------------- |
| ✅ 2.6.1  | IR Expansion (10 fields) | January 16 2026 |
| ✅ 2.6.2  | Parser Completion        | January 16 2026 |
| ✅ 2.6.3  | Writer Completion        | January 19 2026 |
| ✅ 2.6.4  | Input Coverage Tests     | Prior           |
| ✅ 2.6.5  | Output Coverage Tests    | Prior           |
| ✅ 2.6.6  | Strict Validation        | Prior           |

### Next: Session 2.7 — Round-Trip Validation

**Objective:** Prove production readiness with two claims:

| Claim            | User Confidence                               |
| ---------------- | --------------------------------------------- |
| **Idempotency**  | Running Castr twice produces identical output |
| **Losslessness** | No information lost during transformation     |

**Two test cases:**

1. **Arbitrary OpenAPI → IR → OpenAPI** — Content preserved (format may normalize)
2. **Normalized OpenAPI → IR → OpenAPI** — Byte-for-byte identical

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
