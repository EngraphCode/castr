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

> **🔭 SCOPE EXPANDED (owner, 2026-06-20) → the [Oak Parity-or-Better Program](../../plans/transplant/oak-parity-program.md).**
> The deep enhancement now explicitly includes **upgrading every castr agentic system that is simpler than Oak's to
> parity-or-better** ("castr is not meant to stay simple"; ArcAngel named + "not the only thing missing"). The transplant
> manifest was proven incomplete; a firsthand 5-subagent gap audit (all claims re-verified firsthand) produced the
> authoritative verified gap map (4 Tier-A + 6 Tier-B + 8 Tier-C) in `oak-parity-program.md` — now the active deep-enhancement
> executable plan. **transplant Phase 9 is reframed as the closure gate that runs AFTER parity.** Standing directive:
> user-memory `castr-parity-or-better-with-oak` (deliberate-localisation → preserve; unbuilt-gap → upgrade). The branch is
> **pushed to origin** (owner, through `f8b4910`). Landed 2026-06-20: Q-003 statusline (`ebf08b5`), PDR-currency sync
> complete (`5c40adb`/`3787928`), metacognition directive B2 (`fcda10a`).

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

castr's multi-agent collaboration framework is **built and live** as of Phase 8
(2026-06-20) — see the supersession note below. The earlier single-stream operation
was a **constraint of the then-unbuilt framework, not a fit** (owner, 2026-06-18):
multi-agent concurrency is the **goal** of this branch (primary plan's user-impact
line: "active multi-agent collaboration so multiple agents can work on castr
coherently"), so the `.agent/state/collaboration/` substrate, the blocking-green
`collaboration-state`/`subagents` validators, the SessionStart identity hook
(auto-derives the PDR-027 identity into `$CLAUDE_ENV_FILE`), and the
`claims open → heartbeat → close` lifecycle (task 3b: **10 concurrent
separate-process sessions demonstrated collision-safe**, no lost write, encoded as
`claims-concurrency.integration.test.ts`) were enabling infrastructure on the path
to it — now delivered and exercised end-to-end by the first director-led concurrent
stream (2026-06-20). Remaining coordination gap: comms/presence are not yet standing
practice across every session (CI now runs `check:ci` — arc D3 landed).

**The single-stream simplification is now superseded (2026-06-20).** Its trigger —
"building the Phase-8 framework that supports concurrency" (PDR-027 §Amendment Log
2026-04-21 Session 5) — has fired: task 3b proved a second stream collision-safe, so
per-thread records went live. The row below is the **index**; the thread's lane
state + additive PDR-027 identity table live in the activated record (see the
ACTIVE note under the table). A second session joining the thread takes a lane and
adds its identity row there.

| Thread                                     | Branch                             | Controlling plan                                                                                                                     | Current slice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Latest identity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Next safe step                                                   |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Practice transplant + deep enhancement** | `feat/transplant-engraph-practice` | [oak-practice-transplant.md](../../plans/active/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md) | Phase 6 ✅ + Phase 7 ✅ COMPLETE + tagged. **Phase 7 (`transplant/phase-7`, 2026-06-20):** native adapter generator built (`agent-tools/src/agent-adapter-generate/`, TDD); `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) generated; 174 `.claude`/`.agents` rule wrappers via `validate-portability --fix`; `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired. **Phase 8 ✅ COMPLETE + TAGGED** (`transplant/phase-8` @ `8d62197`, 2026-06-20): substrate skeleton + `collaboration-state` gate flip (`059dcf5`) + SessionStart identity hook (`ace99de`) + task 3b claims lifecycle/collision-safety (`0086090`) + task 4b agent-tools-suite-gates (`fd0ffec`) + task 6 generic-surface triage (clean) + task 5 per-thread records ACTIVE done. The tag was cut by the **first director-led concurrent stream** (Director fdb75b + 2 implementers 4aeee2/328f4f exercised the now-active records end-to-end — claims/heartbeats/comms/Director-serialised review), which ALSO landed arc **D3 (`c7f819e`) + D2 (`41b24f8`) + D4 archive/provenance (`0a75231`)** on pushed branches (all on origin). Owner steer 2026-06-19: full Practice transplant first, remediation after (§Next Safe Steps). **Oak Parity-or-Better Program: Tranche 1 ✅ (C1/C2/C6/C4/C5/C7/C8) + Tranche 2 ✅ (A2+A3 hook-policy concept/reappraisal unit — `511326f`/`abe580f`/`31caf78`, `check:ci` green).** Owner inserted the **dependency-currency lane** next (IN PROGRESS 2026-06-21: DC0/DC0b/DC6/DC7/DC8 + **DC1 ts-morph `c8c0a9a` + DC2 @scalar trio `43419d0`** done + Q-006/ADR-049 `00750da`; **DC3 prettier next**, then DC4 ink, DC5 commander, then lane-close PDR), THEN Tranche 3 (A4 statusline → A1 ArcAngel). | claude-code / opus-4-8 / Eclipsed Lurking Moth (consolidator — dedicated curation: napkin rotation + both registers drained empty, PDR-096/097 + PDR-057 amendment) `2026-06-26`; claude-code / opus-4-8 / Stratospheric Kiting Breeze (executor — reason-skill bring R1/R2 + session-completion close) `2026-06-26`; claude-code / opus-4-8 / Coppery Warming Magma (executor — Oak read-model flip to live main + transplant-completeness TC1/TC3a + reason-skill plan) `2026-06-26`; claude-code / opus-4-8 / Soaring Lifting Current (executor — dependency-currency DC1+DC2 emission tier + Q-006/ADR-049) `2026-06-21`; Woodland Bending Glade (executor — dependency-currency dev-tooling + low-risk tiers) `2026-06-21`; Volcanic Charring Hearth (consolidator) `2026-06-21`; Igneous Flaring Hearth (executor — parity Tranche 2) `2026-06-21`; Stormy Sailing Archipelago + Briny Cresting Sextant + Stratospheric Wheeling Horizon + Secret Watching Candle / `2026-06-20` | See [thread record](threads/practice-transplant.next-session.md) |

**Per-thread records are now ACTIVE (2026-06-20, Phase 8 task 5).** The enabling
trigger fired: task 3b proved a second concurrent stream is collision-safe, lifting
the single-stream _constraint_ (it was never a fit). The thread's lane state +
identity history now live in
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
with a `## Lanes` block (one thread, multiple independently-takeable arcs) per
`threads/README.md`. The row above stays the **index** (status at a glance); the
thread record is the source of truth for lanes and the additive PDR-027 identity
table. A second session joining adds its identity row there (additive, never
overwrite).

## Paused Threads

None. The product feature slice
([explicit-additional-properties-support.md](../../plans/current/paused/explicit-additional-properties-support.md))
is **sequenced, not parked** — a required component of the one deep enhancement
with a named position, not a paused continuity thread (owner, 2026-06-09; see
[`no-manufactured-permission`](../../rules/no-manufactured-permission.md)).

## Deep Consolidation Status

**completed this session — 2026-06-26 (Eclipsed Lurking Moth, `dedicated-knowledge-curation`).** Both drainable
registers (`pending-graduations.md`, `open-questions.md`) are **empty**; the napkin was rotated (2026-06-20/06-21
windows archived) and the FIRST-RUN friction worklist relocated to its permanent plan home. Four PDRs landed this
session (PDR-096, PDR-097, the PDR-057 four-lens amendment) and one open question was decided (Q-007 → scoped-blocking,
recorded in the transplant-completeness plan TC3b). The commits + the Core `CHANGELOG.md` are the record — not
duplicated here. **Next deep consolidation: not due** until a new trigger fires (napkin rotation cadence, a fresh
capture batch, or a plan/milestone close). This section is a single current-state pointer, not a closeout log
(per [`permanent-doc-is-the-consolidation-record`](../../rules/permanent-doc-is-the-consolidation-record.md)).

<!-- Historical Phase-6/7/8 closeout detail collapsed 2026-06-21; it lives in git history and in the
artefacts it homed (memory layout, substrate contract, patterns import, sub-agent roster, the phase tags). -->

## Next Safe Steps

> **CURRENT TRUTH (2026-06-27, Stratospheric Kiting Breeze / c56a0f): a firsthand by-loop audit of the Practice
> found a real, under-counted enforcement-layer gap; the [loop-closure remediation plan](../../plans/transplant/practice-loop-closure-remediation.md)
> is a NEW ACTIVE lane and the recommended next-priority.** Owner challenged "have you brought the claims
> mechanism over / how much has been written off." Firsthand by-loop audit (5 read-only subagents, all
> load-bearing claims re-verified) found the Practice has real teeth (skill-adapter/reviewer/hook-policy loops
> CLOSED; 9 wired validators) BUT three failure classes: **(A) genuinely missing enforcement Oak has** — F-95
> coordination gate (`claims open` is ungated → coordination is honor-system), `semantic-merge` executor (absent
> though PDR-049/050 + 9 `merge_class` files demand it → memory-corruption risk), machine-local-paths validator,
> watcher deadline, fitness staleness axes; **(B) doctrine-vs-reality FALSE claims** (verified firsthand: the
> commit skill's pre-commit/commit-msg enforcement model is fictional — pre-commit is prettier-only, commitlint +
> version-guard run nowhere; type-enum/no-type-shortcuts/markdownlint refs all wrong); **(C) deliberate/planned**
> (not gaps). **ROOT: completeness was measured by artefact-presence, never loop-closure — the audit METHOD was the
> bug** (it under-counted the same layer twice → parity **C4 + reference-closure Task-6 RE-OPENED**). Cure: plan
> **LC0** = a loop-closure meta-validator (recur-proof, first), then LC1–LC5. Plan ONLY landed this session
> (`a22ec2c`, no code) + the loop-closure insight conserved in `distilled.md`. **All session work is committed +
> pushed; origin is in sync after the closeout push** (Moth's 6 consolidation commits + my `a22ec2c` loop-closure
> plan + `acd98ef` prompt edit + this closeout). **Owner
> names the next slice** — recommended: loop-closure LC0→LC2 (coordination-safety + memory-integrity outrank the
> earlier TC2/DC3 framing); TC2 (templates), DC3 (prettier), and the parity Tranche-3 (A4→A1) remain valid
> positions. The 2026-06-26 line below is SUPERSEDED on "active-next" by this block but keeps its reason-skill +
> consolidation detail.

> **CURRENT TRUTH (2026-06-26, Stratospheric Kiting Breeze / c56a0f): the reason-skill bring is ✅ DONE; the
> active-next positions are TC2 and DC3.** The **reason-skill parity bring lane is COMPLETE** (`4f0bfe3`,
> `feat(transplant)`): the outward `reason` skill + 1432-line `grammar-of-thinking.md` brought from Oak live
> `main`, localised, full eyeball review clean; `metacognition` back-link completes the pair (now byte-identical
> to Oak); `engraph-reason` adapter generated + discoverable + `Skill(engraph-reason)` wired; gates green
> (portability now **19 skills**). Verify-don't-trust catch: the `citation-as-reasoning` pattern was already
> present (phase-6) and correctly localised — its plan "BRING" disposition was stale, no action. **All this
> session's commits are PUSHED and origin is in sync (owner approved the push):** the prior 5 (`d6aecb6`…`5a031fc`)
>
> - the reason-skill bundle (`4f0bfe3` capability, `bb97128` continuity, `50a8a73` napkin) + this session-close
>   commit. **This supersedes every "LOCAL/unpushed" claim in the superseded blocks below.** **Active-next now:**
>   **TC2** (the completeness lane's plan-templates library — recorded next-priority)
>   and **DC3** (dependency-currency prettier — its own untouched position); the owner names which. **Consolidation
>   done (2026-06-26, Eclipsed Lurking Moth):** the dedicated curation pass that Kiting Breeze ceded is complete —
>   both registers drained empty, napkin rotated, four PDRs landed (096/097 + 057 amendment), Q-007 decided (see
>   §Deep Consolidation Status). The two 2026-06-26 lines below stay authoritative for the completeness lane (TC1/TC3a)
>   detail; TC3b's gate-end-state is now DECIDED (scoped-blocking).

> **CURRENT TRUTH (2026-06-26, Coppery Warming Magma / 48b4a5): the Oak READ MODEL changed and two new
> sub-programs are active under the parity umbrella.** (1) **Oak is read live from `main`, no pin** (owner;
> `practice/castr-pin` deleted) — §Repo-Wide Invariants is authoritative. (2) **Transplant completeness —
> bring the iceberg:** TC1 ✅ (`4283520`, 15 root proxies un-hollowed the commit skill) + TC3a ✅ (`e2e67cc`,
> `validate-markdown-links` ported standalone + census of **225 broken links** = the TC2/TC4 input). Next:
> **TC2** (21-file plan-templates library) → TC1b → TC4 → **TC3b** (markdown-links gate end-state DECISION);
> split-out `reference-direction` + `machine-local-paths` validators. Plan:
> [`transplant-completeness-supporting-infrastructure.md`](../../plans/transplant/transplant-completeness-supporting-infrastructure.md).
> (3) **Reason-skill bring** queued (R1/R2) — [`reason-skill-parity-bring.md`](../../plans/transplant/reason-skill-parity-bring.md).
> **Governing rule: bring-by-default** (default disposition for any Oak capability is BRING). The
> **dependency-currency lane (DC3 prettier next) remains its own untouched next position** — these sub-programs
> were taken ahead of it on owner direction, not instead of it. **4 commits this session, all LOCAL/unpushed**
> (push = owner's call). The 2026-06-21 line below is superseded on "what's active" but its DC3+ detail stays
> authoritative for that lane.

> **CURRENT TRUTH (2026-06-21): the active workstream is the [Oak Parity-or-Better Program](../../plans/transplant/oak-parity-program.md), and transplant Phase 9 is its CLOSURE GATE, not the active slice.** Tranche 1 ✅ (C1/C2/C6/C4/C5/C7/C8) and Tranche 2 ✅ (A2+A3 hook-policy concept/reappraisal unit — `511326f`/`abe580f`/`31caf78`, `pnpm check:ci` green) are COMPLETE. **Next safe step (2026-06-21) = the dependency-currency lane, IN PROGRESS — emission tier underway.** Dev-tooling + low-risk + the two highest-risk emission/IR cycles DONE: DC0 (`f761e12`), DC0b sonarjs (`dcad36b`), DC6 @types/node (`a731765`), DC7 commitlint (`0fd4a4c`), DC8 degit (`bb653c9`), **DC1 ts-morph 27→28 crown jewel (`c8c0a9a`, emission proven byte-identical), DC2 @scalar IR-input trio (`43419d0`, IR-fidelity preserved + dangling-ref fail-fast locked in).** Also landed: @types/node pinned to ^24 (Q-006 → ADR-049, `00750da`) + stale tsconfig include fixed (`43d7f8a`). **Next = DC3 prettier 3.8.3→3.8.4 (emission-formatter; baseline-capture + emitted diff), then DC4 ink (agent-tools runtime), DC5 commander (lib CLI), then lane-close → graduate dependency-currency-discipline to a practice-core pattern-PDR.** Controlling plan [`plans/current/dependency-currency.md`](../../plans/current/dependency-currency.md) §Progress (live) is authoritative. **Tranche 3 (A4 statusline → A1 ArcAngel, full unit) follows the dependency-currency lane.** The decision ledger is clean (Q-001…Q-006 all resolved). Finding routed (own slice): the repo-local `type-assertion-policy` ESLint rule is unregistered in `lib/eslint.config.ts` though `no-type-shortcuts.md` claims structural enforcement. The plan `todos`/§Sequencing and the [thread record](threads/practice-transplant.next-session.md) lanes are authoritative; the Phase-6/7/8/9 prose below is transplant-phase history, superseded on "what is the active slice" by this line.

**Owner steer (2026-06-19): finish the FULL Practice transplant first; not in a rush to merge.** _"Bring over the full
Practice — the Practice, agent tools, agentic frameworks, processes and protocols. Leave the remediation and focus on
finishing the transplant."_ → **Phase 7 ✅ COMPLETE + tagged `transplant/phase-7` (2026-06-20).**

**Phase 8 ✅ COMPLETE + TAGGED (`transplant/phase-8` @ `8d62197`, 2026-06-20):** materialised the
`.agent/state/collaboration/` runtime substrate (seeded empty, two-tier tracked/untracked via `.gitignore`); completed
the WS7 bring of `state-integrity.ts` (Oak-pin `optionalWhenAbsent` hardening); flipped `validate-collaboration-state`
blocking into `repo-validators:check`; tasks 3a/3b/4a/4b ✅ + task 6 generic-surface triage (clean) ✅ + task 5 per-thread
records ACTIVE ✅. **The final acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the first
director-led concurrent stream (2026-06-20):** Director fdb75b + 2 implementers (4aeee2 Lane A, 328f4f Lane B) exercised
the records end-to-end (claims/heartbeats/comms/Director-serialised review with routed reviewers adjudicated firsthand),
`pnpm check` green at the tag, reference-closure clean for scope. That stream ALSO landed arc **D3 (`c7f819e`), D2
(`41b24f8`), D4 archive/provenance (`0a75231`)** on pushed branches (all on origin). Full as-built detail:
[`08-collaboration-active.md`](../../plans/transplant/08-collaboration-active.md) §As-built banner.

**Active slice = transplant Phase 9** (Oak back-flow to a fresh branch off Oak `main` + PDR-currency sync; sub-plan
[`reference-closure.md §back-flow items`](../../plans/transplant/reference-closure.md)). **Arc D3/D2/D4 ✅ landed on
branches (2026-06-20, pushed to origin)** — D3 `c7f819e`, D2 `41b24f8`, D4 `0a75231`; the **statusline wiring fix ✅ LANDED**
(2026-06-20, Lane 3, on the transplant branch — Q-003 resolved); the deferred **release-automation** lane
(owner strategy: semantic-release vs changesets) remains. The
deep-review **remediation backlog 02–07 takes a named position AFTER the transplant** (not parked —
`no-manufactured-permission` holds; an undefined "later" is never). Delivery (the merge act + push of the lane branches)
is **deprioritised** ("not in a rush to merge"). This **supersedes the roadmap's
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
Phase 6 COMPLETE**) and the [transplant tracker §Next steps](../../plans/transplant/README.md). **Phases 7 + 8 ✅
COMPLETE + tagged (`transplant/phase-7`, `transplant/phase-8`, 2026-06-20); next transplant phase = Phase 9 (Oak
back-flow + PDR-currency sync).** The one deep enhancement also keeps the remediation backlog 02–07 (5 of 6 reproduced Criticals still unfixed —
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

**Main→branch sync check ✅ PERFORMED (2026-06-20, owner-directed):** authoritative `git fetch origin --prune --tags` +
divergence analysis. Result — **nothing to integrate**: `origin/feat/transplant-engraph-practice` (`9712113`) is a clean
ancestor of HEAD (local ahead by the 2 Phase-8 commits, behind 0; the opener's "5 unpushed" was a stale local
remote-tracking ref — `reflog` confirms `9712113` was already pushed). `origin/main` advanced to `a71a09a` (PR #2 merged
the zod-compiler branch), but `git log origin/main --not HEAD` surfaces only the zod-compiler monolith — **already
cherry-picked and homed in split form** on the branch (re-integrating would regress the homing). `origin/feat/rewrite`
(`d2c6fb1`, 2025-11-30) is an **unrelated orphan** (empty `merge-base` with HEAD — no shared history). The remote prune
deleted the now-merged `claude/castr-zod-compiler-review-qpre7n` source branch (expected). The 2 Phase-8 commits were
**locally unpushed at that check** — **superseded: the owner has since pushed `feat/transplant-engraph-practice` to
origin through `f8b4910` (2026-06-20)**; only commits after `f8b4910` are now locally ahead.

## Open Owner-Decision Items

None — the transplant decision ledger is clean (Q-001…Q-005 all resolved). The
standing decisions and their rationale live in the thread record's
[§ Standing decisions + Lanes](threads/practice-transplant.next-session.md); the
D1/single-TS-override decision is now
[ADR-050](../../docs/architectural_decision_records/ADR-050-single-workspace-typescript-override.md).

## Repo-Wide Invariants / Non-Goals

Continuity invariants (the non-negotiables a resuming agent must hold):

- **Single branch** `feat/transplant-engraph-practice`; one eventual PR → `main`
  carries everything. Branch/PR state is owned by
  [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Periodic main→branch sync** (owner sign-off 2026-06-20) — at session open,
  before any merge act, and on owner direction, run the
  [`delivery-ledger.md §Main→branch sync discipline`](../../plans/delivery-ledger.md)
  check so no `main`-side commit (landed via a separate branch) is silently
  stranded outside the transplant branch. "Nothing to integrate" is a valid,
  evidence-backed verdict.
- **Roll forward only** — revert; never `reset --hard` / force-push
  ([`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md)).
- **Each transplant phase = one atomic commit + `transplant/phase-N` tag**,
  green-gated (full `pnpm check`) + reference-closure-clean **at the tag**;
  intermediate commits may carry intra-phase forward-refs.
- **Oak is read live from `main`, no pin** (owner, 2026-06-26 — supersedes the
  2026-06-20 rebased-branch pin and every earlier frozen-SHA model). The
  `practice/castr-pin` branch is **deleted**; controlled-sync points (frozen SHA,
  then rebased branch) caused more issues than they solved. castr reads Oak's living
  Practice directly from the local checkout's `main` at whatever it currently is.
  **Always read via `git -C <oak> show main:<path>`** (deterministic; avoids the
  dirty/other-branch working-tree trap that produced a false-absence error
  2026-06-20). The owner keeps `<oak>` =
  `/Users/jim/code/oak-open-curriculum-ecosystem` pulled current.
  **Never anchor a live Oak SHA into castr's permanent docs as a baseline** —
  reference Oak by path/concept and capture what was brought in castr's _own_
  commits. This keeps `no-moving-targets-in-permanent-docs` satisfied: a living
  upstream _source_ read on demand is not a cited moving target.
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
