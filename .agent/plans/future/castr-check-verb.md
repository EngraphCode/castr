# Plan (Future): `castr check` — the preservation-coverage verb

**Status:** ⚪ Planned (Proposed — not yet executed; verify before acting)
**Created:** 2026-06-19
**Last Updated:** 2026-06-19
**Parent plan:** [`castr-surface-architecture-and-verb-model.md`](./castr-surface-architecture-and-verb-model.md) (Phase D)
**Source research:** [`.agent/research/zod-compiler/`](../../research/zod-compiler/)

> **Depends on Phases A–B of the parent plan.** `check` computes coverage from the
> `TargetPlan` layer — never a parallel code path (parent risk R2). This atomic
> plan is the focused deliverable for the net-new verb; the verb model and the
> representability substrate it reads are owned by the parent plan.

---

## Goal

Add `castr check` — the **fidelity analogue** of `zod-compiler check`. Where
zod-compiler reports _compilation coverage %_ against speed, `castr check` reports
**preservation coverage %** against fidelity, per `(source → target)` pair:
coverage, findings, and (optionally) round-trip status.

## User Impact To Optimise For

- A CI-usable, deterministic answer to "will this `(source → target)` conversion
  preserve my semantics, and if not, exactly which paths and why?"
- Strictness made _measurable and machine-readable_, instead of a thrown fatal at
  the first unsupported node.

## Scope

- **CLI:** `castr check <input> --from <fmt> --to <fmt,...> [--round-trip <fmt>]
[--json] [--fail-under <n>]`.
  - `--fail-under <n>` exits non-zero when coverage `< n` (CI gate).
  - `--json` emits the deterministic report shape below.
- **Report shape — start lean** (from zod-compiler; see
  [`comparison.md` Appendix A](../../research/zod-compiler/comparison.md)),
  generalised per `(source → target)` pair rather than per-schema:

  ```ts
  type CheckPairReport = {
    source: string;
    from: SchemaFormat;
    to: SchemaFormat;
    coverage: { total: number; preserved: number; percent: number };
    roundTrip?: { lossless: boolean; idempotent: boolean; changedPaths: string[] };
    findings: Array<{
      path: string;
      status: NodePlanKind; // parent plan Appendix B
      severity: 'info' | 'warning' | 'error';
      reason: string;
      hint?: string; // actionable remediation
    }>;
  };
  // file-level: { file, pairs: CheckPairReport[] }
  ```

- **Reuse, do not rebuild:** the existing round-trip/idempotence rigs (ADR-027,
  ADR-035) back `--round-trip`; the `doctor` surface and the shared `Diagnostic`
  model (parent Phase C) feed findings. `check` is _aggregation + presentation_
  over the `TargetPlan`, not greenfield analysis.

## Acceptance

- Deterministic JSON output (stable ordering; no wall-clock/randomness leakage).
- `--fail-under` exits non-zero below threshold (CI-usable).
- Coverage computed from the `TargetPlan`, not a parallel code path (parent R2).
- Proof-first: behavioural tests installed before implementation (repo TDD mandate);
  full `pnpm check:ci` green.

## Open questions

- Lean report shape verbatim vs the richer per-pair variant (recommend lean-first).
- JSON Schema dialect selection (2020-12 vs Draft-07 for MCP) as a `--to` parameter
  (touches ADR-047).
- Whether `check` is also exposed programmatically alongside the CLI.

## Out of scope

- The representability refactor itself (parent Phases A–B).
- Package atomisation (ADR-048 — gated).
