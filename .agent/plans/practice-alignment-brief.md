# Brief: Full Transplant of Oak's Agentic Estate into castr

**Status:** Brief for a fresh session (promote to `active/` as a planned workstream before executing)
**Created:** 2026-06-04
**Author:** prior session (initial-review + tri-repo scan)

---

## Mission

**Wholesale-transplant the _entire_ Oak agentic estate into castr** — Practice Core, `agent-tools`, **all** skills,
rules, hooks, directives, sub-agents (templates + components), PDRs, patterns, executive-memory, the knowledge flow, the
collaboration machinery, and every platform adapter — **bringing everything over, not just updating the surfaces castr
already has** — leaving out **only** what the next session determines is genuinely not relevant to a headless schema
library (see "Relevance determination"). Then **preserve castr's own content where appropriate** (reconcile, never
clobber), and **localise all
`oak-*` / `@oaknational/` naming to `engraph-*` / `@engraph/`**. Use **PEEN's transplant field report** as the operating
manual so castr does not re-discover the friction.

## The three repos

| Role                         | Path                                                | What it is                                                                                                                                      |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source** (transplant FROM) | `/Users/jim/code/oak-open-curriculum-ecosystem`     | The Practice origin; the full, current generation — bring all of it                                                                             |
| **Guide** (field report)     | `/Users/jim/code/project-explorer-especially-names` | Already wholesale-transplanted oak's full Practice + `agent-tools`; report at `.agent/reports/practice-integration-feedback.md` — read it FIRST |
| **Target** (transplant INTO) | `/Users/jim/code/castr` (this repo)                 | A lighter ≈March snapshot carrying castr's own deep product doctrine                                                                            |

> ⚠️ This is a **wholesale Practice transplant** (oak PDR-005). PEEN already paid the friction bill once. Read its
> report before touching files.

## Governing model: bring everything, reconcile, don't discard

| Bucket                                              | Action                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The whole Oak agentic estate**                    | **TRANSPLANT IN FULL** — including everything castr has no equivalent of (PDRs, patterns, executive-memory, sub-agent template bodies, the full skills/rules estate, collaboration machinery, hook policy, `agent-tools`). Default = bring it.                                                                                        |
| **Castr's own product content**                     | **PRESERVE / RECONCILE as appropriate** — additive merge; on castr-specific product files, **castr wins**; never clobber (see Must-not-lose).                                                                                                                                                                                         |
| **Oak content whose relevance to castr is unclear** | **The next session decides** (see "Relevance determination"). Genuine non-relevance is a legitimate, expected outcome — some oak content **should not be brought over at all**. Do **not** pre-decide it in this brief; determine it from castr's actual surfaces using questions designed from PEEN's report, then confirm with Jim. |
| **Naming**                                          | **LOCALISE** `oak-*`→`engraph-*`, `@oaknational/`→`@engraph/`; reconcile oak agent/state naming to castr's.                                                                                                                                                                                                                           |

**PDR vs ADR (important):** oak's `decision-records/` are **PDRs = portable _Practice_ governance** → **transplant all of
them** (castr currently has none). Oak's product **ADRs are repo-specific** → **do NOT bring them**; **castr keeps its own
ADRs** (`001–047`). Any transplanted rule that cites an oak ADR number must be **reconciled** to castr's ADR estate, or
re-pointed to the relevant PDR, or marked placeholder (this is exactly PEEN's dangling-ADR-cite class).

## Must-not-lose (castr content to PRESERVE / reconcile — never overwrite)

- `.agent/directives/principles.md`, `IDENTITY.md`, `requirements.md` — castr's authoritative doctrine. **principles.md
  must not be edited without Jim's explicit approval.** (Layer oak's generic engineering directives _additively_; on
  conflict, castr's product doctrine wins.)
- All ADRs `001–047` (incl. **ADR-047**) and `docs/architecture/*` (OAS-3.2 / IR / strict-object / Zod round-trip).
- Schema-domain reviewers `openapi-expert`, `zod-expert`, `json-schema-expert` (keep; localise naming only — these are
  castr's analogue of oak's domain experts).
- Castr-specific rules/strategy: `input-output-pair-compatibility.md`, `testing-strategy.md`, the strict-object /
  additionalProperties doctrine.
- The just-committed **`.agent/report/initial-review/`** (14 docs), the **`.agent/plans/remediation/`** backlog, the
  **`docs/initial-deep-review`** branch, the active **`explicit-additional-properties-support.md`** plan, this brief,
  and the corrected roadmap/handoff state.

## Bring over from Oak (the full estate — including what castr lacks entirely)

1. **Practice Core → oak's 7-file generation, in full:** `practice.md`, `practice-lineage.md`, `practice-bootstrap.md`,
   `index.md`, `README.md`, `CHANGELOG.md`, **`practice-verification.md`**, **`decision-records/` (all PDRs)**,
   **`provenance.yml`**, and oak's **multi-dimensional fitness model** (line target/limit + char + line-length).
   **Retire `.agent/practice-context/`** (oak dropped it 2026-04-29). Reconcile castr's at-ceiling `practice.md`.
2. **`agent-tools` → create `@engraph/agent-tools`** from `@oaknational/agent-tools`, all modules: `hook-policy`,
   `skills-adapter-generate` (+`skills-lock.json`), `practice-fitness`, `practice-substrate`, `repo-check`,
   `validators`, `version-guard`, `branch-touched-files`, `collaboration-state`, `commit-queue`, `commit-advisories`,
   `context-cost`, `core`/`bin`, `claude`/`codex`/`cursor` adapter generators. Wire into castr's gates.
3. **All skills** (oak's ~20, `SKILL-CANONICAL.md` + generated adapters): knowledge-flow (`napkin`, `distillation`,
   `curator-pass`, `consolidate-docs`, `consolidate-until-done`, `metacognition`, `session-handoff`, `tsdoc`),
   workflow (`go`, `plan`, `gates`, `commit`, `complex-merge`, `undo-change`, `start-right-*`, `codex-helper`),
   evaluation (`ground-truth-design`/`-evaluation`), etc. **Migrate castr's `jc-*` commands → skills** (oak phased
   commands out). Lock with `skills-lock.json`.
4. **All rules + `RULES_INDEX.md`** (oak's full set, three-form canonical + thin platform forwarders) — relevance pass
   per below (KEEP / PARK / AMEND, not pre-filtered out).
5. **Hooks:** `.agent/hooks/policy.json` (declarative guardrail — block `git push --force`/`reset --hard`/`--no-verify`/
   `git add -A`/`clean -fd`/`restore`/`stash drop`…), enforced by `agent-tools` hook-policy, wired per platform incl.
   **native `.cursor/hooks.json`** (PEEN finding) and Claude `PreToolUse`/`SessionStart`/`UserPromptSubmit`.
6. **All directives** oak carries: `agent-collaboration`, `continuity-practice`, `definition-of-delivery`,
   `operationalisation-contract`, `orientation`, `schema-first-execution`, `tdd-as-design`, `user-collaboration` —
   merged with (not duplicating) castr's existing set.
7. **Sub-agents:** oak's `templates/` (canonical bodies) + `components/` architecture — bring in full; reconcile with
   castr's existing reviewer roster (keep castr's schema experts; bring oak's generic reviewer templates).
8. **Memory / state / roles / evaluations / milestones / proposals:** bring oak's structures (`.agent/memory/active/
patterns/`, executive-memory, `.agent/state/collaboration/*`, `roles/`, etc.) — including the patterns estate and
   executive catalogues castr has no equivalent of.
9. **Platform adapters:** align `.claude`/`.codex`/`.cursor`/`.gemini`/`.agents` to canonical-first generation; add
   `.windsurf` (oak has it).
10. **Agent-collaboration tooling — explicitly wanted, first-class, and ACTIVE (Jim's directive 2026-06-04).** Bring the
    **complete** collaboration surface — tooling, workflows, logic, **and documentation** — fully active (never dormant
    or deferred):
    - **`agent-tools` modules:** `collaboration-state` (comms / claims / presence / coordinator), `commit-queue`,
      `commit-advisories`, `context-cost`.
    - **Directive:** `agent-collaboration.md` (+ `continuity-practice.md`, `user-collaboration.md`).
    - **Rules cluster (all of it):** `follow-agent-collaboration-practice`, `follow-collaboration-practice`,
      `agent-state-observable`, `comms-all-channels-watcher`, `respect-active-agent-claims`,
      `register-identity-on-thread-join`, `register-active-areas-at-session-open`, `use-agent-comms-log`,
      `use-built-agent-tools-cli`, `handoff-messages-self-contained`, `liveness-heartbeat-cron`, `ping-before-escalate`,
      `sha-prefix-in-collaboration-content`, `check-singleton-per-window`, `owner-attention-at-action-moments`,
      `respect-active-agent-claims`, `use-monitor-for-event-driven-wake`, `comms-all-channels-watcher`.
    - **State surfaces:** `.agent/state/collaboration/*` (active-claims, sessions/presence, coordinator.current,
      comms log).
    - **Skills/workflows:** `start-right-team`, `session-handoff`, and the session-open write choreography.
    - **PEEN-hardened forms (adopt these, not the pre-fix versions):** structured **coordinator-state** (not prose),
      the TTL'd **presence registry** (presence ≠ claim), the unified **comms attention pass**, and the **plan-mode
      identity carveout**.
      This is a first-class deliverable on equal footing with the Core and `agent-tools` — it does **not** go in the PARK
      set.

## PEEN-guided method (apply its four named transplant steps + inherit its fixes)

PEEN's headline lesson: the Core is portable, **but the estate is not self-contained** — rules/skills/templates travel
while the patterns/templates/memory/ADRs they cite do not → "**dependency cliffs**." A _full_ transplant reduces this
(bring everything), but the discipline still applies:

1. **Reference-closure classification** — scan `.agent/rules/`, `.agent/skills/**`, `.agent/sub-agents/templates/` for
   every internal/PDR/ADR cite; classify unresolved ones **resolve / rewrite / placeholder**. Use the
   `host-shape:check` scanner (extended to walk those surfaces — PEEN's "scanner blind spot" fix).
2. **Content-sync (backfill)** — _auditing absence is not enough_ (PEEN: "closure-audit detects but does not backfill").
   For every `resolve`, actually copy/adapt the referenced pattern/template/memory across before completion.
3. **Derived-index regeneration** — regenerate inherited indexes (e.g. patterns `README`) **from frontmatter**; never
   inherit a hand-maintained index verbatim.
4. **Relevance pass = KEEP / AMEND / DON'T-BRING / dormant** (delegate to specialist sub-agents per category, as PEEN
   did with five parallel specialists). **AMEND** = localise stale `oak`/`@oaknational` labels + reconcile dead ADR
   cites. **DON'T-BRING** = genuinely not relevant to a headless schema library (a legitimate, expected outcome).
   **dormant** = relevant-if-castr-grows but not yet (a scale call, not structural). The KEEP/don't-bring boundary is
   **the next session's determination — see "Relevance determination" — not pre-decided here.**

**Inherit PEEN's already-fixed hardening (start from the fixed state):** coordinator/identity in **structured state, not
rule prose**; **presence registry** (presence ≠ claim) for bootstrap false-negatives; a **comms attention pass** (not
directed-inbox-only); a **plan-mode identity carveout**; **skills-adapter orphan pruning** on `--check`;
**`resolveRepoRoot`** over `../` hop-counting; **`markdownlint-cli2`** per-dir config; **eslint** ignoring agent-plugin
tmp dirs + configs as `.ts`; the **cooperative working-tree inclusion** positive pattern.

## Relevance determination — the next session's call, with questions designed from PEEN

Some Oak content is genuinely **not relevant** to a headless schema-transform library and **must not be brought over**.
This brief deliberately does **not** pre-decide what — fresh eyes against castr's actual surfaces will. The method:

1. **Read PEEN's report first** — especially its **WS2 Rule Disposition Ledger** (per-item KEEP/AMEND reasoning) and its
   dependency-cliff findings. PEEN judged relevance by asking, per item, "does _this_ repo have the surface this
   assumes?" Use that experience to **design castr's own relevance questions**, then apply them per surface.
2. **Seed questions to refine (starting points, not verdicts):**
   - **Substrate or product-domain?** Practice substrate (knowledge flow, doctrine, gates, **agent collaboration**,
     tooling, provenance, continuity) is always relevant. Product-domain content assumes a specific surface — ask on.
   - **Does castr actually have that surface?** castr is a headless TypeScript IR/schema library: no browser UI, no
     React, no auth, no search index, no design system, no curriculum/data domain. Content assuming one of those is a
     **don't-bring** candidate.
   - **Structural or scale?** Will castr never have it (structural → don't bring) or could it grow into it (scale →
     bring dormant)?
   - **Castr equivalent already?** (its schema-domain experts, its product doctrine) → keep castr's, don't duplicate.
   - **Dependency cliff?** Does it cite patterns/ADRs/experts that also wouldn't come? → resolve or don't bring.
3. **Present reasoned verdicts to Jim** before finalising the not-bring set (`present-verdicts-not-menus`). Genuine
   non-relevance is an **expected** outcome, not a failure.

"Bring everything" means **bring the whole _relevant_ estate, deciding relevance deliberately** — not bring every file
regardless of fit, and not pre-filter or guess. (Agent collaboration is substrate → always in.)

## Sequencing & safety

- **Plan first.** Write a decision-complete plan before touching files. Do **not** disrupt the `docs/initial-deep-review`
  branch or the active additionalProperties plan.
- **Branch + phase + gate.** New branch. Suggested order: (1) Core (all 7 files + PDRs + patterns + `provenance.yml` +
  fitness) + retire practice-context → (2) `@engraph/agent-tools` + hook policy → (3) skills + commands→skills →
  (4) rules + `RULES_INDEX` + relevance pass (KEEP/AMEND/don't-bring) → (5) directives → (6) sub-agents/memory/state → (7) adapters
  (+`.windsurf`) → (8) collaboration machinery → (9) `practice-verification` pass. Run `pnpm check` **and** a
  reference-closure scan after each phase.
- **Provenance honesty.** Append a new castr `provenance.yml` entry for this transplant; never fabricate the chain.
  Respect `subagent-practice-core-protection` (sub-agents must not mutate the portable Core).
- **Record the not-brought + dormant sets.** Whatever is deliberately not brought over (or brought-but-dormant) gets an
  explicit, discoverable record with rationale (not silent) — so castr is honest about what was excluded and why.
- **Close the loop.** Add a napkin entry, update `session-continuation.prompt.md` + `roadmap.md`, and create castr's own
  **`.agent/report/practice-integration-feedback.md`** (PEEN's invented feedback channel) — the portable fixes hand
  back to oak.

## Definition of done

1. castr carries the **full Oak generation**: 7-file Core + **all PDRs** + `provenance.yml` + `practice-verification.md`
   - new fitness model (practice-context retired); `@engraph/agent-tools` builds + gated; `.agent/hooks/policy.json`
     enforced cross-platform (incl. native Cursor hooks); all skills (commands migrated, `skills-lock.json` clean); all
     rules + `RULES_INDEX`; all directives; sub-agents/memory/state/patterns; all adapters.
2. **Nothing in Must-not-lose is lost** — gates green; castr's ADRs/doctrine/report/remediation backlog/branch intact;
   castr's product ADRs preserved, oak's product ADRs not imported.
3. All `oak`/`@oaknational` naming localised to `engraph`/`@engraph`; transplanted rules reference-closure-clean (no
   dangling cites); the **relevance ledger** (KEEP/AMEND/don't-bring/dormant) committed, and the not-brought + dormant
   sets explicitly recorded with rationale.
4. `practice-verification.md` checklist/health-check/estate audit passes; castr feedback report written; handoff stack
   updated.

## Read first (orientation)

- PEEN report: `/Users/jim/code/project-explorer-especially-names/.agent/reports/practice-integration-feedback.md`
- Oak source: `…/oak-open-curriculum-ecosystem/.agent/` (Core incl. `decision-records/`, `provenance.yml`,
  `practice-verification.md`; `skills/`, `rules/`, `hooks/`, `directives/`, `sub-agents/`, `memory/`, `state/`),
  `…/agent-tools/`, `…/RULES_INDEX.md`.
- castr current: this repo's `.agent/` + `docs/architectural_decision_records/` + `.agent/report/initial-review/`.
