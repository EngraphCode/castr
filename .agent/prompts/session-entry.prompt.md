# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session. It provides complete context.**

---

## 🎯 Project Summary

This library transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)** architecture.

```text
Any Input Format → Parser → IR (canonical AST) → ts-morph Writers → Any Output Format
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
pnpm test          # 642 unit tests
pnpm test:snapshot # 173 snapshot tests
pnpm test:gen      # 20 generated code tests
pnpm character     # 163 characterisation tests
```

---

## 📋 Current State (January 9, 2026)

### ✅ What Works

- All 10 quality gates passing (998+ tests total)
- IR Builder complete (OpenAPI → CastrDocument with schemaNames, dependencyGraph)
- Zod Writer complete (operates on IR via ts-morph)
- Type Writer complete (operates on IR via ts-morph)
- Scalar Pipeline complete (bundles, upgrades to 3.1)
- IR-1 complete (schemaNames, full dependencyGraph with depth/circularity)
- IR-2 complete (context layer uses IR for schema names, dependency graphs, endpoint tags)
- IR-3.1-3.4 complete (MCP IR functions: parameters, body/response, schema inlining, tool builder)

### ⚠️ What Needs Work (Phase 1 Completion)

Phase 1 is **functionally working** but **architecturally incomplete**:

| Work Item                         | Status     | Reference                    |
| --------------------------------- | ---------- | ---------------------------- |
| IR-2: Context layer cleanup       | ✅ Done    | [phase-1-completion-plan.md] |
| IR-3.1-3.4: MCP IR functions      | ✅ Done    | [phase-1-completion-plan.md] |
| IR-3.5: Wire up buildMcpTools     | 🎯 Current | [phase-1-completion-plan.md] |
| IR-3.6: Remove deprecated OpenAPI | Pending    | [phase-1-completion-plan.md] |
| IR-4: Validation framework        | Pending    | [phase-1-completion-plan.md] |
| IR-5: Documentation               | Pending    | [phase-1-completion-plan.md] |

**Current Work: IR-3.5 (Wire up buildMcpTools)**

The IR-based functions are complete and tested (32 new tests). Next step is wiring `buildMcpTools()` to use the IR-only path, then removing deprecated OpenAPI functions.

> **Note:** Lint currently shows 13 `ParameterAccumulator is deprecated` warnings. These are **expected** — they're on old OpenAPI-based code that will be removed in IR-3.6.

---

## 📚 Essential Reading (In Order)

1. **[VISION.md](.agent/VISION.md)** — Strategic direction
2. **[RULES.md](.agent/RULES.md)** — Engineering standards (extensive)
3. **[roadmap.md](.agent/plans/roadmap.md)** — Current state and next steps
4. **[ADR-024](docs/architectural_decision_records/ADR-024-complete-ir-alignment.md)** — IR alignment decision
5. **[testing-strategy.md](.agent/testing-strategy.md)** — Test methodology
6. **[DEFINITION_OF_DONE.md](.agent/DEFINITION_OF_DONE.md)** — Quality criteria

---

## 🎯 Current Phase: Phase 1 Completion

Phase 1 (OpenAPI → Zod) needs architectural cleanup before Phase 2 (Zod → OpenAPI).

**See:** [phase-1-completion-plan.md](plans/phase-1-completion-plan.md) for detailed plan.

---

## 🔄 Format Implementation Order

The order of format support is **deliberate** (see VISION.md):

| Phase | Transform             | Status         |
| ----- | --------------------- | -------------- |
| 1     | OpenAPI → Zod         | 🟡 In Progress |
| 2     | Zod → OpenAPI         | After Phase 1  |
| 3     | JSONSchema ↔ OpenAPI | Planned        |
| 4     | JSONSchema ↔ Zod     | Planned        |
| 5     | tRPC ↔ IR            | Planned        |

**Rationale:** Complete each phase architecturally before moving on.

---

## 🗂️ Key Files

### Core IR Types

- `lib/src/context/ir-schema.ts` — CastrDocument, CastrSchema, IROperation types
- `lib/src/context/ir-builder.ts` — `buildIR()` function

### Writers (Pure AST)

- `lib/src/writers/zod-writer.ts` — Zod schema generation
- `lib/src/writers/type-writer.ts` — TypeScript type generation

### Context Layer (Refactored)

- `lib/src/context/template-context.ts` — `getTemplateContext()` orchestration (uses IR)
- `lib/src/context/template-context.from-ir.ts` — IR-only helpers
- `lib/src/context/template-context.mcp.ts` — MCP tool generation (wiring to IR pending - IR-3.5)
- `lib/src/context/template-context.mcp.schemas.from-ir.ts` — IR-based schema builder

### Tests

- `lib/src/characterisation/` — Behavioural tests
- `lib/tests-snapshot/` — Snapshot tests

---

## 🔍 Before Making Changes

1. **Run quality gates** to verify clean starting state
2. **Read the phase-1-completion-plan.md** for detailed task breakdown
3. **Read the specific ADR** if working on that area
4. **Write tests first** (TDD is mandatory)
5. **Check the Caster Model types** before accessing any schema data
6. **Run quality gates again** after changes

### 🚀 Immediate Next Task

**IR-3.5: Wire up buildMcpTools** — Modify `buildMcpTools()` in `template-context.mcp.ts` to call the new IR-based functions instead of OpenAPI-based ones. See [phase-1-completion-plan.md](plans/phase-1-completion-plan.md) for acceptance criteria.

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
