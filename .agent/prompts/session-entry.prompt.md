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

### Priority 1: Resume The Zod Round-Trip Limitations Workstream

> **Plan of record:** [roadmap.md](../plans/roadmap.md)

> **Plan execution contract:** Canonical-source and lifecycle rules are permanently documented in [`.agent/plans/active/README.md`](../plans/active/README.md). Follow that document for activation, successor promotion, paused-workstream parking, and archival behavior.

#### Background

The practice integration slice completed on 2026-03-09. Castr now has the local-practice spine, canonical-first command/skill/rule model, thin platform wrappers, and future Gemini / Antigravity planning installed.

With that restructuring complete, the operational entrypoint returns to the product architecture workstream.

The primary active atomic plan is:

- [zod-limitations-architecture-investigation.md](../plans/active/zod-limitations-architecture-investigation.md)

The active companion investigation is:

- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/active/transform-proof-budgeting-and-runtime-architecture-investigation.md)

The queued active remediation already established in this workstream is:

- [recursive-unknown-key-semantics-remediation.md](../plans/active/recursive-unknown-key-semantics-remediation.md)

The completed practice integration slice remains relevant as recent operational context:

- [practice-core-integration-and-practice-restructuring.md](../plans/current/complete/practice-core-integration-and-practice-restructuring.md)

#### What This Session Should Do

1. Read the active primary plan in [zod-limitations-architecture-investigation.md](../plans/active/zod-limitations-architecture-investigation.md)
2. Read the companion investigation in [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/active/transform-proof-budgeting-and-runtime-architecture-investigation.md) whenever limitation analysis touches proof runtime, scheduling, or doctor behavior
3. Treat [recursive-unknown-key-semantics-remediation.md](../plans/active/recursive-unknown-key-semantics-remediation.md) as queued active execution context rather than speculative future work
4. Use these durable docs as the architecture source of truth:
   - `docs/architecture/zod-round-trip-limitations.md`
   - `docs/architecture/recursive-unknown-key-semantics.md`
   - `ADR-031`
   - `ADR-032`
   - `ADR-035`
   - `ADR-038`
5. Keep the current local-practice system in use:
   - `AGENT.md`
   - `practice-index.md`
   - canonical `.agent/commands/`, `.agent/skills/`, and `.agent/rules/`
6. Do not move known Zod remediation out to `future/` while the active limitation set is still being mapped and ordered
7. Promote durable investigation outcomes into ADRs or architecture docs before ending the session
8. Leave the next session with one obvious primary entrypoint and no stranded context

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
| `.agent/plans/current/paused/`                                                      | Incomplete but non-primary workstreams that are expected to resume       |
| `.agent/plans/current/complete/`                                                    | Completed atomic plans (staged; archive later in batches)                |
| `.agent/directives/principles.md`                                                   | Engineering standards                                                    |
| `.agent/directives/testing-strategy.md`                                             | Testing methodology                                                      |
| `.agent/directives/DEFINITION_OF_DONE.md`                                           | Quality gate script                                                      |

---

## 📚 Essential Reading

| Priority | Document                                                     | Purpose                                 |
| -------- | ------------------------------------------------------------ | --------------------------------------- |
| 1        | [roadmap.md](../plans/roadmap.md)                            | Single plan truth                       |
| 2        | [requirements.md](../directives/requirements.md)             | Strict requirements + decision guidance |
| 3        | [principles.md](../directives/principles.md)                 | Engineering standards                   |
| 4        | [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) | Quality gates                           |
| 5        | [testing-strategy.md](../directives/testing-strategy.md)     | TDD approach                            |
