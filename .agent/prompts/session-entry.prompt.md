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

### 6. No String Manipulation for Parsing

> **INVIOLABLE:** All parsing must use proper AST analysis (ts-morph). String manipulation carries no semantic meaning and is banned.

### 7. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`, disabled checks
- **REQUIRED:** Library types first, proper type guards

### 8. TDD at ALL Levels (Mandatory)

Write failing tests FIRST—unit, integration, AND E2E.

### 9. Quality Gates (All Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character
```

> **Note:** All commands run from `lib/` directory.

---

## 📋 Current Focus: Session 3.2 — Zod → IR Parser

> [!WARNING]
> **BUILD IS CURRENTLY BROKEN.** The next session MUST start by fixing build errors before any new work.

### Build Status

```
❌ DTS Build Error in zod-parser.primitives.ts
   - Line 163: Unused function 'parseZodExpression'
   - Line 313: Type comparison error between 'literal' and 'null'
```

### Completed Sessions

| Session | Focus                     | Status      |
| ------- | ------------------------- | ----------- |
| 2.1-2.9 | OpenAPI ↔ Zod Pipeline    | ✅ Complete |
| 3.1a    | IR Semantic Audit         | ✅ Complete |
| 3.1b    | Zod 4 IR→Zod Improvements | ✅ Complete |

### Current Session: 3.2 — Zod → IR Parser (🎯 Active)

**Goal:** Parse Zod 4 schemas and reconstruct the IR.

**Status:** Phase 2 implementation in progress, build broken

**What's Done:**

- ✅ Phase 1: All fixture files created (10 happy-path, 1 sad-path)
- ✅ Core parser architecture established (dispatcher pattern)
- ✅ Individual parser modules created (primitives, object, composition, union, intersection, references)
- ❌ Build errors in `zod-parser.primitives.ts`
- ❌ Lint errors in multiple files (complexity, unused vars)

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

## 🚀 Starting the Next Session

### 1. Fix Build (BLOCKING)

```bash
cd lib
pnpm build  # Will fail - fix the errors
```

Fix in `zod-parser.primitives.ts`:

- Remove or use `parseZodExpression` (line 163)
- Fix type comparison at line 313

### 2. Fix Lint Errors

```bash
pnpm lint
```

Common issues to fix:

- Unused `chainedMethods` params → prefix with `_`
- Single-line if bodies → add braces
- Cognitive complexity → split functions

### 3. Run Full Quality Gates

```bash
pnpm build && pnpm type-check && pnpm lint && pnpm format:check
```

### 4. Continue Implementation

Read the updated plan: [zod4-parser-plan.md](../plans/zod4-parser-plan.md)

---

## ⚠️ Key Challenges Discovered

1. **Dependency cycles** between parser modules — need careful import management
2. **CastrSchemaProperties wrapper required** — use `new CastrSchemaProperties(obj)`
3. **CastrSchemaNode required everywhere** — use `createDefaultMetadata()`
4. **Strict TypeScript** — explicit `| undefined` for optional props
5. **Low cognitive complexity limits** — max 12, must split large functions

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

## ⚠️ Common Pitfalls (Session 3.2 Specific)

1. **Accepting Zod 3 syntax** — ALWAYS detect and reject with clear errors
2. **Partial parsing** — Never return incomplete IR, fail fast
3. **Ignoring getter syntax** — Critical for circular reference detection
4. **Forgetting .meta()** — Must extract all metadata to IR
5. **Skipping .strict()** — Must detect and map to `additionalProperties: false`
6. **Incremental file patches** — Led to file corruption; prefer full file rewrites when making significant changes
