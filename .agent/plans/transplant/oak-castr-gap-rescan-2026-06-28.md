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

1. **`use-result-pattern` is a DELIBERATE NON-BRING, not a HOLLOW-to-cure.** The literal
   claim is true (`principles.md` carries `Result<T,E>` examples, lines 854/939/1199/1796),
   but bringing a "use-result-pattern" rule contradicts castr's **fail-fast-over-result**
   doctrine (it rejected `@oaknational/result` → throw in the D4 lane). The rescan actually
   surfaced a **castr-internal tension** (principles.md teaches `Result<T,E>` while the
   codebase doctrine is throw) → a castr-original cleanup, NOT an Oak gap. Only the separable
   ESLint `preserve-caught-error` hygiene (don't-swallow-errors, compatible with fail-fast)
   is a clean bring.
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
  correct + simpler-appropriate. (b) Bump the workflow's action versions — `actions/checkout@v3`,
  `actions/setup-node@v3`, `pnpm/action-setup@v2` (Node-20, force-run on 24) and CodeQL `@v2` (deprecated → v3)
  — to SHA-pinned current majors (Oak's pattern) in a CI-hardening pass.
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
- **Pre-archive provenance + class-tiered archive-move** (LACK) —
  `agent-tools/src/collaboration-state/{provenance/cited-event-provenance.ts, archive/archive-move.ts}` —
  no fail-closed gate stopping archival of a comms event cited (by 8-hex id) in a permanent doc;
  direct knowledge-integrity/lossless risk. Bring provenance first, then archive-move; wire into curator-pass.
- **`claims set-handoff` / `adopt` + `handoff_record_path`** (LACK+HOLLOW = LC3b / PDR-063) —
  `agent-tools/src/collaboration-state/cli-claim-handoff-commands.ts` + the `handoff_record_path`
  field (in the schema, missing from the TS type). PDR-063 is non-functional without both.
- **reference-direction validator + PDR-105** (LACK) — `agent-tools/src/validators/reference-direction/`
  (4 files) — no validator, no script, no PDR-105 doctrine. Port, wire into `repo-validators:check`,
  bring PDR-105, reconcile POLICED_ROOTS to castr surfaces. (castr substituted `drift` — keep both.)
- **Oak-ADR dangling-cite repair + ADR-127** (HOLLOW) — ~17 rules + `plan/SKILL` + PDRs link into
  `docs/architecture/architectural-decisions/` which does not exist in castr (castr uses
  `docs/architectural_decision_records/`, ADR-001..050). Content is already transplanted via the
  PDR scheme → **repoint citations** (do NOT bulk-copy Oak ADR bodies, PDR-079). Bring ADR-127
  (documentation-as-foundational-infrastructure) as a castr-scheme ADR first — a documentation-hygiene
  rule's own link is the defect it names.
- **Plan-templates library + ADR-117** (LACK = TC2) — `.agent/plans/templates/` (21 files) — the
  shipped `plan` skill points at this non-existent dir on every invocation. Bring the tree + author a
  castr-scheme ADR-117; fix the skill link path + number.

## Tier 2 — Practice completeness & enforcement

**Validators / quality gates**

- markdown-links validator (HOLLOW) — present, byte-identical to Oak, invoked by no gate. Append to
  `repo-validators:check` (report-only; flip blocking after a link-remediation pass).
- dependency-review supply-chain gate (LACK) — `.github/workflows/dependency-review.yml`.
- release workflow (HOLLOW) — castr's `publish.yml` calls a non-existent `pnpm release` via changesets
  with no `.changeset`. Repair (changesets path) or adopt Oak's semantic-release shape; don't leave broken.
- shell-lint gate (LACK) — `bash -n` over castr's own `.sh`; wire into `qg`+CI.
- stryker mutation testing (LACK) — `stryker.config.base.ts` + 3 devdeps + script (manual-run posture).
- tsdoc enforcement (HOLLOW) — `tsdoc.json` + `eslint-plugin-tsdoc`; the landed `engraph-tsdoc` skill
  names them as sources-of-truth but neither exists. castr is a published TS library — high value.
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

**Directives** (LACK) — `validation-strategy.md` (test/evaluate/assure + risk-tiering — serves castr's
codegen-correctness claims; closes the testing-strategy HOLLOW), `schema-first-execution.md` (re-domain to
castr's IR/codegen pipeline — pointedly relevant to a schema engine), `editorial-tone.md` (governs VISION.md / outward copy).

**Rules** (LACK, genuine Practice/agent) — `agent-experience-review-lens`, `scope-from-goal-before-approach`
(directly addresses castr's audit-under-count failure mode), `worktree-hygiene`, `pr-comments-resolve-and-recheck`,
`identify-as-agent-under-shared-credentials`, `invoke-react-component-expert` (re-anchored to the ink TUI;

- register a react-component reviewer). Plus the ESLint `preserve-caught-error` hygiene (the salvageable half of use-result-pattern).

**Skills** (LACK) — `working-with-agentic-ai` (near-verbatim), `under-the-hood` (re-anchor to castr docs).
Conditional: `working-with-graphs`, `ground-truth-design/-evaluation` (bring if castr gains a graph/eval/search surface).

**Hooks-policy** (LACK) — `indefinite-deferral` scoped_block (3 coordinated surfaces) + `.agent/hooks/README.md` (Policy Spine doc).

**PDRs** (LACK — 23: Oak 096–105, 107–119; Oak has no 106). **NUMBER COLLISION: castr's own PDR-096 (bring-the-iceberg)
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
segment builder, ANSI palette (`agent-tools/src/claude/statusline-*.ts`); + Cursor statusline wiring. (oak-logo art = OUT-OF-SCOPE.)

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
- `use-result-pattern.md` (the rule) — castr is fail-fast-over-result by doctrine (deliberate non-bring).
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
completeness in any order (most items are independent, reversible — bring freely per PDR-005). The 23 PDRs land as a
renumbered batch with the collision resolved. Each bring is its own TDD/validator-gated slice where it is product code.
