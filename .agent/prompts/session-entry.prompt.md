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

### 2. Pure AST via ts-morph

All code generation uses **ts-morph AST manipulation**—no string templates or concatenation.

### 3. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards

### 4. TDD (Mandatory)

Write failing tests FIRST. No exceptions.

### 5. Quality Gates (All Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

---

## 📋 Current Focus

**Phase 2 Active: Zod → OpenAPI** — Session 2.6 (Round-Trip Validation)

**Blocking work:** [ADR-029](../../docs/architectural_decision_records/ADR-029-canonical-source-structure.md) defines the canonical structure migration (`context/ir-builder` → `parsers/openapi/`). See implementation plan.

See [roadmap.md](../plans/roadmap.md) for phase status and [round-trip-validation-plan.md](../plans/round-trip-validation-plan.md) for active session.

---

## 📚 Essential Reading

| Priority | Document                                                             | Purpose                              |
| -------- | -------------------------------------------------------------------- | ------------------------------------ |
| 1        | [roadmap.md](../plans/roadmap.md)                                    | Project status, phases, format order |
| 2        | [round-trip-validation-plan.md](../plans/round-trip-validation-plan.md) | Active Session 2.6                |
| 3        | [ADR-029](../../docs/architectural_decision_records/ADR-029-canonical-source-structure.md) | Canonical structure (`parsers/` + `writers/`) |
| 4        | [RULES.md](../RULES.md)                                              | Engineering standards                |
| 5        | [VISION.md](../VISION.md)                                            | Strategic direction                  |

---

## 🗂️ Key Files

### Core IR Types

- `lib/src/context/ir-schema.ts` — CastrDocument, CastrSchema, CastrOperation

### Parsers (Input → IR)

- `lib/src/context/ir-builder.ts` — OpenAPI → IR
- `lib/src/parsers/zod/` — Zod → IR (see [README](lib/src/parsers/zod/README.md))

### Writers (IR → Output)

- `lib/src/writers/zod-writer.ts` — IR → Zod
- `lib/src/writers/type-writer.ts` — IR → TypeScript
- `lib/src/writers/openapi/` — IR → OpenAPI

### Architecture

- `lib/src/architecture/layer-boundaries.arch.test.ts` — Layer enforcement
- `docs/architectural_decision_records/` — ADRs (26+ decisions)

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state
2. **Read roadmap.md** — Confirm current phase/session
3. **Read active plan** — Check session scope
4. **Write tests first** — TDD is mandatory
5. **Run quality gates** — All 10 must pass before commit

---

## ❓ First Question

> **"What impact are we trying to create for the user with this change?"**

Before coding, understand the user-facing value. Verify the approach aligns with the IR architecture.
