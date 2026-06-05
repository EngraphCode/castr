# Oak → castr Practice Transplant (PRIMARY ACTIVE)

**Status:** ACTIVE — primary plan
**Created/Promoted:** 2026-06-05
**Branch:** `feat/transplant-engraph-practice` (off `docs/initial-deep-review`, which holds the PRESERVE set; baseline tag `transplant/phase-0-baseline` = e0541f6). **Plan correction:** the approved plan said "off `main`", but `main` does **not** contain the PRESERVE set (initial-review report, remediation backlog, ADR-047, the brief) — branching off `main` would orphan them, so the base is `docs/initial-deep-review`. **PR implication:** a PR to `main` carries the 2 deep-review commits unless that branch merges to `main` first (owner's merge-ordering call).
**Authoritative spec:** [`practice-alignment-brief.md`](../practice-alignment-brief.md)
**Operating manual (read in full):** PEEN field report `/Users/jim/code/project-explorer-especially-names/.agent/reports/practice-integration-feedback.md`
**Phase tracker:** [`../transplant/README.md`](../transplant/README.md)
**Parked-in-place (non-primary):** [`explicit-additional-properties-support.md`](./explicit-additional-properties-support.md)

> Permanent architecture truth belongs in `docs/architecture/*`, ADRs, and the transplanted `.agent/practice-core/`
> (PDRs). This plan is the execution contract; it does not duplicate doctrine.

---

## User impact

castr gains the full portable Practice substrate (governance via ~90 PDRs, `@engraph/agent-tools`, rules, hooks,
generic reviewers, executive/pattern memory, and **active multi-agent collaboration**) so multiple agents can work on
castr coherently — while castr's own product doctrine, ADRs, deep-review report and remediation backlog are preserved
intact, gates stay green, and provenance stays honest.

## Owner-locked scope (2026-06-05)

1. Scale surfaces (patterns, executive memory, `.gemini`/`.windsurf`, fitness gates): **fully populate**.
2. Agent-collaboration machinery: **ACTIVE, full, PEEN-hardened**, seeded **empty** (no Oak event data). The
   collaboration surface is about **agents**, not humans.
3. This transplant is the **primary active plan**; `explicit-additional-properties-support.md` is **parked-in-place**;
   `remediation/` and the `docs/initial-deep-review` branch are untouched.
4. Sub-agent roster: **all ~13 generic experts** (incl. `mcp-expert` — castr emits MCP tools); drop the 6 UI/product experts.
5. Tightenings: drop the **ground-truth search-eval triplet** + Oak **SonarQube/secrets infra** + ~2 UI-only patterns;
   **AMEND pattern `proven_in:` provenance + regenerate derived indexes**; `practice-fitness` **informational-first**.

## Scope: BRING / PRESERVE / DON'T-BRING

**BRING** (localise `@oaknational`→`@engraph`, `oak-*`→`engraph-*`): 7-file Core + ~90 PDRs + `provenance.yml` +
`practice-verification.md` + fitness model; `@engraph/agent-tools` (~20 modules); 18 skills + `jc-*`→skills; ~78 rules +
`RULES_INDEX`; hook policy + native `.cursor/hooks.json` + Claude hooks; 7 generic directives; 13 generic sub-agent
templates + `components/`; full `patterns`/`executive`/`operational` memory; collaboration schemas + empty dirs;
regenerated adapters incl. `.gemini`/`.windsurf`; collaboration machinery ACTIVE.

**PRESERVE — castr wins, never clobber:** `principles.md` (**SACRED — no edit without explicit user approval**),
`IDENTITY.md`, `requirements.md`, `testing-strategy.md`, `AGENT.md` (layer Oak's generic directives additively); ADRs
**001–047** + `docs/architecture/*`; schema reviewers `openapi`/`zod`/`json-schema-expert`; strict-object/
`additionalProperties` doctrine; `input-output-pair-compatibility.md`; `.agent/report/initial-review/`;
`.agent/plans/remediation/`; the parked `explicit-additional-properties-support.md`; the `docs/initial-deep-review`
branch; the 5 Codex-adapter assertions in `scripts/validate-portability.mjs` (port before retiring).

**DON'T-BRING (recorded in the relevance ledger):** 6 UI/product experts (accessibility, clerk, design-system,
elasticsearch, react-component, sentry) + their `invoke-*` rules; ground-truth triplet; Oak SonarQube/secrets infra; Oak
product ADRs; Oak `principles.md`/`testing-strategy.md`/`schema-first-execution.md`/`AGENT.md`; **all Oak runtime event
data** (2,936 comms, claims history, 5.5 MB log, 317 KB archive); ~2 UI-only patterns.

## Method (PEEN four steps + hardening)

**This is a Practice-history MERGE, not a one-way copy.** Practice histories are branchy (a DAG, like git): castr's
Practice is a branch that diverged from the shared network ≈2026-03-09 and evolved locally; Oak's is a parallel branch.
Where castr already has a surface (Core docs, provenance, directives), reconcile as a **three-way merge** (ancestor =
the last shared sync; ours = castr's branch; theirs = Oak's current generation) — adopt Oak's advances, preserve castr's
divergence, never clobber. `provenance.yml` is a flattened merge-history → union both branches + add a merge node. See
`practice-lineage.md`'s integration protocol (~⅓ port clean, ⅓ selective-edit, ⅓ rewrite).

reference-closure (resolve/rewrite/placeholder — 36 Oak-ADR cites dangle vs castr ADR≤047; low-number overlaps are
_semantic_ mismatches → re-point to PDRs) → content-sync backfill → derived-index regeneration (RULES_INDEX, patterns
README, executive catalogues, from frontmatter) → relevance ledger. Inherit PEEN-fixed forms (structured
coordinator-state, TTL presence registry, comms attention pass, plan-mode carveout, orphan-pruning, `resolveRepoRoot`,
`markdownlint-cli2`, native Cursor hooks).

## Build & gate integration (firsthand-verified)

> Summary below; the **full Phase-2 design** (gate-adoption schedule, the 7 risk seams A–G incl. the agent-tools-tests-
> assert-Oak-paths gotcha, workspace/tsconfig/eslint/knip/depcruise specifics, rollback) lives in
> [`../transplant/02-agent-tools-build-design.md`](../transplant/02-agent-tools-build-design.md).

`agent-tools/src` has **0** `@oaknational` imports — localise only `package.json` name, a new local `eslint.config.ts`,
self-contained `tsconfig*.json`, and `validators/stale-script-invocations` paths. Add `agent-tools` to
`pnpm-workspace.yaml`; `postinstall: turbo run build --filter=@engraph/agent-tools`; husky `test -f` build-guard; Phase
2 commit includes regenerated `pnpm-lock.yaml`. Keep agent-tools out of `lib`'s depcruise/knip/madge (own minimal
configs). **`.agent` is NOT prettier-ignored** → every phase `pnpm format`s its new docs and commits the result.
`practice-fitness` informational-first (exits 0 — never red-gates sacred `principles.md`); strict fitness never enters
blocking `qg`. Reconcile `validate-portability.mjs` (a subagents validator) → flip to Oak `validate-portability` only
at Phase 7 after porting its 5 Codex assertions.

## Phases (each ends green + reference-closure-clean; atomic commit; tag `transplant/phase-N`)

0. **Setup** — branch, baseline tag, plan promotion (this file), park product plan. ← in progress
1. **Practice Core** — 7-file + ~90 PDRs + `provenance.yml` (honest castr entry) + `practice-verification.md` + fitness;
   retire `.agent/practice-context/`; build `@engraph/agent-tools` first so docs are checkable.
2. **`@engraph/agent-tools` + hook policy** — localise, wire workspace/turbo/postinstall/husky/lockfile; policy.json +
   native `.cursor/hooks.json` + Claude hooks.
3. **Skills + commands→skills** — `jc-*`→canonical; 18 skills (drop ground-truth ×2); regenerate adapters `--prefix=engraph-`; `skills-lock.json`.
4. **Rules + `RULES_INDEX` + reference-closure** — ~78 rules; resolve 36 Oak-ADR cites; drop UI/sonar/eef/ground-truth; merge castr's 5.
5. **Directives** — 7 generic additive; do not touch sacred docs; drop `schema-first-execution.md`.
6. **Sub-agents / memory / state** — 13 generic templates + `components/`; full patterns (provenance-amended, index
   regenerated, drop ~2 UI); executive (regenerated catalogues); operational; collaboration schemas + empty dirs.
7. **Adapters** — regenerate `.claude`/`.codex`/`.cursor`/`.agents`; add `.gemini`/`.windsurf`; flip portability/subagents blocking (after porting 5 Codex assertions); retire bespoke script.
8. **Collaboration ACTIVE** — directive + rules cluster + skills + structured coordinator-state + TTL presence + comms attention pass + plan-mode carveout; wire collaboration validator blocking.
9. **`practice-verification` pass** — zero reference-closure placeholders; commit relevance ledger; write castr
   `.agent/report/practice-integration-feedback.md`; update roadmap + session-continuation + napkin.

**Per-phase verification:** `pnpm clean && install` → `test -f/-x agent-tools/dist/src/bin/*.js` → `pnpm format` new +
commit → `format:check` `type-check` `lint` `madge:circular/orphans` `depcruise` `knip` → phase practice/agent gates →
`test:all` + `test:e2e` → reference-closure scan (0 `rewrite` in touched files; placeholders map to later phases) →
`git diff --stat <prev-tag> HEAD` + clean `git status` → tag.

## TDD / proof-first order

Practice tooling is verified by its own gates (agent-tools unit tests, validators, reference-closure scan,
`practice:substrate`/`vocabulary`/`fitness`). For each agent-tools localisation, localise the failing Oak-path fixtures
first, see them pass, then make the gate blocking. No gate is wired blocking before its target estate exists.

## Success criteria

1. Full Oak generation present + localised; `@engraph/agent-tools` builds + gated; collaboration active (empty-seeded).
2. Nothing in PRESERVE lost; gates green; Oak product ADRs not imported.
3. Reference-closure-clean (0 dangling cites); relevance ledger + not-brought/dormant sets committed.
4. `practice-verification` passes; `pnpm check`/`check:ci` green on final close-out; castr feedback report written; handoff updated.

## Documentation outputs

Relevance ledger (`.agent/report/` or `.agent/plans/transplant/relevance-ledger.md`); castr
`.agent/report/practice-integration-feedback.md`; updated `roadmap.md`, `session-continuation.prompt.md`, napkin;
honest `provenance.yml` entry; the transplanted PDRs/practice-verification as durable governance.

## Execution trigger / completion

Approved 2026-06-05. Execute phases 1→9 with per-phase gate + reference-closure verification. Complete when all four
success criteria hold and `pnpm check:ci` is green on the final close-out. Roll back **forward** only (revert commits,
never `reset --hard`/force-push).
