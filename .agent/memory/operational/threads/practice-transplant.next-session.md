# Next-Session Record — Practice transplant + deep enhancement

The continuity record for the single deep-enhancement thread (owner: bring the
full Practice / agentic framework / agent-tools over **and** fix castr's known
issues — one goal, not competing priorities). Indexed by
[`../repo-continuity.md § Active Threads`](../repo-continuity.md#active-threads),
which stays the source of truth for thread status; this record carries identity
history and lane state per [`README.md`](README.md) +
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md).

**Activated 2026-06-20** (Phase 8 task 5): per-thread records went live the moment
the collaboration framework that makes a second stream safe landed — task 3b
demonstrated 10 concurrent sessions are collision-safe, so the enabling trigger
fired (not speculative scaffolding; owner-directed activation). The repo ran
single-stream as a _constraint_ of the unbuilt framework, not a fit; that
constraint is now lifted, so the thread is recorded as a multi-lane container.

## Participating agent identities

Additive per PDR-027 — joining adds an identity; a matching platform/model/agent_name
updates `last_session` rather than adding a row.

| platform    | model              | session_id_prefix | agent_name                     | role         | first_session | last_session |
| ----------- | ------------------ | ----------------- | ------------------------------ | ------------ | ------------- | ------------ |
| claude-code | claude-fable-5     | 62f93c            | Stormbound Circling Kite       | executor     | 2026-07-18    | 2026-07-18   |
| claude-code | claude-opus-4-8-1m | 10bc66            | Ethereal Weaving Star          | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 328f4f            | Secret Watching Candle         | implementer  | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 4aeee2            | Stratospheric Wheeling Horizon | implementer  | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | fdb75b            | Briny Cresting Sextant         | director     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | cba47e            | Stormy Sailing Archipelago     | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 8de446            | Clouded Floating Gust          | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 611206            | Igneous Flaring Hearth         | executor     | 2026-06-21    | 2026-06-21   |
| claude-code | claude-opus-4-8-1m | 89120c            | Volcanic Charring Hearth       | consolidator | 2026-06-21    | 2026-06-21   |
| claude-code | claude-opus-4-8-1m | dc3825            | Woodland Bending Glade         | executor     | 2026-06-21    | 2026-06-21   |
| claude-code | claude-opus-4-8-1m | f7e30d            | Soaring Lifting Current        | executor     | 2026-06-21    | 2026-06-21   |
| claude-code | claude-opus-4-8-1m | 48b4a5            | Coppery Warming Magma          | executor     | 2026-06-26    | 2026-06-26   |
| claude-code | claude-opus-4-8-1m | c56a0f            | Stratospheric Kiting Breeze    | executor     | 2026-06-26    | 2026-06-27   |
| claude-code | claude-opus-4-8-1m | 1dfcd1            | Eclipsed Lurking Moth          | consolidator | 2026-06-26    | 2026-06-26   |
| claude-code | claude-opus-4-8-1m | e8b57e            | Hidden Veiling Mirror          | executor     | 2026-06-27    | 2026-06-27   |
| claude-code | claude-opus-4-8-1m | c82112            | Open Lofting Feather           | executor     | 2026-06-27    | 2026-06-28   |
| claude-code | claude-fable-5     | 540603            | Penumbral Slipping Moth        | executor     | 2026-07-03    | 2026-07-03   |
| claude-code | claude-fable-5     | 0ceb5f            | Windswept Winging Cliff        | executor     | 2026-07-03    | 2026-07-03   |
| claude-code | claude-fable-5     | bafbac            | Fiery Flaring Bellows          | consolidator | 2026-07-03    | 2026-07-03   |
| claude-code | claude-fable-5     | 8bff79            | Cirrus Spiralling Airstream    | executor     | 2026-07-03    | 2026-07-03   |

## ARC-bring handover residue (2026-07-18 09:33Z, Stormbound Circling Kite stand-down — owner-directed)

**PR #22** (`feat/arc-rapid-comms-bring`, origin head `c10c7bf2`): the ARC estate bring, complete
and twice-reviewed (four-reviewer panel + a 16-thread bot wave). **Residue: 14 unresolved review
threads whose fixes are ALL pushed in `67bf879f`** (in `c10c7bf2`'s ancestry; red-first, 122/122
targeted suites, full gates green) — only the reply+resolve posting remains. Each reply
re-derives from `67bf879f`'s diff to the thread's file; 2 further threads were already
rejected-and-resolved with falsifying grounds. Pickup: any practice-estate session — harvest
unresolved threads on #22, map each to the commit's change, reply with commit-referenced
evidence, resolve, expect 0. Post-merge residue (named positions): liaison-channel conservation
waits on the erratum-convention question (upstream guest-channel item 7); citations-rule +
PDR-139 brings trigger on PR #23's merge; Resonance back-flow items 1-8 await Shaded Foraging
Grove's replies on the guest channel.

## Lanes

A lane is an independently pickup-able arc — its own state, branch, and pickup
trigger, active OR deferred. **Branching model since 2026-07-03: each lane takes
its own FEATURE BRANCH off `main`, one PR per slice, merges owner-invoked** (PR
#3 `5529436` merged the transplant branch and closed the single-branch era; that
mode was circumstance, never invariant — authoritative statement in
`repo-continuity.md §Repo-Wide Invariants`). Branch references in the dated lane
records below are that era's truthful history.

> **🧭 FOLDED (2026-06-28; DELTA-AMENDED 2026-07-03): Axis-A next-step source is the single backlog
> [`../../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md`](../../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md)
> — now carrying the §Delta amendment (2026-07-03) from the owner-directed OCE↔castr delta review
> ([`oak-castr-delta-review-2026-07-03.md`](../../../plans/transplant/oak-castr-delta-review-2026-07-03.md), complete);
> the owner-directed statusline+logo-pipeline lane LEADS the updated sequencing
> ([manifests](../../../plans/transplant/statusline-logo-bring-manifests-2026-07-03.md)).**
> The **Oak Parity-or-Better Program**, **transplant completeness**, and **Practice loop-closure remediation** lanes
> below are FOLDED into it (their items are its Tier-1/2 entries; the lanes/plans are retained for as-built + detail).
> Still-separate parallel lanes (NOT Axis A): first-run friction-fix, hook-matcher precision, the LC1 fail-opens
> hardening (dependency-currency CLOSED 2026-07-03 — see its lane below). Axis B = remediation 02–07 — a DEFINED
> position after the Tier-1 spine per **Q-011, DECIDED 2026-06-28 (owner): Axis A first**; re-surface B for promotion
> at Tier-1 close. Axis C = delivery — superseded 2026-07-03: continuous MERGE-READINESS is a standing agent duty and
> the merge itself is owner-invoked (was "deprioritised"). The single live next-step pointer is `repo-continuity.md`
> Next Safe Steps.

### Lane: Oak Parity-or-Better Program — ACTIVE, DOMINANT (started 2026-06-20)

- Controlling plan: [`../../../plans/transplant/oak-parity-program.md`](../../../plans/transplant/oak-parity-program.md)
  (executable parity-tranche record). **AUTHORITATIVE BRING BACKLOG (2026-06-28):**
  [`oak-castr-gap-rescan-2026-06-28.md`](../../../plans/transplant/oak-castr-gap-rescan-2026-06-28.md) — a two-pass
  firsthand-validated rescan (owner updated OOCE) that SUPERSEDES the 2026-06-20 gap inventory. Disposition =
  bring-everything (PDR-005 §Default). Tier-1 spine: CI-runs-gates-server-side (LC5), gitleaks, trusted-git,
  worktree-aware coordination-home, watcher-deadline (LC3c), provenance+archive-move, claims-handoff (LC3b/PDR-063),
  reference-direction validator+PDR-105, Oak-ADR cite-repair+ADR-127, plan-templates+ADR-117 (TC2); + 23 Oak PDRs
  (renumber for the 096/097 collision, Q-009). OUT-OF-SCOPE carve-outs + castr_extras recorded in the rescan doc.
- **Owner directive (2026-06-20):** upgrade every castr agentic system that is simpler than Oak's to parity-or-better;
  "castr is not meant to stay simple." Standing directive in user-memory `castr-parity-or-better-with-oak`. Classify each
  diff: deliberate-localisation (preserve) vs unbuilt-gap (upgrade).
- **Scope:** 4 Tier-A (ArcAngel, hook-policy concept/reappraisal, policy-reappraisal validator, statusline session-shape)
  - 6 Tier-B + 8 Tier-C verified gaps. Built by a 5-subagent firsthand audit; all load-bearing claims re-verified
    firsthand; 3 agent errors caught (D4 archive on a branch not missing; agent-identity wordlists already present;
    patterns-index exists — castr ahead).
- **Tranche 1 ✅ COMPLETE (2026-06-20, Clouded Floating Gust / 8de446):** C1 (`9a37691` fitness URL-width false-flag
  fix, RED-first) → C2 (`2b0fdc2` claim heartbeat/close fail-loud + `--role`) → C6 (collaboration/curator/quarantine/
  archive machinery dirs; **workstreams + agent-capability-vocabulary recorded NON-gaps**) → `35051f4` prettierignore
  fix (N12-family) → C4/C5 (`96b9a3e` watcher + heartbeat rule depth; "Hardened against silent hangs" deferred to C3)
  → C7/C8 (`707731d` skillListingBudgetFraction + log-hook-errors wrapper wired to SessionStart; **skillOverrides +
  enabledPlugins NON-gaps**) → `5b444b7` review-driven hardening (KNOWN_OPTION_KEYS `--role` defect caught by
  code-reviewer, fixed RED-first; +bare-URL/prefix-miss coverage). Full `pnpm check` green; code/test/config reviewers
  run, all load-bearing claims re-verified firsthand.
- **Tranche 2 ✅ COMPLETE (2026-06-21, Igneous Flaring Hearth / 611206):** the A2+A3 hook-policy concept/reappraisal
  unit. Three roll-forward commits: `511326f` (fix: `no-hedging-vocabulary.md` false §-cite, surfaced by config-expert)
  → `abe580f` (feat A2: Oak concept/reappraisal model — schema-derived grouped types, `ContentDenyInput` union,
  `match: "substring"` matching, content-deny-response split; policy.json restructured to concept/citation/reappraisal
  objects + four host-load shapes; `no-unbounded-host-load.md` rule + wrappers + RULES_INDEX + start-right §7) →
  `31caf78` (feat A3: `validate-policy-reappraisal` validator wired into `repo-validators:check`). RED-first against the
  founding 2026-06-11 host-DOS busy-loop (PDR-092) — six failing tests confirmed the quoted-token evasion, then green.
  Full `pnpm check:ci` green at the tip; config/type/test reviewers run, every load-bearing claim re-verified firsthand;
  four review-driven test-coverage additions landed. Scope decisions: `indefinite-deferral` content group OUT of A2
  (cites a no-hedging §section castr lacks — costume risk, deferred); the host-load-tool substring breadth was first
  recommended ACCEPT (Oak-pin-faithful) but the **owner overrode (2026-06-21, Q-005) → INVEST in matcher precision +
  Oak back-flow** (see the hook-matcher-precision lane). **Next session = the dependency-currency lane; Tranche 3 follows.**
- **Progress:** B2 metacognition directive ✅ (`fcda10a`). `no-unbounded-host-load.md` is now **IN-TREE** (`abe580f`,
  with `.claude/.agents/.cursor` wrappers + RULES_INDEX + start-right §7); the prior "untracked, can't commit until A2
  adds the busy-loop patterns" blocker is RESOLVED — policy.json ships the four host-load shapes the rule's Enforcement
  section claims, so the PDR-092 costume concern is discharged. Pin reconciliations applied: `never-ignore-signals`
  Related-Surfaces bullet dropped (absent at the pin too — upstream Oak dangling ref); Oak session-ops-report path
  neutralised; `codex-helper` §timeouts ref reconciled to castr's real heading (§Timeout and Long-Running Tasks).
- **Sequencing:** Tranche 1 ✅ (C1/C2 → C6 → C4/C5/C7/C8) → Tranche 2 ✅ (A2+A3 hook-policy unit, TDD) →
  Tranche 3 (A4 statusline → A1 ArcAngel) → Tranche 4 (B1 merge D4 branch, B3/B4/B5/B6/C3).
  **2026-06-26 INSERTION (owner-directed, ahead of dependency-currency + Tranche 3):** the Oak read-model flip
  (live main, no pin) + two sub-programs — **transplant completeness** (TC1✅/TC3a✅, see its lane below) and
  **reason-skill bring** (lane below). The earlier "Next session = dependency-currency" framing is superseded as
  the active slice; **DC3 remains the dependency-currency lane's own untouched next position**, not dropped.
- **Acceptance:** every ledger row applied-or-decided; gap re-audit clean; then the P9 closure gate.

### Lane: transplant completeness — bring the iceberg (ACTIVE, started 2026-06-26, Coppery Warming Magma / 48b4a5)

- Controlling plan: [`../../../plans/transplant/transplant-completeness-supporting-infrastructure.md`](../../../plans/transplant/transplant-completeness-supporting-infrastructure.md).
  Thesis: a transplanted capability is complete only when its supporting infrastructure (script proxies,
  template libraries, catch-validators) resolves; cure a hollow transplant by BRINGING the missing infra,
  never by patching the doc to hide the gap. Forward exemplar = the reason-skill lane below.
- **Origin:** the commit skill's advisory pre-screen + the plan skill's templates dir were dead (referenced
  un-transplanted infra). Owner reframed "doc-drift" → **incomplete transplants**; governing rule
  **bring-by-default** (see Standing decisions). Census driver mechanised so the rest is found, not lucked into.
- **TC1 ✅ (`4283520`):** restored 15 dropped root proxies (10 `agent-tools:*` + 5 `practice:*`). Un-hollowed
  the commit skill; **iceberg RECURSES** — the orchestrator's own sub-infra was also dropped (transitive
  enumeration lesson, napkin).
- **TC3a ✅ (`e2e67cc`):** ported `validate-markdown-links` (4 files verbatim, 34 tests green), **STANDALONE**
  — NOT chain-wired (castr's chain is uniformly blocking; config-expert Option B, firsthand-confirmed). Census
  = **225 broken / 642 scanned** (reconciled), artifact `dangling-reference-census.md` = the TC2/TC4 input;
  catches the known templates + ADR-117 gaps. Scope refined by assumptions-expert + config-expert (every claim
  re-verified firsthand): split markdown-links from reference-direction; TC3b reframed.
- **Next safe steps (priority order):** **TC2** (bring the 21-file plan-templates library — census confirms
  why) → **TC1b** (bring `pr-watch` + `install-cursor-statusline` capabilities, bring-by-default) → **TC4**
  (disposition the **transplant-origin** census subset; pre-existing castr debt is out of scope) → **TC3b**
  (markdown-links gate end-state — **DECIDED 2026-06-26: scoped-blocking on transplant-completed surfaces**,
  conditioned on the archive-exclusion false-positive fix + TC4 surface-set; was Q-007). **Split-out (NOT started):**
  `validate-reference-direction` + `validate-machine-local-paths` validators, each its own bring-by-default plan.
- **Acceptance:** every transplant-origin reference resolves; the structural catch (TC3b) decided.

### Lane: Practice loop-closure remediation — ACTIVE (plan authored 2026-06-27, Stratospheric Kiting Breeze / c56a0f, `a22ec2c`)

- Controlling plan: [`../../../plans/transplant/practice-loop-closure-remediation.md`](../../../plans/transplant/practice-loop-closure-remediation.md)
  (LC0–LC5 + LC-reopen). **Extends PDR-096** with loop-closure-as-completeness-test + the Class-B (doctrine-vs-reality
  false-claim) failure mode. Insight conserved in `distilled.md`.
- **Origin:** owner challenged whether Oak's claims mechanism was actually brought / how much was written off. A
  firsthand by-loop audit (5 read-only subagents; every load-bearing claim re-verified) found the Practice has real
  teeth (skill-adapter/reviewer/hook-policy loops CLOSED; 9 wired validators) BUT three failure classes — (A) genuinely
  missing enforcement Oak has (F-95 coordination gate → `claims open` ungated; `semantic-merge` executor → memory
  corruption risk; machine-local-paths validator; watcher deadline; fitness axes), (B) doctrine-vs-reality FALSE
  claims (the commit skill's pre-commit/commit-msg model is fictional; type-enum/no-type-shortcuts/markdownlint refs
  wrong), (C) deliberate/planned (not gaps). **ROOT: completeness measured by artefact-presence, not loop-closure —
  the audit METHOD was the bug** (under-counted the coordination-safety layer twice → **parity C4 + reference-closure
  Task-6 RE-OPENED**, both re-pointed to this plan).
- **LC0 ✅ DONE (2026-06-27, Hidden Veiling Mirror).** `validate-loop-closure-references` built (TDD, 40 unit tests) +
  WIRED blocking into `repo-validators:check`; owner chose "cure all 7 now" so all 7 hollow refs were cured in the same
  slice (check:profile dropped-proxy restored; markdownlint BROUGHT MD040-only + 29 language-tags; cruise→depcruise;
  secrets:scan + test:mutation reworded). Reviewers run; tilde-fence + `pnpm run <mgmt-word>` false-negatives fixed
  firsthand; workspace parser extracted + tested. Full `pnpm qg` green. As-built + deferred findings in the plan
  § As-built (LC0). **Deferred from LC0 → LC5:** CI doesn't run qg (new gates enforce local-pre-push only).
- **LC1 ✅ DONE (2026-06-27, Hidden Veiling Mirror, `6372024`).** F-95 comms-watcher-presence gate brought from Oak +
  wired into `claims open` (refuses a blind claim into a populated registry; solo fast-path preserved; anti-spoof
  identity-binding); `comms assert-watcher-live` registered; dead detectStaleWatcher now has a caller. **Firsthand
  catch beyond the workflow's bring-plan:** the `comms watch` writer must auto-derive the heartbeat path or the gate
  falsely blocks every claim (brought it). Reviewers run; 2 Oak-faithful fail-opens (future `--now`; cwd-relative path)
  recorded for a hardening slice + Oak back-flow. **LC-reopen ✅ closed:** parity C4 + reference-closure Task-6
  corrected (the F-95 layer is genuinely brought). Full `pnpm qg` green. As-built: plan § As-built (LC1).
- **LC2 corrected (firsthand): there is NO "semantic-merge executor" to bring** — Oak's semantic-merge is a single
  PASSIVE `SKILL-CANONICAL.md` doc ("git cannot do it; you must"); no merge-driver, no executor. So LC2 = a SKILL bring
  (stage 1, ready) + a castr-original conflict-time firing tripwire (stage 2, owner-gated). See plan LC2 + the
  understand-workflow synthesis.
- **LC2 ✅ DONE (2026-06-27, Hidden Veiling Mirror, stage-1 `7351b88` + stage-2 `c3484da`).** Skill brought
  (taxonomy reconciled to castr's MERGE_CLASSES) + engraph-semantic-merge adapter + Skill permission (owner cleared
  the self-mod guard); stage-2 refuse-and-route git merge driver + `.gitattributes` (`.agent/memory/**/*.md`) +
  postinstall registration. **Loop closure proven by a real `git merge`** (driver fired, routed, left file unmerged).
  Parity-or-better (Oak ships only the passive skill). Full `pnpm qg` green. As-built: plan § LC2 as_built.
- **LC3(a) ✅ DONE (2026-06-27, Open Lofting Feather / c82112).** machine-local-paths validator brought from Oak +
  wired blocking into `repo-validators:check`; `machine-local-path` scoped_block added to policy.json (single-sources
  the validator's patterns AND lights the PreToolUse write-time guard). Loop proven at the real layer: 324 real hits →
  exit 1 → doctrine-scoped cure (`archive/` exempt per the rule) → exit 0 (2240 files clean); the write-guard fired live
  on a literal path. Reviewers folded firsthand (`'u'` flag; "never drift" wording corrected; blocking contract proven —
  parity-or-better, exit/skip/fail-loud extracted + tested). Case-sensitive kept by measurement. Full `pnpm check` green.
  Deferred: 5 pre-existing dead links (doc-hygiene); published-archive-PII question. As-built: plan § As-built (LC3a).
- **Next safe step:** **LC3(b)** PDR-063 claim handoff/adopt (`cli-claim-handoff-commands.ts` — confirm-or-bring the
  recorded forward-deferral); **LC3(c)** watcher step-deadline — the C3 `comms-watch-errors`/WatcherTimeoutError item, in
  the same cli-comms-watch Oak file LC1 drew from, deliberately NOT brought in LC1; **LC3(d)** fitness staleness axes →
  **LC4** (Class-B doctrine-vs-reality, protected by LC0's gate) → **LC5** (Claude-only-enforcement scope + the
  CI-doesn't-run-qg finding). Plus the two LC1 Oak-faithful fail-opens (future `--now`; cwd-relative heartbeat path) → a
  hardening slice + Oak back-flow (own slice, see plan § As-built (LC1)).
- **Acceptance:** every loop CLOSES (D→M→W→S verified firsthand); LC0 catches the class going forward; C4/Task-6
  corrected; graduate the loop-closure completeness test as a PDR-096 amendment on completion.

### Lane: reason-skill parity bring — ✅ COMPLETE (2026-06-26, Stratospheric Kiting Breeze / c56a0f, `4f0bfe3`)

- Controlling plan: [`../../../plans/transplant/reason-skill-parity-bring.md`](../../../plans/transplant/reason-skill-parity-bring.md)
  (R1✅/R2✅).
- **Outcome (`4f0bfe3`, `feat(transplant)`):** the outward `reason` skill + the 1432-line
  `grammar-of-thinking.md` reference brought verbatim from Oak live `main` then localised
  (`oak-reason`→`reason`, `oak-metacognition`→`metacognition`, `oak-plan`→`plan`); diff-vs-Oak confirmed only
  the intended token lines changed; zero residual `oak-` tokens; zero outbound cites in the reference; **full
  eyeball review of all 1432 lines clean** (line-374 teacher example is one of 4 generic problem-framing
  illustrations, kept faithful). The 2-line `metacognition` back-link added → metacognition now byte-identical to
  Oak (the inward/outward pair is complete). Adapters generated (`.claude`/`.agents` `engraph-reason`);
  **discoverability CONFIRMED** (the harness lists `engraph-reason` as an available skill — the
  `passive-guidance-loses-to-artefact-gravity` "fires, not just present" bar). `Skill(engraph-reason)` wired into
  `.claude/settings.json` (owner-approved past the self-modification guard). Gates green: skills, format,
  portability (**19 canonical skills**), repo-validators.
- **Verify-don't-trust catch:** the `citation-as-reasoning` pattern was found **already-present** (phase-6
  `795d935`) and correctly localised (`proven_in: imported` + a castr-convention `use_this_when` field) — its
  "BRING micro-slice" disposition was **stale**; overwriting with Oak's raw copy would have regressed the
  localisation. Both its cites (`no-hedging-vocabulary` rule, `breadth-as-evasion` pattern) resolve. No action.
- **Plan inaccuracy fixed (recorded in the plan):** the documented adapter-generate invocation
  (`pnpm --filter @engraph/agent-tools skills-adapter-generate`) ENOENTs on `.agent/skills` (wrong cwd); the
  working form is from-root via the built js (`… -s build && node agent-tools/dist/src/bin/skills-adapter-generate.js --prefix=engraph-`).
- **Lifecycle:** add the parity-program ledger row; archive the plan per ADR-117 (R2 landed green); the
  consolidation/learning-loop for this capability surface is a close-out candidate.

### Lane: transplant Phase 9 — GATED by the parity program (was: deferred)

- **Reframed 2026-06-20:** Phase 9 is now the **closure gate at the END of the parity program** (practice-verification +
  relevance-ledger + handoff, then cut `transplant/phase-9`), not a standalone next step. The old Phase-9 PDR-currency
  component is ✅ COMPLETE (4 new + 9 folded PDRs current with Oak `ad359a4f`; `5c40adb`, `3787928`). Oak back-flow is
  **castr-only** (owner moves the feedback report manually — owner decision 2026-06-20). Do NOT tag Phase 9 until the
  full parity sweep lands (the docs name tagging-without-the-sweep as the Phase-1b green-but-incomplete failure mode).

### Lane: Phase 8 close — ✅ COMPLETE + TAGGED (2026-06-20)

- Controlling plan: [`../../../plans/transplant/08-collaboration-active.md`](../../../plans/transplant/08-collaboration-active.md) §As-built.
- **Outcome:** `transplant/phase-8` tag CUT on `8d62197` (lightweight, matching `phase-0..7`).
  The last acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the
  **first director-led concurrent stream** (this session, 2026-06-20): Director Briny Cresting Sextant
  (fdb75b) + two implementers Stratospheric Wheeling Horizon (4aeee2, Lane A) and Secret Watching
  Candle (328f4f, Lane B), each with a distinct PDR-027 identity, an armed comms watcher, a live claim,
  a ≤4-min heartbeat, and comms. The stream exercised claims (open→heartbeat→close), directed +
  broadcast comms, Director-serialised review with routed reviewer sub-agents adjudicated firsthand, a
  live identity-table write-race, and a measured watcher-idle-coalescing failure (F6/N10, now team
  doctrine: catch-up-sweep on every wake).
- **Gate evidence:** `pnpm check` GREEN at `8d62197` (full gate completeness, verified firsthand in an
  isolated detached worktree); reference-closure clean for phase-8 scope (drift validator green inside
  `repo-validators:check`; D4 was a recorded deferred lane, out of phase-8 scope).

### Lane: D4 generic-surface back-brings — ✅ LANDED (branch, 2026-06-20)

- Controlling plan: [`reference-closure.md`](../../../plans/transplant/reference-closure.md) (recorded by Phase 8 task 6 triage).
- **Outcome:** both genuinely-new Oak-pin collaboration subsystems brought by Seat 2 (Secret Watching
  Candle) on branch `feat/d4-archive-provenance-backbring` @ `0a75231` (off transplant tip `8d62197`;
  **pushed**): `archive/` (class-tiered comms-archive rotation: `archive-move`/`-execute`/`-node`,
  `disposition-policy`, `event-classification`, `event-projection`, `manifest`) + `provenance/`
  (`cited-event-provenance`, `provenance-scan`/`-node`). **Error model reconciled** Oak's
  `@oaknational/result` (castr-DON'T-BRING) → fail-fast: typed `ArchiveMoveError`/`ProvenanceScanError`
  (kind discriminator + `{cause}`) THROW; discriminated-union returns only for genuine domain
  multi-outcomes. Wired via `index.ts` barrel + the unified `cli.ts` topics (`provenance check`,
  `archive plan`, `archive move` — castr's unified-CLI form, not Oak's standalone bins). 94 unit tests;
  `pnpm check` green; Director-approved (code/type/test/architecture-fred reviewers + firsthand). Three
  commits: `4de8857` (core) → `b684a28` (review follow-up) → `0a75231` (CLI slice).
- **Open follow-on (optional, D4/Oak back-flow):** `collectKnownEventIds` does not exclude `.tmp-`
  writes (byte-identical to the Oak pin; fail-closed-safe — can only BLOCK a move, never wrongly permit).

### Lane: arc D2 / D3 — ✅ LANDED (branches, 2026-06-20)

- Controlling plan: transplant tracker §Deep-enhancement arc + [`delivery-ledger.md`](../../../plans/delivery-ledger.md).
- **Outcome (Seat 1, Stratospheric Wheeling Horizon):**
  - **D3** (CI to Oak standard) — `feat/d3-ci-oak-standard` @ `c7f819e` (off `8d62197`; **pushed**):
    ci.yml runs the full `check:ci` gate; 6 actions SHA-pinned (`# vX.Y.Z`); CodeQL kept+modernized
    v2→v3+pinned; broken `lib/**` path filters removed; dead `publish.yml` removed. Reviewed
    config-expert (PASS-with-nits) + security-expert (PASS), Director-approved firsthand.
  - **D2** (node-version single-source) — `feat/d2-node-version-single-source` @ `41b24f8` (off D3's
    `c7f819e` — D2/D3 are **coordinate-dependent on ci.yml**, so D2 builds on D3): `.nvmrc` "24" + ci.yml
    `node-version-file: .nvmrc` (drops the hardcoded value). `engines.node` semantics left to owner/ADR-049.
    Director-approved firsthand.
- **Delivery framing (Q-001 split-PR plan):** off `c7f819e`, the D2 branch contains D3 (shared ci.yml
  lineage) → they deliver coupled (D2 on top of D3) or D3-first-then-D2-rebase. Both pushed to origin (delivery
  deprioritised; push = owner's call).
- **Remaining in arc:** release automation (separate deferred lane below); D4 ✅ landed above.

### Lane: remediation 02–07 — ~~deferred~~ EXECUTING (2026-07-17, owner-approved parallel program)

- Controlling record: [`../../../plans/remediation/00-parallel-execution-program.md`](../../../plans/remediation/00-parallel-execution-program.md)
  (file-disjoint parallel lanes; the per-finding plans, incl.
  [`02-ir-fidelity-proof-harness.md`](../../../plans/active/02-ir-fidelity-proof-harness.md),
  remain the per-finding authority).
- Next safe step: read the program record's lane contracts before touching remediation scope;
  the former "named position after the transplant" trigger fired — the owner named it 2026-07-17.
- Acceptance bar: each Critical reproduced-then-fixed with a regression test.

### Lane: explicit additional-properties feature — deferred (trigger: after positions 1–2)

- Controlling plan: [`../../../plans/current/paused/explicit-additional-properties-support.md`](../../../plans/current/paused/explicit-additional-properties-support.md).
- Next safe step: sequenced product-feature slice (a required component of the one
  deep enhancement, named position — not a paused continuity thread).
- Acceptance bar: feature lands with parser/writer lockstep + tests.

### Lane: release automation — TOOLING DECIDED (changesets); execution deferred (trigger: delivery un-deprioritised)

- Controlling plan: transplant tracker §Deep-enhancement arc (release surface) + [`delivery-ledger.md`](../../../plans/delivery-ledger.md).
- Origin: surfaced 2026-06-20 by the D3 stream (Seat 1, Stratospheric Wheeling Horizon). castr has **no release tooling**
  (no `.changeset`, no changesets/semantic-release in any package.json, no `release` script); the inherited `publish.yml`
  called a non-existent `pnpm release` via `changesets/action@v1` and was REMOVED in the D3 slice (Director ruling, comms
  `fa53d0af`). Removal is fail-fast (a disabled stub would be a tombstone).
- **DECISION (owner, 2026-06-21, Q-004): tooling = `changesets`** (lower-ceremony, single-package/monorepo-friendly;
  semantic-release considered for Oak parity but heavier). Execution deferred until delivery is on the table.
- Next safe step: when delivery is scheduled — add `@changesets/cli` + config + a CI release job; wire a `release` script.
- Acceptance bar: a working changesets release path lands + a CI release job.

### Lane: first-run friction-fix tranche — active-next (trigger: owner-recommended; before the next team session)

- Controlling plan: [`../../../plans/transplant/first-run-friction-inventory.md`](../../../plans/transplant/first-run-friction-inventory.md)
  (F1–F12, N1–N12, measured firsthand by the first concurrent stream; relocated there from the napkin at the
  2026-06-26 rotation — also conserved in [`../../active/archive/napkin-2026-06-20-to-21.md`](../../active/archive/napkin-2026-06-20-to-21.md)).
  The concrete cures are the lane bullets below.
- Why: highest-leverage hardening before the next team session — fixes the agent-tools/hook/doctrine walls the first
  concurrent stream hit, so the collaboration framework (Phase 8's deliverable) is genuinely dogfoodable.
- Concrete items (each pickup-able; durable detail in the two homes above):
  - **Monitor idle-coalescing sweep doctrine (F6/N10, headline)** — amend `use-monitor-for-event-driven-wake.md` +
    `comms-all-channels-watcher.md` to mandate a full `comms list` catch-up sweep on every wake (already live as team
    doctrine + user-memory; the rule-text amendment is what's pending).
  - **Dangerous-pattern hook over-match (N7/N11)** — MOVED to its own **hook-matcher-precision lane** below (owner,
    2026-06-21, chose to INVEST + Oak back-flow; it is now a parity-or-better enhancement, not just a friction fix).
  - **Seen-file naming (N4/N12)** — write seen-files as `<slug>.seen` (not `<Codename>.json`; the `.json`-on-non-JSON
    broke `format:check`), or add `comms-seen/` to `.prettierignore`.
  - **agent-tools CLI hardening (F2/F4/F5/F7/N1/N2/N5/N6)** — read-only claims ENOENT on a fresh home; `comms watch`
    seen-dir auto-create; pre-claim heartbeat ordering; commit-skill phantom root alias; `--intent-id` canonical source;
    `platform` field consistency; identity-row registration as the one bootstrap continuity write each seat makes
    directly — reconciled against Director-lands-all-`.agent`-writes (N1); the lock-free identity-table write-race →
    a `claims/identity register` CLI doing an atomic additive upsert (N2).
  - **Two structural-cure validators (owner, 2026-06-21 — folded into this tranche):** (1) `validate-statusline-routing`
    — assert `settings.json.statusLine.command` → an extant shim whose adapter target resolves, sibling to
    `validate-pretooluse-guard-routing` (surfaced by config-expert + code-reviewer at the Q-003 landing `ebf08b5`; THREE
    classes of `.claude/`→`agent-tools/dist` wiring exist, only one validated). (2) `validate-principles-section-cites`
    — assert every `principles.md §<heading>` citation across `.agent/`+`docs/` resolves to a real heading (the recurring
    false-§-cite class: Tranche-2 found one in an already-landed sibling rule). Build as
    one "validator hardening" slice, TDD, wired into `repo-validators:check`.
- Acceptance bar: each item lands as code/rule-text with TDD where code is touched; solo or a small dogfooding team session.

### Lane: hook-matcher precision (parity-or-BETTER + Oak back-flow) — active-next (owner-directed 2026-06-21, Q-005)

- Origin: A2 (Tranche 2) brought Oak's matcher verbatim (token-subsequence + substring). Two measured false-positive
  edges remain: `stress-ng` substring catches benign substrings (`libstress-ng`); token-subsequence over-matches across
  compound git commands / prose (N7/N11). **Owner decision (2026-06-21): INVEST in precision** (overrode the
  "keep Oak-faithful" recommendation), **with comprehensive Oak back-flow notes** so Oak gets the improvement too —
  castr is a two-way Practice node (user-memory `castr-parity-or-better-with-oak`, bidirectional sharpening).
- Scope: word-boundary matching for binary-name patterns (`stress-ng`); command-leading-position anchoring for the git
  family (so `git checkout -b` / prose mentioning "checkout" do not trip while `git checkout --` still does). Keep
  substring for shapes that genuinely hide inside one quoted token (the no-space infinite-loop / fork-bomb tokens). This
  SUPERSEDES the friction-fix N7/N11 bullet and the Q-005 "accept" framing.
- **NEW SPECIMEN (2026-06-21, Soaring Lifting Current / f7e30d) — the keep-substring-for-loop-tokens decision ALSO has a
  false-positive surface: PROSE/DOCUMENTATION that names the pattern.** A `git commit` whose message documented the
  no-unbounded-host-load guard was BLOCKED because the printf command string contained the verbatim no-space loop token —
  the matcher cannot tell "execute a busy-loop" from "write a commit message about the busy-loop guard." So the
  "keep substring as-is for the loop tokens" plan is not cost-free: command-string substring over-matches benign prose
  mentions of the loop tokens, exactly as it does for the git family. Implication for the precision work: the loop-token
  case likely needs command-CONTEXT awareness too (literal in an executable position vs inside a string/printf/heredoc
  being written to a doc), not just word-boundary/position anchoring — a harder matching problem. Best false-positive
  specimen yet (the guard blocked the documentation of its own guard). Detail: napkin §guard-firing-is-diagnosis entry.
  **The class now has THREE first-party specimens (2026-07-03):** the printf-busy-loop original above; Moth's hardened
  flag-cluster matcher blocking that session's own commit message (heredoc prose naming the blocked pattern); Cliff's
  wave-4 `--force-with-lease` policy entry firing on the commit message DOCUMENTING it within minutes of landing. The
  mitigation that reliably works (not token-slipping): write the message via the Write tool, commit with
  `git commit -F <file>`, keep git commands in a separate clean shell string. The RED-first precision scope stands.
- Next safe step: RED-first against the founding false positives (`libstress-ng`, `git checkout -b`, the N7/N11 prose
  cases) in `agent-tools/src/hook-policy/`; then write the Oak back-flow note (home: the `oak-backflow/` feedback
  surface) describing the precision improvement for upstream adoption.
- Acceptance bar: precision lands TDD-green (false positives gone, true positives still caught); Oak back-flow note written.

### Lane: dependency currency — ✅ COMPLETE, LANE CLOSED (DC3+DC4+DC5 done 2026-07-03 via the owner-directed full sweep, `ac0363e`; audit ZERO; PDR-097 already graduated — the plan §Progress carries the closing record)

- **DC2 @scalar IR-input trio DONE (2026-06-21, Soaring Lifting Current / f7e30d) — `43419d0`.** parser
  0.25.7->0.28.7 + types 0.6.1->0.9.1 + json-magic 0.12.4->0.12.16, one coupled commit (parser pins exact
  versions of the other two). IR-fidelity preserved (full surface == baseline); openapi-types.ts seam needed no
  reconciliation (drift green @0.9.1). Bump-forced boundary reconciliation (isRecord guards + unknown-widen, no
  as/no any, ADR-020). IMPROVEMENT locked in: the new parser rejects dangling $refs the old tolerated
  (requirements.md REJECT + ADR-001) -> fixed 1 latent fixture + added a load-level negative test. openapi-expert
  - type-reviewer COMPLIANT, firsthand-verified. Also landed this session: @types/node ^24 (Q-006/ADR-049,
    `00750da`), stale tsconfig include (`43d7f8a`). Finding routed: `type-assertion-policy` ESLint rule unregistered
    in eslint.config (doctrine-vs-reality gap; own slice). **Remaining = DC3 prettier, DC4 ink, DC5 commander, then
    lane-close. NOTE: the `dependency-currency-discipline` pattern-PDR already GRADUATED early as PDR-097 (owner
    direction, 2026-06-26 consolidation — the method core was proven across DC0–DC2); lane-close now just closes the
    lane, and DC3–DC5 amend PDR-097 only if they refine the method.**
- **DC1 ts-morph 27->28 DONE (2026-06-21, Soaring Lifting Current / f7e30d) — `c8c0a9a`, the crown jewel.**
  The 27->28 breaking change is the bundled-TypeScript major: `@ts-morph/common` 0.28.1 (vendors TS 5.9.2) ->
  0.29.0 (vendors TS 6.0.2), bundled into common's `dist` so the workspace `typescript: 6.0.3` override never
  reached it -> the bump ALIGNS ts-morph's emission compiler with the workspace TS (closing a latent dual-TS
  skew; parity-or-better, proven harmless — 0 cross-instance flag reads in lib/src). Emitted output proven
  BYTE-IDENTICAL (full surface counts == a pre-bump baseline captured first; snapshot oracle fails-loud and
  did not); type-check + check:ci green; type-reviewer COMPLIANT, claims re-verified firsthand. A combined-run
  stderr TypeError was MEASURED pre-existing at 27 (firsthand revert+rerun), not a regression. **Remaining =
  DC2 @scalar trio, DC3 prettier, DC4 ink, DC5 commander — each its own baseline-capture + diff + reviewers.**

- **Progress (2026-06-21, Woodland Bending Glade / dc3825):** the type-neutral DEV-tooling tier is COMPLETE —
  two green commits on the single branch. **DC0 `f761e12`** (in-range refresh of eslint/@typescript-eslint/\*/
  typescript-eslint/turbo/vitest/knip; sonarjs/prettier/ink held back; check:ci green). **DC0b `dcad36b`** —
  eslint-plugin-sonarjs 4.0.3->4.1.0, SURFACED from `outdated` (not in the original plan), owner-directed
  ADOPT-NOW: its `recommended` preset newly enables 5 rules (25 sites), all fixed firsthand (incl. a
  D1-family catch where `no-redundant-optional`'s advice BROKE type-check under exactOptionalPropertyTypes ->
  type-checker-justified per-line disable). test-reviewer COMPLIANT; firsthand-verified. Then, owner-directed
  "continue with the low-risk batch," the **non-emission low-risk cycles DC6/DC7/DC8 also landed** — `a731765`
  @types/node 25->26, `0fd4a4c` commitlint 19->21, `bb653c9` degit 2->3 (+ dropped redundant @types/degit;
  degit's real consumer is the manual examples-fetcher.mts, proven by a real-clone smoke test). Each its own
  commit; check:ci green per cycle. **Remaining = the emission/IR/type-machinery tier ONLY: DC1 ts-morph (its
  OWN session, crown jewel), DC2 @scalar trio, DC3 prettier, DC4 ink, DC5 commander — none started; each needs
  baseline-capture + emitted/CLI diff + reviewers.** Two findings routed in the plan: stale tsconfig include
  (examples-fetcher.mts untype-checked) + @types/node dev-only 2-majors-ahead posture.
- **Controlling plan: [`../../../plans/current/dependency-currency.md`](../../../plans/current/dependency-currency.md)** (§Progress (live) carries the cycle-by-cycle record)
  — executable, 9 cycles (DC0 dev-tooling sweep → DC1 ts-morph → DC2 @scalar IR trio → DC3 prettier → DC4 ink →
  DC5 commander → DC6 @types/node → DC7 commitlint → DC8 degit). Authored + reviewed (type-reviewer + assumptions-expert,
  both verified firsthand) 2026-06-21; the type-risk table was CORRECTED by the review — `prettier` (runtime emission
  formatter) and `@scalar/json-magic` (IR-input bundler) moved OUT of the type-neutral sweep into the type-affecting tier;
  a baseline-capture protocol + lockfile discipline were added. The plan is the authoritative scope; the bullets below are
  the original assessment context.
- Assessment (2026-06-21): castr is **current, not behind** — no security lag, no multi-major rot except dev-only
  commitlint. Real workspaces are `lib` (@engraph/castr) + `agent-tools` (the `data-descriptions-transforms-monorepo`
  dependent is just the repo-root package name, not a hidden project). A 24h `minimumReleaseAge` supply-chain cooldown
  is deliberate.
- **The per-cycle breakdown + type-risk classification lives in the controlling plan (authoritative).** The original
  assessment grouped bumps by semver size; the firsthand review CORRECTED that — `prettier` (runtime emission formatter,
  `lib` dep) and `@scalar/json-magic` (IR-input `bundle()` stage) are **type-affecting**, NOT trivial tooling, and moved
  into their own cycles (DC3 / DC2); `ink` is an agent-tools runtime dep (DC4); `ts-morph` is lib-only. The DC0 sweep is
  now genuinely-type-neutral DEV tooling only (eslint, @typescript-eslint/\*, typescript-eslint, turbo, vitest, knip).
  See the plan's §Type/runtime-risk classification + §Baseline-capture protocol for the executable detail.
- Acceptance bar: per the plan — DC0 sweep gate-green; each type-affecting bump lands individually, proven type-fidelity-
  green by a baseline-captured emitted-output diff (not just gate-green), or recorded deliberately-held with reason.

### Lane: statusline identity wiring (Q-003) — ✅ LANDED (2026-06-20, `ebf08b5`)

- Outcome: the two missing `.claude/` wiring pieces brought (shim + `statusLine` settings block) so PDR-027 identities
  render in the status bar (from the next session onward). Verified firsthand end-to-end; config-expert + code-reviewer
  PASS (landed `ebf08b5`). Optional `validate-statusline-routing` follow-up folded into the friction-fix tranche lane above.

## Standing decisions this thread carries

- **Bring-by-default + transplant completeness (owner, 2026-06-26; SHARPENED 2026-06-28):** "the default for all
  capabilities is to bring them over, always." The default disposition for any Oak capability is **BRING**. **The bar
  for NOT bringing is "utterly irrelevant to castr"** (genuinely product-coupled Oak tooling with no castr analogue) or
  "not cleanly reversible" — NOT merely "an articulable deliberate-localisation reason." Bringing is reversible ("we can
  always delete things later"), so err toward bringing; **never gate a bring behind a manufactured "case", "evidence",
  or a deferred wire-vs-correct decision** when the item is plainly relevant infra (that hand-wringing is the
  `no-manufactured-permission` failure the owner has now corrected repeatedly). A prior narrower owner decision is
  superseded by this default unless re-confirmed. Graduated to **PDR-005 §Default disposition: bring by default**
  (2026-06-28) + user-memory `bring-everything-by-default`. Corollary — **transplant
  completeness**: bring a capability's supporting infrastructure (script proxies, template libraries, catch-validators),
  not just the tip; a hollow transplant is fixed by bringing the missing infra, never by patching the doc to match the
  gap. Plans: [`../../../plans/transplant/transplant-completeness-supporting-infrastructure.md`](../../../plans/transplant/transplant-completeness-supporting-infrastructure.md)
  (backward remediation + structural catch) + [`../../../plans/transplant/reason-skill-parity-bring.md`](../../../plans/transplant/reason-skill-parity-bring.md)
  (forward exemplar). Innovations back-flow record kept current at
  [`../../../plans/transplant/oak-backflow/castr-innovations-ledger.md`](../../../plans/transplant/oak-backflow/castr-innovations-ledger.md).
- **Decision pass (owner, 2026-06-21) — decision-complete before Tranche-3 planning:** Q-002 RESOLVED (single-TS pnpm
  override is the permanent fix — sonarjs 4.1.0 still vendors TS as a regular dep; not awaiting upstream); Q-004 RESOLVED
  (release tooling = `changesets`, execution deferred); Q-005 RESOLVED (INVEST in hook-matcher precision + Oak back-flow
  — its own lane); A1/ArcAngel = full unit (doc+dir+watcher-pairing+statusline wing); the two structural-cure validators
  fold into the friction-fix tranche; new dependency-currency lane (castr is current). castr is a **bidirectional**
  Practice node — improvements flow back to Oak (user-memory `castr-parity-or-better-with-oak`).
- ~~Single branch `feat/transplant-engraph-practice`~~ **superseded 2026-07-03: feature
  branches off `main`, one PR per slice, owner-invoked merges** (see the lanes header above);
  roll-forward only stands; the transplant-phase atomic-commit + `transplant/phase-N` tag
  discipline is complete history (phases 0–8 tagged; the branch merged in PR #3). (Full
  invariant set: [`../repo-continuity.md §Repo-Wide Invariants`](../repo-continuity.md#repo-wide-invariants--non-goals).)
- Delivery: D3 before merge + split reviewable PRs (owner, Q-001). Delivery
  deprioritised ("not in a rush to merge") — commits land locally, push at the
  owner's call.
- Oak is read **live from `main`, no pin** — owner, 2026-06-26 (supersedes the
  2026-06-20 `practice/castr-pin` rebased-branch model; the branch is **deleted** —
  controlled-sync points caused more issues than they solved). Read via
  `git -C <oak> show main:<path>`, never the working tree; never anchor a live Oak
  SHA into castr permanent docs. Full doctrine: `repo-continuity.md
§Repo-Wide Invariants`.
