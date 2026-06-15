# Delivery Ledger

**The concept (owner-requested, 2026-06-10):** plans are decoupled from branches — one plan's work may span several
branches, PRs, and release acts. The unit binding them is the plan's **delivery**: everything that must land for the
plan's outcome to reach its beneficiary (per PDR-085, value that has not reached a beneficiary has not been
delivered). This ledger is the **single home (DRY)** for delivery state: which branches and PRs carry which plan,
their merge/CI/review state, and the next act. Other surfaces (roadmap, session-continuation, trackers) point here
and never duplicate the table.

## Monitoring discipline

Open PRs are live surfaces: reviews and CI **will** demand fixes, and the multi-branch shape multiplies that load.

- **Session open** (with start-right): for every OPEN row below, run `gh pr status` and per PR
  `gh pr checks <n>` + `gh pr view <n> --comments` — triage anything red or commented before new work.
- **Session close** (session-handoff): refresh this ledger; a handoff with a stale ledger is incomplete.
- Structural option when PR count grows: a scheduled routine or `/loop` sweeping `gh pr checks` — adopt when manual
  sweeps start missing things, not before.

## Deliveries

| Plan (sequence position)                                  | Branches                                                                          | PRs                                                                                   | State / next act                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remediation 01 — packaging & types (pos 1, plan COMPLETE) | `fix/remediation-01-packaging-and-types` (off `docs/initial-deep-review`, PUSHED) | **[#1 DRAFT](https://github.com/EngraphCode/castr/pull/1)** — monitor checks/comments | **CI GREEN** (verified 2026-06-10: Build 24.x, Build 26.x, Analyze, CodeQL all SUCCESS; no review comments). Mergeable. CI does not run lint, so the local lint-red is not a PR blocker. Carries deep-review commits + pnpm-11 (named in body). ⚠️ **Cross-branch CI drift:** this branch's `ci.yml` still has the `[24.x, 26.x]` matrix; the transplant branch now has the owner's single-Node-24 `ci.yml`. Reconcile when both reach `main` (D2/D3 settle it to single-24). |
| Remediation 02 — IR fidelity harness (pos 1, ACTIVE next) | not yet created (`fix/remediation-02-…` off `docs/initial-deep-review`)           | —                                                                                     | Execute next session.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Practice transplant Phases 0–4 (+5–9) (pos 2)             | `feat/transplant-engraph-practice` (PUSHED, incl. `transplant/*` tags)            | none yet — single PR to `main` at transplant close                                    | Phases 0–4 tagged; Phase 5 next (ground with owner). **+ engineering-infrastructure arc D1–D4** (lint warn→error, Node single-source, CI→Oak standard, quality-gate/Practice parity) — see tracker §Deep-enhancement arc; "phases done" ≠ "deep enhancement complete". Oak pinned: `practice/transplant-to-castr` @ `4470266`.                                                                                                                                                |
| Oak back-flow (feedback + upstream fixes)                 | Oak repo, branch `practice/transplant-to-castr` (PUSHED)                          | as raised in Oak                                                                      | Feedback file delivered to Oak's Practice Box and pushed (2026-06-10).                                                                                                                                                                                                                                                                                                                                                                                                        |
| Explicit additional-properties (pos 3, paused)            | none yet                                                                          | —                                                                                     | Starts after positions 1–2.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

**Conventions:** one row per plan-delivery; a row closes only when its value is merged/released to its beneficiary,
not when code exists. Remediation deliveries each take their own `fix/*` branch off `docs/initial-deep-review`; the
first merged PR carries the two deep-review commits into `main`; later branches then rebase their PR target view
naturally (no history rewriting — forward merges only).
