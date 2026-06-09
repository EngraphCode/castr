# No Type Shortcuts

Operationalises [`principles.md` §Type System Discipline](../directives/principles.md):
never use type-system escape hatches (`any`, `as any`, `@ts-ignore`,
`@ts-expect-error`, unsafe `as` assertions), never widen types, preserve
maximum type information, and validate at external boundaries.

castr enforces part of this structurally via the repo-local
`type-assertion-policy` ESLint rule (`lib/eslint-rules/`); the rest is
review-time discipline per `principles.md`.

Origin: Oak ADR-034 (System Boundaries and Type Assertions) and ADR-038
(Compilation Time Revolution) — cross-host; castr's ADRs with those
numbers are unrelated decisions.
