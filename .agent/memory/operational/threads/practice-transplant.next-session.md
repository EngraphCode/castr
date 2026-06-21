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
| claude-code | claude-opus-4-8-1m | 10bc66            | Ethereal Weaving Star          | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 328f4f            | Secret Watching Candle         | implementer  | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 4aeee2            | Stratospheric Wheeling Horizon | implementer  | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | fdb75b            | Briny Cresting Sextant         | director     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | cba47e            | Stormy Sailing Archipelago     | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 8de446            | Clouded Floating Gust          | executor     | 2026-06-20    | 2026-06-20   |
| claude-code | claude-opus-4-8-1m | 611206            | Igneous Flaring Hearth         | executor     | 2026-06-21    | 2026-06-21   |
| claude-code | claude-opus-4-8-1m | 89120c            | Volcanic Charring Hearth       | consolidator | 2026-06-21    | 2026-06-21   |

## Lanes

A lane is an independently pickup-able arc — its own state, branch, and pickup
trigger, active OR deferred. There is no single thread-level "next safe step";
several lanes can be "next" at once. Branch is `feat/transplant-engraph-practice`
for every lane (single-branch invariant) until the split-PR delivery (D3-gated).

### Lane: Oak Parity-or-Better Program — ACTIVE, DOMINANT (started 2026-06-20)

- Controlling plan: [`../../../plans/transplant/oak-parity-program.md`](../../../plans/transplant/oak-parity-program.md)
  (authoritative executable plan + verified gap map; supersedes the transplant manifest's inventory).
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
- **Acceptance:** every ledger row applied-or-decided; gap re-audit clean; then the P9 closure gate.

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

### Lane: remediation 02–07 — deferred (trigger: owner names it after the transplant)

- Controlling plan: [`../../../plans/active/02-ir-fidelity-proof-harness.md`](../../../plans/active/02-ir-fidelity-proof-harness.md) (02 active-next; 03–07 follow).
- Next safe step: the deep-review backlog (5 of 6 reproduced Criticals still
  unfixed) takes a **named position after** the full transplant (owner steer
  2026-06-19); not parked — `no-manufactured-permission` holds.
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

- Controlling detail: [`../../active/napkin.md` §FIRST RUN of the collaboration setup](../../active/napkin.md) (F1–F12,
  N1–N12, measured firsthand by the first concurrent stream). The concrete cures are the lane bullets below.
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
  substring for shapes that genuinely hide inside one quoted token (`for(;;)`/`while(1)`/fork bomb). This SUPERSEDES the
  friction-fix N7/N11 bullet and the Q-005 "accept" framing.
- Next safe step: RED-first against the founding false positives (`libstress-ng`, `git checkout -b`, the N7/N11 prose
  cases) in `agent-tools/src/hook-policy/`; then write the Oak back-flow note (home: the `oak-backflow/` feedback
  surface) describing the precision improvement for upstream adoption.
- Acceptance bar: precision lands TDD-green (false positives gone, true positives still caught); Oak back-flow note written.

### Lane: dependency currency — active-next, PLAN READY (owner-directed 2026-06-21; `pnpm -r outdated` assessed)

- **Controlling plan (NEW, READY): [`../../../plans/current/dependency-currency.md`](../../../plans/current/dependency-currency.md)**
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

- **Decision pass (owner, 2026-06-21) — decision-complete before Tranche-3 planning:** Q-002 RESOLVED (single-TS pnpm
  override is the permanent fix — sonarjs 4.1.0 still vendors TS as a regular dep; not awaiting upstream); Q-004 RESOLVED
  (release tooling = `changesets`, execution deferred); Q-005 RESOLVED (INVEST in hook-matcher precision + Oak back-flow
  — its own lane); A1/ArcAngel = full unit (doc+dir+watcher-pairing+statusline wing); the two structural-cure validators
  fold into the friction-fix tranche; new dependency-currency lane (castr is current). castr is a **bidirectional**
  Practice node — improvements flow back to Oak (user-memory `castr-parity-or-better-with-oak`).
- Single branch `feat/transplant-engraph-practice`; roll-forward only; each
  transplant phase = one atomic commit + `transplant/phase-N` tag, green-gated at
  the tag. (Full invariant set: [`../repo-continuity.md §Repo-Wide Invariants`](../repo-continuity.md#repo-wide-invariants--non-goals).)
- Delivery: D3 before merge + split reviewable PRs (owner, Q-001). Delivery
  deprioritised ("not in a rush to merge") — commits land locally, push at the
  owner's call.
- Oak sync pin is the rebased branch `practice/castr-pin` (off Oak `main`, rebased
  at controlled points; may go stale by design), not a frozen SHA — owner, 2026-06-20.
  Currently synced to `ad359a4f` (= Oak `main` HEAD). Read the pin via
  `git -C <oak> show practice/castr-pin:<path>`, never the Oak working tree. Full
  doctrine: `repo-continuity.md §Repo-Wide Invariants`.
