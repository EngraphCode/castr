# Agent State

This directory holds **live, ephemeral, signal-like state** that describes
_what is happening now_ in the working tree. It is distinct from
[`.agent/memory/`](../memory/), which holds **durable lessons-learned** that
describe _truth across time_.

`.agent/state/` is materialised as part of the Practice transplant Phase 8
(collaboration ACTIVE). Today it carries the **collaboration** plane; the
runtime coordination machinery (`@engraph/agent-tools` collaboration-state CLI:
claims, comms, identity, heartbeat) writes into it on first use.

## Tracking model: two tiers

`collaboration/` splits into two tiers with a hard content boundary, enforced by
[`collaboration/.gitignore`](collaboration/.gitignore):

- **Instance tier — untracked, preserved on disk** (one checkout's live,
  ephemeral coordination): `collaboration/comms/`, `comms-seen/`, `comms-draft/`,
  `comms-archive/`, `handoffs/` (except its `README.md`), `active-claims.json`,
  `closed-claims.archive.json`, and the generated `shared-comms-log.md`. These are
  absent in a fresh checkout (e.g. CI) and created on first CLI use — their absence
  is the expected clean state, not a fault (the `collaboration-state` validator
  treats them as optional-when-absent).
- **Repo tier — stays tracked** (durable, shared by every clone): this `README.md`
  anchor, `collaboration/conversations/` (decision threads, sidebars, joint
  decisions), `collaboration/escalations/` (owner-facing case resolutions), and
  `collaboration/sidebars/`. These are low-volume decision-provenance surfaces
  `start-right` reads as authority-order context. They are seeded **empty** here —
  no event data is carried over from upstream.

**Standing curation obligation.** Because the instance tier is not carried in git,
durable substance an agent leaves in the comms log is not preserved by git history.
Curating comms-log knowledge — failure-mode / behaviour-note events, decisions,
what-worked instances — into permanent homes (napkin → `distilled.md` → ADR/PDR/
pattern) is therefore a **mandatory, non-optional step** of `session-handoff` and
`consolidate-docs`, not best-effort.

The portable backing for the untracked-instance-tier and class-tiered archive
(rotation = archive, never delete) is Oak **PDR-094 / ADR-199** — a cross-host
reference, not yet hydrated into castr's PDR/ADR estate; the `comms-archive/`
rotation harness (`comms-archive-move`) is a forward Phase-8/D4 capability.

## State vs Memory

| Aspect         | `.agent/state/` (this directory)                 | `.agent/memory/`                                     |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Lifecycle      | Ephemeral; entries archived or expire            | Durable; entries survive across sessions             |
| Shape          | Signal-like (claims, heartbeats, coordination)   | Lessons-learned (patterns, distilled rules, cards)   |
| Truth          | Truth-of-now                                     | Truth-across-time                                    |
| Update cadence | Per-session, per-edit                            | Per-graduation through capture→distil→graduate       |
| Audit          | At consolidation: archive stale, surface anomaly | At consolidation: extract napkin into distilled rule |

The two surfaces feed each other: live coordination state generates evidence;
that evidence is captured in the napkin and graduates into `.agent/memory/`
lessons when patterns earn promotion.
