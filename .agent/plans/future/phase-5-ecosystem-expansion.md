# Plan (Future): Phase 5 — Ecosystem Expansion (tRPC, SDK Workspace, HTTP Adapters)

**Status:** ⚪ Planned  
**Created:** 2026-02-13  
**Last Updated:** 2026-02-13

---

## Goal

Expand beyond the strict core transforms into ecosystem integrations while preserving repo doctrine:

- strict, lossless, deterministic transforms,
- fail fast with helpful errors,
- no escape hatches.

---

## Scope (Planned)

- **tRPC ↔ IR**:
  - parse Zod from routers into IR,
  - emit OpenAPI + helpers from IR.
- **SDK workspace / reference implementation**:
  - demonstrate how to assemble building blocks into a production SDK,
  - keep it separate from the core library.
- **Optional HTTP client adapter interfaces and examples**:
  - adapter-based integration that does not bundle a specific HTTP client in core.

---

## References

- `.agent/plans/roadmap.md` (canonical roadmap)
- `.agent/directives/VISION.md`
- `.agent/directives/requirements.md`
- `docs/architectural_decision_records/ADR-022-building-blocks-no-http-client.md`
- `docs/architectural_decision_records/ADR-025-http-client-di-integration.md`
