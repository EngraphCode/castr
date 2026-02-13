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

1. **Cardinal Rule:** After parsing, input is discarded. Only the Castr Model matters.
2. **NO CONTENT LOSS:** Format can change, content cannot.
3. **Strict-By-Default:** Objects use `.strict()`, unknown types throw.
4. **Zod 4 Only:** `z.email()` not `z.string().email()`.
5. **ts-morph for Code Gen:** No string templates.
6. **No String Manipulation:** All parsing via AST analysis.
7. **Type Discipline:** No `as`, `any`, `!` escape hatches.
8. **TDD at ALL Levels:** Write failing tests FIRST.
9. **Quality Gates:** All must pass before merge.

---

## 📋 Current Focus: Complexity Refactoring

> **Status:** 🔄 In Progress  
> **Plan:** [string-manipulation-remediation.md](../plans/active/string-manipulation-remediation.md)

### What Happened

1. **Directory restructure complete** — Created `src/schema-processing/` with 6 subdirectories
2. **ESLint string rules created** — 23 patterns, currently disabled
3. **Complexity violations reduced** — Down from 51 to 35 remaining
4. **Refactoring in progress** — Zod writer + parser constraints extracted, type-check blocker resolved

### Quick Start Next Session

```bash
cd lib

# 1. Verify current state
pnpm type-check && pnpm test  # Both should pass

# 2. See remaining violations
pnpm lint 2>&1 | grep "error" | head -20

# 3. Continue refactoring (see plan for priority order)
```

---

## 📂 Key Files

| File                                                            | Purpose                                                |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| `lib/src/schema-processing/`                                    | Schema code directory (parsers, writers, ir)           |
| `lib/src/schema-processing/writers/zod/properties.ts`           | Extracted pure functions                               |
| `lib/src/schema-processing/writers/zod/properties.unit.test.ts` | Unit tests for extracted functions                     |
| `.agent/plans/active/string-manipulation-remediation.md`        | **Full plan with priorities**                          |
| `lib/eslint.config.ts`                                          | ESLint config (string rules at line 247, set to 'off') |

---

## 🎯 Next Session Tasks (Priority Order)

### 1. Continue High-Impact Files

Use `pnpm lint` to identify the highest-violation files and apply the
Extract → Test → Compose pattern (see below) to each.

---

## ⚠️ Pattern to Follow: Extract → Test → Compose

For each complex function:

```typescript
// 1. Write failing test FIRST (TDD)
describe('extractFormat', () => {
  it('extracts email format', () => {
    expect(extractFormat(node)).toBe('email');
  });
});

// 2. Extract pure function from original
export function extractFormat(node: Node): string | undefined { ... }

// 3. Update original to use extracted function
function handleStringFormatOrPattern(node: Node): void {
  const format = extractFormat(node);  // ← Uses extracted function
  ...
}
```

---

## 📊 Quality Gate Status

| Gate          | Status | Notes                              |
| ------------- | ------ | ---------------------------------- |
| build         | ✅     |                                    |
| type-check    | ✅     |                                    |
| lint          | ❌     | 35 complexity violations remaining |
| test          | ✅     | 1,010+ tests pass                  |
| test:snapshot | ✅     |                                    |
| character     | ✅     | 152 tests                          |

---

## 📚 Essential Reading

| Priority | Document                                                                                 | Purpose                               |
| -------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| 1        | [string-manipulation-remediation.md](../plans/active/string-manipulation-remediation.md) | Full plan with file list              |
| 2        | [RULES.md](../directives/RULES.md)                                                       | Single responsibility, pure functions |
| 3        | [testing-strategy.md](../directives/testing-strategy.md)                                 | TDD approach                          |

---

## ⚠️ Decisions Made

1. **`schema-processing/` directory created** — Groups all schema code for ESLint scoping
2. **String ESLint rules disabled** — Re-enable after complexity refactoring complete
3. **Legacy complexity exceptions removed** — Down from 51 to 35 violations
4. **TDD approach for extraction** — Write tests before extracting functions
5. **Directive files moved** — All foundation docs now live in `.agent/directives/`
