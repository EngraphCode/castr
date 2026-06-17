# Oak → castr Practice Transplant — Phase Tracker

**Primary plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md)
**Spec:** [`../practice-alignment-brief.md`](../practice-alignment-brief.md)
**Branch:** `feat/transplant-engraph-practice` (baseline `transplant/phase-0-baseline`; the former base
`docs/initial-deep-review` was subsumed + deleted in the 2026-06-15 single-branch consolidation — all work is on this
one branch now, see [`../delivery-ledger.md`](../delivery-ledger.md))

This directory holds per-phase sub-plans + the relevance ledger, mirroring `remediation/`. Each phase ends green
(`pnpm check`) + reference-closure-clean, with an atomic commit and a `transplant/phase-N` tag. Roll back **forward**
only.

## Status

| Phase | Surface                                                                                  | Status  | Tag                           |
| ----- | ---------------------------------------------------------------------------------------- | ------- | ----------------------------- |
| 0     | Setup — branch, baseline, plan promotion, park product plan                              | ✅ done | `transplant/phase-0-baseline` |
| 1     | Practice Core + ~90 PDRs + provenance + verification + fitness + retire practice-context | ✅ done | `transplant/phase-1`          |
| 2     | `@engraph/agent-tools` + hook policy (+ live guards, §6 drift validator)                 | ✅ done | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                                 | ✅ done | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                               | ✅ done | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive) + Oak rules-delta fold                                  | ✅ done | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                              | ⬜      | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                              | ⬜      | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                           | ⬜      | `transplant/phase-8`          |
| 9     | practice-verification + relevance ledger + feedback + handoff                            | ⬜      | `transplant/phase-9`          |

## Resume point (next session)

**Phase 1 is complete** — tagged `transplant/phase-1`. **1a** delivered the PDR estate (91 files at 1a; now 92 files / 90 numbered slots after Phase 5 folded PDR-091 — PDR-086 vacant, inherited from Oak, lossless; PDR-076 split 076/076a/076b), `practice-verification.md`,
and the `reference-closure.md` ledger (additive; zero `@oaknational`/`oak-` naming). **1b** (2026-06-05) converged the
Core generation to Oak's current portable trinity + entry points, created `provenance.yml` as the branch-history union
(castr's 2026-03-22 entry + a 2026-06-05 merge node preserved — no loss, no duplication, identity-deduped), merged
`CHANGELOG.md`, and retired `.agent/practice-context/` (archived castr's authored notes; repointed the live navigational
refs; immutable PDRs left intact).

**Phase 2 is COMPLETE** — tagged `transplant/phase-2` (commit `55a6788`; Oak baseline advanced `06018bc3`→`2c85bc01`).
Landed: the 340-file `@engraph/agent-tools` package (localised; product-coupled `ci-schema-drift-check` dropped per
DON'T-BRING); self-contained tsconfig/eslint/knip/depcruise + inlined vitest bases; `pnpm-workspace` + `tsx` postinstall
bootstrap; hook policy data + **LIVE Claude PreToolUse guards**; and the §6 **`validate-drift`** validator (8th). Green:
format/build/type-check/lint/madge/depcruise/knip/portability/repo-validators + lib's 1669 tests.

**Phase 3 is COMPLETE** — tagged `transplant/phase-3`. Brought Oak's 18 skills (current `ad649710` forms; `ground-truth`
×2 dropped), localised `oak-`→`engraph-`; folded castr's domain grounding (IR honesty, gap taxonomy, schema-expert
roster, the castr gate chain) into the start-right shared core; retired castr's `distillation`/`napkin`/`castr-start-right`

- all `jc-*`; regenerated 18×2 `engraph-` adapters (`.claude/skills` + `.agents/skills`); added empty `skills-lock.json`;
  wired blocking `skills:check` into `qg`. **Discovery:** the skills were not naming-localise-only — several embedded Oak's
  real product gate commands (`sdk-codegen`/`test:widget`/etc.) + repo-doc paths (reconciled to castr), and
  `consolidate-docs` carried a stale upstream `practice-context` ref (Oak retired it 2026-04-29; flagged for back-flow). See
  `reference-closure.md` §Phase 3.

**CRITICAL operational state for the next session (non-obvious, easily lost):**

- **PreToolUse guards are now LIVE** (`.claude/settings.json` Bash/Edit/Write → `.claude/hooks/run-pretooluse-guard.mjs`).
  Your tool calls are guarded: dangerous-git patterns and content fingerprints (PDR-044 hedging/menu-framing) are denied;
  an **unbuilt `dist` fails OPEN** (warns, never bricks), a built-but-broken guard fails closed. If a tool call is
  blocked, that is the policy in `.agent/hooks/policy.json` — not a bug.
- **agent-tools `test` is INFORMATIONAL**, excluded from the blocking gate via `turbo test --filter=!@engraph/agent-tools`
  (+ runner `agent-tools:test:informational`). It is 867/885; the 18 failures are later-phase content (`RULES_INDEX`→P4,
  collaboration schemas→P8, codex agents→P6/7). Remove the filter (flip blocking) as each phase lands its content.
- **`repo-validators:check` chains only the 4 GREEN validators** (`lifecycle-scripts`, `pretooluse-guard-routing`,
  `drift`, `fitness-vocabulary`). The other 4 are deferred informational: `stale-script`→P4, `collaboration-state`→P8,
  `subagents`→P6, `portability`(Oak's)→P7. Add each to the blocking chain when its content exists.
- **⚠️ The deferred validators' "crashes" are NOT bugs — do NOT try to "fix" them.** `collaboration-state` and
  `subagents` throw on absent scan dirs by **design** (Oak tests assert `rejects.toThrow('…/conversations')` /
  `toThrow(/missing adapter/)`); they are truthfully reporting that castr's P6/P8 infrastructure is not installed yet. A
  2026-06-07 trial fix (return `[]` on `ENOENT`) broke the hard-fail test and was reverted — **Oak is clean at
  `ad649710`, nothing pushed**. They self-clear when P6/P8 land. Silencing them would mask the true "infrastructure
  absent" signal. See `relevance-ledger.md` §"Deferred-validator …".

## Next steps (in order)

**Step 0 — review the updated Oak agentic estate (owner-directed). ✅ DONE 2026-06-07.** Scanned `2c85bc01..ad649710`
whole-estate by surface. **Finding:** the delta is dominated by DON'T-BRING runtime event data (two ~2,900-line
`comms-seen/*.json`, claims archives, the shared comms log, Oak `eef`/observability/mcp-harness sector plans). The
**agent-tools _code_ is unchanged** in the range — only `README.md` + the new `docs/agent-identity.md` doc moved (Codex
statusline identity, a Phase-7 `.codex` follow-up). The transplant-relevant signal is one coherent **anti-ceremony
doctrinal shift**: two new generic rules (`collaboration-is-value-contingent`, `permanent-doc-is-the-consolidation-record`)

- the **rewritten** continuity cluster (`consolidate-docs` / `consolidate-until-done` / `session-handoff`, now deferring
  to those rules) + the new `start-right-team` skill + a reframe of subjective experience to **strictly voluntary** (the
  corpus is not monitored for thinning). **Consequence:** Phase 3/4 bring Oak's _current_ (anti-ceremony) forms of these
  surfaces, not the older heavier forms; the two new rules join the Rules KEEP set (relevance-ledger updated).
  **Oak is held at `ad649710` as the working baseline (owner, 2026-06-07)** — transplant against it; no per-phase re-scan
  while it is held; re-scan only when the owner signals Oak has moved.

**Step 1 ✅ done** — `02-agent-tools-build-design.md` reconciled to as-built (as-built banner + tsconfig fix).

**Step 2 ✅ done — Phase 3 (Skills) landed** (tag `transplant/phase-3`); see the Phase-3 resume block above.

**Phase 4 ✅ done (2026-06-09) — Rules + `RULES_INDEX` + reference-closure** (tag `transplant/phase-4`). Landed:
**80** Oak KEEP rules (held `ad649710` forms; the grounded 81 minus `use-result-pattern`, dropped firsthand for
direct contradiction with `principles.md` §Fail-Fast — the 9th DON'T-BRING) + castr's 5 merged in place =
**85** canonical rules; root `RULES_INDEX.md` hand-authored (85 rows, index↔disk verified); every rule body read
firsthand and reconciled per-surface (the Phase-3 lesson held: false principles-cites, Oak gate estates, wrong ESLint
thresholds, SDK-codegen coupling, server-product MCP triggers, step-renumber drift); 7 collision-range Oak-ADR cites
re-pointed with cross-host disambiguation, >047 cites retained-cross-host; Phase-3 skill→rule placeholders resolved;
P5/P6/P7/P8 forward placeholders emitted; `pnpm agent-tools:*` root aliases wired; five new upstream Oak bugs
flagged for back-flow. Full record: `reference-closure.md` §Phase 4 + `relevance-ledger.md` §Rules.

**Phase-4 follow-on (2026-06-09, owner-directed: "nothing is sacred — engineering discipline, not dogma; known
issues are always blocking"):** the `principles.md:1729` dangling invocation FIXED (the whole aspirational
§Tooling Integration block reconciled to castr's real review-time TSDoc enforcement); **`stale-script` validator
now GREEN and BLOCKING** in `repo-validators:check` (5 green validators; 3 deferred: `collaboration-state`→P8,
`subagents`→P6, Oak `portability`→P7); the `policy.json` citations completed properly in data↔test lockstep
(staging deny → the `stage-by-explicit-pathspec` rule path; hedging/menu-framing deny → castr's real
`principles.md §Core Philosophy: Engineering Excellence Over Speed`; hook-policy suites 114/114 green). The
"SACRED" edit-bar framing is retired across live surfaces: protection = rigour + owner-visible rationale + never
clobbering, not an approval taboo that parks defects.

**Phase 5 ✅ done — Directives (7 generic, additive) + Oak rules-delta fold (tag `transplant/phase-5`).** Brought
`agent-collaboration`, `continuity-practice`, `definition-of-delivery`, `operationalisation-contract`, `orientation`,
`tdd-as-design`, `user-collaboration` from the pinned Oak branch (read at `4470266`), additive — sacred castr directives
untouched, `AGENT.md` gained an additive index of the 7; `schema-first-execution.md` held DON'T-BRING (its dangling
agent-tools-doc reference repointed to `requirements.md`). Per-surface reconciliation throughout (false `§Code Quality`
cite → `§Testing Standards`; Oak-local plan cites de-linked per `no-moving-targets`; `oak-consolidate-docs` localised;
mechanism-catalogue surfaces reconciled to castr; tdd-as-design scales grounded for castr's headless `lib`). All P5
directive placeholders resolved; castr's `tdd.md` rule reconciled against `tdd-as-design`. **Oak rules-delta
`ad649710`→pin folded:** new rule `precedence-is-not-approval` + `PDR-091` + `verify-dont-trust` +6 lines (PDR estate
91→92 files / 90 numbered slots; `RULES_INDEX` 85→86 rows; drift count-claims updated). Full record:
`reference-closure.md` §Phase 5.

**NEXT: Phase 6 — Sub-agents / memory / state.** 13 generic sub-agent templates + `components/`; full patterns
(provenance-amended, index regenerated, drop ~2 UI); executive (regenerated catalogues); operational; collaboration
schemas + empty dirs. **Opens with a consolidation pass** (owner-confirmed 2026-06-10) — full design in
[`06-memory-and-generator-consolidation.md`](./06-memory-and-generator-consolidation.md): reconcile castr's flat
`memory/napkin.md` + `memory/distilled.md` into the Oak `active/` layout — the Phase-5 directives
(`orientation`/`continuity-practice`/`agent-collaboration`) already cite `memory/active/…` + `memory/operational/…` +
`memory/executive/…` as forward-placeholders that resolve here — then drain the napkin and graduate captured learnings
into their enforcement homes.

**Phase-6 scope sharpened (owner, 2026-06-17) — generator-first.** The memory dir is a _generated artefact_: the
consolidate/curator/napkin/session-handoff/start-right skills are what populate and maintain it (`generator-first-mindset`).
So the opening pass aligns the **generator** (re-sync the memory-populating skill cluster to main forms), not just the
directory shape. Measured split: memory-governing **rules** unchanged `ad649710`→main; structural **contracts** (READMEs,
substrate-contract, `orientation`) byte-identical pin→main; the **skills** moved (`consolidate-docs`/`session-handoff`/
`curator-pass`/`start-right`). See the sub-plan §2.

**Baseline RE-PINNED (2026-06-17, owner — supersedes the `4470266` pin below): Oak `main` `ad359a4f`** is the fixed
baseline for Phases 6–9. Not a moving-target violation — it adopts a _newer fixed ref_. **✅measured: `main` is a clean
superset of the old pin** — `4470266` is a direct ancestor of `origin/main`, +429 commits, no divergence / no merge cost.
Rationale: deciding the Phase-6 memory _structure_ (and the skills that generate it) against a stale pin risks
transplanting superseded forms; the structure itself is byte-identical pin→main, so the re-pin costs nothing structurally
and buys the current generator skills + content. **Back-flow target is now OPEN** (the old pin's "push to
`practice/transplant-to-castr`" no longer self-evident) — deferred to the Phase-9 feedback step. The historical pin note
below is retained as the record of the 2026-06-10→2026-06-17 baseline.

**Baseline (2026-06-10, supersedes the `ad649710` hold): Oak is PINNED on a dedicated work branch** —
`practice/transplant-to-castr` @ `4470266` (owner-created; no more moving target; castr may commit AND push there,
so back-flow fixes/feedback live in Oak directly). Phases 5–9 read their estates from that pinned branch. The
previously scheduled pre-P9 delta-sync is absorbed: the pin is current; **Phase-5 grounding re-checked the
`.agent/rules/` delta `ad649710`→pin and folded it ✅** — the delta was exactly `precedence-is-not-approval` (new rule)

- `PDR-091` (its portable backing) + a 6-line append to `verify-dont-trust`; no other KEEPs. Also verified the pin
  `4470266` vs branch tip `518b34af` differ only by castr's own back-flow feedback doc (directives byte-identical). Delivery state (branches/PRs per plan) lives in [`../delivery-ledger.md`](../delivery-ledger.md).

**Step 3 — fold Oak follow-ups in at their phases (not before):** `PDR-089` Decision-7 append → a Phase-1 touch;
`documentation-hygiene.md` → Phase 4; the `.cursor` adapter → Phase 7.

## Deep-enhancement arc — engineering-infrastructure parity (owner, 2026-06-10)

The deep enhancement of castr is **broader than the agentic-Practice Phases 0–9** (owner: _"there is plenty more
Practice, rules, agent tool, agentic engineering, CI, quality gates to bring over before this deep enhancement of
Castr is complete"_). These engineering-infrastructure deliverables are named here so none is an undefined-later;
each has a position, none blocks Phase 5 from proceeding. Sequence within the arc is owner-directed at execution.

- **D1 — Lint-rule parity / in-flight warn→error migration.** Owner decision (2026-06-10): **no lint rule is ever
  turned off.** To avoid forcing complex refactors ad-hoc, the in-flight rules (the sonarjs-4.0.3 recommended-set
  additions now erroring) **may be set to `warn` transitionally** — and the **DoD requirement** is that **every one
  is back to `error` before the deep enhancement is considered complete** (recorded in
  [`DEFINITION_OF_DONE.md`](../../directives/DEFINITION_OF_DONE.md) §Transitional gate states). **Status (2026-06-15):**
  the warn-downgrade is DONE (commit `3b3f0d9`; **126 warnings** = 121 `sonarjs/function-return-type` + 5
  `sonarjs/in-operator-type-error`, all under `lib/src/schema-processing/**`; both `warn`, never off, set in
  `lib/eslint.config.ts` after `sonarjsConfigs.recommended`). **The `warn → error` resolution is NOT yet confirmed.**
  A 2026-06-15 investigation ([`d1-sonarjs-findings.md`](./d1-sonarjs-findings.md)) found the earlier
  _"function-return-type collides with discriminated-union returns"_ framing was **wrong** (the rule excludes
  null-like and collapses all object types), and could **not** determine whether the violations are genuine
  inconsistencies, undocumented-function debt, or something else — so it could not say whether the fix is code
  changes or a justified rule-selection. **That report's conclusions are explicitly suspect** (its author was
  repeatedly wrong); its value is the `[VERIFIED]` facts + the measurement steps it names. **Next: measure what the
  rules actually see (report §8) before deciding.** Owner doctrine stands — no rule ever off; `warn` is transitional,
  not a resting state — but whether the end-state is `error` or a ratified rule-selection is the open question the
  measurement must settle.
- **D2 — Node version policy + single source.** Owner decision (2026-06-10): **Node 24 everywhere; stable LTS is
  always the right choice; advance to 26 only once GitHub _and_ Vercel support it** (named tripwire, not a date).
  Owner already executed the config: `engines: "24.x"` (root + `lib`), CI collapsed to single Node 24 (matrix
  removed), publish on 24. **Remaining (DRY):** Node version is still hardcoded in ~4 places — introduce a single
  source (`.nvmrc` = 24 + `node-version-file:` in the workflows, the Oak standard) so the next LTS bump is one edit.
  **ADR-048 candidate:** "Node version policy — stable-LTS, currently 24, advance only when CI+deploy platforms
  support the next LTS" (repo-specific → ADR per PDR-079). _Consideration for the ADR (not a blocker):_ exact-major
  `engines: 24.x` is restrictive for downstream consumers of the published `@engraph/castr`; confirm intent vs a
  `>=24` floor.
- **D3 — CI modernization to the Oak standard.** Oak's CI (observed on the pinned branch) **SHA-pins every action
  with a `# vX.Y.Z` tag comment** (e.g. `actions/checkout@df4cb1c… # v6.0.3`, `actions/setup-node@… # v6.4.0`,
  `pnpm/action-setup@… # v5.0.0`) — movable tags are a supply-chain risk (owner requirement, 2026-06-10). castr's
  workflows are otherwise stale: actions tag-pinned (`@v3`/`@v2`), CI runs only `build` + `test` (NOT the full
  `check:ci` gate chain — so castr's CI does not currently enforce its own gates), and `ci.yml` path filters
  reference `lib/pnpm-lock.yaml` though the lockfile is at the repo root. `publish.yml` invokes a non-existent
  `pnpm release` via changesets the repo does not use. Bring all of this to the Oak standard as one coherent slice.
- **D4 — Quality-gate + further Practice/agent-tools parity.** "Plenty more" still to import from the pinned Oak
  branch beyond Phases 5–9's named estates (additional rules, agent-tools capabilities, agentic-engineering and
  quality-gate machinery). Enumerate against the pinned Oak branch at the Phase-9 verification sweep; until then this
  is the named placeholder so the arc's incompleteness is explicit, not forgotten.

**Completion of the deep enhancement requires the arc AND Phases 0–9 — including every in-flight lint rule back at
`error` (D1) and CI at the Oak standard (D3).** "Transplant phases done" ≠ "deep enhancement complete."

**Standing gate-completeness rule (latent-gap lesson, commit `11f7e48`):** every phase's gate run must include ALL of
`qg`. Phase 1b skipped `portability:check`, so the phase-1 tag was green while that gate was latently broken — "green"
hides gaps when a gate is omitted.

The 1b method below is kept as the execution record:

> **Frame Phase 1b as a HISTORY MERGE, not a replace.** Practice histories are **branchy — a DAG, like git** — not
> linear. castr's Practice is a **branch** that diverged from the shared network ≈2026-03-09 (provenance index 7) and
> evolved locally since (index 8 / 2026-03-22 + clean-break principles naming, canonical-first restructuring,
> paused-workstream lifecycle). Oak's Practice is another branch that advanced in parallel. This transplant **merges
> Oak's current branch into castr's branch** — three-way: common ancestor ≈2026-03-09, _ours_ = castr's local Practice
> (**preserve its divergence — do NOT clobber**), _theirs_ = Oak's current generation. Per `practice-lineage.md`'s
> integration protocol, ~⅓ of files port clean, ⅓ need selective edit (universal core kept + castr-local sections kept),
> ⅓ rewrite — three-way-merge each file.

- **Merge Oak's current Core generation** (`practice.md`, `practice-lineage.md`, `practice-bootstrap.md`, `index.md`,
  `README.md`, `CHANGELOG.md`) into castr's — adopt Oak's advances, **preserve castr's branch-local divergence** (not a
  wholesale replace). All portable (zero oak-naming).
- **Merge provenance (it is itself a flattened merge-history — entries from oak/cloudinary/new-cv/castr interleaved):**
  castr's Core uses old inline `provenance:`+`fitness_ceiling`; adopt Oak's `provenance: provenance.yml` pointer +
  multi-dim fitness frontmatter. **Union both branches' histories** (Oak's `provenance.yml` chains + castr's branch-only
  entries) and add a **2026-06-05 merge node** — not a linear append. NB Oak's `provenance.yml` holds castr only **through
  2026-03-09** (id `58b36dbe…`); castr's inline `practice.md` additionally carries an **index-8 entry dated 2026-03-22**
  Oak's file lacks → port it in or it is silently lost.
- **Retire `.agent/practice-context/`**: entangled — referenced by 10 files incl. the PRESERVE'd `AGENT.md`, `README.md`,
  `practice-index.md`, and `practice-lineage.md` (full list: `grep -rl practice-context .agent`). Archive castr's authored
  `outgoing/` notes; update the references.
- Then tag `transplant/phase-1`.

> **Sequencing note (don't conflate phases):** Phase 1b closes green on the **standard gates** (`format:check`,
> `type-check`, `lint`, `madge`, `depcruise`, `knip`, tests) **without** `agent-tools`. The plan's "build agent-tools
> first so docs are checkable" means the `practice:substrate` / `vocabulary` / `fitness` validation of the Core runs
> **retroactively at Phase 2** once `@engraph/agent-tools` is built — it is not a Phase-1b blocker.

## Artefacts produced here

- `NN-<surface>.md` — per-phase sub-plan. **`02-agent-tools-build-design.md` already written** (the hardest phase's full
  build/gate design, captured early so it can't be lost).
- `relevance-ledger.md` — ✅ **seeded 2026-06-05** (finalised Phase 9): full per-surface KEEP / AMEND / DON'T-BRING /
  DORMANT dispositions, the firsthand corrections to the fan-out, and the explicit not-brought + dormant sets.
- `reference-closure.md` — ✅ started: running resolve / rewrite / placeholder / retained-cross-host classification.

> **Continuation surfaces (all updated 2026-06-05 — no session knowledge lost):** this tracker + `relevance-ledger.md` +
> `reference-closure.md` + the parent plan + `.agent/prompts/session-continuation.prompt.md` (§Practice Transplant) +
> `.agent/plans/roadmap.md` + the `.agent/memory/napkin.md` `2026-06-05` entry + the cross-session auto-memory.
