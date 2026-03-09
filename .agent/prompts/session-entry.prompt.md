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
- JSON Schema output is produced as plain JSON Schema 2020-12 objects.

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

### Priority 1: Decide Next Focus Area

> **Plan of record:** [roadmap.md](../plans/roadmap.md)

> **Plan execution contract:** Canonical-source and lifecycle rules are permanently documented in [`.agent/plans/active/README.md`](../plans/active/README.md). Follow that document for activation, successor promotion, and archival behavior.

#### Background

Recent Zod round-trip behavior and trade-offs have been promoted into permanent documentation:

- [docs/architecture/zod-round-trip-limitations.md](../../docs/architecture/zod-round-trip-limitations.md)
- [ADR-031: Zod 4 Output Strategy](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [ADR-032: Zod 4 Input Strategy](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md)
- [ADR-035: Transform Validation Parity & Scenario Matrix](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)

Use plans only for the next atomic slice of work. Do not treat active or archived plans as the durable source of truth for Zod round-trip architecture or limitations.

The primary active atomic plan is:

- [zod-limitations-architecture-investigation.md](../plans/active/zod-limitations-architecture-investigation.md)

There is also a companion active investigation plan:

- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/active/transform-proof-budgeting-and-runtime-architecture-investigation.md)

These plans are intentionally **investigation-first**. The Zod limitations plan is the primary semantic workstream. The transform-proof / runtime plan should be consulted whenever limitation investigation touches doctor behavior, transform-suite runtime, proof budgeting, or possible non-test performance architecture debt.

The strategic goal for this investigation is **zero legitimate data structures that Castr cannot handle**. If the next session discovers additional legitimate gaps, it should explicitly decide whether to include them in the current workstream or record them durably for the next session.

#### What This Session Should Do

1. Read the permanent Zod round-trip reference in [docs/architecture/zod-round-trip-limitations.md](../../docs/architecture/zod-round-trip-limitations.md)
2. Read the primary active investigation plan in [zod-limitations-architecture-investigation.md](../plans/active/zod-limitations-architecture-investigation.md)
3. Read the companion investigation plan in [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/active/transform-proof-budgeting-and-runtime-architecture-investigation.md)
4. Read [ADR-031](../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md), [ADR-032](../../docs/architectural_decision_records/ADR-032-zod-input-strategy.md), and [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md) before changing Zod parser/writer behavior
5. Investigate the remaining limitations one by one and identify whether each is fundamentally a standards gap, IR gap, canonicalization choice, parser/writer issue, or upstream-runtime issue
6. If you discover additional legitimate unhandled structures, classify and triage them explicitly instead of leaving them as incidental findings
7. If runtime cost, doctor behavior, or transform-proof scheduling becomes part of the diagnosis, switch to the companion investigation plan rather than treating that as an incidental side note
8. Do not start implementation until the architecture investigation produces a clear recommendation or follow-on remediation plan

#### Absolute strictness principles (from `start-right.prompt.md`)

1. **STRICT BY DEFAULT** — never relax constraints to "make things work"
2. **FAIL FAST AND HARD** — no silent fallbacks, no degraded output, no swallowed errors
3. **NO ESCAPE HATCHES** — no `as`, `any`, `!`, or `eslint-disable` in product code (one governed exception: `Identifier.getText()` per ADR-026 amendment)
4. **ADR-026** — semantic analysis, not string heuristics. See ADR-026 § "Scope Definition"
5. **CENTRALIZE OR FAIL** — one canonical parser per data format
6. **NO TOLERANCE PATHS** — rules are enforced everywhere or they're not rules

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

| File                                                                                | Purpose                                                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `lib/src/schema-processing/`                                                        | Schema code (parsers, writers, IR, conversion)                           |
| `lib/src/schema-processing/writers/shared/`                                         | Shared JSON Schema field writers (used by OpenAPI + JSON Schema writers) |
| `lib/src/schema-processing/writers/json-schema/`                                    | JSON Schema 2020-12 writer (Component 2)                                 |
| `lib/src/schema-processing/parsers/json-schema/`                                    | JSON Schema parser: Draft 07 / 2020-12 → IR (Component 3)                |
| `lib/src/schema-processing/parsers/`                                                | OpenAPI, Zod, and JSON Schema parsers                                    |
| `lib/src/rendering/`                                                                | Zod code generation (writer) — **focus area for current defects**        |
| `lib/eslint.config.ts`                                                              | ESLint rules (ADR-026 enforcement lives here)                            |
| `docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md` | ADR-026 source of truth                                                  |
| `.agent/plans/roadmap.md`                                                           | Single plan truth                                                        |
| `.agent/plans/active/`                                                              | Single next atomic plan to execute                                       |
| `.agent/plans/current/complete/`                                                    | Completed atomic plans (staged; archive later in batches)                |
| `.agent/directives/RULES.md`                                                        | Engineering standards                                                    |
| `.agent/directives/testing-strategy.md`                                             | Testing methodology                                                      |
| `.agent/directives/DEFINITION_OF_DONE.md`                                           | Quality gate script                                                      |

---

## 📚 Essential Reading

| Priority | Document                                                     | Purpose                                 |
| -------- | ------------------------------------------------------------ | --------------------------------------- |
| 1        | [roadmap.md](../plans/roadmap.md)                            | Single plan truth                       |
| 2        | [requirements.md](../directives/requirements.md)             | Strict requirements + decision guidance |
| 3        | [RULES.md](../directives/RULES.md)                           | Engineering standards                   |
| 4        | [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) | Quality gates                           |
| 5        | [testing-strategy.md](../directives/testing-strategy.md)     | TDD approach                            |
