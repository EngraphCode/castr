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

### Priority 1: Phase 4 — JSON Schema + Post-3.3 Parity

> **Plan of record:** [roadmap.md](../plans/roadmap.md) (Phase 4)

**ACTIVE PHASE: [Phase 4 — JSON Schema + Parity Track](../plans/active/phase-4-json-schema-and-parity.md)** — open this file first.

> **Plan execution contract:** Canonical-source and lifecycle rules are permanently documented in [`.agent/plans/active/README.md`](../plans/active/README.md). Follow that document for activation, successor promotion, and archival behavior.

#### Current Progress

- ✅ **Component 1: Shared JSON Schema field logic** — Extracted into `writers/shared/` (json-schema-object.ts, json-schema-fields.ts, json-schema-2020-12-fields.ts). OpenAPI writer refactored to compose these. All 422 tests pass, byte-for-byte identical output confirmed.
- ✅ **Component 2: JSON Schema Writer** — Pure JSON Schema 2020-12 writer in `writers/json-schema/`. Three public functions: `writeJsonSchema()`, `writeJsonSchemaDocument()`, `writeJsonSchemaBundle()`. 48 new tests, all quality gates GREEN. Composes `writeAllJsonSchemaFields()` from shared module — does NOT emit OAS-only fields (xml, externalDocs, discriminator).
- 🔲 **Component 3: JSON Schema Parser** — Next up. See detailed requirements in the active plan.
- 🔲 **Component 4: Multi-Cast Parity Rig** — E2E multi-casting validation.

#### What Component 3 Requires

The JSON Schema Parser converts JSON Schema input (Draft 07 + 2020-12) into the canonical `CastrSchema` IR.

**Draft 07 → 2020-12 normalizations:**

- `definitions` → local references / `$defs`
- `dependencies` → `dependentRequired` / `dependentSchemas`
- Tuple `items` array → `prefixItems`
- Boolean `exclusiveMinimum`/`exclusiveMaximum` → numeric values

**Architecture:**

- Parser lives in `lib/src/schema-processing/parsers/json-schema/`
- Follow patterns established by `parsers/openapi/` and `parsers/zod/`
- ADR-036: max 8 source files per directory
- Pure functions, no I/O, TDD first

**For the next session, you MUST:**

1. Start by reviewing the active plan `phase-4-json-schema-and-parity.md` and the acceptance criteria `json-schema-and-parity-acceptance-criteria.md`.
2. Plan and begin Component 3 (JSON Schema Parser) using TDD.

#### Context

Session 3.3 (Strict Zod-Layer Transform Validation) and ADR-026 strictness remediation have been successfully completed and archived. The core pipeline (OpenAPI ↔ IR ↔ Zod) is locked, deterministic, and proven lossless by the Parity Matrix tests and Directory Complexity boundaries (ADR-035, ADR-036, ADR-037).

All atomic plans for 3.3a and 3.3b are stored in `.agent/plans/current/complete/`.

Phase 4 introduced the shared JSON Schema field writers (Component 1) and the JSON Schema Writer (Component 2), establishing the output side. Component 3 completes the input side, enabling full JSON Schema ↔ IR ↔ any-format transform validation.

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
| `lib/src/schema-processing/parsers/`                                                | OpenAPI and Zod parsers (JSON Schema parser will go here)                |
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
