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
  `git -C /Users/jim/code/oak-open-curriculum-ecosystem show main:<path>`. Re-measure
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
    status: pending
    depends_on: []
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
    status: pending
    depends_on: []
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
    status: pending
    depends_on: []
  - id: LC3
    content: >-
      Class-A — remaining missing enforcement, each its own slice: (a) machine-local-paths
      validator (Oak `validators/machine-local-paths/`) + wire into repo-validators:check —
      the `no-machine-local-paths` rule is prose-only today, and castr's own repo-continuity
      carries a /Users/jim path nothing catches; (b) PDR-063 claim handoff/adopt
      (`cli-claim-handoff-commands.ts` — `set-handoff`/`adopt`); (c) comms-watch per-step
      deadline (`comms-watch-errors.ts` — WatcherTimeoutError/runWithDeadline) so a hung
      watcher fails loud instead of looking alive; (d) fitness staleness axes
      (decision-debt/dwell/item-count/categories) — castr fitness is size/token-only, blind
      to register rot. TDD per code slice; (b) is partly a recorded forward-deferral
      (handoffs/README) — confirm or bring.
    status: pending
    depends_on: []
  - id: LC4
    content: >-
      Class-B — doctrine-vs-reality FALSE enforcement claims (the insidious class: agents
      trust them). Per item, DECIDE wire-vs-correct (default: make the claim TRUE by wiring,
      bring-by-default): (1) HEADLINE — the commit skill claims pre-commit runs the full
      lint/test chain + a commit-msg hook runs commitlint + prevent-accidental-major-version;
      reality (verified firsthand) = pre-commit is prettier-only, there is NO commit-msg hook,
      commitlint + version-guard run NOWHERE automated. Cure: add a `.husky/commit-msg`
      running commitlint + version-guard (make commit-time enforcement real) AND correct the
      skill's enforcement-model prose. (2) commit-skill type-enum table says 11 types; config
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
    status: pending
    depends_on: []
---

# Practice loop-closure remediation — close the open feedback loops

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
