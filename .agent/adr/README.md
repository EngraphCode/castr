# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the openapi-zod-client modernization project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its context and consequences. It helps us understand why decisions were made and what trade-offs were considered.

## Format

Each ADR follows this structure:

```markdown
# ADR-XXX: Title

## Status

[Accepted | Proposed | Deprecated | Superseded]

## Context

What is the issue we're addressing? What are the forces at play?

## Decision

What did we decide? Why?

## Consequences

What becomes easier or more difficult as a result of this decision?
```

## Index

### Core Philosophy

- [ADR-001: Fail Fast on Spec Violations](./ADR-001-fail-fast-spec-violations.md) - **Accepted**
- [ADR-002: Defer Types to openapi3-ts](./ADR-002-defer-types-to-openapi3-ts.md) - **Accepted**
- [ADR-003: Type Predicates Over Boolean Filters](./ADR-003-type-predicates-over-boolean-filters.md) - **Accepted**

### Code Quality & Testing

- [ADR-004: Pure Functions and Single Responsibility](./ADR-004-pure-functions-single-responsibility.md) - **Accepted**
- [ADR-005: Enum Complexity Calculation](./ADR-005-enum-complexity-calculation.md) - **Accepted**
- [ADR-006: No Unused Variables Policy](./ADR-006-no-unused-variables-policy.md) - **Accepted**

### Tooling & Build

- [ADR-007: ESM with NodeNext Module Resolution](./ADR-007-esm-with-nodenext-resolution.md) - **Accepted**
- [ADR-008: Replace cac with commander](./ADR-008-replace-cac-with-commander.md) - **Accepted**
- [ADR-009: Replace Preconstruct with tsup](./ADR-009-replace-preconstruct-with-tsup.md) - **Accepted**
- [ADR-010: Use Turborepo for Monorepo Orchestration](./ADR-010-use-turborepo.md) - **Accepted**

### Validation & Testing Infrastructure

- [ADR-011: AJV for Runtime OpenAPI Validation](./ADR-011-ajv-runtime-validation.md) - **Accepted**
- [ADR-012: Remove Playground and Examples Workspaces](./ADR-012-remove-playground-examples.md) - **Accepted**

---

## Timeline

- **October 22-24, 2025**: Phase 1 - Developer Tooling Modernization
  - ADR-001 through ADR-012 accepted
  - 297 tests passing
  - Zero TypeScript errors

## Status Legend

- **Proposed**: Decision is under discussion
- **Accepted**: Decision is accepted and implemented
- **Deprecated**: Decision is no longer relevant
- **Superseded**: Decision has been replaced by a newer ADR (with reference)

## Contributing

When making significant architectural decisions:

1. Create a new ADR with the next number
2. Follow the template format
3. Update this README index
4. Commit the ADR with the implementation


