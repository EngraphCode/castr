# Session Continuation: @engraph/castr

**Last updated:** 2026-06-10

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Current state (2026-06-15 close) — read this first

This block is current truth only. Branch/delivery state lives in
[`../plans/delivery-ledger.md`](../plans/delivery-ledger.md) (single DRY home). **Sections below this block predate the
2026-06-15 single-branch consolidation and are historical context** — where they describe `fix/*` branches off
`docs/initial-deep-review` or PR #1, this block supersedes them.

- **Single branch (owner, 2026-06-15):** ALL work is on `feat/transplant-engraph-practice` (pnpm 11.5.2, Node 24
  govern). The multi-branch model was retired — `docs/initial-deep-review` and `fix/remediation-01-packaging-and-types`
  were fully subsumed and **deleted (local + remote, verified lossless via `git cherry`/diff/ancestry)**; **PR #1 was
  closed** (superseded). Remediation 02–07 now execute **on this branch**, not separate `fix/*` branches. The single
  delivery act is one eventual PR `feat/transplant-engraph-practice → main` carrying everything. `feat/rewrite`
  (remote-only, historical session-3.x line) is untouched.
- **The branch is `check:ci`-GREEN end-to-end** (verified first-hand via pre-push, 2026-06-15) — through `test:all`/
  `test:e2e`. First time it has been provably green: lint-red had been **masking** two knip failures (`check:ci` stops
  at the first failure), so "green except lint" was false. Both knip failures are now fixed (see below).
- **D1 lint — step 1 DONE (commit `3b3f0d9`):** `sonarjs/function-return-type` (121) + `sonarjs/in-operator-type-error`
  (5) transitioned `error → warn` in `lib/eslint.config.ts` (NOT off; lint runs no `--max-warnings 0`). Lint exits 0.
  **Remaining: the refactor `warn → error`** (the DoD completion gate before the deep enhancement is complete).
- **knip fixed (commits `c622998`, `1363181`):** the lint fix unmasked two pre-existing knip failures, both fixed —
  6 dead char-test exports removed; `commitlint` installed + wired (`@commitlint/cli` + `config-conventional` +
  root `commitlint.config.mjs`), which also made the agent-tools `check-commit-message` validator operational (it had
  been a phantom — no `commitlint` was installed). No enforcing `commit-msg` hook (owner).
- **Plan-of-record sequence (owner):** (1) deep-review remediation backlog 01→07 — **01 COMPLETE + merged in**, **02**
  in `active/`, next to execute; (2) Practice transplant Phases 5–9 + the engineering-infrastructure arc D1–D4 (tracker
  §Deep-enhancement arc); (3) `explicit-additional-properties-support` (paused, pos 3). All on the single branch.
- **Owner decision 1 — Node:** 24 everywhere; stable-LTS always; advance to 26 only once GitHub _and_ Vercel support
  it. Config executed (`engines: 24.x`, single-Node-24 `ci.yml`); single-source `.nvmrc` and ADR-048 remain as D2.
- **Owner decision 2 — lint:** no rule ever off; in-flight rules MAY be `warn` transitionally; DoD requires all back
  to `error` before the deep enhancement is complete (`DEFINITION_OF_DONE.md` §Transitional gate states; D1). NOT disabling.
- **Owner decision 3 — scope:** the deep enhancement is broader than Phases 0–9 (CI to the Oak SHA-pinned-actions
  standard, plus quality-gate and Practice parity; D1–D4). "Phases done" is not "deep enhancement complete".
- **Turnkey next steps:** (a) **D1 refactor** — `warn → error` for the two sonarjs rules (121 `function-return-type`
  collide with castr's deliberate discriminated-union returns; 5 `in-operator` are genuine narrowing fixes); (b)
  **remediation 02** (IR-fidelity harness, in `active/`); (c) **transplant Phase 5** (Directives — ground with owner).
- **Oak:** PINNED on `practice/transplant-to-castr` @ `4470266` (no moving target; castr commits AND pushes
  back-flow/feedback directly in Oak).

---

## Where We Are

> 🔀 **PLAN-OF-RECORD SEQUENCE (owner, 2026-06-09 — "all issues MUST be fixed, mostly now; sequencing in the
> current plan is acceptable; an undefined 'later' is never"): (1) NOW — the deep-review remediation backlog**
> ([`remediation/`](../plans/remediation/), plans 01→07 in order; **01 COMPLETE — draft PR #1 open + CI-green**;
> **02** promoted to `active/`, next to execute; branch `fix/remediation-01-packaging-and-types` off
> `docs/initial-deep-review`, PR'd to `main` independently — the 6 shipped Criticals outrank practice infrastructure); **(2) NEXT — the Practice transplant Phases 5–9**
> ([`oak-practice-transplant.md`](../plans/active/oak-practice-transplant.md), tracker
> [`transplant/README.md`](../plans/transplant/README.md), branch `feat/transplant-engraph-practice`, Phases 0–4
> complete and tagged); **(3) THEN — the product feature slice**
> [`explicit-additional-properties-support.md`](../plans/current/paused/explicit-additional-properties-support.md)
> (sequenced, not parked). A 2026-06-05 record claimed the owner "parked" item 3 — **the owner never gave that
> instruction and repudiated the parking framing outright (2026-06-09)**. Everything below remains true context.

### Practice Transplant — resume from the tracker (sequence position 2)

**Goal:** wholesale-transplant Oak's Practice estate into castr (localise `@oaknational`→`@engraph`), preserving castr's
product doctrine/ADRs/report/remediation. **Branch:** `feat/transplant-engraph-practice` off `docs/initial-deep-review`
(baseline `transplant/phase-0-baseline`). **Read first:** `.agent/plans/active/oak-practice-transplant.md` (contract) →
`.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` (the full
inventory/dispositions) → the napkin's latest entries (`2026-06-10` decisions + rule candidate, `2026-06-09` Phase-4 lessons, `2026-06-07` firsthand corrections).

- **Status:** Phases 0–4 ✅. **Phase 4 (2026-06-09, tag `transplant/phase-4`)** — 80 Oak rules (ad649710) + castr's 5
  = 85 canonical rules + root `RULES_INDEX.md` (85 rows, index↔disk verified); per-rule firsthand reconciliation;
  `use-result-pattern` dropped (contradicts `principles.md` fail-fast — 9th DON'T-BRING); 7 collision-range Oak-ADR
  cites disambiguated cross-host; `pnpm agent-tools:*` aliases wired. Phase 3 — skills (18 brought + localised; castr
  grounding folded into the start-right core; `jc-*`/`distillation`/`napkin`/`castr-start-right` retired; blocking
  `skills:check`); tag `transplant/phase-3`. Phase 2 = `@engraph/agent-tools` (340 files) + hook policy + LIVE
  PreToolUse guards + §6 `validate-drift`; tag `transplant/phase-2` (commit `55a6788`).
  Commits: see `git log --oneline transplant/phase-1..HEAD` — Phase 2 = `55a6788`; then handoff + diagnosis-correction commits. Oak advanced `2c85bc01`→`ad649710`; **Step 0 (2026-06-07) reviewed the whole estate (see the tracker); Oak is held at `ad649710` as the working baseline.**
- **LIVE NOW (operational):** Claude PreToolUse guards are wired (`.claude/settings.json`) — tool calls are guarded
  (dangerous-git + PDR-044 content fingerprints denied; unbuilt `dist` fails OPEN, never bricks). agent-tools `test` is
  INFORMATIONAL (`--filter=!@engraph/agent-tools`; **13**/885 failures are later-phase content — the RULES_INDEX slice
  went green at P4). `repo-validators:check` = **5 green BLOCKING validators**
  (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`/**`stale-script` — flipped 2026-06-09**
  after its one finding, the `principles.md:1729` dangling invocation, was fixed); 3 deferred
  (`collaboration-state`→P8, `subagents`→P6, Oak `portability`→P7). **policy.json is contract-tested** (hook-policy
  tests pin its citation strings — data↔test lockstep, change BOTH together: done 2026-06-09 for the staging-deny →
  rule-path and hedging/menu-deny → real-principles-heading citations; 114/114 green).
- **⚠️ The deferred validators' "crashes" are NOT bugs — do NOT silence them.** They hard-fail by design on absent
  infrastructure (Oak tests assert `rejects.toThrow` / `toThrow(/missing adapter/)`) — truthfully reporting castr's P6/P8
  infra isn't installed yet. A 2026-06-07 trial fix was reverted; **Oak clean at `ad649710`, nothing pushed**. They
  self-clear when P6/P8 land. See `relevance-ledger.md` §"Deferred-validator …".
- **Next steps — full detail in the tracker's "Next steps":** Steps 0–2 + Phase 4 ✅ done. **NEXT: Phase 5 —
  Directives (7 generic, additive)**; then Step 3 residue folds at its phases (`PDR-089` Decision-7→P1; `.cursor`
  adapter→P7; `documentation-hygiene.md` landed with P4). The scheduled **pre-Phase-9 Oak delta-sync** brings the
  post-hold drift (`precedence-is-not-approval` + PDR-091 + any later KEEPs).
- **Standing gotchas (firsthand-verified):** `.agent` is NOT prettier-ignored → `pnpm format` new docs every phase (and
  `check:ci`/pre-push does not run `fix`); some Oak markdown needs prettier `--write` TWICE to converge;
  `practice-fitness` informational-first never red-gates `principles.md`; transplanted surfaces'
  section-cites and classifications are claims — read bodies firsthand (the P3 skills lesson, re-proven at P4 where a
  KEEP-classed rule contradicted principles doctrine); the 36 Oak-ADR cites are closed (P4) — the 7 collision-range
  ones carry explicit cross-host disambiguation.
- **Posture (owner 2026-06-05):** fully populate; collaboration ACTIVE (about agents) seeded empty; all generic experts
  incl. mcp-expert; drop ground-truth + Oak Sonar/secrets + ~2 UI patterns. Each phase = atomic commit + tag; roll back
  forward only.

> ⚠️ **Deep Review (2026-06-04) — green gates ≠ no bugs.** A first-hand-verified review (executing the built `dist`,
> running all 14 gates, reading source) found **46 distinct issues, 6 Critical**, that the green gates do **not** catch.
> The "reviewer loop closed with no open findings" / "all gates green" statements below are about the _gates_, not about
> _correctness_ — do not read them as "no bugs". Start at [`.agent/report/initial-review/00-executive-summary.md`](../report/initial-review/00-executive-summary.md).
>
> - **Criticals (reproduced):** C1 build emits no `.d.ts` + `./parsers/zod` export target missing (published types + the
>   README Zod import are broken); C2 operation security `A AND B` → `A OR B`; C3 component-name sanitisation breaks
>   `$ref` round-trips; C4 `serializeIR→deserializeIR` throws on empty `properties` (root cause: four divergent
>   `isRecord`); C5 Zod parser silent content drops (`errors:[]`); C6 Zod 2020-12 keyword refinements are no-ops/incorrect.
> - **Decision:** [ADR-047](../../docs/architectural_decision_records/ADR-047-zod-2020-12-keyword-emission-strategy.md)
>   (draft) governs the C6 fix (semantic-or-fail-fast).
> - **Remediation backlog:** [`.agent/plans/remediation/`](../plans/remediation/) — 7 atomic plans; promote **one** into
>   `active/` at a time. `01-packaging-and-types-integrity` is highest-leverage/lowest-risk (fixes the shipped C1 break).
> - **Corrections:** 9 completed plans + `roadmap.md` carry dated ⚠️ banners (P1-P9); C6 disclosed in
>   `docs/architecture/zod-round-trip-limitations.md`; 11 redundant session-3.3 stubs deleted.
> - **Committed on branch `docs/initial-deep-review`** (not merged to `main`). A link-aware bulk-archive of settled
>   `current/complete/` plans is **sequenced into transplant Phase 9** (named slot, owner 2026-06-09).
> - **Governing rule (user, 2026-06-04):** where code, proofs, and docs disagree, normalise to the **strictest** of the three.
>
> **The remediation backlog is the NOW work (owner, 2026-06-09)** — plans 01→07 in order, starting with
> `01-packaging-and-types-integrity` (the shipped C1 break); the transplant and the product feature slice hold
> sequence positions 2 and 3.

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**Active workstream (PRIMARY, sequence position 1):** [remediation backlog](../plans/remediation/) plans 01→07 — branch `fix/remediation-01-packaging-and-types` off `docs/initial-deep-review`.
**Sequence position 2:** [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md) Phases 5–9 — branch `feat/transplant-engraph-practice`.
**Sequence position 3:** [Explicit Additional Properties Support](../plans/current/paused/explicit-additional-properties-support.md)

**Current closure record:** [ePerusteet Real-Spec Validation](../plans/current/complete/eperusteet-real-spec-validation.md)

**Companion closure record:** [OAS 3.2 Full Feature Support](../plans/current/complete/oas-3.2-full-feature-support.md) (completed Saturday, 11 April 2026)

The OAS 3.2 parent arc is now complete. Phase A2 closed on Friday, 10 April 2026. The MCP no-params follow-up, Phases B, C, D, and E, Husky local-workflow alignment, and generated-suite stability all closed on Saturday, 11 April 2026. Repo-root `pnpm check` is green, `pnpm check:ci` remains green from Saturday, 11 April 2026, and the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026 as the direct predecessor to the newly promoted explicit-additional-properties support plan.

### Verified Session Truth

- Phase A2 closed on Friday, 10 April 2026 after the AP4 dependency-exit sweep completed with a nested raw OpenAPI input seam, restored IR/media-type fidelity, strengthened dependency-exit guards, and closed the reviewer loop with no open findings
- the full repo-root gate chain was green on Friday, 10 April 2026, along with `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps
- the MCP no-params follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected by `isMcpToolInput()`, and the affected snapshot proofs are green
- Phase B closed on Saturday, 11 April 2026: native OpenAPI 3.2 `query` survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, and hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof
- Phase C closed on Saturday, 11 April 2026: `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, valid templated paths survive the shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, and the reviewer loop closed with no open findings
- Phase D closed on Saturday, 11 April 2026: Example Object `dataValue` / `serializedValue` now have explicit parser/writer/round-trip proof across component, parameter, response-header, and media-type carriers, `CastrParameter.examples` preserves full Example Object/ref shapes honestly, singular parameter example derivation falls back to `examples.default.dataValue` but never `serializedValue` alone, and repo-root `pnpm check` was green on the close-out sweep
- Husky is now active locally: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full repo-root `pnpm check:ci` sweep was green on Saturday, 11 April 2026
- the generated-suite temp-directory race was reproduced and closed on Saturday, 11 April 2026: the temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green again, and repo-root `pnpm check` is green again
- Phase E closed on Saturday, 11 April 2026: native OpenAPI 3.2 `itemSchema` and `additionalOperations` now survive parser -> IR -> OpenAPI writer -> shared load boundary reparse; `IRMediaType.itemSchema`, `CastrDocument.additionalOperations`, `CastrAdditionalOperation`, and `allOperations(document)` are landed; endpoint/MCP/TypeScript surfaces now expose custom verbs from `additionalOperations`; endpoint/MCP/TypeScript fail fast on reachable `itemSchema`; and the late reviewer follow-up fixes also closed x-ext media-type component identity/writer emission, parameter `content` traversal, IR media-type ref narrowing, custom-method inline request-body naming collisions, and lowercase reserved-method validation for programmatic `additionalOperations`
- repo-root `pnpm check` is green on Saturday, 11 April 2026 after the final Phase E close-out rerun, and `pnpm check:ci` remains green from Saturday, 11 April 2026
- for aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly
- the reviewer loop is closed with no open findings across `code-reviewer`, `test-reviewer`, `openapi-expert`, and `type-reviewer`
- the ePerusteet real-spec validation slice closed on Thursday, 16 April 2026: `lib/tests-fixtures/openapi-samples/real-world/eperusteet-ext.json` is committed, the shared load boundary accepts and canonicalises it, and the reproduction exposed that current strict-object policy rejects explicit schema-valued `additionalProperties` at IR-build / generated seams
- on Thursday, 16 April 2026, user clarification established the intended product boundary: Castr must accept and emit explicit `additionalProperties`, but must never invent them from input that did not declare them
- the plan-of-record sequence (owner, 2026-06-09) is: (1) the remediation backlog 01→07 (NOW), (2) the [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md) Phases 5–9, (3) [explicit-additional-properties-support.md](../plans/current/paused/explicit-additional-properties-support.md) — sequenced, never parked

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then the plan-of-record sequence in [roadmap.md](../plans/roadmap.md).
2. **Sequence position 1 (NOW):** execute the [remediation backlog](../plans/remediation/) plans 01→07 in order on `fix/remediation-*` branches off `docs/initial-deep-review`, PR'd to `main` independently; proof-first TDD; each plan atomic and gated.
3. **Sequence position 2:** resume the transplant Phases 5–9 on `feat/transplant-engraph-practice` from the tracker; each phase ends green (`pnpm check`) + reference-closure-clean + tagged.
4. If a user reports a fresh gate or runtime regression in product code, reproduce it immediately and treat that report as active session truth.
5. **Sequence position 3:** the product feature slice (explicit-additional-properties-support): admit explicit source `additionalProperties` honestly into IR/outputs while never inventing them from absent input.
6. Use [eperusteet-real-spec-validation.md](../plans/current/complete/eperusteet-real-spec-validation.md), [oas-3.2-full-feature-support.md](../plans/current/complete/oas-3.2-full-feature-support.md), and [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) only for predecessor context.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the final Phase E close-out rerun, and repo-root `pnpm check:ci` remains green from **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky still formats staged files on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but hook runs do not replace explicit aggregate reruns when closing work.

⚠️ **Caveat (2026-06-04):** green gates do **not** mean "no bugs". The deep review reproduced 6 Critical defects the gates do not cover (packaging/types, security AND→OR, `$ref` round-trips, IR round-trip throw, Zod parser/writer losses). See the **Deep Review** callout in _Where We Are_ and [`.agent/report/initial-review/`](../report/initial-review/).

---

## Next Session Start Statement

**@engraph/castr — next session start.** The **plan-of-record sequence (owner, 2026-06-09)** is: **(1) NOW — the
deep-review remediation backlog** (`.agent/plans/remediation/` plans 01→07 in order, on `fix/remediation-*` branches
off `docs/initial-deep-review` — that branch holds the report/plans/ADR-047, NOT `main` — each PR'd to `main`
independently; 01-packaging is in flight); **(2) the Practice transplant Phases 5–9** (branch
`feat/transplant-engraph-practice`, resume from the tracker); **(3) the product feature slice**
(`current/paused/explicit-additional-properties-support.md`). **Nothing is parked, ever** (owner: "all issues MUST
be fixed, mostly now; sequencing in the current plan is acceptable; an undefined 'later' is never") — a 2026-06-05
record claiming the owner parked the product slice was a fabricated attribution, repudiated and corrected
2026-06-09. A fresh reproduced product regression pre-empts the sequence.

**Phases 0–4 are COMPLETE and green.** Phase 4 (tag `transplant/phase-4`, 2026-06-09): **80 Oak rules** (held
`ad649710` forms) + castr's 5 = **85 canonical rules** + root `RULES_INDEX.md` (85 rows, index↔disk verified); every
body read firsthand and reconciled per-surface; `use-result-pattern` dropped (contradicts `principles.md`
fail-fast — the 9th DON'T-BRING); collision-range Oak-ADR cites disambiguated; `pnpm agent-tools:*` root aliases
wired; five new upstream Oak bugs flagged for back-flow. Phase 3 (tag `transplant/phase-3`): Oak's 18 skills brought + localised, castr grounding folded into the start-right shared core, all `jc-*`/`distillation`/`napkin`/`castr-start-right` retired, blocking `skills:check`. Phase 2 (tag `transplant/phase-2`, commit `55a6788`): the 340-file `@engraph/agent-tools` package + hook policy + **LIVE Claude PreToolUse guards** + the §6 `validate-drift` validator. Reconstruct with `git log --oneline transplant/phase-0-baseline..HEAD`.

**⚠️ LIVE NOW — your tool calls are guarded.** `.claude/settings.json` routes Bash/Edit/Write through `run-pretooluse-guard.mjs`: dangerous-git patterns and PDR-044 content fingerprints are **denied**; an unbuilt `dist` fails **OPEN** (warns, never bricks). A blocked call is the policy in `.agent/hooks/policy.json`, not a bug. agent-tools `test` is **informational** (filtered out of the blocking gate via `--filter=!@engraph/agent-tools`; 13/885 failures, all P6/P8 content); `repo-validators:check` carries **5 green BLOCKING validators** (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`/`stale-script`), 3 sequenced at their phases (`collaboration-state`→P8, `subagents`→P6, Oak `portability`→P7). **The sequenced validators' "crashes" are NOT bugs — do NOT try to "fix"/silence them: they hard-fail by design on absent infrastructure (Oak tests assert it), truthfully reporting castr's P6/P8 infra isn't installed yet; a 2026-06-07 trial fix was reverted (Oak clean at `ad649710`).** (Note: the guards live on the transplant branch; remediation branches off `docs/initial-deep-review` predate them.) **Gotcha (verified firsthand — it blocked my own command):** the Bash guard substring-matches the WHOLE command, so a blocked pattern anywhere in the command string — including an `echo`/test payload or a dangerous-command literal quoted inside a commit message — is denied. Keep such literals out of commands; when a commit message must discuss them, write it to a file and use `git commit -F <file>`, never `-m`. The guards also activate **mid-session** when `.claude/settings.json` changes, so your current session may already be guarded.

**Read first, in order:** `.agent/directives/AGENT.md` → `metacognition.md` → this prompt (§Practice Transplant) → `.agent/plans/active/oak-practice-transplant.md` (execution contract — note **owner-locked scope §6**) → `.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` → the `.agent/memory/napkin.md` latest entries (`2026-06-07` + `2026-06-05`). Cross-session memory may not load — **treat the in-repo surfaces as authoritative**.

**Next executable steps (in order, owner-directed):** Steps 0–2 and **Phase 4 ✅ done** (see the tracker's per-phase
blocks). **NEXT: Phase 5 — Directives (7 generic, additive):** `agent-collaboration`, `continuity-practice`,
`definition-of-delivery`, `operationalisation-contract`, `orientation`, `tdd-as-design`, `user-collaboration`; sacred
castr directives untouched; `schema-first-execution.md` stays DON'T-BRING; the Phase-4 rules' P5 directive
placeholders resolve here; reconcile castr's `tdd.md` rule against the arriving `tdd-as-design`. **Carry the Phase-4
lessons:** classification reads lie, bodies do not (a KEEP rule contradicted principles doctrine); transplanted
enforcement data is contract-tested (policy.json ↔ its tests move in lockstep — change both together);
directive-section cites in Oak surfaces are claims to verify against castr's actual headings; protection labels mean
edit-with-rigour, never park-the-defect (owner, 2026-06-09: known issues are always blocking — the
`principles.md:1729` finding was fixed same-day and `stale-script` flipped blocking). **Oak baseline (2026-06-10):
PINNED on the dedicated branch `practice/transplant-to-castr` @ `4470266`** — supersedes the `ad649710` hold and
absorbs the previously scheduled pre-P9 delta-sync; Phase-5 grounding re-checks the `.agent/rules/` delta
`ad649710`→pin (known: `precedence-is-not-approval` + PDR-091) and folds new KEEPs there.

**Standing disciplines (active from message 1):**

- **Verify load-bearing claims firsthand** against source; all agent/tool output is a candidate lead, never relayed second-hand; a named tool/command is a claim until verified (the `pned` phantom).
- **Record load-bearing decisions in the in-repo execution contract, never memory-only.**
- **Session-close continuity discipline** (the owner will keep asking; §6 makes it structural in the transplanted vehicles `session-handoff` / `consolidate-docs` / `consolidate-until-done`): exhaustive durable state-recording + an adversarial _"what would be lost if context vanished?"_ review + preservation/graduation of reflection insights. **The record is the commit + the permanent doc — not a ledger or closeout narrative** (reconciled with `permanent-doc-is-the-consolidation-record`; see plan §6).
- **PDRs are portable and never repo-specific; anything repo-specific goes in a castr ADR** — author a castr ADR only if the portable PDR is insufficient (PDR-079).
- **Nothing is sacred — protection is engineering discipline, not dogma (owner, 2026-06-09):** `principles.md` and the PRESERVE set are edited with firsthand verification and owner-visible rationale, never clobbered with Oak content — and **known issues in them are blocking and get fixed like any other defect**; `.agent` is NOT prettier-ignored (`pnpm format` new docs each phase); **roll forward only** (revert; never `reset --hard`/force-push); each phase = one atomic commit + `transplant/phase-N` tag, green-gated + reference-closure-clean.
- **No deadline pressure — excellence over expediency, always** (owner, emphatic 2026-06-07): speed is not a goal; architectural correctness is. The transplant is an accepted strategic investment to accelerate castr — **the premise is settled; do not re-litigate whether it is worth doing.**
- **Less ceremony — the commit plus the permanent doc ARE the record.** No handoff-correction churn, disposition ledgers, before/after counts, or closeout narratives; home substance in its permanent doc and stop (`permanent-doc-is-the-consolidation-record`, Phase 4).
- **Smoke-testing the transplanted substrate is a later phase** (owner, 2026-06-07) — for now bring surfaces over; prove in-use afterwards.

**Resolved owner decisions:** the transplant PR to `main` carries its 2 deep-review commits (do not merge `docs/initial-deep-review` separately); Oak's `consolidate-docs` replaces castr's `jc-consolidate-docs`; pulling any one skill pulls its dependency closure.

**First action:** read the surfaces above, then resume **sequence position 1 — the remediation backlog** at its
current plan (01-packaging in flight; on completion promote the next plan in order). The transplant (Phases 5–9;
ground Phase 5 — Directives — with the owner first) resumes at sequence position 2 from the tracker; Oak is held at
`ad649710` (drift noted; final delta-sync scheduled pre-Phase-9). Carry the per-surface reconciliation lesson: Oak
surfaces embed host-product specifics; bodies must be read, not classified.
