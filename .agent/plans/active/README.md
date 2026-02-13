# Active Plans

This folder contains the **single next atomic plan** to execute.

The roadmap ties all plans together:

- `.agent/plans/roadmap.md`

All other atomic plans (queued) live under:

- `.agent/plans/current/`

When an atomic plan is completed:

- Move it from `.agent/plans/active/` to `.agent/plans/current/complete/`
- Only move plans from `current/complete/` to `.agent/plans/archive/` when an agreed group of work is complete (as defined in `.agent/plans/roadmap.md`)
