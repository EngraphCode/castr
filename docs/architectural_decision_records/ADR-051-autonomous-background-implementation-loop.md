# ADR-051: Autonomous Background Implementation Loop for the Proof Programme

**Status:** Accepted (2026-08-22, W-0 ballot item B-12, walked interactively by the owner;
amended at acceptance: clause 2's default cadence is three firings per day; amended
2026-08-22 by owner ruling resolving queued decision QD-3: clauses 1(b) and 3 govern every
non-draft programme pull request — slice or bookkeeping — because merge safety is
condition-based, never a per-PR approval; amended 2026-08-26 by owner ruling resolving queued decision QD-13: WIP = 1 and
programme-PR classification are guidelines served by reasonable best efforts — "There is
no limit, just a useful guideline, reasonable best efforts are fine" — the drive-or-claim
mechanics stand as written, graded as best-efforts rather than a hard limit; amended 2026-08-23 by owner ruling resolving
queued decision QD-5: firing-side reports — the clause 6 stand-down broadcast included —
are durable only as tracked repo state reachable from the loop's grounding path, landed on
a programme-owned incident register via the plan estate's bookkeeping landing path under
clauses 6 and 3, because instance-tier collaboration state does not exist across
containers; amended 2026-08-23 by owner direction recorded as QD-8: anything blocked on
the owner alerts on the owner's mobile channel the moment the block exists, as a clause 7
interruption class alongside the clause 6 escalations; amended 2026-08-23 by owner
direction resolving queued decision QD-7: an owner-interaction Slack channel — watched by
an owner-configured interactive session, The Watcher, for advisory second opinions and
owner-alert relay — is permitted as an explicit carve-out from clause 7's
no-additional-channel rule, which continues to ban any firing-to-firing channel;
amended 2026-08-24 by owner ruling — decision card, proof-programme loop review
OP-3, all three tightenings approved as recommended: clause 4 gains the
per-finding demonstration requirement for non-blocking classification, the
bounds-not-cures default for findings measured against unbounded external
references, and the consecutive-rounds structural step-back trigger)
**Date:** 2026-08-22
**Related:** `.agent/rules/no-manufactured-permission.md`, `.agent/rules/owner-attention-at-action-moments.md`, `.agent/rules/no-unbounded-host-load.md`, `.agent/rules/loop-exit-criteria-required.md`. This record is self-contained per PDR-105: the proof-programme plan estate implements its contract and hosts the owner acceptance walk, and depends on this ADR — never the reverse. Acceptance is recorded in this file's Status line.

---

## Context

The owner directed (2026-08-22) that the proof programme proceed "gently and slowly but
continually, in the background, without me, until the plan is complete". The repo's doctrine
forbids agents from manufacturing permission, and several programme decisions are
constitutively the owner's. Autonomy therefore requires **standing, written authority** for
the recurring judgement calls a background worker meets — merge, review-bot handling,
escalation, pacing — decided once here rather than re-asked per slice. Cloud sessions are
ephemeral; scheduled Routines can spawn a fresh session per firing, and the Practice estate
(plans, thread records, napkin, handoff) is designed to be the memory between sessions.

## Decision

1. **Mechanism.** A cron Routine spawns a **fresh cloud session per firing**. The protocol
   invariants each firing obeys, in order: (a) check the kill switches (clause 6) and the
   collaboration claims register before acting, deferring on any live collision; (b) enforce
   WIP = 1 (a guideline served by reasonable best efforts, per the QD-13 owner ruling
   2026-08-26 — never a hard limit) — drive the single open non-draft programme pull request (slice or bookkeeping;
   amended per QD-3, 2026-08-22) to merged, otherwise claim exactly one
   eligible queue item; (c) execute one atomic TDD slice (red proof first) through the
   repository's full blocking gates and its mandatory reviewer dispatches — the loop never
   authors, implements, self-approves, and merges without independent review; (d) record
   continuity/handoff per standing practice and stop. No persistent worker session; no
   parallel workers. The programme's plan estate implements this contract and owns the
   concrete queue. Evidence: the platform's fresh-session-per-fire Routine mode and
   completion notifications are confirmed against the live platform API (2026-08-22); an
   end-to-end dry firing (create → fire → fresh session → notification received) must pass
   before any product slice runs through the loop.
2. **Cadence.** Default three firings per day (set by owner amendment at acceptance,
   2026-08-22; the proposal said two). The owner may change cadence at will; agents may
   lower it (never raise it) when firings repeatedly idle. Each firing is bounded to one
   slice; pacing lives in the schedule, not in skipped gates (`no-unbounded-host-load`).
   A firing is also bounded in duration to one cadence interval, with a landing cutoff
   inside it: at three-quarters of the interval a firing stops driving and spends the
   remainder landing its state, so it ends before the next firing is due; a firing that
   overruns anyway is caught by its successor's overlap deferral, which refuses to
   double-drive (amended per QD-5, 2026-08-23 — the schedule does not terminate a
   predecessor, so consecutive firings otherwise overlap, which is how the measured
   push-collision incident arose).
3. **Standing merge policy.** A programme PR — slice or bookkeeping (amended per QD-3,
   2026-08-22) — merges without a per-PR owner ask when all of: every
   check run green on the current head; every review conversation properly and
   proportionately resolved (fixed, or a recorded rejection/carry-forward disposition under
   clause 4); base not diverged from the tested
   head's merge base; diff within the claimed slice's scope (for a slice PR) or the
   counter, incident, and continuity bookkeeping scope (for a bookkeeping PR; scope
   amended per QD-5, 2026-08-23). A state that misses
   these conditions but is remediable — red checks, an un-merged base, an unresolved
   conversation — is driven to them under this ADR's protocol, never queued; only a state
   the loop cannot remedy within its authority queues for the owner, via clause 5. This
   generalises the owner's PR-30 instruction (2026-08-22) into standing
   policy; the QD-3 ruling (in-conversation, 2026-08-22) confirmed its basis: the owner
   does not approve merges but sets the conditions that make a merge safe — "once a PR is
   green and clean it can be merged" — and a routine merge requiring owner intervention is
   a defect in the loop, not a safeguard.
   **Not in force until this ADR is Accepted**: while the Status line reads Proposed, every
   slice pull request — including any pre-ballot slice — merges only on explicit per-PR
   owner approval, exactly as before this record existed.
4. **Review-bot convergence.** At most two fix rounds per PR for automated-reviewer
   findings; a third round of fresh findings is recorded as carry-forward dispositions
   (reply on each thread, queue entry for the substance) and the PR proceeds under clause 3.
   **The cap applies only to non-blocking refinements.** A bot finding that identifies a
   genuine correctness, security, or data-loss defect in the change is blocking in every
   round — it is verified and fixed, or the PR stops and the defect is escalated to the
   owner; it is never carried forward past a merge (`no-warning-toleration`). Human review
   comments are never capped: they are addressed or escalated, always.
   Three tightenings (amended 2026-08-24 by owner ruling — decision card,
   proof-programme loop review OP-3): **(a) non-blocking is a per-finding
   demonstration, never a category grant** — classifying a finding as non-blocking (for
   example "cannot change a proof outcome") requires a demonstration recorded with that
   finding's disposition, and no such classification covers a finding whose mechanism
   mutates data, including mutation during diagnostic formatting; **(b)
   unbounded-reference findings default to bounds, not cures** — where the blocking rule
   above does not already govern, a finding measured against an unbounded external
   reference (vendor internals, all-possible-pathological-inputs) beyond the estate's
   live configuration takes a recorded bound in the artefact under review plus a decline
   reply — clause 3's recorded-rejection disposition — carrying a reopen condition and a
   durable pointer to the entry it lands in its owning home, and an in-loop cure
   requires the configuration to actually exist in the estate; **(c) consecutive rounds
   narrowing one concern trigger a structural step-back** — when two successive review
   rounds each narrow the same concern (the threshold matches this clause's own
   two-round cap; read from the round tally where one is built, and from the PR's own
   review record otherwise), the next response is re-deriving and closing the class
   structurally, never another instance cure; a blocking class is never carried
   forward, and a non-blocking class may instead take this clause's carry-forward
   disposition.
5. **Owner decisions are queued, never made.** A genuine fork is written to a
   programme-owned queued-decisions register — a durable, owner-readable surface in the plan
   estate whose concrete location the plan estate owns — as question + recommendation +
   what-it-blocks; the firing then reroutes to the next unblocked item. Nothing in this ADR
   authorises deciding anything the doctrine reserves to the owner (release claims,
   `principles.md` edits, ADR acceptance, sequencing supersession).
6. **Escalation and kill switches** (exit criteria per
   `.agent/rules/loop-exit-criteria-required.md`, which owns the doctrine this clause
   instantiates). A slice failing two consecutive firings is marked blocked with a written
   diagnosis and skipped; its open pull request, if any, is converted to a draft carrying
   that diagnosis (never closed — the work is preserved) so the WIP rule releases it, and
   unblocking restores it to ready-for-review. The failure and zero-progress counters this
   clause evaluates are durable repo state, persisted and reset by each firing in the plan
   estate's queue (the plan estate owns the concrete surface); the loop-readiness proof must
   demonstrate cross-session read/write before any product slice runs. Three consecutive zero-progress firings → the firing disables the
   Routine and notifies the owner. Every firing-side loop exit — this zero-progress disable,
   a STOP-file observation, and the terminal exit below — additionally records the
   stand-down broadcast `.agent/rules/loop-exit-criteria-required.md` §Stand-Down Broadcast
   Shape requires (loop identity, the exit criterion that fired, a one-line closeout
   summary) as an entry on the programme-owned incident register — a durable, tracked
   surface in the plan estate whose concrete location the plan estate owns — landed via
   the bookkeeping path this clause and clause 3 together authorise, so later firings and
   the owner observe that scheduled execution has stopped (amended per QD-5, 2026-08-23,
   instantiating `loop-exit-criteria-required.md` §Stand-Down Broadcast Shape item 4: the
   agent-comms surface is instance-tier state that does not exist across containers, so
   for this loop's cross-container audience the tracked record is the broadcast; a comms
   event may accompany it as a best-effort same-instance echo, never the record); an owner
   stop applied directly to the Routine needs no broadcast from the loop, as no firing may
   remain to post it. **Red head on arrival** (gates failing for causes outside
   the claimed slice): the firing takes at most one bounded out-of-queue green-the-head
   repair slice through the normal TDD/gate/review path, recorded in the delivery ledger and
   the completion notification; if the head is not green by the end of that firing, it stops
   and notifies, and subsequent firings attempt only head repair until green or the owner
   intervenes; no test is ever skipped, disabled, or quarantined to get green. The owner can
   stop everything at any time by pausing/deleting the Routine or committing a `STOP` file in
   the programme collection; every firing checks both before acting. The loop's terminal
   exit: the queue empty and the programme-complete acceptance met, or an owner close.
7. **Observability.** Fresh-session firings run with completion notifications on; queued
   decisions, blocked slices, and merges are named in the completion summary. The delivery
   ledger and PR history are the audit trail. **Reporting surfaces (amended per QD-5,
   2026-08-23):** a firing-side report intended for later firings or the owner is durable
   only as tracked repo state reachable from the loop's grounding path — the base branch,
   or the open programme PR's head. Instance-tier collaboration state and unmerged session
   side branches are not reporting surfaces. Incidents — push collisions, retry
   exhaustion, environment anomalies, stand-downs — land on the programme-owned incident
   register via the clause 6 bookkeeping path; the report's primary consumer is the next
   firing, with the owner reading in batch, and the owner is interrupted (notification
   beyond the routine completion summary) only for clause 6 escalation events and for
   anything **blocked on the owner** — an owner-blocking question alerts on the owner's
   mobile channel the moment the block exists (amended per QD-8, 2026-08-23; owner
   direction, verbatim: "Whenever something is blocked on me, and an open question will
   always become blocking at some point, assume I am not around, and that an alert must
   be sent via the mobile claude app"). No
   additional live communication channel is introduced for the serialized loop: the shared
   remote is the channel, and its push-time compare-and-swap is the collision primitive,
   checked before every push under the plan estate's firing protocol. One owner-interaction
   carve-out exists (amended per QD-7, 2026-08-23, owner direction): a Slack channel
   watched by an owner-configured interactive session ("The Watcher") may carry a firing's
   advisory second-opinion asks and owner-alert relays — owner-facing traffic only,
   advisory replies never owner authority, and never a firing-to-firing channel or a state
   store; durable state still lands only as tracked repo state. Revisiting that
   choice is coupled to the parallel-workers alternative below: approving parallel workers
   must bring a real-time claim mechanism with it.

## Consequences

- The programme progresses without owner attendance between ballots; owner effort
  concentrates into ballots and queued-decision batches.
- A push that would previously have waited on an ad-hoc "you may merge" now merges under
  clause 3 — the loop can actually finish slices. The cost is accepted: a bad merge is
  revertible, and the gate surface (full `check:ci`, review convergence, scope check) bounds
  the risk.
- Review-bot feedback cannot stall the loop indefinitely (clause 4), at the cost of some
  valid bot findings landing later via the queue rather than in the originating PR.
- If the Routine platform is unavailable or the subscription pauses, the loop suspends
  safely: state is entirely in the repo, so any future firing resumes from the queue.

## Alternatives considered

- **One persistent self-rescheduling session** — rejected: context accumulation, container
  reclamation, and drift; violates the fresh-grounding practice the estate is built for.
- **Parallel workers over the claims machinery** — rejected for now: concurrency contradicts
  "gently and slowly" and buys conflict risk; revisit only by owner decision.
- **Per-PR owner merge approval** — rejected: throttles the loop to owner availability,
  contradicting the directive; clause 3's conditions preserve the same bar the owner applied
  to PR 30.
