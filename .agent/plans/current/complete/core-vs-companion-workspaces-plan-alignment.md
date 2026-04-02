# Plan (Complete): Core-vs-Companion Workspaces Plan Alignment

**Status:** Complete — initial repo-wide alignment plus residual planning-input cleanup closed on 2026-04-02
**Created:** 2026-04-02
**Last Updated:** 2026-04-02
**Related:** [roadmap.md](../../roadmap.md), [VISION.md](../../../directives/VISION.md), [ADR-043](../../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md), [phase-5-ecosystem-expansion.md](../../future/phase-5-ecosystem-expansion.md)

---

## User Impact To Optimise For

Cold-start sessions, future roadmap updates, and Oak-facing adoption work should be able to tell immediately:

- what belongs in core `@engraph/castr`
- what belongs in companion workspaces
- which planning artefacts are current, historical, or still need wording cleanup

## Goal

Close the remaining plan-surface and strategic-research gaps after the core-vs-companion boundary decision so roadmap, future plans, and planning inputs all describe the same product model.

## Progress Snapshot (2026-04-02)

Completed in the initial alignment pass:

- canonical strategy and handoff docs aligned to the core-vs-companion boundary
- public package docs aligned to the same boundary
- ADR-043 added and older ADRs bannered for historical hygiene
- Oak-facing durable reports and `gap-matrix.md` aligned to the chosen boundary

Residual wording gap closed in the follow-on sweep:

- `.agent/research/feature-parity/plan-overview.md`, `.agent/research/feature-parity/plans-review.md`, and `.agent/research/feature-parity/enhancement-scope.md` now all use explicit companion-workspace framing
- `.agent/prompts/session-entry.prompt.md` now treats OAS 3.2 version plumbing as the active slice rather than a successor-only idea
- Oak-facing negotiation / fixture docs now distinguish the 3.1 bridge artefacts from the canonical 3.2 target while keeping ADR-043 explicit

## Scope

### In Scope

- non-archive planning artefacts in `.agent/plans/roadmap.md`, `.agent/plans/active/*`, `.agent/plans/current/paused/*`, and `.agent/plans/future/*`
- relevant research planning inputs that still steer future work or Oak adoption
- cross-links, status markers, and successor/predecessor hygiene for those artefacts

### Out Of Scope

- product-code changes
- naming or shipping companion packages
- displacing the current OAS 3.2 active plan stack
- rewriting historical documents as if they were never written

## Assumptions

1. [ADR-043](../../../../docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md) is the boundary of record.
2. Historical artefacts are preserved and clarified with banners or notes rather than rewritten invisibly.
3. tRPC, fetch/runtime helpers, and framework handlers remain companion-workspace directions rather than core `lib` format promises.
4. Oak remains the first proving ladder, but it does not redefine the core package boundary.

## Classification Table

| Artefact                                                                       | Kind                           | Required action          | Notes                                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| `.agent/plans/roadmap.md`                                                      | Canonical roadmap              | `aligned`                | Now states the core-vs-companion boundary, rewrites Phase 5, and records this completion. |
| `.agent/plans/active/README.md`                                                | Lifecycle contract             | `aligned`                | Already describes active-plan hygiene without implying core runtime expansion.            |
| `.agent/plans/active/oas-3.2-version-plumbing.md`                              | Primary active plan            | `aligned`                | Core compiler/version-plumbing slice; no companion-boundary drift.                        |
| `.agent/plans/active/oas-3.2-full-feature-support.md`                          | Companion active plan          | `aligned`                | Still an OAS feature-expansion slice, not a transport/runtime plan.                       |
| `.agent/plans/current/paused/README.md`                                        | Lifecycle contract             | `aligned`                | Already supports paused-workstream hygiene needed for this cleanup.                       |
| `.agent/plans/current/paused/json-schema-parser.md`                            | Historical paused workstream   | `aligned`                | Historical parser context only; no core-vs-companion drift.                               |
| `.agent/plans/current/complete/core-vs-companion-workspaces-plan-alignment.md` | Completed strategic workstream | `aligned`                | This meta-plan remains the completion record for the repo-wide boundary-alignment pass.   |
| `.agent/plans/current/complete/feature-parity-planning-input-alignment.md`     | Completed successor slice      | `aligned`                | The narrower residual wording-cleanup slice is now closed as well.                        |
| `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`           | Future platform plan           | `aligned`                | Orthogonal to the product-boundary decision.                                              |
| `.agent/plans/future/phase-5-ecosystem-expansion.md`                           | Future ecosystem plan          | `aligned`                | Reframed to companion workspace expansion.                                                |
| `.agent/plans/future/temporal-first-js-ts-date-time-doctrine.md`               | Future doctrine plan           | `aligned`                | Unrelated to the boundary decision.                                                       |
| `.agent/plans/future/zod-and-transform-future-investigations.md`               | Future investigation plan      | `aligned`                | Concerns core schema/compiler follow-up, not runtime/framework drift.                     |
| `.agent/research/feature-parity/gap-matrix.md`                                 | Strategic gap summary          | `aligned`                | tRPC/runtime gaps now framed as companion-workspace directions.                           |
| `.agent/research/feature-parity/plan-overview.md`                              | Research planning input        | `aligned`                | Step sequencing now keeps core compiler and companion-workspace work separate.            |
| `.agent/research/feature-parity/plans-review.md`                               | Research planning input        | `aligned`                | Recommendations now route code-first/runtime work through Phase 5 rather than core.       |
| `.agent/research/feature-parity/enhancement-scope.md`                          | Research planning input        | `aligned`                | Scope now split by architectural layer rather than treating tRPC/runtime as core work.    |
| `.agent/research/multiformat-target-support.md`                                | Parked research note           | `aligned`                | Already parked correctly outside plan directories.                                        |
| `.agent/research/oak-open-curriculum-sdk/oak-support-plan.md`                  | Historical negotiation note    | `historical banner only` | Banner now points readers to the durable report.                                          |
| `.agent/research/oak-open-curriculum-sdk/oak-castr-integration-report.md`      | Durable Oak strategy report    | `aligned`                | Runtime/client work now framed as companion-workspace or external-interop decisions.      |
| `.agent/research/oak-openapi/oak-openapi-castr-replacement-report.md`          | Durable Oak generation report  | `aligned`                | Runtime/tRPC follow-on work now framed as companion-workspace direction.                  |
| `.agent/research/oak-openapi/notes.md`                                         | Historical scratch note        | `historical banner only` | Banner now points readers to the durable report.                                          |

## Required Follow-Up Actions

1. Keep future companion-workspace execution slices explicit in Phase 5 or later active plans.
2. Move any future scratch notes out of `active/` or `current/paused/` if they are not real execution plans.
3. Keep Oak negotiation notes bannered and secondary to the durable reports.

## TDD / Verification Order

1. Search for live plan or research-planning language that implies typed clients, runtime handlers, or tRPC are core `lib` commitments.
2. Update the canonical roadmap and future-plan wording first.
3. Update the still-live research planning inputs that steer future decisions.
4. Add or refresh banners where a document should stay historical rather than be rewritten.
5. Run `pnpm format:check` and `pnpm portability:check`.

## Documentation Outputs

This completed workstream produced:

- roadmap and future-plan wording aligned to the boundary of record
- remaining feature-parity planning inputs reworded or bannered
- cross-links closed between roadmap, Phase 5, ADR-043, and Oak-facing strategy reports
- napkin entry recording what strategic gaps were closed and why

## Completion Note

The residual wording gap that originally required the narrower follow-on slice is now closed. Future work should start from the canonical roadmap, Phase 5 companion-workspace plan, and ADR-043 rather than reopening this alignment pass.

## Success Criteria

1. Every non-archive planning artefact in scope is classified and either aligned or given one explicit required action.
2. No live roadmap or future-plan surface describes typed clients, runtime handlers, or tRPC as core `@engraph/castr` promises.
3. Missing cross-links between the boundary ADR, roadmap, and relevant research inputs are closed.
4. Historical notes stay clearly historical instead of silently contradicting the live product boundary.
5. Verification passes: `pnpm format:check` and `pnpm portability:check`.

## Completion Criteria

This workstream is complete when the only remaining core-vs-companion mismatches are either:

- intentionally preserved historical records with explicit banners, or
- genuinely later-scope ideas parked outside the live roadmap/plan surface
