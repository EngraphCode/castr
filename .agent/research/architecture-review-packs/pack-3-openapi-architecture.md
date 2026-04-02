# Pack 3 — OpenAPI Architecture

**Date:** 2026-03-22
**Verdict:** red

## Invariants Checked

- The strict core path remains `prepareOpenApiDocument()` -> `loadOpenApiDocument()` -> `buildIR()`, and the doctor remains an opt-in repair seam rather than a parser or writer dependency.
- OpenAPI ingest still centralizes malformed component-reference rejection and non-strict object rejection at the parser boundary.
- Preserved raw OpenAPI structures remain physically contained to the OpenAPI seam rather than leaking into unrelated domains.
- OpenAPI egress must emit every claimed supported OpenAPI 3.1 component family honestly, and the proof matrix must assert that support claim explicitly.

## Findings

1. Severity: high
   File: [schema.components.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.components.ts#L25)
   File: [index.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/index.ts#L80)
   File: [parser-field-coverage.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/parser-field-coverage.integration.test.ts#L122)
   File: [openapi-writer.components.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/openapi/components/openapi-writer.components.ts#L315)
   File: [writer-field-coverage.integration.test.ts](/Users/jim/code/personal/castr/lib/tests-transforms/__tests__/writer-field-coverage.integration.test.ts#L109)
   File: [openapi-acceptance-criteria.md](/Users/jim/code/personal/castr/.agent/acceptance-criteria/openapi-acceptance-criteria.md#L166)
   File: [ADR-030-full-openapi-syntax-support.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-030-full-openapi-syntax-support.md#L28)
   Issue: Reusable `components.requestBodies` are admitted into IR as first-class `IRRequestBodyComponent`s and are explicitly covered on ingress, but the OpenAPI component writer drops them entirely and the output-coverage suite never asserts them.
   Why it matters: This is silent OpenAPI -> IR -> OpenAPI content loss on a surface that doctrine, acceptance criteria, and ADR-030 all claim is supported. A local runtime confirmation on 2026-03-22 showed `UserBody` present in IR and absent from emitted `components.requestBodies`, so Pack 3 cannot clear while writer and proof layers disagree with the support claim.

## Doctrine Or Doc Drift

- The runtime seam itself is physically clean: [orchestrator.ts](/Users/jim/code/personal/castr/lib/src/shared/load-openapi-document/orchestrator.ts#L44) owns bundling, declared-version validation, and upgrade before the parser path begins, and the doctor is not imported into parser or writer flows.
- Loader and architecture docs still describe that seam inconsistently. [index.ts](/Users/jim/code/personal/castr/lib/src/shared/load-openapi-document/index.ts), [scalar-pipeline.md](/Users/jim/code/personal/castr/docs/architecture/scalar-pipeline.md#L80), [input-pipeline.char.test.ts](/Users/jim/code/personal/castr/lib/src/characterisation/input-pipeline.char.test.ts#L113), and [bundled-spec-assumptions.char.test.ts](/Users/jim/code/personal/castr/lib/src/characterisation/bundled-spec-assumptions.char.test.ts#L32) still carry stale stage-order or SwaggerParser-era language even though the live implementation is now Scalar-only.
- The targeted Pack 3 proof matrix reproduced green locally on 2026-03-22, which makes the `requestBodies` gap more serious rather than less: the current proof set passes because it never asserts that claimed output surface.

## Required Follow-On Slices

- OpenAPI request-body component parity remediation: either emit `IRRequestBodyComponent`s back to `components.requestBodies` with explicit output-coverage and round-trip proof, or narrow the claimed OpenAPI support surface everywhere it is currently advertised. The current doctrine and acceptance criteria strongly favour remediation over de-scoping.
- Loader and seam-documentation cleanup across the Scalar pipeline docs and characterisation commentary so cold-start sessions see the actual `prepareOpenApiDocument()` / `loadOpenApiDocument()` ownership model instead of mixed historical language.

## Unblock Decision

- Pack 4 is unblocked and should be the next review pack.
- The next implementation slice remains blocked because Pack 3 found silent OpenAPI output incompleteness on a claimed supported surface.
- [json-schema-parser.md](/Users/jim/code/personal/castr/.agent/plans/current/complete/json-schema-parser.md) remains historical remediation context until Pack 4 explicitly decides whether that workstream still fits the reviewed architecture.
