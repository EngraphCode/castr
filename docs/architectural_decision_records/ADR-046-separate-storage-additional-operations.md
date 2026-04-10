# ADR-046: Separate Storage for `additionalOperations` on `CastrDocument`

**Date:** 2026-04-03  
**Status:** Accepted  
**Revised:** 2026-04-10 — Promoted from directive-only capture into the durable ADR docs set during the post-Phase A₂ consolidation pass  
**Related:** [ADR-044](./ADR-044-drop-openapi3-ts-adopt-scalar-types.md), [ADR-045](./ADR-045-strict-reexport-module-openapi-types.md)

---

## Decision

OAS 3.2 `additionalOperations` (custom-method operations) will be stored in a dedicated field on `CastrDocument`, separate from the existing `operations` array.

## Context

OAS 3.2 introduces `additionalOperations` on `PathItemObject` — a map of `Record<string, OperationObject>` for custom HTTP methods beyond the standard set (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`, `TRACE`, `QUERY`).

Two storage strategies were evaluated.

### Option A: Fold into existing `operations` array (rejected)

Extend `IRHttpMethod` to include a `string` branch (for example, `'custom:PURGE'`) and store custom operations alongside standard ones.

This was rejected because:

1. it breaks `IRHttpMethod` type safety; the union becomes open-ended, so exhaustiveness checks, `VALID_HTTP_METHODS`, path-item setters, and sorting logic all degrade
2. writers would have to reconstruct which operations belong in `additionalOperations` versus `pathItem[method]`, which is error-prone and weakens round-trip fidelity
3. it contaminates existing validation logic that assumes a closed standard-method set

### Option B: Separate storage (accepted)

Add a dedicated `additionalOperations` field to `CastrDocument` (or equivalent per-path structure).

This was accepted because:

1. `IRHttpMethod` stays a closed union and keeps its exhaustiveness/value guarantees
2. writers know exactly which operations emit into `additionalOperations`, preserving lossless round-trip behaviour
3. custom method names can be validated separately (non-empty, no overlap with standard methods)
4. an `allOperations(doc)` helper can still provide convenient combined iteration for consumers that need both standard and custom operations

## Consequences

### Positive

- standard operations and custom operations keep distinct storage and validation paths
- the writer can emit `additionalOperations` exactly where the spec expects it
- consumers that only care about standard methods keep their existing behaviour unchanged

### Negative

- consumers that need all operations must call a helper or combine two collections explicitly
- validation logic for custom methods is separate and must be maintained alongside the standard-method path

### Risks

- if future work blurs the distinction between standard and custom methods, the split model will need discipline to stay lossless and easy to reason about
