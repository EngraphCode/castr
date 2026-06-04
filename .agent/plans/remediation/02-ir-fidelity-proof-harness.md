# Plan: IR Fidelity Proof Harness (round-trip + property proofs)

**Status:** Backlog (remediation) · **Findings:** H7 (root) + C2, C3, C4, H1, H2, H3, H4, M10 · **Risk:** Low (tests) → Medium (fixes)
**References:** report `02`/`03`/`04` and `07-test-quality-and-proof-gaps.md`; `DEFINITION_OF_DONE.md` (byte-for-byte determinism / persistence E2E); `architecture-review-packs.md` Pack 7 (already calls for an IR-fidelity suite)

---

## User impact

The gates stay green while the pipeline silently loses or corrupts content (security AND→OR, dangling `$ref`s, dropped
keywords, failed round-trips). This plan installs the **behavioural/round-trip proofs the suite lacks** so each of those
defects becomes a red test, then fixes them to green. This is the single highest-leverage item in the review.

## Scope

In scope — a fidelity proof harness + the fixtures that exercise the verified gaps, then the fixes they force:

- **Round-trip / property suite:** `parse → IR → write → parse` equality, including `serializeIR`/`deserializeIR`.
- Fixtures (each currently failing or losing content):
  - empty `properties: {}` serialize round-trip (**C4**)
  - dotted component name + `$ref` to it (**C3**)
  - operation security `{A, B}` AND-grouping (**C2**)
  - wildcard `4XX`/`5XX` response status (**H3**)
  - boolean `exclusiveMinimum` + `contentEncoding`/`contentMediaType` (**H2/H4**)
  - `$ref` with sibling keywords (**H4**)
  - Draft-07 `if/then/else` with nested `exclusiveMinimum` + deep `$ref` (**H1**)
  - empty-string `description`/`summary` (**M10**)

Out of scope: the Zod-keyword refinement correctness (that is plan 03 / ADR-047); type-guard consolidation (plan 05,
which C4 also depends on — sequence 05 alongside this).

## Success criteria

- Each fixture above has a behavioural assertion (round-trip equality or correct output), red against current `main`.
- Each underlying defect (C2-C4, H1-H4, M10) fixed to green:
  - C2: `IRSecurityRequirement` modelled as a requirement set; AND-grouping preserved through write + MCP.
  - C3: original component name carried as IR identity; sanitisation only for emitted code symbols.
  - C4: empty `properties` round-trips (depends on plan 05 `isRecord` fix).
  - H1: normalisation recurses all 2020-12 sub-schema keywords; `$ref` rewriter handles arbitrary depth.
  - H2/H4: emit `contentEncoding`/`contentMediaType`; normalise/fail-fast boolean `exclusiveMinimum`; carry `$ref` siblings.
  - H3: preserve wildcard status tokens (or fail-fast).
  - M10: `!== undefined` guards for optional string fields.
- Determinism: compare `files` **content** (not just path keys) across two runs (**L13**).
- `pnpm qg` green.

## TDD order

Per fixture: write the failing proof → confirm red → fix the seam → confirm green → confirm no regression. Land C4 only
after plan 05.

## Documentation outputs

- A permanent `docs/architecture/` note describing the fidelity-proof harness as the durable home for round-trip truth.
- Update `DEFINITION_OF_DONE.md` to list the fidelity suite.
