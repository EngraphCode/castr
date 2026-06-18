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

| Thread                                     | Branch                             | Controlling plan                                                                                                                     | Current slice                                                   | Latest identity                                  | Next safe step       |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| **Practice transplant + deep enhancement** | `feat/transplant-engraph-practice` | [oak-practice-transplant.md](../../plans/active/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md) | Phase 6 (memory) — substrate ✅; `active/patterns/` import next | claude-code / opus-4-8 / executor / `2026-06-18` | See §Next Safe Steps |

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
back-flow item recorded). Remaining Phase-6: the OUT items (full `active/patterns/`
import ~131, sub-agent roster expansion, `.agent/state/collaboration/` schemas)
before the `transplant/phase-6` tag + full green `pnpm check` (**branch
`check:ci`-green, re-verified 2026-06-18, exit 0; 126 sonarjs `warn` = D1
transitional, 0 errors**).

## Next Safe Steps

Authoritative sequence: sub-plan
[`06-memory-and-generator-consolidation.md` §4](../../plans/transplant/06-memory-and-generator-consolidation.md)
(reorder a✅…g✅ incl. substrate✅; **`active/patterns/` import ← NEXT** in Phase 6)
and the [transplant tracker §Next steps](../../plans/transplant/README.md). The one deep
enhancement also keeps the remediation backlog 02–07 (5 of 6 reproduced Criticals
still unfixed — 02 = the IR-fidelity proof harness, active, not started), the rest
of the transplant and arc D1–D4, and the feature slice required and unparked — the
owner names which is next; a fresh reproduced product regression pre-empts it.

## Open Owner-Decision Items

- **Oak back-flow target — OPEN (Phase 9).** Re-pinning to Oak `main`
  `ad359a4f` did not decide where castr's upstream feedback lands (the old
  `practice/transplant-to-castr` branch vs main vs a fresh branch). Deferred to
  the Phase-9 feedback step; the running back-flow item list is in
  [`reference-closure.md` §back-flow items](../../plans/transplant/reference-closure.md).
- **D1 lint `warn → error` — path UNCONFIRMED; measure first.** The
  `sonarjs/function-return-type` (121) + `sonarjs/in-operator-type-error` (5)
  warn-downgrade is done, but whether the resolution is code changes or a
  ratified rule-selection is not yet established — measure what the rules
  actually flag before deciding ([d1-sonarjs-findings.md](../../plans/transplant/d1-sonarjs-findings.md),
  treated as suspect; re-derive). Tracked as arc **D1**.
- **Transplant PR delivery strategy + D3 timing — SURFACED (not blocking).** The
  recorded plan is one ~100k-line PR to `main` at transplant close; castr's CI does
  not run `check:ci`, so that merge would land with no CI gate enforcement. Whether
  D3 (CI to the Oak standard) should land before the merge, and whether the single
  PR is split for reviewability, is surfaced for owner at close as
  [`open-questions.md` Q-001](open-questions.md). Not a reopening of the
  single-branch decision (owner, 2026-06-15) — a close-time delivery question.

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
