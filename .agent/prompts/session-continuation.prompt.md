# Session Continuation: @engraph/castr

**Last updated:** 2026-06-09

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Where We Are

> 🔀 **PRIMARY ACTIVE PLAN (2026-06-05): Oak → castr Practice transplant.** The primary active workstream is now the
> wholesale Practice transplant — [`oak-practice-transplant.md`](../plans/active/oak-practice-transplant.md) (phase
> tracker: [`../plans/transplant/README.md`](../plans/transplant/README.md)), on branch
> `feat/transplant-engraph-practice` (off `docs/initial-deep-review`). The product slice
> `explicit-additional-properties-support.md` is **parked-in-place non-primary context** and resumes once the transplant
> completes. The deep-review remediation backlog is untouched. Everything below remains true product context.

### Practice Transplant — resume here (primary)

**Goal:** wholesale-transplant Oak's Practice estate into castr (localise `@oaknational`→`@engraph`), preserving castr's
product doctrine/ADRs/report/remediation. **Branch:** `feat/transplant-engraph-practice` off `docs/initial-deep-review`
(baseline `transplant/phase-0-baseline`). **Read first:** `.agent/plans/active/oak-practice-transplant.md` (contract) →
`.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` (the full
inventory/dispositions) → the napkin's latest entries (`2026-06-09` + `2026-06-07`: Phase-4 lessons, firsthand corrections, build gotchas, the validator non-bug reframe).

- **Status:** Phases 0–4 ✅. **Phase 4 (2026-06-09, tag `transplant/phase-4`)** — 80 Oak rules (ad649710) + castr's 5
  = 85 canonical rules + root `RULES_INDEX.md` (85 rows, index↔disk verified); per-rule firsthand reconciliation;
  `use-result-pattern` dropped (contradicts SACRED fail-fast — 9th DON'T-BRING); 7 collision-range Oak-ADR cites
  disambiguated cross-host; `pnpm agent-tools:*` aliases wired. Phase 3 — skills (18 brought + localised; castr
  grounding folded into the start-right core; `jc-*`/`distillation`/`napkin`/`castr-start-right` retired; blocking
  `skills:check`); tag `transplant/phase-3`. Phase 2 = `@engraph/agent-tools` (340 files) + hook policy + LIVE
  PreToolUse guards + §6 `validate-drift`; tag `transplant/phase-2` (commit `55a6788`).
  Commits: see `git log --oneline transplant/phase-1..HEAD` — Phase 2 = `55a6788`; then handoff + diagnosis-correction commits. Oak advanced `2c85bc01`→`ad649710`; **Step 0 (2026-06-07) reviewed the whole estate (see the tracker); Oak is held at `ad649710` as the working baseline.**
- **LIVE NOW (operational):** Claude PreToolUse guards are wired (`.claude/settings.json`) — tool calls are guarded
  (dangerous-git + PDR-044 content fingerprints denied; unbuilt `dist` fails OPEN, never bricks). agent-tools `test` is
  INFORMATIONAL (`--filter=!@engraph/agent-tools`; **13**/885 failures are later-phase content — the RULES_INDEX slice
  went green at P4). `repo-validators:check` = 4 green validators only
  (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`); 4 deferred (`stale-script` blocked on
  ONE finding inside SACRED `principles.md:1729` — owner action-moment at P5; `collaboration-state`→P8,
  `subagents`→P6, Oak `portability`→P7). **policy.json is contract-tested** (hook-policy integration test pins its
  citation strings — data↔test lockstep, change neither alone).
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
  `practice-fitness` informational-first never red-gates the SACRED `principles.md`; transplanted surfaces'
  section-cites and classifications are claims — read bodies firsthand (the P3 skills lesson, re-proven at P4 where a
  KEEP-classed rule contradicted SACRED doctrine); the 36 Oak-ADR cites are closed (P4) — the 7 collision-range ones
  carry explicit cross-host disambiguation.
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
>   `current/complete/` plans is **deferred** (disposition in report §11).
> - **Governing rule (user, 2026-06-04):** where code, proofs, and docs disagree, normalise to the **strictest** of the three.
>
> The product primary (explicit-additional-properties-support) is now **parked-in-place** behind the Practice
> transplant; when product work resumes you may instead promote `remediation/01-packaging-and-types-integrity` to fix
> the shipped C1 break first.

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**Active workstream (PRIMARY):** [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md) — branch `feat/transplant-engraph-practice`.
**Parked-in-place (non-primary):** [Explicit Additional Properties Support](../plans/active/explicit-additional-properties-support.md)

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
- the current primary active plan is the [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md); [explicit-additional-properties-support.md](../plans/active/explicit-additional-properties-support.md) is parked-in-place and resumes after the transplant closes

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then the primary plan [oak-practice-transplant.md](../plans/active/oak-practice-transplant.md) and its phase tracker [transplant/README.md](../plans/transplant/README.md).
2. Execute the transplant phase-by-phase on `feat/transplant-engraph-practice`; each phase ends green (`pnpm check`) + reference-closure-clean + tagged.
3. If a user reports a fresh gate or runtime regression in product code, reproduce it immediately and treat that report as active session truth.
4. The parked product slice (explicit-additional-properties-support): admit explicit source `additionalProperties` honestly into IR/outputs while never inventing them from absent input — resume only after the transplant closes.
5. Use [eperusteet-real-spec-validation.md](../plans/current/complete/eperusteet-real-spec-validation.md), [oas-3.2-full-feature-support.md](../plans/current/complete/oas-3.2-full-feature-support.md), and [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) only for predecessor context.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the final Phase E close-out rerun, and repo-root `pnpm check:ci` remains green from **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky still formats staged files on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but hook runs do not replace explicit aggregate reruns when closing work.

⚠️ **Caveat (2026-06-04):** green gates do **not** mean "no bugs". The deep review reproduced 6 Critical defects the gates do not cover (packaging/types, security AND→OR, `$ref` round-trips, IR round-trip throw, Zod parser/writer losses). See the **Deep Review** callout in _Where We Are_ and [`.agent/report/initial-review/`](../report/initial-review/).

---

## Next Session Start Statement

**@engraph/castr — next session start.** The **primary active workstream** is the Oak → castr Practice transplant, on branch `feat/transplant-engraph-practice` (off `docs/initial-deep-review`, which holds the PRESERVE set — NOT `main`; baseline `transplant/phase-0-baseline`). The product slice `explicit-additional-properties-support.md` and the `remediation/` backlog stay **parked-in-place** — resume only after the transplant closes or on a fresh reproduced regression.

**Phases 0–4 are COMPLETE and green.** Phase 4 (tag `transplant/phase-4`, 2026-06-09): **80 Oak rules** (held
`ad649710` forms) + castr's 5 = **85 canonical rules** + root `RULES_INDEX.md` (85 rows, index↔disk verified); every
body read firsthand and reconciled per-surface; `use-result-pattern` dropped (contradicts SACRED `principles.md`
fail-fast — the 9th DON'T-BRING); collision-range Oak-ADR cites disambiguated; `pnpm agent-tools:*` root aliases
wired; five new upstream Oak bugs flagged for back-flow. Phase 3 (tag `transplant/phase-3`): Oak's 18 skills brought + localised, castr grounding folded into the start-right shared core, all `jc-*`/`distillation`/`napkin`/`castr-start-right` retired, blocking `skills:check`. Phase 2 (tag `transplant/phase-2`, commit `55a6788`): the 340-file `@engraph/agent-tools` package + hook policy + **LIVE Claude PreToolUse guards** + the §6 `validate-drift` validator. Reconstruct with `git log --oneline transplant/phase-0-baseline..HEAD`.

**⚠️ LIVE NOW — your tool calls are guarded.** `.claude/settings.json` routes Bash/Edit/Write through `run-pretooluse-guard.mjs`: dangerous-git patterns and PDR-044 content fingerprints are **denied**; an unbuilt `dist` fails **OPEN** (warns, never bricks). A blocked call is the policy in `.agent/hooks/policy.json`, not a bug. agent-tools `test` is **informational** (filtered out of the blocking gate via `--filter=!@engraph/agent-tools`); `repo-validators:check` carries only the 4 green validators (the other 4 deferred to P4/P6/P7/P8). **The deferred validators' "crashes" are NOT bugs — do NOT try to "fix"/silence them: they hard-fail by design on absent infrastructure (Oak tests assert it), truthfully reporting castr's P6/P8 infra isn't installed yet; a 2026-06-07 trial fix was reverted (Oak clean at `ad649710`).** **Gotcha (verified firsthand — it blocked my own command):** the Bash guard substring-matches the WHOLE command, so a blocked pattern anywhere in the command string — including an `echo`/test payload or a dangerous-command literal quoted inside a commit message — is denied. Keep such literals out of commands; when a commit message must discuss them, write it to a file and use `git commit -F <file>`, never `-m`. The guards also activate **mid-session** when `.claude/settings.json` changes, so your current session may already be guarded.

**Read first, in order:** `.agent/directives/AGENT.md` → `metacognition.md` → this prompt (§Practice Transplant) → `.agent/plans/active/oak-practice-transplant.md` (execution contract — note **owner-locked scope §6**) → `.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` → the `.agent/memory/napkin.md` latest entries (`2026-06-07` + `2026-06-05`). Cross-session memory may not load — **treat the in-repo surfaces as authoritative**.

**Next executable steps (in order, owner-directed):** Steps 0–2 and **Phase 4 ✅ done** (see the tracker's per-phase
blocks). **NEXT: Phase 5 — Directives (7 generic, additive):** `agent-collaboration`, `continuity-practice`,
`definition-of-delivery`, `operationalisation-contract`, `orientation`, `tdd-as-design`, `user-collaboration`; sacred
castr directives untouched; `schema-first-execution.md` stays DON'T-BRING; the Phase-4 rules' P5 directive
placeholders resolve here; reconcile castr's `tdd.md` rule against the arriving `tdd-as-design`; **owner
action-moment carried into P5:** SACRED `principles.md:1729` invokes non-existent `scripts/validate-jsdoc-examples.ts`
(the `stale-script` validator's only finding — it stays deferred until the owner-approved fix). **Carry the Phase-4
lessons:** classification reads lie, bodies do not (a KEEP rule contradicted SACRED doctrine); transplanted
enforcement data is contract-tested (policy.json ↔ its integration test move in lockstep — change neither alone);
directive-section cites in Oak surfaces are claims to verify against castr's actual headings. \*\*Oak baseline: held at
`ad649710`; drift noted 2026-06-09 (HEAD `5779ed20`, 17 commits, rules delta additive-only — `precedence-is-not-approval`

- PDR-091); a single Step-0-style delta-sync is scheduled immediately before Phase 9\*\* — no per-phase re-scan; earlier
  re-scan only on owner signal.

**Standing disciplines (active from message 1):**

- **Verify load-bearing claims firsthand** against source; all agent/tool output is a candidate lead, never relayed second-hand; a named tool/command is a claim until verified (the `pned` phantom).
- **Record load-bearing decisions in the in-repo execution contract, never memory-only.**
- **Session-close continuity discipline** (the owner will keep asking; §6 makes it structural in the transplanted vehicles `session-handoff` / `consolidate-docs` / `consolidate-until-done`): exhaustive durable state-recording + an adversarial _"what would be lost if context vanished?"_ review + preservation/graduation of reflection insights. **The record is the commit + the permanent doc — not a ledger or closeout narrative** (reconciled with `permanent-doc-is-the-consolidation-record`; see plan §6).
- **PDRs are portable and never repo-specific; anything repo-specific goes in a castr ADR** — author a castr ADR only if the portable PDR is insufficient (PDR-079).
- **`principles.md` is SACRED** (no edit without explicit owner approval); never clobber the PRESERVE set; `.agent` is NOT prettier-ignored (`pnpm format` new docs each phase); **roll forward only** (revert; never `reset --hard`/force-push); each phase = one atomic commit + `transplant/phase-N` tag, green-gated + reference-closure-clean.
- **No deadline pressure — excellence over expediency, always** (owner, emphatic 2026-06-07): speed is not a goal; architectural correctness is. The transplant is an accepted strategic investment to accelerate castr — **the premise is settled; do not re-litigate whether it is worth doing.**
- **Less ceremony — the commit plus the permanent doc ARE the record.** No handoff-correction churn, disposition ledgers, before/after counts, or closeout narratives; home substance in its permanent doc and stop (`permanent-doc-is-the-consolidation-record`, Phase 4).
- **Smoke-testing the transplanted substrate is a later phase** (owner, 2026-06-07) — for now bring surfaces over; prove in-use afterwards.

**Resolved owner decisions:** the transplant PR to `main` carries its 2 deep-review commits (do not merge `docs/initial-deep-review` separately); Oak's `consolidate-docs` replaces castr's `jc-consolidate-docs`; pulling any one skill pulls its dependency closure.

**First action:** read the surfaces above. Phases 0–4 are done and Oak is held at `ad649710` (drift noted; final
delta-sync scheduled pre-Phase-9); ground **Phase 5** (Directives) with the owner, then execute — it carries one
named owner action-moment (the SACRED `principles.md:1729` stale invocation). Carry the per-surface reconciliation
lesson: Oak surfaces embed host-product specifics; bodies must be read, not classified.
