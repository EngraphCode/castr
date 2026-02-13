# Session Entry Point: @engraph/castr

**Use this prompt to start a new work session.**

---

## 🎯 What This Library Does

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → Writers → Any Output Format
```

Notes:

- TypeScript + Zod code generation uses **ts-morph** writers (no string templates).
- OpenAPI output is produced as a typed object model (not ts-morph), then serialized.

---

## 🔴 Critical Rules (Non-Negotiable)

1. **Cardinal Rule:** After parsing, input is discarded. Only the IR matters.
2. **NO CONTENT LOSS:** Format can change, content cannot.
3. **Strict + Fail-Fast:** Unsupported/invalid patterns throw immediately with helpful error messages.
4. **Deterministic Output:** Identical input must produce byte-for-byte identical output.
5. **Zod 4 Output Policy:** Writers must emit canonical Zod 4 helpers where representable (`z.email()`, `z.url()`, `z.int()`, `z.iso.*`). Parsers must accept all canonical writer output. Non-canonical Zod 4 input may be accepted only if it maps losslessly; otherwise fail fast with a helpful error.
6. **ts-morph for TS/Zod Code Gen:** No string templates for code generation.
7. **ADR-026 (Scoped — see ADR-026 § "Scope Definition"):** No string/regex heuristics for parsing TypeScript source code. Use ts-morph + semantic APIs (symbol resolution), not node-text matching. Data-string parsing (OpenAPI `$ref`, media types) allowed when centralized, validated, tested, fail-fast.
8. **No Escape Hatches:** No `as`, `any`, `!`, or `eslint-disable` workarounds in product code. Fix architecture or fix the rule.
9. **TDD at ALL Levels:** Write failing tests FIRST.
10. **Quality Gates:** All gates must pass before merge.

---

## 🚀 Next Session: Start Here

### Priority 1: Session 3.3a — ADR-026 Enforcement + Strictness Remediation

> **Plan of record:** [roadmap.md](../plans/roadmap.md) (Session 3.3a)

**ACTIVE PLAN: [3.3a.02 — ESLint Enforcement Redesign](../plans/active/3.3a-02-eslint-enforcement-redesign.md)** — open this file first.

#### Context (what's already done)

3.3a.01 (ADR-026 Scope Definition) is complete. It produced:

- **Strict enforcement principle** in ADR-026 § "Scope Definition" — no grey areas, no "partially enforced" tiers, no excluded modules
- **31 classified violations**: 22 TS-source heuristics (Zod parser), 7 centralization violations (ad-hoc `$ref` parsing), 2 IR text-heuristic violations
- **Responsibility boundaries** on all 15 plans — each states what it owns and what it doesn't

#### What the active plan (3.3a.02) must do

Redesign `lib/eslint.config.ts` to match the strict scope:

1. Remove the schema-processing override that sets `no-restricted-syntax` to `'off'` (line ~249)
2. Ban `getText()` identity, regex, and text comparison in ALL `src/**/*.ts`
3. Ban data-string methods in ALL `src/**/*.ts` EXCEPT `src/shared/ref-resolution.ts` (designated utility)
4. Exempt test files (`**/*.test.ts`, `**/*.spec.ts`, `tests-*/**`)
5. Avoid false positives on discriminated-union checks and type narrowing

**Lint WILL fail after this plan** — that is expected and correct. **Do NOT remediate violations in this plan** — only configure enforcement. The violations are fixed by plans 03 and 04.

#### Quick start

```bash
# Repo root: verify baseline first
pnpm type-check && pnpm test

# ESLint config lives here (no repo-root eslint.config.ts)
sed -n '200,420p' lib/eslint.config.ts | nl -ba | sed -n '1,220p'

# Inventory current violations (rules are currently off, so use rg from repo root)
rg -n "\.getText\(" lib/src/schema-processing/parsers/zod --glob '!**/*.test.*'
rg -n "\.(startsWith|endsWith|includes|split|slice|indexOf|replace|replaceAll|toLowerCase|toUpperCase|trim)\(" \
  lib/src/schema-processing --glob '!**/*.test.*' --glob '!**/*.spec.*' | head -50
```

#### Absolute strictness principles (from `start-right.prompt.md`)

1. **STRICT BY DEFAULT** — never relax constraints to "make things work"
2. **FAIL FAST AND HARD** — no silent fallbacks, no degraded output, no swallowed errors
3. **NO ESCAPE HATCHES** — no `as`, `any`, `!`, or `eslint-disable` in product code
4. **ADR-026** — semantic analysis, not string heuristics. See ADR-026 § "Scope Definition"
5. **CENTRALIZE OR FAIL** — one canonical parser per data format
6. **NO TOLERANCE PATHS** — rules are enforced everywhere or they're not rules

### Priority 2: Session 3.3b — Strict Zod-Layer Round-Trip Validation

> **Plan of record:** [roadmap.md](../plans/roadmap.md) (Session 3.3b)

Queued atomic plans live under:

- `.agent/plans/current/session-3.3b/`

| Task                                  | Status | Detail                                                                            |
| ------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Scenario 3 parser bug                 | 🔴     | Zod parser can't parse `Pet = NewPet.and(...)` — starts from identifier, not `z.` |
| Validation-parity for Zod round-trips | 🔴     | Tests only cover Scenario 1, not Scenarios 2–4                                    |
| Expand Zod fixture coverage           | 🔴     | Only 3 Zod fixtures tested                                                        |

---

## 📊 Quality Gates

**Canonical definition:** [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) (run from repo root).

Notes:

- `pnpm test:transforms` exists and should stay green (it is included by `pnpm test:all` / `pnpm qg` / `pnpm check:ci` / `pnpm check`).
- Use `pnpm check:ci` for a non-mutating verification run. `pnpm check` may write formatting and apply safe lint autofixes.

---

## ⚠️ Pattern to Follow: Extract → Test → Compose

For each complex function:

```ts
// 1) Write failing test FIRST (TDD)
describe('extractFormat', () => {
  it('extracts email format', () => {
    expect(extractFormat(node)).toBe('email');
  });
});

// 2) Extract pure function from original
export function extractFormat(node: Node): string | undefined {
  // ...
}

// 3) Update original to use extracted function
function handleStringFormatOrPattern(node: Node): void {
  const format = extractFormat(node);
  // ...
}
```

---

## 📂 Key Files

| File                                                                                | Purpose                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `lib/src/schema-processing/`                                                        | Schema code (parsers, writers, IR, conversion)            |
| `lib/eslint.config.ts`                                                              | ESLint rules (ADR-026 enforcement lives here)             |
| `docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md` | ADR-026 source of truth                                   |
| `.agent/plans/roadmap.md`                                                           | Single plan truth                                         |
| `.agent/plans/active/`                                                              | Single next atomic plan to execute                        |
| `.agent/plans/current/`                                                             | Queued atomic plans (linear execution steps)              |
| `.agent/plans/current/complete/`                                                    | Completed atomic plans (staged; archive later in batches) |
| `.agent/directives/RULES.md`                                                        | Engineering standards                                     |
| `.agent/directives/testing-strategy.md`                                             | Testing methodology                                       |
| `.agent/directives/DEFINITION_OF_DONE.md`                                           | Quality gate script                                       |

---

## 📚 Essential Reading

| Priority | Document                                                     | Purpose                                 |
| -------- | ------------------------------------------------------------ | --------------------------------------- |
| 1        | [roadmap.md](../plans/roadmap.md)                            | Single plan truth (Sessions 3.3a/3.3b)  |
| 2        | [requirements.md](../directives/requirements.md)             | Strict requirements + decision guidance |
| 3        | [RULES.md](../directives/RULES.md)                           | Engineering standards                   |
| 4        | [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) | Quality gates                           |
| 5        | [testing-strategy.md](../directives/testing-strategy.md)     | TDD approach                            |
