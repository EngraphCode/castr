# Plan: Test Hygiene (no IO / no global-state mutation in in-process tests)

**Status:** Backlog (remediation) · **Findings:** M4, M5, H7 · **Risk:** Low
**References:** report `07-test-quality-and-proof-gaps.md`; `testing-strategy.md` (integration tests do not trigger IO; no global-state mutation; no partial-proof posture); `parsers/zod/zod-parser.runner.integration.test.ts`, `shared/utils/logger.test.ts`

---

## User impact

Two in-process tests violate the testing doctrine, making the `pnpm test` gate environment-dependent and masking weak
proofs. (The substring-only refinement proofs are owned by plan 03; the vacuous `toContain` negatives by plan 02 — this
plan covers the IO/global-state hygiene.)

## Scope

- **M4:** `zod-parser.runner.integration.test.ts` does `fs.readdir`/`readFile` (and `fs.writeFile` under
  `UPDATE_SNAPSHOTS`) under `pnpm test`. Move fixture-driven runners to the e2e/gen gate, or inline fixture content as
  in-process data injected to `parseZodSource`; remove the `writeFile`/`UPDATE_SNAPSHOTS` branch and the `console.warn`
  soft-skip from the unit/integration chain.
- **M5:** `logger.test.ts` mutates global `console` via `vi.spyOn`. Inject the output sink(s) into `logger`; assert on
  the injected fake; delete the types-only `expectTypeOf` test.

Out of scope: refinement-test correctness (plan 03); negative-assertion fix (plan 02).

## Assumptions to validate

1. The Zod runner fixtures can be inlined or relocated to `tests-e2e`/`tests-generated` without losing coverage.
2. `logger` can accept an injected sink without changing its public call sites materially.

## Success criteria

- No `fs.*` IO and no `vi.spyOn(console, …)`/global-state mutation in any `*.unit.test.ts`/`*.integration.test.ts` under
  the `pnpm test` glob (add a lint/grep gate to keep it true).
- `logger` accepts an injected sink; its test asserts on the fake, not global `console`.
- `pnpm qg` green.

## TDD order

1. Inject the logger sink; rewrite its test (red→green). 2. Relocate/inline the Zod runner fixtures; remove IO + soft-skip.
2. Add the no-IO/no-global-mutation guard. 4. Gate green.
