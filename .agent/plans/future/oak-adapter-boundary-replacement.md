# Plan (Future): Oak Adapter Boundary Replacement

**Status:** ⚪ Planned
**Created:** 2026-04-02
**Related:** [roadmap.md](../roadmap.md), [phase-5-ecosystem-expansion.md](./phase-5-ecosystem-expansion.md), [oak-castr-integration-report.md](../../research/oak-open-curriculum-sdk/oak-castr-integration-report.md), [ADR-043](../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)

---

## User Impact To Optimize For

Give Oak a first concrete adoption path that proves Castr can replace a real OpenAPI tool boundary without widening core scope or relying on Zod 3 bridges, string rewrites, or hidden compatibility layers.

---

## Goal

Define the high-level plan for **Use Case 1**: replace `oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter` end to end with honest Castr-owned core outputs and a downstream acceptance proof.

This is the first external proving ladder for Castr, but it must still remain a general schema/compiler product plan rather than an Oak-specific architectural fork.

---

## Scope

### In Scope

- core compiler surfaces Oak actually needs from this boundary:
  - native Zod 4 output
  - endpoint metadata generation
  - explicit `operationId` visibility or an equivalent documented contract
  - deterministic generated registries and helper maps
  - strict failure where Oak currently relies on empty-schema fallbacks
  - path-format policy where Oak-facing outputs need it
- representative downstream acceptance fixtures proving that the generated schema and metadata surfaces are sufficient for Oak's build-time workflows
- migration-contract documentation for the generated surfaces Castr expects Oak to consume

### Out Of Scope

- replacing `openapi-fetch` or defining a runtime HTTP harness
- replacing the wider Oak OpenAPI dependency stack outside the adapter boundary
- replacing `oak-openapi` or introducing code-first ingestion into core `@engraph/castr`
- Oak-specific parser hacks, compatibility wrappers, or byte-for-byte cloning of current fragile output where a cleaner documented contract is sufficient

---

## Dependencies

- [oas-3.2-version-plumbing.md](../current/complete/oas-3.2-version-plumbing.md) is already complete; keep Oak boundary work aligned to that canonical 3.2.0 baseline instead of reopening version-plumbing questions.
- Any additional OAS 3.2 feature work should be pulled in only when a concrete Oak fixture requires it.

---

## Assumptions To Validate

- Oak can migrate to an `operationId`-centred metadata contract rather than depending on generic alias naming.
- Oak does not require a byte-for-byte clone of the current generated file layout as long as the consumed surfaces stay deterministic and documented.
- The first replacement proof can stay within the core compiler boundary; no runtime/client companion workspace is required for Use Case 1.
- Representative fixture proof in Castr plus one real downstream acceptance run in Oak is enough to claim the adapter boundary is replaced.

---

## Success Criteria

- `oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter` can be deleted or reduced to a trivial import shim on the path to deletion.
- No package-level Zod 3 requirement remains in `oak-mcp-ecosystem`.
- Castr provides the schema output plus endpoint metadata that Oak's codegen/build path actually consumes.
- Generated output is deterministic across repeated runs on representative Oak fixtures.
- Downstream build, type-check, and test proof is green in Oak, or an equivalent mirrored acceptance suite exists and is green.
- Docs and plan surfaces describe the migration contract honestly, including any shape differences Oak must adopt.

---

## TDD / Proof Order

1. **RED:** add contract tests for the generated schema and endpoint-metadata surfaces Oak requires.
2. **RED:** add determinism and ordering proofs for the exported registries/maps and any path-format expectations.
3. **GREEN:** implement the smallest core changes needed to satisfy the contract without widening the core boundary.
4. **GREEN:** prove the migration in Oak or a faithful mirrored acceptance harness.
5. **REFACTOR / DOCS:** tighten naming, remove transitional wording, and update durable docs once the contract is stable.

---

## Documentation Outputs

- roadmap / Phase 5 references when this plan is promoted or completed
- Oak-facing migration contract note or durable research update
- session-entry and napkin updates when execution status changes

---

## Execution Trigger

Promote this future plan into `current/` only after:

- the OAS 3.2 version-plumbing slice remains closed rather than being reopened inside the Oak boundary track, and
- the user explicitly chooses to start the Oak adapter replacement arc.

If Oak proves it needs more than one atomic slice, break that execution into smaller current plans while keeping this file as the high-level use-case home.
