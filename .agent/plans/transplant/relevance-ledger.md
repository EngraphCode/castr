# Relevance Ledger — Oak → castr Practice transplant

**Status:** SEEDED 2026-06-05 (finalised at Phase 9). Per-surface KEEP / AMEND / DON'T-BRING / DORMANT dispositions with
rationale, plus the explicit not-brought + dormant sets. Sources: a 3-agent fan-out inventory of the Oak estate **plus
firsthand verification that corrected several agent claims** (see "Firsthand corrections"). Relevance lens: castr is a
**headless TypeScript schema-transform library** (OpenAPI/Zod/JSON-Schema via a canonical IR; emits MCP tools) — no
browser UI, React, auth, search index, design system, Sentry, or curriculum domain. **Relevance criterion (owner,
2026-06-07):** judge each surface on **both** castr's need **and** the advantage Oak may bestow that we cannot foresee
yet. The DON'T-BRING bar is therefore **high** — reserved for content genuinely tied to a domain castr lacks (UI / auth /
search / curriculum / Sonar). When the call is unclear, **bring it (dormant) rather than drop it.** Assessing this per
surface is the job, not overhead.

Owner-locked posture (2026-06-05): **fully populate** scale surfaces; **collaboration ACTIVE** (about agents, not
humans) seeded empty; transplant = primary active plan; **all generic experts**. Tightenings: drop the ground-truth
triplet, Oak SonarQube/secrets infra, and ~2 UI patterns; AMEND pattern provenance + regenerate derived indexes;
`practice-fitness` informational-first. **Collaboration machinery is a fixed bring (owner) — never relevance-gated; the
transplanted `collaboration-is-value-contingent` rule governs runtime _invocation_, not transplant scope.**

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

### PDRs (91) — KEEP (all)

Zero `@oaknational`/`oak-` naming. 8 Oak-ADR cites (in 10 PDRs) = **retained-cross-host** (immutable governance honestly
naming Oak's phenotype; see `reference-closure.md`). **Phase 1 (1a landed).**

### Directives — KEEP 7 generic / DON'T-BRING 1 / PRESERVE castr's

- **BRING (generic, additive):** `agent-collaboration`, `continuity-practice`, `definition-of-delivery`,
  `operationalisation-contract`, `orientation`, `tdd-as-design`, `user-collaboration`.
- **DON'T-BRING:** `schema-first-execution.md` (Oak SDK/MCP-**runtime** doctrine; castr's schema-first lives in
  IDENTITY/requirements).
- **PRESERVE castr's, do not overwrite:** `principles.md` (protected by engineering discipline, not dogma — known
  issues in it are blocking and get fixed; never clobber with Oak content [owner, 2026-06-09]),
  `testing-strategy.md`, `requirements.md`, `AGENT.md`, `metacognition.md`. **Phase 5 ✅ (2026-06-17, tag
  `transplant/phase-5`):** all 7 brought additive + per-surface reconciled; `AGENT.md` gained an additive index of the
  7; `schema-first-execution.md` held DON'T-BRING. Oak rules-delta `ad649710`→pin folded here too
  (`precedence-is-not-approval` + `PDR-091` + `verify-dont-trust` +6). Full record: `reference-closure.md` §Phase 5.

### agent-tools (20 modules) — KEEP all (localise)

`bin, bootstrap, branch-touched-files, ci, claude, codex, codex-exec, collaboration-state, commit-advisories,
commit-queue, context-cost, core, cursor, hook-policy, practice-fitness, practice-substrate, repo-check,
skills-adapter-generate, validators, version-guard` (Oak 2026-06-05; `bootstrap/` is the new `tsx` postinstall builder).
`validators/` now holds **seven**: collaboration-state, fitness-vocabulary, lifecycle-scripts, portability,
pretooluse-guard-routing, stale-script-invocations, subagents. Collaboration/health modules ACTIVE (per
collaboration=active). AMEND: `ci` test fixtures (`@oak/*`), the path-encoding validators
(`SCANNED_ROOTS`/`ALLOWLISTED_PATHS`), eslint config; localise the `tsx` postinstall bootstrap. **Phase 2.**

### Rules (89 at `ad649710`) — KEEP 80 / DON'T-BRING 9 — **Phase 4 ✅ (2026-06-09)**

- **DON'T-BRING (9):** `invoke-accessibility-expert`, `invoke-react-component-expert`, `invoke-design-system-expert`,
  `invoke-clerk-expert`, `invoke-elasticsearch-expert`, `invoke-sentry-expert` (6 UI/product), `eef-corpus-grounding`
  (EEF corpus), `sonarqube-mcp-instructions` (no Sonar server), and — **firsthand Phase-4 correction to this ledger's
  KEEP read** — `use-result-pattern` ("never throw") which directly contradicts castr's `principles.md`
  §Fail-Fast and has no true estate here. No ground-truth rule existed.
- **KEPT (80) + castr's 5 merged in place = 85 canonical rules**; root `RULES_INDEX.md` hand-authored (85 rows,
  index↔disk verified). The collaboration rules landed ACTIVE in their `ad649710` anti-ceremony forms
  (`collaboration-is-value-contingent` self-gates invocation until P8 infra lands); the anti-ceremony pair is in.
- **Executed reconciliation:** every body read firsthand; the Phase-3 lesson held at full strength — false
  principles-section cites across ~12 rules, Oak gate/tooling estates, Oak ESLint thresholds (250/50 → castr's real
  220/45), SDK-codegen coupling in `generator-first-mindset`, server-product triggers in `invoke-mcp-expert`, and
  castr's testing-strategy upstream-quarantine shape folded into `no-skipped-tests`. The 7 collision-range Oak-ADR
  cites were operative-authority traps, re-pointed with explicit cross-host disambiguation; >047 cites retained
  cross-host. Five new upstream Oak bugs flagged for back-flow. Full dispositions: `reference-closure.md` §Phase 4.

### Hooks — KEEP policy.json + native Cursor + Claude / DON'T-BRING Sonar

`policy.json` (localise scoped-block paths to castr surfaces) + native `.cursor/hooks.json` + Claude `PreToolUse`/
`SessionStart`. **DON'T-BRING** sonar-secrets hooks / `secrets:scan` (castr has only `eslint-plugin-sonarjs`, no Sonar
server). **Phase 2.**

**Activation DONE (owner, 2026-06-05 Phase-2 execution — revised after the Oak re-sync).** Phase 2 brought the policy
**data** (`.agent/hooks/policy.json`, localised) + the guard code (`agent-tools/src/hook-policy/*`, tested green) **and
wired live Claude `PreToolUse` activation** (`.claude/settings.json` Bash/Edit/Write matchers + `run-pretooluse-guard.mjs`
shim). Initially deferred for the fail-closed brick-risk; the owner's own Oak fix `89ec8dcf` (synced to baseline
`2c85bc01`) reversed that — **unbuilt `dist` fails OPEN** (exit 0 + warning), only built-but-broken fails closed — so the
deferral basis was obsolete and the owner authorised activation. Verified: routing validator OK, `git reset --hard`
denied, safe commands allowed. The sonar-secrets `Read` matcher stays **DON'T-BRING**.

### Agent-tools submodules (Phase 2) — KEEP Practice machinery / DON'T-BRING product-coupled

The wholesale `copy src/**` pulls 20 modules; the ledger seeded surface-granularity only, so module dispositions are
recorded here (owner 2026-06-05, firsthand during Phase-2 execution). **DON'T-BRING** `src/ci/ci-schema-drift-check.ts` —
Oak-product, not Practice (calls Oak's curriculum API `open-api.thenational.academy`, reads
`packages/sdks/oak-sdk-codegen/…`, requires `OAK_API_KEY`; nothing imports it — dropped, script removed). **KEEP**
everything else, incl. `ci/ci-turbo-report*` (generic turbo-output parsing; the `@oak/pkg-a` in its JSDoc is a doc
example) and `repo-check` (its `'sdk-codegen'` is a known-task-name literal). `OAK_API_KEY` existed only in the dropped
file. **Phase 2.**

**Deferred-validator "crash" on absent infrastructure — NOT a bug (corrected 2026-06-07).** `collaboration-state`
(`state-integrity.ts`) and `subagents` (`validate-subagents.ts`) throw on absent scan dirs
(`.agent/state/collaboration/*`→P8; `.cursor/agents` etc.→P6/7). **An earlier entry mis-called this a "robustness gap to
upstream-fix" — that was wrong.** These validators are **designed to hard-fail (throw, with the path in the message) when
canonical infrastructure is missing** — confirmed by Oak's own tests (`state-integrity.integration.test.ts`:
`rejects.toThrow('…/conversations')`; `codex-project-agents`: `toThrow(/missing adapter/)`). A trial fix that made them
return `[]` on `ENOENT` **broke that intended contract** (the hard-fail test went red) and was reverted; **no upstream
change was committed or pushed — Oak is clean at `ad649710`.** So the "crash" is the validator **truthfully reporting
that castr's P6/P8 infrastructure is not installed yet** — expected mid-transplant. Disposition: **nothing to fix in code
or config.** Correctly deferred from the blocking gate; resolves when P6 (sub-agents) / P8 (collaboration) land their
infrastructure. **Lesson:** silencing it would have masked the true "infrastructure absent" signal — the inverse of
green-gates-mask-gaps. (Oak advanced `2c85bc01`→`ad649710` since the Phase-2 sync; agent-tools delta is docs-only — README

- agent-identity.md — so the Phase-2 build stands. Step 0 (2026-06-07) reviewed Oak through `ad649710`; the agent-tools **code** is unchanged in `2c85bc01..ad649710`. Oak is held at `ad649710` as the working baseline.)

### Skills (20) — KEEP 18 / DON'T-BRING 2

DON'T-BRING `ground-truth-design`, `ground-truth-evaluation` (search-eval). **Executed (owner, 2026-06-07):** retired ALL
castr `jc-*` (subsumed by Oak's `plan`/`gates`/`start-right`/`consolidate-docs`); adopted Oak's knowledge model (retired
castr's `distillation` + `napkin`); folded castr's domain grounding into the start-right shared core (retired
`castr-start-right`). Regenerated adapters `--prefix=engraph-` (18×2); empty `skills-lock.json`; blocking `skills:check`.
**Correction to this ledger's earlier "portable / naming-only" read:** skills were NOT naming-localise-only — several
embedded Oak's real product gate commands (`sdk-codegen`/`test:widget`/etc.) + repo-doc paths needing per-skill castr
reconciliation, and `consolidate-docs` carried a stale upstream `practice-context` ref (Oak bug, flagged for back-flow;
see `reference-closure.md` §Phase 3). Collaboration skills (`start-right-team`, `session-handoff`) ACTIVE. **Phase 3 ✅.**

**Continuity/consolidation cluster (owner-named — the §6 vehicles):** `session-handoff` (SESSION-scoped, every session —
the **capture edge**, Conservation Invariant), `consolidate-docs` (THREAD-scoped, trigger-gated — the **distil/graduate
edge**; an **evolution of castr's thinner `jc-consolidate-docs` that replaces it** (owner: Oak's is an evolution of castr's and
can replace it) — at Phase 3 confirm no unique castr-local step is lost, then retire `jc-consolidate-docs`), and `consolidate-until-done` (the **strict persistent loop** wrapping `start-right-quick` +
`consolidate-docs` — runs to a completion proof or reports the exact remaining owner-decisions; forbids
archive/split/rename-only fitness cures). They implement `capture → distil → graduate → enforce` (PDR-011/014/046 — all
present from 1a; the skills' host `ADR-150`/`ADR-131` cites reference-close to those PDRs or stay retained-cross-host at
Phase 3/4). **This cluster is where the §6 session-close continuity discipline becomes structural.** **Bring Oak's current
(`ad649710`) forms (Step 0, 2026-06-07):** these three skills were rewritten to drop disposition ledgers / closeout
proof / provenance pointers and now defer to `permanent-doc-is-the-consolidation-record` — bring those forms, not the
older heavier ones. `start-right-team` is confirmed present → KEEP (team-mode).

### Sub-agents (19 templates) — roster: castr's 3 schema experts + 12 generic / DON'T-BRING 7

- **KEEP castr's 3:** `openapi-expert`, `zod-expert`, `json-schema-expert`.
- **BRING 12 generic:** code, test, type, architecture, assumptions, config, docs-adr, mcp, onboarding,
  release-readiness, security, subagent-architect (AMEND threat-model/examples to castr's schema domain).
- **DON'T-BRING 7:** accessibility, clerk, design-system, elasticsearch, react-component, sentry (UI/product) +
  `ground-truth-designer` (search-eval; orphaned without its product skills).
- **Components:** `behaviours/` + `principles/` KEEP; `architecture/reviewer-team.md` + `personas/{barney,betty,fred,wilma}`
  come with `architecture-expert` (Oak's multi-lens device) — bring with it. **Phase 6.**

**✅ LANDED (2026-06-19) — firsthand override of the disposition above.** Two corrections from reading every candidate
body + a negative-space sweep of castr's own `invoke-*` rules:

- The real driver is **completing a half-built expert system**: castr's rules `invoke-assumptions-expert`,
  `invoke-mcp-expert`, and `invoke-doc-and-onboarding-experts-on-significant-changes` (owner standing doctrine) already
  cited templates that did not exist. So `mcp-expert` and `onboarding-expert` are **BRING** (not droppable) — but **narrow
  to castr's surface** (MCP-tools _emission_; the AI-agent + contributor onboarding paths), not Oak's server/Apps/curriculum
  product. The "DON'T-BRING mcp" temptation was wrong for the third time.
- Net **9 new templates** authored **lean+native** (Oak templates = reference for the role's essence, not artefacts to
  copy): `architecture-expert` (4-persona device kept, owner-confirmed), `assumptions-expert`, `config-expert`,
  `docs-adr-expert`, `mcp-expert`, `onboarding-expert`, `release-readiness-expert`, `security-expert` (re-scoped to
  untrusted-input/DoS), `subagent-architect`. Roster **6 → 15**. The "12 generic / 13" counts in the disposition above
  conflated already-installed `code/test/type` with net-new; the firsthand net-new is 9 (+ 4 persona adapters). DON'T-BRING-7
  unchanged. Full record: `reference-closure.md` §Phase 6 "Sub-agent roster". `subagents` gate flip + `.cursor`/`.claude`
  wrappers remain **Phase 7**.

### Memory — fully populate (owner)

`active/patterns/` (122 as of Oak 2026-06-05; **AMEND `proven_in:` provenance**, regenerate index from frontmatter, **drop ~2 UI**:
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

---

## Main re-pin delta (2026-06-17) — bring-manifest refresh against Oak `main` `ad359a4f`

**Why this section exists.** The re-pin from `4470266` to Oak `main` (see tracker §Baseline RE-PINNED) means the dispositions
above were measured against a stale baseline. This section enumerates **what main has that castr does not yet have**, so
every outstanding item has a named position and nothing is an undefined-later. Built **firsthand** (slug set-difference +
per-file `diff` castr-current↔main), not from aggregate `git diff` counts — which mis-stated the scope on first pass.

**Confidence tiers** are explicit: NEW items (slug-diff) are exact; AMENDED items on **portable** surfaces (PDRs) are
high-confidence (minimal localisation); AMENDED items on **localised** surfaces (rules, directives, skills) are
**noise-confounded** — the castr↔main diff conflates castr's own localisations with upstream amendments, so a true count
needs a three-way (`ad649710` base) per-file pass and is scoped as a sweep, not asserted as a number.

### Tier 1 — NEW items (outstanding, to bring)

| Item                                 | Count | Position  | Notes                                                                                                                      |
| ------------------------------------ | ----- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| PDR-092 mechanical-firing-moments    | 1     | **D4**    | generic Practice doctrine                                                                                                  |
| PDR-093 self-correcting-deliverables | 1     | **D4**    | generic Practice doctrine                                                                                                  |
| PDR-094 coordination-event-rotation  | 1     | **P8**    | comms-rotation backing (the consolidate-docs/curator step-3a content defers to it)                                         |
| PDR-095 collaboration-is-multi-dim   | 1     | **P8**    | collaboration doctrine                                                                                                     |
| rule `no-unbounded-host-load`        | 1     | **D4**    | gates the start-right host-health section (also deferred) — bring the pair together                                        |
| `active/patterns/*` import           | 130   | **P6** ✅ | LANDED 2026-06-19 (132 main − 2 UI-only); `proven_in: imported`; broad source-repo neutralization; index generated + gated |

### Tier 1 — NEW-by-slug but resolved-by-DON'T-BRING (not outstanding)

The slug-diff also surfaces **9 rules** main has and castr lacks **by design** (already in the Not-brought set above):
the 6 UI/product `invoke-*` experts, `eef-corpus-grounding`, `sonarqube-mcp-instructions`, `use-result-pattern`. These are
**resolved**, not missing — recorded here so a future slug-diff does not re-flag them as a gap. Likewise the 2 new Oak
skills (`onboard-me` Oak-teammate-forked, `working-with-graphs` Oak-product) are DON'T-BRING / D4-only.

### Tier 2 — AMENDED items (the silent-loss vector — NEW workstream)

- **PDR amendments — ≈30 PDRs have diverged from main** (the 20 largest range 4–124 changed lines; e.g. PDR-074 +124,
  PDR-089 +117, PDR-091 +59, PDR-081 +50, PDR-085 +36). Sampled divergences are **real upstream content** — new dated
  Decisions and amendment-log entries (PDR-089 gained Decision 8 + 2026-06-11/06-14 entries), not formatting. **The
  transplant treated PDRs as bring-once at P1; it never tracked Oak amending them.** This is a newly-surfaced **PDR
  amendment re-sync** workstream. → **RESOLVED (owner, 2026-06-17): adopt Oak's amendments at a periodic "PDR currency
  sync."** castr hydrates portable governance from Oak as upstream; castr appends Oak's amendment-logs **verbatim** at the
  sync. Immutability (PDR-001) means **append the upstream amendment-log, not freeze castr's stale copy**. Position: a
  **D4/P9 named "PDR currency sync"** workstream (the ≈30-PDR fold; full per-PDR list generated at that pass). This also
  defines the ongoing castr↔Oak Practice relationship: it is a **periodic upstream merge**, not a one-time copy.
- **Rule / directive amendments — noise-confounded.** ~30 rule files and 3 directives differ from main, but the diff mixes
  castr's deliberate localisations (gate commands, ESLint thresholds, false-cite fixes) with upstream amendments.
  Separating them needs a three-way (`ad649710` base) per-file pass → scoped as the **D4 rule/directive currency sweep**;
  file list generated at that pass, not asserted here.

### agent-tools delta (NEW 41 / MODIFIED 47) — grouped by subsystem

- **`collaboration-state` (20 new + 18 modified = 38) → P8.** The comms/collaboration machinery (comms-archive,
  comms-provenance-check, role registry, schemas). Lands with Phase 8.
- **`validators` (3 new + 10 modified), `hook-policy` (1 + 7), `core` (10 + 3), `claude` (4 + 2), `practice-fitness`,
  `bin`, `ci`, `repo-check` → D4 parity.** Includes the validator amendments that flip the deferred validators green as
  P6/P8 land. Per-file enumeration is a D4-execution detail; the named subsystem groups are the tracked positions.

### Net outstanding (the honest scope of "bring it all")

P6: ~131 patterns + (sub-agents/state, already scoped). P8: PDR-094/095 + ~38 collaboration-state files + the deferred
comms skill prose. D4: PDR-092/093 + `no-unbounded-host-load` + the PDR-currency sync (~30) + the rule/directive
three-way sweep + ~50 agent-tools parity files. **No item is undefined-later; each line above names its phase.** The one
genuinely-open decision is the PDR-currency mechanism (owner, above).
