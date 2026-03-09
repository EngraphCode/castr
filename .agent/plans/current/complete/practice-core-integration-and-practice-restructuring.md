# Plan: Practice Core Integration and Canonical-First Practice Restructuring

**Status:** Complete
**Created:** 2026-03-09
**Last Updated:** 2026-03-09
**Related:** `.agent/practice-core/*`, `.agent/practice-context/*`, `.agent/prompts/start-right.prompt.md`, `.agent/prompts/session-entry.prompt.md`, `.agent/plans/active/`

---

## Summary

This workstream made practice integration the temporary primary active slice and integrated the imported Practice Core into Castr's existing practice so the result is one stronger local Practice, not two parallel systems.

This slice is a **clean-break doctrine rename** plus a **canonical-first restructuring** of the repo's agentic infrastructure.

It:

- renamed the legacy doctrine file to `.agent/directives/principles.md`
- created the missing local-practice spine (`AGENT.md`, `metacognition.md`, `practice-index.md`, root entrypoints)
- align current Cursor/Codex artifacts to the Core's canonical-first model
- add the knowledge-flow scaffolding the repo does not yet have
- evolve `.agent/practice-core/` into a true Castr descendant of the portable Core
- document Gemini/Antigravity support as explicit future work without implementing it yet

This slice will **not** implement Gemini/Antigravity adapters.

---

## Completion Notes

Completed on 2026-03-09.

Key outcomes:

- the local-practice spine now exists under `.agent/directives/AGENT.md`, `.agent/directives/metacognition.md`, and `.agent/practice-index.md`
- canonical commands, skills, rules, memory, and experience scaffolding now live under `.agent/`
- thin wrappers now exist under `.agents/`, `.cursor/commands/`, `.cursor/rules/`, `.cursor/skills/`, and `.codex/skills/`
- the unfinished Zod workstream was parked cleanly, then later restored as the active successor once this slice completed
- future Gemini / Antigravity support is documented in `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`

Verification outcome:

- the full canonical quality-gate chain passed on 2026-03-09 after the restructuring landed
- repo-wide live references to the legacy doctrine path were eliminated with no compatibility alias left behind

---

## Locked Decisions

1. This was the **primary active workstream** during the restructuring slice.
2. The legacy-doctrine-file -> `principles.md` transition is a **clean break** with no compatibility alias.
3. The unfinished Zod workstream moves to `.agent/plans/current/paused/zod-round-trip/`.
4. Gemini/Antigravity support is future-scope only, but must be documented durably now.
5. The integrated architecture uses the portable Core's naming model:
   - `principles.md` = authoritative doctrine
   - `.agent/rules/*.md` = operationalized subsets of doctrine
   - platform wrappers = thin activation metadata only
6. Codex skill content moves to canonical `.agent/skills/` plus `.agents/skills/` wrappers; `.codex/` stops being the home of skill logic.

---

## Intended Impact

We are optimizing for:

- a clearer repo practice with no "rules vs rules" naming collision
- a stronger local system that preserves Castr's existing doctrine instead of flattening it
- a portable Core that can later be passed on as Castr's evolved Practice Core
- future-friendly agentic infrastructure that can add Gemini/Antigravity without another architectural rewrite

---

## Scope

In scope:

- doctrine rename and repo-wide reference migration
- local-practice spine creation
- canonical-first commands / skills / rules restructuring
- Cursor and Codex adapter alignment
- knowledge-flow scaffolding
- paused-workstream lifecycle introduction
- practice-core provenance/changelog evolution
- future Gemini/Antigravity documentation outputs

Out of scope:

- product-code feature work
- Gemini CLI adapter implementation
- Antigravity adapter implementation
- full reviewer/sub-agent roster implementation beyond structural scaffolding
- temporary compatibility aliases for the legacy doctrine filename

---

## Current-State Baseline

Current strengths:

- strong directives (`principles.md`, `testing-strategy.md`, `requirements.md`, `DEFINITION_OF_DONE.md`)
- strong prompts (`start-right.prompt.md`, `session-entry.prompt.md`)
- strong active-plan contract and roadmap discipline
- imported Practice Core already present in `.agent/practice-core/`

Current gaps:

- no `.agent/directives/AGENT.md`
- no `.agent/directives/metacognition.md`
- no `.agent/practice-index.md`
- no root `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`
- no canonical `.agent/commands/`
- no canonical `.agent/skills/`
- no `.agent/memory/` or `.agent/experience/`
- only one canonical rule in `.agent/rules/`
- current Codex skill lives in `.codex/skills/`, which conflicts with the Core's intended model
- current active-plan lifecycle previously had no paused home for incomplete but non-primary workstreams

---

## Execution Tranches

### Tranche 0: Repoint the active workstream cleanly

1. Define paused-workstream lifecycle under `.agent/plans/current/paused/`.
2. Park the unfinished Zod workstream under `.agent/plans/current/paused/zod-round-trip/`.
3. Create this active plan and make it the primary session entrypoint.
4. Update `session-entry.prompt.md`, `roadmap.md`, and `active/README.md` so they all agree on:
   - this plan as primary
   - the paused Zod workstream location
   - future Gemini/Antigravity documentation work

### Tranche 1: Rename doctrine authority with a clean break

1. Rename the legacy doctrine file to `.agent/directives/principles.md`.
2. Update live repo references across docs, prompts, comments, tests, rules, and wrappers.
3. Remove or replace `.cursor/rules/best-practice.mdc`.
4. Leave zero live legacy-doctrine-path references and no compatibility alias.

### Tranche 2: Install the local-practice spine

1. Add `.agent/directives/AGENT.md`.
2. Add `.agent/directives/metacognition.md`.
3. Add `.agent/practice-index.md`.
4. Add root `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
5. Update `start-right.prompt.md` to read from the new doctrine chain and practice box.

### Tranche 3: Create the canonical-first operational model

1. Add canonical commands under `.agent/commands/`.
2. Add canonical skills under `.agent/skills/`.
3. Convert the existing Codex `castr-start-right` skill into canonical content plus thin `.agents/skills/` wrappers.
4. Add `.cursor/commands/` wrappers.
5. Add canonical rules under `.agent/rules/` and granular Cursor wrappers.

### Tranche 4: Install the knowledge flow and descendant-Core updates

1. Add `.agent/memory/` and `.agent/experience/`.
2. Wire napkin capture and distillation into the commands/rules/skills model.
3. Update `.agent/practice-core/` provenance and changelog as a Castr descendant.
4. Add `.agent/practice-context/outgoing/castr-practice-integration-notes.md`.

### Tranche 5: Document future Gemini/Antigravity support

1. Create `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`.
2. Update `roadmap.md` to reference it separately from the product ecosystem plan.
3. Lock these defaults:
   - Gemini support builds on canonical `.agent/skills/` plus `.agents/skills/` wrappers.
   - Gemini-specific future work will add first-class `.gemini/agents/*.md` support and any necessary project settings guidance.
   - Antigravity-specific future work begins with a doc-validation tranche against the official pages before adapter implementation.

---

## Documentation Outputs Required

- `.agent/prompts/start-right.prompt.md`
- `.agent/prompts/session-entry.prompt.md`
- `.agent/plans/roadmap.md`
- `.agent/plans/active/README.md`
- root `README.md`
- `.agent/practice-core/practice.md`
- `.agent/practice-core/practice-lineage.md`
- `.agent/practice-core/practice-bootstrap.md`
- `.agent/practice-core/CHANGELOG.md`
- `.agent/practice-context/outgoing/castr-practice-integration-notes.md`
- `.agent/plans/future/gemini-antigravity-agentic-platform-support.md`

---

## TDD / Validation Order

For this mostly structural slice, "tests first" means reference and contract validation before broad edits:

1. create a failing reference inventory for current legacy-doctrine-path usage and adapter drift
2. add or update structural validation checks for:
   - broken links / missing files
   - zero remaining legacy-doctrine-path references
   - canonical-vs-wrapper thinness
3. perform the rename and structure work
4. re-run the structural validation checks
5. run the full repo quality gates one at a time in canonical order

---

## Acceptance Criteria

- `principles.md` exists and is the sole authoritative doctrine file at that layer
- there is no compatibility alias or live repo reference left to the legacy doctrine path
- `AGENT.md`, `metacognition.md`, and `practice-index.md` exist and form a coherent local-practice entry chain
- root `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` exist and point into the local chain
- canonical commands, skills, and rules exist in `.agent/`
- Cursor and Codex wrappers are thin and point to canonical content
- `.codex/skills/` no longer contains substantive skill logic
- `.agent/memory/` and `.agent/experience/` exist and are wired into the practice flow
- the Zod workstream no longer lives as unrelated plans in `active/`
- `.agent/practice-core/` reflects a real Castr descendant via provenance and changelog updates
- a dedicated future plan exists for Gemini/Antigravity support with explicit official references and a validation-first Antigravity tranche
- session entry, roadmap, and active-plan docs all agree on the new primary workstream
- all quality gates pass

---

## Assumptions

- this is an operational-practice workstream, not a product feature phase
- the paused location is `.agent/plans/current/paused/`, with a subdirectory per paused workstream
- current product roadmap phases remain valid and are not renumbered to absorb this practice work
- Gemini support is future-scope, but current use of `.agents/skills/` is intentionally chosen to align with Gemini CLI's documented alias model
- Antigravity support remains future-scope and must start with official-doc validation before implementation details are locked
- reviewer/sub-agent implementation beyond structural preparation is deferred unless needed to complete the canonical-first integration cleanly
