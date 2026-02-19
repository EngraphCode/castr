# Active Plans

This folder contains the **single next atomic plan** to execute.

The roadmap ties all plans together:

- `.agent/plans/roadmap.md`

All other atomic plans (queued) live under:

- `.agent/plans/current/`

## Execution Contract

- Exactly one executable plan file lives in this folder (plus this `README.md`).
- The plan file in `.agent/plans/active/` is the canonical execution source.
- Same-named files in `.agent/plans/current/session-*` are queue mirrors/pointers only and must not be treated as the execution source.

## Plan Lifecycle

When an atomic plan is completed:

- Move it from `.agent/plans/active/` to `.agent/plans/current/complete/`
- Resolve the next plan from the completed plan's `Successor` field, then copy it from the matching `.agent/plans/current/session-*` queue into `.agent/plans/active/`
- Update the execution status table in `.agent/plans/roadmap.md`
- Update `.agent/prompts/session-entry.prompt.md` so its ACTIVE PLAN link and context match the newly activated plan

## Archival Policy

- Only move plans from `current/complete/` to `.agent/plans/archive/` when an agreed group of work is complete (as defined in `.agent/plans/roadmap.md`)
