# Oak → castr Practice Transplant — Phase Tracker

**Primary plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md)
**Spec:** [`../practice-alignment-brief.md`](../practice-alignment-brief.md)
**Branch:** `feat/transplant-engraph-practice` (off `docs/initial-deep-review`; baseline `transplant/phase-0-baseline`)

This directory holds per-phase sub-plans + the relevance ledger, mirroring `remediation/`. Each phase ends green
(`pnpm check`) + reference-closure-clean, with an atomic commit and a `transplant/phase-N` tag. Roll back **forward**
only.

## Status

| Phase | Surface                                                                              | Status         | Tag                           |
| ----- | ------------------------------------------------------------------------------------ | -------------- | ----------------------------- |
| 0     | Setup — branch, baseline, plan promotion, park product plan                          | 🔄 in progress | `transplant/phase-0-baseline` |
| 1     | Practice Core + ~90 PDRs + provenance + verification + fitness (+ build agent-tools) | ⬜             | `transplant/phase-1`          |
| 2     | `@engraph/agent-tools` + hook policy                                                 | ⬜             | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                             | ⬜             | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                           | ⬜             | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive)                                                     | ⬜             | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                          | ⬜             | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                          | ⬜             | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                       | ⬜             | `transplant/phase-8`          |
| 9     | practice-verification + relevance ledger + feedback + handoff                        | ⬜             | `transplant/phase-9`          |

## Artefacts produced here

- `NN-<surface>.md` — per-phase sub-plan (created when the phase begins).
- `relevance-ledger.md` — per-item KEEP / AMEND / DON'T-BRING / DORMANT with rationale; not-brought + dormant sets.
- `reference-closure.md` — running resolve / rewrite / placeholder classification of dangling cites.
