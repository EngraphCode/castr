# Plan (Future): Phase 4 — JSON Schema + Post‑3.3 Parity

**Status:** ⚪ Planned  
**Created:** 2026-02-13  
**Last Updated:** 2026-02-13

---

## Exploration Goal: Determine the Desired Impact

Before writing code for Phase 4, the **first objective** is to deeply explore what the desired impact of JSON Schema support and Parity alignment will be.
Do not blindly implement; instead, define _rigorous_, _measurable_, and _impact-focused_ acceptance criteria that surpass the quality of previous examples (e.g., those in `.agent/acceptance-criteria/`).

The exploration must answer:

1. **Lossless Translation**: How exactly do JSON Schema 2020-12 nuances diverge from Zod and OpenAPI 3.1.0, and what is the mapping strategy to the IR?
2. **Feature Parity**: What are the high-value edge cases in the ecosystem alignment research that need test fixtures?
3. **Outcome Definition**: What does "done" look like from the perspective of an external SDK depending on Castr?

Once the exploration is complete, establish the Acceptance Criteria in a new or updated document in `.agent/acceptance-criteria/`. Only then should implementation begin.

---

## Phase 4 Objectives

After Session 3.3 (strict Zod-layer transform validation with sample input) is complete, Phase 4 focuses on:

- JSON Schema (Draft 2020-12 / Draft 07) support as a first-class format.
- Parity work that improves strict, lossless transforms without expanding scope prematurely.

This phase must remain strict: no lossy normalization, no permissive fallbacks, fail fast with helpful errors.

---

## Scope (Planned)

- **JSON Schema output** for validation use-cases where JSON Schema is required.
- **JSON Schema input** parsing into IR.
- **Feature-parity alignment** workstream (see `.agent/research/feature-parity/*`).
- **Multi-artefact output separation** when it is required to maintain strict transform validation paths (including round-trip/idempotence proofs):
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
