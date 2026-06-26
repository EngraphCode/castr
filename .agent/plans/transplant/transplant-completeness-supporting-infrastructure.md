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
      Structural cure, step 1 — bring the catch-validators in REPORT mode. Port Oak's
      validate-markdown-links + validate-reference-direction (with their tests) into castr's
      agent-tools validators. Run NON-blocking to ENUMERATE every dangling reference repo-wide —
      the iceberg census that drives TC2 + TC4. TDD (the ported tests are the RED->GREEN evidence).
      Assess machine-local-paths validator (Oak has it; castr has the rule).
    status: pending
    depends_on: []
  - id: TC3b
    content: >-
      Structural cure, step 2 — wire blocking. Add validate-markdown-links + validate-reference-direction
      to repo-validators:check ONLY after every TC3a finding is resolved (TC1/TC1b/TC2/TC4), so the gate
      lands green. Wiring blocking while dangling refs remain would red the gate
      (dont-break-build-without-fix-plan / local-broken-code-never-leaves).
    status: pending
    depends_on: [TC1, TC1b, TC2, TC4]
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

## Acceptance criteria

- **TC1:** all 10 restored proxies resolve — `pnpm agent-tools:check-commit-message`,
  `pnpm agent-tools:repo-check`, etc. exit as their underlying script does (proof: invoke
  each; the commit skill's advisory orchestrator now exits 0 on a clean message). The 2
  owner-disposition rows recorded. Proof level: `non-code` (command invocation).
- **TC2:** `.agent/plans/templates/` present; the plan skill's references resolve; every
  brought template's internal links resolve (proven by TC3's markdown-links validator green).
  Proof level: `non-code` (validator + reference-closure).
- **TC3:** markdown-links + reference-direction validators present, TDD-proven (a fixture
  with a dangling reference fails RED, resolves GREEN), wired into `repo-validators:check`,
  full chain green. Proof level: `unit` + `integration` (gate wiring).
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

Order: **TC1** (independent quick win — unblocks the commit + plan skills immediately) →
**TC3a** (bring the catch-validators in report mode → enumerate the iceberg census) →
**TC1b/TC2/TC4** (resolve every enumerated finding: bring the 2 capabilities, the templates
library, and disposition the rest) → **TC3b** (wire the validators blocking, now that the
gate stays green). The 3a→3b split is the load-bearing constraint: the validator that proves
completeness cannot land blocking until what it flags is fixed. Move to `active/` when TC1
starts; archive per ADR-117 on TC3b green. Lifecycle: run the consolidation/learning-loop on
completion; candidate graduation — a practice-core pattern "transplant completeness = tip + iceberg".
