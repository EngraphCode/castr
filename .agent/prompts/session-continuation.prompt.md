# Session Continuation: @engraph/castr

**Last updated:** 2026-06-05

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
inventory/dispositions) → the napkin `2026-06-05` entry (session insights + firsthand corrections + build gotchas).

- **Status:** Phase 0 ✅; **Phase 1 ✅** — 1a (91 PDRs + `practice-verification.md`) and 1b (2026-06-05: Core generation
  merged to Oak's current trinity + entry points, `provenance.yml` history union, `CHANGELOG.md` merge,
  `.agent/practice-context/` retired) both green; tag `transplant/phase-1`. Commits:
  `git log --oneline transplant/phase-0-baseline..HEAD`.
- **Next = Phase 2:** `@engraph/agent-tools` + hook policy — design in
  [`../plans/transplant/02-agent-tools-build-design.md`](../plans/transplant/02-agent-tools-build-design.md),
  **reconciled to Oak's 2026-06-05 post-pull state in `8abdbb7`** (tsx `postinstall` bootstrap not turbo; dist-based
  fail-closed PreToolUse guards; seven validators; `tsx` devDep + dep majors). Standing: Oak moves — **re-read
  `agent-tools/` fresh at execution** even though the design is now current.
- **Standing gotchas (firsthand-verified):** `.agent` is NOT prettier-ignored → `pnpm format` new docs every phase (and
  `check:ci`/pre-push does not run `fix`); agent-tools `src/` has 0 `@oaknational` imports (tiny localisation surface);
  `practice-fitness` informational-first never red-gates the SACRED `principles.md`; Phase 2 commit must include the
  regenerated `pnpm-lock.yaml`; 36 Oak-ADR cites in Oak rules to reference-close at Phase 4 (re-point to PDRs).
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

**Phase 1 is COMPLETE and green**, tagged `transplant/phase-1`: 1a (91 PDRs + `practice-verification.md`) and 1b (Core generation converged to Oak's current trinity + entry points, `provenance.yml` branch-history union, `CHANGELOG.md` merge, `.agent/practice-context/` retired). Reconstruct with `git log --oneline transplant/phase-0-baseline..HEAD`.

**Read first, in order:** `.agent/directives/AGENT.md` → `metacognition.md` → this prompt (§Practice Transplant) → `.agent/plans/active/oak-practice-transplant.md` (execution contract — note **owner-locked scope §6**) → `.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` → the `.agent/memory/napkin.md` `2026-06-05` entry. Cross-session memory may not load — **treat the in-repo surfaces as authoritative**.

**Next executable step = Phase 2** (`@engraph/agent-tools` + hook policy). Design: `.agent/plans/transplant/02-agent-tools-build-design.md`, reconciled to Oak's 2026-06-05 state (commit `8abdbb7`). **Oak is a moving target — re-read Oak's `agent-tools/` fresh before relying on any specific** (postinstall is a `tsx` bootstrap not turbo; dist-based fail-closed PreToolUse guards; seven validators).

**Standing disciplines (active from message 1):**

- **Verify load-bearing claims firsthand** against source; all agent/tool output is a candidate lead, never relayed second-hand; a named tool/command is a claim until verified (the `pned` phantom).
- **Record load-bearing decisions in the in-repo execution contract, never memory-only.**
- **Session-close continuity discipline** (the owner will keep asking; §6 makes it structural in the transplanted vehicles `session-handoff` / `consolidate-docs` / `consolidate-until-done`): exhaustive durable state-recording + an adversarial _"what would be lost if context vanished?"_ review + preservation/graduation of reflection insights.
- **PDRs are portable and never repo-specific; anything repo-specific goes in a castr ADR** — author a castr ADR only if the portable PDR is insufficient (PDR-079).
- **`principles.md` is SACRED** (no edit without explicit owner approval); never clobber the PRESERVE set; `.agent` is NOT prettier-ignored (`pnpm format` new docs each phase); **roll forward only** (revert; never `reset --hard`/force-push); each phase = one atomic commit + `transplant/phase-N` tag, green-gated + reference-closure-clean.

**Resolved owner decisions:** the transplant PR to `main` carries its 2 deep-review commits (do not merge `docs/initial-deep-review` separately); Oak's `consolidate-docs` replaces castr's `jc-consolidate-docs`; pulling any one skill pulls its dependency closure.

**First action:** read the surfaces above, re-verify Oak's `agent-tools/` current state, then ground Phase 2 with the owner before executing.
