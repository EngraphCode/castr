# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) documenting significant architectural decisions made during the development and evolution of `@engraph/castr`.

## What is an ADR?

An Architectural Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams:

- **Understand** why decisions were made
- **Onboard** new team members quickly
- **Avoid** revisiting settled decisions
- **Learn** from past choices
- **Communicate** architectural intent

## ADR Format

Each ADR follows this structure:

1. **Title** - Short noun phrase describing the decision
2. **Status** - Proposed, Accepted, Deprecated, Superseded
3. **Context** - What forces are at play? What problem are we solving?
4. **Decision** - What did we decide to do?
5. **Consequences** - What are the positive, negative, and neutral outcomes?
6. **Alternatives** - What other options were considered?
7. **References** - Links to related resources

## Current ADRs

### Phase 1: Architecture Rewrite & Modernization

| ADR                                                      | Title                                  | Status   | Date |
| -------------------------------------------------------- | -------------------------------------- | -------- | ---- |
| [001](./ADR-001-fail-fast-spec-violations.md)            | Fail Fast on Spec Violations           | Accepted | -    |
| [002](./ADR-002-defer-types-to-openapi3-ts.md)           | Defer Types to openapi3-ts             | Accepted | -    |
| [003](./ADR-003-type-predicates-over-boolean-filters.md) | Type Predicates Over Boolean Filters   | Accepted | -    |
| [004](./ADR-004-pure-functions-single-responsibility.md) | Pure Functions & Single Responsibility | Accepted | -    |
| [005](./ADR-005-enum-complexity-calculation.md)          | Enum Complexity Calculation            | Accepted | -    |
| [006](./ADR-006-no-unused-variables-policy.md)           | No Unused Variables Policy             | Accepted | -    |
| [007](./ADR-007-esm-with-nodenext-resolution.md)         | ESM with NodeNext Resolution           | Accepted | -    |
| [008](./ADR-008-replace-cac-with-commander.md)           | Replace CAC with Commander             | Accepted | -    |
| [009](./ADR-009-replace-preconstruct-with-tsup.md)       | Replace Preconstruct with tsup         | Accepted | -    |
| [010](./ADR-010-use-turborepo.md)                        | Use Turborepo                          | Accepted | -    |
| [011](./ADR-011-ajv-runtime-validation.md)               | AJV Runtime Validation                 | Accepted | -    |
| [012](./ADR-012-remove-playground-examples.md)           | Remove Playground Examples             | Accepted | -    |
| [013](./ADR-013-architecture-rewrite-decision.md)        | Architecture Rewrite Decision          | Accepted | -    |
| [014](./ADR-014-migrate-tanu-to-ts-morph.md)             | Migrate Tanu to ts-morph               | Accepted | -    |
| [015](./ADR-015-eliminate-make-schema-resolver.md)       | Eliminate makeSchemaResolver           | Accepted | -    |
| [016](./ADR-016-remove-zodios-dependencies.md)           | Remove Zodios Dependencies             | Accepted | -    |
| [017](./ADR-017-unified-bundle-only-pipeline.md)         | Unified Bundle-Only Pipeline           | Accepted | -    |

### Phase 2 Part 1: Scalar Pipeline Re-architecture

| ADR                                                | Title                                                 | Status   | Date       |
| -------------------------------------------------- | ----------------------------------------------------- | -------- | ---------- |
| [018](./ADR-018-openapi-3.1-first-architecture.md) | OpenAPI 3.1-First Internal Type System                | Accepted | 2025-11-04 |
| [019](./ADR-019-scalar-pipeline-adoption.md)       | Scalar Pipeline Adoption                              | Accepted | 2025-11-04 |
| [020](./ADR-020-intersection-type-strategy.md)     | Intersection Type Strategy for Type System Boundaries | Accepted | 2025-11-04 |
| [021](./ADR-021-legacy-dependency-removal.md)      | Legacy Dependency Removal                             | Accepted | 2025-11-04 |

### Library Philosophy & Architecture

| ADR                                                | Title                                                               | Status   | Date       |
| -------------------------------------------------- | ------------------------------------------------------------------- | -------- | ---------- |
| [022](./ADR-022-building-blocks-no-http-client.md) | Building-Blocks Architecture - No HTTP Client Generation            | Accepted | 2025-11-29 |
| [023](./ADR-023-ir-based-architecture.md)          | Intermediate Representation (IR) Architecture for Schema Generation | Accepted | 2025-12-01 |
| [024](./ADR-024-complete-ir-alignment.md)          | Complete IR Alignment                                               | Accepted | 2026-01-02 |

### Phase 2: Zod → OpenAPI (In Progress)

| ADR                                             | Title                       | Status   | Date       |
| ----------------------------------------------- | --------------------------- | -------- | ---------- |
| [025](./ADR-025-http-client-di-integration.md)  | HTTP Client DI Integration  | Accepted | 2026-01-06 |
| [026](./ADR-026-no-regex-for-parsing.md)        | No Regex for Schema Parsing | Accepted | 2026-01-10 |
| [027](./ADR-027-round-trip-validation.md)       | Round-Trip Validation       | Accepted | 2026-01-12 |
| [028](./ADR-028-ir-openapi-consolidation.md)    | IR→OpenAPI Consolidation    | Accepted | 2026-01-12 |
| [029](./ADR-029-canonical-source-structure.md)  | Canonical Source Structure  | Accepted | 2026-01-12 |
| [030](./ADR-030-full-openapi-syntax-support.md) | Full OpenAPI Syntax Support | Accepted | 2026-01-13 |

> **Session 2.6a Active** — Full syntax coverage tests written (87 tests). IR expansion in progress.
> See: [round-trip-validation-plan.md](../../.agent/plans/round-trip-validation-plan.md)

## Decision Dependencies

### Phase 2 Part 1 Architecture

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

## Key Architectural Principles

These ADRs establish the following principles:

1. **Single Source of Truth:** All OpenAPI documents are 3.1 internally (ADR-018)
2. **Type Safety First:** No casting, use type guards at boundaries (ADR-020)
3. **Rich Metadata:** Track all bundling operations for debugging (ADR-019)
4. **Standards Alignment:** JSON Schema Draft 2020-12 compatibility (ADR-018)
5. **Deterministic Behavior:** Pinned dependencies, controlled bundling (ADR-019)
6. **Extension Preservation:** Keep vendor extensions (x-\*) for debugging (ADR-020)

## Reading Guide

**For new contributors:**

1. Start with [ADR-018](./ADR-018-openapi-3.1-first-architecture.md) to understand the 3.1-first approach
2. Read [ADR-019](./ADR-019-scalar-pipeline-adoption.md) to see how documents are loaded
3. Review [ADR-020](./ADR-020-intersection-type-strategy.md) to understand type boundaries
4. Check [ADR-021](./ADR-021-legacy-dependency-removal.md) for migration context

**For understanding type system:**

- [ADR-018](./ADR-018-openapi-3.1-first-architecture.md) - Why 3.1 only
- [ADR-020](./ADR-020-intersection-type-strategy.md) - How types work

**For understanding bundling:**

- [ADR-019](./ADR-019-scalar-pipeline-adoption.md) - Scalar pipeline details
- [ADR-021](./ADR-021-legacy-dependency-removal.md) - Why we removed SwaggerParser

## Related Documentation

**Strategic Context:**

- **Strategic Vision (VISION.md):** `.agent/VISION.md` - The N×M format conversion goal
- **Decision Guidance (requirements.md):** `.agent/requirements.md` - Agent decision-making heuristics

**Engineering Standards:**

- **Rules:** `.agent/RULES.md` - Engineering excellence standards
- **Summary:** `./SUMMARY.md` - Phase 2 architectural decisions summary
- **Strategic Overview:** `.agent/plans/00-STRATEGIC-OVERVIEW.md`

**Core Documents:**

- **Vision:** `.agent/VISION.md`
- **Requirements:** `.agent/requirements.md`
- **Rules:** `.agent/RULES.md`

## Creating New ADRs

When making significant architectural decisions:

1. **Copy template** from an existing ADR
2. **Number sequentially** (next is 025)
3. **Fill all sections** (Context, Decision, Consequences, Alternatives)
4. **Link related ADRs** in the "Related" field
5. **Update this README** with the new entry
6. **Commit with message:** `docs: add ADR-XXX for [decision]`

### When to Create an ADR

Create an ADR when:

- Choosing between multiple architectural approaches
- Making decisions with long-term impact
- Introducing new dependencies or removing old ones
- Changing core abstractions or type systems
- Establishing new patterns or conventions

### When NOT to Create an ADR

Don't create ADRs for:

- Implementation details (use code comments)
- Temporary workarounds (use TODO comments)
- Bug fixes (use commit messages)
- Routine refactoring (use PR descriptions)

## Status Definitions

- **Proposed:** Decision under discussion, not yet accepted
- **Accepted:** Decision approved and being implemented
- **Deprecated:** Decision no longer recommended, but not yet replaced
- **Superseded:** Decision replaced by a newer ADR (link to replacement)

## Questions?

For questions about these decisions:

1. Read the ADR's "Context" and "Consequences" sections
2. Check related ADRs linked in the "Related" field
3. Review the implementation in the codebase
4. Consult `.agent/VISION.md` for current status

---

**Last Updated:** January 2026  
**Next ADR:** 030
