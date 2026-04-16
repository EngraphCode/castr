# Explicit Additional Properties Support

**Status:** ACTIVE  
**Created:** 2026-04-16  
**Promoted:** 2026-04-16  
**Predecessor:** [eperusteet-real-spec-validation.md](../current/complete/eperusteet-real-spec-validation.md)  
**Related:** [oas-3.2-full-feature-support.md](../current/complete/oas-3.2-full-feature-support.md), [ADR-040](../../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md), [ADR-038](../../../docs/architectural_decision_records/ADR-038-object-unknown-key-semantics.md)

---

## Goal

Support explicit `additionalProperties` semantics from external inputs honestly across the core pipeline while preserving the invariant that Castr must never invent `additionalProperties` from input that did not declare them.

## User Impact

Users can ingest and round-trip legitimate third-party OpenAPI / JSON Schema documents that use explicit `additionalProperties`, including schema-valued forms, without Castr treating those specs as invalid merely because they are open-world. At the same time, strict input remains strict: Castr must not create `additionalProperties` where the source did not ask for them.

## Scope

In scope:

- clarify the canonical policy for explicit external `additionalProperties`
- align IR, validators, OpenAPI parser, JSON Schema parser, and writers with that policy
- preserve explicit `additionalProperties: false`, `true`, and schema-valued forms where the input declared them
- prove that strict input remains strict and no writer/parser invents `additionalProperties`
- update durable docs whose current wording overstates the closed-world ban

Out of scope:

- reopening AP4 or OAS 3.2 Phases B-E unless a fresh regression appears there
- silently broadening semantics for undeclared object openness
- treating Zod runtime quirks as permission to drop or invent semantics
- unrelated generated-suite or transport work

## Source Of Truth Questions

1. What object semantics must the IR carry for external interchange formats?
2. Which targets can emit explicit `additionalProperties` honestly?
3. Where must we fail fast because a target cannot express those semantics safely?
4. How do we preserve the “never invent from absent input” invariant at every seam?

## Current Reproduced Truth

The ePerusteet real-world fixture proved a policy mismatch:

- the shared load boundary accepts and canonicalises the document
- the IR type already allows `additionalProperties?: boolean | CastrSchema`
- parser, validator, and portable writer alignment for explicit `additionalProperties` is now landed
- non-recursive Zod catchall output is now landed for explicit source truth
- remaining honest boundaries are explicit-open TypeScript fail-fast and recursive catchall-preserving Zod fail-fast

This plan is the direct successor to that reproduction.

## Current Open Findings

The reviewer loop was re-run on Thursday, 16 April 2026 and surfaced open findings that must close before this slice can be considered honest:

- Zod ingest still wrongly admits `z.looseObject(...).catchall(...)`; loose-object, strip, and passthrough modes must remain rejected even when `.catchall(...)` is present.
- Zod ingest currently collapses decorated `z.any()` / `z.unknown()` catchalls to bare `additionalProperties: true`, which loses explicit source metadata such as `default`, `description`, or `deprecated`.
- Raw-surface OpenAPI coverage currently proves acceptance with `not.toThrow()` but does not yet prove that explicit `additionalProperties` survives into IR on those raw path-item / webhook carriers.
- The ePerusteet fixture still lacks a committed first-pass OpenAPI round-trip proof; repeated passes stabilise, but the first pass must be proven semantically honest.
- Direct reproduction shows the first OpenAPI -> IR -> OpenAPI trip currently drops schema-level `deprecated: true` on `TutkinnonOsaKaikkiDto.properties.tavoitteet` and `.ammattitaitovaatimukset`, including their schema-valued `additionalProperties`.
- `deprecated` must be treated as a legitimate OpenAPI Schema Object field and must survive parser -> IR -> writer honestly wherever supported.
- The real-world Oak Open Curriculum fixture in `tests-transforms/__fixtures__/arbitrary/oak-api.json` must be refreshed from the current upstream `swagger.json` and kept in the active real-world fixture set.
- Decorated permissive Zod catchalls must not lose first-pass `.default(...)` or metadata when written back through the Zod writer.
- Recursive explicit-`additionalProperties` Zod output must fail fast not only for top-level component catchalls but also for nested property, array-item, and composition-member contexts.
- Raw-surface OpenAPI proofs must cover schema-valued `additionalProperties`, not just boolean `true`, on header, callback, path-item, query, and webhook carriers.
- The generated ePerusteet rejection proof must assert the narrowed explicit-`additionalProperties` capability boundary, not a broad alternation of unrelated failure families.
- Duplicate low-signal proofs should be removed once a stronger transform or load-boundary proof exists elsewhere.
- The recursive catchall guard needs explicit unit proof for `prefixItems`-driven recursion under schema-valued `additionalProperties`; otherwise the newly tightened Zod fail-fast boundary is only inferred from helper logic.
- Property helper tests need a `prefixItems`-only recursive reference proof so getter-syntax recursion detection cannot silently regress on tuple-based cycles.
- The refreshed real-world Oak fixture needs transform-round-trip proof, not just load-boundary coverage, and that proof must show explicit `additionalProperties` survives the pipeline.
- The refreshed Oak real-world fixture must ship as a committed repo fixture, not remain local-only, or the new coverage becomes non-reproducible on a clean checkout.
- The recursive Zod catchall fail-fast guard still needs to reject direct `$ref` catchalls and catchall objects whose recursion is reachable only through ordinary properties; traversing only tuple/items/composition subpaths is not sufficient.
- OpenAPI component circular-reference detection must include `prefixItems`, or tuple-only self-recursive schemas will miss `metadata.circularReferences` and leave downstream fail-fast/getter logic blind.

## Success Criteria

- explicit external `additionalProperties` are admitted into IR without semantic loss
- strict input that omitted `additionalProperties` does not gain them through parsing, IR transforms, or writing
- OpenAPI / JSON Schema output preserves declared `additionalProperties` honestly
- downstream targets either emit equivalent semantics or fail fast with actionable errors where genuinely impossible
- the ePerusteet fixture moves from fail-fast proof to honest supported-surface proof if and only if the landed slice truly covers it end to end
- the reviewer-loop findings above are all closed, not merely documented

## Stage Map

`external OpenAPI/JSON Schema input -> shared load boundary -> parser -> IR -> writers/downstreams`

Critical distinction:

- **explicit openness** from source input must survive honestly
- **implicit openness invented by Castr** must never occur

## Option Families

### Option A: keep doctrine and add special-case fixture exceptions

Rejected. This would preserve contradictory architecture and encode policy by exception.

### Option B: reintroduce source-truth openness semantics into IR and enforce “never invent” at the parser/writer boundaries

Chosen. This matches the clarified product intent and the existing IR shape more closely.

## TDD Order

1. write failing tests that capture the clarified product rule at the smallest seam
2. land the minimal IR / validator / parser change needed to admit explicit `additionalProperties`
3. wire writers and downstream fail-fast behavior honestly
4. close reviewer-raised regressions and real-world first-pass round-trip proofs
5. update durable docs and broader real-world proofs only after the core seam is correct

## Documentation Outputs

- update durable doctrine/docs that currently claim all catchall / `additionalProperties` semantics are rejected ontologies
- update completion records only where the new clarified truth supersedes their wording
- add or revise ADR material only if the canonical architectural model changes materially

## Execution Trigger

Execute immediately. The issue has already been reproduced and the user has clarified the intended product boundary.

## Quality Gate Protocol

- targeted red/green at the affected seams first
- targeted transform/generated reruns as the surface expands
- full repo-root aggregate rerun before honest close-out
