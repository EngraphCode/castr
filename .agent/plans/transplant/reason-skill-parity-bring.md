---
title: Reason skill parity bring — complete the thinking-discipline pair
status: current
lane: current
created: 2026-06-26
last_updated: 2026-06-26
owner_directive: >-
  "And note the new reason skill in the Oak repo, very useful." (owner, 2026-06-26)
  Endorsed sequencing: commit the Oak read-model flip, then do the reason-skill
  parity bring; DC3 remains the dependency-currency lane's next position.
controlling_lane: >-
  .agent/memory/operational/threads/practice-transplant.next-session.md
  § Lane: Oak Parity-or-Better Program
parity_gap: >-
  Newly-discovered unbuilt-capability gap, surfaced 2026-06-26 (post-dates the
  2026-06-20 5-subagent audit). castr has `metacognition` (the inward reflective
  half of a designed pair) but neither `reason` (the outward structured-thinking
  half) nor its depth reference `grammar-of-thinking.md`. Tier-A-flavoured: a
  whole agent-reasoning capability, not a doc nit.
read_model_note: >-
  Oak is read live from `main`, no pin (owner 2026-06-26). All Oak paths below
  are read via `git -C /Users/jim/code/oak-open-curriculum-ecosystem show main:<path>`.
todos:
  - id: R1
    content: >-
      Bring the reason capability as one atomic doc-slice (reference-closure
      requires all three present together): (a) .agent/reference/grammar-of-thinking.md
      (1432 lines, standalone — zero outbound PDR/ADR/link cites, measured); (b)
      .agent/skills/reason/SKILL-CANONICAL.md; (c) the 2-line reason back-link added
      to .agent/skills/metacognition/SKILL-CANONICAL.md (completes the pair). Localise
      the measured Oak-adapter tokens only: oak-reason->reason, oak-metacognition->
      metacognition, oak-plan->plan. Eyeball-review the full 1432-line reference for
      any stray Oak-product example the token scan missed.
    status: pending
    depends_on: []
  - id: R2
    content: >-
      Activate + gate. Regenerate skill adapters
      (`pnpm --filter @engraph/agent-tools skills-adapter-generate --prefix=engraph-`)
      so .claude/skills/engraph-reason + .agents/skills/engraph-reason exist. Run
      skills:check, portability:check, format:check, repo-validators:check (drift +
      reference-closure + subagents). Confirm the skill is DISCOVERABLE/firing (the
      acceptance is "invocable and surfaced", not "file exists"). One commit.
    status: pending
    depends_on: [R1]
---

# Reason skill parity bring — complete the thinking-discipline pair

## End goal

castr's agents structure problems as well as Oak's: the five reasoning moves
(name-the-kind, frame-the-problem, surface-the-warrant, decide-for-reversibility,
stress-test) fire on analysis/decision/diagnosis/design work, with the 1432-line
`grammar-of-thinking` reference behind them for hard cases. The impact is _better
reasoning at the moment of work_, not a file on disk — so acceptance is the skill
**firing**, never merely existing (the napkin headline
`passive-guidance-loses-to-artefact-gravity`: a skill that never surfaces delivers
zero impact, and would be exactly the "imported corpse" the live-main read model
exists to prevent).

## Mechanism

`reason` is the **outward** structured-thinking pair to castr's existing
**inward** `metacognition` skill. castr already ships half the designed pair;
bringing `reason` + its depth reference + the reciprocal back-link in
`metacognition` completes a relationship Oak ships whole. Because the cites
(`PDR-029`, `PDR-035`) already resolve in castr and the reference has no outbound
cascade, the bring is bounded — the work is localisation + activation, not
authoring.

## Transplant-completeness gate (the iceberg principle)

This bring is the **forward exemplar** of the principle the owner named 2026-06-26:
a transplant is complete only when its **supporting infrastructure** resolves — bring
the iceberg, not the tip. Applied here as a hard acceptance gate: every command, path,
skill, and cite the brought surfaces reference must resolve in castr, or be brought in
the same slice. Verified for this bring (firsthand): `reason` references `metacognition`
(present + back-linked by R1), `grammar-of-thinking` (brought by R1), and `PDR-029`/
`PDR-035` (both resolve). `reason` also names `plan` as a _distinct-from_ example only
(not a hard dependency) — the plan skill's own hollow iceberg (its missing templates
library) is tracked and remediated in the sibling plan
[`transplant-completeness-supporting-infrastructure.md`](./transplant-completeness-supporting-infrastructure.md),
whose TC3 markdown-links validator is the structural enforcement of this very gate.

## Means (the measured footprint)

Firsthand-measured 2026-06-26 against Oak live `main`:

| Surface                                                           | Size                                                               | Localisation                                | Disposition       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------- | ----------------- |
| `.agent/reference/grammar-of-thinking.md`                         | 1432 lines, **zero** outbound cites                                | `oak-reason`/`oak-metacognition` (2 tokens) | **BRING** (R1)    |
| `.agent/skills/reason/SKILL-CANONICAL.md`                         | ~80 lines                                                          | `oak-metacognition`/`oak-plan` (2 tokens)   | **BRING** (R1)    |
| castr `.agent/skills/metacognition/SKILL-CANONICAL.md`            | identical to Oak **except 2 missing lines** (the reason back-link) | add the 2-line back-link                    | **EDIT** (R1)     |
| `.claude/skills/engraph-reason` + `.agents/skills/engraph-reason` | generated                                                          | n/a — generator emits                       | **GENERATE** (R2) |

Cite-resolution proof (measured): `PDR-029` and `PDR-035` both exist in
castr's decision-records; `ADR-172` (metacognition's cite) already resolves
(castr's metacognition cites it today). No dangling cites introduced.

## Disposition ledger — the rest of Oak's `reason` estate (nothing silently dropped)

| Oak surface                                                                   | Decision                    | Reason                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/.../191-deterministic-data-surface-agent-reasons.md` (ADR-191)          | **DON'T-BRING**             | Read firsthand: Oak _product_ architecture ("the Agent Is the Only Reasoner" — MCP server / teacher-product boundary, relates ADR-194/107/123). The `reason` skill does not cite it. Out of the capability's scope.  |
| `.agent/memory/operational/threads/reasoning-grammar.next-session.md`         | **DON'T-BRING**             | Oak-instance thread/continuity state, not the portable capability.                                                                                                                                                   |
| `.agent/experience/2026-05-21-reasoning-hygiene-correction-mid-verdict.md`    | **DON'T-BRING**             | Oak-instance experience record (a specific dated session correction) — instance history, not a portable capability. Same class as Oak comms/thread state.                                                            |
| `.agent/memory/active/patterns/citation-as-reasoning-at-moment-of-verdict.md` | **BRING** (own micro-slice) | A portable Practice _pattern_ → bring-by-default (owner 2026-06-26). Not a hard dependency of the reason skill (not referenced by it), so its own small slice rather than blocking R1; localise + reference-closure. |

## Acceptance criteria

R1 (bring): all three surfaces present; the reason skill's two internal links
(`metacognition`, `grammar-of-thinking`) resolve to extant castr paths; the
metacognition back-link resolves to the new reason skill; the 1432-line reference
carries no `oak-`/Oak-product token after localisation (`grep -niE 'oak-|oaknational'`
clean). Proof level: `non-code` (reference-closure + grep).

R2 (activate): `pnpm skills:check` green (adapters generated, `engraph-` prefix);
`pnpm portability:check`, `pnpm format:check`, `pnpm repo-validators:check` green;
the `reason` skill is listed as an available skill (discoverable) — proven by the
skills inventory surfacing `engraph-reason`. Proof level: `non-code` (gate output +
discoverability observation).

## Plan-body first-principles check

Per `.agent/rules/plan-body-first-principles-check.md`: **this is a doc/dir bring
with no product code**, so the landing unit is a validator-gated doc-slice, **not a
TDD cycle** — asserting TDD here would be cargo-culted shape. The honest acceptance
is reference-closure + skills:check + discoverability (the parity program's
established "per doc/dir gap" proof shape), explicitly distinguished from code-bearing
brings that do require Red→Green. Vendor-literal clause: the Oak source is read live
from `main` at execution time (not a pinned SHA) — re-read at execution, do not trust
the line counts/token scans in this plan as frozen (re-measure; Oak main may have moved).

## Risks

- **The 1432-line reference hides a stray Oak-product reference the 2-token scan
  missed.** Mitigation: R1 includes a full eyeball-review pass + a final
  `grep -niE 'oak-|oaknational|clerk|sentry|curriculum'` clean-check before commit.
- **Adapter-naming drift.** castr uses the `engraph-` prefix (verified: existing
  `engraph-metacognition` adapters). Mitigation: use the generator, never hand-author
  adapters; `skills:check --prefix=engraph-` is the gate.
- **Oak main moved since measurement.** Mitigation: re-read live at execution (the
  read-model-note + vendor-literal clause above).

## Non-goals (YAGNI)

- Not bringing ADR-191, the reasoning-grammar thread, the experience file, or the
  citation-as-reasoning pattern (see disposition ledger).
- Not editing `metacognition` beyond the reciprocal back-link (it is otherwise
  byte-identical to Oak — no other divergence to reconcile).
- Not re-sequencing the dependency-currency lane: **DC3 remains its next position**;
  this bring is owner-endorsed new work taken ahead of it, recorded here so the
  queue-jump is explicit, not silent drift.

## Foundation alignment

- `principles.md` / `requirements.md`: castr is a peer agentic platform, parity-or-
  better with Oak (`castr-parity-or-better-with-oak`); bidirectional Practice node.
- `testing-strategy.md`: no product code → validator + discoverability proof, not
  test cycles (see plan-body first-principles check).
- Parity program: this is a new Tier-A-flavoured ledger row; on completion, add a
  back-cite row to `oak-parity-program.md` and run the consolidation/learning-loop.

## Lifecycle triggers

On completion: add the parity-program ledger row + thread-record lane note; run the
consolidation workflow (`engraph-consolidate-docs`) for the new capability surface;
assess whether `dependency-currency-discipline`-style graduation applies. Move this
plan to `active/` when R1 starts; archive per ADR-117 when R2 lands green.
