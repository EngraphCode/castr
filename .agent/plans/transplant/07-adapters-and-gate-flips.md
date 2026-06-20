# Phase 7 — Platform Adapters + Flip `portability`/`subagents` Gates

**Parent plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md) (Phase 7 row)
**Tracker:** [`./README.md`](./README.md) · **Tag on completion:** `transplant/phase-7`
**Status:** ✅ COMPLETE 2026-06-20 — native generator built (TDD), all adapters generated, `portability`+`subagents`
gates flipped blocking-green, bespoke script retired, full `pnpm check:ci` green. Tag: `transplant/phase-7`.
**Oak baseline:** pinned `main` `ad359a4f` (fixed ref for Phases 6–9)

> **Owner steer (2026-06-19):** _"Not in a rush to merge; bring over the FULL Practice — the Practice, agent tools,
> agentic frameworks, processes and protocols. Leave the remediation and focus on finishing the transplant."_
> Interpretation (consistent with `no-manufactured-permission` — an undefined "later" is never): the deep-review
> **remediation backlog 02–07 moves to a named position AFTER the full Practice transplant**, not parked indefinitely.
> Delivery (D3-as-merge-gate + the merge act) is **deprioritised**; capability/parity work (D2, D4) stays in scope as
> part of "the full Practice". This supersedes the roadmap's "(1) remediation; (2) transplant" plan-of-record order
> for the current run. Recorded durably here + in `repo-continuity.md` (not memory-only).

---

## Goal

Make castr's reviewer/sub-agent + rule layer **portable and gate-enforced** across platforms, then flip the two
deferred quality gates (`portability`, `subagents`) to blocking and retire the bespoke
`scripts/validate-portability.mjs`. After this phase, cross-platform adapter parity is a CI invariant, not a
hand-maintained hope.

## Firsthand-verified current vs target (2026-06-19)

| Surface                            | Current                                                                                           | Target (to pass Oak's validators)                                                                               | Generator today?                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `.agent/sub-agents/templates/`     | 15 templates (canonical)                                                                          | unchanged                                                                                                       | n/a (source of truth)                              |
| `.codex/agents/*.toml`             | **18** adapters (persona-expanded: `architecture-expert`→barney/betty/fred/wilma) + `config.toml` | unchanged; bijection-complete                                                                                   | hand-authored                                      |
| `.claude/agents/*.md`              | **absent**                                                                                        | 18 wrappers (frontmatter `name`/`model`/`description` + template-load line into `.agent/sub-agents/templates/`) | **none**                                           |
| `.cursor/agents/*.md`              | **absent dir** (→ `validate-subagents` crashes at `listFiles('.cursor/agents')`)                  | 18 wrappers (same shape)                                                                                        | **none**                                           |
| `.claude/rules/*.md`               | absent                                                                                            | 87 wrappers (≤10 content lines, reference `.agent/rules/`)                                                      | ✅ `validate-portability --fix` writes these       |
| `.agents/rules/*.md`               | absent                                                                                            | 87 wrappers                                                                                                     | ✅ `validate-portability --fix` writes these       |
| `.cursor/rules/*.mdc`              | 3 (pre-transplant)                                                                                | 87 triggers (one per canonical rule)                                                                            | **none** (`--fix` flags but does not write `.mdc`) |
| `.claude/skills`, `.agents/skills` | 20 each ✅                                                                                        | unchanged                                                                                                       | ✅ `skills-adapter-generate`                       |
| `.gemini/`, `.windsurf/`           | absent                                                                                            | additive scale surfaces; **not required by `validate-portability`**                                             | none                                               |

**Gate wiring today** (root `package.json`, verified):

- `portability:check` = `node scripts/validate-portability.mjs` (BESPOKE; blocking). Its 5 Codex assertions
  (`model_reasoning_effort=high`, `sandbox_mode=read-only`, `approval_policy=never`, thin-adapter declaration,
  template reference) are **already enforced** by Oak's `validate-subagents` `REQUIRED_CODEX_SETTINGS` + developer-
  instructions check — so "port the 5 assertions" is **already satisfied** by the subagents validator; confirm, don't
  re-implement.
- `repo-validators:check` = 6 validators (lifecycle, pretooluse-routing, drift, fitness-vocabulary, stale-script,
  patterns-index). `subagents` + Oak `portability` are **NOT** chained (deferred).
- Oak `validate-portability` enforces: skill-classification frontmatter; rule-wrapper presence across
  `.cursor/.claude/.agents`; **cross-platform reviewer-adapter parity** (`reviewer-adapter-parity.ts` — every reviewer
  name present in all of `.cursor/agents` + `.claude/agents` + `.codex/agents`); wrapper line limits; `skills-lock.json`;
  `RULES_INDEX` completeness; Claude hook policy↔settings; skill→permission allowlist.

## The one design fork (DECIDED, doctrine-aligned)

Two paths to the missing `.cursor/agents` (18), `.claude/agents` (18), and `.cursor/rules/*.mdc` (87):

- **A. Hand-author 123 adapter files.** Rejected — off-doctrine. Adapters are **generated thin pointers** (the
  `skills-adapter-generate` precedent; adapter-topology doctrine). 123 hand-maintained wrappers rot immediately and
  break parity on the next template/rule change.
- **B. Generate them (CHOSEN).** Emit `.cursor/agents`, `.claude/agents` from `.agent/sub-agents/templates/` (+ the
  persona map / `.codex/config.toml` registrations), and `.cursor/rules/*.mdc` from `.agent/rules/`. Rule wrappers
  for `.claude`/`.agents` come free from Oak's existing `validate-portability --fix`.

**Transplant-vs-build — SETTLED firsthand at Oak pin `ad359a4f` (2026-06-19): BUILD.** Inspected the pinned Oak tree
(`git ls-tree ad359a4f`): Oak **has** the adapter surfaces (`.cursor/agents` 22, `.claude/agents` 23, `.cursor/rules`
93 `.mdc`, `.gemini` 20, `.windsurf` 1) but ships **no agent-adapter or cursor-trigger generator** — the only code
touching `.cursor/agents`/`.claude/agents` is the validators (`reviewer-adapter-parity.ts`, `validate-subagents.ts`),
not a generator. Oak **hand-maintains** these adapters (and `--fix` writes only the `.claude`/`.agents` rule wrappers).
So there is nothing to transplant: castr **builds a lean native generator** for `.cursor/agents` + `.claude/agents`
wrappers and `.cursor/rules/*.mdc` triggers (from `.agent/sub-agents/templates/` + the persona map + `.agent/rules/`).
This is an **improvement over Oak** (it replaces hand-maintenance — the exact fragility the parity validator polices)
→ recorded as a **Phase-9 Oak back-flow candidate**. Rule wrappers for `.claude`/`.agents` still come free from Oak's
existing `validate-portability --fix`.

## Scope (in / out)

**In:** the generator (transplant or build) for agent wrappers + cursor rule-triggers; generate all missing adapters;
generate the 174 `.claude`/`.agents` rule wrappers via `--fix`; confirm the 5 Codex assertions hold under
`validate-subagents`; flip `portability:check` → Oak `validate-portability`; add `validate-subagents` to
`repo-validators:check`; retire `scripts/validate-portability.mjs`; reverse-closure sweep for the retired script's refs.

**Out / additive:** `.gemini`/`.windsurf` surfaces — **not** required by the portability validator, so not gate-blocking;
include only if the chosen generator emits them cleanly, else a named Phase-7-tail or Phase-9 follow-up (not an
undefined later). Collaboration-machinery activation = Phase 8. Remediation = post-transplant named position.

## Execution order (TDD / proof-first; gate wired blocking only after its estate exists)

1. **Settle generator source** (transplant-vs-build, above). Land the generator with unit tests (it is product-grade
   agent-tools code: deterministic output, frontmatter/template-path correctness).
2. **Generate rule wrappers:** `validate-portability --fix` → writes `.claude/rules` + `.agents/rules` (174). Inspect a
   sample for correctness; confirm ≤10-line wrapper limit.
3. **Generate `.cursor/rules/*.mdc`** (87) via the generator.
4. **Generate `.cursor/agents` + `.claude/agents`** (18 each) via the generator; satisfy `validate-subagents`
   frontmatter + template-load-line + bijection, and `reviewer-adapter-parity` across all 3 platforms.
5. **Confirm Codex assertions:** run `validate-subagents` — verify `REQUIRED_CODEX_SETTINGS` + thin-adapter +
   template-ref hold for all 18 `.codex/agents` (the bespoke script's 5 assertions, now enforced here).
6. **Flip gates blocking:** `portability:check` → `pnpm --filter @engraph/agent-tools validate-portability`; append
   `validate-subagents` to `repo-validators:check`.
7. **Retire** `scripts/validate-portability.mjs`; reverse-closure grep the repo for any reference to it and repoint.
8. **Per-phase verification** (parent plan §Per-phase): `pnpm clean && install` → build → `format` new docs + commit →
   `format:check type-check lint madge depcruise knip` → `skills:check` `portability:check` `repo-validators:check`
   (now incl. subagents+Oak-portability) → `test:all` + `test:e2e` → reference-closure + reverse-closure sweep →
   `git diff --stat transplant/phase-6 HEAD` + clean status → tag `transplant/phase-7`.

## Success criteria

1. `.cursor/agents` (18) + `.claude/agents` (18) + `.cursor/rules` (87) + `.claude/rules` (87) + `.agents/rules` (87)
   present and **generated** (regenerable, not hand-authored), with a `--check` mode proving they are up to date.
2. `portability` (Oak) + `subagents` validators **blocking**, both green; bespoke `scripts/validate-portability.mjs`
   removed; no dangling references.
3. Cross-platform reviewer-adapter parity holds (15 templates / 18 persona adapters across cursor/claude/codex).
4. Full `pnpm check`/`check:ci` green; `transplant/phase-7` tagged; PRESERVE set untouched.

## Risks

- **R1 — generator scope creep.** A general cross-platform adapter generator is bigger than this phase needs. Mitigate:
  scope to exactly the surfaces the two validators require; defer `.gemini`/`.windsurf` unless free.
- **R2 — `--fix` writes 174 files in one go.** Inspect a representative sample + diff before committing; the wrapper
  shape is fixed (≤10 lines, single template/rule reference).
- **R3 — parity churn.** A future template/rule add must regenerate all platforms; the `--check` mode + blocking gates
  are exactly what enforce this (the point of the phase). Document the regenerate command in `AGENT.md`/sub-agents README.
- **R4 — hand-authored Codex adapters vs a new generator.** If we generate `.codex/agents` too, ensure byte-parity with
  the 18 hand-authored TOMLs (or accept generator as new source of truth); if we leave Codex hand-authored, the
  generator emits only cursor/claude — keep the bijection check honest either way.
