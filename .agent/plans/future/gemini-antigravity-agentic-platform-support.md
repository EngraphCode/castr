# Plan (Future): Gemini and Antigravity Agentic Platform Support

**Status:** Planned
**Created:** 2026-03-09
**Last Updated:** 2026-03-09

---

## Goal

Add first-class Gemini and Antigravity support to Castr's canonical-first agentic infrastructure without duplicating doctrine or weakening the thin-wrapper model.

This work follows two earlier slices:

- the completed Practice integration slice that landed on 2026-03-09
- the completed `core-agent-system-and-codex-agent-adapters` slice that landed on 2026-03-09

---

## Summary

The current restructuring deliberately installs:

- canonical content in `.agent/`
- cross-platform skill wrappers in `.agents/skills/`
- platform-specific wrappers as thin metadata layers
- the local Practice spine needed to host a fuller agent architecture later

That foundation, plus the completed core-agent-system slice, should make Gemini and Antigravity support an additive platform-integration slice rather than a second restructuring.

The missing work after the active slice is therefore cross-platform adaptation, not canonical agent installation from scratch.

---

## Locked Defaults

1. Gemini support builds on canonical `.agent/skills/` plus `.agents/skills/` wrappers.
2. Gemini-specific future work will add first-class Gemini agent support and any required project settings guidance, using the thinnest validated wrapper shape the official docs support.
3. Antigravity-specific future work begins with a **doc-validation tranche** against the official docs before adapter implementation.
4. This future slice assumes the canonical reviewer/domain-expert layer already exists in `.agent/` before Gemini / Antigravity adapters are added.
5. No platform wrapper may become a second home for substantive doctrine, workflow logic, skill content, or agent logic.
6. Canonical agent content should live in `.agent/sub-agents/` (or the local equivalent chosen during implementation), with thin platform adapters layered on top.

---

## Scope

In scope:

- Gemini wrapper and agent support design
- Antigravity rules/workflows/skills support design
- validation that Gemini / Antigravity map cleanly onto the already-installed canonical agent system
- platform-specific adapter directories and conventions
- any remaining platform-facing decisions required to expose existing reviewer and domain-expert roles cleanly

Out of scope:

- changes to product runtime behavior
- doctrine duplication in platform wrappers
- relaxing the canonical-first model for convenience
- inventing a large agent roster without a clear invocation model and durable ownership boundaries

---

## Tranche 0: Validate Official Platform Docs

Before implementation, validate the current official documentation and lock the exact wrapper conventions.

Reference URLs:

- `https://geminicli.com/docs/cli/skills/`
- `https://geminicli.com/docs/core/subagents/`
- `https://antigravity.google/docs/rules-workflows`
- `https://antigravity.google/docs/skills`

Deliverable:

- a short durable note confirming the validated directory and wrapper conventions for Gemini and Antigravity

Supporting context to consult in this tranche:

- `.agent/practice-context/outgoing/platform-adapter-reference.md`
- `.agent/practice-context/outgoing/reviewer-system-guide.md`
- `.agent/practice-context/outgoing/starter-templates.md`

These files are not canonical, but they capture proven adapter shapes and a mature three-layer reviewer model that should inform the validation and design work.

---

## Tranche 1: Reconcile Gemini / Antigravity With The Installed Agent System

1. Read the outcome of the installed core-agent-system / Codex slice.
2. Validate that the canonical reviewer and domain-expert structure exposes the right stable targets for Gemini / Antigravity adapters.
3. Decide how Gemini, Antigravity, Cursor, Claude, and Codex should express the same canonical agent roles without duplicating logic.
4. Capture any residual layer-boundary adjustments required for platform compatibility, but keep canonical ownership in `.agent/`.

---

## Tranche 2: Gemini Support Design

1. Confirm how Gemini CLI discovers skills and subagents.
2. Decide the exact relationship between:
   - `.agent/skills/`
   - `.agents/skills/`
   - canonical agent templates
   - Gemini-specific wrappers / commands
3. Define thin Gemini wrappers that point only to canonical content.
4. Decide how Gemini should expose both:
   - command-shaped workflows
   - reviewer / domain-expert agent roles
5. Document any Gemini-specific environment or project metadata required.

---

## Tranche 3: Antigravity Support Design

1. Validate Antigravity's rules/workflows and skills model against the official docs.
2. Determine whether Antigravity maps more naturally to:
   - canonical rules + wrappers
   - canonical commands + wrappers
   - canonical skills + wrappers
   - canonical agent templates + wrappers
3. Define the thinnest possible Antigravity adapter layer.
4. Document any areas where Antigravity requires a different but still canonical-first shape.

---

## Tranche 4: Install Gemini / Antigravity Adapters

1. Install Gemini-facing wrappers for the already-existing minimum viable reviewer roster.
2. Install Gemini-facing wrappers for the domain-expert agents that already clear the bar for recurring use.
3. Add any Antigravity-facing rules, workflows, skills, or agent wrappers validated by the doc-validation tranche.
4. Add any necessary validation so canonical agent templates and Gemini / Antigravity wrappers stay in sync.

---

## Acceptance Criteria

- Gemini support has a documented first-class wrapper model
- Antigravity support has a validated wrapper model based on the official docs
- Gemini and Antigravity clearly target the installed canonical agent layer rather than inventing parallel logic
- Castr has a documented cross-platform mapping for its installed reviewer and domain-expert agents
- no substantive skill or doctrine logic lives outside `.agent/`
- no substantive agent logic lives outside the canonical agent layer
- repo entrypoint and practice-index docs are updated if new platform files are introduced

---

## References

- `.agent/practice-core/practice.md`
- `.agent/practice-core/practice-bootstrap.md`
- `.agent/plans/current/complete/core-agent-system-and-codex-agent-adapters.md`
- `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md`
- `.agent/practice-context/outgoing/platform-adapter-reference.md`
- `.agent/practice-context/outgoing/reviewer-system-guide.md`
- `.agent/practice-context/outgoing/starter-templates.md`
