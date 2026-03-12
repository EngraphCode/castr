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
2. **NO CONTENT LOSS BY DEFAULT:** Format can change, content cannot, unless the caller has explicitly opted into a documented lossy compatibility mode.
3. **Strict + Fail-Fast:** Unsupported/invalid patterns throw immediately with helpful error messages.
4. **Deterministic Output:** Identical input must produce byte-for-byte identical output.
5. **Zod 4 Output Policy:** Writers must emit canonical Zod 4 helpers where representable (`z.email()`, `z.url()`, `z.int()`, `z.iso.*`). Parsers must accept all canonical writer output. Non-canonical Zod 4 input may be accepted only if it maps losslessly; otherwise fail fast with a helpful error.
6. **ts-morph for TS/Zod Code Gen:** No string templates for code generation.
7. **ADR-026 (Scoped — see ADR-026 § "Scope Definition"):** No string/regex heuristics for parsing TypeScript source code. Use ts-morph + semantic APIs (symbol resolution), not node-text matching. Data-string parsing (OpenAPI `$ref`, media types) allowed when centralized, validated, tested, fail-fast.
8. **No Escape Hatches:** No non-const type assertions, `any`, `!`, or `eslint-disable` workarounds in product code. Fix architecture or fix the rule. `as const` is governed literal-preservation infrastructure and is allowed. Validate `unknown` only at genuine external boundaries; after validation, keep types strict and never throw away type information. **One additional governed exception:** `Identifier.getText()` — see ADR-026 § "Amendment — Identifier.getText()".
9. **TDD at ALL Levels:** Write failing tests FIRST.
10. **Quality Gates:** All gates must pass before merge.

---

## 🚀 Next Session: Start Here

### Priority 1: Investigate `int64` / `bigint` Semantics

> **Plan of record:** [roadmap.md](../plans/roadmap.md)

> **Plan execution contract:** Canonical-source and lifecycle rules are permanently documented in [`.agent/plans/active/README.md`](../plans/active/README.md). Follow that document for activation, successor promotion, paused-workstream parking, and archival behavior.

#### Background

The completed type-safety remediation workstream restored the repo's actual type-safety doctrine and finished the residual assertion cleanup:

- `as const` is allowed literal-preservation infrastructure
- non-const type assertions remain banned
- `unknown` is allowed only at incoming external boundaries and must be validated immediately
- after validation, all types remain strict and type information must never be widened away or discarded

Current repo truth for the next workstream:

- `pnpm type-check` is green
- `pnpm format:check` is green
- `pnpm lint` is fully clean
- `pnpm test` is green
- `pnpm check:ci` is green
- warning-producing quality-gate cleanup is complete:
  - `pnpm madge:circular` and `pnpm madge:orphans` are clean of the known external skipped-module warnings
  - `pnpm knip` is clean of the stale `type-fest` configuration hint
  - `pnpm character` is clean of the expected Scalar unreachable-URL stderr noise
  - `pnpm test:transforms` is clean of the custom doctor/scalar diagnostic logging noise
- all quality-gate issues, including warning-producing gate noise, are blocking at all times
- `@typescript-eslint/consistent-type-assertions` is back on `error`
- the Characterisation boundary, MCP from-IR, Shared loader and utility, Snapshot regression, and remaining parser/writer low-count clusters are complete
- the JSON Schema parser directory-complexity blocker is resolved via the `json-schema/normalization/` bounded context
- on 2026-03-12, the strict object semantics enforcement slice completed:
  - non-strict object inputs now reject by default across Zod / OpenAPI / JSON Schema
  - one shared opt-in ingest surface exists for compatibility normalization:
    - `nonStrictObjectPolicy: 'reject' | 'strip'`
  - compatibility normalization is strip-only and deliberately lossy
  - default-path generated object outputs are explicit about strictness where the target can represent it honestly
  - recursive strict Zod parser/writer lockstep is closed around `z.strictObject({...})`
- UUID subtype semantics are now locked by ADR-039 and implemented at the IR/parser/writer boundary
- the next primary slice is now investigation-first:
  - decide the permanent doctrine for OpenAPI / JSON Schema `int64`
  - decide the permanent doctrine for direct `z.bigint()`
  - determine whether portable detours reveal a transport/runtime semantic split that the current model cannot express honestly
  - avoid introducing a user-facing strategy flag unless investigation proves no single canonical policy can satisfy doctrine
- current local evidence for this seam shows:
  - `format: int64` currently maps to `z.int64()` and validates `bigint`
  - direct `z.bigint()` currently parses as `type: integer`, `format: "bigint"`
  - portable detours remain internally consistent but ergonomically awkward at JSON transport boundaries

The active primary plan is:

- [int64-bigint-semantics-investigation.md](../plans/active/int64-bigint-semantics-investigation.md)

Paused supporting context that still matters:

- [recursive-unknown-key-preserving-zod-emission-investigation.md](../plans/current/paused/recursive-unknown-key-preserving-zod-emission-investigation.md)
- [zod-limitations-architecture-investigation.md](../plans/current/paused/zod-limitations-architecture-investigation.md)
- [transform-proof-budgeting-and-runtime-architecture-investigation.md](../plans/current/paused/transform-proof-budgeting-and-runtime-architecture-investigation.md)

Recently completed adjacent context:

- [strict-object-semantics-enforcement.md](../plans/current/complete/strict-object-semantics-enforcement.md)
- [type-safety-remediation.md](../plans/current/complete/type-safety-remediation.md)
- [type-safety-remediation-follow-up.md](../plans/current/complete/type-safety-remediation-follow-up.md)
- [recursive-unknown-key-semantics-remediation.md](../plans/current/complete/recursive-unknown-key-semantics-remediation.md)

Recent completed operational context:

- [core-agent-system-and-codex-agent-adapters.md](../plans/current/complete/core-agent-system-and-codex-agent-adapters.md)
- [practice-core-integration-and-practice-restructuring.md](../plans/current/complete/practice-core-integration-and-practice-restructuring.md)

#### What This Session Should Do

1. Read the active primary plan in [int64-bigint-semantics-investigation.md](../plans/active/int64-bigint-semantics-investigation.md)
2. Re-read the durable architecture sources named by that plan before choosing any implementation path:
   - `docs/architecture/zod-round-trip-limitations.md`
   - `ADR-031`
   - `ADR-032`
   - `ADR-035`
   - `ADR-039`
   - [strict-object-semantics-enforcement.md](../plans/current/complete/strict-object-semantics-enforcement.md) as the immediate predecessor execution record
3. Treat this slice as investigation-first:
   - determine the most honest permanent doctrine before changing parser or writer behaviour
   - do not introduce a user-facing `int64` strategy flag unless the investigation proves a single canonical policy cannot satisfy doctrine
4. Start from the real code seams before changing behaviour:
   - `lib/src/schema-processing/parsers/zod/types/zod-parser.zod4-formats.ts`
   - `lib/src/schema-processing/parsers/zod/types/zod-parser.primitives.ts`
   - `lib/src/schema-processing/writers/zod/generators/primitives.ts`
   - `lib/tests-fixtures/zod-parser/happy-path/primitives.zod4.ts`
   - `lib/tests-fixtures/zod-parser/happy-path/primitives.expected.json`
   - `lib/tests-transforms/__tests__/zod-format-functions.integration.test.ts`
   - Scenario 2 / 4 / 6 transform proofs where numeric fixtures are relevant
5. Treat these architecture decisions as already locked unless new code evidence disproves them:
   - strict object semantics enforcement is complete and is not the thing to reopen here
   - do not weaken numeric semantics merely to make portable detours look more familiar
   - do not add a public strategy flag by default
   - if a transport/runtime split is required, prove that at the architecture level before changing API surface
6. Use this TDD order:
   - add or tighten failing characterization tests for current `int64` / `bigint` parser and writer behaviour
   - add failing transform proofs for the chosen doctrine candidates
   - only implement once one doctrine path clearly satisfies strictness, determinism, and losslessness better than the alternatives
7. Keep the current local Practice system in use:

- `AGENT.md`
- `practice-index.md`
- canonical `.agent/commands/`, `.agent/skills/`, and `.agent/rules/`
- canonical `.agent/sub-agents/`
- `.codex/config.toml`
- `.codex/agents/`

8. Preserve the strict type-safety doctrine while implementing:
   - validate `unknown` only at incoming external boundaries
   - from that point on, keep types strict
   - never discard information and recover meaning later with casts or loose helper types
9. Invoke the installed reviewers and domain experts through `.agent/rules/invoke-reviewers.md` when changes cross their trigger boundaries
10. Leave the next session with one obvious primary entrypoint and no stranded context

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
- Treat any quality-gate issue as blocking, including warning-producing output that indicates stale gate noise.
- Normal reporter and inventory output is still expected; the current warning-producing gates are clean apart from ordinary test reporters and the intentional orphan inventory listing from `pnpm madge:orphans`.
- Current gate truth for this workstream: `pnpm type-check`, `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm check:ci` are green; `pnpm lint` is fully clean again.

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
