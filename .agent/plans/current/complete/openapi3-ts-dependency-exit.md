# openapi3-ts Dependency Exit

**Status:** ~~DEFERRED~~ → **SUPERSEDED by [ADR-044](../../docs/architectural_decision_records/ADR-044-drop-openapi3-ts-adopt-scalar-types.md)**  
**Created:** 2026-04-03  
**Superseded:** 2026-04-03  
**Revised:** 2026-04-10  
**Context:** Historical concern note from the pre-decision stage. The strict seam is now live, `openapi-schema-extensions.d.ts` is deleted, the `openapi3-ts` dependency is removed, the targeted active-surface greps are clean, and the completed closure record now lives in [phase-a2-type-migration.md](./phase-a2-type-migration.md) under the parent [oas-3.2-full-feature-support.md](../../active/oas-3.2-full-feature-support.md).

---

## Historical Concern At Supersession Time

`openapi3-ts` (v4.5.0) provides OAS 3.0/3.1 types only. There is no announced roadmap for OAS 3.2 support. As of April 2026, no third-party OpenAPI type package has credible OAS 3.2 coverage with meaningful ecosystem adoption.

The dependency surface is sprawling: **50+ import sites** across the codebase, importing `SchemaObject`, `OpenAPIObject`, `PathItemObject`, `OperationObject`, `ReferenceObject`, `isReferenceObject`, and many others from `openapi3-ts/oas31`.

At the time this note was written, the repo was using **module augmentation** to extend `openapi3-ts` types with OAS 3.2 fields (via `openapi-schema-extensions.d.ts`). That state is now historical.

## When to Revisit

Revisit this decision when any of the following occur:

1. **`openapi3-ts` releases OAS 3.2 types** — evaluate whether our augmentations can be removed
2. **A credible `oas-types` alternative emerges** — >1,000 weekly downloads, verified type accuracy, runtime guard exports
3. **The augmentation surface exceeds ~20 fields** — at that point we've reimplemented enough of the type surface to justify owning the types entirely
4. **Scalar drops `openapi3-ts` dependency** — removes the junction constraint

## Exit Strategy Options

1. **Wait for upstream** — `openapi3-ts` adds OAS 3.2 support; we remove augmentations
2. **Adopt `oas-types` or equivalent** — if a credible package emerges with Scalar-compatible types
3. **Own the types** — create `@engraph/openapi-types` with complete OAS 3.2 definitions, generated from the spec; potentially contribute upstream

## Historical Mitigation At Supersession Time

- Module augmentation in `openapi-schema-extensions.d.ts` (existing)
- All augmentations are additive optional fields — no existing field types change
- Each augmentation has provenance comments tracing to the OAS 3.2 feature it supports
