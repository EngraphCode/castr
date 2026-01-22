# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

---

## 🎯 What This Library Does

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → ts-morph Writers → Any Output Format
```

---

## 🔴 Critical Rules (Non-Negotiable)

### 1. The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Castr Model matters.**

### 2. NO CONTENT LOSS

> **This principle is inviolable.** The format can change, the content cannot.

### 3. Strict-By-Default and Fail-Fast

> **INVIOLABLE:** All code must be STRICT by default and FAIL FAST on errors. NO exceptions.

- Objects use `.strict()` unless `additionalProperties: true`
- Unknown types MUST throw, never fall back to `z.unknown()`
- No silent coercion, no partial output
- Use `.parse()` (throws) not `.safeParse()` (returns)

### 4. Zod 4 Only

> **Zod 3 syntax MUST be rejected** with clear, descriptive error messages.

| Zod 3 (❌ Reject)    | Zod 4 (✅ Accept) |
| -------------------- | ----------------- |
| `z.string().email()` | `z.email()`       |
| `z.string().url()`   | `z.url()`         |
| `z.number().int()`   | `z.int()`         |

### 5. Code Generation via ts-morph

Writers use **ts-morph** for code generation—no string templates or concatenation.

### 6. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards

### 7. TDD at ALL Levels (Mandatory)

Write failing tests FIRST—unit, integration, AND E2E.

### 8. Quality Gates (All 10 Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

> **Note:** All commands run from `lib/` directory.

---

## 📋 Current Focus: Session 3.2 — Zod → IR Parser

> [!IMPORTANT]
> **Sessions 3.1a-3.1b complete.** IR is format-agnostic, native recursion implemented.
> **Phase 1 (Fixture Creation) is in progress** — happy-path fixtures done, expected IR files in progress.

### Completed Sessions

| Session | Focus                     | Status      |
| ------- | ------------------------- | ----------- |
| 2.1-2.9 | OpenAPI ↔ Zod Pipeline    | ✅ Complete |
| 3.1a    | IR Semantic Audit         | ✅ Complete |
| 3.1b    | Zod 4 IR→Zod Improvements | ✅ Complete |

### Current Session: 3.2 — Zod → IR Parser (🎯 Active)

**Goal:** Parse Zod 4 schemas and reconstruct the IR.

**Critical requirements:**

- **Zod 4 only** — reject Zod 3 syntax with clear errors
- **Strict everywhere** — fail fast with useful error messages
- **Pattern recognition** — map Zod 4 functions back to IR
- **Handle getter syntax** — recursive reference detection

**Plan:** [zod4-parser-plan.md](../plans/zod4-parser-plan.md)

### Upcoming: Session 3.3 — True Round-Trip

Once the parser is complete, validate: `OpenAPI → Zod → OpenAPI` is byte-identical.

---

## 📂 Key Files for Session 3.2

| Location               | Purpose                                |
| ---------------------- | -------------------------------------- |
| `lib/src/parsers/zod/` | Zod parser implementation (to build)   |
| `lib/src/writers/zod/` | Zod writer (generates output we parse) |
| `lib/src/ir/schema.ts` | IR types we reconstruct                |

---

## 📚 Essential Reading

| Priority | Document                                                                            | Purpose               |
| -------- | ----------------------------------------------------------------------------------- | --------------------- |
| 1        | [zod4-parser-plan.md](../plans/zod4-parser-plan.md)                                 | Session 3.2 plan      |
| 2        | [RULES.md](../RULES.md)                                                             | Engineering standards |
| 3        | [testing-strategy.md](../testing-strategy.md)                                       | TDD at all levels     |
| 4        | [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md) | Zod output patterns   |
| 5        | [roadmap.md](../plans/roadmap.md)                                                   | Strategic context     |

---

## 🚀 Starting Session 3.2

1. **Run quality gates** — Verify clean state
2. **Read the plan** — [zod4-parser-plan.md](../plans/zod4-parser-plan.md)
3. **Study writer output** — Understand what patterns to parse
4. **Write failing tests first** — TDD the parser
5. **Run quality gates** — All 10 must pass before commit

---

## ⚠️ Common Pitfalls (Session 3.2 Specific)

1. **Accepting Zod 3 syntax** — ALWAYS detect and reject with clear errors
2. **Partial parsing** — Never return incomplete IR, fail fast
3. **Ignoring getter syntax** — Critical for circular reference detection
4. **Forgetting .meta()** — Must extract all metadata to IR
5. **Skipping .strict()** — Must detect and map to `additionalProperties: false`
