# ADR-044: Drop `openapi3-ts`, Adopt `@scalar/openapi-types` as Canonical OpenAPI Type Source

**Status:** Accepted  
**Date:** 2026-04-03  
**Context:** OAS 3.2 Full Feature Support arc

---

## Decision

Replace `openapi3-ts` (v4.5.0) with `@scalar/openapi-types` as the canonical source of OpenAPI type definitions throughout the codebase.

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
- **Strictness gap** — Scalar types make ~8 spec-required fields optional (see ADR-045 for mitigation)

## Alternatives Considered

1. **Stay with `openapi3-ts` + augmentation** — cheapest short-term, but grows the augmentation file with every 3.2 feature and manually invents type definitions
2. **Adopt `oas-types`** — immature package, no 3.2 support, incompatible with Scalar parser boundary
3. **Adopt `@scalar/openapi-types` directly (no strict wrapper)** — loses compile-time safety for spec-required fields; rejected in favor of the strict re-export approach (ADR-045)

## Implementation

1. Create `lib/src/shared/openapi-types.ts` — central strict re-export module (see ADR-045)
2. Replace all `openapi3-ts/oas31` imports with the local module across ~50 files
3. Provide a local `isReferenceObject` runtime guard
4. Delete `openapi-schema-extensions.d.ts`
5. Remove `openapi3-ts` from `package.json`
