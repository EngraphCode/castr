# Plan (Future): Phase 5 — Companion Workspace Expansion

**Status:** ⚪ Planned  
**Created:** 2026-02-13  
**Last Updated:** 2026-04-02

> **Update 2026-04-02:** Older wording grouped tRPC, SDK work, and HTTP adapters under a loose "ecosystem expansion" label. The current boundary is explicit: `lib` / `@engraph/castr` stays the core compiler, while code-first, transport, runtime, and framework capabilities live in companion workspaces that consume Castr output.

---

## Goal

Expand beyond the strict core compiler into companion workspaces and reference implementations while preserving repo doctrine:

- strict, lossless, deterministic transforms,
- fail fast with helpful errors,
- no escape hatches.

---

## Scope (Planned)

- **Companion code-first integrations**:
  - ingest tRPC or equivalent authored-operation sources into Castr IR
  - emit OpenAPI and related metadata from that companion layer without turning those authoring models into core `lib` format promises
- **Companion transport/runtime workspaces**:
  - typed fetch harnesses
  - framework handlers / middleware adapters
  - lightweight runtime exposure packages that consume Castr metadata and generated artefacts
- **Reference implementations and adoption proofs**:
  - demonstrate end-to-end composition without widening core `@engraph/castr`
  - prove the Oak adoption ladder: adapter replacement, wider OpenAPI-stack replacement, then `oak-openapi` generation-stack replacement

## Planned Use-Case Tracks

- [oak-adapter-boundary-replacement.md](./oak-adapter-boundary-replacement.md)
  - Use Case 1 high-level plan: replace Oak's `openapi-zod-client-adapter` boundary with honest core Castr outputs and downstream proof.
- [oak-wider-openapi-stack-replacement.md](./oak-wider-openapi-stack-replacement.md)
  - Use Case 2 high-level plan: replace the wider OpenAPI third-party stack in `oak-mcp-ecosystem`, including an explicit `openapi-fetch` decision gate.
- [oak-code-first-openapi-generation-replacement.md](./oak-code-first-openapi-generation-replacement.md)
  - Use Case 3 high-level plan: replace `oak-openapi`'s code-first OpenAPI generation stack through companion-workspace layering.

## Out Of Scope

- adding typed clients, HTTP adapters, runtime handlers, or framework bindings directly to core `@engraph/castr`
- treating companion-workspace ideas as core-format promises for `lib`

---

## References

- `.agent/plans/roadmap.md` (canonical roadmap)
- `.agent/directives/VISION.md`
- `.agent/directives/requirements.md`
- `docs/architectural_decision_records/ADR-022-building-blocks-no-http-client.md`
- `docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md`
- `docs/architectural_decision_records/ADR-025-http-client-di-integration.md`
- `.agent/research/oak-open-curriculum-sdk/oak-castr-integration-report.md`
- `.agent/research/oak-openapi/oak-openapi-castr-replacement-report.md`
- `.agent/plans/future/oak-adapter-boundary-replacement.md`
- `.agent/plans/future/oak-wider-openapi-stack-replacement.md`
- `.agent/plans/future/oak-code-first-openapi-generation-replacement.md`
