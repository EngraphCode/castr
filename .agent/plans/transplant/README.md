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
| 2     | `@engraph/agent-tools` + hook policy (+ live guards, §6 drift validator)                 | ✅ done | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                                 | ⬜      | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                               | ⬜      | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive)                                                         | ⬜      | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                              | ⬜      | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                              | ⬜      | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                           | ⬜      | `transplant/phase-8`          |
| 9     | practice-verification + relevance ledger + feedback + handoff                            | ⬜      | `transplant/phase-9`          |

## Resume point (next session)

**Phase 1 is complete** — tagged `transplant/phase-1`. **1a** delivered the 91-PDR estate (89 numbered slots; PDR-086 vacant — inherited from Oak, lossless; PDR-076 split 076/076a/076b), `practice-verification.md`,
and the `reference-closure.md` ledger (additive; zero `@oaknational`/`oak-` naming). **1b** (2026-06-05) converged the
Core generation to Oak's current portable trinity + entry points, created `provenance.yml` as the branch-history union
(castr's 2026-03-22 entry + a 2026-06-05 merge node preserved — no loss, no duplication, identity-deduped), merged
`CHANGELOG.md`, and retired `.agent/practice-context/` (archived castr's authored notes; repointed the live navigational
refs; immutable PDRs left intact).

**Phase 2 is COMPLETE** — tagged `transplant/phase-2` (commit `55a6788`; Oak baseline advanced `06018bc3`→`2c85bc01`).
Landed: the 340-file `@engraph/agent-tools` package (localised; product-coupled `ci-schema-drift-check` dropped per
DON'T-BRING); self-contained tsconfig/eslint/knip/depcruise + inlined vitest bases; `pnpm-workspace` + `tsx` postinstall
bootstrap; hook policy data + **LIVE Claude PreToolUse guards**; and the §6 **`validate-drift`** validator (8th). Green:
format/build/type-check/lint/madge/depcruise/knip/portability/repo-validators + lib's 1669 tests.

**CRITICAL operational state for the next session (non-obvious, easily lost):**

- **PreToolUse guards are now LIVE** (`.claude/settings.json` Bash/Edit/Write → `.claude/hooks/run-pretooluse-guard.mjs`).
  Your tool calls are guarded: dangerous-git patterns and content fingerprints (PDR-044 hedging/menu-framing) are denied;
  an **unbuilt `dist` fails OPEN** (warns, never bricks), a built-but-broken guard fails closed. If a tool call is
  blocked, that is the policy in `.agent/hooks/policy.json` — not a bug.
- **agent-tools `test` is INFORMATIONAL**, excluded from the blocking gate via `turbo test --filter=!@engraph/agent-tools`
  (+ runner `agent-tools:test:informational`). It is 867/885; the 18 failures are later-phase content (`RULES_INDEX`→P4,
  collaboration schemas→P8, codex agents→P6/7). Remove the filter (flip blocking) as each phase lands its content.
- **`repo-validators:check` chains only the 4 GREEN validators** (`lifecycle-scripts`, `pretooluse-guard-routing`,
  `drift`, `fitness-vocabulary`). The other 4 are deferred informational: `stale-script`→P4, `collaboration-state`→P8,
  `subagents`→P6, `portability`(Oak's)→P7. Add each to the blocking chain when its content exists.

**Next-session PRIORITY 1 (before Phase 3): reconcile `02-agent-tools-build-design.md` to as-built (owner-directed).**
That forward-design doc accumulated drift during execution; residual stale claims: §1 tsconfig says `NodeNext`/`ES2022`
(actual inlined config is `ESNext`/`bundler`/`ES2023`); the header says "seven validators" (castr now has eight, incl.
`drift`); §2 says "do NOT wire guards as commit-blocking until Phase 6/8" (superseded — guards were activated in Phase 2
per owner). Authoritative as-built record = the commits + napkin + this tracker; either reconcile the design doc to match
or banner it "superseded by execution — see commits". (The §6 drift validator covers counts/anchors, not free prose, so
this class needs a manual sweep.)

**Resume at Phase 3** — Skills + commands→skills (18 skills incl. the continuity cluster; regenerate adapters
`--prefix=engraph-`). **Re-read Oak's surfaces fresh first** — Oak is a moving target, proved twice today (it advanced to
`2c85bc01` mid-Phase-2, an owner-authored hook fail-open fix).

**Phase-1 follow-up sync (don't conflate phases):** Oak's `2c85bc01` advance also grew `PDR-089` a Decision-7 clause
(Phase-1 append), and touched `documentation-hygiene.md` (Phase 4) + a `.cursor` adapter (Phase 7) — fold in at those
phases. **Latent-gap lesson (commit `11f7e48`):** Phase 1b retired `.agent/practice-context/` but did NOT update the
bespoke `scripts/validate-portability.mjs` and did NOT run `portability:check` in its gate set — so the phase-1 tag was
green while that gate was broken. **Every phase's gate run must include ALL of `qg`**, or "green" hides gaps.

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
