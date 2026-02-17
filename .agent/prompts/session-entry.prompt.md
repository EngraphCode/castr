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
8. **No Escape Hatches:** No `as`, `any`, `!`, or `eslint-disable` workarounds in product code. Fix architecture or fix the rule. **One governed exception:** `Identifier.getText()` — see ADR-026 § "Amendment — Identifier.getText()".
9. **TDD at ALL Levels:** Write failing tests FIRST.
10. **Quality Gates:** All gates must pass before merge.

---

## 🚀 Next Session: Start Here

### Priority 1: Session 3.3a — ADR-026 Enforcement + Strictness Remediation

> **Plan of record:** [roadmap.md](../plans/roadmap.md) (Session 3.3a)

**ACTIVE PLAN: [3.3a.08 — Prove Determinism](../plans/active/3.3a-08-prove-determinism.md)** — open this file first.

#### Plan lifecycle

There is always exactly one active plan in `.agent/plans/active/` (plus a README). When a plan is complete:

1. Move the finished plan to `.agent/plans/current/complete/`.
2. Copy the next queued plan (from `.agent/plans/current/session-3.3a/`) into `.agent/plans/active/`.
3. Update the status in [roadmap.md](../plans/roadmap.md) execution table.
4. Update this file's "ACTIVE PLAN" link and context to point at the new plan.

The plan's **Successor** field tells you which plan comes next.

#### Context (what's already done)

- **3.3a.01** (ADR-026 Scope Definition) ✅ — strict enforcement principle, 31 classified violations, responsibility boundaries
- **3.3a.02** (ESLint Enforcement Redesign) ✅ — 21 `no-restricted-syntax` selectors + custom `castr/no-magic-string-comparison` rule active
- **3.3a.03 Phases 1 & 1b** ✅ — Symbol resolution for `z` identity. `ZodImportResolver` class, `zod-constants.ts`, `zod-decl-builder.ts`. Source-file object identity. Resolver threaded through 15+ files. **8 violations resolved.**
- **3.3a.03 Phase 2** ✅ — Eliminated getText() → re-parse anti-pattern. Direct node passing in `parseSchemaDeclarations`. Deleted `parseZodExpression`. **8.2× speedup** (2719ms → 330ms). Fixed `test:transforms` constraints timeout (root cause was 35× `createZodProject` calls). **1 violation resolved.**
- **3.3a.03 Phase 3** ✅ — Replaced all `stripQuotes(getText())` with `extractStringValue()`, `getLiteralValue()`, `getName()`. Extracted `extractParamEntry`/`extractResponseEntry` helpers. **6 violations resolved.**
- **3.3a.03 Phase 4** ✅ — Added `schema-name-registry.ts` and `schema-name-registry.unit.test.ts`. `extractSchemaName` now delegates to registry; endpoint builder uses `deriveComponentName`.
- **3.3a.03 Phase 5** ✅ — Replaced IR text heuristics with structural/centralized approach: `normalizeSchemaNameForDependency` now uses `$ref` shape; added `template-context.status-codes.ts`; `from-ir.ts` now uses `isSuccessStatusCode` + typed constants.
- **3.3a.03 Phase 6** ✅ — Cleanup. Removed dead `stripQuotes` functions, `parseZodExpression`, stale imports.
- **3.3a.03 Step 4 follow-up** ✅ — Removed `includes('.optional()')` heuristic in endpoint builder; requiredness now uses parsed schema metadata.
- **ADR-026 Amendment** (2026-02-16) — § "Amendment — Identifier.getText()": ts-morph `Identifier` has no `getName()`. `getText()` is the only API. Allowed after `Node.isIdentifier()` narrowing, against typed constants.
- **Audit follow-ups A1-A4** ✅ — all resolved in Plan 03.
- **3.3a.04** ✅ Complete (2026-02-16) — repo-wide ADR-026 remediation finished. Lint debt reduced from **272 → 0** with `pnpm lint`, `pnpm type-check`, and `pnpm test` all green.
- **3.3a.05** ✅ Complete (2026-02-17) — removed permissive fallback outputs, centralized strict OpenAPI component-ref resolution in `builder.component-ref-resolution.ts`, and added strict fail-fast tests for JSON Schema conversion, MCP inline refs, and OpenAPI ref builders. Package checks run: `pnpm type-check`, `pnpm lint`, `pnpm test` (all green in `lib`).
- **3.3a.06** ✅ Complete (2026-02-17) — removed swallowed-error paths and replaced silent skips/catches with strict fail-fast errors carrying source context.
- **3.3a.07** ✅ Complete (2026-02-17) — removed non-governed check-disabling directives and eliminated remaining escape-hatch usage in scope while keeping quality gates green.

#### Plan restructuring (2026-02-17)

- **Plan 03** scoped to **Zod parser only** (~20 violations, Phases 1-6). **20/20 complete.**
- **Plan 04** — Repo-Wide ADR-026 Remediation — **complete** and moved to `.agent/plans/current/complete/`.
- **Plan 05** — Remove Permissive Fallback Outputs — **complete** and moved to `.agent/plans/current/complete/`.
- **Plan 06** — Remove Swallowed Errors — **complete** and moved to `.agent/plans/current/complete/`.
- **Plan 07** — Remove Escape Hatches — **complete** and moved to `.agent/plans/current/complete/`.
- **Plan 08** — Prove Determinism — now active.

#### What the active plan (3.3a.08) must do next

Execute these immediate priorities in order:

1. Inventory output-affecting iteration/ordering in product code (`Object.keys/values/entries`, `Map` iteration, and any insertion-order-dependent traversal).
2. Make ordering explicit and stable in output-critical code paths (sorted keys, deterministic component ordering, stable traversal).
3. Add tests that generate outputs twice and assert byte-identical artifacts.
4. Prove determinism for representative fixtures used in round-trip pathways.
5. Keep strict fail-fast and no-escape-hatch policies fully enforced while hardening determinism.

#### Quick start

```bash
# Repo root: verify baseline first
pnpm lint && pnpm type-check && pnpm test

# Open active plan
sed -n '1,260p' .agent/plans/active/3.3a-08-prove-determinism.md

# Immediate priority targets
rg -n "Object\\.(keys|values|entries)|new Map\\(|for \\(const .* of .*\\)" lib/src
rg -n "sort\\(|localeCompare\\(" lib/src
pnpm test
```

#### Absolute strictness principles (from `start-right.prompt.md`)

1. **STRICT BY DEFAULT** — never relax constraints to "make things work"
2. **FAIL FAST AND HARD** — no silent fallbacks, no degraded output, no swallowed errors
3. **NO ESCAPE HATCHES** — no `as`, `any`, `!`, or `eslint-disable` in product code (one governed exception: `Identifier.getText()` per ADR-026 amendment)
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
