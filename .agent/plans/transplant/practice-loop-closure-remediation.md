---
title: Practice loop-closure remediation — close the open feedback loops
status: current
lane: current
created: 2026-06-27
last_updated: 2026-06-27
owner_directive: >-
  "have you not brought the claims mechanism over from the oak repo? Just how much
  of the fundamental functionality in oak has been written off?" + "the skills and
  rules and hooks and subagent and agent tools cli all interact to produce the
  feedback rich, complex system that is the Practice" + "deeper firsthand audit by
  loop first" (owner, 2026-06-26/27).
related:
  - .agent/practice-core/decision-records/PDR-096-bring-the-iceberg-transplant-completeness.md
    (this plan EXTENDS PDR-096 — see § Relationship to PDR-096)
controlling_lane: >-
  .agent/memory/operational/threads/practice-transplant.next-session.md
  § Lane: Oak Parity-or-Better Program
read_model_note: >-
  Oak read live from `main` via
  `git -C <oak> show main:<path>`. Re-measure
  at execution: the loop map below was measured 2026-06-26/27 and Oak main moves.
method_loop_closure_test: >-
  A Practice feedback loop is CLOSED only if all four links exist and connect:
  (D) a doctrine surface demands a behaviour (rule/PDR/directive/merge_class metadata/
  skill instruction) -> (M) a mechanism performs or checks it (CLI/validator/skill/
  hook/generator) -> (W) wiring triggers M at the right moment (gate chain / husky hook /
  SessionStart / discoverability) -> (S) a signal BLOCKS or FAILS LOUD (not advisory/
  silent). Any missing link = OPEN, even when the doctrine + a green gate make it look done.
todos:
  - id: LC0
    content: >-
      STRUCTURAL CURE (recur-proof, do FIRST). Loop-closure meta-validator:
      fail the gate when a rule/skill/directive CLAIMS an enforcement mechanism, or
      references a `pnpm <script>`, that is not wired / does not exist. castr's
      `validate-no-stale-script-invocations` only checks `scripts/...` paths — it does NOT
      catch hollow `pnpm <script>` doc refs (proof: markdownlint-check:root / check:profile
      / cruise all passed green). Product code -> TDD (RED: a hollow ref fixture must fail
      the new validator before it exists). Wire into repo-validators:check. This is the
      cure for the ROOT (completeness measured by artefact-presence, not loop-closure).
    status: completed
    depends_on: []
    as_built: >-
      DONE (Hidden Veiling Mirror, 2026-06-27). `validate-loop-closure-references` built
      (pure helper `findHollowScriptReferences` + FS runtime; resolve universe RECOMPUTED
      each run from all workspace package.json scripts ∪ node_modules/.bin; scans
      .agent/rules|skills|directives in code-context only — inline + fenced incl. nested
      ``` / ~~~ fences) and WIRED blocking into repo-validators:check. 40 unit tests, full
      `pnpm qg` green. Owner chose "cure all 7 now" (Shape B): all 7 hollow refs cured in
      the same slice — check:profile (dropped Oak root proxy restored: `pnpm agent-tools:
      repo-check profile`); markdownlint-check:root/markdownlint:root (BROUGHT markdownlint,
      MD040-only `.markdownlint.json` + localised `.markdownlint-cli2.jsonc`, wired into qg,
      29 MD040 language-tags added across 21 canon files); cruise -> depcruise correction;
      secrets:scan + test:mutation reworded (honest Oak-cross-ref / planned-future, not
      runnable pnpm forms). Reviewers code/test/config run; their findings folded in
      firsthand (tilde-fence + `pnpm run <mgmt-word>` false-negatives FIXED; workspace
      parser extracted + unit-tested). See § As-built (LC0).
  - id: LC1
    content: >-
      Class-A — bring the F-95 coordination-safety gate (the founding-pilot-failure guard).
      Bring Oak `agent-tools/src/collaboration-state/{watcher-presence,claims-open-watcher-gate,
      cli-comms-assert-watcher-live,watcher-staleness-io}.ts`, localise, wire
      `assertNotBlindWithOtherAgents` into `claims open` (castr's openClaim currently calls
      only assertNoLiveIdentityRoutingCollision), and add the `comms assert-watcher-live`
      subcommand. TDD against the blind-claim collision. Also consume castr's currently-DEAD
      `detectStaleWatcher` (watcher-staleness.ts has no caller). Bring-by-default; no
      deliberate-localisation reason — it is agent-coordination Practice infra.
    status: completed
    depends_on: []
    as_built: >-
      DONE (Hidden Veiling Mirror, 2026-06-27, `6372024`). 4 Oak files brought verbatim
      (throw-based, zero error-model translation) + wired: openClaim resolves the watcher
      verdict OUTSIDE the lock then refuses INSIDE the transactional transform when the locked
      snapshot holds another live agent AND this session is blind (no write on refusal); solo
      bootstrap fast-path preserved; `comms assert-watcher-live` registered; dead
      detectStaleWatcher now has a production caller. TRANSITIVE infra caught firsthand (the
      understand-workflow's bring-plan MISSED it): the `comms watch` writer now auto-derives the
      heartbeat path (<seen-file>.heartbeat.json, --no-heartbeat opt-out) so it writes where the
      gate reads — without it the gate would falsely block every team claim. Prereq edits:
      stale-no-emit shape (agedMs/thresholdMs), HEARTBEAT_FILE_SUFFIX, export liveAgentIdentities,
      option-key sets. The C3 watcher step-deadline in the same Oak file was deliberately NOT
      brought (it is LC3, not LC1). TDD: brought Oak's 2 gate unit tests + a wired integration
      test (blind-with-peer refusal + no write; anti-spoof foreign-heartbeat refusal; present
      opens; NaN --now rejected); concurrency test reconciled (arms a live heartbeat per session,
      proves collision-safety WITH the gate). comms-watcher rule updated (heartbeat on-by-default;
      gate reads canonical path only). Code/test reviewers run, findings folded firsthand. Full
      `pnpm qg` green. See § As-built (LC1) for the two deferred fail-open findings.
  - id: LC2
    content: >-
      Class-A — bring the `semantic-merge` executor (HIGHEST knowledge-integrity risk).
      castr ships PDR-049 + PDR-050 + 9 `merge_class`-tagged files + a substrate schema, but
      NO mechanism performs the concept-merge -> concurrent/cross-branch edits to napkin /
      repo-continuity / registers get git-line-merged (the corruption PDR-049 exists to
      prevent; nearly bit this very session's shared-tree collision). Bring Oak
      `.agent/skills/semantic-merge/`, localise, generate `engraph-` adapter, and surface it
      at conflict-time (consider a `.gitattributes` merge-driver pointer so it FIRES, not just
      exists — the passive-guidance-loses bar). Skill+adapter bring.
    status: completed
    depends_on: []
    as_built: >-
      DONE (Hidden Veiling Mirror, 2026-06-27, stage-1 `7351b88` + stage-2 `c3484da`).
      FRAMING CORRECTED firsthand: there is NO Oak "executor" — Oak's semantic-merge is a single
      PASSIVE `SKILL-CANONICAL.md` ("git cannot do it; you must"), no merge-driver, no code. So
      LC2 = a skill bring + a castr-ORIGINAL firing tripwire (parity-or-better; owner-approved
      stage-1+2). STAGE-1: brought the skill, taxonomy RECONCILED to castr's real MERGE_CLASSES
      tokens (Oak's curated-learning-register/active-register-shard/curation-ledger/index-narrative
      would fail the substrate validator as invalid); engraph-semantic-merge adapter pair generated
      + Skill permission registered (owner cleared the self-modification guard); discoverable.
      STAGE-2: a refuse-and-route git merge driver (`agent-tools/src/semantic-merge/` + bin) that
      exits non-zero + routes to the skill on a conflict (does NOT line-merge — nothing can
      auto-merge prose meaning); `.gitattributes` maps `.agent/memory/**/*.md`; the postinstall
      bootstrap registers `merge.engraph-semantic-merge.driver` per-checkout (config is not
      committable). LOOP CLOSURE PROVEN by a real `git merge` in a throwaway repo (driver fired,
      routed, left file unmerged). Pure helper unit-tested; full `pnpm qg` green. Fresh un-installed
      clone falls back to git's default merge → the skill's human discipline is the backstop.
  - id: LC3
    content: >-
      Class-A — remaining missing enforcement, each its own slice: (a) machine-local-paths
      validator (Oak `validators/machine-local-paths/`) + wire into repo-validators:check —
      the `no-machine-local-paths` rule is prose-only today, and castr's own repo-continuity
      carries a machine-local path nothing catches; (b) PDR-063 claim handoff/adopt
      (`cli-claim-handoff-commands.ts` — `set-handoff`/`adopt`); (c) comms-watch per-step
      deadline (`comms-watch-errors.ts` — WatcherTimeoutError/runWithDeadline) so a hung
      watcher fails loud instead of looking alive; (d) fitness staleness axes
      (decision-debt/dwell/item-count/categories) — castr fitness is size/token-only, blind
      to register rot. TDD per code slice; (b) is partly a recorded forward-deferral
      (handoffs/README) — confirm or bring.
    status: in_progress
    as_built: >-
      (a) DONE (Open Lofting Feather, 2026-06-27). machine-local-paths validator brought from
      Oak (validator + pure helpers + unit tests), localised to castr's direct-`git` convention
      (no trusted-git.ts; matches commit-queue/git.ts). `machine-local-path` regex scoped_block
      added to policy.json (single-sources the pattern set AND lights the PreToolUse write-time
      guard repo-wide via empty-string include scope); wired blocking into repo-validators:check.
      LOOP PROVEN AT THE REAL LAYER: the validator found 324 real machine-local hits across 29
      tracked files → exit 1; after a doctrine-scoped, category-aware cure → exit 0 (2240 files
      clean). Cure: archive/ EXCLUDED (the rule's own Detection greps outside archive/ — frozen
      records); stale old-`personal/castr`-layout self-links → repo-relative (depth-correct);
      doctrinal Oak-checkout paths → `<oak>` placeholder; cross-repo research refs → prefix-stripped;
      vendored mcp-docs tutorial placeholders + 2 test fixtures → bracketed `<user>`. Reviewers
      (code/test/config) run, findings folded firsthand: added `'u'` flag to validator regex
      (schema-parity, drift foot-gun); corrected an inaccurate "never drift" claim to name the two
      deliberate scan/case differences (a Class-B false-claim cured in-lane); extracted
      exit/skip/fail-loud logic to testable helpers + proved the BLOCKING contract (exit 0/1/2 +
      fail-loud-on-unreadable, 10 tests). Case-SENSITIVE kept by MEASUREMENT (adding `i`
      false-positives on lowercase OpenAPI route fixtures). The write-time guard was confirmed live
      when it blocked this very as_built edit's literal path. Full `pnpm check` green. See
      § As-built (LC3a). (b)/(c)/(d) remain pending — each its own slice.
    depends_on: []
  - id: LC4
    content: >-
      Class-B — doctrine-vs-reality FALSE enforcement claims (the insidious class: agents
      trust them). WIRE BY DEFAULT (PDR-005 §Default disposition: bring by default — make the
      claim TRUE by bringing/wiring the enforcement; "correct the prose instead" is ONLY for the
      rare item where there is genuinely nothing to wire). (1) HEADLINE ✅ DONE 2026-06-28
      (brought, not gated): `.husky/commit-msg` now runs commitlint + version-guard (commit-time
      enforcement is real; supersedes the provisional 2026-06-15 advisory-only decision); the
      commit skill's enforcement-model prose corrected to match; commitlint.config.mjs note
      updated. (2) commit-skill type-enum table says 11 types; config
      allows 7 [feat,fix,refactor,test,docs,chore,perf] — correct the table. (3)
      `no-type-shortcuts` cites a repo-local `type-assertion-policy` ESLint rule that does not
      exist (orphan .test.ts; real ban is upstream consistent-type-assertions) — implement the
      rule or correct the citation. (4) `markdown-code-blocks-must-have-language` cites
      `pnpm markdownlint-check:root` + .markdownlint.json — neither exists; bring markdownlint
      (wire) or correct the rule. (5) `gates` skill cites `pnpm check:profile`; (6)
      architectural-file-system-structure cites `pnpm run cruise` (it is depcruise) — correct.
      LC0 prevents recurrence.
    status: pending
    depends_on: [LC0]
  - id: LC5
    content: >-
      Cross-cutting — DECIDE (owner-facing) the enforcement-scope of the Claude PreToolUse
      guards. ~10 rules (never-use-git-to-remove-work, no-hedging-vocabulary,
      stage-by-explicit-pathspec, no-unbounded-host-load, no-verify-requires-fresh-auth,
      present-verdicts-not-menus, etc.) are enforced ONLY via the Claude `policy.json`
      PreToolUse hook — Claude-session-only, NOT in git/CI -> invisible to Codex/Cursor and to
      any commit made outside a Claude hook, while the Practice claims cross-platform
      portability. Decide: cross-platform/CI backstop (e.g. a content/Bash gate in qg or a
      pre-commit check), accept Claude-only with a recorded reason, or per-rule split. Likely
      owner-facing; not a foregone wire.
    status: pending
    depends_on: []
  - id: LC-reopen
    content: >-
      Re-open the two dispositions that wrote off the F-95 layer (both disproven firsthand):
      parity `oak-parity-program.md` C4 (status completed on a false "code primitives present"
      premise) -> pending, re-pointed to LC1; `reference-closure.md` Task-6 ("nothing to bring
      in phase-8 scope" — under-counted by ~6 source files) -> correction note re-pointed here.
    status: completed
    depends_on: []
---

# Practice loop-closure remediation — close the open feedback loops

> **🧭 FOLDED (2026-06-28): next-step source is now [`oak-castr-gap-rescan-2026-06-28.md`](./oak-castr-gap-rescan-2026-06-28.md)** —
> LC3(b/c/d), LC4, LC5 appear there as Tier-1/2 backlog entries (LC0/LC1/LC2/LC3a ✅ done; LC4-item-1 commit-msg hook ✅).
> This plan is retained for the loop-closure-completeness thesis + per-item as-built/TDD detail, not as a competing
> "what's next" source.

## Problem and intent

The owner challenged whether Oak's coordination machinery was actually brought, and
how much of Oak's fundamental functionality had been "written off." A firsthand,
**by-loop** audit (5 read-only subagents, every load-bearing claim re-verified by the
authoring agent against source) found that castr's Practice has real teeth — the
skill-adapter, reviewer-roster, and hook-policy loops are CLOSED and gate-enforced, and
9 validators run blocking at `pre-push`/CI — but a concentrated set of feedback loops are
OPEN, in three classes. The unifying root: **completeness was measured by artefact
presence (is the file/rule/metadata there?), never by loop closure (does
doctrine -> mechanism -> wiring -> signal actually close?).** A green gate plus a present
rule plus present metadata reads as done while the loop is open — and worse, while a
doctrine surface _claims_ an enforcement mechanism that does not exist.

## Relationship to PDR-096

[PDR-096 "Bring the Iceberg"](../../practice-core/decision-records/PDR-096-bring-the-iceberg-transplant-completeness.md)
(Accepted; promoted from this session's plural-catch insight) says a transplanted
capability is complete only when its supporting infrastructure **resolves**. This plan
**extends** PDR-096 with two refinements that the audit forced:

1. **"Resolves" means the feedback LOOP closes** (D->M->W->S), not merely that a
   referenced file exists. The completeness _test_ is loop-closure, and the audit _method_
   must test loops, not count files.
2. **A new failure mode PDR-096 does not name: the doctrine-vs-reality FALSE claim**
   (Class B below) — a rule/skill asserts an enforcement mechanism that is absent or
   unwired. This is more insidious than a missing reference because agents _trust_ it.

On completion this should graduate as a PDR-096 amendment (or sibling PDR) — captured as
a lifecycle trigger, not authored here.

## The measured loop map (firsthand-verified 2026-06-26/27)

### Class A — genuinely missing enforcement (Oak has it; no positive localisation reason -> bring-by-default)

| Open loop               | D present                                          | M/W/S missing                                                                                                                                       | Evidence (verified)                                                                                       |
| ----------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| F-95 coordination gate  | comms-watcher rule; F-95 refs                      | `claims-open-watcher-gate` / `watcher-presence` / `assert-watcher-live` absent; `claims open` ungated (only `assertNoLiveIdentityRoutingCollision`) | `agent-tools/src/collaboration-state/cli-claim-commands.ts` (no watcher call); Oak `main` has the 3 files |
| semantic-merge executor | PDR-049 + PDR-050 + 9 `merge_class` files + schema | no skill / no merge-driver performs concept-merge; `merge_class` read only for token-validity                                                       | `.agent/skills/` has no `semantic-merge`; Oak `main` has it                                               |
| machine-local-paths     | `no-machine-local-paths` rule                      | no validator, not in any gate/hook                                                                                                                  | rule defers to "a future validator"; Oak wires `validators/machine-local-paths/`                          |
| watcher liveness/hang   | watcher rule + detector code                       | `detectStaleWatcher` has 0 callers (dead); no `comms-watch-errors` deadline                                                                         | `watcher-staleness.ts` unconsumed                                                                         |
| fitness staleness axes  | "fitness = rest-state health"                      | decision-debt/dwell/item-count/categories modules absent (size/token only)                                                                          | Oak `practice-fitness/` has all 4                                                                         |

### Class B — doctrine-vs-reality FALSE claims (doc asserts enforcement that is absent/unwired)

| False claim                                                                                     | Reality (verified firsthand)                                                                                                                                                              | Site                                                           |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| commit skill: pre-commit runs full lint/test chain + commit-msg runs commitlint + version-guard | `.husky/pre-commit` = **prettier only**; **no `.husky/commit-msg`**; commitlint + `prevent-accidental-major-version` run **nowhere** automated; real gate is `pre-push -> check:ci -> qg` | `.husky/pre-commit`, `.agent/skills/commit/SKILL-CANONICAL.md` |
| commit skill type-enum: 11 types                                                                | `commitlint.config.mjs` allows **7** [feat,fix,refactor,test,docs,chore,perf]                                                                                                             | `commitlint.config.mjs`                                        |
| `no-type-shortcuts`: enforced via repo-local `type-assertion-policy` ESLint rule                | that rule does not exist (orphan `.test.ts`); real ban is upstream `consistent-type-assertions`                                                                                           | `lib/eslint-rules/`, `lib/eslint.config.ts`                    |
| `markdown-code-blocks-must-have-language`: gated by `pnpm markdownlint-check:root`              | script + `.markdownlint.json` absent; MD040 unenforced                                                                                                                                    | rule body; `package.json`                                      |
| `gates` skill: `pnpm check:profile`; arch-fs directive: `pnpm run cruise`                       | neither script exists                                                                                                                                                                     | skill / directive bodies                                       |

### Class C — deliberate or planned (NOT gaps; do not "fix")

`validate-markdown-links` unwired (BLOCKING=false) = the recorded TC3a decision, TC3b
pending; `respect-active-agent-claims` "does not refuse entry"; `owner-attention` /
`ping-before-escalate` self-declared behavioural; `policy.json` sessionStart/preCommit
documented-only; the advisory commit orchestrator (PDR-053); the §7c freshness "hard gate"
markdown-ritual (PDR-029). Listed so a future audit does not re-flag them.

### Cross-cutting — the two-tier enforcement scoping gap (-> LC5)

Tier 1 = Claude PreToolUse guards (`policy.json`): **Claude-session-only**, not in git/CI.
Tier 2 = husky `pre-push -> check:ci -> qg -> repo-validators`: cross-platform but runs at
**push, not commit**, and excludes commitlint + version-guard + fitness. So ~10 rules are
single-platform-enforced, and commit-time is near-unguarded (prettier only).

## What is genuinely CLOSED (do not re-litigate)

Skill-adapter loop (19/19 + permissions, `skills:check`/`portability:check` blocking);
reviewer roster (18/18 three-platform, `validate-subagents`); hook-policy loop
(policy -> shim -> block -> `validate-policy-reappraisal` + `validate-pretooluse-guard-routing`);
9 wired validators (drift, patterns-index, subagents, collaboration-state schema,
fitness-vocabulary, lifecycle-scripts, stale-script-invocations, policy-reappraisal,
portability) blocking at pre-push/CI; the commit-skill's `pnpm` proxy plumbing (TC1) all
resolves and runs.

## Plan-body first-principles check

Per `.agent/rules/plan-body-first-principles-check.md`: **LC0/LC1/LC3(a,c,d) are product
code -> genuine TDD** (RED fixture before the validator/gate exists; never commit the
mechanism ahead of its failing test). **LC2 is a skill+adapter bring** -> validator-gated +
discoverability + FIRES-at-conflict-time proof, not a TDD cycle (the reason-skill bring
shape). **LC4 is mixed** — wiring a `.husky/commit-msg` is config+behaviour (prove it blocks
a bad message), doc corrections are doc edits. **LC5 + LC-reopen are decisions/doc edits**,
not TDD. Vendor-literal clause: re-read Oak live at execution — file lists/exports move.

## Non-goals (YAGNI)

- Not re-litigating Class-C deliberate decisions.
- Not bringing Oak product-coupled tooling (the parity program's recorded DON'T-BRING set
  holds firsthand — see the disposition-rigor audit: those dispositions are sound).
- Not changing the advisory polarity of the commit orchestrator (PDR-053 stands); LC4 adds a
  SEPARATE blocking commit-msg hook, it does not convert the advisory orchestrator.

## Foundation alignment

- `principles.md` fail-fast + `castr-parity-or-better-with-oak`: an unenforced doctrine and a
  false enforcement claim are both silent failures the loop-closure cure converts to loud ones.
- `metacognition.md` § Cure Shape — Structural, Not Doc-Patch: **LC0 is the structural,
  amortising cure** (it makes the whole class recur-proof); LC1-LC4 are the once-cures it
  protects.
- PDR-096 (extended here) + PDR-060 (tooling friction is first-class feedback).

## Sequencing

**LC0 first** (the meta-validator — recur-proofs the class and catches future drift) ->
**LC1 + LC2 in parallel** (the two highest-impact Class-A loops: coordination safety +
memory-integrity) -> **LC3** (remaining Class-A) -> **LC4** (Class-B, gated by LC0 so the
corrections cannot silently regress) -> **LC5** (owner-facing scope decision). **LC-reopen**
lands with LC1 (it re-points C4 at LC1). Move to `active/` when LC0 starts; archive per
ADR-117 when the loop map is all-CLOSED-or-decided. Lifecycle: graduate the loop-closure
completeness test + Class-B failure mode as a PDR-096 amendment on completion.

## As-built (LC0) — 2026-06-27 (Hidden Veiling Mirror)

LC0 landed self-contained (owner chose "cure all 7 now" over wire-now-with-known-debt or
standalone-defer). The validator design and the cures are recorded in the LC0 todo
`as_built`. Two design decisions worth conserving:

- **Code-context-only + resolve-against-(scripts ∪ .bin).** The validator only flags
  `pnpm <script>` refs inside inline/fenced code (English prose like "prefer pnpm scripts"
  is never flagged), and resolves against workspace scripts UNION `node_modules/.bin`
  (so `pnpm turbo` fall-through binaries resolve). This is what drove the FP count from 11
  (naive) to 0. Precision is mandatory for a blocking gate.
- **markdownlint brought MD040-only (deliberate localisation).** Oak's config lints the
  full default ruleset; bringing that faithfully would surface hundreds of un-doctrined
  violations. castr has exactly one markdown rule (MD040), so the bring enforces exactly
  the claimed capability. A fuller markdown-quality ruleset is a future lane, not a silent
  import (bring-by-default applies to the CLAIMED capability).

### Reviewer findings folded in (firsthand-verified) and deferred

Code/test/config reviewers all rated the change mergeable; no blocking bugs. **Fixed in
LC0** (verified firsthand before + after): tilde (`~~~`) fenced blocks were invisible
(false negative) — fence tracking now keys on fence char + length; `pnpm run <mgmt-word>`
(e.g. `pnpm run install`) was wrongly skipped — the management-subcommand guard is now
bypassed after a `run` unwrap; the workspace-yaml parser (`parseWorkspacePackages`) +
`stripQuotes` were extracted to the pure helper and unit-tested (the recompute claim was
otherwise unproven); `JSON.parse` now rethrows with the offending path + `cause`.

**Deferred (recorded, not LC0 scope):**

- **CI does not run `qg`/`check:ci` (config-expert MEDIUM).** `.github/workflows/ci.yml`
  runs only `lib` build+test, path-filtered to `lib/**`; markdownlint + every repo-validator
  (incl. LC0) enforce ONLY via the local `pre-push` hook (bypassable). This is the
  cross-cutting two-tier enforcement-scope gap this plan already names (-> **LC5**); LC0's
  new gates inherit it. A CI job running `pnpm check:ci` (+ broadened path filter) is the
  cure — folded into LC5's scope.
- **markdownlint ignore-glob hardening (config-expert LOW).** `**/reference/**`,
  `**/research/**`, `**/archive/**` match those dir names anywhere; a future canon dir so
  named would be silently excluded. `gitignore:false` + no `**/dist/**` ignore means future
  generated markdown could enter the lint set. Harmless today (footprint reconciles exactly:
  620 linted). Tighten if it bites.
- **Validator surface hardening (code-reviewer LOW).** No vendored-skill exclusion (sibling
  excludes `clerk-backend-api/SKILL.md`); latent — no vendored skills under the scanned
  roots today.

## As-built (LC1) — 2026-06-27 (Hidden Veiling Mirror)

LC1 landed (`6372024`, full `pnpm qg` green) — see the LC1 todo `as_built` for the bring +
wiring detail. The pivotal firsthand correction: the understand-workflow's bring-plan listed
the 4 gate files + 3 prereq edits but MISSED the transitive dependency that the `comms watch`
writer must auto-derive the heartbeat path (Oak's `resolveHeartbeatFile`) so it writes where
the gate reads — without it the gate reads "absent" and falsely blocks every team claim. Caught
by reading the writer + gate sources firsthand (bring-the-iceberg recurs; the audit method
under-counts). LC-reopen is closed by this landing: the F-95 layer is genuinely brought, so
parity C4 and reference-closure Task-6 are corrected (notes added there).

### Deferred from LC1 (Oak-faithful fail-opens → hardening slice + Oak back-flow)

Both exist in Oak too (verified firsthand), so fixing them unilaterally would diverge from Oak
on a load-bearing path; per the bidirectional-sharpening directive they are recorded as a
parity-or-better slice with an Oak back-flow note (see the innovations ledger), NOT silently
changed in LC1:

- **Future-dated `--now` defeats the population check (code-reviewer IMPORTANT).** The watcher
  half uses `Date.now()` but `assertNotBlindWithOtherAgents` computes `hasOtherLiveAgents` with
  the claim's `--now`; a `--now` beyond a peer's freshness window (default 14400 s) marks every
  peer stale → the gate is skipped. The NaN guard catches malformed, not future-dated. Bounded
  (requires a >4 h-future `--now`), but a real fail-open. Cure candidate: evaluate population
  liveness at the real clock.
- **cwd-relative heartbeat path vs explicit `--active` (code-reviewer IMPORTANT).**
  `resolveOpenClaimWatcherVerdict` resolves `DEFAULT_COMMS_SEEN_DIR` against `process.cwd()`
  while the registry is the explicit `--active` path. Running `claims open --active /repoA/...`
  from a cwd in repoB where this identity has a live heartbeat reads repoB's heartbeat → admits
  a blind claim into repoA (fail-open); the common cwd≠root case is fail-closed (false block).
  Cure candidate: derive the comms-seen dir from the `--active` path's repo root.

## As-built (LC3a) — 2026-06-27 (Open Lofting Feather)

LC3 sub-slice **(a) machine-local-paths validator** landed (full `pnpm check` green). The bring +
cure detail is in the LC3 todo `as_built`. Design + process points worth conserving:

- **Doctrine defines the gate's scope — read the rule before sizing the cure.** The
  `no-machine-local-paths` rule's own Detection section greps outside `archive/` and states matches
  must be zero "outside archive/ directories." So `archive/` is a DELIBERATE exemption (frozen
  historical records; rewriting them corrupts the record). The validator's exclude_paths encodes
  exactly that — it is NOT a hollow gate, it is the documented invariant scope. The rule does NOT
  exempt research/ or reference/, so those were cured, not excluded.
- **Loop proven at the real layer, not just unit-green.** The validator found 324 real hits → exit
  1; cure → exit 0. Then the PreToolUse write-time guard (same single-sourced block) fired live
  when it blocked a literal machine-local path in a plan edit. Both halves of D→M→W→S demonstrated
  firing on real input, the loop-closure completeness bar (not artefact presence).
- **Case-sensitivity is a MEASURED determination, not a copy-from-Oak default.** Two reviewers
  flagged that the validator compiles patterns case-sensitively while the write-hook uses `iu`.
  Rather than "align them," I measured: case-insensitive would match lowercase route segments that
  appear in real OpenAPI writer test fixtures under `lib/`, i.e. false-positive on legitimate
  non-paths. macOS canonical is capitalised; case-sensitive is correct for the backstop scan. The
  `'u'` flag WAS added (schema-parity; closes a latent drift foot-gun). The asymmetry is documented
  in the helper module as deliberate, not drift.
- **A bulk cure under-scopes — verify the diff of every category, not just the validator.** The
  category sed transforms collaterally mangled the rule file's own teaching example (a literal
  user-home `code/oak/...` illustration got prefix-stripped, destroying the thing it teaches) and
  produced malformed `file://../` URIs (a relative path cannot follow the `file://` authority
  marker). Both caught only by reading the diffs firsthand (the same bring-the-iceberg /
  verify-firsthand pattern that recurs across this lane).

### Reviewer findings folded (firsthand) and deferred

Code/test/config reviewers all rated the change mergeable. **Folded in LC3a:** the `'u'` flag; the
"never drift" wording correction (now names the scan + case differences); the blocking-contract
test gap (extracted exit/skip/fail-loud to pure helpers + 5 new tests, incl. fail-loud-on-unreadable
via an injected reader — parity-or-BETTER over Oak, whose validator leaves the wrapper untested).

**Deferred (recorded, not LC3a scope):**

- **5 pre-existing dead links surfaced by the cure (code-reviewer LOW).** The prefix-swap faithfully
  preserved already-stale link suffixes in historical/complete records (e.g. a moved
  `session-entry.prompt.md`, a removed e2e test). They predate this change and are machine-local-clean
  now; their target-staleness is a separate doc-hygiene concern → a future markdown-links sweep.
- **PII-in-archive consideration.** `archive/` is rule-exempt (frozen records), but archived napkins
  still contain real user-home segments that would leak if the repo is published. Honoring the rule
  as written; flagging the published-archive-PII question as an owner/rule-scope item, not a
  unilateral stricter gate.
- **LC5 CI-scope gap reconfirmed (config-expert).** `.github/workflows/ci.yml` does not run
  `check:ci`/`repo-validators`, and its path filter is `lib/**` — so this gate (like its siblings)
  enforces local-pre-push only and would not even trigger for this `.agent`/`agent-tools` change.
  Already folded into LC5.

Minor (code-reviewer suggestions, not actioned): `--now` validation message overstates "ISO-8601"
(`Date.parse` is lenient); the writer re-concats the heartbeat suffix rather than calling
`heartbeatFileForSeen` (matches Oak — both use the shared `HEARTBEAT_FILE_SUFFIX` constant, so
declined); an initial synchronous heartbeat at watcher startup would close a sub-second
launch window.
