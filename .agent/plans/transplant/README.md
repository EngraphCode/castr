# Oak → castr Practice Transplant — Phase Tracker

**Primary plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md)
**Spec:** [`../practice-alignment-brief.md`](../practice-alignment-brief.md)
**Branch:** `feat/transplant-engraph-practice` (off `docs/initial-deep-review`; baseline `transplant/phase-0-baseline`)

This directory holds per-phase sub-plans + the relevance ledger, mirroring `remediation/`. Each phase ends green
(`pnpm check`) + reference-closure-clean, with an atomic commit and a `transplant/phase-N` tag. Roll back **forward**
only.

## Status

| Phase | Surface                                                                              | Status       | Tag                           |
| ----- | ------------------------------------------------------------------------------------ | ------------ | ----------------------------- |
| 0     | Setup — branch, baseline, plan promotion, park product plan                          | ✅ done      | `transplant/phase-0-baseline` |
| 1     | Practice Core + ~90 PDRs + provenance + verification + fitness (+ build agent-tools) | 🔄 1a landed | `transplant/phase-1`          |
| 2     | `@engraph/agent-tools` + hook policy                                                 | ⬜           | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                             | ⬜           | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                           | ⬜           | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive)                                                     | ⬜           | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                          | ⬜           | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                          | ⬜           | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                       | ⬜           | `transplant/phase-8`          |
| 9     | practice-verification + relevance ledger + feedback + handoff                        | ⬜           | `transplant/phase-9`          |

## Resume point (next session)

**Phase 1 is partially landed.** Done (committed, green): **1a** — 92 PDRs + `practice-verification.md` +
`reference-closure.md` ledger (additive; zero `@oaknational`/`oak-` naming). **Remaining (1b):**

- Bring Oak's **current Core generation** (`practice.md`, `practice-lineage.md`, `practice-bootstrap.md`, `index.md`,
  `README.md`, `CHANGELOG.md`) replacing castr's older March snapshot — these are portable (zero oak-naming).
- **Migrate provenance**: castr's Core uses old inline `provenance:`+`fitness_ceiling`; adopt Oak's `provenance: provenance.yml`
  pointer + multi-dim fitness frontmatter. Bring `provenance.yml` (already holds castr history to 2026-03-09); **preserve
  castr's 2026-03-22 entry** and **append a 2026-06-05 transplant entry**. No history loss.
- **Retire `.agent/practice-context/`**: entangled — referenced by 10 files incl. the PRESERVE'd `AGENT.md`, `README.md`,
  `practice-index.md`, and `practice-lineage.md`. Archive castr's authored `outgoing/` notes; update the references.
- Then tag `transplant/phase-1`.

## Artefacts produced here

- `NN-<surface>.md` — per-phase sub-plan (created when the phase begins).
- `relevance-ledger.md` — ✅ **seeded 2026-06-05** (finalised Phase 9): full per-surface KEEP / AMEND / DON'T-BRING /
  DORMANT dispositions, the firsthand corrections to the fan-out, and the explicit not-brought + dormant sets.
- `reference-closure.md` — ✅ started: running resolve / rewrite / placeholder / retained-cross-host classification.

> **Continuation surfaces (all updated 2026-06-05 — no session knowledge lost):** this tracker + `relevance-ledger.md` +
> `reference-closure.md` + the parent plan + `.agent/prompts/session-continuation.prompt.md` (§Practice Transplant) +
> `.agent/plans/roadmap.md` + the `.agent/memory/napkin.md` `2026-06-05` entry + the cross-session auto-memory.
