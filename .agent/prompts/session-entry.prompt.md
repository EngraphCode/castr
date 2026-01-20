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

> After parsing, input documents are conceptually discarded. **Only the Caster Model matters.**

### 2. NO CONTENT LOSS

> **This principle is inviolable.** The format can change, the content cannot.

### 3. Strict-By-Default and Fail-Fast

> **INVIOLABLE:** All code must be STRICT by default and FAIL FAST on errors. NO exceptions.

- Objects use `.strict()` unless `additionalProperties: true`
- Unknown types MUST throw, never fall back to `z.unknown()`
- No silent coercion, no partial output
- Use `.parse()` (throws) not `.safeParse()` (returns) — fail-fast means throw on error

### 4. Pure AST via ts-morph

All code generation uses **ts-morph AST manipulation**—no string templates or concatenation.

### 5. Type Discipline

- **FORBIDDEN:** `as` (except `as const`), `any`, `!`
- **REQUIRED:** Library types first, proper type guards

### 6. TDD at ALL Levels (Mandatory)

Write failing tests FIRST—unit, integration, AND E2E.

### 7. Tests Prove Real Code, Not Test Code

- Tests must validate actual system behavior
- TypeScript proves types, tests prove behavior
- If code compiles and runs, it compiles—no need for separate compilation tests

### 8. Quality Gates (All 11 Must Pass)

```bash
pnpm clean && pnpm install && pnpm build && pnpm type-check && \
pnpm lint && pnpm format:check && pnpm test && pnpm test:snapshot && \
pnpm test:gen && pnpm character && pnpm test:transforms
```

> **Note:** All commands run from `lib/` directory.

---

## 📋 Current Focus: Session 2.9 Ready

> [!NOTE]
> **Sessions 2.8 and 2.8.x are COMPLETE.** All quality gates passing (1298 tests).

### Completed Sessions

| Session | Focus                       | Status      |
| ------- | --------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer | ✅ Complete |
| 2.6     | OpenAPI Compliance          | ✅ Complete |
| 2.7     | OpenAPI Round-Trip          | ✅ Complete |
| 2.8     | Zod 4 Output Compliance     | ✅ Complete |
| 2.8.x   | Strictness Remediation      | ✅ Complete |

### Session 2.8.x Outcomes

1. **TypeScript type composition** — `type-writer.ts` handles `allOf`→`&`, `oneOf`/`anyOf`→`|`
2. **Inline object strictness** — `endpoints.ts` adds `.strict()` to queryParams/pathParams/headers
3. **Composition test coverage** — Added 5 new tests for intersection/union types
4. **Generated outputs updated** — All `normalized/*/zod.ts` files regenerated with correct types

### Next: Session 2.9 (TBD)

Possible focuses:

- Create ADR-031 for Zod output strategy
- Zod 4 deep dive — leverage new features (`.meta()`, `z.globalRegistry`)
- Zod input parsing (Zod → IR)
- Additional output formats

---

## 📂 Fixture Architecture

**Input fixtures** are static OpenAPI specs in `lib/tests-roundtrip/__fixtures__/arbitrary/`.

**Generated outputs** in `lib/tests-roundtrip/__fixtures__/normalized/` are kept in the repo for analysis:

| File               | Description                        |
| ------------------ | ---------------------------------- |
| `input.yaml`       | Symlink to arbitrary fixture       |
| `normalized.json`  | OpenAPI output from first pass     |
| `reprocessed.json` | OpenAPI output from second pass    |
| `ir.json`          | IR from first pass                 |
| `zod.ts`           | Generated Zod schemas + TypeScript |

**Update generated outputs** with: `npx tsx scripts/generate-normalized-fixtures.ts`

---

## 🔧 IR Version Fields

`CastrDocument` has two version fields:

| Field            | Value     | Source                                          |
| ---------------- | --------- | ----------------------------------------------- |
| `version`        | `"1.0.0"` | IR schema version (Castr-defined)               |
| `openApiVersion` | `"3.1.1"` | From Scalar `upgrade()` — upgrades all to 3.1.1 |

> [!IMPORTANT]
> **`3.1.1` is Scalar's output, not an official OpenAPI version.** OpenAPI only has `3.1.0`.
> This is external library behavior, not a Castr bug. The IR correctly stores what Scalar provides.

---

## ⚠️ Design Decisions (Established)

These are no longer assumptions — they've been verified:

1. **`zod.ts` files are generated outputs** — kept for inspection, validated by `validation-parity` tests
2. **TypeScript proves types, tests prove behavior** — per testing-strategy.md
3. **Composition types map correctly** — `allOf`→`&`, `oneOf`/`anyOf`→`|` (tested)
4. **Inline endpoint objects use `.strict()`** — unconditional, not configurable
5. **`type-check-validation.gen.test.ts`** — proves fresh generation compiles correctly

---

## 📚 Essential Reading

| Priority | Document                                                                  | Purpose                 |
| -------- | ------------------------------------------------------------------------- | ----------------------- |
| 1        | [RULES.md](../RULES.md)                                                   | Engineering standards   |
| 2        | [testing-strategy.md](../testing-strategy.md)                             | TDD at all levels       |
| 3        | [requirements.md](../requirements.md)                                     | Decision guidance       |
| 4        | [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)                         | Quality gates           |
| 5        | [zod-output-acceptance-criteria.md](../zod-output-acceptance-criteria.md) | Zod output requirements |
| 6        | [lib/tests-roundtrip/README.md](../../lib/tests-roundtrip/README.md)      | Roundtrip test docs     |

---

## 🗂️ Key Files (ADR-029 Structure)

| Layer            | Location                    | Entry Point |
| ---------------- | --------------------------- | ----------- |
| IR               | `lib/src/ir/`               | `schema.ts` |
| Parsers          | `lib/src/parsers/{format}/` | `index.ts`  |
| Writers          | `lib/src/writers/{format}/` | `index.ts`  |
| Round-trip tests | `lib/tests-roundtrip/`      | Integration |

---

## 🚀 Starting a Session

1. **Run quality gates** — Verify clean state
2. **Read this document** — Understand current focus
3. **Question assumptions** — See list above
4. **Ask:** What impact are we creating for the user?
5. **Write tests first** — TDD at all levels
6. **Run quality gates** — All 10 must pass before commit

---

## ⚠️ Common Pitfalls

1. **Accepting content loss** — NEVER acceptable. All metadata via `.meta()`
2. **Silent fallbacks** — NEVER use `z.unknown()` for unsupported types, ALWAYS throw
3. **Using `.safeParse()`** — Use `.parse()` which throws on failure (fail-fast)
4. **Building utilities before tests** — TDD means tests first
5. **Targeting Zod 3** — We only support Zod 4
6. **"Pragmatic" shortcuts** — In this project, pragmatic = highest quality
7. **Testing against stubs/mocks** — Tests must prove real code works
8. **Confusing inputs/outputs** — `arbitrary/` = static inputs, `normalized/` = generated outputs
