# ADR-049: Support a Single Node Runtime (Node 24) and Single-Source the Version

**Status:** Accepted
**Date:** 2026-06-21
**Related:** [ADR-007](./ADR-007-esm-with-nodenext-resolution.md) (runtime/module posture) · [ADR-050](./ADR-050-single-workspace-typescript-override.md) (single workspace TypeScript) · **Mechanism:** `engines.node`, `@types/node`, `.nvmrc` (D2 lane), CI `node-version` · **Decision:** Q-006 (owner, 2026-06-21)

---

## Context

castr declares `engines.node: "24.x"` and its CI tests only Node 24, but
`@types/node` had drifted to `^26` — two majors ahead of the runtime.

`@types/node` is the type surface castr's **own source** type-checks against.
When it sits ahead of the runtime, `tsc` blesses Node 25/26 APIs that would
throw `is not a function` on the Node 24 that castr ships to consumers. For a
library whose entire purpose is the type-checker **honestly describing
reality** (the founding fail-fast / IR-honesty principle: surface a mismatch,
never silently permit), a dev type surface describing a _different_ runtime
than the one shipped is a type-fidelity hole — the principle inverted.

The practice-transplant thread had explicitly deferred "engines.node
semantics" to this ADR slot (049); this ADR fills it.

## Decision

castr supports a **single Node runtime: Node 24** — the version it declares
and tests. The Node major is **single-sourced** across every surface that
encodes it:

- `engines.node`: `24.x`
- `@types/node`: `^24` — the type surface must describe the **shipped** runtime,
  never one ahead of it
- `.nvmrc`: `24` (lands with the D2 node-version-single-source lane)
- CI `node-version`: derived from `.nvmrc` (D2)

Corollaries:

- **Do not chase the latest `@types/node` major.** `@types/node@24.x` still
  receives patch-level fixes for the Node 24 surface; a newer major adds only
  the risk of permitting APIs absent from the shipped runtime, never value —
  castr cannot use a Node 26 API without breaking on Node 24.
- **Raising the supported Node major is a deliberate, ADR-amending act:** bump
  `engines`, `@types/node`, `.nvmrc`, and CI **together**, gated by a green test
  run on the new major.
- **Supporting a range (`>=24`) requires a CI Node-version matrix first** that
  proves the newer majors pass. Absent that matrix, declare exactly what is
  tested — a single major.

## Consequences

- The type-checker becomes a genuine runtime guardrail: code using an API newer
  than Node 24 fails `type-check`, surfacing the mismatch at authoring time
  rather than at a consumer's runtime.
- Reverses the DC6 `@types/node` 25→26 bump (a sanctioned roll-forward — revert
  a bad bump with a forward commit); see
  `.agent/plans/current/dependency-currency.md`.
- One surface-set to change on any future Node bump; no silent drift between
  "what the type-checker believes about Node" and "what Node castr runs."
