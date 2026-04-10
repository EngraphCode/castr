# ADR-044: Drop openapi3-ts, Adopt @scalar/openapi-types

**Date:** 2026-04-03  
**Status:** Accepted  
**Revised:** 2026-04-10 — Updated to reflect the completed dependency exit, green validation gates, and closed reviewer loop  
**Supersedes:** [ADR-002](./ADR-002-defer-types-to-openapi3-ts.md) (Defer Types to openapi3-ts)  
**Related:** [ADR-045](./ADR-045-strict-reexport-module-openapi-types.md) (Strict Re-export Module)

---

## Context

The codebase has relied on `openapi3-ts/oas31` as its canonical source of OpenAPI type definitions since ADR-002. This dependency does not provide OAS 3.2 types, which are required for the OAS 3.2 Full Feature Support workstream.

`@scalar/openapi-types` is already a direct dependency (via `@scalar/openapi-parser` used in the shared preparation boundary). It provides a complete `OpenAPIV3_2` namespace that includes all 3.2 additions (`additionalOperations`, hierarchical tags, `itemSchema`, `dataValue`/`serializedValue`, OAuth2 Device flow, XML `nodeType`).

Maintaining both `openapi3-ts` and `@scalar/openapi-types` would create a split type system — two independent representations of the same domain — which violates the single-source-of-truth principle for type definitions.

## Decision

Drop `openapi3-ts` entirely. Adopt the `@scalar/openapi-types` family, centred on the `OpenAPIV3_2` namespace, as the sole upstream source of OpenAPI type definitions.

All imports of OpenAPI types will be routed through a single internal re-export module (`lib/src/shared/openapi-types.ts`) rather than imported directly from `@scalar/openapi-types`. This provides a single seam for type narrowing and future migration (see ADR-045).

## Consequences

### Positive

- Unblocks all OAS 3.2 feature work — no module augmentation needed for new 3.2 fields
- Eliminates the `openapi-schema-extensions.d.ts` module augmentation hack
- Single type system across the parser boundary (Scalar parser output types match our internal types)
- Reduces dependency count

### Negative

- Breaking change for any consumer that relied on `openapi3-ts` type identity (currently internal-only)
- Scalar's tolerant raw-input shapes required a stricter local seam, explicit interfaces, and a boundary/canonical split rather than direct adoption (addressed by ADR-045)
- Minor naming differences (`OpenAPIObject` → `Document`, `XmlObject` → `XMLObject`) require a one-time migration
- The migration adds a durable seam and dependency-exit guard burden that must stay maintained as upstream vendor types evolve

### Risks

- If Scalar's type definitions diverge from the OAS spec, we inherit that divergence. Mitigated by the re-export module seam, which can apply corrections.

## Implementation Status

As of 2026-04-10:

1. the strict re-export module is live at `lib/src/shared/openapi-types.ts`
2. the boundary/canonical split is live (`OpenAPIInputDocument` vs `OpenAPIDocument`)
3. the stale `openapi-schema-extensions.d.ts` augmentation file is deleted
4. the `openapi3-ts` dependency is removed from `lib/package.json`, and the targeted active-surface grep is clean
5. protected layers now fail fast on direct `@scalar/openapi-types` imports, the backwards-compatible `OpenAPIObject` alias, and any future `openapi3-ts` reintroduction
