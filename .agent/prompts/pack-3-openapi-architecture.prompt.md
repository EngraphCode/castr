# Prompt: Pack 3 — OpenAPI Architecture

Use this prompt to start a fresh session whose sole goal is to complete Pack 3 of the post-IDENTITY architecture review sweep.

## Start Position

As of Sunday, 22 March 2026:

- Pack 1 completed on Saturday, 21 March 2026 with a `yellow` verdict.
- Pack 2 completed on Saturday, 21 March 2026 with a `red` verdict.
- Pack 3 is the next review pack.
- New implementation remains blocked pending the review matrix.
- The paused JSON Schema parser plan stays blocked until Pack 4 says otherwise.

## First Rule

Treat [IDENTITY.md](../IDENTITY.md) and the code on disk as the only authoritative truth. Plans, prompts, roadmap notes, and earlier review notes are working hypotheses until verified against the repo's actual implementation.

## Mission

Review Pack 3 only: OpenAPI architecture.

Determine whether OpenAPI-specific tolerance is isolated to the correct seam, whether ingress and egress are strict and complete end to end, and whether preserved raw structures and reference-resolution behaviour are justified, physically contained, and proven.

This is a review session, not an implementation session. Do not edit product code unless the user explicitly redirects the session into implementation.

## Read In This Order

1. [IDENTITY.md](../IDENTITY.md)
2. [session-entry.prompt.md](./session-entry.prompt.md)
3. [architecture-review-packs.md](../plans/active/architecture-review-packs.md)
4. [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md)
5. [roadmap.md](../plans/roadmap.md)
6. [pack-1-boundary-integrity-and-public-surface.md](../research/architecture-review-packs/pack-1-boundary-integrity-and-public-surface.md)
7. [pack-2-canonical-ir-truth-and-runtime-validation.md](../research/architecture-review-packs/pack-2-canonical-ir-truth-and-runtime-validation.md)
8. [json-schema-parser.md](../plans/current/paused/json-schema-parser.md)
9. Relevant durable OpenAPI doctrine:
   - [native-capability-matrix.md](../../docs/architecture/native-capability-matrix.md)
   - [scalar-pipeline.md](../../docs/architecture/scalar-pipeline.md)
   - [ADR-017](../../docs/architectural_decision_records/ADR-017-unified-bundle-only-pipeline.md)
   - [ADR-018](../../docs/architectural_decision_records/ADR-018-openapi-3.1-first-architecture.md)
   - [ADR-019](../../docs/architectural_decision_records/ADR-019-scalar-pipeline-adoption.md)
   - [ADR-028](../../docs/architectural_decision_records/ADR-028-ir-openapi-consolidation.md)
   - [ADR-030](../../docs/architectural_decision_records/ADR-030-full-openapi-syntax-support.md)
   - [ADR-034](../../docs/architectural_decision_records/ADR-034-writer-separation.md)
   - [ADR-037](../../docs/architectural_decision_records/ADR-037-strict-architectural-domain-boundaries.md)
   - [ADR-040](../../docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
   - [ADR-041](../../docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)
10. [napkin.md](../memory/napkin.md)

## Pack 3 Scope

Focus on:

- doctor vs parser boundary
- OpenAPI ingest and egest
- reference resolution and preserved raw structures

## Questions This Session Must Answer

- Is OpenAPI-specific tolerance isolated to the `shared/load-openapi-document` and `shared/doctor` boundary, or is it leaking into parser or writer seams?
- Are upgrade, validation, bundling, normalisation, parsing, and writing responsibilities cleanly assigned?
- Does OpenAPI ingress reject unsupported or non-strict shapes at the earliest honest boundary?
- Does OpenAPI egress emit only the supported surface and validate that surface honestly?
- Are preserved raw structures minimal, justified, and physically contained?
- Does component and `$ref` handling stay centralised, fail-fast, and provable?
- Do tests and transform proofs verify the OpenAPI architecture the repo now claims?

## Code And Proof Areas To Inspect First

- `lib/src/shared/load-openapi-document/`
- `lib/src/shared/doctor/`
- `lib/src/shared/prepare-openapi-document.ts`
- `lib/src/schema-processing/parsers/openapi/`
- `lib/src/schema-processing/writers/openapi/`
- `lib/src/tests-e2e/openapi-fidelity.test.ts`
- `lib/tests-transforms/__tests__/doctor.integration.test.ts`
- `lib/tests-transforms/__tests__/parser-field-coverage.integration.test.ts`
- `lib/tests-transforms/__tests__/scenario-1-openapi-roundtrip.integration.test.ts`
- `lib/tests-transforms/__tests__/validation-parity*.integration.test.ts`
- `lib/tests-transforms/__tests__/writer-field-coverage.integration.test.ts`

## Reviewer Lenses

Use the right reviewers where helpful:

- `code-reviewer`
- `type-reviewer`
- `test-reviewer`
- `openapi-expert`

## Output Contract

Before closing the session:

1. Write one evidence-backed note at [pack-3-openapi-architecture.md](../research/architecture-review-packs/pack-3-openapi-architecture.md).
2. Use the required note structure from [architecture-review-packs.prompt.md](./architecture-review-packs.prompt.md).
3. Update [session-entry.prompt.md](./session-entry.prompt.md), [roadmap.md](../plans/roadmap.md), and [architecture-review-packs.md](../plans/active/architecture-review-packs.md) immediately if Pack 3 changes review truth.
4. Update [napkin.md](../memory/napkin.md) with the Pack 3 outcome.
5. Keep [json-schema-parser.md](../plans/current/paused/json-schema-parser.md) blocked until Pack 4 explicitly decides whether that workstream is still fit.

## Guardrails

- If the user reports a fresh gate or runtime issue, reproduce it before continuing the pack review.
- Review one pack only. Do not blend Pack 3 findings into Pack 4.
- Findings come before summaries.
- Strict and complete everywhere, all the time is the bar.
- Partial parser, validator, writer, proof, or doc alignment is a finding, not success.
- Do not fix product code mid-sweep unless the user explicitly redirects.
- If doctrine and code disagree, say so plainly and file-reference the disagreement.

## Verification

For review-only prompt, note, roadmap, or handoff changes:

- `pnpm format:check`
- `pnpm portability:check`
