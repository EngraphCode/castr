# Pack 2 — Canonical IR Truth and Runtime Validation

**Date:** 2026-03-21
**Verdict:** red

## Invariants Checked

- Runtime IR validators must admit only canonical Castr ontology and reject malformed IR at deserialization boundaries.
- Runtime document validation must agree with the supported IR model and requirements surface for operations and components.
- Closed-world object doctrine from [`IDENTITY.md`](/Users/jim/code/personal/castr/.agent/IDENTITY.md) must remain true across IR models, ingest guards, writers, and proof artefacts.

## Findings

1. Severity: high
   File: [lib/src/schema-processing/ir/validation/validators.schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.schema.ts)
   File: [lib/src/schema-processing/ir/serialization.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/serialization.ts)
   File: [lib/src/schema-processing/ir/serialization.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/serialization.unit.test.ts)
   Issue: `isCastrSchema()` does not validate core schema shape such as `type`, `items`, composition fields, or `required`; it only checks `additionalProperties`, `properties`, integer semantics, UUID version, and `metadata`. Because `deserializeIR()` trusts that guard during revival, a fully otherwise-valid serialized IR document still deserializes after its component schema `type` is mutated to an invalid string such as `wat`.
   Why it matters: Pack 2 is supposed to prove that canonical IR is the only runtime truth. Right now the runtime boundary accepts malformed schemas that cannot belong to the canonical ontology at all.

2. Severity: high
   File: [IDENTITY.md](/Users/jim/code/personal/castr/.agent/IDENTITY.md)
   File: [docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
   File: [lib/src/schema-processing/ir/models/schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts)
   File: [lib/src/schema-processing/ir/validation/validators.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.unit.test.ts)
   File: [lib/src/schema-processing/parsers/openapi/openapi-document.object-semantics.schemas.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/openapi-document.object-semantics.schemas.ts)
   File: [lib/src/schema-processing/parsers/openapi/schemas/builder.json-schema-2020-12.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/schemas/builder.json-schema-2020-12.ts)
   File: [lib/src/schema-processing/parsers/json-schema/json-schema-parser.core.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/json-schema/json-schema-parser.core.unit.test.ts)
   File: [lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/shared/json-schema-2020-12-fields.ts)
   File: [lib/src/schema-processing/writers/openapi/schema/openapi-writer.schema.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/openapi/schema/openapi-writer.schema.unit.test.ts)
   Issue: IDENTITY says catchall / `additionalProperties` openness is a rejected ontology and that IR carries no unknown-key semantics, but Pack 2 code and tests still preserve open-object constructs. The IR model still carries `additionalProperties?: boolean | CastrSchema` and `unevaluatedProperties?: boolean | CastrSchema`; `isCastrSchema()` and its unit tests still accept schema-valued `additionalProperties`; the OpenAPI object-semantics visitor rejects only `additionalProperties`-based openness; and parser/writer seams plus their tests still admit and re-emit `unevaluatedProperties: true` and schema-valued `unevaluatedProperties`.
   Why it matters: the repo no longer has one enforced runtime ontology for object closure. Some seams follow IDENTITY's closed-world doctrine, while others still preserve or prove behaviours that reopen object acceptance.

3. Severity: medium
   File: [lib/src/schema-processing/ir/models/schema.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts)
   File: [lib/src/schema-processing/ir/validation/validators.document.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.document.ts)
   File: [lib/src/schema-processing/ir/validation/validators.unit.test.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.unit.test.ts)
   File: [lib/src/schema-processing/parsers/openapi/operations/builder.operations.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/parsers/openapi/operations/builder.operations.ts)
   File: [lib/src/schema-processing/writers/openapi/operations/openapi-writer.operations.ts](/Users/jim/code/personal/castr/lib/src/schema-processing/writers/openapi/operations/openapi-writer.operations.ts)
   File: [requirements.md](/Users/jim/code/personal/castr/.agent/directives/requirements.md)
   Issue: the IR model, OpenAPI parser, OpenAPI writer, and requirements docs all include `trace`, but the runtime document validator omits it from `VALID_HTTP_METHODS`, and the validator proof only enumerates seven methods.
   Why it matters: the runtime boundary currently rejects a valid supported operation shape, so the validator layer is no longer an honest executable contract for the rest of the IR stack.

## Doctrine Or Doc Drift

- [`IDENTITY.md`](/Users/jim/code/personal/castr/.agent/IDENTITY.md) and [`ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md`](/Users/jim/code/personal/castr/docs/architectural_decision_records/ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) describe one closed-world object ontology, but Pack 2 code still preserves multiple open-object paths at runtime.
- Runtime identity work after IDENTITY was not wasted: [`CastrSchemaProperties`](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/models/schema.ts) branding plus cross-realm-safe map detection in [`validators.document.ts`](/Users/jim/code/personal/castr/lib/src/schema-processing/ir/validation/validators.document.ts) are coherent. The red verdict comes from ontology and validator honesty, not from those cross-realm repairs.
- The review-state handoff docs had drifted again before this note was written: they still said Pack 2 was upcoming rather than completed and blocked.

## Required Follow-On Slices

- Harden `isCastrSchema()` and `deserializeIR()` so malformed schema structure cannot cross runtime boundaries, then add proof coverage for invalid `type` and other core schema-shape rejections.
- Reconcile IDENTITY with Pack 2's remaining object-openness surfaces by either removing `additionalProperties` / `unevaluatedProperties` openness from IR, parsers, writers, and tests or explicitly revising doctrine if a second ontology is truly intended.
- Restore runtime validator parity for supported HTTP methods by adding `trace` end to end and extending the validator proof suite accordingly.

## Unblock Decision

- Pack 3 is unblocked and should be the next review pack.
- The next implementation slice remains blocked because Pack 2 found runtime-boundary and ontology drift in canonical IR itself.
- [`json-schema-parser.md`](/Users/jim/code/personal/castr/.agent/plans/current/paused/json-schema-parser.md) stays paused until Pack 4 explicitly decides whether that workstream still fits the corrected architecture.
