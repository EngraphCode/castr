# Check-Runner Singleton Per Coordination Window

Only **one** agent runs a whole-repo gate sweep (`pnpm check`,
`pnpm test`, large `turbo` invocations) per coordination window.
Multiple parallel runs duplicate ~30s+ of work per run, produce no
marginal signal, and can collide on advisory-orchestrator file
outputs.

This rule complements `session-handoff` step §12 (which directs every
closing agent to run `pnpm check`) by adding an N-agent constraint:
the _team_ runs check once, not N times.

## The Invariant

Per any single coordination window (the period bounded by the most
recent commit-window claim, comms-stream activity, or active source
claim overlap), **at most one agent** runs the whole-repo gate sweep.
The result of that run binds for the window; other agents observe
the result and defer their own run.

## Observable Surface

Until the structural cure lands (rule-scope discussion in
`pending-graduations.md` 2026-05-22 — likely a new `area-kind: gate-sweep`
in the active-claims schema), the observable surface is the
**broadcast convention**:

1. **Before** invoking `pnpm check` (or equivalent whole-repo gate),
   the agent broadcasts a comms event of the shape
   `"Lane <name> running pnpm check, ETA ~30s, will broadcast
result"`.
2. **After** the run completes, the agent broadcasts a result event:
   `"Lane <name> pnpm check: green"` (or `"red <gate>:<file:line>"`),
   carrying the HEAD SHA at run time.
3. Other agents in the window observing the in-flight broadcast
   **defer** their own check run and consume the result event when
   it arrives.

If the result event has not arrived within ~2× the announced ETA, a
peer may take over with a fresh broadcast — the prior agent is
either retired or stalled.

## When the Rule Fires

- Multi-agent sessions (≥2 agents visible in active-claims or comms).
- Any session-handoff window where two or more agents are closing
  concurrently.
- Any time the agent reflexively reaches for `pnpm check` without
  observing the comms stream for a recent in-flight broadcast.

## When the Rule Does Not Fire

- Solo sessions (no peers visible).
- Per-workspace gate runs (the singleton applies to whole-repo
  sweeps, not to scoped workspace gates — these are cheap and
  parallel-safe).
- Targeted gate invocations (`pnpm lint:fix .` on a single file;
  `vitest run path/to/spec`); these do not duplicate the
  whole-repo sweep work.

## Peer-In-Flight Collisions Are Coordination Work, Never Gate-Scoping

Amended 2026-07-03 from an owner ruling plus three worked instances across
two multi-agent windows the same day. A whole-repo gate (pre-push
`format:check`, `check:ci`) that trips on a PEER's in-flight files is not
gate friction to engineer away. Owner ruling (verbatim substance):
whole-repo gates are _"a choice and a necessity, not a friction; for two
agents the answer is coordination, that is all."_ Proposing to scope the
gate to tracked/staged files is the gate-weakening reflex
(`never-disable-checks` family) — the ruling retracted exactly that
proposal.

The discipline pair:

1. **Format docs the turn you author them.** An author who leaves
   unformatted `.agent` markdown in the tree hands every peer's pre-push
   a collision.
2. **Whole-repo gates stay whole-repo.** When a peer's gate trips on your
   in-flight file, the cure is the sanctioned mechanical repair: the
   gate-runner applies `prettier --write` (formatting only, zero content
   change), broadcasts a heads-up naming the file, and the author
   **reloads the file before their next write** so the repair is not
   clobbered. Worked three times (both directions) without content loss.

**Side effect every peer must expect:** a whole-repo `pnpm check` run
transiently deletes and rebuilds `agent-tools/dist`, so a PEER's built-CLI
ceremony (comms send, heartbeat tick, claims, queue) can fail
`MODULE_NOT_FOUND` during the clean→rebuild window (~1 min; two measured
instances, 2026-07-03). Read the in-flight broadcast as "built-CLI surface
unavailable too": defer CLI-dependent ceremony until the result event, and
treat a failed tick inside an announced window as retry-after, not as a
failure to diagnose.

## Why

Owner-stated 2026-05-22 during a session-handoff window:
_"only one agent needs to run check, and one agent already is, so
stop check, and record that invariant, and note that we need some
kind of record of who is running check when"_. The friction this
rule prevents is duplicate ~30s+ work across N agents at session
close, plus the advisory-orchestrator file-collision risk when two
runs overlap.

## Composition

- [`agent-state-observable`](agent-state-observable.md) — agent
  state changes (including in-flight gate runs) must be observable
  to peers. This rule names a specific observable: the in-flight
  check broadcast.
- [`use-agent-comms-log`](use-agent-comms-log.md) — the broadcast
  is a standard comms event; no new transport.
- [`monitor-branch-touched-files`](monitor-branch-touched-files.md) —
  peers observe the comms stream; the singleton convention rides on
  the existing watcher discipline.

## Source doctrine

- [PDR-076 / PDR-076a (Agent Identity Tuple)](../practice-core/decision-records/PDR-076a-agent-identity-tuple-name-and-uuid.md)
  — broadcasts carry the (name, UUID, session_id_prefix) identity so
  peers can attribute the in-flight run.
- [ADR-183 Comms-Event Tag Namespace](../../docs/architecture/architectural-decisions/ADR-183-comms-event-tag-namespace.md)
  — broadcast tags (`gate-sweep:in-flight`, `gate-sweep:result`) sit in
  the comms-event tag taxonomy.
- `pending-graduations.md` 2026-05-22 — structural cure candidate
  (`area-kind: gate-sweep` in active-claims schema) tracked there; this
  rule's broadcast convention is the bridge until that cure lands.

## Structural Cure Pending

The broadcast convention is the immediate cure (zero schema change;
relies on existing comms infrastructure). A more rigorous cure — a
new `area-kind: gate-sweep` claim type that peers observe through
the active-claims registry — remains a candidate in
`pending-graduations.md` 2026-05-22. When that cure lands, this rule
updates to reference the claim type alongside the broadcast.
