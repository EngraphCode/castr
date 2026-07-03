# ADR-047: Zod Emission Strategy for JSON Schema 2020-12 Applicator Keywords

**Date:** 2026-06-04
**Status:** Proposed (draft — retro-documents an undocumented prior reversal and mandates the compliant resolution)
**Related:** [ADR-031](./ADR-031-zod-output-strategy.md), [ADR-035](./ADR-035-transform-validation-parity.md), [ADR-026](./ADR-026-no-string-manipulation-for-parsing.md); plans `if-then-else-conditional-applicators.md`, `pattern-properties-and-property-names.md`, `prefixitems-tuple-and-contains.md`; `roadmap.md` ("Schema Completeness Arc Phase 1"); `principles.md` § Input-Output Pair Compatibility Model; review findings C6 / H7 (`.agent/report/initial-review/`)

---

## Context

The Zod writer must handle JSON Schema 2020-12 applicator keywords that have **no native Zod 4 equivalent**:
`if`/`then`/`else`, `dependentSchemas`, `dependentRequired`, `patternProperties`, `propertyNames`, `contains`,
`unevaluatedProperties`, `unevaluatedItems`.

Three **completed** plans established the original decision: the Zod (and TypeScript) writers **fail fast** on these
keywords, and a `.refine()` approximation was explicitly deferred:

- `pattern-properties-and-property-names.md` (Complete): format-tensions table records `→ Zod = ❌ fail-fast`, and
  states ".refine() approximations … would be a governed, **opt-in lossy mode — not a default behaviour**."
- `prefixitems-tuple-and-contains.md` (Complete): "Zod writer: **fail-fast** (no Zod equivalent for array-contains
  validation)"; ".refine() approximation … **future opt-in lossy mode**" (out of scope).
- `if-then-else-conditional-applicators.md` (Complete): "**Fail-fast in Zod writer (no Zod equivalent)**"; any Zod
  conditional emission out of scope.

Subsequently, **"Schema Completeness Arc Phase 1"** (recorded in `roadmap.md:147`, ~30 March 2026) **reversed** this:
"All 9 Zod fail-fast guards that were implementation gaps **upgraded to semantic `.refine()` runtime validation
closures**" (new `writers/zod/refinements/{object,array}.ts`). This reversal:

1. was **never elevated to an ADR** (ADR-031, the Zod-output-strategy ADR, is silent on it);
2. **contradicts** the three completed sub-plans above (which were never updated and still say fail-fast); and
3. made `.refine()` the **default** path — the very thing those plans said it must **not** be.

A first-hand review (executing the built `dist`, June 2026) found the resulting closures are **not semantic** — they
neither preserve the constraint nor fail fast (finding C6):

- `dependentSchemas` and `if`/`then`/`else` emit `.refine(… return true …)` — **unconditional no-ops** (validate nothing).
- `contains`, `patternProperties`, `unevaluatedProperties`, `unevaluatedItems` emit
  `typeof x === '<jsonSchemaType>'` checks; the JSON-Schema type names `integer`/`array`/`null` and the `'unknown'`
  default are values `typeof` **never returns**, so the generated validators **reject all conforming data** (or drop all
  nested constraints).
- The only behavioural proof is a test asserting `expect(output).toContain('.refine(')` (finding H7) — it proves text,
  not behaviour, so the broken validators pass the gate.
- `dependentRequired` is the **one** exception: it is correctly implemented (`[...].every(k => k in obj)`).

This violates `principles.md` § Input-Output Pair Compatibility Model, which permits exactly two outcomes for an
output pair — **faithful semantic preservation, or fail-fast with a helpful error — never a permissive no-op**.

## Decision

For every JSON Schema 2020-12 applicator keyword the Zod target must satisfy this rule:

> **Semantic-or-fail-fast, never a no-op.** The Zod writer MUST emit a `.refine()` (or other construct) that
> **correctly preserves the keyword's constraint semantics**, _proven by executing the generated validator against both
> conforming and violating inputs_; **or** it MUST fail fast with an actionable error naming the keyword. A `.refine()`
> whose body is `return true`, or that reduces a sub-schema to a `typeof` test against a JSON-Schema type name, is
> **forbidden** — it is the permissive fallback the doctrine bans.

Concretely:

1. **Correct semantic emission requires sub-schema recursion.** Where Zod _can_ express the constraint, the closure must
   validate the relevant value(s) against the **full** sub-schema — emit the sub-schema through the Zod writer and use
   `<subSchema>.safeParse(x).success`, mapping JSON-Schema types to correct runtime checks
   (`integer → Number.isInteger`, `array → Array.isArray`, `null → === null`, `object → non-null non-array`). A bare
   `typeof` shortcut is not acceptable.
2. **Fail-fast where Zod genuinely cannot express it** (e.g. full `if`/`then`/`else` conditional application if a correct
   closure cannot be generated), with a "Genuinely impossible / not expressible" message — not "not yet implemented".
3. **Default vs opt-in.** Correct semantic `.refine()` is acceptable as the **default** only once proven correct. Until
   a keyword's closure is proven correct, the default path MUST fail-fast; any partial/approximate `.refine()` may exist
   only behind a **governed, documented opt-in** flag (honouring the original sub-plan guidance).
4. **Behavioural proof is mandatory.** Each supported keyword must have a test that builds and **executes** the generated
   Zod and asserts conforming input is accepted and violating input is rejected. `toContain('.refine(')` assertions are
   removed.

### Current per-keyword disposition (the corrected truth)

| Keyword                                      | Current code                            | Required action                                                                            |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `dependentRequired`                          | ✅ correct (`every k in obj`)           | keep; add behavioural proof                                                                |
| `dependentSchemas`                           | ❌ `return true` no-op                  | implement real validation, or fail-fast                                                    |
| `if`/`then`/`else`                           | ❌ no-op / dropped                      | implement real conditional validation, or fail-fast (matches sub-plan + roadmap Phase 1.5) |
| `contains`                                   | ❌ `typeof === 'integer'` (rejects all) | recurse sub-schema via `safeParse`, or fail-fast                                           |
| `patternProperties`                          | ❌ `typeof` only / `'unknown'`          | recurse sub-schema via `safeParse`, or fail-fast                                           |
| `propertyNames`                              | ⚠️ partial (`typeof k`/constraints)     | validate names against the full sub-schema, or fail-fast                                   |
| `unevaluatedProperties` / `unevaluatedItems` | ❌ `typeof` only                        | recurse, or fail-fast                                                                      |

## Consequences

### Positive

- Restores the doctrine's hard guarantee (semantic-or-fail-fast) for the Zod pair.
- Behavioural proofs make the guarantee enforceable, closing the H7 proof gap for this surface.

### Negative / cost

- Correct sub-schema recursion in generated closures is non-trivial; some keywords may legitimately resolve to fail-fast.
- Requires correcting stale records (below) and likely failing-then-fixing the affected tests.

### Required documentation corrections (stale claims this ADR supersedes)

- `roadmap.md:147` — the "semantic `.refine()` runtime validation closures" wording overstates reality; correct it to
  reflect the per-keyword disposition above.
- The three sub-plans (`if-then-else…`, `pattern-properties…`, `prefixitems-tuple-and-contains…`) — their fail-fast
  headers are stale for keywords moved to `.refine()`; reconcile their status to this ADR.
- `docs/architecture/zod-round-trip-limitations.md` — currently does **not** disclose the no-op/incorrect refinements;
  until they are fixed, it must list them as known defects (not silent).
- `writers/zod/fail-fast.unit.test.ts` — replace `toContain('.refine(')` assertions with executed-validator assertions.

## Alternatives considered

1. **Revert wholesale to fail-fast** (matches the three sub-plans and the strictest reading of the doctrine). Simplest
   and immediately honest, but forgoes constraints Zod _can_ express (e.g. `dependentRequired`, which already works).
2. **Keep `.refine()` but as a governed, non-default opt-in** (what `pattern-properties…` proposed). Honest, but leaves
   the default path fail-fast — acceptable as an interim, and the rule above permits it per-keyword until proven.
3. **Bless the current default `.refine()` as-is.** Rejected — the closures are no-ops/incorrect and violate the
   doctrine; this is the status quo this ADR exists to end.

**Chosen:** the rule above (semantic-or-fail-fast, proven), which subsumes (1) and (2) per keyword and forbids (3).

## References

- `principles.md` § Input-Output Pair Compatibility Model ("supported = semantic preservation"; fail-fast only for
  genuine impossibility; permissive fallback forbidden)
- ADR-035 (transform-validation parity — "parity green while silently stripping a constraint" is forbidden)
- ADR-031 (Zod output strategy — silent on these keywords; this ADR fills that gap)
- Review findings C6, H7, and `07-test-quality-and-proof-gaps.md` in `.agent/report/initial-review/`
