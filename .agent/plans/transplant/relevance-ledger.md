# Relevance Ledger — Oak → castr Practice transplant

**Status:** SEEDED 2026-06-05 (finalised at Phase 9). Per-surface KEEP / AMEND / DON'T-BRING / DORMANT dispositions with
rationale, plus the explicit not-brought + dormant sets. Sources: a 3-agent fan-out inventory of the Oak estate **plus
firsthand verification that corrected several agent claims** (see "Firsthand corrections"). Relevance lens: castr is a
**headless TypeScript schema-transform library** (OpenAPI/Zod/JSON-Schema via a canonical IR; emits MCP tools) — no
browser UI, React, auth, search index, design system, Sentry, or curriculum domain.

Owner-locked posture (2026-06-05): **fully populate** scale surfaces; **collaboration ACTIVE** (about agents, not
humans) seeded empty; transplant = primary active plan; **all generic experts**. Tightenings: drop the ground-truth
triplet, Oak SonarQube/secrets infra, and ~2 UI patterns; AMEND pattern provenance + regenerate derived indexes;
`practice-fitness` informational-first.

---

## Firsthand corrections to the fan-out (load-bearing — verified against source)

1. **mcp-expert IS relevant** → KEEP. castr emits MCP tools (`principles.md`: IR → MCP Tools, "MCP-oriented generation").
   The fan-out's "DON'T-BRING mcp-expert" was wrong.
2. **Pattern estate is mostly engineering substrate** → fully populate holds. Categories (own frontmatter): 53 process,
   22 agent, 21 code, 10 testing, 9 architecture, 2 planning, 2 coordination — **zero** UI/search/auth categories. The
   fan-out's "122 Oak-specific patterns, don't mass-import" overstated it; only ~2 are genuinely UI. (My grep "66
   product-coupled" was substring noise: `aria`→v**aria**ble, `react`→**react**ive.)
3. **ground-truth IS product** → DON'T-BRING. Verified verbatim: "Design ground truth queries for the **Oak semantic
   search service**… MRR scores… teacher-perspective query design." Search-eval, not generic test-design.
4. **skills-adapter prefix is a CLI flag** (`--prefix=oak-`), not hardcoded → localise to `--prefix=engraph-`.
5. **castr `scripts/validate-portability.mjs` is a subagents/Codex-adapter validator** (misnamed), with 5 Codex
   assertions (`model_reasoning_effort`, `sandbox_mode`, `approval_policy`, thin-adapter banner, canonical-template
   pointer) Oak's validators lack → **preserve before retiring**.
6. **agent-tools `src/` has 0 `@oaknational` imports** → tiny localisation surface. (Discount the fan-out's "castr 49
   ADRs / Oak 183" line — unverified; castr ADRs are **001–047**.)

---

## Per-surface dispositions

### Practice Core — KEEP (all)

7-file generation + `decision-records/` + `provenance.yml` + `practice-verification.md` + `incoming/` + multi-dim
fitness model. Oak Core has **0 oak-naming** (portable). castr Core customisation = provenance entries (preserve). Retire
`.agent/practice-context/` (entangled: 10 refs incl. PRESERVE'd `AGENT.md`). **Phase 1.**

### PDRs (92) — KEEP (all)

Zero `@oaknational`/`oak-` naming. 8 Oak-ADR cites (in 10 PDRs) = **retained-cross-host** (immutable governance honestly
naming Oak's phenotype; see `reference-closure.md`). **Phase 1 (1a landed).**

### Directives — KEEP 7 generic / DON'T-BRING 1 / PRESERVE castr's

- **BRING (generic, additive):** `agent-collaboration`, `continuity-practice`, `definition-of-delivery`,
  `operationalisation-contract`, `orientation`, `tdd-as-design`, `user-collaboration`.
- **DON'T-BRING:** `schema-first-execution.md` (Oak SDK/MCP-**runtime** doctrine; castr's schema-first lives in
  IDENTITY/requirements).
- **PRESERVE castr's, do not overwrite:** `principles.md` (**SACRED — no edit without owner approval**),
  `testing-strategy.md`, `requirements.md`, `AGENT.md`, `metacognition.md`. **Phase 5.**

### agent-tools (~20 modules) — KEEP all (localise)

`bin, branch-touched-files, ci, claude, codex, codex-exec, collaboration-state, commit-advisories, commit-queue,
context-cost, core, cursor, hook-policy, practice-fitness, practice-substrate, repo-check, skills-adapter-generate,
validators, version-guard`. Collaboration/health modules ACTIVE (per collaboration=active). AMEND: `ci` test fixtures
(`@oak/*`), `validators/stale-script-invocations` (`SCANNED_ROOTS`/`ALLOWLISTED_PATHS`), eslint config. **Phase 2.**

### Rules (87) — KEEP ~78 / DON'T-BRING ~9 / AMEND (cites)

- **DON'T-BRING:** `invoke-accessibility-expert`, `invoke-react-component-expert`, `invoke-design-system-expert`,
  `invoke-clerk-expert`, `invoke-elasticsearch-expert`, `invoke-sentry-expert` (6 UI/product), `eef-corpus-grounding`
  (EEF corpus), `sonarqube-mcp-instructions` (no Sonar server), any ground-truth rule.
- **KEEP:** `invoke-mcp-expert` (castr emits MCP); the collaboration rules ACTIVE (not dormant):
  `comms-all-channels-watcher`, `liveness-heartbeat-cron`, `respect-active-agent-claims`, `register-identity-on-thread-join`,
  `use-agent-comms-log`, `follow-agent-collaboration-practice`, etc.
- **AMEND:** rules with stale `oak`/ADR cites (`no-machine-local-paths`, `present-verdicts-not-menus`,
  `invoke-assumptions-expert`, `invoke-code-experts`, …). **36 distinct Oak-ADR cites** to reference-close (castr ADR≤047;
  low-number overlaps are _semantic_ mismatches → re-point to PDRs).
- Merge castr's 5 existing rules into the always-on set. Build `RULES_INDEX.md`. **Phase 4.**

### Hooks — KEEP policy.json + native Cursor + Claude / DON'T-BRING Sonar

`policy.json` (localise scoped-block paths to castr surfaces) + native `.cursor/hooks.json` + Claude `PreToolUse`/
`SessionStart`. **DON'T-BRING** sonar-secrets hooks / `secrets:scan` (castr has only `eslint-plugin-sonarjs`, no Sonar
server). **Phase 2.**

### Skills (20) — KEEP 18 / DON'T-BRING 2

DON'T-BRING `ground-truth-design`, `ground-truth-evaluation` (search-eval). Migrate castr `jc-*` (jc-plan, jc-gates,
jc-start-right, jc-consolidate-docs) → `SKILL-CANONICAL.md`. Regenerate adapters `--prefix=engraph-`; `skills-lock.json`.
Collaboration skills (`start-right-team`, `session-handoff`) ACTIVE. **Phase 3.**

### Sub-agents (19 templates) — roster: castr's 3 schema experts + 12 generic / DON'T-BRING 7

- **KEEP castr's 3:** `openapi-expert`, `zod-expert`, `json-schema-expert`.
- **BRING 12 generic:** code, test, type, architecture, assumptions, config, docs-adr, mcp, onboarding,
  release-readiness, security, subagent-architect (AMEND threat-model/examples to castr's schema domain).
- **DON'T-BRING 7:** accessibility, clerk, design-system, elasticsearch, react-component, sentry (UI/product) +
  `ground-truth-designer` (search-eval; orphaned without its product skills).
- **Components:** `behaviours/` + `principles/` KEEP; `architecture/reviewer-team.md` + `personas/{barney,betty,fred,wilma}`
  come with `architecture-expert` (Oak's multi-lens device) — bring with it. **Phase 6.**

### Memory — fully populate (owner)

`active/patterns/` (121; **AMEND `proven_in:` provenance**, regenerate index from frontmatter, **drop ~2 UI**:
`accessibility-as-blocking-gate`, `ux-predates-visual-design`); `executive/` (regenerate derived catalogues —
artefact-inventory, invoke-code-experts, cross-platform-surface-matrix — to castr's real estate, don't copy stale Oak
indexes); `operational/`. Reconcile `napkin`/`distilled`. **Phase 6.**

### State / collaboration — KEEP machinery / DON'T-BRING runtime data

**KEEP:** the `*.schema.json` (comms-event, active-claims, closed-claims, conversation, escalation, coordinator.current,
session-presence) + empty dirs + `.gitignore`. **DON'T-BRING:** all Oak runtime event data — **2,936** `comms/*.json`,
populated claims, `conversations/`/`escalations/`/`handoffs/`/`sidebars/`, 5.5 MB `shared-comms-log.md`, 317 KB
`closed-claims.archive.json`. **Phases 6+8.**

### Platform adapters — regenerate from canonicals

`.claude`/`.codex`/`.cursor`/`.agents` regenerated (Oak's are generated artefacts, not hand-copied); add `.gemini`/
`.windsurf` (dirs exist empty) **if the generator emits those forms**. Canonical-first. castr `.claude/` currently has
only `settings.local.json`. **Phase 7.**

### Collaboration cluster — ACTIVE (PEEN-hardened)

directive `agent-collaboration.md` + rules cluster + skills + state machinery, in **PEEN-hardened forms only**:
structured coordinator-state (not rule prose), TTL presence registry (presence ≠ claim), unified comms attention pass,
plan-mode identity carveout, skills-adapter orphan pruning. Seeded **empty**. **Phase 8.**

---

## Not-brought set (explicit, with rationale)

| Item                                                                                                        | Why                                                                         |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 6 UI/product experts + their `invoke-*` rules                                                               | castr has no UI/auth/search/design surface                                  |
| ground-truth triplet (2 skills + `ground-truth-designer`)                                                   | Oak curriculum **search-quality** product capability                        |
| Oak SonarQube/secrets infra (`sonarqube-mcp-instructions` rule, sonar-secrets hooks, `secrets:scan`)        | castr has no SonarQube server                                               |
| `eef-corpus-grounding` rule                                                                                 | EEF corpus is an Oak data domain                                            |
| Oak `schema-first-execution.md` directive                                                                   | Oak SDK/MCP-runtime doctrine; castr's lives in IDENTITY/requirements        |
| Oak `principles.md` / `testing-strategy.md` / `AGENT.md`                                                    | castr's are sacred/authoritative; layer Oak's generic directives additively |
| Oak **product ADRs**                                                                                        | castr keeps its own ADRs 001–047 (owner decision)                           |
| All Oak **runtime event data** (2,936 comms, claims/conversation/escalation/handoff content, logs, archive) | Oak's accumulated session history — bring machinery, not data               |
| ~2 UI-only patterns (`accessibility-as-blocking-gate`, `ux-predates-visual-design`)                         | assume a UI castr lacks                                                     |

## Dormant set

Currently **none** structurally deferred — owner chose to fully populate scale surfaces and activate collaboration. (The
fan-out's many "DORMANT until castr grows a team" calls were overruled: collaboration is about _agents_, and castr will
run multiple agents.) `.gemini`/`.windsurf` adapters are populated only if the generator supports them; otherwise
recorded here as deferred-pending-generator-support.
