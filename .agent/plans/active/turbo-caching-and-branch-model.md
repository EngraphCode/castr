---
todos:
  - id: TC-1
    content: Flip turbo caching on per task with measured exceptions + inputs; declare missing dependsOn edges
    status: in_progress
  - id: TC-2
    content: Wire the now-live turbo cache across CI jobs (save in build, restore in downstream lanes)
    status: pending
  - id: TC-3
    content: Prove caching locally (hit + invalidation) and green on PR 4; config-expert review
    status: pending
  - id: BM-1
    content: Retire the single-branch model across all forward continuity/plan/doctrine surfaces (feature-branch model)
    status: pending
---

# Turbo caching + branch-model reconciliation (owner-directed, same-session)

**End goal:** every gate run (local and CI) stops paying the full-rebuild tax, and every
continuity surface states the true branching model, so future sessions neither wait on
un-cached work nor "correct" the repo back to a retired single-branch posture.

**Mechanism:** turbo task caching is sound exactly where a task is hermetic w.r.t. its hashed
inputs; each task was measured (not assumed) for root-reaching reads, mutation, and declared
outputs — cache flips on wherever the hash is truthful, and the two measured exceptions carry
their reasons. The branch model is doctrine, so it changes at the forward surfaces
(invariants, standing decisions, prompts), never in historical/as-built records.

**Owner rulings driving this (2026-07-03):** "one branch was never an invariant — we happened
to start on main; now we use feature branches"; "turn caching on for every task unless it
would specifically cause issues"; same-session execution.

## Measured facts the design rests on

- Every turbo task is currently `cache: false`; `.turbo` is gitignored; analyser configs
  (knip.ts, .dependency-cruiser.cjs) are workspace-local.
- `agent-tools` tests root-reach committed AND volatile repo state (`.agent/`, `.codex/` —
  six-plus files measured) → default workspace hashing would under-hash; the input set is
  broad and includes high-churn state → `@engraph/agent-tools#test` stays uncached with this
  reason.
- `lib/tests-snapshot/spec-compliance` reads `$TURBO_ROOT$/.agent/reference/openapi_schema`
  (frozen committed reference) → curable with one extra input glob on `test:snapshot`.
- `format` and `clean` are mutating tasks → never cached.
- `test:e2e`/`test:snapshot` `dependsOn: build` already landed (the split-exposed defect).

## Work items

**TC-1 (turbo.json):** cache on for build, type-check, lint, test, character, test:snapshot
(+ `$TURBO_ROOT$/.agent/reference/openapi_schema/**` input), test:gen, test:transforms,
test:e2e, madge:circular, madge:orphans, depcruise, knip. Keep `clean` + `format` uncached
(mutating). Add `@engraph/agent-tools#test` package override: uncached, measured reason
above. Check whether any test suite execs built binaries → if measured, `test` gains
`dependsOn: build`.

**TC-2 (ci.yml):** the build job saves `.turbo/cache` (key `turbo-<os>-<sha>`, restore-keys
prefix for cross-commit reuse — turbo revalidates by hash so a stale entry is bytes, not
wrongness); unit-tests / structure-checks / proof-suites restore before their turbo runs so
`build` replays FULL TURBO instead of rebuilding per job.

**BM-1 (docs):** enumerate `single branch|single-branch|one eventual PR` +
`feat/transplant-engraph-practice` across `.agent/` + docs; per occurrence: FORWARD doctrine
(invariants, standing decisions, lanes header, delivery-ledger, session prompt) → rewrite to
the feature-branch model (feature branches off `main`, one PR per slice, owner invokes merge,
collaboration substrate is branch-agnostic); HISTORY/as-built (phase records, archived
napkins, closeouts) → preserve untouched.

## Acceptance (proof contract)

- TC-1: `pnpm build && pnpm build` second run shows FULL TURBO; touching a lib src file
  invalidates (MISS); `turbo run test:snapshot --dry=json` hash includes the reference-schema
  input; all proofs at `unit`-equivalent level (command observation).
- TC-2/TC-3: PR #4 pipeline green with downstream jobs showing cache-restored build replay;
  config-expert reviews the turbo + workflow diff; full local aggregate NOT rerun (CI is the
  aggregate proof — same command surface).
- BM-1: the enumeration grep over forward surfaces returns only historical/as-built hits,
  each verifiably in a dated record.

## Non-goals

Remote turbo cache (needs a token/vendor decision); per-task `inputs` micro-tuning beyond the
two measured cures; rewriting historical records; changing gate SEMANTICS anywhere.

## Lifecycle

Same-session execution; on completion this plan archives per ADR-117 with as-built notes; the
consolidation edge is this session's closeout. Plan-body first-principles check: the caching
table above derives from live measurements this session, not inherited claims; if execution
contradicts a measurement, re-measure before proceeding.
