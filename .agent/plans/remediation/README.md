# Remediation Plans — Initial-Review Backlog

**Created:** 2026-06-04
**Source:** [`.agent/report/initial-review/`](../../report/initial-review/) (first-hand verified findings) and
[ADR-047](../../../docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md).

---

## Purpose

A **prioritised backlog** of atomic, finding-driven remediation plans derived from the initial deep review.

> **Execution model superseded (owner-approved 2026-07-17).** The original one-at-a-time promotion
> rule is retired for this backlog: execution now runs as **file-disjoint parallel lanes** under
> [`00-parallel-execution-program.md`](./00-parallel-execution-program.md) (worktree agents, one PR
> per lane, merges owner-invoked). The plans below remain the per-finding authority — each lane
> carries its plan's acceptance criteria verbatim; the program record carries the lane
> specifications, merge-order edges, and the 46-finding disposition table. Plan 01 is complete and
> merged; plan 02's proof-harness intent and finding set are carried across lanes
> L-A/L-B/L-D/L-E/L-F/L-H (per the program record's disposition table).

Each plan is an execution contract per the `plan` skill (`.agent/skills/plan/SKILL-CANONICAL.md`): it references permanent docs/ADRs first and states
its own scope, success criteria, and TDD order. The _why_ lives in the report; these plans hold the _what_ and _how_.

## Governing rules

- **Strictest-of-three** (user directive 2026-06-04): where code, proofs, and docs disagree, normalise to the strictest.
- **Proof-first:** install the failing test before the fix (the repo's TDD mandate); a finding is "done" only when a
  behavioural/round-trip proof turns it green and stays green.

## Sequence (highest leverage first; mirrors report §09)

| #   | Plan                                                                                     | Findings                            | Risk                                       |
| --- | ---------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| 01  | `01-packaging-and-types-integrity.md`                                                    | C1                                  | Low                                        |
| 02  | [`../active/02-ir-fidelity-proof-harness.md`](../active/02-ir-fidelity-proof-harness.md) | H7, C2, C3, C4, H1, H2, H3, H4, M10 | Low (tests) → Med (fixes)                  |
| 03  | `03-zod-2020-12-keyword-semantics.md`                                                    | C6 (executes ADR-047)               | Med                                        |
| 04  | `04-zod-parser-strict-whitelist.md`                                                      | C5                                  | Med                                        |
| 05  | `05-single-source-type-guards.md`                                                        | M3, C4                              | Low-Med                                    |
| 06  | `06-doctrine-enforcement-truthing.md`                                                    | M1, M2, M12, L1-L5                  | Low (⚠️ doctrine edits need user approval) |
| 07  | `07-test-hygiene.md`                                                                     | M4, M5, H7                          | Low                                        |

Genuine _future_ (not remediation) scope — capability deferrals consolidated from the paused/archived investigations —
belongs in `future/` (external `$ref` / `$anchor` / `$dynamicRef` runtime resolution), not here.
