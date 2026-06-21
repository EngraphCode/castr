# Oak → castr Practice Transplant — Phase Tracker

**Primary plan:** [`../active/oak-practice-transplant.md`](../active/oak-practice-transplant.md)
**Spec:** [`../practice-alignment-brief.md`](../practice-alignment-brief.md)
**Branch:** `feat/transplant-engraph-practice` (baseline `transplant/phase-0-baseline`; the former base
`docs/initial-deep-review` was subsumed + deleted in the 2026-06-15 single-branch consolidation — all work is on this
one branch now, see [`../delivery-ledger.md`](../delivery-ledger.md))

This directory holds per-phase sub-plans + the relevance ledger, mirroring `remediation/`. Each phase ends green
(`pnpm check`) + reference-closure-clean, with an atomic commit and a `transplant/phase-N` tag. Roll back **forward**
only.

> **🔭 SCOPE EXPANDED (owner, 2026-06-20) → the [Oak Parity-or-Better Program](./oak-parity-program.md).** The
> transplant's named-phase manifest was proven **incomplete** (it never tracked ArcAngel, the hook-policy concept model,
> the memory-machinery dirs, etc.). Owner directive: "upgrade everything less sophisticated than Oak; castr is not meant
> to stay simple." The authoritative gap inventory + execution plan is now [`oak-parity-program.md`](./oak-parity-program.md)
> (4 Tier-A + 6 Tier-B + 8 Tier-C verified gaps). **Phase 9 below is reframed as the closure gate that runs AFTER the
> parity program lands.** The old Phase-9 PDR-currency component is ✅ COMPLETE (4 new + 9 folded PDRs; `5c40adb`, `3787928`).

## Status

| Phase | Surface                                                                                      | Status                  | Tag                           |
| ----- | -------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------- |
| 0     | Setup — branch, baseline, plan promotion, park product plan                                  | ✅ done                 | `transplant/phase-0-baseline` |
| 1     | Practice Core + ~90 PDRs + provenance + verification + fitness + retire practice-context     | ✅ done                 | `transplant/phase-1`          |
| 2     | `@engraph/agent-tools` + hook policy (+ live guards, §6 drift validator)                     | ✅ done                 | `transplant/phase-2`          |
| 3     | Skills + commands→skills                                                                     | ✅ done                 | `transplant/phase-3`          |
| 4     | Rules + RULES_INDEX + reference-closure (36 Oak-ADR cites)                                   | ✅ done                 | `transplant/phase-4`          |
| 5     | Directives (7 generic, additive) + Oak rules-delta fold                                      | ✅ done                 | `transplant/phase-5`          |
| 6     | Sub-agents / memory / state                                                                  | ✅ done                 | `transplant/phase-6`          |
| 7     | Adapters + flip portability/subagents gates                                                  | ✅ done (2026-06-20)    | `transplant/phase-7`          |
| 8     | Collaboration machinery ACTIVE                                                               | 🔶 partial (2026-06-20) | `transplant/phase-8`          |
| 9     | closure gate (practice-verification + relevance ledger + handoff) — AFTER the parity program | ⬜ gated by parity      | `transplant/phase-9`          |

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
- **agent-tools `test` now GATES** (Phase 8 task 4b, 2026-06-20): the `turbo test --filter=!@engraph/agent-tools`
  exclusion was removed, so the suite (**943/0**) blocks in `pnpm test` → `test:all` → `qg` → `pnpm check`; the runner
  alias was renamed `agent-tools:test`. The "clerk-expert P7" blocker was a **phantom** — an Oak-phenotype assertion in
  `codex-project-agents.integration.test.ts` demanding a `clerk-expert` (Clerk = Oak's auth SaaS) the headless castr
  library never hosts (`reference-closure.md §Phase-4`). Reconciled the test to castr's real `code-reviewer` roster; no
  agent was added.
- **`repo-validators:check` chains 8 GREEN validators** (2026-06-20): `lifecycle-scripts`, `pretooluse-guard-routing`,
  `drift`, `fitness-vocabulary`, `no-stale-script-invocations` (P4), `patterns-index` (P6), `subagents` (P7), and
  `collaboration-state` (**P8 partial, flipped 2026-06-20**). Oak's `portability` runs as a separate `portability:check`
  gate in `qg` (flipped P7). No deferred-informational validators remain.
- **⚠️ Historical note — the deferred validators self-cleared by landing their infrastructure, NOT by silencing.**
  `subagents` cleared when Phase 7 generated the `.cursor`/`.claude` adapters. `collaboration-state` cleared in two
  steps: WS7 (Phase 6) decoupled the schemas from the data plane, then the Phase-8-partial slice (2026-06-20)
  materialised the `.agent/state/collaboration/` skeleton **and** completed the WS7 bring of `state-integrity.ts`
  (Oak pin's `optionalWhenAbsent` hardening: instance-tier surfaces absent = the clean state). The 2026-06-07 "return
  `[]` on ENOENT" trial that was reverted is now superseded by Oak's correct design (per-surface `optionalWhenAbsent`,
  with `conversations/`/`escalations/` still required → the hard-fail test still holds). See
  `relevance-ledger.md` §"Deferred-validator …".

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

**Phase 6 — Sub-agents / memory / state — IN PROGRESS (memory layout substantially landed 2026-06-18).** Blocks
(a)–(f) + (g) structure & catalogues done (commits `5a264a7`, `c6b90eb`, then `d80e49f`→`b21ec54`): flat memory → Oak
`active/` layout; operational registers materialised + reconciled; napkin drained (new rule `no-manufactured-permission`;
lessons → `distilled.md`; rotated to 480 lines); `repo-continuity.md` authored; root `memory/README.md` +
`executive/README.md` + the three executive catalogues regenerated from castr's real estate. **The full `.agent/memory`
dangling-link sweep is empty.** **Substrate contract ✅ landed 2026-06-18** (commit `360923d`):
`executive/memory-state-substrate-contracts.{md,manifest.json,schema.json}` re-authored to castr roots (22 surfaces,
castr identity/PDR cites/plan roots/reviewer routes; the 11 Phase-8 surfaces carry `notes`), verified firsthand against
the live `practice-substrate` consumer. Follow-on (commit `150e628`): the consumer's two **magic-number drift checks
removed** (`EXPECTED_MANIFEST_SURFACES = 22`, `expectedEntryCount: 114`) as stored-derived-value anti-patterns that
violate the contract's own `stored_derived_values_rule` — Oak carries the identical code → recorded as a Phase-9 back-flow
item. Full per-block design + live status in
[`06-memory-and-generator-consolidation.md`](./06-memory-and-generator-consolidation.md) §4 (reorder a✅…g✅).
**`active/patterns/` import ✅ LANDED (2026-06-19).** 130 patterns imported (132 on main − 2 UI-only); `proven_in: imported`
on all (owner: keep `proven_date`, **no source-repo reference at all**); **broad neutralization** of every source-repo
reference in pattern bodies (16 Oak ADR refs + 11 dangling links + product/path tokens — zero remain); frontmatter
normalized to the canonical 5 categories (substance-mapped, not expanded) + polarity typos fixed + `use_this_when`
backfilled on 36 files. **The README index is now GENERATED**, not hand-maintained: new agent-tools CLI
`validate-patterns-index` (`--check` wired into `repo-validators:check`, `--fix` to regenerate) recomputes the
sentinel-delimited index from frontmatter and **strictly gates conformance** (errors on missing `name`/`use_this_when`,
non-canonical `category`/`polarity`). Repo-agnostic → Phase-9 Oak back-flow item (also fixes Oak's stale 87/132 index).
Full record: sub-plan §4 + `reference-closure.md` §Phase 6.

**Sub-agent roster ✅ LANDED (2026-06-19).** Firsthand grounding overturned the "13 generic" opener: the driver was
**completing the half-built expert system** castr's own `invoke-*` rules already required (3 dangling rules, one owner
standing doctrine). **9 new lean castr-native templates** → roster **6 → 15** (`architecture-expert` 4-persona +
`assumptions`/`config`/`docs-adr`/`mcp`[emission]/`onboarding`/`release-readiness`/`security`[input-DoS]/`subagent-architect`);
persona + reviewer-team components; 12 Codex adapters + registrations (existing 6 backfilled; pre-existing `config.toml`
path-bug fixed); 3 dangling rules reconciled. Roster-of-record surfaces in lockstep. `subagents` gate flip + `.cursor`/`.claude`
wrappers = **Phase 7** (row 7). Full record: `reference-closure.md` §Phase 6 + sub-plan §4 OUT + `relevance-ledger.md`.

**Collaboration state schemas ✅ LANDED (2026-06-19 s3) — Oak WS7 (`6d1e45f3`).** Firsthand grounding against the Oak pin
overturned the "schemas + empty dirs (P8 structure-only)" framing: WS7 had already relocated the 5 `*.schema.json` to
committed source `agent-tools/src/collaboration-state/schemas/` and decoupled the validator schema-root from the data
path. Brought as a **Phase-6 source/contract** change (5 schemas verbatim + validator decouple + repoint every reader +
substrate-contract reconciled); **no `.agent/state/` runtime plane created** (Phase-8). Full `pnpm check` green;
agent-tools informational suite 13 → 1 (pre-existing `clerk-expert` P7 item). Full record: `reference-closure.md` §Phase 6
"Collaboration state schemas — WS7" + sub-plan §4.

**Two follow-on Phase-6 items ✅ DONE (2026-06-19 s3, owner-directed):** the substrate manifest **reviewer-route
re-point** (all 22 surfaces mirror Oak reconciled to castr's roster; Oak's `agent-tooling`→`code-reviewer`; owner-gate
clauses preserved) and **`agent-collaboration-channels.md`** authored as the routing index/contract (schema cross-refs →
WS7 source; runtime surfaces = Phase-8 forward-refs). **All three standing deferred items ✅ RESOLVED this session
(owner-directed):** Oak back-flow target (fresh branch off Oak main); **D1 lint (TS-version skew root-fixed via a single-TS
pnpm override; both rules back at `error`, 0 violations)**; Q-001 (D3 before merge, split PRs). **`transplant/phase-6` ✅ CUT (`a63aee3`) + pushed —
Phase 6 COMPLETE. NEXT = Phase 7** (platform adapters: `.cursor`/`.claude` wrappers → flip `portability`/`subagents`
gates), or an owner-named slice. _Incoming `origin/main` `ccd9c7a` (zod-compiler report-plan) ✅ HOMED 2026-06-19 —
cherry-picked + split to `.agent/research/zod-compiler/` + `.agent/plans/future/castr-surface-architecture-and-verb-model.md`
(+ `castr-check-verb.md`) + ADR-048 (Proposed); monolith removed. See `repo-continuity.md` §Next Safe Steps._

**Phase-6 scope sharpened (owner, 2026-06-17) — generator-first.** The memory dir is a _generated artefact_: the
consolidate/curator/napkin/session-handoff/start-right skills are what populate and maintain it (`generator-first-mindset`).
So the opening pass aligns the **generator** (re-sync the memory-populating skill cluster to main forms), not just the
directory shape. Measured split: memory-governing **rules** unchanged `ad649710`→main; structural **contracts** (READMEs,
substrate-contract, `orientation`) byte-identical pin→main; the **skills** moved (`consolidate-docs`/`session-handoff`/
`curator-pass`/`start-right`). See the sub-plan §2.

**PIN MODEL CHANGED (2026-06-20, owner — supersedes the frozen-SHA model): the pin is a rebased BRANCH, not a frozen
ref.** castr syncs from the local Oak checkout's `practice/castr-pin` branch (created off Oak `main`, currently at
`ad359a4f` = Oak `main` HEAD). **The pin may go stale by design** — its only purpose is to control _when_ castr absorbs
Oak's living Practice; a frozen SHA would eventually import a corpse (stale doctrine/processes), and "a moving target is
a hell of a lot better than doing days of work to import stale doctrine." This supersedes the prior "fixed ref, not a
moving target" framing — a living upstream source is correctly a controlled-moving target (distinct from
`no-moving-targets-in-permanent-docs`, which governs castr's own docs citing moving Oak plans).

### Pin rebase tripwire (run regularly — at minimum each session-open on this thread and at each phase boundary)

```bash
OAK=/Users/jim/code/oak-open-curriculum-ecosystem
git -C "$OAK" fetch origin main
behind=$(git -C "$OAK" rev-list --count practice/castr-pin..origin/main)
echo "pin is $behind commits behind Oak main"
# When behind > 0 and it is a controlled moment to absorb upstream:
git -C "$OAK" branch -f practice/castr-pin origin/main   # rebase the pin to current main
# then re-assess the estate against the new pin (what upstream changed since last sync) and record the new synced SHA + date here.
```

Record each rebase: `synced YYYY-MM-DD → <new-SHA> (was <old-SHA>, +N upstream commits absorbed)`. **Always read the pin
via `git -C "$OAK" show practice/castr-pin:<path>`, never the Oak working tree** — on 2026-06-20 the working tree sat on
an unrelated branch (`practice/transplant-to-castr`, since deleted) and a disk-based search produced a false-absence
error. **Sync log:** `synced 2026-06-20 → ad359a4f (initial branch-pin off Oak main; supersedes the frozen ad359a4f).`
The historical pin notes below are retained as the record of the 2026-06-10→2026-06-17 frozen baselines.

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

- **D1 — Lint-rule parity / warn→error migration — ✅ RESOLVED (2026-06-19).** Owner decision (2026-06-10): **no lint
  rule is ever turned off**; in-flight rules may sit at `warn` transitionally but must return to `error` before the deep
  enhancement is complete (DoD §Transitional gate states). The two sonarjs-4.0.3 rules (`function-return-type` S3800,
  `in-operator-type-error` S3785) were warn-downgraded 2026-06-15 (`3b3f0d9`; 126 = 121 + 5). **Root cause measured
  firsthand 2026-06-19: a TypeScript-version skew** — `eslint-plugin-sonarjs@4.0.3` resolved its bundled TS **5.9.3**
  while the `typescript-eslint` parser built Type objects with the workspace's **6.0.3**, and the two releases renumber
  `ts.TypeFlags`, so the rules masked the wrong bits and mis-fired on type-safe code (the 2026-06-15 report's "suspect"
  framing was right to distrust the earlier guesses; the real cause was neither the rule nor the code — it was the
  environment). **Fixed at root** by pinning a single workspace TypeScript (`pnpm-workspace.yaml`
  `overrides: typescript: 6.0.3`); under aligned TS both rules flag **0** and were **restored to `error`** in
  `lib/eslint.config.ts`. Full `pnpm check` green; the 126 transitional warnings are gone, no rule left at `warn`. Full
  root-cause record: [`d1-sonarjs-findings.md` §0](./d1-sonarjs-findings.md).
- **D2 — Node version policy + single source.** Owner decision (2026-06-10): **Node 24 everywhere; stable LTS is
  always the right choice; advance to 26 only once GitHub _and_ Vercel support it** (named tripwire, not a date).
  Owner already executed the config: `engines: "24.x"` (root + `lib`), CI collapsed to single Node 24 (matrix
  removed), publish on 24. **Remaining (DRY):** Node version is still hardcoded in ~4 places — introduce a single
  source (`.nvmrc` = 24 + `node-version-file:` in the workflows, the Oak standard) so the next LTS bump is one edit.
  **ADR-049 candidate:** "Node version policy — stable-LTS, currently 24, advance only when CI+deploy platforms
  support the next LTS" (repo-specific → ADR per PDR-079). _(Was "ADR-048 candidate"; 048 was taken 2026-06-19 by the
  compiler-internal-split scope ADR homed from the zod-compiler report-plan. Next free ADR number per the ADR index is
  049.)_ _Consideration for the ADR (not a blocker):_ exact-major
  `engines: 24.x` is restrictive for downstream consumers of the published `@engraph/castr`; confirm intent vs a
  `>=24` floor.
- **D3 — CI modernization to the Oak standard.** Oak's CI (observed on the pinned branch) **SHA-pins every action
  with a `# vX.Y.Z` tag comment** (e.g. `actions/checkout@df4cb1c… # v6.0.3`, `actions/setup-node@… # v6.4.0`,
  `pnpm/action-setup@… # v5.0.0`) — movable tags are a supply-chain risk (owner requirement, 2026-06-10). castr's
  workflows are otherwise stale: actions tag-pinned (`@v3`/`@v2`), CI runs only `build` + `test` (NOT the full
  `check:ci` gate chain — so castr's CI does not currently enforce its own gates), and `ci.yml` path filters
  reference `lib/pnpm-lock.yaml` though the lockfile is at the repo root. `publish.yml` invokes a non-existent
  `pnpm release` via changesets the repo does not use. Bring all of this to the Oak standard as one coherent slice.
  **Merge-time implication (2026-06-18 assessment):** because castr's CI does not run `check:ci`, the eventual transplant
  PR would merge to `main` with **no CI gate enforcement** — the per-phase `check:ci` discipline is local-only. Whether D3
  should therefore land _before_ that merge (and whether the ~100k-line single PR is split for reviewability) was
  resolved (Q-001: yes — D3 before the merge, split PRs); see [`delivery-ledger.md`](../../plans/delivery-ledger.md). **D3 is also a prerequisite for _safe_
  Phase-8 concurrency** (concurrent branches must be gate-enforced per branch) — the coupling is mapped in
  [`08-collaboration-active.md` §3](./08-collaboration-active.md).
- **D4 — Quality-gate + further Practice/agent-tools parity.** "Plenty more" still to import from the pinned Oak
  branch beyond Phases 5–9's named estates (additional rules, agent-tools capabilities, agentic-engineering and
  quality-gate machinery). Enumerate against the pinned Oak branch at the Phase-9 verification sweep; until then this
  is the named placeholder so the arc's incompleteness is explicit, not forgotten. **Elevated by the owner's
  2026-06-19 "bring over the FULL Practice" steer:** "transplant finished" is only honest after a **measured gap-scan
  against Oak `ad359a4f`** (`git -C /Users/jim/code/oak-open-curriculum-ecosystem ls-tree -r ad359a4f` — the pin is
  locally inspectable) — what surfaces/rules/agent-tools/protocols exist on the pin but not yet on the branch. Tagging
  Phase 9 without that scan would be a green-but-incomplete claim (the Phase-1b skipped-gate failure mode).

**Completion of the deep enhancement requires the arc AND Phases 0–9 — D1 (every in-flight lint rule back at `error`)
is ✅ done (2026-06-19); CI at the Oak standard (D3) is still pending.** "Transplant phases done" ≠ "deep enhancement
complete."

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

- `NN-<surface>.md` — per-phase sub-plan. Written so far: **`02-agent-tools-build-design.md`** (the hardest phase's full
  build/gate design, captured early so it can't be lost); **`06-memory-and-generator-consolidation.md`** (Phase 6 layout +
  generator); **`07-adapters-and-gate-flips.md`** (Phase 7 — verified scope: 15 templates/18 persona adapters, 87 rules;
  the transplant-vs-build fork SETTLED firsthand at Oak pin `ad359a4f` = **BUILD** a native adapter generator, since Oak
  ships none and hand-maintains its adapters → a Phase-9 back-flow improvement); **`08-collaboration-active.md`** (Phase 8 scope — the firsthand finding that collaboration is mostly
  **activation of already-transplanted machinery**, not a new bring, with the D3 coupling mapped; sequencing unchanged).
- `relevance-ledger.md` — ✅ **seeded 2026-06-05** (finalised Phase 9): full per-surface KEEP / AMEND / DON'T-BRING /
  DORMANT dispositions, the firsthand corrections to the fan-out, and the explicit not-brought + dormant sets.
- `reference-closure.md` — ✅ started: running resolve / rewrite / placeholder / retained-cross-host classification.

> **Continuation surfaces (all updated 2026-06-05 — no session knowledge lost):** this tracker + `relevance-ledger.md` +
> `reference-closure.md` + the parent plan + `.agent/prompts/session-continuation.prompt.md` (§Practice Transplant) +
> `.agent/plans/roadmap.md` + the `.agent/memory/napkin.md` `2026-06-05` entry + the cross-session auto-memory.
