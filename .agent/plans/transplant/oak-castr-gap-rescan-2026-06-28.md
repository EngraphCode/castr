---
title: Oak(OOCE) → castr gap rescan — authoritative bring backlog (2026-06-28)
status: current
lane: current
created: 2026-06-28
owner_directive: >-
  "I have updated OOCE, maybe we should do a deep rescan of it, and of Castr, so we
  know what Castr does and does not have." + "bring everything over … the ONLY time
  to not bring something is where it is utterly irrelevant" (owner, 2026-06-28).
method: >-
  Two-pass ultracode workflow rescan, each pass = per-subsystem classify → adversarial
  verify → synthesis. Pass 1 = 12 lanes (26 agents). Pass 2 = 11 modalities the pass-1
  completeness-critic found uncovered (23 agents). Oak read LIVE from main
  (git -C <oak> show main:<path>); castr from the working tree. Every load-bearing /
  contradiction-prone claim re-verified FIRSTHAND by the authoring agent (Open Lofting
  Feather) — see § Firsthand corrections. Classification: HAVE = present AND loop-closed;
  HOLLOW = present but unwired / a false doctrine claim; LACK = absent; OUT-OF-SCOPE =
  utterly irrelevant (product-coupled) per PDR-005 §Default disposition.
supersedes: >-
  The 2026-06-20 gap map in oak-parity-program.md (Oak has since been updated; this rescan
  is more complete and firsthand-validated). oak-parity-program.md remains the executable
  parity-tranche plan; its gap INVENTORY is superseded by this document.
read_model_note: >-
  Oak main moves; re-measure at execution. Per-lane raw findings (JSON) live in the session
  workflow transcripts (run IDs wf_b3f92d22-420 pass-1, wf_573c2fd2-429 pass-2).
---

# Oak(OOCE) → castr gap rescan — authoritative bring backlog (2026-06-28)

This is the work-list the **bring-everything** program (PDR-005 §Default disposition) runs
on: every Oak Practice/agent/quality/guardrail capability classified against castr. Bring
everything not marked OUT-OF-SCOPE; "utterly irrelevant" (product-coupled) is the only
no-bring bar. Items are impact-ordered within tiers, each with its `oak_path` so any line
can be re-verified firsthand.

## This is the single ordered backlog for Axis A — folded plans (2026-06-28)

To end the "same item owned by 3–4 plans" problem, this doc is the **single source of truth
for the next-step ordering of Axis A** (the Oak→castr bring program). The earlier per-theme
plans are **folded in** — their items appear here as Tier entries; those plans are retained
for **as-built history + per-item TDD/bring detail**, not as competing "what's next" sources:

- [`practice-loop-closure-remediation.md`](./practice-loop-closure-remediation.md) — LC3(b)
  claims-handoff, LC3(c) watcher-deadline, LC3(d) fitness-axes, LC4 (Class-B doctrine-vs-reality
  incl. the 1 done = commit-msg hook), LC5 (CI-runs-gates) → all appear in Tier 1/2 here.
- [`transplant-completeness-supporting-infrastructure.md`](./transplant-completeness-supporting-infrastructure.md) —
  TC2 plan-templates, TC4 dangling-ref disposition, TC1b (pr-watch + install-cursor-statusline) → Tier 1/2 here.
- [`oak-parity-program.md`](./oak-parity-program.md) — its **executable tranche record stays**; its **gap inventory
  is superseded by this doc**. Tranche-3 A1 ArcAngel + A4 statusline + the B/C3 items → Tier 1/2 here.

**Parallel castr-internal lanes — NOT Axis A (not Oak-gaps; tracked separately in the thread record):**
dependency-currency DC3–5; the first-run friction-fix tranche; hook-matcher precision; the two LC1 Oak-faithful
fail-opens (hardening plus Oak back-flow); and the two open castr-internal cleanups Q-009 (PDR 096/097 renumber)
and Q-010 (principles.md Result-vs-fail-fast). **Axis B** = product-remediation `remediation/02–07`. **Axis C** =
delivery. A/B/C sequencing is open owner decision Q-011.

## Firsthand corrections to the subagent findings (owner mandate: "critically analyse all subagent findings and sources")

The authoring agent re-verified the load-bearing and contradiction-prone claims directly.
Four corrections / source-reliability findings:

1. **`use-result-pattern` non-bring — SUPERSEDED BY OWNER RULING (2026-07-03).** The
   correction as originally recorded: the rule bring "contradicts castr's
   fail-fast-over-result doctrine" (D4 rejected `@oaknational/result` → throw), so the rescan
   classed it a deliberate non-bring and the principles.md `Result<T,E>` examples a
   castr-internal tension (became Q-010). **The owner ruled at the 2026-07-03 consolidation
   walk: _"Result in no way precludes fail fast, Result<T,E> IS the correct pattern, and fail
   fast is absolutely required everywhere"_ — the framing was a false dichotomy; Result and
   fail-fast COMPOSE.** Reach is FULL (owner, same walk): (a) `use-result-pattern` becomes a
   **BRING** (moved out of OUT-OF-SCOPE; localise to castr's estate on bring); (b) a named
   backlog slice migrates the D4 throw-based reconciliation (archive/provenance error model)
   and similar we-are-fail-fast-not-Result seams to `Result<T,E>` with fail-fast composition
   — see the 2026-07-03 delta items. The ESLint `preserve-caught-error` hygiene bring stands.
2. **Source disagreement resolved → `pr-watch` is ABSENT** (gap_map LACK correct; the pass-1
   completeness-critic's "resolved as present on re-check" was FALSE — verified no
   `agent-tools/src/pr-watch`).
3. **`.cursor/hooks` is ABSENT** (the Cursor/Codex session-identity hooks are genuinely
   HOLLOW — adapters built, vendor shims missing; critic's "present" was FALSE).
4. **castr's `.agent/reference/` LACKS Oak's Practice-mechanism reference docs** (the critic's
   "mirrors all 8 files" was FALSE — castr's reference/ holds only `grammar-of-thinking.md` +
   castr schema-domain refs).

**Source-reliability calibration:** the per-lane classify→verify audits were reliable
(the verify phase made good catches, e.g. correctly reclassifying `invoke-react-component-expert`
in-scope because castr genuinely ships an `ink`+`react` TUI). The pass-1 **completeness-critic's
drive-by presence re-checks were unreliable** (3/3 false-presence claims above). Trust the lane
audits over critic re-checks; the critic's value was naming the uncovered _modalities_, not
adjudicating presence.

## Tier 1 — highest impact (security / enforcement-integrity / coordination-safety / knowledge-integrity)

- **CI does not run the gates server-side** ✅ **DONE (in-repo) 2026-06-28 (`38073f1`)** — replaced the
  lib-only `build` job (gated behind `paths:[lib/**]`) with a single `quality-gates` job running
  `pnpm check:ci` (clean + frozen install + qg) on every push/PR to main, any path; pinned gitleaks
  (sha256-verified) + full-history checkout for the secret scan; CodeQL retained. Closes the gitleaks-in-CI
  sub-item too. **PROVEN GREEN 2026-06-28 on PR #3** (quality-gates ran `check:ci` server-side, 6m21s,
  success; PR MERGEABLE/CLEAN). The first CI run caught real debt: `main`'s PR #2 added an unformatted
  research file that fails prettier, surfaced in the merge tree — fixed by merging origin/main + reformatting
  (`2a853a4`). **OWNER-ONLY remaining:** set `quality-gates` as a required status check in the main branch
  ruleset (a GitHub repo setting, not expressible in-repo) — now unblocked (CI is proven green). _Was the
  single biggest integrity hole = the long-tracked LC5 finding._ **Future enhancements (not gaps):**
  (a) Oak splits this into parallel per-check jobs with a `run-quality-gates` fan-in; castr's single job is
  correct + simpler-appropriate. (b) ✅ **DONE 2026-07-03 (`cec8bce`, verified firsthand):** every ci.yml action is
  SHA-pinned at current majors (Oak's pattern), plus a fail-loud workspace-coverage-enumeration guard. Also since:
  CodeQL moved to GitHub default setup (`ea8fc1f`), superseding this entry's "CodeQL retained" wording.
- **No secret scanning** ✅ **DONE (qg side) 2026-06-28 (`ec53da7`)** — brought a castr-localised
  `.gitleaks.toml` (useDefault + reference-docs/test-fixture/SHA-prefix allowlists; dropped Clerk +
  SonarCloud-key + Oak wide-sweep-commit + OAK/Notion-rule items) and the `secrets:scan{,:all,:all-refs}`
  scripts; wired `secrets:scan` as the first step of `qg`. Verified clean (working tree + 312-commit
  branch/tag history). **Remaining (folds into CI-runs-gates):** the CI secret-scan job + installing
  gitleaks in CI.
- **trusted-git core** ✅ **DONE 2026-06-28 (`2ca01be`)** — brought `agent-tools/src/core/trusted-git.ts`
  (`resolveTrustedGit` + unit test) and routed the security-sensitive consumers, matching Oak's _actual_
  routed set: branch-touched-files (replaced the superseded `env.PATH`-pinning that does NOT clear S4036 —
  contract-test rewritten RED-first), the machine-local-paths validator, and the statusline git read
  (best-effort degrade). Firsthand correction to the bring-plan: **Oak does NOT route all git execs** — it
  leaves commit-path execs (runtime, commit-queue, check-commit-message) by-name; castr now matches that
  disposition (parity). version-guard execs no git; coordination-home is the next item. `pnpm check` green.
- **Worktree-aware coordination-home** ✅ **DONE 2026-06-28 (`16cedbf`)** — brought `resolveCoordinationHome`
  (+ unit test; git-native, returns the primary checkout via `git worktree list --porcelain` through
  trusted-git) and **deduped castr's TWO** identical `findCollaborationRepoRoot` FS-walk resolvers
  (cli-comms-commands.ts + tui/config.ts) into it; now fails loud outside a git tree (was a silent
  fallback). Docstring localised (no dangling Oak F-41/ADR-197 refs). qg green.
- **Watcher per-step deadline** ✅ **DONE 2026-06-28 (`86be5fb`, LC3c)** — cure for the 2026-06-10
  hang-but-look-alive failure. Brought `comms-watch-errors.ts` (`WatcherTimeoutError`, `runWithDeadline`,
  `reportTimeout`, `emitWatcherError`) + its fake-timer unit test; refactored `comms-watch-loop.ts` to Oak's
  post-deadline shape (each `runStep` races `stepTimeoutMs`; a timed-out step is **fatal** — loop emits a
  `kind=timeout` WATCHER ERROR line + re-throws → non-zero exit; deleted the inline `emitWatcherError`/
  `WatcherErrorKind`, now imported + re-exported). Threaded `--step-timeout-ms` (default 60000) through
  `cli-comms-watch.ts` + `cli-options.ts` + `cli-spec-options.ts` + `cli-spec-help.ts`. Loop-closure proof:
  drain/emit/markSeen-hang tests assert the `kind=timeout` line + rejection (fatal regardless of `onError`).
  **Introduced `vi.useFakeTimers` to castr** (deterministic deadline tests; clean new pattern). 25 watcher +
  348 collaboration-state tests green; qg green. Fail-loud → non-zero exit verified end-to-end (`cli.ts` top
  catch → `exitCode: 2`).
- **Pre-archive provenance + class-tiered archive-move** (MECHANISM LACK; doctrine PRESENT) —
  `agent-tools/src/collaboration-state/{provenance/cited-event-provenance.ts, archive/archive-move.ts}` — castr HAS
  the doctrine (PDR-094, archive-not-delete + Invariant 3 provenance) but LACKS the code. **Reframed 2026-06-28
  (firsthand PDR-094/105 read):** the gate is NOT "protect a permanent-doc citation of an ephemeral event" (that
  would be maintaining a durable→ephemeral dependency, which PDR-105 forbids). PDR-094 Invariant 3 is
  **inline-quote-first**: the gate refuses to rotate a cited event until the permanent record carries the verbatim
  excerpt INLINE (self-contained) — i.e. it ENFORCES PDR-105 self-containment before the ephemeral event leaves.
  Downstream of the reference-direction doctrine layer (PDR-105 + validator); bring after that. Bring provenance
  first, then archive-move; wire into curator-pass. (Also check PDR-094 Invariant 6: castr untracked comms → the
  curation-standing-obligation must be wired into session-close/consolidation — verify it is.)
- **`claims set-handoff` / `adopt` + `handoff_record_path`** (LACK+HOLLOW = LC3b / PDR-063) —
  `agent-tools/src/collaboration-state/cli-claim-handoff-commands.ts` + the `handoff_record_path`
  field (in the schema, missing from the TS type). PDR-063 is non-functional without both.
- **reference-direction doctrine (PDR-105) + validator** ✅ **DONE 2026-06-28 (`fc3b1cb` PDR-105, `280762a`
  validator, `8def837` burndown+wiring).** Brought PDR-105 (the two-axis law: Durability ephemeral→durable +
  Portability specific→general; availability invariant; stable-index corollary) at castr-105 (Q-009 = mapping-table,
  transient). Ported `validate-reference-direction` (helpers + allowlists + main + 33-test spec), reconciled to castr
  (ADR dir `docs/architectural_decision_records/`; `.agent/research` ephemeral; allowlists match castr 1:1); now
  BLOCKING + wired into `repo-validators:check`. Comms gitignored ✓. Validator reports 0.
- **Wrong-direction citation burndown** ✅ **DONE 2026-06-28 (`8def837`).** Validator surfaced **83** wrong-direction
  refs (53 portability + 30 durability) across **45 files** — 5× the grep estimate. Burned down via a 90-agent
  de-link + adversarial-verify workflow, **firsthand-reviewed** (oracle 0; diffs confirm de-link correctness, ref-defs
  handled, only-flagged-touched). Cure = de-link (`[label](path)` → backticked concept-name), Oak-proven.
  **REMAINING (separate item, the Oak-ADR-cite-repair below):** **18 rule→ADR markdown links** to Oak's absent path
  scheme are still present — they are **dangling links, NOT reference-direction violations** (rules classify as
  `repo-doctrine`, and `repo-doctrine`→ADR is unpoliced on both axes — a faithful Oak-parity behaviour). **RESOLVED
  2026-06-28 (owner): genotype vs phenotype** — operationalised rules/ADRs/hooks are the repo's PHENOTYPE (the
  context-specific expression of the portable Practice-Core genotype), so a rule is correctly `repo-doctrine` and
  rule→ADR is phenotype→phenotype, not a portability violation; the validator needs NO change. Cure the 18 as pure
  dangling links by **wiring `validate-markdown-links`** (castr has the validator, unwired) + de-link/repoint, and
  bring ADR-127 as a castr-scheme ADR.
- **Plan-templates library + ADR-117** (LACK = TC2) — `.agent/plans/templates/` (21 files) — the
  shipped `plan` skill points at this non-existent dir on every invocation. Bring the tree + author a
  castr-scheme ADR-117; fix the skill link path + number.

## Tier 2 — Practice completeness & enforcement

**Validators / quality gates**

- markdown-links validator (HOLLOW) — present, byte-identical to Oak, invoked by no gate. Append to
  `repo-validators:check` (report-only; flip blocking after a link-remediation pass).
- dependency-review supply-chain gate (LACK) — `.github/workflows/dependency-review.yml`.
- release workflow — **RESOLVED-BY-DELETION 2026-07-03 (verified: `ea8fc1f` removed the broken `publish.yml`;
  don't-leave-broken satisfied).** A real release pipeline remains the thread record's release-automation lane
  (owner-decided changesets, execution deferred until delivery is scheduled) — tracked there, not here.
- shell-lint gate (LACK) — `bash -n` over castr's own `.sh`; wire into `qg`+CI.
- stryker mutation testing (LACK) — `stryker.config.base.ts` + 3 devdeps + script (manual-run posture).
- ~~tsdoc enforcement (HOLLOW)~~ ✅ LANDED 2026-07-03 (pre-castr-doctrine-sync RS-4): `tsdoc.json` at root
  (Oak's body: standard tags + `@generated`) PLUS per-workspace `lib/tsdoc.json` + `agent-tools/tsdoc.json`
  extending it — the root file alone is DEAD config (the resolver stops at each workspace's `package.json`;
  config-expert probe, fixed `b4c5253`); `eslint-plugin-tsdoc@^0.5.2` wired `tsdoc/syntax: 'error'` in BOTH
  workspace eslint configs; the full pre-existing violation surface fixed (385: 293-file `@module` sweep per
  the skill's own checklist + escaping/link/tag repairs); gate prove-it-fires by deliberate-RED negative
  control + `@generated`-accepted probe in both workspaces. The `engraph-tsdoc` skill's sources-of-truth now
  resolve.
- no-network e2e for `lib` (HOLLOW minor) — wire `test.setup.no-network.ts` into `lib/vitest.e2e.config.ts`.

**Agent-tools modules**

- practice-fitness staleness axes (LACK = LC3d) — `item-count.ts` (bring first), then `decision-debt{,-report}.ts`,
  `dwell.ts`, `categories.ts`; wire into `run.ts`. Companion to PDR-100.
- pr-watch (LACK) — `agent-tools/src/pr-watch/` (4 modules + 6 tests); register in cli-topics; Monitor-driven PR-babysit.
- agent-identity v2 naming-schema registry (LACK) — `core/agent-identity/schema-registry.ts` + `schemas/v2/`.

**Cross-assistant projection plane** (castr has Codex→Claude/Cursor + skills projection HAVE; the rest absent)

- Codex + Cursor SessionStart identity hook shims (HOLLOW) — adapters built; add `.codex/hooks/practice-session-identity.mjs`
  - `[[hooks.SessionStart]]` in `.codex/config.toml`, and `.cursor/hooks.json` + `.cursor/hooks/engraph-session-identity.mjs`.
- Gemini CLI command projection (LACK) — `.gemini/commands/*.toml` + settings.json — extend `agent-adapter-generate`
  to project castr's OWN reviewer roster to Gemini; `reviewer-adapter-parity.ts` has no Gemini branch (gate-uncovered).
- Windsurf rules entry (LACK) — `.windsurf/rules/generalrules.md` (trivial stub → AGENT.md).
- GitHub Copilot instructions (LACK) — `.github/copilot-instructions.md` (trivial stub).
- `.agents/agents/README.md` portability explainer (LACK, trivial doc).

**Collaboration-state doctrine cluster** (LACK — live data plane exists, operational guide absent; ~8 dangling refs)

- `collaboration-state-conventions.md`, `collaboration-state-lifecycle.md` (operational), and
  `collaboration-state-placement-contract.md` (executive). Bring together.
- `director-handoff.md` + **PDR-117** (director/implementer roles) + **PDR-118** (agent-work-state-model —
  most load-bearing: doctrine + a host work-state registry deriving ground truth from git).

**Knowledge-estate planes + navigation** (LACK/HOLLOW — routing doctrine resolves but routes into nothing)

- corpus-hub router `.agent/research/agentic-engineering/README.md`; `research/README.md` authority-split;
  `analysis/` + `reports/` planes; `docs/{foundation,governance,engineering}` tiers (Practice subset only);
  README-as-index frontmatter convention + per-tier `docs/*` READMEs + `docs/architecture/README.md`.

**Reference-layer docs over already-wired castr mechanisms** (LACK → bring doc = instant HAVE, low risk)

- `comms-watch-mechanism.md`, `health-probe-and-policy-spine.md`, and `.agent/reference/README.md` (HOLLOW —
  index operationalising the present PDR-032 gate). Conditional/low: `comms-heartbeat-cadence.md`,
  `comms-cited-events.md`, `starter-templates.md`.

**Prompt library** (LACK) — `.agent/prompts/README.md` index + `daily.md` (rename `/oak-`→`/engraph-`).

**Experience modality** (HOLLOW) — port Oak's `.agent/experience/README.md` convention (purpose, **Template**,
strictly-voluntary doctrine, **@humans: do not modify**, "Why the audit step exists") — castr's is a 157-byte stub
that `session-handoff`/`consolidate-docs` link as authority (dangling). Drop Oak instance content.

**Directives** (LACK) — ~~`validation-strategy.md`~~ ✅ LANDED 2026-07-03 (pre-castr-doctrine-sync RS-3:
brought as a localised seeded stub, overlap reconciled — testing-strategy stays authoritative for the whole
Test leg; wired into AGENT.md/testing-strategy/tdd-as-design cross-refs mirroring Oak's wiring, which does
NOT include start-right), `schema-first-execution.md` (re-domain to
castr's IR/codegen pipeline — pointedly relevant to a schema engine), `editorial-tone.md` (governs VISION.md / outward copy).

**Rules** (LACK, genuine Practice/agent) — `agent-experience-review-lens`, `scope-from-goal-before-approach`
(directly addresses castr's audit-under-count failure mode), `worktree-hygiene`, `pr-comments-resolve-and-recheck`,
`identify-as-agent-under-shared-credentials`, `invoke-react-component-expert` (re-anchored to the ink TUI;

- register a react-component reviewer). Plus the ESLint `preserve-caught-error` hygiene (the salvageable half of use-result-pattern).

**Skills** (LACK) — `working-with-agentic-ai` (near-verbatim), `under-the-hood` (re-anchor to castr docs).
Conditional: `working-with-graphs`, `ground-truth-design/-evaluation` (bring if castr gains a graph/eval/search surface).

**Hooks-policy** (LACK) — `indefinite-deferral` scoped_block (3 coordinated surfaces) + `.agent/hooks/README.md` (Policy Spine doc).

**PDRs** (LACK — **27 as of the 2026-07-03 delta amendment**: Oak 096–105, 107–123; Oak has no 106; 120–123 are new
since the rescan — see §Delta amendment). **NUMBER COLLISION: castr's own PDR-096 (bring-the-iceberg)
and PDR-097 (dependency-currency) occupy those numbers — renumber the Oak imports before landing.** Overwhelmingly
Practice-governance (decision-debt pillar, graduation-quorum, director/implementer roles, agent-work-state-model,
memory-as-event-graph, falsifiable-judgment-gate, reference-direction-invariants, agent-experience-first-class,
teaching-surface-family, …). Load-bearing (doctrine + a mechanism gap): PDR-097 (health-report generator), PDR-100
(decision-debt metric), PDR-105 (reference-direction validator), PDR-110 (proven-failing-observation per validator),
PDR-117/118 (work-state registry), PDR-119 (event-graph store/renderers — frame the landed semantic-merge as interim mechanism).

**Core trinity reconciliation** (HOLLOW) — `practice.md` (missing Content-Tiers/Placement-Rule section;
first-class-infrastructure framing downgraded) + `practice-bootstrap.md` (~105 lines unreconciled drift). Semantic-merge,
preserve castr's deliberate localisations (e.g. `fitness_char_limit`).

**ArcAngel suite** (LACK, owner-confirmed FULL UNIT) — `.agent/reference/arc-rapid-communication.md` +
`.agent/collaboration/rapid-comms/` channel + the watcher-pairing clause + the statusline wing modules.

**Statusline coordination** (HOLLOW/LACK) — session-shape resolver, fail-loud git-io/location, coordination indicators,
segment builder, ANSI palette (`agent-tools/src/claude/statusline-*.ts`); + Cursor statusline wiring. **OWNER-DIRECTED
NEAR-TERM 2026-07-03 (bring the enhanced statusline code+config; no oak logo art, all logo-handling/creation code):
per-file execution manifests + determinations in
[`statusline-logo-bring-manifests-2026-07-03.md`](./statusline-logo-bring-manifests-2026-07-03.md)** — supersedes this
entry's coarse "(oak-logo art = OUT-OF-SCOPE)" note with the precise art/code seam; includes the post-rescan
usage-gauge/countdown modules (worktree-rows arc, delivered upstream 2026-06-29).

## Tier 3 — low yield / conditional / owner-gated

- `.agent/roles/` persona dir (capability already HAVE via distributed rules + reviewers; Oak's single role is an
  orphan even in Oak — bring only if a named always-on persona is wanted).
- MCP config (`.mcp.json.example` + mcpjam inspector) — CONTINGENT on castr first running a generated MCP server.
- Reusable CI setup composite action + Turbo remote cache (perf/maintainability).
- SonarCloud (`.sonarcloud.properties`) — OWNER-PROVISIONING-GATED (SaaS, org-coupled). Surface as a provisioning decision.
- operational `diagnostics/` sub-plane (Oak's own collector is dormant).

## OUT-OF-SCOPE — utterly irrelevant (record so future audits do not re-flag)

Product-coupled to Oak's curriculum/web stack, no castr analogue:

- Rules/subagents: `invoke-{accessibility,clerk,design-system,elasticsearch,sentry}-expert` (+ their templates/adapters),
  `eef-corpus-grounding`, `source-curriculum-content-via-api-not-cdn`, `sonarqube-mcp-instructions`.
- Skills/subsystems: ground-truth / LLM-judge eval subsystem (Elasticsearch + curriculum-slug bound), the search/MCPJam
  conformance harness (also not built in Oak).
- MCP: curriculum-mcp / sentry / playwright / next-devtools / vercel endpoints.
- Docs/memory: `design-token-governance-for-self-contained-ui.md` (HTML/CSS UI — castr is ink-TUI only),
  `agent-capability-vocabulary.md` (Oak product-audience axes), Oak product ADR bulk, milestones/strategy/domain/
  agent-guidance tiers (Oak content), `vitest.field-integrity.config.ts` (Elasticsearch field-fidelity).
- ~~`use-result-pattern.md` (the rule) — castr is fail-fast-over-result by doctrine (deliberate non-bring).~~
  **MOVED TO BRING (owner ruling 2026-07-03: Result and fail-fast compose — see §Firsthand
  corrections item 1 and the delta items).**
- `.cursor/plans/` + continual-learning cadence state (ephemeral / IDE-beta byproduct — do not manufacture a mechanism Oak does not have).

## castr_extras — castr has, Oak lacks (preserve; Oak back-flow candidates)

- Validators: `drift`, `loop-closure-references` (both wired into `repo-validators:check`).
- Modules: `agent-adapter-generate` (the engine to EXTEND for Gemini projection), `semantic-merge` (module + skill;
  interim mechanism for PDR-119's class).
- Reviewers: `json-schema-expert`, `openapi-expert`, `zod-expert` (parity-or-better for a schema/codegen library).
- PDRs: **PDR-096 bring-the-iceberg**, **PDR-097 dependency-currency** (the source of the numbering collision; back-flow candidates).
- Rules: `input-output-pair-compatibility`, `no-manufactured-permission`, `quality-gate-failures`.
- Hooks-policy: machine-local-path `archive/` exclusion; host-dos substring rationale.
- Quality: CodeQL job, `madge`/`packaging`/`publint`/`attw`/`context-cost`/`agents:check` scripts; the just-landed
  `.husky/commit-msg` (commitlint + version-guard).
- Memory: `.agent/memory/operational/tracks/` plane; `principles.md` IR Cardinal Rule (deliberate localisation).

## Sequencing recommendation

Tier 1 is the priority spine (security + enforcement-integrity + coordination-safety). Within it, **trusted-git
first** (it unblocks coordination-home + statusline-git-io), then the CI/gitleaks enforcement-integrity pair, then the
collaboration-safety cluster (watcher-deadline, provenance+archive, handoff). Tier 2 brings the bulk of the Practice
completeness in any order (most items are independent, reversible — bring freely per PDR-005). The PDRs land as a
renumbered batch with the collision resolved. Each bring is its own TDD/validator-gated slice where it is product code.
**Sequencing updated by the 2026-07-03 delta amendment below (owner-directed statusline lane now leads).**

## Delta amendment (2026-07-03) — Oak main since the rescan window

Produced by [`oak-castr-delta-review-2026-07-03.md`](./oak-castr-delta-review-2026-07-03.md) (Windswept Winging
Cliff / 0ceb5f): Oak advanced **244 commits / 365 delta paths on bring-relevant surfaces** since this doc's window.
Method: 14-agent classify→adversarial-verify workflow (`wf_929147cf-1a5`) + completeness critic + firsthand
re-verification of every tier-gating claim (13 named checks incl. every falsification candidate; the one refuted lane
claim — "PDR-078 absent in castr" — was corrected: castr HAS PDR-078). All ~365 delta paths carry a recorded
disposition across the classify lanes + the critic's residual groups (disposition-ledger discipline; raw per-path
lists in the workflow transcript).

### NEW capabilities (delta additions to the tiers)

**Tier 1 additions (enforcement / coordination-safety / knowledge-integrity):**

- **Encoding-integrity gate** — `agent-tools/src/encoding/` (7 files: invalid-UTF-8 / BOM / bidi + control
  (Trojan-Source) / U+FFFD scanner) + root `encoding:check` proxy + Oak wires it BLOCKING in pre-push. castr lacks
  the whole class.
- **`trusted-gh`** — `agent-tools/src/core/trusted-gh.ts` (+test): the S4036 PATH-hijack fix applied to `gh`;
  joins castr's landed trusted-git cluster.
- **Coordination-safety hardening cluster** (extends the existing watcher/claims Tier-1 items):
  `watcher-supervisor.ts` (F-101 supervisor-death self-exit via `--supervisor-pid`), `peer-liveness.ts` (F-75
  PDR-078 liveness classifier as `comms peer-liveness`; castr HAS PDR-078 — this is its read-model),
  `work-state-view.ts` (F-98 `claims work-state`: git-worktree ⋈ heartbeat ⋈ claim per-worktree view — pairs with
  the PDR-118 backlog item), `claim-{active,closed}-path.ts` (claims-CLI coordination-home defaulting,
  F-85/F-108/F-89), `git-worktree-list.ts`, `cli-spec-factory.ts` (registry plumbing), and `--in-response-to`
  acknowledgement edges on comms send/append (F-77).
- **Agentic-judgment doctrine** — new always-on rule `agentic-judgment-conserve-by-default.md` + **PDR-122**
  (judgment pipelines: atomic LLM judgment, deterministic aggregation, no irreversible discard on a single voter)
  - **PDR-123** (design panels). The doctrine is Tier-1 knowledge-integrity; the mechanism suite is Tier 2 below.

**Tier 2 additions:**

- **Corpus-analysis / judgment-pipelines suite** (the dominant delta: ~70 files + templates + build chain) —
  **DEFERRED TO ITS OWN LATER PLAN (owner, 2026-07-03): the subsystem is in ACTIVE upstream development
  (invariants 5–6 amended 2026-07-02; discovery-run arc still refining it) — bringing a mutable target buys
  re-sync churn.** Named position + promotion trigger:
  [`corpus-analysis-suite-bring.md`](./corpus-analysis-suite-bring.md) (strategic brief; the verified
  bring-cost detail lives there). The stable DOCTRINE half (PDR-122/123 + the always-on
  `agentic-judgment-conserve-by-default` rule) is NOT deferred — it rides the doctrine/PDR batches above.
- **`session-metadata` topic** (15 files): vendor-transcript locator + token-usage + context-window registry +
  window computation, surfaced as `agent-tools session-metadata`.
- **`spawn` topic** (~21 files): one command creates/resumes a sibling worktree from a base ref, builds it, opens
  a draft PR, emits a seat brief — the spawn-flow for multi-agent seats.
- **`pr-lifecycle` skill** (new) — open-PR-to-merge-ready shepherding (GraphQL review-thread harvest,
  root-cause-first triage); pairs with the existing pr-watch LACK item (which Oak also extended since the window).
- **`prose-expert` reviewer template** (new) — universal prose-craft reviewer; castr's editorial layer would
  re-anchor to castr voice.
- **PDR-120** (runbooks are a content kind, not a surface — routes runbook content through skills/reference/plans)
  - **PDR-121** (planning vocabulary; portable half of Oak ADR-209) — the PDR batch is now **27** (096–105,
    107–123), renumber-for-collision unchanged.
- **Sub-agent frontmatter schema validator upgrade** — `validators/subagents/frontmatter-schema.ts` replaces the
  regex three-field check castr currently has (verified castr's `REQUIRED_FRONTMATTER_FIELDS` form); plus ADR-125
  amendment: `model` optional in wrappers (inherit invoking model) — fans across all generated adapters on regen.
- **24 new pattern files** under `.agent/memory/active/patterns/` (castr has the plane, 134 files — content bring)
  - **8 new experience files** (instances stay Oak; the experience-modality bring is already a Tier-2 item) +
    reports-plane runbooks (amends the analysis/reports plane item).
- **ADR-207 DORA-as-structural-property** (adapt-concept; coupled to Oak's intent-graph — concept-level bring
  only) and **docs/operations runbook-index convention** (PDR-120's host expression), **testing-patterns
  additions** (rendered-output assertions; rides the validation-strategy bring), **troubleshooting known-gate-caveats**
  (portable gate gotchas).

**Tier 3 additions:** `cli-arg-parser`/`command-runner`/`path-exists` core utilities (ride along with their
consumers), `.mcp.json.example` mcpjam pin (amends the Tier-3 MCP item), pnpm-workspace scoped-override pattern.

**Owner-ruling additions (2026-07-03 consolidation walk — Result/fail-fast composition, FULL reach):**

- ~~**Bring `use-result-pattern.md`**~~ ✅ LANDED 2026-07-03 (pre-castr-doctrine-sync RS-1): rule
  authored native to castr carrying the composition ruling verbatim substance + all three wrappers +
  RULES_INDEX row + `preserve-caught-error` ESLint enforcement wired in both workspaces
  (`{ cause }` causal-chain discipline; one real violation fixed in `pr-watch/gh.ts`).
- **Migrate the D4 throw-based error-model seams to `Result<T,E>` with fail-fast composition**
  (Tier 2, castr-internal slice): the D4 archive/provenance reconciliation rewrote Oak's
  Result-based modules to typed throws on the now-retired fail-fast-therefore-no-Result ground;
  re-reconcile those seams (and any sibling justified the same way — grep landed rationale for the
  retired framing) to the ruled pattern. TDD; one seam family per commit.

**OUT-OF-SCOPE additions (utterly irrelevant, recorded):** `ci-schema-drift-{check,eval}` (fetches Oak's
curriculum-API swagger against Oak's SDK cache — product-coupled; the _advisory-drift-gate pattern_ is free to
re-derive if castr ever caches vendor schemas), `packages/sdks/*` + `apps/*` churn (Oak product), `docs/strategy`,
Oak session/coordination state churn (plans/memory/reports instance content, hawthorn handoff deletions,
dated team prompts).

### AMENDS — existing entries updated by the delta (re-sync ledger)

- **Doctrine re-sync wave (rules/skills/directives castr already carries):** Oak renamed
  `consolidate-at-third-consumer` → **`consolidate-at-second-consumer`** (threshold-lowering doctrine change;
  ✅ rename + adapters + RULES_INDEX + citation ripple LANDED 2026-07-03, pre-castr-doctrine-sync RS-2 — incl.
  the PDR-014/058 consumer-threshold hunks and both code-comment citations); 18 amended rules (highest-value
  verified: `verify-dont-trust` ×4 additions incl.
  self-state-claims-verify-first; `comms-all-channels-watcher` + `use-monitor-for-event-driven-wake` gain the
  `--supervisor-pid` orphan cure; `no-unbounded-host-load` §4 macOS-correct saturation signals — load-avg on macOS
  over-reads, use CPU-idle% + memory-pressure (✅ LANDED 2026-07-03, RS-2); `precedence-is-not-approval` recorded-grants-are-claims;
  `present-verdicts-not-menus` no-deferral-status-lines; `hook-policy-substring-discipline` known-git-over-blocks
  section; `ship-independent-coordinate-dependent` same-lines dependence test); skills doctrine wave
  (`consolidate-docs` +112 / `consolidate-until-done` +90: impact-placement conservation; `semantic-merge`
  mechanical losslessness proof; `start-right` macOS host-health commands; `start-right-team` standby-seat
  contract; `commit` adapter-regen cwd fix castr already knows); directives (`principles.md` **Documentation Is
  Infrastructure** section ← ADR-127 §5 amendment; `testing-strategy` prove-behaviour-never-config;
  `agent-collaboration` liveness-asymmetry; `continuity-practice` curation runbook; `user-collaboration` ×3).
- **PDR amendments castr must fold into pending brings:** PDR-014 (third→second consumer, pairs with the rule
  rename), PDR-063 (+34 lines effectiveness-window), PDR-117 (+42 routing craft) / PDR-118 — the pending PDR batch
  takes the AMENDED versions; ADR-127 gains §5 (design principles apply to documentation) — the Tier-1
  Oak-ADR-cite-repair item brings the amended ADR-127.
- **Statusline entry** — superseded in place above (owner-directed; manifests doc).
- **pr-watch** — Oak extended it since the window; the LACK entry's bring takes current main.
- **`.claude/settings.json`** — worktree-safe `${CLAUDE_PROJECT_DIR}` statusline command + `refreshInterval: 10`
  (rides the statusline lane); **`daily.md`** grew (rides the prompt-library item); collaboration-state schema
  comment clarifications (freshness_seconds ≠ liveness) ride the schema brings.

### castr-side re-verification (2026-07-03)

All six Tier-1 DONE items re-verified holding on the current branch (named checks in the workflow transcript);
still-open Tier-1 items re-confirmed still open (provenance/archive-move, claims-handoff, plan-templates,
markdown-links unwired). Backlog-state corrections applied in place above: release-workflow resolved-by-deletion;
CI action-pinning done (`cec8bce`); CodeQL default-setup. castr_extras additions since the window (Oak back-flow
candidates): v8 coverage wiring + ruleset floors (`33bddbc`), the 23-package dependency-currency sweep +
audit-to-zero, commit-queue/hook-policy hardening from the Codex-findings closure (`c6df0f8`/`b0355e4`).

### Updated sequencing (single spine)

1. **Statusline + logo-pipeline lane (owner-directed, leads):** slices S1–S3 per
   [`statusline-logo-bring-manifests-2026-07-03.md`](./statusline-logo-bring-manifests-2026-07-03.md); castr-mark
   authoring is the owner-shaped follow-on.
2. **Tier-1 continuation as already sequenced:** pre-archive provenance + archive-move → claims-handoff
   (LC3b/PDR-063 amended) → markdown-links wiring + Oak-ADR cite-repair (ADR-127 amended) → plan-templates (TC2;
   bring current templates README).
3. **Tier-1 delta insertions, batched with their clusters:** encoding gate (own slice); trusted-gh (rides the next
   agent-tools slice); coordination-safety hardening cluster (watcher-supervisor + peer-liveness + work-state-view
   - claim-path defaulting — one lane, extends LC-era brings); agentic-judgment rule + PDR-122/123 doctrine (rides
     the PDR batch or lands ahead of any new judgment-pipeline work, whichever comes first).
4. **Doctrine re-sync wave** (the AMENDS ledger above — batchable, mostly mechanical semantic re-syncs; the
   consolidate-at-second-consumer rename leads it as a doctrine change).
5. ~~Corpus-analysis/judgment-pipelines suite~~ **DEFERRED (owner, 2026-07-03)** — actively mutating
   upstream; own later plan with a stabilisation trigger
   ([`corpus-analysis-suite-bring.md`](./corpus-analysis-suite-bring.md)). The PDR-122/123 doctrine +
   conserve-by-default rule stay in the doctrine/PDR batches.
6. **PDR batch (27, renumbered)** + the remaining Tier-2 flow as before.
