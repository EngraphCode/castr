# Prompt: Pack 4 — JSON Schema Architecture

> [!IMPORTANT]
> Historical review prompt.
> Pack 4 completed on Sunday, 22 March 2026 with a `red` verdict.
> Keep this file as provenance for how Pack 4 was run; use [session-entry.prompt.md](./session-entry.prompt.md) and [pack-4-json-schema-architecture.md](../research/architecture-review-packs/pack-4-json-schema-architecture.md) for current-state handoff.

Use this prompt only if you need to reconstruct or audit the original Pack 4 review workflow.

## Start Position

Pre-close Pack 4 start position, as of Sunday, 22 March 2026:

- Pack 1 completed on Saturday, 21 March 2026 with a `yellow` verdict.
- Pack 2 completed on Saturday, 21 March 2026 with a `red` verdict.
- Pack 3 completed on Sunday, 22 March 2026 with a `red` verdict.
- Pack 4 is the next review pack.
- New implementation remains blocked pending the review matrix.
- The historical JSON Schema parser remediation record is under direct review in this pack and must not be treated as authoritative until verified against the code on disk.

## First Rule

Treat [IDENTITY.md](../IDENTITY.md) and the code on disk as the only authoritative truth. Plans, prompts, roadmap notes, acceptance-criteria checklists, and older JSON Schema phase plans are working hypotheses until verified against the repo's actual implementation.

## Mission

Review Pack 4 only: JSON Schema architecture.

Determine whether Draft 07 / 2020-12 normalization, JSON Schema parsing, JSON Schema writing, and cross-format parity proofs form one strict and complete architecture; whether unsupported semantics fail at the earliest honest seam; and whether the historical [json-schema-parser.md](../plans/current/complete/json-schema-parser.md) remediation record is still architecturally sound, partially stale, or fully superseded by the code now on disk.

This is a review session, not an implementation session. Do not edit product code unless the user explicitly redirects the session into implementation.

## Read In This Order

1. [IDENTITY.md](../IDENTITY.md)
2. [session-entry.prompt.md](./session-entry.prompt.md)
3. [architecture-review-packs.md](../plans/current/complete/architecture-review-packs.md)
4. [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md)
5. [roadmap.md](../plans/roadmap.md)
6. [pack-1-boundary-integrity-and-public-surface.md](../research/architecture-review-packs/pack-1-boundary-integrity-and-public-surface.md)
7. [pack-2-canonical-ir-truth-and-runtime-validation.md](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md)
8. [pack-3-openapi-architecture.md](../research/architecture-review-packs/pack-3-openapi-architecture.md)
9. [json-schema-parser.md](../plans/current/complete/json-schema-parser.md)
10. [phase-4-json-schema-and-parity.md](../plans/current/complete/phase-4-json-schema-and-parity.md)
11. [json-schema-and-parity-acceptance-criteria.md](../acceptance-criteria/json-schema-and-parity-acceptance-criteria.md)
12. Relevant durable JSON Schema doctrine and standards references:

- [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
- [ADR-035](../../docs/architectural_decision_records/ADR-035-transform-validation-parity.md)
- [ADR-040](../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
- [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)
- [json-schema-core.txt](../reference/json-schema-2020-12/json-schema-core.txt)
- [json-schema-validation.txt](../reference/json-schema-2020-12/json-schema-validation.txt)

13. [napkin.md](../memory/napkin.md)

## Pack 4 Scope

Focus on:

- Draft 07 / 2020-12 normalization
- JSON Schema parser shape and writer lockstep
- standards coverage and rejection boundaries
- paused successor plan fitness

## Questions This Session Must Answer

- Is Draft 07 / 2020-12 normalization centralized, deterministic, and standards-aligned, or are there hidden tolerance paths?
- Do the JSON Schema parser and writer stay in lockstep around one honest supported surface?
- Does JSON Schema ingress reject unsupported or non-canonical constructs at the earliest honest boundary?
- Does JSON Schema egress emit only the supported 2020-12 surface and reject native-capability gaps explicitly?
- Do the Scenario 5, Scenario 6, and Scenario 7 proofs actually verify the JSON Schema architecture the repo now claims?
- Is the historical [json-schema-parser.md](../plans/current/complete/json-schema-parser.md) remediation record still fit to seed a new slice, or does Pack 4 need to mark it stale, rewritten, or superseded?

## Code And Proof Areas To Inspect First

- `lib/src/schema-processing/parsers/json-schema/`
- `lib/src/schema-processing/parsers/json-schema/normalization/`
- `lib/src/schema-processing/writers/json-schema/`
- `lib/src/schema-processing/writers/shared/json-schema-fields.ts`
- `lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.ts`
- `lib/src/schema-processing/conversion/json-schema/`
- `lib/src/characterisation/json-schema.char.test.ts`
- `lib/tests-transforms/__tests__/scenario-5-json-schema-roundtrip.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-6-zod-via-json-schema.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-7-multi-cast.integration.test.ts`

## Reviewer Lenses

Use the right reviewers where helpful:

- `code-reviewer`
- `type-reviewer`
- `test-reviewer`
- `json-schema-expert`

## Output Contract

Before closing the session:

1. Write one evidence-backed note at [pack-4-json-schema-architecture.md](../research/architecture-review-packs/pack-4-json-schema-architecture.md).
2. Use the required note structure from [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md).
3. Update [session-entry.prompt.md](./session-entry.prompt.md), [roadmap.md](../plans/roadmap.md), and [architecture-review-packs.md](../plans/current/complete/architecture-review-packs.md) immediately if Pack 4 changes review truth.
4. Update [json-schema-parser.md](../plans/current/complete/json-schema-parser.md) immediately if Pack 4 concludes that the historical remediation record is stale, superseded, or needs rewriting before any new slice is planned.
5. Update [napkin.md](../memory/napkin.md) with the Pack 4 outcome.

## Guardrails

- If the user reports a fresh gate or runtime issue, reproduce it before continuing the pack review.
- Review one pack only. Do not blend Pack 4 findings into Pack 5.
- Findings come before summaries.
- Strict and complete everywhere, all the time is the bar.
- Partial parser, normalizer, writer, proof, or doc alignment is a finding, not success.
- Do not fix product code mid-sweep unless the user explicitly redirects.
- If doctrine and code disagree, say so plainly and file-reference the disagreement.
- If the historical remediation record and the code on disk disagree, the code wins; record the drift rather than forcing the review to fit the stale plan.

## Verification

For review-only prompt, note, roadmap, or handoff changes:

- `pnpm format:check`
- `pnpm portability:check`
