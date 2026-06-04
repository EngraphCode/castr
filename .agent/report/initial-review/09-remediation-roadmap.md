# Remediation Roadmap

**Date:** 2026-06-04

Sequenced so that each phase makes the next safer. The ordering principle: **install the proofs that turn silent bugs
red _before_ fixing the bugs**, so fixes are verified by failing-then-passing tests (the repo's own TDD mandate), and
regressions can't recur.

**Governing resolution rule (user directive, 2026-06-04): where code, proofs, and docs disagree, normalise to the
_strictest_ of the three** — always raise the other two up, never relax the strict one (see `06`). Every fix below is
framed accordingly: bugs are fixed up to the strict lossless/fail-fast doc; missing enforcement is added so strict
claims are machine-checked; and the only doc edits are _tightenings_ where enforcement/code is already the stricter
party (these need user approval for `principles.md`/ADRs).

## Phase 0 — Stop the bleeding on the published artefact (C1)

Highest leverage, lowest risk, independent of everything else.

1. Add a **package-integrity gate**: `publint` + `@arethetypeswrong/cli` over the built package, wired into `pnpm qg`
   (and the DoD list). This alone catches C1's three sub-defects and prevents recurrence.
2. Fix declaration emission: override `noEmit:false` for the lib build (or `tsup --dts`), and set
   `declarationDir`/`rootDir` so `.d.ts` land at the `types` paths (`dist/index.d.ts`, not `dist/src/...`).
3. Fix the `./parsers/zod` export to point at the real built path, or add a `src/parsers/zod/index.ts` re-export entry.
4. Verify: a clean build produces `.d.ts` at every `types` target and `@engraph/castr/parsers/zod` resolves.

**Exit criterion:** `publint` + `attw` green; the README Zod example imports successfully from a packed tarball.

## Phase 1 — Install the missing proofs (turns C2–C6, H1–H4, M10, L13 red)

Write these as failing tests first (they should fail against today's code), then keep them as the gate.

1. **Round-trip / property suite**: `parse → IR → write → parse` equality across a fixture matrix that _includes_ the
   edge cases this review found: empty `properties: {}` (C4), dotted component names (C3), multi-scheme AND security
   (C2), `4XX`/`5XX` responses (H3), boolean `exclusiveMinimum` (H2), `contentEncoding`/`contentMediaType` (H2/H4),
   `$ref` with siblings (H4), Draft-07 `if/then/else` with nested `exclusiveMinimum` and deep `$ref` (H1).
2. **Generated-validator execution**: compile/evaluate emitted Zod for `if/then/else`, `dependentSchemas`, `contains`,
   `patternProperties` and assert constraint-violating input is rejected and conforming input accepted (C6).
3. **Negative-assertion fix + lint**: correct `schemas-with-metadata.test.ts` to assert on `result.content`, and add a
   lint rule banning `toContain`/`toMatch` on non-string receivers (H7).
4. **Determinism content check**: compare `files` bodies, not just path keys, across two runs (L13).

**Exit criterion:** the new suite is red against current `main` exactly where this report predicts.

## Phase 2 — Fix the Critical correctness/losslessness bugs (C2–C6)

With Phase 1 red, fix until green:

- **C5 (Zod parser):** replace per-kind blacklists with strict whitelists; `throw PARSE_ERROR` (with location) on any
  unrecognised union/tuple/enum member or chained method instead of skipping/text-capturing.
- **C6 (Zod writer):** recurse sub-schemas through the writer and validate via `safeParse`; map JSON-Schema types to
  correct runtime checks; implement real `if/then/else`/`dependentSchemas`, or **fail-fast** where genuinely not yet
  expressible (and document it).
- **C2 (security):** model `IRSecurityRequirement` as a requirement set; preserve AND-grouping through write + MCP.
- **C3 (component names):** carry the original name as the IR identity; sanitise only for emitted code symbols.
- **C4 (serialisation):** fix `isRecord` (Phase 3 M3) and add the empty-`properties` fixture.

## Phase 3 — High/Medium correctness + single-source-of-truth

- **M3 / C4 root cause:** consolidate to one `isRecord` (plain non-null, non-array object check); delete the 3 copies;
  this also fixes `version.ts` treating arrays as records (L5).
- **H1:** drive Draft-07 normalisation from one keyword table; fix the `$ref` rewriter for arbitrary depth.
- **H2, H4, M10:** emit `contentEncoding`/`contentMediaType`; normalise/fail-fast boolean `exclusiveMinimum`; carry
  `$ref` siblings; use `!== undefined` guards for optional strings.
- **H3:** preserve wildcard status tokens (or fail-fast); align MCP success selection (M6).
- **M7:** sort `patternProperties`/`dependentSchemas` keys in the Zod writer.
- **M4, M5:** move FS-IO tests to e2e/gen; inject the logger sink; delete types-only tests.

## Phase 4 — Honesty reconciliation, normalised to the strictest (H5, H6, M1, M2, M8, M9, L-series)

Apply the governing rule per disagreement — raise to the strictest party:

- **Doc is strictest → raise code+enforcement to it:**
  - **M1** (`Object.*`/`Reflect.*` declared forbidden) — add a `no-restricted-syntax`/`no-restricted-properties` lint
    rule and refactor the 148 usages (or the type-information-losing subset), making the strict doc enforceable. M12 is
    fixed as a by-product.
  - **M2** (ADR-026 string-manipulation ban) — add selectors/`no-restricted-imports` for the lodash function-call form,
    route `$ref` parsing through the centralised utilities; the ADR's strict claim becomes true rather than evaded.
  - **L2** — extend `no-restricted-types` to the `{[k:string]:unknown}` sibling; **L5** consolidates onto the shared
    array-excluding `isRecord`.
- **Enforcement/code is strictest → tighten the doc (⚠️ needs approval for `principles.md`):**
  - **L1** — the linter already bans test-`as`; remove the `principles.md:970` permission so the doc matches the
    stricter enforcement.
  - **H6/L8** — the validator/parser already enforce closed-world; narrow the IR type to `additionalProperties?: false`
    (or `boolean`), delete the schema-valued TSDoc and the dead object-valued branches.
- **Docs claim absent capability → implement the strict behaviour + prove it (removal only as fallback):**
  - **H5** — implement the documented `spec-compliant`/`auto-correct` default-response filtering (the _stricter_ of
    "filter" vs "always include") with a proof; remove only if the behaviour is truly unwanted.
  - **L7** — populate `expected`/`received` from the Zod issue. **L9/L10/M9** — keep the strict fail-fast, correct the
    inaccurate wording ("no OpenAPI equivalent" → policy statement; "does not yet support" → genuine-limitation or
    implement; repopulate `UNSUPPORTED_DOCUMENT_KEYWORDS` for anything not losslessly representable, or drop the dead
    machinery + `@throws`).
  - **L11** — implement `$id` basename extraction (the documented stricter behaviour) or correct the docstring.
- **Mechanical cleanups (raise to strict):** **M8** complete the capability traversal; **L3** govern/justify the two
  disables; **L4** delete the stale comment; **L6** delete the dead, raw-doc-reaching `getOperationForEndpoint`;
  **L14** fail-fast (don't silently remap) the Draft-07 `unevaluatedProperties` downgrade; **L15** inject a clock / drop
  the timestamp from output-bound metadata; **L17** replace the glib disable with a typed omit; **L18** declare
  `ajv-draft-04` in `lib/package.json`; **L19** throw on invalid CLI flag values.

## Suggested grouping into PRs

| PR   | Contents                                                      | Risk              |
| ---- | ------------------------------------------------------------- | ----------------- |
| PR-1 | Phase 0 (packaging + `.d.ts` + sub-path + gate)               | Low               |
| PR-2 | Phase 1 proofs (red)                                          | Low (tests only)  |
| PR-3 | C5 + C6 (Zod parser/writer)                                   | Medium            |
| PR-4 | C2 + C3 (security, component names)                           | Medium            |
| PR-5 | M3/C4 (`isRecord` consolidation + serialisation)              | Low-Medium        |
| PR-6 | H1–H4, M6, M7, M10 (parser/writer fidelity)                   | Medium            |
| PR-7 | Test hygiene (M4, M5, H7, L13)                                | Low               |
| PR-8 | Honesty reconciliation (H5, H6, L-series) + doctrine decision | Low (mostly docs) |

## The single most important sentence

If only one thing is done: **add the package-integrity gate and a round-trip + generated-validator proof suite.** Those
two gates would have caught C1–C6 and most of the High findings, and they convert "the doctrine says lossless/fail-fast"
from an aspiration into something the build enforces.
