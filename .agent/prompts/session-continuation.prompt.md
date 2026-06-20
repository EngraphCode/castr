# Session Continuation: @engraph/castr

**Last updated:** 2026-06-10

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Current state (2026-06-15 close) — read this first

> **2026-06-20 close UPDATE (supersedes the stale bullets below where they conflict):** Phases 6 **and 7** are ✅
> COMPLETE + tagged (`transplant/phase-6` `a63aee3`; `transplant/phase-7` 2026-06-20). **D1 lint is ✅ RESOLVED**
> (TS-version skew, single-TS override; rules back at `error`) — ignore the "D1 UNCONFIRMED / warn→error pending"
> turnkey step below. **Phase 7 landed:** native adapter generator (`agent-tools/src/agent-adapter-generate/`, TDD) →
> `.cursor/agents`+`.claude/agents` (18 each) + `.cursor/rules/*.mdc` (87) + 174 `.claude`/`.agents` rule wrappers;
> `portability`+`subagents` gates flipped blocking-green; bespoke `scripts/validate-portability.mjs` retired; full
> `pnpm check:ci` green. **Phase 8 ✅ COMPLETE + TAGGED `transplant/phase-8` (`8d62197`, 2026-06-20).** The final
> acceptance bar — "records carry a genuinely concurrent stream" — was satisfied by the **first director-led concurrent
> stream** (2026-06-20): Director Briny Cresting Sextant (fdb75b) + 2 implementers Stratospheric Wheeling Horizon
> (4aeee2, Lane A) and Secret Watching Candle (328f4f, Lane B) — each with a distinct PDR-027 identity, an armed comms
> watcher, a live claim, a ≤4-min heartbeat, and comms; the stream exercised claims (open→heartbeat→close), directed +
> broadcast comms, Director-serialised review with routed reviewer sub-agents adjudicated firsthand, a live
> identity-table write-race, and a measured watcher-idle-coalescing failure (F6/N10, now team doctrine). `pnpm check`
> green at the tag; reference-closure clean for scope. **The same stream landed the first split-PR-shaped delivery — arc
> D3/D2/D4 on dedicated branches (pushed): `feat/d3-ci-oak-standard`@`c7f819e` (CI to Oak standard: check:ci gate + 6
> SHA-pinned actions + dead publish.yml removed), `feat/d2-node-version-single-source`@`41b24f8` (.nvmrc single-source;
> off D3 — coordinate-dependent on ci.yml), `feat/d4-archive-provenance-backbring`@`0a75231` (archive+provenance
> subsystems, `@oaknational/result`→fail-fast).** Not merged (split-PR merge to main = owner's next move).
> **First-run collaboration-setup friction harvest** (owner-directed "record all"): F1–F12 + N1–N12 in
> `.agent/memory/active/napkin.md`; headline **F6/N10** (an armed Monitor watcher silently coalesces events during idle
> windows → an agent goes dark despite a correct watcher; cure = catch-up-sweep on every wake, now team doctrine +
> user-memory). **LIVE NEXT SLICES (per the thread record's lanes):** transplant **Phase 9** (Oak back-flow + PDR-currency
> sync); the **first-run friction-fix tranche** (the agent-tools/doctrine fixes the friction harvest names — high-leverage
> before the next team session); the split-PR **delivery** (D3-gated). **Open owner decisions:** statusline wiring (Q-003),
> release-automation strategy (Q-004). **Owner re-order (2026-06-19): finish the FULL Practice transplant first;
> remediation 02–07 = a named position AFTER (not parked); not in a rush to merge.** All "currently Phase 6/7" language
> below is stale → Phases 6/7/8 complete + tagged.

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
- **D1 lint — ✅ RESOLVED (2026-06-19), both rules back at `error`.** `sonarjs/function-return-type` (S3800) +
  `sonarjs/in-operator-type-error` (S3785) were warn-downgraded 2026-06-15 (`3b3f0d9`; 126 violations). Root cause,
  measured firsthand: a **TypeScript-version skew** — `eslint-plugin-sonarjs@4.0.3` resolved its bundled TS 5.9.3 while
  the parser built Type objects with the workspace's 6.0.3, and the two releases renumber `ts.TypeFlags`, so the rules
  masked the wrong bits and mis-fired on type-safe code (not a code smell, not a rule defect — an environment skew).
  **Fixed at root** by pinning a single workspace TypeScript (`pnpm-workspace.yaml` `overrides: typescript: 6.0.3`);
  under aligned TS both rules flag **0** and are restored to `error`. Full root-cause record:
  [`../plans/transplant/d1-sonarjs-findings.md` §0](../plans/transplant/d1-sonarjs-findings.md).
- **knip fixed (commits `c622998`, `1363181`):** the lint fix unmasked two pre-existing knip failures, both fixed —
  6 dead char-test exports removed; `commitlint` installed + wired (`@commitlint/cli` + `config-conventional` +
  root `commitlint.config.mjs`), which also made the agent-tools `check-commit-message` validator operational (it had
  been a phantom — no `commitlint` was installed). No enforcing `commit-msg` hook (owner).
- **One deep enhancement (owner):** bringing over the ENTIRE Practice / agentic-engineering framework / agent-tools /
  skill+rule+subagent+hook definitions AND fixing castr's known issues are the **same** goal, not competing priorities
  (owner, 2026-06-17). Components — all required, all on the single branch `feat/transplant-engraph-practice`, none
  parked: (a) Practice transplant Phases 6–9 (0–5 done); (b) engineering-infrastructure arc D1–D4 (tracker
  §Deep-enhancement arc); (c) deep-review remediation backlog 02–07 (01 complete + merged in — the 6 shipped Criticals
  must be fixed); (d) `explicit-additional-properties-support`. The owner names the next slice — **currently Phase 6**.
  The 2026-06-09 "sequence positions 1/2/3" were an ordering guide, never a gate blocking one component behind another.
- **Owner decision 1 — Node:** 24 everywhere; stable-LTS always; advance to 26 only once GitHub _and_ Vercel support
  it. Config executed (`engines: 24.x`, single-Node-24 `ci.yml`); single-source `.nvmrc` and ADR-048 remain as D2.
- **Owner decision 2 — lint:** no rule ever off; in-flight rules MAY be `warn` transitionally; DoD requires all back
  to `error` before the deep enhancement is complete (`DEFINITION_OF_DONE.md` §Transitional gate states; D1). NOT disabling.
- **Owner decision 3 — scope:** the deep enhancement is broader than Phases 0–9 (CI to the Oak SHA-pinned-actions
  standard, plus quality-gate and Practice parity; D1–D4). "Phases done" is not "deep enhancement complete".
- **Turnkey next steps:** (a) **D1 `warn → error`** — UNCONFIRMED path; first **measure what the rules actually flag**
  (the earlier "collides with discriminated-union returns" claim was disproven) per
  [`../plans/transplant/d1-sonarjs-findings.md`](../plans/transplant/d1-sonarjs-findings.md) (suspect — re-derive); (b)
  **remediation 02** (IR-fidelity harness, in `active/`); (c) **transplant Phase 6** (Sub-agents / memory / state).
- **Oak:** RE-PINNED to Oak `main` `ad359a4f` (owner, 2026-06-17) — a clean superset of the former pin `4470266`
  (+429 commits, no merge cost); Phases 6–9 source from main. Back-flow target is now OPEN (deferred to Phase 9). The
  pin→main bring-manifest with named positions is in `relevance-ledger.md` §Main re-pin delta.

---

## Where We Are

> 🔀 **ONE DEEP ENHANCEMENT (owner): bring over the ENTIRE Practice / agentic-engineering framework / agent-tools /
> skill+rule+subagent+hook definitions AND fix castr's known issues — the same goal, not competing priorities.**
> Owner doctrine (2026-06-09): "all issues MUST be fixed, mostly now; sequencing with a named position is acceptable;
> an undefined 'later' is never." Components — all required, all on the single branch
> `feat/transplant-engraph-practice`, none parked:
>
> - **Practice transplant** ([`oak-practice-transplant.md`](../plans/active/oak-practice-transplant.md), tracker
>   [`transplant/README.md`](../plans/transplant/README.md)) — Phases 0–5 complete and tagged; **Phase 6 is the
>   owner-directed next slice**.
> - **Engineering-infrastructure arc D1–D4** (tracker §Deep-enhancement arc).
> - **Deep-review remediation backlog** ([`remediation/`](../plans/remediation/) 02–07; 01 complete + merged in) — the
>   6 shipped Criticals must be fixed; a required component, not a gate that blocks the transplant.
> - **Product feature slice** [`explicit-additional-properties-support.md`](../plans/current/paused/explicit-additional-properties-support.md).
>
> The owner names the next slice; the rest keep their place and still get done. A 2026-06-05 record claimed the owner
> "parked" the feature slice — **the owner never gave that instruction and repudiated the parking framing (2026-06-09)**.
> The 2026-06-09 "sequence positions 1/2/3" were an ordering guide, not a priority gate; advancing the transplant does
> not demote remediation. Everything below remains true context (where it routes work to `fix/*` branches off
> `docs/initial-deep-review`, the single-branch consolidation in §Current state supersedes it).

### Practice Transplant — resume from the tracker (sequence position 2)

**Goal:** wholesale-transplant Oak's Practice estate into castr (localise `@oaknational`→`@engraph`), preserving castr's
product doctrine/ADRs/report/remediation. **Branch:** `feat/transplant-engraph-practice` off `docs/initial-deep-review`
(baseline `transplant/phase-0-baseline`). **Read first:** `.agent/plans/active/oak-practice-transplant.md` (contract) →
`.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` (the full
inventory/dispositions) → the napkin's latest entries (`2026-06-10` decisions + rule candidate, `2026-06-09` Phase-4 lessons, `2026-06-07` firsthand corrections).

- **Status:** Phases 0–5 ✅. **Phase 5 (2026-06-17, tag `transplant/phase-5`)** — 7 generic directives brought
  additive (`agent-collaboration`, `continuity-practice`, `definition-of-delivery`, `operationalisation-contract`,
  `orientation`, `tdd-as-design`, `user-collaboration`), per-surface reconciled (false `§Code Quality` TDD cite →
  `§Testing Standards`; Oak-local plan cites de-linked; `oak-consolidate-docs` localised; mechanism surfaces
  reconciled; tdd-as-design scales grounded for castr's headless `lib`); `AGENT.md` gained an additive directive index;
  `schema-first-execution.md` held DON'T-BRING. Oak rules-delta folded (`precedence-is-not-approval` + `PDR-091` +
  `verify-dont-trust` +6) → **86 canonical rules / 92 PDR files**. **Phase 4 (2026-06-09, tag `transplant/phase-4`)** — 80 Oak rules (ad649710) + castr's 5
  = 85 canonical rules + root `RULES_INDEX.md` (85 rows, index↔disk verified); per-rule firsthand reconciliation;
  `use-result-pattern` dropped (contradicts `principles.md` fail-fast — 9th DON'T-BRING); 7 collision-range Oak-ADR
  cites disambiguated cross-host; `pnpm agent-tools:*` aliases wired. Phase 3 — skills (18 brought + localised; castr
  grounding folded into the start-right core; `jc-*`/`distillation`/`napkin`/`castr-start-right` retired; blocking
  `skills:check`); tag `transplant/phase-3`. Phase 2 = `@engraph/agent-tools` (340 files) + hook policy + LIVE
  PreToolUse guards + §6 `validate-drift`; tag `transplant/phase-2` (commit `55a6788`).
  Commits: see `git log --oneline transplant/phase-1..HEAD` — Phase 2 = `55a6788`; then handoff + diagnosis-correction commits. Oak advanced `2c85bc01`→`ad649710`; **Step 0 (2026-06-07) reviewed the whole estate (see the tracker); Oak was held at `ad649710` through Phase 4, pinned at `4470266` for Phase 5, and is now RE-PINNED to `main` `ad359a4f` (owner, 2026-06-17) for Phases 6–9 — a clean superset of the pin (the `ad649710`→pin rules-delta was folded at Phase 5; the pin→main delta is the bring-manifest in `relevance-ledger.md`).**
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
- **Next steps — full detail in the tracker's "Next steps":** Phases 0–5 ✅ done. **NEXT: Phase 6 —
  Sub-agents / memory / state** (opens with the memory-layout consolidation pass); then Step 3 residue folds at its
  phases (`PDR-089` Decision-7→P1; `.cursor` adapter→P7; `documentation-hygiene.md` landed with P4). The pre-Phase-9
  Oak delta-sync is **done** — Phase 5 folded the `ad649710`→pin rules-delta (`precedence-is-not-approval` + PDR-091 +
  `verify-dont-trust` +6; no other KEEPs).
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
> **The remediation backlog is a required component (owner, 2026-06-09: all issues MUST be fixed, nothing parked)** —
> plans 02–07 remain (01 complete + merged in). It is one part of the single deep enhancement, not a gate that blocks
> the transplant; the owner names the next slice (see §Current state).

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**One deep enhancement, single branch `feat/transplant-engraph-practice`** — all components required, none parked, owner names the next slice (currently **Phase 6**):

- [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md) Phases 6–9 (0–5 done) + engineering-infrastructure arc D1–D4
- [deep-review remediation backlog](../plans/remediation/) 02–07 (01 complete + merged in)
- [Explicit Additional Properties Support](../plans/current/paused/explicit-additional-properties-support.md) (feature slice)

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
- the deep enhancement is one body of work (owner): the [Oak → castr Practice transplant](../plans/active/oak-practice-transplant.md) Phases 6–9 + arc D1–D4, the remediation backlog 02–07, and [explicit-additional-properties-support.md](../plans/current/paused/explicit-additional-properties-support.md) are all required components on the single branch — sequenced, never parked, owner names the next slice (currently Phase 6)

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then the §Current state block above and the transplant tracker.
2. **Next slice (owner-directed): transplant Phase 6 — Sub-agents / memory / state** on `feat/transplant-engraph-practice` from the tracker; it opens with the memory-layout consolidation pass; each phase ends green (`pnpm check`) + reference-closure-clean + tagged.
3. **Also required — one deep enhancement, single branch, nothing parked, not gated behind one another:** the [remediation backlog](../plans/remediation/) 02–07 (proof-first TDD, atomic + gated), the rest of the transplant Phases 7–9 + arc D1–D4, and the [feature slice](../plans/current/paused/explicit-additional-properties-support.md). The owner names which is next.
4. If a user reports a fresh gate or runtime regression in product code, reproduce it immediately and treat that report as active session truth.
5. Use [eperusteet-real-spec-validation.md](../plans/current/complete/eperusteet-real-spec-validation.md), [oas-3.2-full-feature-support.md](../plans/current/complete/oas-3.2-full-feature-support.md), and [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) only for predecessor context.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the final Phase E close-out rerun, and repo-root `pnpm check:ci` remains green from **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky still formats staged files on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but hook runs do not replace explicit aggregate reruns when closing work.

⚠️ **Caveat (2026-06-04):** green gates do **not** mean "no bugs". The deep review reproduced 6 Critical defects the gates do not cover (packaging/types, security AND→OR, `$ref` round-trips, IR round-trip throw, Zod parser/writer losses). See the **Deep Review** callout in _Where We Are_ and [`.agent/report/initial-review/`](../report/initial-review/).

---

## Next Session Start Statement

**@engraph/castr — next session start.** This is **one deep enhancement** (owner): bring over the ENTIRE Practice /
agentic-engineering framework / agent-tools / skill+rule+subagent+hook definitions **and** fix castr's known issues —
the same goal, not competing priorities. All components live on the single branch `feat/transplant-engraph-practice`,
none parked: the **Practice transplant** (Phases 0–5 done; **Phase 6 is the owner-directed next slice**), the
**engineering-infrastructure arc D1–D4**, the **deep-review remediation backlog** (02–07; 01 complete + merged in — the
6 shipped Criticals must be fixed), and the **product feature slice**
(`current/paused/explicit-additional-properties-support.md`). **Nothing is parked, ever** (owner: "all issues MUST be
fixed, mostly now; sequencing with a named position is acceptable; an undefined 'later' is never") — a 2026-06-05
record claiming the owner parked the feature slice was a fabricated attribution, repudiated 2026-06-09. The owner names
the next slice; a fresh reproduced product regression pre-empts it.

**Phases 0–5 are COMPLETE and green.** Phase 5 (tag `transplant/phase-5`, 2026-06-17): 7 generic directives brought
additive + per-surface reconciled; Oak rules-delta folded (`precedence-is-not-approval` + PDR-091 + `verify-dont-trust`
+6) → 86 canonical rules / 92 PDR files. Phase 4 (tag `transplant/phase-4`, 2026-06-09): **80 Oak rules** (held
`ad649710` forms) + castr's 5 = **85 canonical rules** + root `RULES_INDEX.md` (85 rows, index↔disk verified); every
body read firsthand and reconciled per-surface; `use-result-pattern` dropped (contradicts `principles.md`
fail-fast — the 9th DON'T-BRING); collision-range Oak-ADR cites disambiguated; `pnpm agent-tools:*` root aliases
wired; five new upstream Oak bugs flagged for back-flow. Phase 3 (tag `transplant/phase-3`): Oak's 18 skills brought + localised, castr grounding folded into the start-right shared core, all `jc-*`/`distillation`/`napkin`/`castr-start-right` retired, blocking `skills:check`. Phase 2 (tag `transplant/phase-2`, commit `55a6788`): the 340-file `@engraph/agent-tools` package + hook policy + **LIVE Claude PreToolUse guards** + the §6 `validate-drift` validator. Reconstruct with `git log --oneline transplant/phase-0-baseline..HEAD`.

**⚠️ LIVE NOW — your tool calls are guarded.** `.claude/settings.json` routes Bash/Edit/Write through `run-pretooluse-guard.mjs`: dangerous-git patterns and PDR-044 content fingerprints are **denied**; an unbuilt `dist` fails **OPEN** (warns, never bricks). A blocked call is the policy in `.agent/hooks/policy.json`, not a bug. agent-tools `test` is **informational** (filtered out of the blocking gate via `--filter=!@engraph/agent-tools`; 13/885 failures, all P6/P8 content); `repo-validators:check` carries **5 green BLOCKING validators** (`lifecycle-scripts`/`pretooluse-guard-routing`/`drift`/`fitness-vocabulary`/`stale-script`), 3 sequenced at their phases (`collaboration-state`→P8, `subagents`→P6, Oak `portability`→P7). **The sequenced validators' "crashes" are NOT bugs — do NOT try to "fix"/silence them: they hard-fail by design on absent infrastructure (Oak tests assert it), truthfully reporting castr's P6/P8 infra isn't installed yet; a 2026-06-07 trial fix was reverted (Oak clean at `ad649710`).** (Note: the guards live on the transplant branch; remediation branches off `docs/initial-deep-review` predate them.) **Gotcha (verified firsthand — it blocked my own command):** the Bash guard substring-matches the WHOLE command, so a blocked pattern anywhere in the command string — including an `echo`/test payload or a dangerous-command literal quoted inside a commit message — is denied. Keep such literals out of commands; when a commit message must discuss them, write it to a file and use `git commit -F <file>`, never `-m`. The guards also activate **mid-session** when `.claude/settings.json` changes, so your current session may already be guarded.

**Read first, in order:** `.agent/directives/AGENT.md` → `metacognition.md` → this prompt (§Practice Transplant) → `.agent/plans/active/oak-practice-transplant.md` (execution contract — note **owner-locked scope §6**) → `.agent/plans/transplant/README.md` (tracker + resume point) → `relevance-ledger.md` + `reference-closure.md` → the `.agent/memory/active/napkin.md` latest entries (`2026-06-17` + `2026-06-10`). Cross-session memory may not load — **treat the in-repo surfaces as authoritative**.

**Next executable steps (in order, owner-directed):** Steps 0–2 and **Phase 4 ✅ done** (see the tracker's per-phase
blocks). **NEXT: Phase 6 — Sub-agents / memory / state:** 13 generic sub-agent templates + `components/`; full
patterns (provenance-amended, index regenerated, drop ~2 UI); executive (regenerated catalogues); operational;
collaboration schemas + empty dirs. **Opening consolidation pass IN PROGRESS** (slice `5a264a7`): the flat memory was
moved into the Oak `active/` layout (the Phase-5 directives' `memory/active|operational|executive/…` forward-placeholders
now resolve on disk), `ephemeral-to-permanent-homing.md` is in place, and the generator-triage generic fold landed.
**The napkin drain is the next step** — see the First action block below and sub-plan `06` §4 for the exact sequence. **Carry the Phase-3/4/5 lessons:** classification reads lie, bodies do not; transplanted
enforcement data is contract-tested (change data ↔ its tests together); directive-section cites in Oak surfaces are
claims to verify against castr's actual headings (Phase 5 caught a false `§Code Quality` TDD cite → `§Testing
Standards`); Oak-local plan citations in permanent docs violate `no-moving-targets` — de-link them; protection labels
mean edit-with-rigour, never park-the-defect. **Oak baseline: RE-PINNED to Oak `main` `ad359a4f` (owner, 2026-06-17)** —
a clean superset of the former pin `4470266` (`4470266` is a direct ancestor of main, +429 commits, no merge cost);
Phases 6–9 source from main. The `ad649710`→pin rules-delta was folded at Phase 5; the pin→main delta is enumerated with
named positions in `relevance-ledger.md` §Main re-pin delta.

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

**First action (next session, from 2026-06-18):** continue **Practice transplant — Phase 6 (memory)** on
`feat/transplant-engraph-practice`, grounding with the owner first. **Blocks (a)–(f) + (g) structure & catalogues
LANDED.** Opening slice (`5a264a7`): flat memory → Oak `active/` layout + homing doc + generator-triage fold. **2026-06-18
(commits `d80e49f`, `ce57dd1`, `e2ce7de`, `b722980`, `e620c5e`, `8739ee3`):** five operational registers seeded +
reconciled; **napkin drained** — manufactured-permission candidate → **new rule** `no-manufactured-permission.md` (owner
chose new-rule via `new-rule-vs-pdr-clause`; **87 canonical rules**), transplant-method lessons → `distilled.md`,
pre-transplant entries rotated to `active/archive/` (napkin 480 lines); **`repo-continuity.md`** authored (castr's lean
contract); **root `memory/README.md` + `executive/README`** (three-mode taxonomy — **the full `.agent/memory`
dangling-link sweep is now empty**); the **three executive catalogues** (`artefact-inventory`, `invoke-code-experts`,
`cross-platform-agent-surface-matrix`) **regenerated firsthand from castr's real estate** (reviewer roster 6→15 after
the 2026-06-19 sub-agent landing; real adapter parity with named P7/Codex-only/Claude-only gaps; honest forwarder note). **Substrate contract ✅ LANDED
2026-06-18 (commit `360923d`):** `executive/memory-state-substrate-contracts.{md,manifest.json,schema.json}` re-authored
to castr roots — 22 surfaces (the 11 Phase-8 surfaces carry `notes`), castr identity/PDR-049+050 cites/plan roots/reviewer
routes; verified firsthand against the live `practice-substrate` consumer (manifest-validates-against-schema; only the
absent Phase-8 collaboration plane reports the expected `live-reader-failure`). **Follow-on (`150e628`):** removed the
consumer's two magic-number drift checks (`EXPECTED_MANIFEST_SURFACES = 22`, `expectedEntryCount: 114`) — stored-derived-value
anti-patterns violating the contract's own `stored_derived_values_rule`; Oak carries identical code → Phase-9 back-flow item.
**`active/patterns/` import ✅ LANDED (2026-06-19, commit `795d935`):** 130 patterns (132 − 2 UI-only); `proven_in: imported`
(no source-repo reference at all); broad source-repo neutralization of pattern bodies; frontmatter normalized to the
canonical 5 categories; the README index is now **generated + strictly gated** by the new agent-tools CLI
`validate-patterns-index` (`--check` in `repo-validators:check`; repo-agnostic → Phase-9 Oak back-flow, also fixes Oak's
stale index). **Sub-agent roster ✅ LANDED (2026-06-19, commit `d5cd4eb`):** roster 6→15 (9 new lean native templates
incl. `architecture-expert` 4-persona; 12 Codex adapters; 3 dangling `invoke-*` rules reconciled). **State schemas ✅
(Oak WS7, `07f1f3c`); reviewer-routes + `agent-collaboration-channels.md` ✅ (`4567d06`); standing items ✅ — back-flow
target, D1 lint (TS-skew root-fix, rules at `error`), Q-001 (`2431f97` + D1 fix).** **`transplant/phase-6` ✅ CUT
(`a63aee3`) + pushed — Phase 6 COMPLETE. **Phase 7 IN PROGRESS** — sub-plan
[`transplant/07-adapters-and-gate-flips.md`](../plans/transplant/07-adapters-and-gate-flips.md) authored (verified scope:
15 templates/18 persona adapters, 87 rules; **build** a native adapter generator — Oak pin `ad359a4f` ships none + hand-
maintains → a Phase-9 back-flow improvement; then flip portability/subagents gates, retire bespoke script). **Branch
`check:ci`-green (2026-06-19; 0 errors, 0 sonarjs warnings — D1 resolved).\*\* \_Incoming
`origin/main` `ccd9c7a` zod-compiler report-plan ✅ HOMED (2026-06-19): cherry-picked then split to `.agent/research/zod-compiler/`
(comparison + corrections + reasoning-trail §4 preserved), `.agent/plans/future/castr-surface-architecture-and-verb-model.md`

- `castr-check-verb.md`, and ADR-048 (Proposed — compiler-internal-split scope/value-gate, clarifies ADR-043); monolith removed.\_
  Full sequence + live status: sub-plan `06-memory-and-generator-consolidation.md` §4
  (reorder a✅…g✅ incl. substrate✅ + `active/patterns/`✅ + sub-agent roster✅ + state-schemas✅ + reviewer-routes✅ +
  channels✅). This is **one deep enhancement**. **Owner re-order (2026-06-19): finish the FULL Practice transplant
  first** (Phases 7–9 + arc D2/D4 parity), **then** remediation backlog 02–07 (named position after, not parked —
  `no-manufactured-permission` holds), then the feature slice; "not in a rush to merge" (delivery deprioritised). All
  still required; a fresh reproduced product regression still pre-empts the sequence. **Oak is RE-PINNED to `main` `ad359a4f`** (owner, 2026-06-17).
  **Use the reviewer roster to assess the transplant work so far** (owner, 2026-06-17). **The roster is now 15 (was 6) —
  sub-agent roster ✅ landed 2026-06-19, commit `d5cd4eb`.** Firsthand grounding showed the driver was **completing the
  half-built expert system** castr's own `invoke-*` rules already required (3 dangling rules, one owner standing
  doctrine) — not the opener's "13 generic" framing. New: `architecture-expert` (4-persona), `assumptions`/`config`/
  `docs-adr`/`mcp`[emission]/`onboarding`/`release-readiness`/`security`[input-DoS]/`subagent-architect`, all lean
  castr-native (catalogue: `memory/executive/invoke-code-experts.md`). The `subagents` gate flip + `.cursor`/`.claude`
  wrappers are **Phase 7**. **Phase-6 remaining before the tag: `.agent/state/collaboration/` schemas** (under-specified —
  see `repo-continuity.md` §Next Safe Steps for the stale-location + deferred-validator-asserts-absence gotchas). The
  reviewers review code / types / schema fidelity — point them at transplanted **code** changes (e.g. agent-tools), not at
  governance-doc edits. Carry the per-surface reconciliation lesson: Oak surfaces embed host-product specifics;
  bodies must be read, not classified.
