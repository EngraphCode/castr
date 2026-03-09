# Plan (Future): Gemini and Antigravity Agentic Platform Support

**Status:** Planned
**Created:** 2026-03-09
**Last Updated:** 2026-03-09

---

## Goal

Add first-class Gemini and Antigravity support to Castr's canonical-first agentic infrastructure without duplicating doctrine or weakening the thin-wrapper model.

This work follows the now-complete Practice integration slice that landed on 2026-03-09.

---

## Summary

The current restructuring deliberately installs:

- canonical content in `.agent/`
- cross-platform skill wrappers in `.agents/skills/`
- platform-specific wrappers as thin metadata layers

That foundation should make Gemini and Antigravity support an additive platform-integration slice rather than a second restructuring.

---

## Locked Defaults

1. Gemini support builds on canonical `.agent/skills/` plus `.agents/skills/` wrappers.
2. Gemini-specific future work will add first-class `.gemini/agents/*.md` support and any required project settings guidance.
3. Antigravity-specific future work begins with a **doc-validation tranche** against the official docs before adapter implementation.
4. No platform wrapper may become a second home for substantive doctrine, workflow logic, or skill content.

---

## Scope

In scope:

- Gemini wrapper and agent support design
- Antigravity rules/workflows/skills support design
- platform-specific adapter directories and conventions
- validation that the canonical-first model maps cleanly onto both platforms

Out of scope:

- changes to product runtime behavior
- doctrine duplication in platform wrappers
- relaxing the canonical-first model for convenience

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

---

## Tranche 1: Gemini Support Design

1. Confirm how Gemini CLI discovers skills and subagents.
2. Decide the exact relationship between:
   - `.agent/skills/`
   - `.agents/skills/`
   - `.gemini/agents/`
3. Define thin Gemini wrappers that point only to canonical content.
4. Document any Gemini-specific environment or project metadata required.

---

## Tranche 2: Antigravity Support Design

1. Validate Antigravity's rules/workflows and skills model against the official docs.
2. Determine whether Antigravity maps more naturally to:
   - canonical rules + wrappers
   - canonical commands + wrappers
   - canonical skills + wrappers
3. Define the thinnest possible Antigravity adapter layer.
4. Document any areas where Antigravity requires a different but still canonical-first shape.

---

## Acceptance Criteria

- Gemini support has a documented first-class wrapper model
- Antigravity support has a validated wrapper model based on the official docs
- no substantive skill or doctrine logic lives outside `.agent/`
- repo entrypoint and practice-index docs are updated if new platform files are introduced

---

## References

- `.agent/practice-core/practice.md`
- `.agent/practice-core/practice-bootstrap.md`
- `.agent/plans/current/complete/practice-core-integration-and-practice-restructuring.md`
