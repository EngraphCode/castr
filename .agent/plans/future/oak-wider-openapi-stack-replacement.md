# Plan (Future): Oak Wider OpenAPI Stack Replacement

**Status:** ⚪ Planned
**Created:** 2026-04-02
**Related:** [roadmap.md](../roadmap.md), [phase-5-ecosystem-expansion.md](./phase-5-ecosystem-expansion.md), [oak-castr-integration-report.md](../../research/oak-open-curriculum-sdk/oak-castr-integration-report.md), [ADR-043](../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)

---

## User Impact To Optimize For

Shrink Oak's OpenAPI third-party surface beyond the initial adapter wedge, while keeping the product boundary explicit about what stays in core and what remains an external or companion-workspace concern.

---

## Goal

Define the high-level plan for **Use Case 2**: replace the wider OpenAPI-related third-party stack in `oak-mcp-ecosystem` after the adapter boundary is proven, with an explicit decision gate for `openapi-fetch`.

---

## Scope

### In Scope

- replacing the remaining build-time OpenAPI dependency surface in `oak-mcp-ecosystem`, especially:
  - `openapi3-ts`
  - `openapi-typescript`
  - any residual OpenAPI codegen/build-time adapters beyond Use Case 1
- proving that Castr's core compiler outputs are good enough for Oak's codegen and SDK build workflows
- making an explicit product decision about `openapi-fetch`:
  - remain external and interoperate cleanly, or
  - move into a lightweight companion workspace
- documenting the resulting migration contract and dependency boundary honestly

### Out Of Scope

- replacing `oak-openapi` and its code-first generation stack
- moving typed transport/runtime helpers into core `@engraph/castr`
- treating the `openapi-fetch` decision as implicitly resolved without an explicit recorded outcome

---

## Dependencies

- [oak-adapter-boundary-replacement.md](./oak-adapter-boundary-replacement.md) should be proven first; this arc assumes the first Oak boundary is already replaced.
- OAS 3.2 core truth must remain honest; do not claim wider Oak replacement on a 3.1-only surface.

---

## Assumptions To Validate

- Oak's wider build-time OpenAPI stack can be simplified without requiring Castr to own the runtime client.
- `openapi-typescript` replacement is either necessary or clearly avoidable through a documented alternative; do not assume one answer before the proof work.
- The `openapi-fetch` choice can stay as an explicit decision gate without blocking the rest of the build-time replacement analysis.
- Downstream acceptance for this arc should be measured at the workspace/repo level, not only by unit fixture parity.

---

## Success Criteria

- The targeted OpenAPI build-time third-party libraries are removable from `oak-mcp-ecosystem`, or any retained dependency is explicitly justified as outside Castr's chosen scope.
- The `openapi-fetch` decision is recorded explicitly:
  - external interop with a documented contract, or
  - companion workspace direction with its own follow-on plan.
- Oak's codegen and SDK workflows continue to build and type-check on the chosen replacement surface.
- The plan stack and durable docs continue to preserve the core-vs-companion boundary with no ambiguity about runtime ownership.

---

## TDD / Proof Order

1. **RED:** capture the exact remaining dependency inventory and the generated/build-time surfaces Oak still consumes.
2. **RED:** add or mirror contract proofs for the TypeScript/OpenAPI artefacts Oak expects after Use Case 1.
3. **DECIDE:** resolve the `openapi-fetch` boundary explicitly before implementation starts to drift across it.
4. **GREEN:** land the smallest core and/or companion changes required by the chosen boundary.
5. **GREEN:** prove the replacement through downstream Oak acceptance.

---

## Documentation Outputs

- a recorded `openapi-fetch` boundary decision in durable docs or a dedicated follow-on plan
- roadmap / Phase 5 references when this plan becomes active or completes
- Oak-facing migration notes describing what dependencies were removed and what remains external by design

---

## Execution Trigger

Promote this future plan into `current/` only after:

- the adapter boundary replacement is proven, and
- the user explicitly chooses to start the wider Oak replacement arc.

If the `openapi-fetch` decision creates a separate companion implementation track, split that into its own atomic plan rather than overloading this file.
