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
infrastructure on the path to it** — not a consequence to wait for. The remaining
gap (after Phase-8-partial, 2026-06-20): the `.agent/state/collaboration/` substrate
skeleton now exists, the `collaboration-state`/`subagents` validators are
blocking-green, and the **SessionStart identity hook is now wired** (auto-derives
the PDR-027 identity into `$CLAUDE_ENV_FILE`). **Live claim registration is now
exercised end-to-end (task 3b, 2026-06-20):** the `claims open → heartbeat → close`
lifecycle ran against the real substrate and **10 concurrent separate-process
sessions were demonstrated collision-safe** (no lost write; encoded as
`claims-concurrency.integration.test.ts`). Still open: comms/presence are not active
as standing practice — plus branch/CI coordination (CI does not yet run `check:ci`,
arc D3).

**The single-stream simplification is now superseded (2026-06-20).** Its trigger —
"building the Phase-8 framework that supports concurrency" (PDR-027 §Amendment Log
2026-04-21 Session 5) — has fired: task 3b proved a second stream collision-safe, so
per-thread records went live. The row below is the **index**; the thread's lane
state + additive PDR-027 identity table live in the activated record (see the
ACTIVE note under the table). A second session joining the thread takes a lane and
adds its identity row there.

| Thread                                     | Branch                             | Controlling plan                                                                                                                     | Current slice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Latest identity                                                                                                                                   | Next safe step                                                   |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Practice transplant + deep enhancement** | `feat/transplant-engraph-practice` | [oak-practice-transplant.md](../../plans/active/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md) | Phase 6 ✅ + Phase 7 ✅ COMPLETE + tagged. **Phase 7 (`transplant/phase-7`, 2026-06-20):** native adapter generator built (`agent-tools/src/agent-adapter-generate/`, TDD); `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) generated; 174 `.claude`/`.agents` rule wrappers via `validate-portability --fix`; `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired. **Phase 8 ✅ COMPLETE + TAGGED** (`transplant/phase-8` @ `8d62197`, 2026-06-20): substrate skeleton + `collaboration-state` gate flip (`059dcf5`) + SessionStart identity hook (`ace99de`) + task 3b claims lifecycle/collision-safety (`0086090`) + task 4b agent-tools-suite-gates (`fd0ffec`) + task 6 generic-surface triage (clean) + task 5 per-thread records ACTIVE done. The tag was cut by the **first director-led concurrent stream** (Director fdb75b + 2 implementers 4aeee2/328f4f exercised the now-active records end-to-end — claims/heartbeats/comms/Director-serialised review), which ALSO landed arc **D3 (`c7f819e`) + D2 (`41b24f8`) + D4 archive/provenance (`0a75231`)** on unpushed branches. Owner steer 2026-06-19: full Practice transplant first, remediation after (§Next Safe Steps) | claude-code / opus-4-8 / Briny Cresting Sextant (director) + Stratospheric Wheeling Horizon (impl) + Secret Watching Candle (impl) / `2026-06-20` | See [thread record](threads/practice-transplant.next-session.md) |

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

**completed this handoff — 2026-06-20 (Phase-8 tag + first concurrent-stream session).**
The first director-led concurrent stream cut `transplant/phase-8` (@ `8d62197`) and landed arc
D3/D2/D4 on branches. Closeout: the **first-run collaboration-setup friction harvest** (owner-directed
"record all frustrations and issues") captured durably in the napkin — F1–F7 + N1–N11, headline
**F6/N10** (armed Monitor watcher silently coalesces events during idle windows → an agent goes dark
despite a correct watcher; team-doctrine cure = catch-up-sweep on every wake) graduated to
user-memory `monitor-watcher-coalesces-idle-notifications`; the coordinate-dependent-lane-base lesson
captured (Director mis-assigned D2's branch base as if surface-disjoint; D2/D3 share ci.yml). ADR/PDR
candidates from the friction captured to `pending-graduations.md`; owner-decision items
(statusline wiring, release-automation strategy) to `open-questions.md`. All three seat claims closed;
Director claim closed at handoff end. The historical records below are retained for continuity.

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
finishing the transplant."_ → **Phase 7 ✅ COMPLETE + tagged `transplant/phase-7` (2026-06-20).**

**Phase 8 ✅ COMPLETE + TAGGED (`transplant/phase-8` @ `8d62197`, 2026-06-20):** materialised the
`.agent/state/collaboration/` runtime substrate (seeded empty, two-tier tracked/untracked via `.gitignore`); completed
the WS7 bring of `state-integrity.ts` (Oak-pin `optionalWhenAbsent` hardening); flipped `validate-collaboration-state`
blocking into `repo-validators:check`; tasks 3a/3b/4a/4b ✅ + task 6 generic-surface triage (clean) ✅ + task 5 per-thread
records ACTIVE ✅. **The final acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the first
director-led concurrent stream (2026-06-20):** Director fdb75b + 2 implementers (4aeee2 Lane A, 328f4f Lane B) exercised
the records end-to-end (claims/heartbeats/comms/Director-serialised review with routed reviewers adjudicated firsthand),
`pnpm check` green at the tag, reference-closure clean for scope. That stream ALSO landed arc **D3 (`c7f819e`), D2
(`41b24f8`), D4 archive/provenance (`0a75231`)** on unpushed branches. Full as-built detail:
[`08-collaboration-active.md`](../../plans/transplant/08-collaboration-active.md) §As-built banner.

**Active slice = transplant Phase 9** (Oak back-flow to a fresh branch off Oak `main` + PDR-currency sync; sub-plan
[`reference-closure.md §back-flow items`](../../plans/transplant/reference-closure.md)). **Arc D3/D2/D4 ✅ landed on
branches (2026-06-20, unpushed)** — D3 `c7f819e`, D2 `41b24f8`, D4 `0a75231`; the **statusline wiring fix ✅ LANDED**
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
deleted the now-merged `claude/castr-zod-compiler-review-qpre7n` source branch (expected). The 2 Phase-8 commits remain
**locally unpushed** (delivery deprioritised per the owner steer).

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

- **Statusline identity wiring — ✅ RESOLVED (owner, 2026-06-20: "fix now", Lane 3).** Both `.claude/` wiring pieces
  Oak has at the pin are now landed on `feat/transplant-engraph-practice`: `.claude/scripts/statusline-identity.mjs`
  (soft-fail shim, ported verbatim) + the `statusLine` block in `.claude/settings.json`. PDR-027 identities now render
  in the status bar (verified firsthand end-to-end; config-expert + code-reviewer PASS). Full record + the optional
  `validate-statusline-routing` hardening follow-up at [`open-questions.md §Q-003`](open-questions.md) and
  [`pending-graduations.md`](pending-graduations.md).
- **Release automation strategy — OPEN (surfaced 2026-06-20, D3 stream).** castr has no release tooling; the dead
  `publish.yml` (non-existent `pnpm release`) was removed in D3. **Owner decision: adopt semantic-release (Oak parity)
  vs changesets** — cross-surface (package.json), a separate lane. Recorded at [`open-questions.md`](open-questions.md)
  - the thread-record release-automation lane.

(The PDR-currency mechanism is **resolved**, not open — adopt Oak amendments at a
periodic D4/P9 "PDR currency sync"; owner, 2026-06-17.)

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
- **Oak sync pin is a rebased branch, not a frozen SHA** (owner, 2026-06-20). castr
  syncs from the local Oak checkout's `practice/castr-pin` branch — created off Oak
  `main` and **rebased off `main` at controlled points** (see the rebase tripwire in
  the [transplant tracker](../../plans/transplant/README.md)). The pin **may go
  stale** — its only job is to control _when_ castr absorbs Oak's living Practice,
  not to freeze it; a frozen SHA would eventually import stale doctrine. Currently
  synced to `ad359a4f` (= Oak `main` HEAD, 2026-06-20). **Always read the pin via
  `git -C <oak> show practice/castr-pin:<path>` — NEVER the Oak working tree** (it
  may sit on an unrelated branch; that exact trap produced a false-absence error
  2026-06-20). This is distinct from `no-moving-targets-in-permanent-docs` (which
  governs castr's _own_ docs citing moving Oak _plans_) — a living upstream source
  is correctly a controlled-moving target.
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
