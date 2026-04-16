# Explicit Additional Properties Support

> **⏸️ SEQUENCED — position 3 in the plan-of-record (owner, 2026-06-09).** This feature slice runs after **(1) the
> deep-review remediation backlog** (`.agent/plans/remediation/`, plans 01→07, in flight now) and **(2) the Practice
> transplant Phases 5–9**. A 2026-06-05 record claimed this plan was "parked-in-place per the user-directed parking
> exception" — **the owner never gave that instruction and repudiated the parking framing on 2026-06-09** ("all
> issues MUST be fixed, mostly now; sequencing in the current plan is acceptable; an undefined 'later' is never").
> This banner is the correction; the plan's substance is unchanged and it holds a named position, not a parking bay.

**Status:** SEQUENCED #3 (paused per the normal lifecycle; named position in `roadmap.md`)  
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

## Current Landed Truth

The Thursday, 16 April 2026 ePerusteet reproduction exposed a real policy mismatch, and the implementation slice that followed is now landed:

- explicit source `additionalProperties` now survives parser -> IR -> portable writer honestly as `false`, `true`, or schema-valued truth
- portable omission now stays omitted; Castr no longer stamps `additionalProperties: false` onto object schemas merely because they are objects
- IR validation and schema traversal now admit and walk schema-valued `additionalProperties` consistently
- OpenAPI raw-surface carriers now prove IR preservation for boolean and schema-valued `additionalProperties`, not just parse acceptance
- JSON Schema ingest and normalisation now preserve omitted, boolean, and schema-valued `additionalProperties`, including nested and `$ref`-normalised cases
- `deprecated` is treated as a legitimate OpenAPI Schema Object field and now survives parser -> IR -> writer, including the reproduced ePerusteet seam on schema-valued `additionalProperties`
- Zod ingest remains strict: `z.looseObject()`, `.passthrough()`, and `.strip()` are still rejected, while plain `z.object(...).catchall(...)` is admitted only as explicit source truth
- decorated permissive catchalls from `z.any()` / `z.unknown()` no longer collapse to bare `true`; first-pass metadata such as `.default(...)`, description, and `deprecated` survive as schema truth
- Zod output now supports the safe explicit catchall slice via `.catchall(...)` and fails fast for recursive catchall-preserving output
- that recursive fail-fast boundary is now proven for direct self-ref catchalls, nested property catchalls, composition-member catchalls, property-only recursive catchall objects, and `prefixItems`-driven recursive catchalls
- OpenAPI component circular-reference detection now traverses `prefixItems`, so tuple-only recursion receives the same metadata markers as property and item recursion
- TypeScript still fails fast on reachable explicit `additionalProperties`, preserving the honest target-boundary doctrine
- MCP Draft 07 conversion preserves explicit nested `additionalProperties`, while the previously settled zero-input synthetic wrapper behavior remains unchanged
- the latest Oak upstream spec is now committed in the real-world fixture set and has both load-boundary and transform-round-trip proof
- the duplicate low-signal rejection proof has been removed because stronger transform and generated-suite proofs now exist elsewhere

This plan remains active only because the durable-doc and practice-consolidation pass is still being completed.

## Resolved Findings

The Thursday, 16 April 2026 reviewer findings that originally opened this slice are now closed in product code and proof:

- `z.looseObject(...).catchall(...)` no longer slips through ingest
- decorated permissive catchalls no longer lose first-pass source semantics
- raw-surface OpenAPI proofs now assert IR preservation rather than `not.toThrow()`
- ePerusteet now has a committed first-pass OpenAPI round-trip proof and repeated-pass idempotence proof
- first-pass `deprecated: true` loss on ePerusteet is fixed
- Oak has been refreshed from the live upstream source, moved into the canonical real-world fixture set, committed, and covered by round-trip proof
- recursive explicit-`additionalProperties` Zod fail-fast coverage now includes tuple-only and property-only recursion paths
- OpenAPI circular-reference detection now marks tuple-only cycles via `prefixItems`

## Remaining Work

No fresh product regression is currently reproduced. The remaining work for this active plan is documentary rather than semantic:

- consolidate durable docs so architecture and migration guidance reflect the landed truth without overstating the old blanket ban
- audit prompt, command, rule, and practice cohesion after this slice
- decide whether the plan can move from `ACTIVE` to a completion record once the consolidation pass is finished

## Success Criteria

- explicit external `additionalProperties` are admitted into IR without semantic loss
- strict input that omitted `additionalProperties` does not gain them through parsing, IR transforms, or writing
- OpenAPI / JSON Schema output preserves declared `additionalProperties` honestly
- downstream targets either emit equivalent semantics or fail fast with actionable errors where genuinely impossible
- the ePerusteet fixture has first-pass proof, repeated-pass idempotence proof, and preserved `deprecated` semantics at the reproduced seam
- the latest committed Oak fixture survives the real-world transform proof set
- repo-root `pnpm check` is green on the landed tree
- durable docs and session surfaces reflect the landed boundary without reopening settled earlier phases

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
- after code/proof landing, run document/practice consolidation before promoting to a completion record
