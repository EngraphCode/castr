# Architectural Decision Records — Summary

**Last updated:** 2026-09-06  
**Project:** `@engraph/castr`  
**Status:** Architecture and decision navigation; no blanket support or quality-gate certificate.

## Current reading

Start with [identity](../../.agent/IDENTITY.md), the [Castr and Practice vision](../../.agent/directives/VISION.md) and [requirements](../../.agent/directives/requirements.md). The ratified application-contract direction distinguishes value and interaction roots and their semantic facets. The existing public API has not been migrated merely by adopting that direction.

The [Practice bridge](../../.agent/practice-index.md) locates the current evidence and operating records. The parent plan (through the Practice bridge) owns the programme queue and paused autonomous-development state; the delivery ledger (through the Practice bridge) owns dated PR and landed-value observations. Neither an accepted ADR nor a previously green check establishes complete support today.

## Historical wording awaiting its Q-10 replacement

The following paragraph is retained **verbatim as historical, uncertified wording**. Its substantive replacement is expressly reserved to **Q-10** in the parent plan (through the Practice bridge), alongside the support-contract implementation. It is not the current product statement or a support claim; current doctrine is linked above.

This library implements an **Intermediate Representation (IR) architecture** for universal schema conversion. All input formats are parsed into a canonical IR, and all outputs are transforms from that representation.

## Historical architecture illustration

This existing illustration is retained verbatim to explain the former `CastrDocument`-era model. It is not an exhaustive current surface inventory, a claim that every depicted conversion is proven, or the target discriminated-root architecture.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           INPUT LAYER                                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │ OpenAPI Parser│ │  Zod Parser   │ │ JSON Schema   │              │
│  │(3.0,3.1,3.2)  │ │    (v4)       │ │   Parser      │              │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘              │
│          └─────────────────┼─────────────────┘                       │
│                            ▼                                         │
├──────────────────────────────────────────────────────────────────────┤
│                    Intermediate Representation (IR) / Caster Model                  │
│                                                                      │
│   *** THIS IS THE SYSTEM'S CENTER OF GRAVITY ***                    │
│                                                                      │
│   • CastrSchema - Type definitions with constraints                     │
│   • CastrSchemaNode - Schema nodes with context                         │
│   • IROperation - API endpoint definitions                           │
│   • IRDependencyGraph - Reference tracking                           │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                           OUTPUT LAYER                               │
│          ┌─────────────────┼─────────────────┐                       │
│  ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐              │
│  │  Zod Writer   │ │  TS Types     │ │  MCP Tools    │              │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## ADR index

All 51 canonical records are listed in numeric order. Titles match their H1s; status categories match their current status declarations. Qualifying dates, incomplete implementation evidence and supersession details remain in each ADR. In particular, `Accepted` is not `Complete`, and ADR-024's `Implemented` label describes its historical slice.

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

## Reading the decisions together

- Canonical IR remains authoritative after parsing; the current identity defines the admitted semantic domain and target roots.
- Exact output, proven encoding, explicit projection and genuine target impossibility are distinct dispositions. Per-profile decisions and implementation proofs remain in their owning programme stages.
- Accepted-input, produced-output and ordered processing must not collapse into validation acceptance alone.
- The existing OpenAPI type-library seam is described by ADR-044–ADR-046. Older `openapi3-ts` and unconditional strict-object policies must be read with their replacements and amendments.
- Core compiler responsibility and companion transport/framework responsibility remain distinct under ADR-043.
- The platform-neutral autonomous-development design in ADR-051 does not determine whether a runtime is enabled; current execution state belongs to the parent plan.

## Related documents

| Document                                                            | Purpose                                                        |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [ADR guide](./README.md)                                            | Reading paths, status vocabulary and record-authoring guidance |
| [Vision](../../.agent/directives/VISION.md)                         | Castr and Practice direction                                   |
| [Requirements](../../.agent/directives/requirements.md)             | Compiler contract and implementation/proof boundaries          |
| [Principles](../../.agent/directives/principles.md)                 | Engineering standards                                          |
| [Testing strategy](../../.agent/directives/testing-strategy.md)     | Behavioural proof methodology                                  |
| [Definition of done](../../.agent/directives/DEFINITION_OF_DONE.md) | Verification contract                                          |
