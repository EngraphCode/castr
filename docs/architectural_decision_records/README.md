# Architectural Decision Records (ADRs)

This directory records architectural decisions for `@engraph/castr`: their context, authority, consequences and subsequent amendments. The ADR files are canonical; the two indexes are navigation views of those records.

**Index reconciled: 2026-09-06.** All 51 records, ADR-001–ADR-051, appear below with their exact titles and current status categories. Acceptance of a decision, historical implementation of a slice and current product certification are distinct claims. Read the status qualifications and dated amendments in the linked record.

## Start with current authority

1. Read the [Practice bridge](../../.agent/practice-index.md) for the repository's current operating and evidence paths.
2. Read [identity](../../.agent/IDENTITY.md), the [Castr and Practice vision](../../.agent/directives/VISION.md) and [requirements](../../.agent/directives/requirements.md) for the ratified application-value/interaction-contract boundary. The new discriminated roots and separated facets are target requirements, not a completed public-API migration.
3. Use the proof-programme parent (through the Practice bridge) for execution state and the controlling queue, and the delivery ledger (through the Practice bridge) for dated landed-value and PR observations. The autonomous-development experiment is paused; an accepted operating ADR does not imply an enabled runtime.
4. Apply [principles](../../.agent/directives/principles.md), [testing strategy](../../.agent/directives/testing-strategy.md) and the [definition of done](../../.agent/directives/DEFINITION_OF_DONE.md) to any implementation. This index does not assert that all quality gates pass or that the compiler is production-ready.

Directives take precedence over older ADR wording. A superseded record remains useful history; a proposed record remains a proposal. Where reconciliation is staged, the parent programme names the consuming work and decision boundary. Do not treat the existence or title of an ADR as a support certificate.

## ADR index

The table records status categories rather than copying time-sensitive implementation claims. ADR-024's `Implemented` category refers to its historical alignment slice; ADR-030's `Accepted` category retains its explicit incomplete-implementation qualification in the file. ADR-002, ADR-038 and ADR-040 are superseded.

| ADR                                                                               | Title                                                                 | Status      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------- |
| [001](./ADR-001-fail-fast-spec-violations.md)                                     | Fail Fast on OpenAPI Spec Violations                                  | Accepted    |
| [002](./ADR-002-defer-types-to-openapi3-ts.md)                                    | Defer Type Definitions to Source Libraries                            | Superseded  |
| [003](./ADR-003-type-predicates-over-boolean-filters.md)                          | Type Predicates Over Boolean Filters                                  | Accepted    |
| [004](./ADR-004-pure-functions-single-responsibility.md)                          | Pure Functions and Single Responsibility Principle                    | Accepted    |
| [005](./ADR-005-enum-complexity-calculation.md)                                   | Enum Complexity is Constant Regardless of Size                        | Accepted    |
| [006](./ADR-006-no-unused-variables-policy.md)                                    | No Unused Variables - No Underscore Prefix                            | Accepted    |
| [007](./ADR-007-esm-with-nodenext-resolution.md)                                  | ESM with NodeNext Module Resolution                                   | Accepted    |
| [008](./ADR-008-replace-cac-with-commander.md)                                    | Replace `cac` with `commander` for CLI                                | Accepted    |
| [009](./ADR-009-replace-preconstruct-with-tsup.md)                                | Replace Preconstruct with tsup                                        | Accepted    |
| [010](./ADR-010-use-turborepo.md)                                                 | Use Turborepo for Monorepo Orchestration                              | Accepted    |
| [011](./ADR-011-ajv-runtime-validation.md)                                        | AJV for Runtime OpenAPI Validation                                    | Accepted    |
| [012](./ADR-012-remove-playground-examples.md)                                    | Remove Playground and Examples Workspaces                             | Accepted    |
| [013](./ADR-013-architecture-rewrite-decision.md)                                 | Comprehensive Architecture Rewrite Over Incremental Fixes             | Accepted    |
| [014](./ADR-014-migrate-tanu-to-ts-morph.md)                                      | Migrate from tanu to ts-morph for AST Manipulation                    | Accepted    |
| [015](./ADR-015-eliminate-make-schema-resolver.md)                                | Eliminate makeSchemaResolver in Favor of Direct Component Access      | Accepted    |
| [016](./ADR-016-remove-zodios-dependencies.md)                                    | Remove Zodios Dependencies from Default Template                      | Accepted    |
| [017](./ADR-017-unified-bundle-only-pipeline.md)                                  | Unified Bundle-Only OpenAPI Input Pipeline                            | Accepted    |
| [018](./ADR-018-openapi-3.1-first-architecture.md)                                | OpenAPI 3.1-First Internal Type System                                | Accepted    |
| [019](./ADR-019-scalar-pipeline-adoption.md)                                      | Scalar Pipeline Adoption                                              | Accepted    |
| [020](./ADR-020-intersection-type-strategy.md)                                    | Intersection Type Strategy for Type System Boundaries                 | Accepted    |
| [021](./ADR-021-legacy-dependency-removal.md)                                     | Legacy Dependency Removal                                             | Accepted    |
| [022](./ADR-022-building-blocks-no-http-client.md)                                | Building-Blocks Architecture - No HTTP Client Generation              | Accepted    |
| [023](./ADR-023-ir-based-architecture.md)                                         | Intermediate Representation (IR) Architecture for Schema Generation   | Accepted    |
| [024](./ADR-024-complete-ir-alignment.md)                                         | Complete IR Architecture Alignment                                    | Implemented |
| [025](./ADR-025-http-client-di-integration.md)                                    | HTTP Client Integration via Dependency Injection                      | Proposed    |
| [026](./ADR-026-no-string-manipulation-for-parsing.md)                            | No String/Regex Heuristics for TS-Source Parsing                      | Accepted    |
| [027](./ADR-027-round-trip-validation.md)                                         | Transform Validation with Sample Input as Correctness Proof           | Accepted    |
| [028](./ADR-028-ir-openapi-consolidation.md)                                      | IR→OpenAPI Converter Consolidation                                    | Accepted    |
| [029](./ADR-029-canonical-source-structure.md)                                    | Canonical Source Structure                                            | Accepted    |
| [030](./ADR-030-full-openapi-syntax-support.md)                                   | Full OpenAPI Syntax Support                                           | Accepted    |
| [031](./ADR-031-zod-output-strategy.md)                                           | Zod 4 Output Strategy                                                 | Accepted    |
| [032](./ADR-032-zod-input-strategy.md)                                            | Zod 4 Input Strategy                                                  | Accepted    |
| [033](./ADR-033-two-pass-semantic-parsing.md)                                     | Two-Pass Semantic Parsing (AST Symbol Resolution)                     | Accepted    |
| [034](./ADR-034-writer-separation.md)                                             | Separation of Writer Concerns (Zod vs Metadata)                       | Accepted    |
| [035](./ADR-035-transform-validation-parity.md)                                   | Transform Validation Parity & Scenario Matrix                         | Accepted    |
| [036](./ADR-036-limit-directory-complexity.md)                                    | Limit Directory Complexity                                            | Accepted    |
| [037](./ADR-037-strict-architectural-domain-boundaries.md)                        | Strict Architectural Domain Boundaries                                | Accepted    |
| [038](./ADR-038-object-unknown-key-semantics.md)                                  | Object Unknown-Key Semantics and Parsed-Output Parity                 | Superseded  |
| [039](./ADR-039-uuid-subtype-semantics-and-native-only-emission.md)               | UUID Subtype Semantics and Native-Only Emission                       | Accepted    |
| [040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)       | Strict-By-Default Object Semantics With Optional Strip Normalization  | Superseded  |
| [041](./ADR-041-native-capability-seams-governed-widening-and-early-rejection.md) | Native-Capability Seams, Governed Widening, and Early Rejection       | Accepted    |
| [042](./ADR-042-json-schema-egress-normal-form.md)                                | JSON Schema 2020-12 Egress Normal Form                                | Accepted    |
| [043](./ADR-043-core-vs-companion-workspaces.md)                                  | Core Compiler Boundary and Companion Workspace Model                  | Accepted    |
| [044](./ADR-044-drop-openapi3-ts-adopt-scalar-types.md)                           | Drop openapi3-ts, Adopt @scalar/openapi-types                         | Accepted    |
| [045](./ADR-045-strict-reexport-module-openapi-types.md)                          | Strict Re-export Module for OpenAPI Types                             | Accepted    |
| [046](./ADR-046-separate-storage-additional-operations.md)                        | Separate Storage for `additionalOperations` on `CastrDocument`        | Accepted    |
| [047](./ADR-047-zod-2020-12-keyword-emission-strategy.md)                         | Zod Emission Strategy for JSON Schema 2020-12 Applicator Keywords     | Proposed    |
| [048](./ADR-048-compiler-internal-split-scope-and-value-gate.md)                  | Compiler-Internal Split — ADR-043 Scope Clarification and Value-Gate  | Proposed    |
| [049](./ADR-049-single-node-runtime-and-version-single-source.md)                 | Support a Single Node Runtime (Node 24) and Single-Source the Version | Accepted    |
| [050](./ADR-050-single-workspace-typescript-override.md)                          | Pin a Single Workspace TypeScript via a pnpm-workspace.yaml Override  | Accepted    |
| [051](./ADR-051-autonomous-background-implementation-loop.md)                     | Autonomous Background Implementation Loop for the Proof Programme     | Accepted    |

## Reading by concern

- **Canonical compiler boundary:** [ADR-023](./ADR-023-ir-based-architecture.md), [ADR-028](./ADR-028-ir-openapi-consolidation.md) and [ADR-043](./ADR-043-core-vs-companion-workspaces.md), read with the current identity's target-root migration.
- **Current OpenAPI library-type seam:** [ADR-044](./ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](./ADR-045-strict-reexport-module-openapi-types.md) and [ADR-046](./ADR-046-separate-storage-additional-operations.md). Their existing `CastrDocument`/canonical-output details are not the new artifact contract.
- **Zod and semantic proof:** [ADR-026](./ADR-026-no-string-manipulation-for-parsing.md), [ADR-031](./ADR-031-zod-output-strategy.md), [ADR-032](./ADR-032-zod-input-strategy.md), [ADR-035](./ADR-035-transform-validation-parity.md) and [ADR-041](./ADR-041-native-capability-seams-governed-widening-and-early-rejection.md). Read their amendments and outstanding profile obligations before reusing an old acceptance rule.
- **Domain boundaries:** [ADR-036](./ADR-036-limit-directory-complexity.md) and [ADR-037](./ADR-037-strict-architectural-domain-boundaries.md). Accepted architecture is not evidence that each enforcement rule currently detects violations.
- **Runtime and dependency policy:** [ADR-049](./ADR-049-single-node-runtime-and-version-single-source.md) and [ADR-050](./ADR-050-single-workspace-typescript-override.md). ADR-049 is an accepted record, not a reserved number.
- **Autonomous-development design:** [ADR-051](./ADR-051-autonomous-background-implementation-loop.md) describes the accepted platform-neutral contract. The parent plan owns its current paused state; Claude integration documents own that implementation's configuration.

## Historical decision dependencies

The following diagram is preserved from the 3.1-first / `openapi3-ts` era. It explains the historical ADR-018–ADR-021 sequence. It is not the current type seam, target-root design or proof of lossless version migration.

```text
┌─────────────────────────────────────────────────────────────┐
│ ADR-018: OpenAPI 3.1-First Architecture                    │
│ - All specs normalized to 3.1 after bundling               │
│ - Single internal type system (openapi3-ts/oas31)          │
└────────────────────────┬────────────────────────────────────┘
                         │ enables
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-019: Scalar Pipeline Adoption                          │
│ - @scalar/json-magic for bundling                          │
│ - @scalar/openapi-parser for upgrade/validate              │
│ - Rich metadata tracking                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ introduces
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-020: Intersection Type Strategy                        │
│ - BundledOpenApiDocument = OpenAPIV3_1 & OpenAPIObject     │
│ - Type guards for boundary validation                      │
│ - No casting, runtime validation only                      │
└────────────────────────┬────────────────────────────────────┘
                         │ enables
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ADR-021: Legacy Dependency Removal                         │
│ - Remove openapi-types@12.1.3                              │
│ - Remove @apidevtools/swagger-parser                       │
│ - Single type system, no conflicts                         │
└─────────────────────────────────────────────────────────────┘
```

## What an ADR records

An ADR captures a significant architectural decision together with its context and consequences. It helps contributors understand why a choice was made, find its authority, avoid reopening settled questions accidentally and retain useful history when the choice changes.

Each record should contain:

1. A numbered title describing the decision.
2. Its status and date, including later supersession or amendment where applicable.
3. Context: the concrete problem, forces and affected consumers.
4. The decision and its authority.
5. Consequences, alternatives and relevant evidence.
6. References to related records, doctrine and implementation boundaries.

## Creating or amending an ADR

Create an ADR for an architectural choice with lasting consequences, such as a dependency boundary, public model or supported-profile policy. Use code documentation and the delivery record for routine implementation detail; an ADR is not a substitute for behavioural proof.

1. Read the relevant current directive and existing ADR before making the decision.
2. Check the directory for the next unused number. On 2026-09-06, ADR-001–ADR-051 exist and **052 is next**; recheck before allocation rather than treating this snapshot as a reservation.
3. Follow an appropriate existing ADR's structure and record the required authority.
4. Preserve unique reasoning when amending or superseding a record, and link the replacement.
5. Update both [this index](./README.md) and [SUMMARY.md](./SUMMARY.md) from the canonical file's ID, title and status.
6. Validate affected links, record the decision with its delivery, and pass the applicable repository gates with hooks intact.

## Status vocabulary

- **Proposed:** a proposal awaiting acceptance; its prose does not make it operative.
- **Accepted:** an approved decision, subject to its recorded amendments and higher-authority doctrine; implementation may still be incomplete.
- **Implemented:** the record explicitly reports implementation of its defined slice; this does not certify a broader programme or every current profile.
- **Deprecated:** no longer recommended, without a replacement necessarily being complete.
- **Superseded:** replaced by the named ADR or higher-authority directive; retain the record as history.

## Related documentation

- [Architecture summary](./SUMMARY.md)
- [Practice vision](../../.agent/directives/PRACTICE-VISION.md)
- [Practice bridge: roadmap and current work](../../.agent/practice-index.md)
- [Input-output compatibility rule](../../.agent/rules/input-output-pair-compatibility.md)

**Last updated:** 2026-09-06
