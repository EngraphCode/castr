# ADR-044: Drop `openapi3-ts`, Adopt `@scalar/openapi-types` as Canonical OpenAPI Type Source

**Status:** Accepted  
**Date:** 2026-04-03  
**Revised:** 2026-04-10 — Updated to reflect the completed dependency exit, green validation gates, and closed reviewer loop  
**Context:** OAS 3.2 Full Feature Support arc

---

## Decision

Replace `openapi3-ts` (v4.5.0) with the `@scalar/openapi-types` family as the canonical upstream source of OpenAPI type definitions throughout the codebase.

All repo imports of OpenAPI types must route through `lib/src/shared/openapi-types.ts`, not directly through `@scalar/openapi-types`. That local seam owns strictness restoration and seam corrections (see ADR-045).

## Context

The project originally adopted `openapi3-ts` for strict OpenAPI 3.1 type definitions. As the project now targets OAS 3.2.0 as its canonical output version, this dependency became a liability:

1. **No OAS 3.2 support** — `openapi3-ts` does not define OAS 3.2 types (`QUERY` method, `additionalOperations`, hierarchical tags, etc.) and has no announced roadmap for 3.2.
2. **Module augmentation burden** — each OAS 3.2 field required a hand-maintained augmentation in `openapi-schema-extensions.d.ts`, with the augmented types manually verified against the spec.
3. **Minimal runtime surface** — `openapi3-ts` contributes exactly one runtime value: `isReferenceObject` (a trivial `'$ref' in obj` guard). All other imports are `import type`.
4. **Existing Scalar dependency** — `@scalar/openapi-types` is already a direct dependency (v0.6.1) and comes transitively via `@scalar/openapi-parser`. It already defines a complete `OpenAPIV3_2` namespace with all OAS 3.2 features.

## Consequences

### Positive

- **OAS 3.2 coverage for free** — all 3.2 features (`query` method, `additionalOperations`, `TagObject.parent/kind/summary`, `ExampleObject.dataValue/serializedValue`, `XMLObject.nodeType`, etc.) are already defined in the Scalar types
- **No more augmentation file** — `openapi-schema-extensions.d.ts` is deleted; no more manual module augmentation
- **Reduced supply chain** — one fewer third-party dependency
- **Boundary compatibility** — `@scalar/openapi-parser` returns Scalar-typed documents; our types are now in the same type family, eliminating junction types at the parser boundary

### Negative

- **Import path migration** — ~50 files change from `openapi3-ts/oas31` to the new local module
- **Strictness gap** — Scalar's tolerant raw-input shapes required a stricter local seam, explicit interfaces, and a boundary/canonical split instead of direct adoption (see ADR-045)
- **Guard burden** — the strict seam now depends on ongoing dependency-exit guards so protected layers do not drift back to direct vendor imports or the legacy alias paths

## Alternatives Considered

1. **Stay with `openapi3-ts` + augmentation** — cheapest short-term, but grows the augmentation file with every 3.2 feature and manually invents type definitions
2. **Adopt `oas-types`** — immature package, no 3.2 support, incompatible with Scalar parser boundary
3. **Adopt `@scalar/openapi-types` directly (no strict wrapper)** — loses compile-time safety for spec-required fields; rejected in favor of the strict re-export approach (ADR-045)

## Implementation

Implementation status as of 2026-04-10:

1. `lib/src/shared/openapi-types.ts` is live as the central strict re-export module (see ADR-045)
2. the boundary/canonical split is live (`OpenAPIInputDocument` vs `OpenAPIDocument`)
3. the local `isReferenceObject` runtime guard is in place
4. `openapi-schema-extensions.d.ts` is deleted
5. `openapi3-ts` is removed from `lib/package.json`, and the targeted active-surface grep is clean
6. protected layers now fail fast on direct `@scalar/openapi-types` imports, the backwards-compatible `OpenAPIObject` alias, and any future `openapi3-ts` reintroduction
