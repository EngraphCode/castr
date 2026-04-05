# ADR-044: Drop openapi3-ts, Adopt @scalar/openapi-types

**Date:** 2026-04-03  
**Status:** Accepted  
**Supersedes:** [ADR-002](./ADR-002-defer-types-to-openapi3-ts.md) (Defer Types to openapi3-ts)  
**Related:** [ADR-045](./ADR-045-strict-reexport-module-openapi-types.md) (Strict Re-export Module)

---

## Context

The codebase has relied on `openapi3-ts/oas31` as its canonical source of OpenAPI type definitions since ADR-002. This dependency does not provide OAS 3.2 types, which are required for the OAS 3.2 Full Feature Support workstream.

`@scalar/openapi-types` is already a direct dependency (via `@scalar/openapi-parser` used in the shared preparation boundary). It provides a complete `OpenAPIV3_2` namespace that includes all 3.2 additions (`additionalOperations`, hierarchical tags, `itemSchema`, `dataValue`/`serializedValue`, OAuth2 Device flow, XML `nodeType`).

Maintaining both `openapi3-ts` and `@scalar/openapi-types` would create a split type system — two independent representations of the same domain — which violates the single-source-of-truth principle for type definitions.

## Decision

Drop `openapi3-ts` entirely. Adopt `@scalar/openapi-types` `OpenAPIV3_2` namespace as the sole source of OpenAPI type definitions.

All imports of OpenAPI types will be routed through a single internal re-export module (`lib/src/shared/openapi-types.ts`) rather than imported directly from `@scalar/openapi-types`. This provides a single seam for type narrowing and future migration (see ADR-045).

## Consequences

### Positive

- Unblocks all OAS 3.2 feature work — no module augmentation needed for new 3.2 fields
- Eliminates the `openapi-schema-extensions.d.ts` module augmentation hack
- Single type system across the parser boundary (Scalar parser output types match our internal types)
- Reduces dependency count

### Negative

- Breaking change for any consumer that relied on `openapi3-ts` type identity (currently internal-only)
- Scalar makes all fields optional for user-input tolerance, requiring intersection narrowing to restore spec-required fields (addressed by ADR-045)
- Minor naming differences (`OpenAPIObject` → `Document`, `XmlObject` → `XMLObject`) require a one-time migration

### Risks

- If Scalar's type definitions diverge from the OAS spec, we inherit that divergence. Mitigated by the re-export module seam, which can apply corrections.
