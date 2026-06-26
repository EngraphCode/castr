---
title: Transplant completeness — bring the iceberg, not the tip
status: current
lane: current
created: 2026-06-26
last_updated: 2026-06-26
owner_directive: >-
  "I think your gaps are very clear examples of incomplete transplants, we need to
  bring the supporting infrastructure over, not just the tips of the iceberg ...
  please include resolving that in the plan as well." (owner, 2026-06-26)
controlling_lane: >-
  .agent/memory/operational/threads/practice-transplant.next-session.md
  § Lane: Oak Parity-or-Better Program
sibling_plan: >-
  .agent/plans/transplant/reason-skill-parity-bring.md — the FORWARD exemplar of
  this thesis (a transplant done with its full iceberg). This plan is the BACKWARD
  remediation (transplants already landed tip-only) plus the STRUCTURAL catch.
read_model_note: >-
  Oak is read live from `main`, no pin (owner 2026-06-26), via
  `git -C /Users/jim/code/oak-open-curriculum-ecosystem show main:<path>`.
  Re-measure at execution: counts/inventories below were taken 2026-06-26 and Oak main moves.
todos:
  - id: TC1
    content: >-
      Root-proxy restoration. castr proxies 8 `agent-tools:*` root scripts; Oak proxies 19.
      Restore the 10 whose underlying agent-tools workspace script ALREADY EXISTS in castr
      (only the root proxy was dropped): check-commit-message, check-commit-skill-advisories,
      repo-check, lint, prevent-accidental-major-version, check-blocked-content,
      check-blocked-patterns, codex-exec, codex-reviewer-resolve,
      cursor-session-from-claude-session. Each is a one-line root package.json proxy.
    status: pending
    depends_on: []
  - id: TC1b
    content: >-
      Bring the 2 un-transplanted capabilities (agent-tools source + root proxy): pr-watch,
      install-cursor-statusline. Bring-by-default (owner 2026-06-26: "the default for all
      capabilities is to bring them over, always") — both are agentic Practice/DX infra, not
      Oak curriculum-product tooling, so no deliberate-localisation reason applies. Localise
      Oak tokens; TDD where the brought source carries logic.
    status: pending
    depends_on: []
  - id: TC2
    content: >-
      Bring the plan-templates library (21 Oak files: README + 10 templates + 9 components,
      incl. quality-gates.md, lifecycle-triggers.md, foundation-alignment.md, risk-assessment.md)
      to .agent/plans/templates/. The transplanted plan skill already references them — all
      dangling today. Localise Oak tokens; verify every brought template's internal links resolve.
    status: pending
    depends_on: [TC3a]
  - id: TC3a
    content: >-
      Structural cure — bring `validate-markdown-links` ONLY (scope narrowed after firsthand
      exploration + assumptions-expert/config-expert review). Port the 4 Oak files VERBATIM (zero Oak
      tokens; deps all present; already BLOCKING=false). Add the agent-tools script; do NOT wire into
      repo-validators:check (castr's chain is uniformly blocking — a non-blocking member breaks the
      invariant + buries new findings in pre-push noise; config-expert Option B). 34 ported tests green
      (RED->GREEN port contract) is the precondition; produce + commit the dangling-reference census
      artifact (completeness-reconciled) as the TC2/TC4 input. reference-direction + machine-local-paths
      are SPLIT OUT to their own bring-by-default plans (different concern / topology reconciliation).
    status: done # 2026-06-26: 4 files ported verbatim, 34 tests green, census = 225 broken/642 scanned
      (reconciled), artifact at dangling-reference-census.md. Catches the known templates + ADR-117 gaps.
    depends_on: []
  - id: TC3b
    content: >-
      DECISION (not a foregone blocking-wire) — the gate end-state for markdown-links, informed by the
      TC3a census. "Wire blocking after repo-wide zero" was REMOVED: Oak ships markdown-links report-only
      INDEFINITELY (never burned its backlog), and castr's non-goals exclude the non-transplant debt a
      repo-wide-zero needs. Choose: (a) Oak-parity report-only in-gate, (b) scoped-blocking on
      transplant-completed surfaces via globs, or (c) standalone-forever. Likely owner-facing.
    status: pending
    depends_on: [TC2, TC4]
  - id: TC4
    content: >-
      Bounded dangling-reference sweep. Run the new markdown-links validator + a command-resolution
      check (every `pnpm <script>` a skill/doc references resolves at root — may need a new
      validator or an extension of stale-script-invocations) across ALL transplanted skills/docs.
      Disposition-ledger every finding: resolves / bring-infra / capability-deferred / doc-overclaims.
      Sized to unique gaps, not reference count.
    status: pending
    depends_on: [TC3a]
---

# Transplant completeness — bring the iceberg, not the tip

## Problem and intent

Skills/capabilities transplanted from Oak landed as **tips without their iceberg**:
the canonical file came over, but the supporting infrastructure it references — root
script proxies, the plan-templates library, the validators that police references —
did not. The result is transplanted Practice that **looks** complete (file present,
gate green) but **doesn't work** (the commit skill's advisory pre-screen silently
no-ops; the plan skill points at a templates dir that does not exist). These are not
documentation drift: patching the doc to match reality would **delete the reference
to the missing infrastructure**, hiding the gap and cementing the corpse. The cure is
to **bring the missing infrastructure** so the references resolve — and to install
the structural check that makes a hollow transplant a gate failure, not a lucky catch.

Two concrete gaps surfaced firsthand this session (the commit-skill advisory proxies;
the plan-skill templates dir) are the **seed**, not the scope — measurement showed the
class is wider.

## End goal, mechanism, means

- **End goal:** every reference a transplanted skill/doc makes — command, path, template,
  validator — resolves in castr; and the class cannot silently recur because a validator
  fails the gate when it does not.
- **Mechanism:** transplant completeness is structural, not vigilant. Restore the dropped
  infrastructure (proxies, templates), then bring the _catch-validators_ that are themselves
  un-transplanted iceberg (markdown-links, reference-direction) and wire them into the gate.
  Once the catch exists, the remaining iceberg is enumerated mechanically, not by luck.
- **Means:** TC1 (proxies), TC2 (templates), TC3 (catch-validators — the recur-proof
  core), and TC4 (bounded sweep + disposition ledger).

## The measured iceberg (firsthand, Oak live `main`, 2026-06-26)

### Root-proxy gap — castr proxies 8 of Oak's 19 `agent-tools:*` scripts

| Missing root proxy                 | Underlying castr agent-tools script | Disposition                                                                                                                                                               |
| ---------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| check-commit-message               | **exists**                          | TC1 restore — the commit skill's advisory pre-screen depends on it                                                                                                        |
| check-commit-skill-advisories      | **exists**                          | TC1 restore — same                                                                                                                                                        |
| repo-check                         | **exists**                          | TC1 restore — commit skill references `repo-check -- prettier-staged`                                                                                                     |
| lint                               | **exists**                          | TC1 restore                                                                                                                                                               |
| prevent-accidental-major-version   | **exists**                          | TC1 restore — version guard the commit skill names                                                                                                                        |
| check-blocked-content              | **exists**                          | TC1 restore                                                                                                                                                               |
| check-blocked-patterns             | **exists**                          | TC1 restore                                                                                                                                                               |
| codex-exec                         | **exists**                          | TC1 restore (codex-helper skill)                                                                                                                                          |
| codex-reviewer-resolve             | **exists**                          | TC1 restore                                                                                                                                                               |
| cursor-session-from-claude-session | **exists**                          | TC1 restore                                                                                                                                                               |
| pr-watch                           | **absent**                          | **BRING** (TC1b — full capability: agent-tools source + proxy). Agentic Practice infra, not Oak curriculum-product tooling; bring-by-default.                             |
| install-cursor-statusline          | **absent**                          | **BRING** (TC1b — full capability). Cursor DX wiring; castr already ships Cursor adapters + the Claude statusline (Q-003), so this is the parity piece; bring-by-default. |

### Plan-templates library gap — 21 Oak files, zero in castr

`.agent/plans/templates/` in Oak: `README.md` + 10 templates (active-atomic,
active-plan-index, adoption-rollout, collection-readme, collection-roadmap,
current/future-plan-index, feature-workstream, quality-fix, team-session-plan) + 9
components (`quality-gates.md`, `lifecycle-triggers.md`, `foundation-alignment.md`,
`risk-assessment.md`, `evidence-and-claims.md`, `adversarial-review.md`,
`documentation-propagation.md`, `session-discipline.md`, `substrate-vs-axis-plans.md`,
`tdd-phases.md`). The transplanted plan skill references `templates/README.md` and
several components — all dangling. → TC2.

### Catch-validator gap — the infrastructure that prevents this, itself un-transplanted

Oak wires `validate-markdown-links` + `validate-reference-direction`; castr has neither
(castr has `drift` which Oak lacks — not a substitute). `markdown-links` resolves
path/link references and would have failed the gate on the templates gap. This is the
crux finding: **the validating infrastructure that catches hollow transplants is part of
the iceberg that was left behind, which is precisely why the gaps went undetected.** → TC3.

**The structural catch is PLURAL, not a single validator** (firsthand, reason-skill bring,
2026-06-26): a complete-transplant gate is the **union of detectors by reference _kind_**,
because each kind is invisible to the others' detectors. Path/link refs → `markdown-links`
(TC3); skill-activation wiring (e.g. a `.claude/settings.json` `Skill(<name>)` permission
entry, which markdown-links cannot see) → `portability:check`; `pnpm <script>` command refs →
the TC4 command-resolution check (the `validate-no-stale-script-invocations` family, possibly
extended). TC3b's gate-end-state decision and TC4's command-resolution scope should treat the
catch as this union — **enrich the existing detectors, do not author a standalone "completeness
validator."** Portable kernel graduated to [PDR-096](../../practice-core/decision-records/PDR-096-bring-the-iceberg-transplant-completeness.md)
§Decision part 3.

## Acceptance criteria

- **TC1:** all 10 restored proxies resolve — `pnpm agent-tools:check-commit-message`,
  `pnpm agent-tools:repo-check`, etc. exit as their underlying script does (proof: invoke
  each; the commit skill's advisory orchestrator now exits 0 on a clean message). The 2
  owner-disposition rows recorded. Proof level: `non-code` (command invocation).
- **TC2:** `.agent/plans/templates/` present; the plan skill's references resolve; every
  brought template's internal links resolve (proven by TC3's markdown-links validator green).
  Proof level: `non-code` (validator + reference-closure).
- **TC3a (done):** `validate-markdown-links` ported (4 files verbatim), 34 helper tests green
  (port RED->GREEN contract), standalone agent-tools script added (NOT chain-wired — preserves
  castr's all-blocking-chain invariant), census artifact committed (`dangling-reference-census.md`,
  225 broken / 642 scanned, reconciled). Proof level: `unit` (tests) + `non-code` (census). Note:
  `reference-direction` + `machine-local-paths` validators split to their own bring-by-default plans.
- **TC3b (decision — DECIDED 2026-06-26, owner; was Q-007):** the gate end-state is **scoped-blocking on
  transplant-completed surfaces** (per PDR-096's plural-catch doctrine — new dangling refs there must fail the
  gate), conditioned on **(1)** fixing the `validate-markdown-links` archive-exclusion false-positive (it flags
  legitimate archive-ledger links — resolve link _targets_ into `archive/` even while excluding archive files
  from _scanning_) and **(2)** TC4 defining the transplant-completed surface set (the blocking globs). NOT
  repo-wide blocking (the 225-census is mostly pre-existing castr debt + archive-ledger false-positives; Oak
  never burned its backlog). Implementation: wire the scoped-blocking globs once (1) and (2) hold.
- **TC4:** every dangling-reference finding across transplanted skills/docs has a recorded
  disposition; zero unresolved references remain that are not an explicit deferral with a
  named owner-decision. Proof level: `non-code` (disposition ledger + validator green).

## Plan-body first-principles check

Per `.agent/rules/plan-body-first-principles-check.md`: **TC3 is product code (validators)
→ genuine TDD** (RED: a dangling-reference fixture must fail the new validator before it
exists; GREEN: the validator catches it; never commit the validator ahead of its failing
fixture). **TC1/TC2 are config/doc brings → validator-gated, NOT TDD** — asserting Red→Green
on a package.json proxy line would be cargo-culted shape. Vendor-literal clause: re-read Oak
live at execution — the proxy list, the 21-file template inventory, and the validator source
may have moved on Oak main since this plan's measurement.

## Bring-by-default (the governing disposition)

Owner directive 2026-06-26: **"the default for all capabilities is to bring them over,
always."** The default disposition for any Oak capability is **BRING**; the burden of proof
sits on _not_ bringing — a positive, recorded deliberate-localisation reason (Oak
curriculum-product tooling, or castr's fail-fast-over-result-pattern doctrine). Uncertainty
is **not** such a reason and must never be punted to the owner as a gate (that is the
`no-manufactured-permission` / `dissolve-owner-gating-with-four-lenses` failure this plan
itself tripped on `pr-watch`/`install-cursor-statusline` before correction). This strengthens
`castr-parity-or-better-with-oak`.

## Non-goals (YAGNI)

- Not auditing references that did not originate from an Oak transplant.
- Not bringing Oak product tooling already classified DON'T-BRING by the parity program
  (the only valid non-bring class — a positive deliberate-localisation reason, never uncertainty).
- Not duplicating `reference-closure.md` — that plan tracks transplant reference-closure;
  this plan brings the _validators_ that mechanise it and the _infrastructure_ it assumes.

## Risks and unknowns

- **Scope creep into "audit everything".** Mitigation: disposition-ledger discipline — bound
  to transplant-origin references; size work to unique gaps, not reference count (TC4).
- **The command-resolution check may need a new validator**, not just markdown-links (pnpm
  command refs are not markdown links). Settled at TC4 execution — extend
  `stale-script-invocations` or add a focused validator; recorded either way.
- **Localising 21 template files may surface a deeper Oak-token cascade** than the reason
  reference did. Mitigation: measure each at TC2 execution; the markdown-links validator from
  TC3 gives a mechanical closure check.

## Foundation alignment

- `principles.md` / `requirements.md`: fail-fast and parity-or-better
  (`castr-parity-or-better-with-oak`); a transplant that references absent infrastructure is a
  silent failure the structural cure converts to a loud gate failure.
- `metacognition.md` §Cure Shape — Structural, Not Doc-Patch: TC3 is the structural,
  amortising cure; TC1/TC2 are the once-cures it makes safe and verifiable.
- `testing-strategy.md`: TDD where code (TC3), validator/closure proof where doc (TC1/TC2/TC4).

## Promotion / sequencing

Order (done so far): **TC1 ✅** (proxies — unblocked the commit + plan skills) → **TC3a ✅**
(`validate-markdown-links` ported standalone → census of 225 broken links is the TC2/TC4 input) →
next: **TC1b/TC2/TC4** (resolve the transplant-origin subset: bring the 2 capabilities + the templates
library; disposition the rest — pre-existing castr debt is out of scope) → **TC3b** (DECIDE the
markdown-links gate end-state, census-informed — not a foregone blocking wire). `reference-direction`

- `machine-local-paths` validators are separate bring-by-default plans. Move to `active/` (in progress);
  archive per ADR-117 on TC3b decision + TC2/TC4 disposition-complete. Lifecycle: run the
  consolidation/learning-loop on completion; candidate graduation — a practice-core pattern
  "transplant completeness = tip + iceberg".
