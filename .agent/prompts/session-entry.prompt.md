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

**Total: 1237+ tests** (881 unit, 173 snapshot, 20 gen, 163 character)

---

## 📋 Current State (January 12, 2026)

### ✅ Phase 1 Complete: OpenAPI → Zod

- All 10 quality gates passing
- IR Builder, Zod Writer, Type Writer complete
- Architectural validation enforced (17 tests)
- MCP subsystem fully IR-based

### 🎯 Phase 2 Active: Zod → OpenAPI

Implementing the reverse transformation to prove bidirectional architecture.

**Key Decisions:**

- **Zod 4 only** — Strict rejection of Zod 3 and invalid input
- **Schemas + endpoints** — Both must be supported
- **Deterministic recommendations** — No AI-generated metadata

**See:** [zod-to-openapi-plan.md](plans/zod-to-openapi-plan.md)

| Session | Focus                    | Status      |
| ------- | ------------------------ | ----------- |
| 2.1     | Zod 4 parser foundation  | ✅ Complete |
| 2.2     | Constraints & modifiers  | ✅ Complete |
| 2.3     | Composition & references | ✅ Complete |
| 2.4     | Endpoint parsing         | ✅ Complete |
| 2.5     | OpenAPI writer           | ✅ Complete |
| 2.6     | Round-trip validation    | 🎯 Next     |
| 2.7     | Adapter abstraction      | Pending     |

> **⚠️ ADR-026:** No regex for parsing. All parsers must use ts-morph AST.
> Lint refactoring completed — 0 errors, all regex replaced with string/AST methods.

---

## 📚 Essential Reading

| Priority | Document                                               | Purpose                                    |
| -------- | ------------------------------------------------------ | ------------------------------------------ |
| 1        | [roadmap.md](plans/roadmap.md)                         | Current state, format order, future phases |
| 2        | [zod-to-openapi-plan.md](plans/zod-to-openapi-plan.md) | Active work: Phase 2 sessions              |
| 3        | [RULES.md](RULES.md)                                   | Engineering standards                      |
| 4        | [VISION.md](VISION.md)                                 | Strategic direction                        |

---

## 🗂️ Key Files

### Core IR Types

- `lib/src/context/ir-schema.ts` — CastrDocument, CastrSchema, CastrOperation

### Parsers (Input → IR)

- `lib/src/context/ir-builder.ts` — OpenAPI → IR
- `lib/src/parsers/zod/` — **[Phase 2: New]** Zod → IR

### Writers (IR → Output)

- `lib/src/writers/zod-writer.ts` — IR → Zod
- `lib/src/writers/type-writer.ts` — IR → TypeScript
- `lib/src/writers/openapi/` — **[Phase 2: New]** IR → OpenAPI

### Architectural Tests

- `lib/src/architecture/layer-boundaries.arch.test.ts` — Layer enforcement
- `lib/src/architecture/ir-completeness.arch.test.ts` — IR type verification

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state (0 lint errors)
2. **Read the current plan** — [zod-to-openapi-plan.md](plans/zod-to-openapi-plan.md)
3. **Start Session 2.6** — Round-trip validation
4. **Write tests first** — TDD is mandatory
5. **Run quality gates** — All 10 must pass before commit

---

## 🔄 Format Implementation Order

| Phase | Transform             | Status      |
| ----- | --------------------- | ----------- |
| 1     | OpenAPI → Zod         | ✅ Complete |
| 2     | Zod → OpenAPI         | 🎯 Active   |
| 3     | JSONSchema ↔ OpenAPI | Planned     |
| 4     | JSONSchema ↔ Zod     | Planned     |
| 5     | tRPC ↔ IR            | Planned     |

**Rationale:** Complete both directions for a format before adding new formats.

---

## ❓ First Question

> **"What impact are we trying to create for the user with this change?"**

Before coding, understand the user-facing value. Verify the approach aligns with the IR architecture.
