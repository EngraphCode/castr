# Operational Memory

Continuity / session-resume memory. The surfaces here answer the
question _"where are we right now, what's live, what's next."_ They
let the next session (human or agent) recover orientation after any
interruption, handoff, or restart.

See [`.agent/memory/README.md`](../README.md) for the three-mode
memory taxonomy (active / operational / executive). Doctrine for the
continuity-surface split lives in
[PDR-011](../../practice-core/decision-records/PDR-011-continuity-surfaces-and-surprise-pipeline.md)
(portable Practice doctrine).

## Surfaces

| Surface                                                     | Purpose                                                                                                                                                              | Horizon                                                                                                                          | Writers                                                                                                        | Authority                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [`repo-continuity.md`](repo-continuity.md)                  | Canonical repo-level continuity contract                                                                                                                             | Current session to a few sessions                                                                                                | `session-handoff`                                                                                              | Canonical for continuity contract; subordinate to active plans for scope                                  |
| [`threads/<slug>.next-session.md`](threads/README.md)       | Continuity-unit next-session record — identity table + landing target + lane state for a named stream of work that persists across sessions                          | Indefinite; deleted when thread archives                                                                                         | `session-handoff`; each joining session adds/updates its identity row per the additive-identity rule (PDR-027) | Identity + next-session landing + lane state authoritative for the thread; subordinate to plans for scope |
| [`tracks/<thread>--<agent>--<branch>.md`](tracks/README.md) | Single-writer tactical coordination card                                                                                                                             | One focused task or blocker-resolution cycle                                                                                     | The owning agent only                                                                                          | Tactical coordination only; never authoritative for scope                                                 |
| [`pending-graduations.md`](pending-graduations.md)          | Canonical pending-graduations register for owner-gated items, unresolved capture, and extracted recovery-file dispositions; do not create shard-like sidecar buffers | Until every entry has a durable home, unresolved route, explicit withdrawal, or owner direction                                  | `consolidate-docs` / curator passes                                                                            | Live pending-graduations queue substance; not archive material                                            |
| [`open-questions.md`](open-questions.md)                    | Register of non-urgent unresolved planning, design, or process questions                                                                                             | Until answered in place, surfaced to owner, withdrawn, or left open with deferral-honesty                                        | Any agent appends; `consolidate-docs` drains                                                                   | Sibling to pending-graduations; subordinate to active plans, ADRs, and PDRs                               |
| `collaboration-state-conventions.md` (Phase 8)              | Operational guide to live state in `.agent/state/collaboration/` (lifecycle, schema-field provenance, trusted-agents threat model)                                   | Indefinite; evolves alongside `.agent/state/` surfaces — installed with the Phase-8 collaboration machinery                      | `consolidate-docs` and amendments to `agent-collaboration.md`                                                  | Subordinate to `agent-collaboration.md` directive for doctrine                                            |
| `collaboration-state-lifecycle.md` (Phase 8)                | Detailed recipes for opening, refreshing, closing, archiving, and reporting collaboration state                                                                      | Indefinite; evolves alongside `.agent/state/collaboration/` lifecycle rules — installed with the Phase-8 collaboration machinery | Collaboration protocol implementation and remediation passes                                                   | Subordinate to `collaboration-state-conventions.md` for state indexing                                    |

Track cards are git-tracked; multi-agent and multi-location
collaboration flows through the normal git channel. A collaborative
track creates multiple single-writer cards disambiguated by the
filename convention.

**No workstream surface.** Lane state folds directly into the
thread's next-session record (the PDR-027 2026-04-21 Session 5
simplification — the thread↔lane mapping is recorded inline). castr
never introduced a separate `workstreams/<slug>.md` surface. If a
future thread genuinely requires multiple concurrent lanes recorded
out-of-band, that surface may be re-introduced via a fresh PDR-027
amendment; the default is inline lane state, per
[PDR-027 §Amendment Log 2026-04-21 Session 5](../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md#amendment-log).

## Authority Order

The authority order is a **tiebreaker for same-scope conflicts**, not
a gating rule across different-scope claims. When two surfaces
disagree on the same field, the higher-authority surface wins. It
does not mean a higher-authority surface must contain or override
lower-authority surfaces' scope-specific content.

1. **Plans** (`.agent/plans/*/active/*`) — scope, sequencing,
   acceptance criteria, validation.
2. **`repo-continuity.md`** — canonical continuity contract.
3. **`threads/<slug>.next-session.md`** — thread-level identity +
   next-session landing + lane state.
4. **`tracks/*.md`** — tactical coordination only; never
   authoritative for scope.

## Relationship to Other Memory Modes

- **Active memory** (`../active/`) — learning loop (napkin, distilled,
  patterns). Operational memory is NOT a second memory doctrine;
  promotable signals in thread records or tracks route into active
  memory via the normal capture/distil pipeline.
- **Executive memory** (`../executive/`) — organisational contracts.
  Operational memory is short-horizon; executive memory is stable.

## Relationship to Directives

Directives are read-and-internalise (doctrine). Operational memory is
read-and-written (state). The orientation directive
(`.agent/directives/orientation.md`) names the layering contract that
governs how these surfaces compose.
