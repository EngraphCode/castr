# Castr × zod-compiler — research home

Findings from a code-level comparison of `@engraph/castr` with
[`gajus/zod-compiler`](https://github.com/gajus/zod-compiler), plus the
surface-architecture and verb-model analysis it produced.

> **Status: research input, not decided truth.** Treat as input; verify before
> acting. The forward plan derived from this research lives under
> [`.agent/plans/future/`](../../plans/future/) and the atomisation decision it
> raises lives in
> [ADR-048](../../../docs/architectural_decision_records/ADR-048-compiler-internal-split-scope-and-value-gate.md)
> (**Proposed** — gated, not closed).

## Contents

| File                                         | Holds                                                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`comparison.md`](./comparison.md)           | The every-altitude comparison with zod-compiler (code mechanisms → intent) + Appendices A–D (report shape, `TargetPlan` node kinds, shared `Diagnostic` model, verified source map).                                            |
| [`corrections.md`](./corrections.md)         | Verified current-reality corrections to a prior (out-of-repo) "Castr / Zod Compiler Session Report" — what the stale report framed as future/conceptual that already exists in code or Accepted ADRs.                           |
| [`reasoning-trail.md`](./reasoning-trail.md) | The metacognitive reasoning trail (how the conclusions were reached, the two errors corrected mid-session). Preserved deliberately — flagged in the source as "the part most likely to be cut and most expensive to re-derive." |

## Provenance & homing map

This research home was split out of a single hybrid report+plan file that arrived
from `main`. The original deliberately mixed provenance, evaluation, comparison,
metacognition, and an executable plan in one file, with an instruction to split it
to its proper homes on integration.

- **Original file:** `.agent/research/zod-compiler-comparison-and-surface-architecture.report-plan.md` (removed after homing; all content conserved below).
- **Original author / branch of record:** Claude, branch `claude/castr-zod-compiler-review-qpre7n`.
- **Brought onto `feat/transplant-engraph-practice` via:** `origin/main` commit `ccd9c7a` (GitHub PR #2), cherry-picked, then homed.
- **Repo commit at time of analysis:** castr `393e476` (HEAD of the source branch when written).
- **Date written:** 2026-06-19.

Where each section of the original landed:

| Original section                                | Home                                                                                                                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §0 TL;DR                                        | this README (below)                                                                                                                                                                                                     |
| §1 Provenance & verification                    | this README (below)                                                                                                                                                                                                     |
| §2 Evaluation of the prior report (corrections) | [`corrections.md`](./corrections.md)                                                                                                                                                                                    |
| §3 zod-compiler at every altitude               | [`comparison.md`](./comparison.md)                                                                                                                                                                                      |
| §4 Metacognitive reasoning trail                | [`reasoning-trail.md`](./reasoning-trail.md)                                                                                                                                                                            |
| §5 Multi-verb fidelity-compiler model           | [`../../plans/future/castr-surface-architecture-and-verb-model.md`](../../plans/future/castr-surface-architecture-and-verb-model.md)                                                                                    |
| §6 Plan (Phases A–F)                            | [`../../plans/future/castr-surface-architecture-and-verb-model.md`](../../plans/future/castr-surface-architecture-and-verb-model.md) (Phase D detail → [`castr-check-verb.md`](../../plans/future/castr-check-verb.md)) |
| §7 Atomisation as a value-gated decision        | [ADR-048](../../../docs/architectural_decision_records/ADR-048-compiler-internal-split-scope-and-value-gate.md) (Proposed)                                                                                              |
| §8 Open questions / §9 Risks                    | this README (below) + carried into the future plans                                                                                                                                                                     |
| §10 Next-agent actions & verification checklist | the future plans (acceptance criteria)                                                                                                                                                                                  |
| Appendices A–D                                  | [`comparison.md`](./comparison.md)                                                                                                                                                                                      |

## TL;DR (original §0)

1. The prior "Castr / Zod Compiler Session Report" is **directionally right but
   stale**: several things it framed as future/conceptual already exist in code or
   in Accepted ADRs. Corrections in [`corrections.md`](./corrections.md). Do not
   act on it without those corrections.
2. The genuinely transferable lessons from `zod-compiler` live at the **code and
   model altitude**, not the "packaging discipline" altitude the prior report
   stopped at. The keystone idea: **compute representability as data and propagate
   it; decide policy (fail-fast / fall back / report) separately.**
   ([`comparison.md`](./comparison.md) Altitude 1.)
3. Castr is not "a transformer." It is a **multi-verb fidelity compiler** whose
   real surfaces — **doctor, upgrade, transform, validate** — already exist in
   code but are _implicit_. Only **check** is net-new. Making the verb model
   explicit is the unlock, and it is what reveals where real package seams are.
   (See the future surface-architecture plan.)
4. Workspace atomisation is **an open value question, not a closed one**. Judge it
   on value with a written trigger + stability gate (ADR-048). The first real
   consumer that wants a lean embeddable core is the Oak SDK / Phase 5 companions.
5. The metric that aligns everything: **zod-compiler measures _compilation
   coverage %_ against _speed_; Castr should measure _preservation coverage %_
   against _fidelity_.** `castr check` is the fidelity analogue of
   `zod-compiler check`.

## Provenance & verification status (original §1)

| Claim source                                                                 | Status                       | Evidence                                                                                                          |
| ---------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| HEAD = `393e476`, prior report's claimed commit                              | ✅ verified                  | `git log`                                                                                                         |
| Single workspace (`lib`)                                                     | ✅ verified                  | `pnpm-workspace.yaml`                                                                                             |
| Package `@engraph/castr@1.18.3`, deps incl. ts-morph/mcp-sdk/ajv/scalar/zod  | ✅ verified                  | `lib/package.json`                                                                                                |
| `repository`/`homepage` still point to `jimcresswell/openapi-zod-validation` | ✅ verified (stale)          | `lib/package.json:8,27`                                                                                           |
| Broad semantic IR (`CastrDocument`, `CastrSchema`)                           | ✅ verified                  | `lib/src/schema-processing/ir/models/*`                                                                           |
| OpenAPI canonical **output** target is 3.2.0; 3.1 is input-only              | ✅ verified                  | roadmap "3.x input → 3.2.0 output"; `CastrDocument.openApiVersion`                                                |
| zod-compiler internals (IR, codegen, check)                                  | ✅ verified via source fetch | `gajus/zod-compiler@main` `src/core/types.ts`, `src/core/codegen/context.ts`, `src/cli/commands/check.ts`, README |

**Verification instruction for future agents:** re-pin both repos to exact commits
before implementing. zod-compiler's IR is coupled to Zod internals and will drift.
Re-confirm OpenAPI latest from OAI before treating 3.2.0 as current.

## Open questions (original §8)

- `TargetPlan`: public + serialisable? (Recommend yes — companion honesty contract.)
- `check` report shape: adopt zod-compiler's lean shape verbatim, or the richer
  per-pair variant? (Recommend lean-first, extend on demand.)
- JSON Schema output dialect selection (2020-12 vs Draft-07 for MCP) — should the
  `TargetPlan` carry dialect as a target parameter?
- Should `validate` expose runtime data-validation (parity) as a public verb, or
  remain proof-only?
- CLI compatibility: keep `castr <in> -o <out>` as sugar for `castr transform`, or
  drop it (prerelease)?

## Risks (original §9)

- **R1 — Phase A scope creep.** The refactor touches every writer. Mitigate: do it
  target-by-target behind the policy boundary; keep byte-identical output for
  supported inputs as the gate.
- **R2 — Diagnostics divergence.** If `check` computes coverage from a parallel
  path instead of the `TargetPlan`, docs and behaviour drift. Mitigate: single
  source (Phase B), enforced by Phase F generating tables from it.
- **R3 — Premature atomisation.** ADR-048's gate exists precisely to prevent this.
- **R4 — Strictness erosion.** The representability map must never _enable_ silent
  widening; it makes the unsupported set _visible_, policy still rejects by
  default. Keep "strict, everywhere, all the time."
