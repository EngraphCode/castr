# Plan: Zod 2020-12 Keyword Semantics (execute ADR-047)

**Status:** Backlog (remediation) · **Findings:** C6, H7 · **Risk:** Medium
**References:** **ADR-047** (the governing decision); report `02-findings-critical.md` (C6); `principles.md` § Input-Output Pair Compatibility Model; `writers/zod/refinements/{object,array}.ts`, `writers/zod/fail-fast.unit.test.ts`

---

## User impact

The Zod writer currently emits **incorrect runtime validators** for several JSON Schema 2020-12 keywords: `if/then/else`
and `dependentSchemas` validate nothing (`return true`); `contains`/`patternProperties`/`unevaluated*` use
`typeof x === '<jsonSchemaType>'` and **reject valid data**. Generated schemas are silently wrong — the opposite of the
runtime safety the tool sells.

## Decision being executed

ADR-047: **semantic-or-fail-fast, never a no-op.** Per keyword, emit a `.refine()` that correctly preserves the
constraint (proven by executing the validator) **or** fail-fast with an actionable error. No `return true`; no `typeof`
against JSON-Schema type names.

## Scope

In scope — the per-keyword disposition in ADR-047:

- keep `dependentRequired` (already correct); add a behavioural proof
- fix or fail-fast: `dependentSchemas`, `if/then/else`, `contains`, `patternProperties`, `propertyNames`,
  `unevaluatedProperties`, `unevaluatedItems`
- correct emission requires **sub-schema recursion** (`<subSchema>.safeParse(x).success`) with correct type checks
  (`integer→Number.isInteger`, `array→Array.isArray`, `null→===null`)
- replace the `toContain('.refine(')` assertions with executed-validator assertions
- sort refinement-emission keys (**M7**) to match the TypeScript writer

Out of scope: a governed opt-in lossy mode (may follow later per ADR-047); array-`items` writer edge case (L16).

## Success criteria

- For each supported keyword: a test builds **and executes** the generated Zod and asserts conforming input passes and
  violating input fails. Keywords not yet expressible correctly **fail fast** (proven by a throw test), not silently.
- No `.refine(... return true ...)` and no `typeof x === '<jsonSchemaType>'` remain in `writers/zod/`.
- Refinement emission order is sorted (M7).
- `roadmap.md:147` "semantic" wording, the three sub-plans, and `docs/architecture/zod-round-trip-limitations.md`
  reconciled to the actual per-keyword truth (ADR-047 Consequences).
- ~~`pnpm qg` green.~~ **(Superseded 2026-07-17: use `pnpm check` locally / `pnpm check:ci` non-mutating — never `pnpm qg` directly — per the [parallel execution program](../remediation/00-parallel-execution-program.md) execution rules.)**

## TDD order

1. Add executed-validator tests for each keyword (most go red immediately). 2. Implement correct recursion or fail-fast
   per ADR-047. 3. Delete the substring tests. 4. Reconcile the stale docs. 5. Gate green.
