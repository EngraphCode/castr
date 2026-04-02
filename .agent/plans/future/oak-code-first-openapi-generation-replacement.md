# Plan (Future): Oak Code-First OpenAPI Generation Replacement

**Status:** ⚪ Planned
**Created:** 2026-04-02
**Related:** [roadmap.md](../roadmap.md), [phase-5-ecosystem-expansion.md](./phase-5-ecosystem-expansion.md), [oak-castr-integration-report.md](../../research/oak-open-curriculum-sdk/oak-castr-integration-report.md), [oak-openapi-castr-replacement-report.md](../../research/oak-openapi/oak-openapi-castr-replacement-report.md), [ADR-043](../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)

---

## User Impact To Optimize For

Give Castr a credible path to replace `oak-openapi`'s code-first OpenAPI publishing stack with a cleaner architecture that preserves trustworthy docs value without collapsing framework/runtime concerns into core.

---

## Goal

Define the high-level plan for **Use Case 3**: replace the OpenAPI-generation libraries in `oak-openapi` through companion-workspace or equivalent layered capabilities for code-first ingestion, document publication, docs-friendly metadata, and an explicit runtime-exposure story.

---

## Scope

### In Scope

- a companion-workspace or equivalent layer for authored-operation ingestion (tRPC or a cleaner successor shape)
- structured ingestion of Zod metadata, examples, tags, and security information where needed for published OpenAPI output
- generation of a trustworthy OAS 3.2 document with stable refs, descriptions, examples, and tags
- docs/playground-friendly metadata outputs where parsing raw OpenAPI alone is too brittle
- an explicit runtime boundary decision:
  - companion runtime adapter, or
  - documented composition with an external/Oak-side runtime layer

### Out Of Scope

- treating tRPC or framework authoring models as new core formats for `@engraph/castr`
- forcing Oak's current Babel/AST rewrite mechanism into Castr's architecture
- broad framework/runtime promises beyond the specifically chosen companion boundary
- widening the first Oak adapter replacement plan with code-first generation work

---

## Dependencies

- Core OAS 3.2 output truth must be settled first.
- This plan should usually follow [oak-adapter-boundary-replacement.md](./oak-adapter-boundary-replacement.md), even if discovery or prototype work starts earlier.
- Any runtime adapter chosen here must respect ADR-043 and live outside core `@engraph/castr`.

---

## Assumptions To Validate

- Oak may not need a tRPC-shaped public contract forever; a cleaner authored-operation model could still satisfy the real use case.
- Docs/playground consumers may be better served by dedicated metadata artefacts than by raw OpenAPI traversal alone.
- The runtime-exposure story can be kept explicit and layered rather than smuggled into the document-generation surface.
- A subset proof on one or two handler groups is enough to validate the direction before scaling out.

---

## Success Criteria

- A representative `oak-openapi`-style codebase can publish a valid OAS 3.2 document without `trpc-to-openapi` and `zod-openapi`.
- Examples, descriptions, refs, tags, and schema naming are stable enough for docs and tests to trust.
- The runtime exposure story is explicit: companion-owned or external composition, with no ambiguity.
- The plan and doc stack remain honest that this is a companion-workspace/code-first programme, not a core compiler format promise.

---

## TDD / Proof Order

1. **RED:** capture representative handler-group fixtures and the code-authored metadata they must preserve.
2. **RED:** prove document-generation expectations first: OAS 3.2 validity, stable refs, examples, tags, and schema naming.
3. **RED:** prove the docs/playground metadata surface or runtime-composition seam needed for real Oak consumption.
4. **GREEN:** implement the smallest companion/workspace layer that satisfies the proven contract.
5. **GREEN:** expand from subset proof to a broader `oak-openapi` replacement slice only after the first proof is stable.

---

## Documentation Outputs

- durable companion-workspace contract docs for the chosen authoring and runtime boundaries
- roadmap / Phase 5 references when this plan is promoted or completed
- Oak-facing migration notes covering the replacement of `trpc-to-openapi`, `zod-openapi`, and any supporting generation hacks

---

## Execution Trigger

Promote this future plan into `current/` only after:

- the user explicitly chooses to start the code-first generation programme, and
- the runtime boundary decision is ready to be kept explicit from the start.

If this programme splits into separate authoring-ingestion and runtime-adapter tracks, create separate atomic plans under `current/` while keeping this file as the high-level Use Case 3 home.
