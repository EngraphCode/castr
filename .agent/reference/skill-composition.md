# Skill composition — modes, workflows, programmes

The skill estate is infrastructure for agents: markdown files are load-bearing
architecture, so DRY and single-source-of-truth apply to them exactly as they
apply to code. This reference names the composition hierarchy and the two
rules that make it an architecture rather than a taxonomy. Imported and
adapted 2026-07-20 from the Resonance estate (a private sibling Practice repo —
no public upstream URL exists; source repo-relative path
`.agent/reference/skill-composition.md`; AIP-142; PDR-125 exchange),
mapped onto this estate's skill roster.

## The three layers

- **Modes** — ways of being present to the work: `metacognition` (inward) and
  `reason` (outward). A mode is **entered, not executed**; it cannot be
  summarised into a checklist without ceasing to be itself. Modes have no
  steps to delegate and nothing to loop.
- **Workflows** — bounded compositions with one purpose and (usually) one
  sitting: `concept-exploration`, `free-play`, `retrospective`,
  `knowledge-safety-sweep`, `curator-pass`, `session-handoff`,
  `consolidate-docs`, `plan`, `commit`, `pr-lifecycle`, `semantic-merge`,
  `complex-merge`, `gates`, `tsdoc`, `undo-change`, and kin. A workflow
  summons modes at its judgement moments and may summon sibling workflows
  for sub-purposes.
- **Programmes** — compositions that loop workflows toward a declared
  end-state across sittings: `wrap` (deep closeout to the metaloss fixed
  point), `consolidate-until-done` (grounding + consolidation passes until
  every buffer is drained), `fidelity-review` (capture/diff/disposition
  rounds), and the session-boot compositions (`start-right-*`) and cadence
  harness (`go`) that structure a whole session's execution. A programme
  owns the loop, the exit contract, and the honest partial-exit; the work
  inside each pass belongs to the summoned workflows.

## The two rules

1. **Summon by reference, never inline.** The substance of a composed
   capability lives in exactly one canonical file — the summoned skill, rule,
   or directive. The summoning skill carries only the MOMENT (when to summon)
   and the REASON (what the summons is for there). Restating a summoned
   skill's steps inline is drift-by-duplication: the copies diverge, and the
   divergent copy always loses. The corollary: when a capability appears
   inline in two skills, extract it to its own skill and summon it from
   both — `consolidate-at-second-consumer` applied to skills.
2. **Modes are doors, not steps.** A summons of `metacognition` or `reason`
   is an entry into a different way of attending, with whatever presence
   that costs — never a box the invoking workflow ticks. A failed pass that
   merely restates its inputs is the named failure (each mode's own success
   test governs).

## Current composition map (2026-07-20)

```text
programmes   wrap ────────────────────▶ modes; work-safety evidence;
                                          session-handoff; consolidate-docs
                                          (conditional); retrospective
                                          (offered); owns the metaloss
                                          recursion to its fixed point
             consolidate-until-done ──▶ start-right-quick, consolidate-docs
             go / start-right-* ───────▶ grounding + cadence over everything

workflows    consolidate-docs ─────────▶ modes at drain-open; loss-scan
                                          discipline per knowledge-safety-sweep
             session-handoff ──────────▶ modes at scan-open; loss-scan
                                          discipline per knowledge-safety-sweep
             curator-pass ─────────────▶ modes at pass-open; PDR-130 on
                                          graduations
             pr-lifecycle ─────────────▶ retrospective after significant arcs
             plan ─────────────────────▶ modes at the design gate
             concept-exploration ──────▶ modes as alternating movements;
                                          routes formed decisions to the
                                          estate's formed-decision workflow
                                          (decision lenses, principles.md)
             free-play ────────────────▶ modes at harvest only;
                                          routes shaped seeds to
                                          concept-exploration
             retrospective ────────────▶ modes; free-play optionally;
                                          routes proposals per PDR-130

modes        metacognition, reason (entered everywhere above; owned nowhere
             but their own canonical files)
```

The map is descriptive, refreshed when composition changes; the summoning
skills' own text is authoritative at each edge. (The Resonance original
also carries a standalone `decide` workflow over a `decision-matrix` rule;
this estate's formed-decision machinery is the decision-lens ordering in
`principles.md` plus `present-verdicts-not-menus` — whether to import the
matrix workflow as a first-class door is an open AIP-142 decision, recorded
on that ticket.)
