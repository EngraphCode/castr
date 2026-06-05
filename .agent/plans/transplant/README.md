# Oak → castr Practice Transplant — Phase Tracker

**Primary plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md)
**Spec:** [`../practice-alignment-brief.md`](../practice-alignment-brief.md)
**Branch:** `feat/transplant-engraph-practice` (off `docs/initial-deep-review`; baseline `transplant/phase-0-baseline`)

This directory holds per-phase sub-plans + the relevance ledger, mirroring `remediation/`. Each phase ends green
(`pnpm check`) + reference-closure-clean, with an atomic commit and a `transplant/phase-N` tag. Roll back **forward**
only.

## Status

| Phase | Surface                                                                                  | Status  | Tag                           |
| ----- | ---------------------------------------------------------------------------------------- | ------- | ----------------------------- |
| 0     | Setup — branch, baseline, plan promotion, park product plan                              | ✅ done | `transplant/phase-0-baseline` |
| 1     | Practice Core + ~90 PDRs + provenance + verification + fitness + retire practice-context | ✅ done | `transplant/phase-1`          |
| 2     | `@engraph/agent-tools` + hook policy                                                     | ⬜      | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                                 | ⬜      | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                               | ⬜      | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive)                                                         | ⬜      | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                              | ⬜      | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                              | ⬜      | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                           | ⬜      | `transplant/phase-8`          |
| 9     | practice-verification + relevance ledger + feedback + handoff                            | ⬜      | `transplant/phase-9`          |

## Resume point (next session)

**Phase 1 is complete** — tagged `transplant/phase-1`. **1a** delivered the 92-PDR estate, `practice-verification.md`,
and the `reference-closure.md` ledger (additive; zero `@oaknational`/`oak-` naming). **1b** (2026-06-05) converged the
Core generation to Oak's current portable trinity + entry points, created `provenance.yml` as the branch-history union
(castr's 2026-03-22 entry + a 2026-06-05 merge node preserved — no loss, no duplication, identity-deduped), merged
`CHANGELOG.md`, and retired `.agent/practice-context/` (archived castr's authored notes; repointed the live navigational
refs; immutable PDRs left intact).

**Resume at Phase 2** — `@engraph/agent-tools` + hook policy; design in
[`02-agent-tools-build-design.md`](./02-agent-tools-build-design.md), **reconciled to Oak's 2026-06-05 post-pull state in
`8abdbb7`** (tsx `postinstall` bootstrap not turbo; dist-based fail-closed PreToolUse guards; seven validators incl.
`lifecycle-scripts`/`pretooluse-guard-routing`/`fitness-vocabulary`; `tsx` devDep + dep majors). Standing discipline: Oak
is a moving target — **re-read Oak's `agent-tools/` fresh at Phase-2 execution** even though the design is now current.

The 1b method below is kept as the execution record:

> **Frame Phase 1b as a HISTORY MERGE, not a replace.** Practice histories are **branchy — a DAG, like git** — not
> linear. castr's Practice is a **branch** that diverged from the shared network ≈2026-03-09 (provenance index 7) and
> evolved locally since (index 8 / 2026-03-22 + clean-break principles naming, canonical-first restructuring,
> paused-workstream lifecycle). Oak's Practice is another branch that advanced in parallel. This transplant **merges
> Oak's current branch into castr's branch** — three-way: common ancestor ≈2026-03-09, _ours_ = castr's local Practice
> (**preserve its divergence — do NOT clobber**), _theirs_ = Oak's current generation. Per `practice-lineage.md`'s
> integration protocol, ~⅓ of files port clean, ⅓ need selective edit (universal core kept + castr-local sections kept),
> ⅓ rewrite — three-way-merge each file.

- **Merge Oak's current Core generation** (`practice.md`, `practice-lineage.md`, `practice-bootstrap.md`, `index.md`,
  `README.md`, `CHANGELOG.md`) into castr's — adopt Oak's advances, **preserve castr's branch-local divergence** (not a
  wholesale replace). All portable (zero oak-naming).
- **Merge provenance (it is itself a flattened merge-history — entries from oak/cloudinary/new-cv/castr interleaved):**
  castr's Core uses old inline `provenance:`+`fitness_ceiling`; adopt Oak's `provenance: provenance.yml` pointer +
  multi-dim fitness frontmatter. **Union both branches' histories** (Oak's `provenance.yml` chains + castr's branch-only
  entries) and add a **2026-06-05 merge node** — not a linear append. NB Oak's `provenance.yml` holds castr only **through
  2026-03-09** (id `58b36dbe…`); castr's inline `practice.md` additionally carries an **index-8 entry dated 2026-03-22**
  Oak's file lacks → port it in or it is silently lost.
- **Retire `.agent/practice-context/`**: entangled — referenced by 10 files incl. the PRESERVE'd `AGENT.md`, `README.md`,
  `practice-index.md`, and `practice-lineage.md` (full list: `grep -rl practice-context .agent`). Archive castr's authored
  `outgoing/` notes; update the references.
- Then tag `transplant/phase-1`.

> **Sequencing note (don't conflate phases):** Phase 1b closes green on the **standard gates** (`format:check`,
> `type-check`, `lint`, `madge`, `depcruise`, `knip`, tests) **without** `agent-tools`. The plan's "build agent-tools
> first so docs are checkable" means the `practice:substrate` / `vocabulary` / `fitness` validation of the Core runs
> **retroactively at Phase 2** once `@engraph/agent-tools` is built — it is not a Phase-1b blocker.

## Artefacts produced here

- `NN-<surface>.md` — per-phase sub-plan. **`02-agent-tools-build-design.md` already written** (the hardest phase's full
  build/gate design, captured early so it can't be lost).
- `relevance-ledger.md` — ✅ **seeded 2026-06-05** (finalised Phase 9): full per-surface KEEP / AMEND / DON'T-BRING /
  DORMANT dispositions, the firsthand corrections to the fan-out, and the explicit not-brought + dormant sets.
- `reference-closure.md` — ✅ started: running resolve / rewrite / placeholder / retained-cross-host classification.

> **Continuation surfaces (all updated 2026-06-05 — no session knowledge lost):** this tracker + `relevance-ledger.md` +
> `reference-closure.md` + the parent plan + `.agent/prompts/session-continuation.prompt.md` (§Practice Transplant) +
> `.agent/plans/roadmap.md` + the `.agent/memory/napkin.md` `2026-06-05` entry + the cross-session auto-memory.
