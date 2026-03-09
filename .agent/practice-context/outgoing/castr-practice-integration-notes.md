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

## What Castr Adapted

- local doctrine stayed stronger and more specific than the portable baseline
- `jc-gates` uses Castr's full canonical quality-gate chain, not a reduced portable example
- active-plan lifecycle gained a paused-workstream area because Castr needed a place for incomplete but non-primary workstreams

## What Castr Intentionally Did Not Adopt Yet

- full reviewer/sub-agent roster installation
- Gemini-specific wrapper implementation
- Antigravity-specific wrapper implementation

## Reusable Lessons

1. Treat the Core as a transfer mechanism, not a second constitution.
2. Rename local authorities when a naming collision obscures the model.
3. If a repo already has stronger doctrine, preserve it and let the Core supply structure, portability, and learning-loop machinery.
4. Distinguish paused work from future backlog when operational focus changes but the unfinished work remains important.
5. When an operational-practice slice completes, explicitly hand the session entrypoint back to the next product workstream so the practice layer does not linger as stale operational state.
