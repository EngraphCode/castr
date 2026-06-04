# Executive Summary

**Date:** 2026-06-04 · **Repo:** @engraph/castr · **Commit:** `main` @ `393e476`

## The one-paragraph verdict

castr is a genuinely disciplined codebase: all 14 quality gates pass green (verified by running them), the type-system
discipline is real (no `as`/`any`/`!` in product code; strict structural limits enforced), the OpenAPI writer is
carefully deterministic, and the int64/bigint fail-fast is correctly implemented. **But its three hardest self-imposed
promises — _lossless_, _fail-fast_, and _"code, proofs and docs agree"_ — are broken in specific, reproducible places,
and the published package's types and Zod sub-path are broken outright.** None of this is caught by the gates, because
the defects sit precisely where the tests are shallow.

## The single root cause

Almost every finding traces to one pattern, which the repo's own `testing-strategy.md` explicitly forbids as
**"partial proof posture"**:

> Tests prove the _boundary_, not the _behaviour_. Parsers assert "the IR field is populated" (never executing the
> result). Writers assert `expect(output).toContain('.refine(')` (never running the generated validator). Round-trip
> tests cover only non-empty fixtures. And **no gate checks the published package at all** (no export-resolution / types
> check). So a green suite coexists with silent data loss, no-op validators, and a package that ships without types.

Fix the proofs and most of these bugs turn red on their own. That is the highest-leverage intervention (see `09`).

## Top findings (all reproduced by executing the shipped code)

| ID     | Finding                                                                                                                                                                                                                                      | Impact                                                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** | The build emits **zero `.d.ts`** (`noEmit:true` inherited from the root tsconfig neutralises `tsc --emitDeclarationOnly`); all three `package.json` `types` targets and the `./parsers/zod` runtime target point at files that do not exist. | A published install has **no types** and the README's `@engraph/castr/parsers/zod` import **fails to resolve**. Directly contradicts "Developer Experience is Priority #1". |
| **C2** | Operation security `{A, B}` ("A **AND** B") round-trips through IR → OpenAPI as `[{A},{B}]` ("A **OR** B").                                                                                                                                  | **Security weakening** in generated specs/metadata. Correctness + losslessness. Zero tests.                                                                                 |
| **C3** | A valid component named `Basic.Thing` is emitted under the key `Basic_Thing` while `$ref`s to it stay `#/…/Basic.Thing`.                                                                                                                     | Output OpenAPI has **dangling, unresolvable references**; original name unrecoverable. Losslessness.                                                                        |
| **C4** | `buildIR({type:'object',properties:{}})` → `serializeIR` → `deserializeIR` **throws** `"Invalid CastrDocument structure"`. Root cause: `isRecord({}) === false`.                                                                             | The public persistence/round-trip surface loses a valid, common shape. Losslessness.                                                                                        |
| **C5** | The Zod source parser **silently drops content** with `errors:[]`: union/tuple members, `z.nativeEnum` values, `.refine()` predicates, object-level `.refine()`/`.readonly()`.                                                               | Generated schemas accept inputs the source rejected. Losslessness + fail-fast.                                                                                              |
| **C6** | The Zod writer emits **broken or no-op runtime validators**: `dependentSchemas` and `if/then/else` enforce nothing; `contains`/`patternProperties` use `typeof x === 'integer'`/`'unknown'` (never true) and reject valid data.              | Generated validators are silently wrong — the opposite of the safety the tool sells.                                                                                        |

High/medium findings include Draft-07 normalisation not recursing into `if/then/else`/`patternProperties` (semantic
corruption), the OpenAPI writer dropping `contentEncoding` and boolean `exclusiveMinimum`, wildcard `4XX`/`5XX` status
codes mangled by `parseInt`, a cluster of documented-but-never-consumed options (e.g. `defaultStatusBehavior`), and the
ADR-026 "no string manipulation" ban being trivially evaded via lodash function-call form in 20 files. Full catalogue in
`02`–`05`.

## What the discovery sweep got wrong (trust calibration)

The 14-agent sweep produced 86 raw candidates. Verification **rejected or downgraded ~9** — e.g. `z.unknown()` in the
composition writer is _correct_ (empty `allOf` = accept-anything), `ajv-draft-04` is _not_ a dead dependency (it is used
in a spec-compliance test), and the `additionalProperties: true → false` writer narrowing is _latent_ (the parser
fail-fasts on that input, so it cannot be reached today). These are documented in `08` so the report's own claims can be
trusted.

## Where castr is genuinely strong (not everything is a finding)

- All 14 gates green; 246 test files pass. Type discipline (no escape hatches in product code) is real and lint-enforced.
- The OpenAPI writer is IR-only (no reach-back into the source document) and rigorously sorted for determinism.
- int64/bigint → JSON Schema fail-fast is correct and well-implemented.
- `dependentRequired` (unlike `dependentSchemas`) is correctly generated; the TypeScript writer sorts dependent keywords.
- The TypeScript fail-fast guards (`patternProperties`/`propertyNames`/`if`-`then`-`else` → TS) correctly reject.

## Bottom line

This is a high-quality codebase with a **proof problem, not a competence problem**. The fixes are well-scoped and the
single most valuable action — adding behavioural/round-trip proofs plus a package-integrity gate — would both fix the
worst issues and prevent their recurrence. See `09-remediation-roadmap.md`.
