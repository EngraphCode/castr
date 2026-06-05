# Castr Practice Integration Notes

## Purpose

This note explains how Castr integrated the portable Practice Core into an already mature local practice.

## What Castr Adopted Directly

- `principles.md` as the authoritative doctrine name
- `AGENT.md` as the stable local entrypoint
- `practice-index.md` as the bridge between portable Core and local artefacts
- canonical-first commands / skills / rules model
- knowledge-flow scaffolding (`napkin`, `distilled`, code-pattern and experience directories)
- thin wrapper model for Cursor and `.agents/skills/`
- canonical reviewer/domain-expert templates under `.agent/sub-agents/`
- Codex project-agent registration under `.codex/config.toml` and `.codex/agents/`
- repo-owned portability validation in `scripts/validate-portability.mjs`

## What Castr Adapted

- local doctrine stayed stronger and more specific than the portable baseline
- `jc-gates` uses Castr's full canonical quality-gate chain, not a reduced portable example
- active-plan lifecycle gained a paused-workstream area because Castr needed a place for incomplete but non-primary workstreams
- user-directed parking in `active/` is treated as an explicit exception, not as normal companion-plan usage
- the portable agent architecture is described as stageable; the Core should not imply that a reviewer roster is already installed in every receiving repo before that repo chooses to install it

## What Castr Installed In The Follow-On Agent Slice

- the six-agent canonical roster: `code-reviewer`, `test-reviewer`, `type-reviewer`, `openapi-expert`, `zod-expert`, and `json-schema-expert`
- the invocation contract in `.agent/rules/invoke-reviewers.md`
- thin Codex adapters pointing back to canonical templates rather than modelling reviewers as skills
- validation coverage for local `.codex` agent drift and stale pre-installation wording

## What Castr Still Has Not Adopted

- Gemini-specific wrapper implementation
- Antigravity-specific wrapper implementation

## Reusable Lessons

1. Treat the Core as a transfer mechanism, not a second constitution.
2. Rename local authorities when a naming collision obscures the model.
3. If a repo already has stronger doctrine, preserve it and let the Core supply structure, portability, and learning-loop machinery.
4. Distinguish paused work from future backlog when operational focus changes but the unfinished work remains important.
5. When an operational-practice slice completes, explicitly hand the session entrypoint back to the next product workstream so the practice layer does not linger as stale operational state.
6. If a repo is temporarily told to keep non-primary unfinished work inside `active/`, document that as a user-directed parking exception instead of pretending the plans are companions.
7. If the canonical agent architecture is planned but not yet installed, say that plainly in local entrypoints; do not let the portable Core imply a reviewer roster already exists.
8. When incoming Practice-context examples help shape a local validator, absorb the durable rule into repo-owned validation and then clear the transient incoming copies.
