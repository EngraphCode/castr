---
title: Oak Parity-or-Better Program — agentic-estate sophistication upgrade
status: active
lane: active
created: 2026-06-20
last_updated: 2026-06-20
supersedes_scope: >-
  Reframes transplant Phase 9 from "transplant closure" to one gate inside a
  broader estate-wide parity program. The transplant manifest's inventory was
  incomplete (it never tracked ArcAngel, the hook-policy concept model, the
  memory-machinery dirs); this plan's verified gap map is now authoritative.
owner_directive: >-
  "wherever castr's agentic systems are simpler, upgrade them to be at least as
  sophisticated and powerful as those in the Oak repo. castr may be relatively
  simple now, I do not intend for it to stay that way" + "review what else is
  less sophisticated ... I want everything upgraded ... ArcAngel ... is certainly
  not the only thing missing." (owner, 2026-06-20)
todos:
  - id: B2
    content: Upgrade metacognition directive 16->122 lines (Two-Modes/Friction/Fluency/cure-shape)
    status: completed
  - id: C1
    content: practice-fitness URL-aware prose width (measurableProseWidth) + fix evaluate.ts:95 raw length bug
    status: completed
  - id: C2
    content: assertClaimMatches fail-loud guard on claims heartbeat/close + restore --role field (incl. KNOWN_OPTION_KEYS so value-less --role fails loud)
    status: completed
  - id: C6
    content: Materialise memory-machinery dirs — BROUGHT quarantine/curator-passes/operational-archive/collaboration (4); workstreams + agent-capability-vocabulary are recorded NON-gaps (Oak-retired / product-coupled)
    status: completed
  - id: C4
    content: Re-add watcher liveness self-check + mutual-cover (opt-in --heartbeat-file reality); "Hardened against silent hangs" deferred to C3 (asserts unbuilt --step-timeout-ms, would be a costume)
    status: completed
  - id: C5
    content: Re-add liveness-heartbeat-cron loop-hygiene + remote cross-check sections
    status: completed
  - id: C7
    content: Add skillListingBudgetFraction to .claude/settings.json; skillOverrides + enabledPlugins are recorded NON-gaps (100% Oak-product-plugin-coupled)
    status: completed
  - id: C8
    content: Bring .claude/hooks/_lib/log-hook-errors.sh + wire castr's SessionStart hook through it (secrets hooks NOT brought — product-coupled)
    status: completed
  - id: A2
    content: Upgrade hook-policy to Oak concept/reappraisal model (content-deny-response, richer types/matchers, substring match) + host-load patterns + no-unbounded-host-load rule + start-right §7
    status: completed
    depends_on: []
  - id: A3
    content: Bring validate-policy-reappraisal validator + wire into repo-validators:check
    status: completed
    depends_on: [A2]
  - id: A4
    content: Statusline session-shape coordination indicators (team-shape/director/role) + --role declaration
    status: pending
  - id: A1
    content: ArcAngel/ARC rapid-comms protocol (doc + .agent/collaboration/rapid-comms/ + watcher-pairing clauses + statusline wing)
    status: pending
    depends_on: [A4]
  - id: B1
    content: Merge/rebase D4 archive+provenance branch (feat/d4-archive-provenance-backbring) onto the transplant branch
    status: pending
  - id: B3
    content: agent-identity versioned schema-registry (digest-pinning + namingSchemaVersion); wordlists already present
    status: pending
  - id: B4
    content: Cross-platform session-identity hooks (.cursor/hooks + .codex/hooks) + continual-learning state scaffold
    status: pending
  - id: B5
    content: Collaboration-state convention/lifecycle/placement-contract docs
    status: pending
  - id: B6
    content: Prompts machinery (collaboration/ subdir, research-session prompts, user-snippets, prompt archive)
    status: pending
  - id: C3
    content: Watcher silent-hang hardening (comms-watch-errors per-step deadline + WatcherTimeoutError)
    status: pending
  - id: P9
    content: Phase-9 closure gate (practice-verification + relevance-ledger + handoff) — AFTER parity lands; then cut transplant/phase-9
    status: pending
    depends_on: [A1, A2, A3, A4, B1, B2, B3, B4, B5, B6, C1, C2, C3, C4, C5, C6, C7, C8]
---

# Oak Parity-or-Better Program

Standing owner directive (2026-06-20): castr's agentic systems reach **parity-or-better** with Oak's,
estate-wide. See user-memory `castr-parity-or-better-with-oak`. This plan is the authoritative gap
inventory + execution plan; it **supersedes the transplant manifest's inventory**, which was
incomplete.

## End goal / mechanism / means / non-goals

- **End goal:** every castr agentic subsystem is at least as sophisticated and powerful as Oak's at
  pin `ad359a4f`, with castr's deliberate localisations preserved. castr is a peer agentic platform,
  not a simplified fork.
- **Mechanism:** a firsthand Oak↔castr gap audit (done) classifies each difference as
  **deliberate-localisation** (preserve) or **unbuilt-capability gap** (upgrade). Each gap upgrades
  to Oak's capability with TDD where it is code, gated green, reviewed, and committed roll-forward.
- **Means:** the verified gap map below (the disposition ledger), executed in the sequenced tranches
  in §Sequencing.
- **Non-goals (YAGNI / deliberate localisation — explicitly NOT doing):** reverting castr's fail-fast
  doctrine to `use-result-pattern`; bringing Oak-product tooling (clerk/elasticsearch/sentry/a11y/
  design-system/react/ground-truth/EEF/sonarqube experts + skills, `ci-schema-drift-check`,
  `oak-logo.ts`, Oak `.cursor` SaaS plugins); re-introducing Oak tokens into PDRs; tagging Phase 9
  before the full sweep lands. castr is AHEAD on `drift` + `patterns-index` validators — do not "sync
  down".

## Method + classification

- Read the Oak pin via `git -C /Users/jim/code/oak-open-curriculum-ecosystem show practice/castr-pin:<path>`
  (ref `ad359a4f`), NEVER the Oak working tree.
- Each difference is classified **deliberate localisation** (preserve) vs **unbuilt-capability gap** (upgrade).
- The 2026-06-20 audit fanned out 5 read-only subagents; **all load-bearing claims were re-verified
  firsthand** (per `verify-agent-claims-firsthand`). Three agent errors were caught + corrected
  (noted inline). Do not trust the raw audit reports over this verified map.

## Disposition ledger — verified gap map (every gap a recorded decision)

### Tier A — high impact

| #   | Gap                                   | Oak source                                                                                                                                | castr state (VERIFIED)                                                             | Size | Notes                                                                                                                                                                                                                                                              |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A1  | ArcAngel / ARC rapid-comms protocol   | `.agent/reference/arc-rapid-communication.md` (354L) + `.agent/collaboration/rapid-comms/`                                                | LACKS `.agent/collaboration/` entirely                                             | M    | Owner-named. Complementary low-latency peer-dialogue channel; complements (not replaces) canonical comms. Needs doc+dir+watcher-pairing clauses+statusline wing (depends A4).                                                                                      |
| A2  | hook-policy concept/reappraisal model | `content-deny-response.ts` (83L), `types.ts` (218 vs 130), `blocked-patterns.ts` (148 vs 96), `matchers.ts` (224 vs 200), substring match | SIMPLER: flat `{pattern,citation}`, no reappraisal/concept, token-subsequence only | L    | Teaching deny-messages (PDR-044 §Innate immunity). Open evasion: busy-loop in a quoted token sails past castr's matcher (proven live this session). Ships host-load patterns + the `no-unbounded-host-load` rule (already reconciled, untracked) + start-right §7. |
| A3  | validate-policy-reappraisal validator | `agent-tools/src/validators/policy-reappraisal/` (3 files)                                                                                | MISSING (not in castr's 8-validator chain)                                         | M    | Commit-time gate enforcing reappraisal presence. **depends_on A2.**                                                                                                                                                                                                |
| A4  | statusline session-shape indicators   | `statusline-session-shape.ts` (219L), `statusline-indicators.ts`, `statusline-ansi.ts` + `--role`                                         | identity+git+model only; coordination-blind                                        | M    | Team-shape/director/ArcAngel-wing, fed by claims+experiments reads. `oak-logo.ts` is a brand asset → DON'T bring; insert indicator segment into castr's single-line layout.                                                                                        |

### Tier B — medium impact

| #   | Gap                                           | Oak source                                                                                                 | castr state (VERIFIED)                                                                                          | Size |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| B1  | D4 archive + provenance engines               | `collaboration-state/archive/` (8 files) + `provenance/` (3 files)                                         | **NOT missing — landed on branch `feat/d4-archive-provenance-backbring` (now pushed)**. MERGE/REBASE, not build | M    |
| B2  | metacognition directive depth ✅ DONE         | `.agent/directives/metacognition.md` (122L)                                                                | UPGRADED 2026-06-20 (`fcda10a`) — was 16L                                                                       | S    |
| B3  | agent-identity versioned schema-registry      | `core/agent-identity/schema-registry.ts` (145L) + digest-pinning + `namingSchemaVersion`                   | PARTIAL: themed wordlists already present + used; MISSING only the versioning/digest/era registry               | S-M  |
| B4  | cross-platform session-identity hooks         | `.cursor/hooks/` + `.codex/hooks/practice-session-identity.mjs` + continual-learning state                 | Claude hook only; LACKS `.cursor/hooks` + `.codex/hooks`                                                        | S-M  |
| B5  | collaboration-state convention/lifecycle docs | `operational/collaboration-state-conventions.md` (201L), `-lifecycle.md` (252L), placement-contract (110L) | MISSING                                                                                                         | M    |
| B6  | prompts machinery                             | `agentic-engineering/collaboration/`, research-session prompts, `user-snippets.md`, prompt `archive/`      | session-continuation + 2 prompts only                                                                           | M    |

### Tier C — small / correctness

| #   | Gap                                         | castr state (VERIFIED)                                                                                                   | Size   |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| C1  | practice-fitness URL-aware width (real bug) | `evaluate.ts:95` uses raw `line.text.length` → false-flags long-URL lines                                                | S      |
| C2  | `assertClaimMatches` fail-loud guard        | `heartbeatClaim` silently `.map`-no-ops on no-match; `--role` dropped (fail-fast regression)                             | S      |
| C3  | watcher silent-hang hardening               | loop has error taxonomy but no per-step timeout race (`WatcherTimeoutError`)                                             | M      |
| C4  | watcher liveness self-check + mutual-cover  | code primitives present, rule guidance stripped                                                                          | S      |
| C5  | liveness-heartbeat-cron loop hygiene        | 238L vs 283L, hygiene + remote cross-check sections missing                                                              | S      |
| C6  | memory machinery dirs                       | quarantine/curator-passes/workstreams/operational-archive/memory-collaboration + agent-capability-vocabulary all MISSING | S each |
| C7  | Claude settings keys                        | lacks `skillListingBudgetFraction` + `skillOverrides`                                                                    | S      |
| C8  | hook error-logging lib                      | lacks `.claude/hooks/_lib/log-hook-errors.sh` (secrets hooks = assess coupling)                                          | S      |

### Confirmed NON-gaps (deliberate localisation / product-coupling — recorded so a future audit does not re-flag)

fail-fast over `use-result-pattern`; zero-Oak-token PDR convention; dropped Oak-product experts/skills/rules;
`ci-schema-drift-check`; `oak-logo.ts`; Oak `.cursor` SaaS plugins. castr is AHEAD on `drift` + `patterns-index`.
CI/repo-check at parity. Sub-agent roster at parity once Oak-product experts excluded + code/test/type-expert↔reviewer
renames accounted.

**Added by Tranche-1 firsthand verification (2026-06-20, Clouded Floating Gust) — gap-framings that narrowed on
measurement against the live pin (per `plan-body-first-principles-check`):**

- **`workstreams/` memory dir (was in C6)** — Oak's own `workstreams/README.md` marks the surface **RETIRED** (folded
  into thread next-session records). castr's `operational/threads/` + the active `## Lanes` section IS the successor;
  materialising it would be a tombstone (`no-tombstones-for-removed-ideas`). NON-gap.
- **`executive/agent-capability-vocabulary.md` (was in C6)** — fully product-coupled: Oak's three-audience domain model
  (repo / Oak-developer-platform / teacher-curriculum), citing ADR-189 + curriculum-tools docs castr lacks. castr is
  single-domain (headless schema lib). Same family as the dropped Oak-product experts. NON-gap.
- **`skillOverrides` + `enabledPlugins` in `.claude/settings.json` (was in C7)** — 100% Oak-product-plugin-coupled
  (sentry/vercel/sonarqube SDK skills castr does not enable). Only `skillListingBudgetFraction` was a real gap. NON-gap.
- **"Hardened against silent hangs" watcher rule section (adjacent to C4)** — asserts a per-step `--step-timeout-ms`
  deadline castr does not yet implement; that is C3 (Tranche 4). Bringing the rule text now would be a costume
  mechanism (PDR-092). Deferred to C3, not a non-gap.

**Added by Tranche-2 firsthand verification (2026-06-21, Igneous Flaring Hearth) — A2 scope decisions recorded so a
future audit does not re-flag:**

- **Oak's `indefinite-deferral` content scoped-block group — OUT of A2 scope (deferred parity item, not a non-gap).**
  Oak's policy.json ships a fourth content group (`parked`/`shelved`/`on hold`/… regex) citing
  `no-hedging-vocabulary.md §Indefinite-deferral vocabulary` and `principles.md §Strict and Complete`. Measured
  firsthand: castr's `no-hedging-vocabulary.md` has NO such section, so bringing the group would cite a section castr
  lacks — a costume (PDR-092). It also has false-positive blast radius on castr's own continuity surfaces, which discuss
  parking-as-an-antipattern. Bringing it properly first needs the no-hedging-vocabulary §Indefinite-deferral section +
  the principles §Strict-and-Complete reconciliation + a castr-surface false-positive assessment. Recorded as a future
  content-doctrine slice, sequenced separately from the mechanism upgrade.
- **`stress-ng` substring breadth — ACCEPTED (deliberate-localisation, Oak-pin-faithful).** config-expert measured that
  `match: "substring"` for `stress-ng` also blocks benign substrings (`libstress-ng`, `distress-ng-test`). This is
  Oak's verbatim design and PDR-044 names innate-layer false positives a design property; the deny TEACHES and is
  overridable, and `stress-ng` should essentially never appear in a legitimate castr command (headless schema lib).
  Tightening to word-boundary matching would diverge from the pin and expand A2's matcher beyond the brought capability;
  preserved as-is. The three sibling host-load shapes (`for(;;)`, `while(1)`, fork bomb) showed no benign false positive.

## Sequencing (low-risk high-value first; couple dependent units)

1. **Tranche 1 — doctrine + correctness quick wins (S): ✅ COMPLETE (2026-06-20, Clouded Floating Gust).** B2 ✅ →
   C1 ✅ → C2 ✅ → C6 ✅ → C4 ✅ → C5 ✅ → C7 ✅ → C8 ✅. C1/C2 were TDD against real defects in castr's own systems
   (C1 false-flag fix; C2 silent-no-op + value-less `--role`). Four firsthand narrowings recorded as NON-gaps above
   (workstreams, agent-capability-vocabulary, skillOverrides) + one deferral to C3 (watcher per-step deadline). Full
   `pnpm check` green at the tranche; code/test/config reviewers run, all load-bearing claims re-verified firsthand
   (the code-reviewer's `KNOWN_OPTION_KEYS` defect was confirmed + fixed RED-first).
2. **Tranche 2 — hook-policy capability unit (L): ✅ COMPLETE (2026-06-21, Igneous Flaring Hearth / 611206).** A2 + A3
   landed in three roll-forward commits (`511326f` no-hedging §-cite fix → `abe580f` A2 → `31caf78` A3). RED-first
   against the founding 2026-06-11 host-DOS busy-loop (PDR-092): six failing tests confirmed the quoted-token evasion
   before substring matching was added, then green. `no-unbounded-host-load.md` is now IN-TREE (with wrappers +
   RULES_INDEX + start-right §7); the prior "untracked, can't commit until A2 adds the patterns" blocker is resolved —
   policy.json ships the four host-load shapes (`for(;;)`, `while(1)`, fork bomb, `stress-ng`, `match: "substring"`)
   the rule's Enforcement section claims, so the PDR-092 costume concern is discharged. Full `pnpm check:ci` green at the
   tip; config/type/test reviewers run, all load-bearing claims re-verified firsthand (the config-expert's false-§-cite
   find in `no-hedging-vocabulary.md` was confirmed + fixed; four review-driven test-coverage additions landed).
3. **Tranche 3 — statusline + ArcAngel (M):** A4 → A1 (A1's wing depends on A4's session-shape surface). A1 scope is
   owner-confirmable (partly Oak infra; owner named it explicitly so default = bring).
4. **Tranche 4 — delivery + remaining capability (M):** B1 (merge the D4 branch — coordinate-dependent), then B3, B4,
   B5, B6, C3 in any order.
5. **P9 closure gate:** practice-verification + relevance-ledger + handoff, then cut `transplant/phase-9`. **Runs only
   after every tranche lands** — the docs forbid a green-but-incomplete Phase-9 tag (the Phase-1b failure mode).

## Acceptance criteria + proof contract

- **Per code gap (A2/A3/A4/A1/B1/B3/B4/C1/C2/C3):** the Oak capability is present in castr (parity-or-better),
  proven by a test at the appropriate level (`unit`/`integration`) authored RED-first where new behaviour is added;
  `pnpm check` green; relevant reviewer PASS (config-expert for hook-policy/settings; type/test-reviewer for
  agent-tools code; architecture reviewer for ArcAngel/statusline subsystems). Proof = the named test command + a green
  gate run.
- **Per doc/dir gap (B2✅/B5/B6/C4/C5/C6/C7/C8):** the surface exists, is format/validator-green, refs resolve, Oak
  tokens neutralised per castr convention. Proof = `format:check` + `repo-validators:check` green + a reverse-closure
  ref sweep clean.
- **Program acceptance:** every ledger row is `applied` or has a recorded non-gap/deferral decision; a re-run gap
  audit against `ad359a4f` surfaces no new unbuilt-capability gap; `transplant/phase-9` cut green.

## Risk assessment

- **Three-way merge noise (rules/agent-tools):** castr's localisations conflate with Oak amendments. Mitigation: the
  `ad649710` base three-way + the localisation-vs-gap classification (proven on PDRs this session). The hook-policy
  three-way showed castr's files sit unmodified at the base → cleaner bring than feared.
- **Costume mechanisms (PDR-092):** bringing a rule whose enforcement claims are false in castr. Mitigation: make the
  claim true (A2 brings the patterns the `no-unbounded-host-load` rule asserts) before committing the rule.
- **Conflict on shared agent-tools files under parallel execution:** mitigation — serialise the agent-tools code
  tranches (or worktree-isolate); the doc/dir gaps are independent and parallel-safe.
- **ArcAngel scope creep / Oak-infra coupling:** mitigation — owner-confirm A1 scope; the statusline wing degrades
  gracefully when `experiments` listing is absent.

## Foundation alignment

- `principles.md` (fail-fast, IR-honesty preserved as deliberate-localisation non-gap), `testing-strategy.md` +
  `tdd-as-design.md` (RED-first cycles for all code gaps), `requirements.md`, `DEFINITION_OF_DONE.md` (one-gate-at-a-time
  green per slice). PDR-092 (untested mechanism is prose in costume) governs A2. PDR-044 §Innate immunity is the
  doctrine A2 implements.

## Plan-body first-principles check

Per `.agent/rules/plan-body-first-principles-check.md`: before executing each tranche, re-confirm (a) the gap is still
real against the live pin (re-measure — bases drift), (b) the castr difference is an unbuilt gap not a deliberate
localisation, (c) the landing path is a test + green gate, not a doc edit. The vendor-literal clause fires on every
`git -C <oak> show` read (pin ref, never working tree).

## Readiness reviewers

Before marking any tranche READY/complete: `assumptions-expert` (proportionality — already implicitly run via the
audit + this plan), plus per-substance specialists (config-expert for hook-policy/settings; architecture-expert for
ArcAngel/statusline; test/type-reviewer for agent-tools code; docs-adr + onboarding for the doctrine/Practice surfaces).
All reviewer load-bearing claims re-verified firsthand (`verify-agent-claims-firsthand`).

## Learning loop + lifecycle triggers

Each tranche close runs `/engraph-consolidate-docs` discipline (graduate lessons; refresh continuity). On program
completion: mine permanent docs, archive per ADR-117, cut `transplant/phase-9`, and run a final gap re-audit. Lifecycle
triggers per `../templates/components/lifecycle-triggers.md` (note: castr's `.agent/plans/templates/` is itself empty —
a meta-gap; the component reference is aspirational until templates are materialised — recorded for a future tranche).

## Relationship to Phase 9 + continuity surfaces

Phase 9 (transplant closure) is now the **P9 closure gate** at the end of this program, not a standalone next step.
Authoritative pointers: transplant tracker (`README.md`), `session-continuation.prompt.md` top block,
`repo-continuity.md`, and the `practice-transplant.next-session.md` thread record all reference this plan as the active
deep-enhancement workstream. The PDR-currency sync (4 new + 9 folded PDRs) completed 2026-06-20 (`5c40adb`, `3787928`).
