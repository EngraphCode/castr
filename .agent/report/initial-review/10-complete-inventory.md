# Complete Candidate Inventory (all 86 → disposition)

**Date:** 2026-06-04

Every one of the 86 raw candidates produced by the discovery sweep is listed here and mapped to a canonical finding ID
(or a rejection/duplicate). This is the "leave nothing out" guarantee: 86 raw candidates → **46 distinct findings**
(C1–C6, H1–H7, M1–M13, L1–L19, N1) + **9 rejected/downgraded** (R1–R9) + corollaries/non-issues. Duplicates are where
multiple agents independently reported the same defect (a useful corroboration signal).

**Disposition key:** `→ Cx/Hx/Mx/Lx/Nx` = mapped to that finding · `dup` = duplicate of an already-listed finding ·
`Rx` = rejected/downgraded (see `08`) · `corollary` = the docs-honesty shadow of a code finding · `non-issue` = agent
self-cleared.

## Area 1 — OpenAPI parser (6)

1. Schema component names `toIdentifier` break `$ref` round-trips → **C3** 🟢
2. Empty-string description/summary dropped by truthy guards → **M10** 🔵
3. Component-level param/response built with dummy empty doc; valid media-type `$ref` rejected → **M13** 🔵(structural)
4. `Reflect.get`/`set` on statically-typed `deprecated` → **M12** 🔵
5. `buildIR` docstring claims "lossless", contradicted by C3/C5 → **corollary of C3/C5** (docs-honesty) 🔵
6. Ungoverned `eslint-disable` `version.ts:17` → **L3** 🔵

## Area 2 — Zod source parser (7)

1. Union members silently dropped → **C5** 🟢
2. Tuple elements dropped (arity corrupted) → **C5** 🟢
3. `z.nativeEnum` drops value set → **C5** 🟢
4. `.refine`/`.transform`/`.brand`/`.pipe` on primitives lost → **C5** (🟢 `.refine`; 🟡 others)
5. Object-level `.refine`/`.readonly` silently ignored → **C5** (🟢 `.refine`; 🟡 `.readonly`)
6. Non-literal enum members dropped → **C5** 🟡 mechanism
7. ADR-032 "lossless" claim contradicted by parser → **corollary of C5** (docs-honesty) 🔵

## Area 3 — JSON Schema parser + normalisation (7)

1. Draft-07 normalisation no-recurse into `if/then/else`/`patternProperties`/etc. → **H1** 🟢
2. `$ref` rewriter 3-segment-only; deep refs dangle → **H1** 🟢
3. `contentMediaType`/`contentSchema` dropped → **H4** 🟢
4. `$ref` siblings dropped (no fail-fast) → **H4** 🟢
5. `deriveRootName` "$id basename" docstring inaccurate → **L11** 🔵
6. `patternProperties`-only objects escape strict closed-world → **L12** 🟢
7. `UnsupportedJsonSchemaKeywordError` path dead; docstring still claims rejection → **L10** 🔵

## Area 4 — OpenAPI writer (5)

1. `contentEncoding` silently dropped → **H2** 🟢
2. Boolean `exclusiveMinimum`/`exclusiveMaximum` dropped → **H2** 🟢
3. `additionalProperties` `true`/schema narrowed to `false` → **L8** (latent; downgraded **R7**) 🟢
4. Stale "Always emits `additionalProperties: false`" comment → **L8** 🔵
5. `booleanSchema` "no OpenAPI equivalent" message inaccurate for 3.2 → **L9** 🔵

## Area 5 — Zod writer (generators + refinements) (6)

1. `if/then/else` refinement `return true` no-op → **C6** 🟢
2. `dependentSchemas` refinement `return true` no-op → **C6** 🟢
3. `typeof x === '<jsonSchemaType>'` wrong for integer/array/null/unknown → **C6** 🟢
4. "Semantic refinement" tests assert `toContain('.refine(')` only → **H7** 🟢
5. `patternProperties`/`dependentSchemas`/`dependentRequired` emitted unsorted → **M7** 🔵
6. Array-valued `items` degrades to `z.unknown()` → **L16** 🟡

## Area 6 — TypeScript / JSON-Schema / Markdown writers (5)

1. TS writer drops `enum` → bare `string` → **N1** 🟢
2. TS writer drops `const` → **N1** 🟢
3. TS writer drops `not` → `unknown` → **N1** 🟢(related)
4. JSON-Schema writer drops `contentEncoding` → **H2** dup 🟢
5. Markdown `getTypeName` `catch` fallback → **R5** (downgraded) 🔵

## Area 7 — IR models / conversion / compatibility (5)

1. `CastrSchema.additionalProperties` type+TSDoc advertise schema-valued support the pipeline rejects → **H6** 🔵+🟢
2. Integer-capability IR traversal omits 6 child-bearing keywords → **M8** 🔵
3. `itemSchema` capability "does not yet support" message → **M9** 🔵
4. `booleanSchema` "no OpenAPI equivalent" → **L9** dup 🔵
5. Draft-07 converter remaps `unevaluatedProperties`→`additionalProperties` → **L14** 🔵

## Area 8 — context / endpoints / MCP / rendering (8)

1. Security `AND` grouping flattened to `OR` → **C2** 🟢
2. Wildcard `4XX`/`5XX` status `parseInt` → 4/5 → **H3** 🔵
3. `defaultStatusBehavior` documented/CLI-plumbed but never read → **H5** 🔵
4. Cluster of dead `TemplateContextOptions` → **H5** 🔵
5. "should NOT generate" tests `toContain` on object → vacuous → **H7** 🟢
6. MCP output schema dropped for `2XX`/`default` success → **M6** 🔵
7. Grouped-determinism test compares only path keys → **L13** 🔵
8. `getOperationForEndpoint` dead + reaches raw doc → **L6** 🔵

## Area 9 — shared / CLI / validation (6)

1. `maybePretty` swallows formatter errors → **M11** 🔵
2. `isRecord` rejects empty objects → **C4** / root cause **M3** 🟢
3. Four divergent `isRecord` functions → **M3** 🔵
4. CLI `--complexity-threshold` no NaN guard → **R8** (downgraded — unused) 🔵
5. CLI silently drops invalid `--group-strategy`/`--default-status` → **L19** 🔵
6. `McpValidationError` advertises `expected`/`received` never populated → **L7** 🔵

## Area 10 — ADR-026 / $ref centralisation / fail-fast / determinism / strict objects (5)

1. ADR-026 string-method ban evaded via lodash function-call form → **M2** 🔵
2. Ad-hoc `$ref` parsing outside centralised utilities → **M2** 🔵
3. `maybePretty` swallow → **M11** dup 🔵
4. Bundle metadata `new Date()`/`process.cwd()` → **L15** 🔵
5. Implicit-open `additionalProperties` absent → `false` coercion → **acknowledged** (defensible per IDENTITY/ADR-040; documented as the strict-by-default stance) 🔵

## Area 11 — IR serialisation / type guards / TS writer / Zod determinism (6)

1. IR `serialize→deserialize` throws on empty `properties` → **C4** 🟢
2. `isRecord` rejects empty/all-undefined objects → **C4**/**M3** dup 🟢
3. Two `isRecord` + two `isCastrSchema` divergent → **M3** 🔵
4. TS writer widens multi-type to `unknown` → **N1** 🟢
5. Zod refinement determinism (unsorted vs TS sorts) → **M7** dup 🔵
6. Serialisation test only covers non-empty `CastrSchemaProperties` → **H7**/proof-gap (`07`) 🔵

## Area 12 — Zod 2020-12 refinements + integration IO + test quality (6)

1. `dependentSchemas` no-op → **C6** dup 🟢
2. `if/then/else` no-op → **C6** dup 🟢
3. `typeof '<jsonSchemaType>'` wrong → **C6** dup 🟢
4. Substring-only refinement tests → **H7** dup 🟢
5. Integration test does FS IO under `pnpm test` → **M4** 🔵
6. `logger.test.ts` mutates global `console` + types-only test → **M5** 🔵

## Area 13 — Zod writer `refinements/object.ts` (4)

1. `if/then/else` no-op → **C6** dup 🟢
2. `dependentSchemas` no-op → **C6** dup 🟢
3. `patternProperties` `typeof === 'unknown'` rejects all keys → **C6** dup 🟢
4. 2020-12 refinements never executed by any test → **H7** dup 🔵

## Area 14 — Zod refinements / IR serialisation / fail-fast (10)

1. `dependentSchemas` no-op (critical) → **C6** dup 🟢
2. `if/then/else` no-op (critical) → **C6** dup 🟢
3. Substring-only refinement tests → **H7** dup 🟢
4. Module docstring overclaims semantic preservation → **corollary of C6** (docs-honesty) 🔵
5. `isRecord` rejects empty → **C4**/**M3** dup 🟢
6. `maybePretty` swallow → **M11** dup 🔵
7. `patternProperties`/`unevaluated*` typeof drops constraints → **C6** dup 🟢
8. Zod refinement determinism unsorted → **M7** dup 🔵
9. Stale `eslint.config.ts:112` "temporary" governance comment → **L4** 🔵
10. Index-signature interfaces re-introduce `Record` + weak `isRecord` (`version.ts`) → **L5** 🔵

## Tally

| Bucket                                    | Count                                          |
| ----------------------------------------- | ---------------------------------------------- |
| Distinct findings (C/H/M/L/N)             | 46                                             |
| — Critical (C1–C6)                        | 6                                              |
| — High (H1–H7)                            | 7                                              |
| — Medium (M1–M13)                         | 13                                             |
| — Low (L1–L19)                            | 19                                             |
| — Low-reach (N1)                          | 1                                              |
| Rejected / downgraded (R1–R9)             | 9                                              |
| Docs-honesty corollaries of code findings | 3 (C3/C5, C5, C6)                              |
| Acknowledged non-issues / by-design       | 2 (implicit-closed coercion; doctor try/catch) |
| Raw candidates accounted for              | 86 / 86                                        |

## Verification coverage

- **🟢 ran code / ran tool:** all Critical (C1–C6), and H1/H2/H4/H7, plus N1, L12, several others.
- **🔵 read source:** all remaining High/Medium and most Low.
- **🟡 mechanism (sibling executed):** a handful of C5 sub-cases (`.transform`/`.brand`/`.pipe`, `.readonly`,
  non-literal enum members) and L16.
- **⚪ reported-only (not independently re-verified):** **none** in Critical/High/Medium; the only partial is M13
  (structurally confirmed from source, end-to-end rejection not reproduced — flagged for a Phase-1 reproduction test).
