# Agent Memory

Three modes of persistent memory, distinguished by refresh cadence,
purpose, and read trigger. Memory is the layer of content that is
_written and read_ (as distinct from directives, which are
_read-and-internalise_ doctrine, and `reference/`, which is
_read-to-learn_ documentation).

## The Three Modes

### [`active/`](active/) — Learning-loop memory

**Purpose**: capture-distil-graduate-enforce. Active memory is the
ongoing learning record — what happened, what surprised us, what's
consolidating into rules.

**Refresh cadence**: continuous during sessions; fitness-governed
rotation.

**Contents**:

- [`active/napkin.md`](active/napkin.md) — ephemeral capture; ~500-line rotation threshold.
- [`active/distilled.md`](active/distilled.md) — refined cross-session lessons.
- [`active/patterns/`](active/patterns/) — ecosystem-grounded pattern instances.
- [`active/archive/`](active/archive/) — napkin rotations and historical capture material.

**Read trigger**: session start (Ground First step 3 of start-right).

### [`operational/`](operational/) — Continuity / session-resume memory

**Purpose**: the repo's answer to _"where are we right now, what's
live, what's next."_ Operational memory is the short-horizon
coordination surface that lets the next session (human or agent)
recover orientation after any interruption.

**Refresh cadence**: per session (`session-handoff` writes; session-start reads).

**Contents**:

- [`operational/repo-continuity.md`](operational/repo-continuity.md) — canonical continuity contract.
- [`operational/pending-graduations.md`](operational/pending-graduations.md) — owner-gated graduation register (consolidation-pass-only).
- [`operational/open-questions.md`](operational/open-questions.md) — non-urgent unresolved decision-shapes for consolidation-time drain.
- [`operational/threads/<slug>.next-session.md`](operational/threads/README.md) — per-thread identity + next-session landing + lane state (PDR-027).
- [`operational/tracks/<thread>--<agent>--<branch>.md`](operational/tracks/README.md) — single-writer tactical coordination cards (ephemeral; resolved-or-deleted at session close).

Lane state folds into each thread's next-session record; castr carries
no separate `workstreams/` surface (PDR-027 2026-04-21 Session 5
simplification).

**Read trigger**: session resume (Ground First step 4 of start-right).

### [`executive/`](executive/README.md) — Organisational / contract memory

**Purpose**: stable schema knowledge about how the repo is organised
— artefact contracts, reviewer catalogue, platform-adapter matrix.
Executive memory is _looked up_ when taking a specific action (e.g.
adding a new skill, choosing which reviewer to invoke), not
internalised before each session.

**Refresh cadence**: only when the artefact architecture itself
evolves (rarely).

**Contents**: see [`executive/README.md`](executive/README.md) for the
surface roster and each surface's bring-status (the executive
catalogues are regenerated to castr's estate during Phase 6; the
collaboration and substrate surfaces land with their Phase-8 /
substrate sub-blocks).

**Read trigger**: ad-hoc lookup when performing an action the surface
governs (adding an artefact, picking a reviewer, checking platform
parity).

## Relationship to Other Layers

| Layer                                       | Purpose                                                      | Surfaces                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Directives** (`.agent/directives/`)       | Doctrine — read-and-internalise; sets stance                 | `AGENT.md`, `principles.md`, `testing-strategy.md`, `requirements.md`, `metacognition.md`, `orientation.md` |
| **Memory** (this directory)                 | Persistent content — read and written; distinguished by mode | `active/`, `operational/`, `executive/`                                                                     |
| **Reference** (`.agent/reference/`)         | Library — read-to-learn about a matter                       | deep-dives, research, audits, reports                                                                       |
| **Practice Core** (`.agent/practice-core/`) | Portable Practice doctrine — travels cross-repo              | trinity, PDRs, patterns, incoming/                                                                          |

## Authority Order (for operational conflicts)

When operational surfaces disagree on the same field, the order is:

1. **Plans** (`.agent/plans/*/active/*`) — scope, sequencing, acceptance.
2. **`operational/repo-continuity.md`** — canonical continuity contract.
3. **`operational/threads/<slug>.next-session.md`** — thread-level identity + next-session landing + lane state.
4. **`operational/tracks/*.md`** — tactical coordination only; never authoritative for scope.

This is a same-scope tiebreaker, not a gating rule across different
scopes. See [`operational/README.md`](operational/README.md) for the
full operational authority contract.
