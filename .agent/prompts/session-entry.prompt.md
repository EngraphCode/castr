# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session. It provides complete context.**

---

## 🎯 Project Summary

This library converts OpenAPI specifications into Zod schemas, TypeScript types, and MCP tool definitions using an **Information Retrieval (IR) architecture** with a **canonical AST representation**.

```text
OpenAPI 3.x → Scalar Pipeline → CastrDocument (canonical AST) → ts-morph Writers → Artefacts
```

---

## 🔴 Critical Rules (Non-Negotiable)

### 1. The Cardinal Rule

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

All code that processes schema data works with the Caster Model (CastrDocument, CastrSchema, IROperation). Never access raw OpenAPI after `buildIR()`.

### 2. Pure AST via ts-morph

All code generation uses **ts-morph AST manipulation exclusively**—no string manipulation:

| ✅ Allowed                          | ❌ Forbidden                |
| ----------------------------------- | --------------------------- |
| `writer.write('z.object(')`         | `` `const ${name} = ...` `` |
| `sourceFile.addVariableStatement()` | `code += "z.string()"`      |

### 3. Type Discipline (Zero Tolerance)

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first (`openapi3-ts/oas31`), proper type guards
- **MANDATE:** Fix architecture, not types

### 4. TDD (Mandatory)

Write failing tests FIRST. No exceptions.

### 5. Quality Gates (All Must Pass)

```bash
pnpm clean && pnpm install
pnpm build
pnpm type-check
pnpm lint
pnpm format:check
pnpm test          # 598 unit tests
pnpm test:snapshot # 173 snapshot tests
pnpm test:gen      # 20 generated code tests
pnpm character     # 163 characterisation tests
```

---

## 📋 Current State (January 2026)

### ✅ What Works

- All 10 quality gates passing (954 tests total)
- IR Builder complete (OpenAPI → CastrDocument)
- Zod Writer complete (operates on IR via ts-morph)
- Type Writer complete (operates on IR via ts-morph)
- Scalar Pipeline complete (bundles, upgrades to 3.1)

### ⚠️ What Needs Work

Per [ADR-024](docs/architectural_decision_records/ADR-024-complete-ir-alignment.md):

| Issue                                             | Files                      | Severity |
| ------------------------------------------------- | -------------------------- | -------- |
| MCP uses raw OpenAPI instead of IR                | `template-context.mcp*.ts` | High     |
| Context layer passes `doc` after IR               | `template-context.ts`      | Medium   |
| CastrDocument missing schemaNames/dependencyGraph | `ir-builder.ts`            | Medium   |

---

## 📚 Essential Reading (In Order)

1. **[VISION.md](.agent/VISION.md)** — Strategic direction
2. **[RULES.md](.agent/RULES.md)** — Engineering standards (extensive)
3. **[roadmap.md](.agent/plans/roadmap.md)** — Current state and next steps
4. **[ADR-024](docs/architectural_decision_records/ADR-024-complete-ir-alignment.md)** — IR alignment decision
5. **[testing-strategy.md](.agent/testing-strategy.md)** — Test methodology
6. **[DEFINITION_OF_DONE.md](.agent/DEFINITION_OF_DONE.md)** — Quality criteria

---

## 🎯 Immediate Work: IR Alignment

The next work is completing IR architecture alignment (see roadmap.md):

| Phase | Description                                          | Effort |
| ----- | ---------------------------------------------------- | ------ |
| IR-1  | Enhance CastrDocument (schemaNames, dependencyGraph) | 4-6h   |
| IR-2  | Refactor context layer to use IR exclusively         | 6-8h   |
| IR-3  | Refactor MCP subsystem to use IR                     | 10-12h |
| IR-4  | Documentation and cleanup                            | 4-6h   |
| IR-5  | Verification and hardening                           | 2-3h   |

---

## 🗂️ Key Files

### Core IR Types

- `lib/src/context/ir-schema.ts` — CastrDocument, CastrSchema, IROperation types
- `lib/src/context/ir-builder.ts` — `buildIR()` function

### Writers (Pure AST)

- `lib/src/writers/zod-writer.ts` — Zod schema generation
- `lib/src/writers/type-writer.ts` — TypeScript type generation

### Context Layer (Needs Refactoring)

- `lib/src/context/template-context.ts` — `getTemplateContext()` orchestration
- `lib/src/context/template-context.mcp.ts` — MCP tool generation (uses raw OpenAPI)

### Tests

- `lib/src/characterisation/` — Behavioural tests
- `lib/tests-snapshot/` — Snapshot tests

---

## 🔍 Before Making Changes

1. **Run quality gates** to verify clean starting state
2. **Read the specific ADR** if working on that area
3. **Write tests first** (TDD is mandatory)
4. **Check the Caster Model types** before accessing any schema data
5. **Run quality gates again** after changes

---

## 📁 Project Structure

```
.agent/
├── VISION.md              ← Strategic direction
├── RULES.md               ← Engineering standards
├── requirements.md        ← Decision-making guide
├── testing-strategy.md    ← Test methodology
├── DEFINITION_OF_DONE.md  ← Quality gates
└── plans/
    ├── roadmap.md         ← Current state and next steps
    └── future-*.md        ← Future work plans

docs/
├── architectural_decision_records/
│   ├── ADR-023-ir-based-architecture.md
│   ├── ADR-024-complete-ir-alignment.md
│   └── SUMMARY.md         ← ADR index
├── architecture/
│   └── scalar-pipeline.md
└── guides/
    └── openapi-3.1-migration.md

lib/src/
├── context/               ← IR builder and context
├── writers/               ← ts-morph code generators
├── characterisation/      ← Behavioural tests
└── ...
```

---

## ❓ First Question (Always Ask)

> **"What impact are we trying to create for the user with this change?"**

Before coding, understand the user-facing value. Then verify the proposed approach aligns with the Caster Model architecture.
