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
priorities. **The transplant branch merged to `main` in PR #3 (`5529436`,
2026-07-03); work now proceeds on FEATURE BRANCHES off `main`, one PR per slice,
merges owner-invoked** (see §Repo-Wide Invariants). Nothing is parked; the owner
names the next slice.

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

| Thread                                     | Branch                             | Controlling plan                                                                                                                     | Current slice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Latest identity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Next safe step                                                   |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Practice transplant + deep enhancement** | `feat/transplant-engraph-practice` | [oak-practice-transplant.md](../../plans/active/oak-practice-transplant.md) + [transplant tracker](../../plans/transplant/README.md) | Phase 6 ✅ + Phase 7 ✅ COMPLETE + tagged. **Phase 7 (`transplant/phase-7`, 2026-06-20):** native adapter generator built (`agent-tools/src/agent-adapter-generate/`, TDD); `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) generated; 174 `.claude`/`.agents` rule wrappers via `validate-portability --fix`; `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired. **Phase 8 ✅ COMPLETE + TAGGED** (`transplant/phase-8` @ `8d62197`, 2026-06-20): substrate skeleton + `collaboration-state` gate flip (`059dcf5`) + SessionStart identity hook (`ace99de`) + task 3b claims lifecycle/collision-safety (`0086090`) + task 4b agent-tools-suite-gates (`fd0ffec`) + task 6 generic-surface triage (clean) + task 5 per-thread records ACTIVE done. The tag was cut by the **first director-led concurrent stream** (Director fdb75b + 2 implementers 4aeee2/328f4f exercised the now-active records end-to-end — claims/heartbeats/comms/Director-serialised review), which ALSO landed arc **D3 (`c7f819e`) + D2 (`41b24f8`) + D4 archive/provenance (`0a75231`)** on pushed branches (all on origin). Owner steer 2026-06-19: full Practice transplant first, remediation after (§Next Safe Steps). **Oak Parity-or-Better Program: Tranche 1 ✅ (C1/C2/C6/C4/C5/C7/C8) + Tranche 2 ✅ (A2+A3 hook-policy concept/reappraisal unit — `511326f`/`abe580f`/`31caf78`, `check:ci` green).** Owner inserted the **dependency-currency lane** next (IN PROGRESS 2026-06-21: DC0/DC0b/DC6/DC7/DC8 + **DC1 ts-morph `c8c0a9a` + DC2 @scalar trio `43419d0`** done + Q-006/ADR-049 `00750da`; **DC3 prettier next**, then DC4 ink, DC5 commander, then lane-close PDR), THEN Tranche 3 (A4 statusline → A1 ArcAngel). | claude-code / opus-4-8 / Open Lofting Feather (executor — loop-closure LC3a machine-local-paths validator + cure + closeout) `2026-06-28`; claude-code / opus-4-8 / Hidden Veiling Mirror (executor — loop-closure LC0 meta-validator + LC1 F-95 gate + LC2 semantic-merge skill+tripwire) `2026-06-27`; claude-code / opus-4-8 / Eclipsed Lurking Moth (consolidator — dedicated curation: napkin rotation + both registers drained empty, PDR-096/097 + PDR-057 amendment) `2026-06-26`; claude-code / opus-4-8 / Stratospheric Kiting Breeze (executor — reason-skill bring R1/R2 + session-completion close) `2026-06-26`; claude-code / opus-4-8 / Coppery Warming Magma (executor — Oak read-model flip to live main + transplant-completeness TC1/TC3a + reason-skill plan) `2026-06-26`; claude-code / opus-4-8 / Soaring Lifting Current (executor — dependency-currency DC1+DC2 emission tier + Q-006/ADR-049) `2026-06-21`; Woodland Bending Glade (executor — dependency-currency dev-tooling + low-risk tiers) `2026-06-21`; Volcanic Charring Hearth (consolidator) `2026-06-21`; Igneous Flaring Hearth (executor — parity Tranche 2) `2026-06-21`; Stormy Sailing Archipelago + Briny Cresting Sextant + Stratospheric Wheeling Horizon + Secret Watching Candle / `2026-06-20` | See [thread record](threads/practice-transplant.next-session.md) |

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

**Dedicated knowledge-curation pass — 2026-07-03 (Fiery Flaring Bellows / bafbac).** Owner-invoked
`consolidate-until-done` in an n=2 window (Windswept Winging Cliff on CI watch; boundaries
coordinated live). Knowledge homed: **PDR-124** (multi-agent audit-harness pattern, `pdr_kind:
pattern`, **Proposed** — owner walk in the closeout) authored from its two worked instances (the
2026-06-28 gap rescan + the 2026-07-03 delta review), numbered above Oak main's highest to honour
the Q-009 mapping-table decision; the **gate-collision coordination discipline** graduated into
`check-singleton-per-window` §Peer-In-Flight Collisions (owner ruling + three worked instances
across two windows, the third firing live inside this pass); the commit skill gained the two
measured staging gotchas (already-staged deletion aborts `git add`; enqueue from `git diff HEAD`
after a formatter) + the repo `type-enum` override note (no `ci` type); `testing-strategy.md`
gained the coverage-is-a-signal corollary (higher-level suites deliberately not coverage-fed);
`distilled.md` gained the tsx-enclave and scanning-settings-can-disable-a-workflow lessons + the
zsh-arrays refinement; the oak-backflow ledger gained three measured rows (statusline WS4.1 seam,
absent-registry solo-floor fix, coverage wiring). Buffers at rest (post-walk): `open-questions`
EMPTY — Q-009/Q-011 drained (homes verified); Q-008 DECIDED mechanise-now → the
`archive-pii-scrub` plan (full `--check`/`--write` tool = next implementation slice; two-layer
publish precondition incl. the git-history layer); **Q-010 RULED (owner): Result and fail-fast
COMPOSE — `Result<T,E>` is the correct pattern AND fail-fast is required everywhere; the
fail-fast-therefore-no-Result framing is RETIRED, FULL reach** (use-result-pattern becomes a
bring; a D4-seam Result-migration slice is named — both in the gap-rescan backlog §Owner-ruling
additions). `pending-graduations` holds only the trigger-gated loop-closure item (LC3b/3d/4/5
outstanding; owner-walked, confirmed genuinely event-gated). Fitness at rest: nothing worse
than soft. Napkin NOT rotated (below threshold).
Experience audit clean — the emergent cross-read (a confident frame invalidated by a default that
should load earlier) is already captured as `passive-guidance-loses-to-artefact-gravity`. Queue
residue: four self-documenting abandoned intents left in place (no sanctioned CLI cleanup; work
demonstrably landed). **Named follow-up (pre-merge work, NOT curation): merge-event continuity
reconciliation** — the single-branch-invariant text and branch-scoped continuity blocks need a
supersession pass when PR #3 merges (flagged by Cliff 2026-07-03, held as a named position).
**Owner-walk residue:** PDR-124 status flip; a proposed PDR-097 amendment (audit-to-zero via
annotated workspace overrides carrying explicit removal conditions). **Next deep consolidation:
not due** until a fresh trigger (napkin rotation cadence, a fresh capture batch, or the
loop-closure lane completing → the PDR-096 amendment + the register's last item).

**Prior: deep handoff + consolidation — 2026-06-28 (Open Lofting Feather).** Owner-invoked deep-deep handoff
(`session-handoff`/`consolidate-docs`) + a recursive "what would be lost?" scan, after a generative session: LC3a
machine-local-paths validator; the bring-everything disposition (PDR-005 §Default amendment + user-memory + thread
standing-decision); the husky commit-msg guardrail (LC4-1); and a two-pass Oak→castr gap rescan (the authoritative
bring backlog, `oak-castr-gap-rescan-2026-06-28.md`). Captured this pass (durable, in-repo): workflow-design
meta-lessons (napkin + a `distilled.md` entry — completeness-critic + 2nd-pass audit harness, critic-presence-rechecks-
unreliable, firsthand-ground-truth-arms-verification); Oak-backflow ledger extended (loop-closure-references,
agent-adapter-generate, semantic-merge module, schema reviewers, bring-by-default §Default disposition, the audit
harness); open decisions Q-009 (PDR 096/097 numbering-collision scheme) + Q-010 (principles.md Result-vs-fail-fast
tension); pending-graduations multi-agent-audit-harness pattern candidate. Buffers healthy: napkin ~290 (<500, no
rotation); `distilled.md` ~54 (<200); `pending-graduations.md` 2 items (PDR-096-amendment + audit-harness, both
trigger-NOT-fired); `open-questions.md` 3 open (Q-008/009/010, all owner-facing); incoming box empty; entry points
thin pointers, no drift; no track cards / open conversations / escalations; all session claims closed. No Practice-Core
amendment beyond the owner-directed PDR-005 §Default. **Follow-on (2026-06-28, same session): plan-system coherence
review + consolidation** — de-staled the 3 orientation surfaces (roadmap / transplant-tracker / session-continuation
prompt) to point at the single Axis-A backlog; folded LC/TC/parity plans into `oak-castr-gap-rescan-2026-06-28.md`
(one ordered spine + banners); collapsed Next Safe Steps to one SINGLE-FRONTIER block (3 axes); recorded Q-011 (axis
A/B/C sequencing). The commits + permanent homes are the record. **Next deep
consolidation: not due** until a new trigger (napkin rotation cadence, a fresh capture batch, or a milestone close —
e.g. the loop-closure lane completing → PDR-096 amendment, or a 2nd audit-harness instance → the pattern-PDR).

<!-- Historical Phase-6/7/8 closeout detail collapsed 2026-06-21; it lives in git history and in the
artefacts it homed (memory layout, substrate contract, patterns import, sub-agent roster, the phase tags). -->

## Next Safe Steps

> **🧭 CURRENT TRUTH (2026-07-03 evening, Windswept Winging Cliff / 0ceb5f closeout — THE next-step spine for
> incoming agents).** The 2026-07-03 three-session day landed, in order: the OCE↔castr **delta review** (plan +
> as-built [`oak-castr-delta-review-2026-07-03.md`](../../plans/transplant/oak-castr-delta-review-2026-07-03.md);
> the **§Delta amendment** lives in the single backlog
> [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md)); **statusline
> S1** (`7a37dec` + ctx-on-title-row `cb264d7` + checkout-name title `e1d204c` by Bellows — the enhanced statusline
> is LIVE; S2 Cursor wing + S3 logo pipeline remain, manifests ready); **Codex waves 4+5** fixed 9/9 with
> regression tests (`3acf8e5`, `922e51f`) — every PR thread resolved; **hardened git hooks** (owner-directed; the
> Oak-shaped pre-commit chain landed via the owner's `9f12d49`, fired live and caught + cured the hollow
> `markdownlint-staged` action); the **corpus-analysis suite DEFERRED** to the stabilisation-gated
> [`corpus-analysis-suite-bring.md`](../../plans/transplant/corpus-analysis-suite-bring.md); the
> **testing-strategy umbrella** (prove behaviour, never config or content — `c31ca23`); and Bellows's dedicated
> **consolidation** (917d989 + walk outcomes `a16682a`/`1226d9f`: PDR-124 Accepted, Q-008 → the
> [`archive-pii-scrub`](../../plans/current/archive-pii-scrub.md) full-tool plan, **Q-010 RULED: Result and
> fail-fast COMPOSE** → `use-result-pattern` is now a BRING + a D4 Result-migration slice is in the backlog).
> **🧭 SESSION-CLOSE TRUTH (2026-07-03, Fiery Flaring Bellows): PR #4 MERGED to `main` (`32c3f2b`) —
> the CI split (~5 min, fail-closed fan-in), turbo caching (truthful hash, cross-job sharing), the
> feature-branch reconciliation, and the pr-lifecycle skill + pr-watch CLI are ALL LIVE; the
> controlling plan is COMPLETE (moved to `plans/current/complete/`). No feature branch is open.
> CORRECTED (owner, 2026-07-03, post-close): "substrate before product" was the owner's QUESTION,
> not a direction — the earlier "owner-confirmed" phrasing here manufactured a decision. The
> ANSWERED question: castr product/remediation work can start after ONE short doctrine-sync slice
> (the `use-result-pattern` bring + re-sync of the rules a product agent reads first; TSDoc
> enforcement lands with or before the first new product module). Everything else in (2)–(4) is
> PARALLEL-SAFE with product work — disjoint file estates (`lib/` vs `.agent/`+`agent-tools/`),
> feature-branch isolation, live coordination substrate — and Q-011's "Axis A first" condition is
> already satisfied (its Tier-1 spine is complete). Remediation-02 (IR-fidelity harness) may open
> any time after the doctrine slice; the OCE stream continues in parallel uncompromised.
> **THE NEXT SESSION EXECUTES [`pre-castr-doctrine-sync.md`](../../plans/current/pre-castr-doctrine-sync.md)**
> (RS-1 use-result-pattern reconciled to the composition ruling → RS-2 rule re-syncs → RS-3
> validation-strategy overlap-merge → RS-4 TSDoc enforcement), on ONE fresh feature branch off
> `main`; on its completion, product work is UNGATED.**
>
> **NEXT STEPS, in order: (1) ~~PRE-MERGE — the merge-event continuity reconciliation~~ ✅ DONE 2026-07-03
> post-merge (Bellows): PR #3 MERGED (`5529436`); the branching model is now feature-branches-off-main (see
> §Repo-Wide Invariants, the authoritative statement) and the single-branch text is reconciled across
> continuity/ledger/thread/prompt/roadmap/plan surfaces. ALSO LANDED same pass (feat/ci-enhancement, PR #4):
> the CI SPLIT (OCE architecture — parallel gate jobs, fail-closed `quality-gates` fan-in, composite setup;
> ~5min wall-clock; exposed + fixed two latent turbo dependsOn defects) and TURBO CACHING ON with measured
> exceptions (agent-tools#test root-reach; mutating/network tasks) + cross-job cache sharing — plan
> [`turbo-caching-and-branch-model.md`](../../plans/current/complete/turbo-caching-and-branch-model.md).**
> **(2) PARALLEL SUBSTRATE STREAM (NOT a product gate — only the doctrine-sync slice above
> gates product code):** doctrine re-sync wave (consolidate-at-SECOND-consumer rename leads; now also carries the
> `use-result-pattern` bring per Q-010), plan-templates (TC2), validation-strategy directive, TSDoc enforcement,
> encoding-integrity gate, markdown-links wiring + amended ADR-127. **(3) EXECUTION SLICES ANY TIME:** statusline
> S2/S3 (manifests ready), archive-pii-scrub (full tool, owner-decided), D4 Result-migration slice. **(4) AFTER
> RESUME:** coordination-safety cluster, claims-handoff, provenance/archive-move, PDR batch (27, renumbered),
> Tier-2 flow, castr mark (owner creative). Axis B (remediation 02 first) opens any time after the doctrine-sync slice — Q-011's
> Tier-1 condition is already discharged; it does NOT wait for this stream.
>
> **🟢 PR #3 IS MERGE-READY (2026-07-03, Penumbral Slipping Moth closeout): mergeStateStatus CLEAN / MERGEABLE /
> 0 unresolved review threads / required `quality-gates` check GREEN at origin tip `2e616bd`.** Merge posture
> (owner, explicit): the owner INTENDS to merge and will invoke the merge explicitly; the agents' STANDING duty is
> keeping the branch continuously merge-correct and merge-safe (supersedes "delivery deprioritised"). The
> merge-readiness loop shape: **Codex reviews every push and may open a new finding wave** — disposition each wave
> fix-or-reject in the same work item (user-memory `pr-threads-fix-or-reject`) until a push's wave is empty; this
> session took three waves (14 → 5 → 3, all closed). Late landings after `7f53bd2`: `cec8bce` action SHA-pins +
> workspace-coverage guard, `ac0363e` dependency sweep (DC lane CLOSED), `89ac038` turbo 2.10.2, `3cf5972` audit
> overrides (audit ZERO), `c6df0f8`/`b0355e4`/`2e616bd` the three Codex waves (incl. ENGRAPH_ALLOW_MAJOR_VERSION=1
> owner override on the version guard; `git commit -n` gate-bypass block; trusted-git in the commit-queue runtime),
> `966495e` coverage-step test timeout. **Handover residue: `f8111d4` (Cliff's docs bundle) + the Moth closeout
> commit are LOCAL-ONLY — push duty + CI-wave watch explicitly transferred to Windswept Winging Cliff** (handover
> comms event; a push re-verifies via pre-push `check:ci` and triggers CI + possibly a fresh Codex wave to
> disposition). GitHub Code Quality: KEPT (owner-decided; evaluate in operation; GA billing 2026-07-20).
>
> **🧭 SINGLE FRONTIER (2026-06-28) — this block + the one below are the ONLY current "what's next"; every dated block
> further down is history (superseded on next-step).** The "one deep enhancement" has **three axes**: **(A)
> transplant/parity** — ACTIVE; its single ordered backlog is
> [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md) (the LC / TC /
> parity-tranche plans are FOLDED into it — see its "single ordered backlog" section). **(B) product-remediation**
> — **5 reproduced Criticals remain (C2–C6); C1 done.** DORMANT but now a DEFINED "after Tier-1" (Q-011 decided), not
> an undefined later. **(C) delivery** — ~~DEPRIORITISED~~ **superseded 2026-07-03: continuous MERGE-READINESS is a
> standing agent duty; the merge itself is owner-invoked, explicitly (see the 🟢 merge-ready block above).**
> **Q-011 DECIDED 2026-06-28 (owner) → Axis A first.**
> **Tier-1 LANDED + PUSHED 2026-06-28 (Open Lofting Feather), origin = `16cedbf`:** enforcement-integrity cluster —
> ✅ trusted-git (`2ca01be`), ✅ gitleaks secret-scan wired into qg (`ec53da7`), ✅ CI-runs-gates server-side in-repo
> (`38073f1`); collaboration-safety cluster — ✅ worktree-aware coordination-home + dedup of castr's two FS-walk
> resolvers (`16cedbf`), ✅ watcher step-deadline (LC3c, `86be5fb` — comms-watch-errors.ts + loop refactor to
> fatal per-step deadline + step-timeout-ms CLI threading + loop-closure proof; introduced `vi.useFakeTimers`).
> **REFERENCE-DIRECTION LAYER LANDED 2026-06-28 (owner-taught permanence/portability hierarchy):** ✅ PDR-105
> keystone (`fc3b1cb`, at castr-105; Q-009 decided = mapping-table/transient), ✅ `validate-reference-direction`
> validator (`280762a`), ✅ burned down all **83** wrong-direction refs across 45 doctrine files via a 90-agent
> workflow + firsthand review, validator now BLOCKING + wired (`8def837`). **ALSO LANDED 2026-06-28:** the Oak
> **Decision Lenses — Order of Resolution** are now in `.agent/directives/principles.md` (owner-approved genotype
> edit: long-term-excellence → strict-everywhere-all-the-time → simpler/First-Question → dissolve-by-changing-the-system
> → user-value; dissolution before escalation, connects to `PDR-057` four-lens test). Applying them dissolved the two
> Codex-review questions into determinations: ✅ **#8** scoped-bang version-guard regex fixed + tested, ✅ **#6** gitleaks
> documented as a dev prereq (`CONTRIBUTING.md`, Oak parity). **CODEX FINDINGS ALL CLOSED (2026-07-03, Penumbral
> Slipping Moth):** owner directive (standing, user-memory `pr-threads-fix-or-reject`) — every PR thread resolves by
> fix or measured reject in the same work item, never priority-deferral. All **14** threads (9 triaged + 5 from the
> mid-session Codex re-review) dispositioned: 13 fixed TDD-green (`c6df0f8` six-finding batch incl. both P1s —
> MultiEdit guard + worktree-vs-index commit hole; `b0355e4` five re-review fixes incl. UUID-id identity equality,
> missing-fingerprint fail, intent-inactive stage, id-less-row quarantine, flag-cluster matcher), 1 rejected with
> falsifying CI evidence; every thread replied + resolved on GitHub; the transient triage doc deleted per its own
> lifecycle note. **ALSO LANDED 2026-07-03:** coverage reporting wired + proven (v8, in-process suites only —
> baselines lib 83.9% / agent-tools 62.4% lines; ruleset floors set min 70 / drop 1); CI actions SHA-pinned at
> latest stable + a fail-loud workspace-coverage-enumeration guard; full dependency-currency sweep (23 pkgs incl.
> prettier 3.9 emission-proven byte-identical, commander 15, depcruise 18, turbo 2.10.2 via codemod; @types/node
> HELD ^24 per ADR-049) + `pnpm audit` to ZERO via annotated hono/esbuild workspace overrides; publish.yml deleted;
> CodeQL moved to default setup (NOTE: the migration silently disabled the whole CI workflow — re-enabled + proven;
> Code Quality KEPT, evaluate impact-vs-cost before GA billing 2026-07-20). **The single next action** = continue the
> collaboration-safety cluster at **pre-archive provenance + class-tiered archive-move** (PDR-094 doctrine present,
> mechanism absent; inline-quote-first self-containment enforcement — PDR-105-aligned), then
> claims-handoff (LC3b/PDR-063) → **Oak-ADR cite-repair** (the 18 rule→ADR dangling
> links — see below) → plan-templates, bringing
> freely per PDR-005 §Default. **RULES-CLASSIFICATION RESOLVED 2026-06-28 (owner): genotype vs phenotype** —
> operationalised rules/ADRs/hooks are the repo's PHENOTYPE (context-specific expression of the portable Practice-Core
> genotype), so a rule is correctly `repo-doctrine` and rule→ADR is phenotype→phenotype (NOT a portability violation);
> the validator needs no change. The 18 rule→ADR links are therefore a pure DANGLING-LINK defect (Oak-scheme path
> absent), cured by wiring `validate-markdown-links` (castr has it, unwired) + de-link/repoint + bringing ADR-127 — the
> Oak-ADR-cite-repair item, NOT reference-direction. **DELIVERY: PR #3 (feat → main) OPEN + CI GREEN + MERGEABLE/CLEAN as of
> 2026-06-28** (https://github.com/EngraphCode/castr/pull/3; quality-gates ran `check:ci` server-side, success; the
> first run caught `main`'s unformatted PR-#2 research file, fixed by merging origin/main + reformatting). \*\*ONE
>
> > OWNER-ONLY ACTION remaining:** set `quality-gates` as a required status check in the main branch ruleset (GitHub repo
> > setting) — now unblocked since CI is proven green. Parallel
> > castr-internal lanes (NOT Axis A, in the thread record): dependency-currency DC3–5, friction-fix, hook-matcher,
> > LC1 fail-opens; castr-internal cleanups Q-009 (PDR renumber) + Q-010 (Result-vs-fail-fast). Commits are now linted at
> > commit-time (`.husky/commit-msg`). **`origin/feat` = `7907d1f` (reference-direction layer + g/p resolution + Codex-findings triage PUSHED; CI green + PR #3 mergeable); the Decision-Lenses + #8/#6 + handoff commits are the newest local, being pushed this turn. ALWAYS re-verify live with `git rev-parse --short origin/feat/transplant-engraph-practice` (the owner pushes between turns); push = owner's call (already authorised this branch + delivery).\*\*

> **CURRENT TRUTH (2026-06-28, Open Lofting Feather / c82112): the authoritative Oak→castr bring backlog is [`oak-castr-gap-rescan-2026-06-28.md`](../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md).**
> A two-pass ultracode rescan (owner updated OOCE; 26+23 agents, firsthand-validated) produced the
> deduped HAVE/HOLLOW/LACK map + bring backlog, superseding the 2026-06-20 gap inventory in
> `oak-parity-program.md`. **Tier-1 spine** (do first): CI-runs-gates-server-side (= LC5), gitleaks
> secret-scan, trusted-git (unblocks coordination-home + statusline), worktree-aware coordination-home,
> watcher step-deadline (LC3c), pre-archive provenance + archive-move, claims handoff/adopt (LC3b/PDR-063),
> reference-direction validator + PDR-105, Oak-ADR dangling-cite repair + ADR-127, plan-templates + ADR-117 (TC2).
> 23 Oak PDRs missing (096–119, **renumber for the castr-096/097 collision**). Disposition = bring-everything
> (PDR-005 §Default); OUT-OF-SCOPE carve-outs (Oak product stack) recorded in the rescan doc. Firsthand
> corrections folded: `use-result-pattern` is a deliberate non-bring (castr is fail-fast); 3 pass-1
> completeness-critic false-presence claims (pr-watch, .cursor/hooks, reference-docs) corrected — trust the
> lane audits, not critic re-checks. **No repo brings done yet — this is the map; LC3(b/c/d) below + the
> Tier-1 spine are the next execution slices (owner names the order, or bring freely per PDR-005).**

> **CURRENT TRUTH (2026-06-27, Open Lofting Feather / c82112): loop-closure LC3 sub-slice (a) machine-local-paths ✅ DONE; next is LC3(b/c/d).**
> Brought Oak's `validate-no-machine-local-paths` validator (validator + pure helpers + unit tests), localised to castr's
> direct-`git` convention; added a `machine-local-path` regex scoped_block to `policy.json` (single-sources the pattern set
> AND lights the PreToolUse write-time guard repo-wide); wired blocking into `repo-validators:check`. **Loop proven at the
> real layer:** validator found **324 real machine-local hits** across 29 tracked files → exit 1; doctrine-scoped, category-
> aware cure (`archive/` exempt per the rule's own Detection scope; stale self-links → repo-relative; Oak-checkout → `<oak>`;
> vendored/test placeholders → `<user>`) → exit 0 (2240 files clean). The write-guard then fired live blocking a literal path
> in a plan edit. Reviewers (code/test/config) run, findings folded firsthand: `'u'` flag added; an inaccurate "never drift"
> claim corrected; the blocking contract proven (exit 0/1/2 + fail-loud, extracted to testable helpers, parity-or-better over
> Oak). Case-SENSITIVE kept by MEASUREMENT (adding `i` false-positives on lowercase OpenAPI route fixtures). Full `pnpm check`
> green. **(Historical SHA note, superseded by the SINGLE-FRONTIER block above — re-verify origin live.)** `origin/feat` has ADVANCED (was `4799886` → `4615abb` → `c86d4e1`; the owner pushes between turns) —
> the owner pushed the LC0/LC1/LC2 closeout since 2026-06-27, so every prior block's "origin still at `4799886` /
> unpushed" push-state is SUPERSEDED (4799886 is now an ancestor). **Owner correction this session:** don't gate the
> ordering of independent, reversible, all-must-be-done items — choose, signpost, proceed (memory `dissolve-owner-gating-with-four-lenses`
> sharpened). **Next: LC3(b)** PDR-063 claim handoff/adopt, **(c)** watcher step-deadline [C3], **(d)** fitness staleness axes
> → LC4 → LC5. Deferred (recorded, not done): 5 pre-existing dead links surfaced by the cure (doc-hygiene sweep); the
> published-archive-PII question (archive is rule-exempt, Q-008). Detail:
> [`practice-loop-closure-remediation.md`](../../plans/transplant/practice-loop-closure-remediation.md) § As-built (LC3a).
> Supersedes the Hidden Veiling Mirror block below on "what's next" (LC3(a) now done); that block stays authoritative
> for the LC0/LC1/LC2 landing detail.
>
> **ALSO LANDED 2026-06-28 (`3838662`): LC4 item 1 + a STANDING GOVERNANCE CHANGE.** (1) Owner directive recorded to
> stick — **default is BRING; the only no-bring reason is "utterly irrelevant" (or not-cleanly-reversible); never gate a
> relevant bring behind a "case"** (PDR-005 §Default disposition + user-memory `bring-everything-by-default` + thread
> standing-decisions; LC4 reframed wire-vs-correct → wire-by-default). (2) **`.husky/commit-msg` is now LIVE** — every
> `git commit` runs `prevent-accidental-major-version` + `commitlint --edit`, so a non-conforming message is BLOCKED at
> commit (proven: blocks subject-case-bad, passes good); supersedes the provisional 2026-06-15 advisory-only posture.
> Next session: your commit messages are linted at commit-time now (lowercase subject, 7 allowed types).

> **CURRENT TRUTH (2026-06-27, Hidden Veiling Mirror / e8b57e): loop-closure LC0 ✅ + LC1 ✅ + LC2 ✅ DONE; next is LC3.**
> Six commits this session, all `pnpm qg` green, **LOCAL (push = owner's call); origin still at `4799886`.**
> **LC0 (`0c859bd`+`f829783`):** `validate-loop-closure-references` meta-validator (TDD, 40 tests) wired blocking into
> `repo-validators:check`; all 7 hollow `pnpm <script>` doctrine refs cured (check:profile proxy restored; markdownlint
> BROUGHT MD040-only + 29 language-tags; cruise→depcruise; secrets:scan/test:mutation reworded).
> **LC1 (`6372024`+`cc75a86`):** F-95 comms-watcher-presence gate brought + wired into `claims open` (blind-with-peer
> refused, no write; solo fast-path; identity-bound anti-spoof; dead detectStaleWatcher now consumed). Firsthand catch
> beyond the workflow's bring-plan: the `comms watch` writer auto-derives the heartbeat path or the gate falsely blocks
> every claim (brought it). **LC-reopen closed** (parity C4 + reference-closure Task-6 corrected).
> **LC2 (`7351b88`+`c3484da`):** reframed firsthand — Oak's semantic-merge is a PASSIVE skill, not an executor. Brought
> the skill (taxonomy reconciled to castr's MERGE_CLASSES) + a castr-original `.gitattributes` refuse-and-route merge
> driver (registered per-checkout by the postinstall bootstrap); loop closure proven by a REAL `git merge`. Parity-or-better.
> **Deferred (recorded, not done):** the two LC1 Oak-faithful fail-opens (future `--now`; cwd-relative heartbeat path)
> → a hardening slice + Oak back-flow; the CI-doesn't-run-qg finding → LC5. **Next: LC3** (machine-local-paths validator;
> PDR-063 claim handoff/adopt; watcher step-deadline [C3]; fitness staleness axes) → LC4 → LC5. Detail:
> [`practice-loop-closure-remediation.md`](../../plans/transplant/practice-loop-closure-remediation.md) § As-built (LC0/LC1) + LC2 as_built.
> The 2026-06-27 Stratospheric Kiting Breeze block below stays authoritative for the audit/root-cause narrative + the LC framing.

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

- **Branching model (owner, 2026-07-03): feature branches off `main`, one PR per
  slice, merges owner-invoked.** The 2026-06→07 single-branch working mode was a
  CIRCUMSTANCE of the transplant era, never an invariant (owner: _"one branch was
  never an invariant, we just happened to be working off main to start with, now
  we use feature branches"_). It ended when PR #3 merged (`5529436`, 2026-07-03).
  Dated records referencing the "single-branch invariant" describe that era
  truthfully and are not current doctrine. The collaboration substrate (claims /
  comms / commit queue) is branch-agnostic. Branch/PR state is owned by
  [`delivery-ledger.md`](../../plans/delivery-ledger.md).
- **Feature branches stay current with `main`** — at session open and before any
  merge act, fetch and reconcile (`git fetch origin --prune`; rebase or merge
  `main` forward per the branch's churn). The transplant-era main→branch
  stranded-commit sweep is retired with the model that needed it.
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
  2026-06-20). The owner keeps the local Oak checkout (`<oak>`) pulled
  current.
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
