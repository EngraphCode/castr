# Architectural Decision Records - Summary

**Last Updated:** 2026-03-28  
**Project:** @engraph/castr  
**Status:** Stable - All quality gates passing

---

## Executive Summary

This library implements an **Intermediate Representation (IR) architecture** for universal schema conversion. All input formats are parsed into a canonical IR, and all outputs are transforms from that representation.

**See:** `.agent/directives/VISION.md` for strategic vision and roadmap.

---

## Current Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           INPUT LAYER                                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │ OpenAPI Parser│ │  Zod Parser   │ │ JSON Schema   │              │
│  │  (3.0, 3.1)   │ │    (v4)       │ │   Parser      │              │
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

---

## ADR Index

### Foundation (Complete)

| ADR                                                      | Title                                  | Status      |
| -------------------------------------------------------- | -------------------------------------- | ----------- |
| [001](./ADR-001-fail-fast-spec-violations.md)            | Fail Fast on Spec Violations           | ✅ Accepted |
| [002](./ADR-002-defer-types-to-openapi3-ts.md)           | Defer Types to openapi3-ts             | ✅ Accepted |
| [003](./ADR-003-type-predicates-over-boolean-filters.md) | Type Predicates Over Boolean Filters   | ✅ Accepted |
| [004](./ADR-004-pure-functions-single-responsibility.md) | Pure Functions & Single Responsibility | ✅ Accepted |

### Quality & Standards (Complete)

| ADR                                              | Title                        | Status      |
| ------------------------------------------------ | ---------------------------- | ----------- |
| [005](./ADR-005-enum-complexity-calculation.md)  | Enum Complexity Calculation  | ✅ Accepted |
| [006](./ADR-006-no-unused-variables-policy.md)   | No Unused Variables Policy   | ✅ Accepted |
| [007](./ADR-007-esm-with-nodenext-resolution.md) | ESM with NodeNext Resolution | ✅ Accepted |

### Build Tooling (Complete)

| ADR                                                | Title                          | Status      |
| -------------------------------------------------- | ------------------------------ | ----------- |
| [008](./ADR-008-replace-cac-with-commander.md)     | Replace CAC with Commander     | ✅ Accepted |
| [009](./ADR-009-replace-preconstruct-with-tsup.md) | Replace Preconstruct with tsup | ✅ Accepted |
| [010](./ADR-010-use-turborepo.md)                  | Use Turborepo                  | ✅ Accepted |

### Architecture Rewrite (Complete)

| ADR                                                | Title                         | Status      |
| -------------------------------------------------- | ----------------------------- | ----------- |
| [011](./ADR-011-ajv-runtime-validation.md)         | AJV Runtime Validation        | ✅ Accepted |
| [012](./ADR-012-remove-playground-examples.md)     | Remove Playground Examples    | ✅ Accepted |
| [013](./ADR-013-architecture-rewrite-decision.md)  | Architecture Rewrite Decision | ✅ Complete |
| [014](./ADR-014-migrate-tanu-to-ts-morph.md)       | Migrate Tanu to ts-morph      | ✅ Complete |
| [015](./ADR-015-eliminate-make-schema-resolver.md) | Eliminate makeSchemaResolver  | ✅ Complete |
| [016](./ADR-016-remove-zodios-dependencies.md)     | Remove Zodios Dependencies    | ✅ Complete |

### Scalar Pipeline (Complete)

| ADR                                                | Title                          | Status      |
| -------------------------------------------------- | ------------------------------ | ----------- |
| [017](./ADR-017-unified-bundle-only-pipeline.md)   | Unified Bundle-Only Pipeline   | ✅ Accepted |
| [018](./ADR-018-openapi-3.1-first-architecture.md) | OpenAPI 3.1-First Architecture | ✅ Accepted |
| [019](./ADR-019-scalar-pipeline-adoption.md)       | Scalar Pipeline Adoption       | ✅ Accepted |
| [020](./ADR-020-intersection-type-strategy.md)     | Intersection Type Strategy     | ✅ Accepted |
| [021](./ADR-021-legacy-dependency-removal.md)      | Legacy Dependency Removal      | ✅ Accepted |

### Library Philosophy (Current)

| ADR                                                                               | Title                          | Status      |
| --------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| [022](./ADR-022-building-blocks-no-http-client.md)                                | Building-Blocks Architecture   | ✅ Accepted |
| [023](./ADR-023-ir-based-architecture.md)                                         | IR-Based Architecture          | ✅ Accepted |
| [024](./ADR-024-complete-ir-alignment.md)                                         | Complete IR Alignment          | 📋 Proposed |
| [031](./ADR-031-zod-output-strategy.md)                                           | Zod 4 Output Strategy          | ✅ Accepted |
| [032](./ADR-032-zod-input-strategy.md)                                            | Zod 4 Input Strategy           | ✅ Accepted |
| [033](./ADR-033-two-pass-semantic-parsing.md)                                     | Two-Pass Semantic Parsing      | ✅ Accepted |
| [034](./ADR-034-writer-separation.md)                                             | Separation of Writer Concerns  | ✅ Accepted |
| [035](./ADR-035-transform-validation-parity.md)                                   | Transform Validation Parity    | ✅ Accepted |
| [038](./ADR-038-object-unknown-key-semantics.md)                                  | Object Unknown-Key Semantics   | ✅ Accepted |
| [039](./ADR-039-uuid-subtype-semantics-and-native-only-emission.md)               | UUID Subtype Semantics         | ✅ Accepted |
| [040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)       | Strict Object Doctrine         | ✅ Accepted |
| [041](./ADR-041-native-capability-seams-governed-widening-and-early-rejection.md) | Native-Capability Seams        | ✅ Accepted |
| [042](./ADR-042-json-schema-egress-normal-form.md)                                | JSON Schema Egress Normal Form | ✅ Accepted |

### Additional Architecture Records

| ADR                                                        | Title                                  | Status      |
| ---------------------------------------------------------- | -------------------------------------- | ----------- |
| [036](./ADR-036-limit-directory-complexity.md)             | Limit Directory Complexity             | ✅ Accepted |
| [037](./ADR-037-strict-architectural-domain-boundaries.md) | Strict Architectural Domain Boundaries | ✅ Accepted |

---

## Key Principles

1. **IR is Truth** - The internal IR is authoritative
2. **Fail Fast** - Invalid input rejected immediately
3. **Type Safety** - No `any`, no unchecked assertions
4. **O(N) Complexity** - One parser + one transformer per format
5. **Building Blocks** - Schemas and metadata, not complete SDKs

---

## Related Documents

| Document                                | Purpose                         |
| --------------------------------------- | ------------------------------- |
| `.agent/directives/VISION.md`           | Strategic direction and roadmap |
| `.agent/directives/requirements.md`     | Agent decision-making guide     |
| `.agent/directives/principles.md`       | Engineering standards           |
| `.agent/directives/testing-strategy.md` | Test methodology                |
| `./README.md`                           | ADR guide and template          |
