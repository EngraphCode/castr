# Plan (Future): Phase 4 — JSON Schema + Post‑3.3 Parity

**Status:** ⚪ Planned  
**Created:** 2026-02-13  
**Last Updated:** 2026-02-13

---

## Goal

After Session 3.3 (strict Zod-layer round-trip) is complete, Phase 4 focuses on:

- JSON Schema (Draft 2020-12) support as a first-class format, and
- parity work that improves strict, lossless transforms without expanding scope prematurely.

This phase must remain strict: no lossy normalization, no permissive fallbacks, fail fast with helpful errors.

---

## Scope (Planned)

- **JSON Schema output** for validation use-cases where JSON Schema is required.
- **JSON Schema input** parsing into IR.
- **Feature-parity alignment** workstream (see `.agent/research/feature-parity/*`).
- **Multi-artefact output separation** when it is required to maintain strict round-trips:
  - “pure schema” outputs must be parseable by schema parsers,
  - metadata outputs must be separate artifacts (not mixed into schema-only streams).

---

## Non-Goals

- Best-effort parsing or “partial success” modes.
- “Preserve in metadata” as a substitute for a lossless IR model + writer support.

---

## References

- `.agent/plans/roadmap.md` (canonical roadmap)
- `.agent/directives/VISION.md`
- `.agent/directives/requirements.md`
- `.agent/directives/RULES.md`
- `.agent/directives/testing-strategy.md`
