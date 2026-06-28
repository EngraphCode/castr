# ADR-048: Compiler-Internal Split — ADR-043 Scope Clarification and Value-Gate

**Status:** Proposed
**Date:** 2026-06-19
**Related:** [ADR-043](./ADR-043-core-vs-companion-workspaces.md) (clarifies its scope), [ADR-023](./ADR-023-ir-based-architecture.md), [ADR-036](./ADR-036-limit-directory-complexity.md), [ADR-037](./ADR-037-strict-architectural-domain-boundaries.md)
**Source research:** `.agent/research/zod-compiler/` · **Forward plan:** `.agent/plans/future/castr-surface-architecture-and-verb-model.md`

---

## Context

A code-level comparison with `gajus/zod-compiler` re-opened a question the team had
treated as settled: should the **compiler itself** split into a lean
`castr-core` package plus format-adapter packages (e.g. `castr-openapi`,
`castr-zod`, `castr-json-schema`), so a consumer wanting only Zod→IR→OpenAPI need
not install heavy dependencies (`ts-morph`, `@modelcontextprotocol/sdk`, `ajv`)?

That question was initially dismissed as "already decided by ADR-043." On
inspection that is **imprecise authority**:

- **ADR-043 rules on compiler-core vs _runtime / transport / framework_
  companions** — typed fetch harnesses, runtime handlers, framework adapters,
  code-first ingestion. It draws the line between the compiler and operational
  layers that _consume_ its output.
- ADR-043 does **not** rule on whether the _compiler itself_ is one package or
  several format-adapter packages behind a stable IR↔adapter contract. That is a
  distinct, still-open question.

Conflating the two produced status-quo bias dressed as principle. The honest
position is **gated, not closed**: judge the split on value, with a written trigger.

The first concrete consumer that would want a lean, embeddable core is the Oak SDK
/ the Phase 5 companion workspaces (ADR-043 §5; the Phase 5 future plan).

## Decision

### 1. Scope clarification (supersedes the relevant scope of ADR-043)

ADR-043's boundary is **compiler-core vs runtime/framework companions**. It does
**not** decide compiler-internal packaging. This ADR explicitly takes up the
compiler-internal-split question; to the extent ADR-043 was read as settling it,
that reading is superseded here. ADR-043 otherwise stands unchanged.

### 2. The compiler-internal split is deferred behind a value-gate

Do **not** split `castr-core` out from the format adapters until **both**:

1. a concrete consumer needs core-without-heavy-deps (the Oak SDK / a companion
   qualifies); **and**
2. the IR↔adapter contract has survived **N (≥2–3) feature cycles unchanged**.

…and **not before**.

### 3. Make the decision answerable before taking it

The prerequisite for judging the split honestly is an **explicit, tested
IR↔adapter contract**. That is exactly what the surface-architecture work delivers:
the `RepresentabilityMap` / `TargetPlan<T>` layer (future plan Phases A–B) turns
the IR↔adapter boundary into a real, exercised API. **You atomise along articulated
contracts, not along a blur.** Surface articulation therefore sequences _before_
this decision; this ADR is not a licence to split now.

## Consequences

### Positive

- A previously-blurred question is now explicit and gated, not silently "decided."
- The cost of _waiting_ is low: internal boundaries are already lint-enforced
  (`eslint-plugin-boundaries`, ADR-036/037) and the seams get exercised by the
  surface-architecture Phases A–B regardless.
- When the gate opens, the split is along a contract that has proven stable, not a
  speculative one.

### Negative / risks

- A split done early would freeze the IR↔adapter contract while it still churns
  (e.g. the `additionalProperties` policy landed the same week as the source
  analysis) — the gate exists precisely to prevent this premature-atomisation risk.
- Monorepo release/versioning overhead is deferred, not avoided, if the gate opens.

### Neutral

- No package layout changes now. Public package truth continues to follow ADR-043
  §3 (core docs describe the core compiler only).

## Alternatives considered

- **Treat ADR-043 as already deciding it (status quo).** Rejected: imprecise
  authority; ADR-043 governs runtime/framework companions, not compiler-internal
  packaging.
- **Split `castr-core` out now.** Rejected: freezes a still-churning IR↔adapter
  contract; premature per the gate's condition 2.
- **Declare it permanently out of scope.** Rejected: the Oak SDK / lean-core
  consumer is a real, foreseeable value driver; closing the door is as dogmatic as
  the status quo it replaces.

## References

- Research: `.agent/research/zod-compiler/`
  (comparison §3 Altitude-2 — why representability belongs in a per-target plan
  layer, not the canonical IR; reasoning trail §4 — the dogma error corrected).
- Forward plan: `.agent/plans/future/castr-surface-architecture-and-verb-model.md`
  (Phases A–B make this decision answerable).
- [ADR-043](./ADR-043-core-vs-companion-workspaces.md) — core vs companion
  workspace model (scope clarified here).
- [ADR-036](./ADR-036-limit-directory-complexity.md),
  [ADR-037](./ADR-037-strict-architectural-domain-boundaries.md) — existing
  lint-enforced internal boundaries (why waiting is cheap).
