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

### 3. Strict-By-Default and Fail-Fast

> **INVIOLABLE:** All code must be STRICT by default and FAIL FAST on errors. NO exceptions.

- Objects use `.strict()` unless `additionalProperties: true`
- Unknown types MUST throw, never fall back to `z.unknown()`
- No silent coercion, no partial output

### 4. Pure AST via ts-morph

All code generation uses **ts-morph AST manipulation**—no string templates or concatenation.

### 5. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards

### 6. TDD at ALL Levels (Mandatory)

Write failing tests FIRST—unit, integration, AND E2E.

### 7. Quality Gates (All 10 Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

> **Note:** All commands run from `lib/` directory.

---

## 📋 Current Focus: Zod 4 Output Compliance (Session 2.8)

> [!IMPORTANT]
> **Zod 4 ONLY** — We do not support Zod 3. This enables `.meta()` for zero information loss.

**Status:** 🚧 IN PROGRESS (Phases 2.8.1-2.8.3 Complete)

### Completed Sessions

| Session | Focus                       | Status      |
| ------- | --------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer | ✅ Complete |
| 2.6     | OpenAPI Compliance          | ✅ Complete |
| 2.7     | OpenAPI Round-Trip          | ✅ Complete |
| 2.8.1   | Audit & Planning            | ✅ Complete |
| 2.8.2   | Metadata via .meta()        | ✅ Complete |
| 2.8.3   | Type Coverage & Fail-Fast   | ✅ Complete |

### Remaining Work (Session 2.8.4+)

| Phase | Focus                                           | Status     |
| ----- | ----------------------------------------------- | ---------- |
| 2.8.4 | Integration tests (OpenAPI → IR → Zod pipeline) | 🔲 Pending |
| 2.8.5 | Validation parity tests                         | 🔲 Pending |

### Session 2.8 Objective

Prove that **OpenAPI → IR → Zod** produces correct, complete Zod 4 schemas with zero information loss.

**Active plan:** [zod4-output-compliance-plan.md](../plans/zod4-output-compliance-plan.md)

**Specification:** [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md)

---

## 📚 Essential Reading

| Priority | Document                                                                          | Purpose               |
| -------- | --------------------------------------------------------------------------------- | --------------------- |
| 1        | [zod4-output-compliance-plan.md](../plans/zod4-output-compliance-plan.md)         | Active work           |
| 2        | [zod-output-acceptance-criteria.md](../../docs/zod-output-acceptance-criteria.md) | Formal specification  |
| 3        | [RULES.md](../RULES.md)                                                           | Engineering standards |
| 4        | [testing-strategy.md](../testing-strategy.md)                                     | TDD at all levels     |

---

## 🗂️ Key Files (ADR-029 Structure)

| Layer            | Location                    | Entry Point      |
| ---------------- | --------------------------- | ---------------- |
| IR               | `lib/src/ir/`               | `schema.ts`      |
| Parsers          | `lib/src/parsers/{format}/` | `index.ts`       |
| Writers          | `lib/src/writers/{format}/` | `index.ts`       |
| Zod Writer       | `lib/src/writers/zod/`      | Focus for 2.8    |
| Round-trip tests | `lib/tests-roundtrip/`      | Fixtures for 2.8 |

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state
2. **Read this document** — Understand current focus
3. **Read active plan** — [zod4-output-compliance-plan.md](../plans/zod4-output-compliance-plan.md)
4. **Ask:** What impact are we creating for the user?
5. **Write tests first** — TDD at all levels
6. **Run quality gates** — All 10 must pass before commit

---

## ⚠️ Common Pitfalls

1. **Accepting content loss** — NEVER acceptable. All metadata via `.meta()`
2. **Silent fallbacks** — NEVER use `z.unknown()` for unsupported types, ALWAYS throw
3. **Building utilities before tests** — TDD means tests first
4. **Targeting Zod 3** — We only support Zod 4
5. **"Pragmatic" shortcuts** — In this project, pragmatic = highest quality
