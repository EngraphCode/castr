# Repo Continuity

Canonical repo-level continuity contract — the operational answer to _"where
are we right now, what's live, what's next."_ Refreshed by `session-handoff`.
It is **subordinate to active plans for scope**: this file indexes threads,
states the continuity invariants, and points at the authoritative scope homes;
it does not restate plan scope. See
[`README.md`](README.md) for the operational-memory authority order and
[PDR-011](../../practice-core/decision-records/PDR-011-continuity-surfaces-and-surprise-pipeline.md)
for the portable doctrine.

## Current State

castr is executing **one deep enhancement** (owner): bring over the entire
Practice / agentic-engineering framework / agent-tools / skill+rule+subagent+hook
definitions **and** fix castr's known issues — the same goal, not competing
priorities. All components live on the single branch
`feat/transplant-engraph-practice`; nothing is parked; the owner names the next
slice.

This block is a pointer, not a second narrative. The authoritative homes:

- **Session-start narrative + current truth:** [`session-continuation.prompt.md`](../../prompts/session-continuation.prompt.md) §Current state.
- **Branch / PR / delivery state (DRY):** [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Transplant scope + per-phase status:** [`oak-practice-transplant.md`](../../plans/active/oak-practice-transplant.md) (contract) and the [transplant tracker](../../plans/transplant/README.md).

## Active Threads

castr runs **single-stream today as a _constraint_, not a fit** (owner, 2026-06-18):
one continuity stream, one branch — **because the multi-agent collaboration
framework that would make concurrent streams safe is not yet built**, not because
the work is naturally single-stream. Multi-agent concurrency is the **goal** of
this branch (see the primary plan's user-impact line: "active multi-agent
collaboration so multiple agents can work on castr coherently"), so per-thread
continuity records **and** the collaboration substrate are **enabling
infrastructure on the path to it** — not a consequence to wait for. The binding
gap is the unbuilt Phase-8 substrate (`.agent/state/collaboration/` absent; the
`collaboration-state`/`subagents` validators deferred-by-design; comms/presence
not active) plus branch/CI coordination (CI does not yet run `check:ci`, arc D3).
Per-thread records are the cheapest **leaf** of that capability, not the thing
that lifts the constraint.

While single-stream, the operational simplification still holds (PDR-027
§Amendment Log 2026-04-21 Session 5): the row below **is** the continuity record
and no separate `threads/<slug>.next-session.md` file is needed _yet_. But the
trigger to activate per-thread records is **building the Phase-8 framework that
supports concurrency** — not concurrency "spontaneously arising", which is
circular (concurrency cannot arise until the support, including per-thread
continuity, exists). The convention is seeded and ready (`threads/README.md`);
the prompt + tracker carry the single stream today.

| Thread                                     | Branch                             | Controlling plan                                                                                                                     | Current slice                                                                                                                                                                                                                                                                                                                                              | Latest identity                                  | Next safe step       |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| **Practice transplant + deep enhancement** | `feat/transplant-engraph-practice` | [oak-practice-transplant.md](../../plans/active/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md) | Phase 6 ✅ COMPLETE + tagged `transplant/phase-6` (`a63aee3`, pushed); zod-compiler report-plan homed (`3db3461`). **Phase 7 IN PROGRESS** — sub-plan `transplant/07-adapters-and-gate-flips.md` authored; build a native adapter generator (Oak ships none). Owner steer 2026-06-19: full Practice transplant first, remediation after (§Next Safe Steps) | claude-code / opus-4-8 / executor / `2026-06-19` | See §Next Safe Steps |

At single-stream scale the row above is the continuity record; the `Latest
identity` column carries the PDR-027 attribution (platform / model / role /
`last_session`) in lieu of a separate `threads/<slug>.next-session.md` file.
Per-thread records activate **as the Phase-8 collaboration framework lands** (the
capability that makes a second stream safe to run) — at which point each stream
gets a `threads/<slug>.next-session.md` record with its own identity table per
`threads/README.md`. The intermediate step the convention already supports is a
`## Lanes` block on this single thread (one thread, multiple lanes) the moment a
second arc becomes safely takeable.

## Paused Threads

None. The product feature slice
([explicit-additional-properties-support.md](../../plans/current/paused/explicit-additional-properties-support.md))
is **sequenced, not parked** — a required component of the one deep enhancement
with a named position, not a paused continuity thread (owner, 2026-06-09; see
[`no-manufactured-permission`](../../rules/no-manufactured-permission.md)).

## Deep Consolidation Status

**Phase-6 memory consolidation — substantially landed (2026-06-18).** Blocks
(a)–(f) + (g) structure & catalogues done: flat memory → Oak `active/` layout;
operational registers materialised + reconciled; napkin drained
(manufactured-permission candidate → new rule `no-manufactured-permission.md`;
transplant-method lessons → `distilled.md`; pre-transplant entries rotated to
`active/archive/`; napkin 480 lines); `repo-continuity.md` authored; root
`memory/README.md` + `executive/README.md` + the three executive catalogues
(`artefact-inventory`, `invoke-code-experts`, `cross-platform-agent-surface-matrix`)
regenerated from castr's real estate. **The full `.agent/memory` dangling-link
sweep is empty.** **Substrate contract ✅ landed (2026-06-18, commit `360923d`)** —
`executive/memory-state-substrate-contracts.{md,manifest.json,schema.json}`
re-authored to castr roots (22 surfaces; the 11 Phase-8 surfaces carry `notes`),
verified firsthand against the live `practice-substrate` consumer; follow-on
`150e628` removed the consumer's two magic-number drift checks (stored-derived-value
anti-patterns that violated the contract's own `stored_derived_values_rule`; Oak
back-flow item recorded). **`active/patterns/` import ✅ landed (2026-06-19):**
130 patterns (132 − 2 UI); `proven_in: imported`; broad source-repo
neutralization (zero Oak refs remain); frontmatter normalized to the canonical 5
categories; the README index is now **generated + strictly gated** by a new
agent-tools CLI `validate-patterns-index` (wired into `repo-validators:check`;
repo-agnostic → Phase-9 Oak back-flow). **Sub-agent roster ✅ landed (2026-06-19,
commit `d5cd4eb`):** firsthand grounding showed the real driver was completing the
**half-built expert system** castr's own `invoke-*` rules already required (3 dangling
rules, one owner standing doctrine) — not the opener's "13 generic" framing. 9 new
lean castr-native templates → roster **6→15** (`architecture-expert` 4-persona +
`assumptions`/`config`/`docs-adr`/`mcp`[emission]/`onboarding`/`release-readiness`/
`security`[input-DoS]/`subagent-architect`); persona + reviewer-team components; 12
Codex adapters (existing 6 backfilled; pre-existing `config.toml` path-bug fixed); 3
dangling rules reconciled; roster-of-record surfaces in lockstep. `subagents` gate flip

- `.cursor`/`.claude` wrappers = **Phase 7** (validator needs `.cursor/agents`; Codex
  layer firsthand-verified compliant). **Collaboration state schemas ✅ LANDED (2026-06-19
  s3) — brought Oak WS7** (commit `6d1e45f3`): the 5 `*.schema.json` relocated to committed
  source `agent-tools/src/collaboration-state/schemas/` + validator schema-root decoupled
  from the data path; no `.agent/state/` runtime plane created (stays Phase-8). Full `pnpm
check` green; agent-tools informational suite 13 → 1 (pre-existing `clerk-expert` P7 item).
  **Two follow-on Phase-6 items ✅ DONE (owner-directed):** substrate reviewer-route re-point (22 surfaces
  mirror Oak reconciled to castr's roster) + `agent-collaboration-channels.md` authored (routing
  index/contract; runtime surfaces = Phase-8 forward-refs). **All three standing deferred items ✅ RESOLVED
  this session (owner-directed):** Oak back-flow target (fresh branch off Oak main); **D1 lint (TS-version
  skew root-fixed — single-TS pnpm override; both rules back at `error`, 0 violations; the 126 transitional
  warnings are GONE)**; Q-001 (D3 before merge, split PRs). **`transplant/phase-6` tag ✅ CUT (`a63aee3`) + pushed; Phase 6 COMPLETE.**

## Next Safe Steps

**Owner steer (2026-06-19): finish the FULL Practice transplant first; not in a rush to merge.** _"Bring over the full
Practice — the Practice, agent tools, agentic frameworks, processes and protocols. Leave the remediation and focus on
finishing the transplant."_ → **Active slice = transplant Phase 7** (sub-plan
[`07-adapters-and-gate-flips.md`](../../plans/transplant/07-adapters-and-gate-flips.md)), then Phase 8, Phase 9, plus arc
**D2/D4** (parity work = part of "the full Practice"). The deep-review **remediation backlog 02–07 takes a named position
AFTER the transplant** (not parked — `no-manufactured-permission` holds; an undefined "later" is never). Delivery
(D3-as-merge-gate + the merge act) is **deprioritised** ("not in a rush to merge"). This **supersedes the roadmap's
"(1) remediation; (2) transplant" plan-of-record order** for the current run; the roadmap + primary-plan sequence notes
are to be reconciled to this within the Phase-7 commit.

Authoritative sequence: sub-plan
[`06-memory-and-generator-consolidation.md` §4](../../plans/transplant/06-memory-and-generator-consolidation.md)
(reorder a✅…g✅ incl. substrate✅ + `active/patterns/`✅ + sub-agent roster✅ + state-schemas✅ +
reviewer-routes✅ + channels-card✅; **collaboration state schemas LANDED via Oak WS7** — schemas relocated to
committed source `agent-tools/src/collaboration-state/schemas/` + validator decoupled, no runtime `.agent/state/`
plane created; the two follow-on items (reviewer-route re-point, `agent-collaboration-channels.md`) DONE; **all three
standing deferred items RESOLVED** (back-flow target → fresh branch off Oak main; D1 → TS-skew root-fixed, rules at
`error`, 0 violations; Q-001 → D3-before-merge + split PRs); **`transplant/phase-6` ✅ CUT (`a63aee3`) + pushed —
Phase 6 COMPLETE**) and the [transplant tracker §Next steps](../../plans/transplant/README.md). **Next transplant phase
= Phase 7 (platform adapters: `.cursor`/`.claude` rule+sub-agent wrappers, then flip the `portability`/`subagents`
gates).** The one deep enhancement also keeps the remediation backlog 02–07 (5 of 6 reproduced Criticals still unfixed —
02 = the IR-fidelity proof harness, active, not started), the rest of the transplant and arc **D2–D4** (D1 ✅ done), and
the feature slice required and unparked — the owner names which is next; a fresh reproduced product regression pre-empts
it.

**Incoming from `main` ✅ HOMED (2026-06-19):** `origin/main` commit `ccd9c7a` (the zod-compiler report-plan, written on
branch `claude/castr-zod-compiler-review-qpre7n` against castr `393e476`) was cherry-picked onto
`feat/transplant-engraph-practice` and **split to its proper homes per its own "Note to the consuming/homing agent"**:
findings + §0/§1/§8/§9 → `.agent/research/zod-compiler/README.md`; §3 comparison + appendices A–D → `comparison.md`; §2
corrections (the prior report is **not** in-repo, so homed as verified current-reality + a provenance pointer from
`architecture-review-packs/README.md`) → `corrections.md`; **§4 reasoning trail PRESERVED** → `reasoning-trail.md`; the
plan (§5 verb model + §6 Phases A–F) → `.agent/plans/future/castr-surface-architecture-and-verb-model.md` (+ `castr-check-verb.md`
atomic Phase-D plan); the atomisation decision (§7) → **ADR-048** (Proposed; clarifies ADR-043's scope via a banner; the
D2 "ADR-048 candidate" was re-pointed to 049). Monolith removed (content fully conserved; homing map in the research
README). _Meta still live: this was a main→branch divergence — work landed on `main` outside the single-transplant-branch
invariant; the periodic main→branch sync check (cf. the Oak PDR-currency sync) is still wanted so future main-side commits
are not stranded._

## Open Owner-Decision Items

- **Oak back-flow target — RESOLVED (owner, 2026-06-19 s3): a fresh branch off
  current Oak `main`** (e.g. `practice/castr-backflow`), PR'd to Oak `main`. Not
  the stale `practice/transplant-to-castr` branch, not a direct-to-main PR with no
  staging branch. Execution remains a **Phase-9** deliverable (the back-flow report
  - the running item list in
    [`reference-closure.md` §back-flow items](../../plans/transplant/reference-closure.md));
    only the destination is now fixed.
- **D1 lint `warn → error` — RESOLVED (owner-directed root fix, 2026-06-19 s3).**
  Measured firsthand: the 126 sonarjs violations were a **TypeScript-version skew**
  (plugin's bundled TS 5.9.3 `TypeFlags` constants masked against TS-6.0.3 type
  objects — wrong bits), **not** refactorable code. Fixed at root by pinning a single
  workspace TypeScript (`pnpm-workspace.yaml` `overrides: typescript: 6.0.3`); under
  aligned TS both rules flag **0** and were **restored to `error`** in
  `lib/eslint.config.ts`. Full `pnpm check` green. Root-cause record:
  [d1-sonarjs-findings.md §0](../../plans/transplant/d1-sonarjs-findings.md).
- **Transplant PR delivery strategy + D3 timing — RESOLVED (owner, 2026-06-19 s3):
  D3 before the merge, split PRs.** Land D3 (CI runs the full `check:ci` chain,
  SHA-pinned actions) **before** the transplant merge, and split the ~100k-line
  transplant into reviewable PRs — removing the Q-001 ungated-big-merge risk and
  making review tractable. Recorded at [`open-questions.md` Q-001](open-questions.md)
  - [`08-collaboration-active.md` §3](../../plans/transplant/08-collaboration-active.md).
    Not a reopening of the single-branch decision (owner, 2026-06-15) — a close-time
    delivery decision now made.

(The PDR-currency mechanism is **resolved**, not open — adopt Oak amendments at a
periodic D4/P9 "PDR currency sync"; owner, 2026-06-17.)

## Repo-Wide Invariants / Non-Goals

Continuity invariants (the non-negotiables a resuming agent must hold):

- **Single branch** `feat/transplant-engraph-practice`; one eventual PR → `main`
  carries everything. Branch/PR state is owned by
  [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Roll forward only** — revert; never `reset --hard` / force-push
  ([`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md)).
- **Each transplant phase = one atomic commit + `transplant/phase-N` tag**,
  green-gated (full `pnpm check`) + reference-closure-clean **at the tag**;
  intermediate commits may carry intra-phase forward-refs.
- **Oak is pinned** at `main` `ad359a4f` for Phases 6–9 (a fixed ref, not a
  moving target).
- **Nothing is parked — named positions only**
  ([`no-manufactured-permission`](../../rules/no-manufactured-permission.md)); a
  deferral without a named position is drift.
- **`.agent` is NOT prettier-ignored** — `pnpm exec prettier --write` new docs
  every phase (`check:ci`/pre-push runs `format:check`, not `format`).

Engineering non-negotiables are owned by
[`principles.md`](../../directives/principles.md) and
[`AGENT.md`](../../directives/AGENT.md) — IR-is-truth-after-parsing, fail-fast,
strict-and-complete-everywhere, lossless-by-default, deterministic output. Do not
restate them here; hold them.

**Green gates ≠ no bugs.** The 2026-06-04 deep review reproduced 6 Critical
defects the green gates do not catch (packaging/types, security AND→OR, `$ref`
round-trips, IR round-trip throw, Zod parser/writer losses). Start at
[`.agent/report/initial-review/`](../../report/initial-review/); remediation
backlog 02–07 is a required, unparked component.
