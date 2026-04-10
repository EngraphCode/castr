# ADR-045: Strict Re-export Module for OpenAPI Types

**Date:** 2026-04-03  
**Status:** Accepted  
**Revised:** 2026-04-10 — Updated to reflect the landed boundary/canonical split, `components.pathItems`/`components.mediaTypes` fidelity, and dependency-exit guards  
**Related:** [ADR-044](./ADR-044-drop-openapi3-ts-adopt-scalar-types.md) (Drop openapi3-ts)

---

## Decision

All OpenAPI type imports throughout the codebase MUST use a single local re-export module at `lib/src/shared/openapi-types.ts`. Product code MUST NOT import OpenAPI types directly from `@scalar/openapi-types` or `openapi3-ts/oas31`.

This module owns the strict seam between vendor types and repo truth. It defines explicit interfaces with named properties only, strips Scalar's general `[key: string]: any` index signature, and applies the spec/runtime corrections we rely on downstream.

The seam is intentionally split into two roles:

1. `OpenAPIInputDocument` is the tolerant boundary type used when accepting parser/upgrader output or other partially validated input.
2. `OpenAPIDocument` is the canonical post-validation document type used downstream after load-time checks.

At this seam we also preserve the OAS 3.2 surfaces that must remain lossless in IR and public APIs:

- `SchemaObject.examples` stays `unknown[]`
- `querystring` remains distinct instead of being coerced to `query`
- content maps may contain `ReferenceObject | MediaTypeObject`
- reusable `components.pathItems` remain ref-capable
- reusable `components.mediaTypes` are modelled explicitly and may be schema-less

## Context

`@scalar/openapi-types` is the right upstream family for OAS 3.2 coverage, but its raw shapes do not line up with our strict downstream needs on their own:

1. **`AnyOtherAttribute` index signature** — Scalar's general `[key: string]: any` signature causes `isReferenceObject()` to narrow incorrectly and collides with `noPropertyAccessFromIndexSignature: true`.
2. **Tolerant raw-input bias** — Scalar intentionally types documents for partially constructed input, which blurs the boundary between unvalidated parser output and canonical documents that our pipeline has already checked.
3. **Seam mismatches and corrected assumptions** — a few high-value surfaces required explicit correction at the seam: `SchemaObject.examples` is raw data, `ResponseObject.description` is optional in the 3.2 surface we now model, `PathItemObject.$ref` exists, and content/media-type maps can carry references.

## Implementation

The re-export module uses hand-written explicit interfaces rather than mapped-type surgery. That choice was forced by Scalar's `Modify<Omit<...>>` composition chains: `RemoveIndexSignature<T>` could not reliably preserve named properties there.

Implementation highlights:

- explicit interfaces remove the general index signature while preserving named properties
- `OpenAPIInputDocument` and `OpenAPIDocument` separate tolerant boundary input from validated canonical truth
- canonical requiredness is restored where we depend on it (`openapi`, `info`, `info.title`, `info.version`, `server.url`)
- seam corrections stay local to the module instead of leaking into IR or public APIs
- a narrow drift harness checks the upstream signals we depend on (`querystring`, ref-capable `content`, `components.mediaTypes`, `PathItemObject.$ref`)
- dependency-exit guard tests keep protected layers off direct vendor imports, the backwards-compatible `OpenAPIObject` alias, and any future `openapi3-ts` reintroduction

### Resolved Schema `examples` Seam Semantics

`SchemaObject.examples` remains `unknown[]` in our explicit seam. The OpenAPI Schema Object inherits the JSON Schema 2020-12 `examples` keyword as an array of raw example values. Example Objects remain confined to the named `examples` maps on parameters, headers, media types, and components. Scalar's schema typing is treated as an upstream mismatch here, not repo truth.

Downstream code must preserve schema example arrays losslessly and must not reinterpret object-shaped raw examples as Example Objects merely because they contain a `value` property.

### Vendor Extension Access

`OpenAPIDocument` keeps a template-literal vendor-extension index signature to support `x-*` access:

```typescript
[ext: `x-${string}`]: unknown
```

This does not recreate the structural overlap problems caused by a general `[key: string]: any` index signature.

## Consequences

### Positive

- correct type-guard narrowing for `isReferenceObject()`
- strict canonical downstream types without weakening the raw input boundary
- lossless handling of `querystring`, schema examples, and media-type references through IR and public surfaces
- single import source for OpenAPI types
- targeted drift protection against upstream `@scalar/openapi-types` changes

### Negative

- explicit interfaces must be maintained manually
- boundary and canonical document roles must be understood separately
- the seam intentionally differs from raw vendor types in a few places, so broad structural assignability is no longer the goal everywhere

### Risks

- **Property drift:** upstream additions still require deliberate review and local updates; the drift harness reduces but does not eliminate this risk.
- **Future vendor mismatches:** additional spec/runtime disagreements may still surface and will need explicit seam decisions.
