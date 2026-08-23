# Proof Programme — Incident Register

The tracked, cross-container-readable record of firing-side incidents, established by the
QD-5 owner ruling (2026-08-23; authority
[ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
clauses 6 and 7 as amended). An incident is anything a later firing or the owner needs to
know happened that is neither a blocked queue row nor a queued owner decision: a push
collision, retry exhaustion, an environment anomaly, a stand-down broadcast's durable copy.

**Why this surface exists**: the agent-comms surface
(`.agent/state/collaboration/comms/`) is instance-tier and gitignored — it does not exist
across containers — and session side branches are unread (firings ground on `main` plus the
open programme PR only). A report is durable only as tracked repo state reachable from the
loop's grounding path. Incident records therefore land here **via the ADR-051 clause 6
bookkeeping path** (a bookkeeping PR, or a bookkeeping-scope commit on the open programme
PR's head), the same landing mechanism the failure counters use. A comms event may
accompany a record as a best-effort local echo; it is never the record.

Each entry carries: id (`I-N`), date, firing identity (agent name + session prefix),
class (`collision` | `environment` | `stand-down` | `other`), what happened (with
evidence — SHAs, rejection text, PR numbers), how the firing responded, and any follow-up
routing (queue row, queued decision, or none). Exhausted retries on an external operation
land as `other`, with the exhausted budget named. Entries append at the end; ids are
monotonic (`I-1`, `I-2`, …) — take the next id above the highest present on your
grounding base, re-check it against the freshly fetched heads (base and any open
programme PR) immediately before your final push and renumber yours if it is taken, and
an id collision that surfaces at reconciliation anyway renumbers the later-landed entry
to the next free id.

## I-1 — 2026-08-23 — collision — shared-branch push collision on PR #35 (Tidal Drifting Lighthouse / optimi)

While driving open slice PR #35 (Q-02) per WIP=1, this firing's pushes to
`claude/optimistic-archimedes-vorrwr` were rejected twice in a row — first "fetch first"
(remote at `8f6c5ed`, local base `b66df7d`), then "cannot lock ref … is at `c22d93e` but
expected `8f6c5ed`" — because another writer with push access was landing commits on the
same branch between this firing's fetches and pushes. The evidence proves **asynchronous,
sequential** collision on a shared remote ref, not simultaneity, and does not identify the
writer: the commit pattern (each narrowly answering the single latest Codex/Copilot review
comment within minutes, authored as generic `Claude <noreply@anthropic.com>`, reusing the
PR's original authoring-session URL) fits an automated review-fix responder at least as
well as a peer firing. The session-open claims scan could not have seen it either way:
`active-claims.json` is per-container instance state.

Writer subsequently identified (owner, in-conversation, 2026-08-23, after this entry was
first drafted): the previous scheduled firing — the 01:03 session that authored PR #35 —
was still running seven-plus hours into its firing, driving its own PR's review rounds.
The loop's cadence does not itself bound firing duration, so consecutive firings overlap:
n = 2 live programme sessions is measured reality, not hypothesis. Closed in the same
QD-5 execution by ADR-051 clause 2's firing duration bound and the routine prompt's
overlap guard (head-recency deferral).

Response: reconciled once (adopted the other writer's equivalent, already-CI-green fix for
the same review finding verbatim over this firing's redundant local fix), then treated the
branch as contested — no further pushes, no merge attempt, no new queue-row claim. This
firing's substantive contribution (the QD-4 carry-forward landing — `b66df7d`, riding
PR #35; its QD-4 row reaches the queued-decisions register when that PR merges) survives
as an ancestor of the branch's continuing history and reaches the base at that merge.

Follow-up: the QD-5 ruling (this register; the routine prompt's pre-push head re-check and
contested-branch rule; the ADR-051 clause 6/7 amendments). The residual proactive-signal
gap — no cross-container claim visibility at all — is recorded in the parent plan's Q-15
gap list and revisits only if parallel workers are ever approved.
