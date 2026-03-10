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
8. **No Escape Hatches:** No non-const type assertions, `any`, `!`, or `eslint-disable` workarounds in product code. Fix architecture or fix the rule. `as const` is governed literal-preservation infrastructure and is allowed. **One additional governed exception:** `Identifier.getText()` — see ADR-026 § "Amendment — Identifier.getText()".
9. **TDD at ALL Levels:** Write failing tests FIRST.
10. **Quality Gates:** All gates must pass before merge.

---

## 🚀 Next Session: Start Here

### Priority 1: Resume Type-Safety Remediation

> **Plan of record:** [roadmap.md](../plans/roadmap.md)

> **Plan execution contract:** Canonical-source and lifecycle rules are permanently documented in [`.agent/plans/active/README.md`](../plans/active/README.md). Follow that document for activation, successor promotion, paused-workstream parking, and archival behavior.

#### Background

The current workstream has already completed the doctrinal and lint-policy repair around the real rule, plus the Characterisation boundary and MCP from-IR remediation clusters:

- `as const` is allowed literal-preservation infrastructure
- non-const type assertions remain banned
- `unknown` is allowed only at external boundaries and must be validated immediately
- type information must remain precise after validation

Current repo truth for this workstream:

- `pnpm type-check` is green
- `pnpm format:check` is green
- `pnpm lint` is green
- `pnpm test` is green
- `pnpm check:ci` is green again
- `49` non-const assertion sites in tests, fixtures, and harness code are temporarily surfaced as warnings while the remediation backlog is being cleared, then the rule should return to `error`
- the Characterisation boundary cluster is complete
- the MCP from-IR test cluster is complete
- the JSON Schema parser directory-complexity blocker is resolved via the `json-schema/normalization/` bounded context
- the post-refactor full-gate repair slice is complete:
  - the normalization helper/refs cycle is gone
  - Knip truth is restored for the ESLint policy surface
  - the default Vitest suite is back under the existing timeout budget
- the next execution slice is the Shared loader and utility cluster

The active parent plan remains:

- [type-safety-remediation.md](../plans/active/type-safety-remediation.md)

The immediate residual execution handoff is:

- [type-safety-remediation-follow-up.md](../plans/active/type-safety-remediation-follow-up.md)

Paused context that still matters, but is not the next atomic slice:

- Paused investigation: [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md)
- Paused companion investigation: [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)

Recently completed adjacent context:

- [recursive-unknown-key-semantics-remediation.md](../plans/current/complete/recursive-unknown-key-semantics-remediation.md)

Recent completed operational context:

- [core-agent-system-and-codex-agent-adapters.md](../plans/current/complete/core-agent-system-and-codex-agent-adapters.md)
- [practice-core-integration-and-practice-restructuring.md](../plans/current/complete/practice-core-integration-and-practice-restructuring.md)

#### What This Session Should Do

1. Read the active primary plan in [type-safety-remediation.md](../plans/active/type-safety-remediation.md)
2. Read the residual execution handoff in [type-safety-remediation-follow-up.md](../plans/active/type-safety-remediation-follow-up.md)
3. Start with the first remaining cluster in the follow-up plan: the Shared loader and utility cluster
4. Use the matching test command or Vitest config for the current cluster instead of relying on guesswork:
   - `pnpm test` or a targeted default `vitest run` invocation for the Shared loader and utility cluster
   - `vitest.characterisation.config.ts` for characterisation clusters
   - `vitest.snapshot.config.ts` for snapshot clusters
   - `vitest.transforms.config.ts` for transforms clusters
5. Re-anchor on [3.3a-07-remove-escape-hatches.md](../plans/current/complete/3.3a-07-remove-escape-hatches.md) only if a change would alter doctrine, lint policy, or the governed allowed-vs-banned matrix
6. Read the paused Zod investigation in [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md) only when type-safety remediation touches that parked workstream
7. Read the paused companion investigation in [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md) only when remediation touches transform-proof runtime or doctor-cost questions
8. Use these durable docs as the architecture source of truth for the active product workstream:
   - `docs/architecture/zod-round-trip-limitations.md`
   - `docs/architecture/recursive-unknown-key-semantics.md`
   - `ADR-031`
   - `ADR-032`
   - `ADR-035`
   - `ADR-038`
9. Keep the current local Practice system in use:
   - `AGENT.md`
   - `practice-index.md`
   - canonical `.agent/commands/`, `.agent/skills/`, and `.agent/rules/`
   - canonical `.agent/sub-agents/`
   - `.codex/config.toml`
   - `.codex/agents/`
10. Invoke the installed reviewers and domain experts through `.agent/rules/invoke-reviewers.md` when changes cross their trigger boundaries
11. Do not resume the paused Zod workstream until the residual lint backlog is cleared or the type-safety plan explicitly yields a successor plan
12. Leave the next session with one obvious primary entrypoint and no stranded context

#### Absolute strictness principles (from `start-right.prompt.md`)

1. **STRICT BY DEFAULT** — never relax constraints to "make things work"
2. **FAIL FAST AND HARD** — no silent fallbacks, no degraded output, no swallowed errors
3. **NO ESCAPE HATCHES** — no non-const type assertions, `any`, `!`, or `eslint-disable` in product code (`as const` is allowed infrastructure; `Identifier.getText()` remains the ADR-026 amendment exception)
4. **ADR-026** — semantic analysis, not string heuristics. See ADR-026 § "Scope Definition"
5. **CENTRALIZE OR FAIL** — one canonical parser per data format
6. **NO TOLERANCE PATHS** — rules are enforced everywhere or they're not rules

---

## 📊 Quality Gates

**Canonical definition:** [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) (run from repo root).

Notes:

- `pnpm test:transforms` exists and should stay green (it is included by `pnpm test:all` / `pnpm qg` / `pnpm check:ci` / `pnpm check`).
- Use `pnpm check:ci` for a non-mutating verification run. `pnpm check` may write formatting and apply safe lint autofixes.
- Current gate truth for this workstream: `pnpm type-check`, `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm check:ci` are green; `pnpm lint` still reports `49` type-assertion warnings while the remediation backlog is being removed.

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
| `.agent/plans/active/`                                                              | Primary active plan plus any explicit parked-in-place exception          |
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
