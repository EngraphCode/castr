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
- the IR build seam currently rejects schema-valued `additionalProperties`
- the IR type already allows `additionalProperties?: boolean | CastrSchema`
- writer and validator assumptions still reflect the stronger closed-world-only doctrine

This plan is the direct successor to that reproduction.

## Success Criteria

- explicit external `additionalProperties` are admitted into IR without semantic loss
- strict input that omitted `additionalProperties` does not gain them through parsing, IR transforms, or writing
- OpenAPI / JSON Schema output preserves declared `additionalProperties` honestly
- downstream targets either emit equivalent semantics or fail fast with actionable errors where genuinely impossible
- the ePerusteet fixture moves from fail-fast proof to honest supported-surface proof if and only if the landed slice truly covers it end to end

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
4. update durable docs and broader real-world proofs only after the core seam is correct

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
