# Use Result Pattern

Operationalises [`principles.md` §Strict-By-Default and Fail-Fast](../directives/principles.md)
error handling. Origin: Oak rule `use-result-pattern` (Oak ADR-088,
cross-host), brought 2026-07-03 under the Q-010 owner ruling and
reconciled to castr's fail-fast doctrine.

Use `Result<T, E>` for expected error paths on library surfaces.
Errors are part of the type signature; the compiler ensures every
case is handled. Handle all cases explicitly.

## Result and Fail-Fast Compose

Owner ruling (2026-07-03, Q-010): **"Result in no way precludes fail
fast, `Result<T, E>` IS the correct pattern, and fail fast is
absolutely required everywhere."** The two compose:

- `Result<T, E>` models the **expected error channel** — parse
  failures, unrepresentable output mappings, validation rejections —
  with compiler-enforced exhaustive handling.
- **Fail-fast governs behaviour**: an error `Result` is a first-class,
  immediate, loud failure signal. Constructing one is failing fast.
  Consumers handle or propagate it — never swallow it, never default
  it away, never convert it into partial success.
- Throwing remains correct where `principles.md` requires it:
  assertion of impossible states, trust-boundary violations, and any
  surface that cannot return `Result`. The `Result` examples in
  `principles.md` stand alongside its fail-fast examples.

The earlier "castr is fail-fast, therefore no Result" framing is
**retired** (it was a false dichotomy — see the Q-010 record). Do not
reintroduce it in code review, plans, or doctrine.

## Causal-Chain Discipline

When a constructed error must leave a boundary (a trust edge, a
surface that cannot return `Result`, or a `catch` block re-expressing
a caught error), attach `{ cause }` so the causal chain is preserved.

This is compile-time-enforced in both workspaces by ESLint core's
[`preserve-caught-error`](https://eslint.org/docs/latest/rules/preserve-caught-error)
rule at `error` severity with `requireCatchParameter: true`
(`lib/eslint.config.ts` base rules; `agent-tools/eslint.config.ts`).
A legitimate pass-through uses
`// eslint-disable-next-line preserve-caught-error -- <reason>` with
a real reason, per [`never-disable-checks`](never-disable-checks.md).
