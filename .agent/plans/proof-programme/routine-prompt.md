# Proof-Programme Firing Prompt

This is the standing prompt each scheduled firing of the proof-programme Routine receives
(ADR-051, Accepted 2026-08-22; fresh cloud session per firing, three per day). You are a
zero-context session: this file plus the repo surfaces it names are your whole brief.
Authority: [`parent-plan.md`](./parent-plan.md) (the queue and §Operating protocol) and
[ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md).

## Exit criteria (declared before anything runs)

- **This firing** ends when it has driven or advanced exactly one slice (or completed one
  bounded red-head repair), or determined it must idle/defer — in every case landing its
  counter update and closing with handoff. One slice per firing, never more.
- **The loop** ends when the queue is empty and the programme-complete acceptance is met, or
  the owner closes it, or the kill switches below fire. Three consecutive zero-progress
  firings → disable the Routine, notify the owner, and post the stand-down broadcast.

## Protocol, in order

1. **STOP check (exact path, before anything opens a claim)**: if the file
   `.agent/plans/proof-programme/STOP` exists, post the stand-down broadcast (below,
   criterion "STOP file present"), do nothing else — no grounding, no claim — and end the
   session. Check the literal path — no glob, no interpretation. This runs first so the
   kill switch never leaves a live claim behind (ADR-051 clause 1 ordering).
2. **Dry-run detection (before anything opens a claim)**: when the firing's message
   carries an explicit DRY-RUN instruction from the arming session or the owner, take the
   read-only path from here on — ground by READING the directives only, register NO
   active-area claim, and execute only the bounded no-op work the instruction specifies,
   never claiming, driving, or merging any slice or PR — then report criterion "dry-run
   complete" in the stand-down broadcast and completion summary, close with the
   `engraph-session-handoff` skill exactly as step 9 requires (every firing closes with
   handoff, dry runs included — the proof must exercise it), and stop. Detection sits
   before grounding because normal grounding registers a claim, and a proof firing must
   leave no collision state behind.
3. **Ground** (normal firings only), in this order:
   - **Provision the toolchain FIRST**: run `pnpm install`, then
     `pnpm --filter @engraph/agent-tools build`. A pristine checkout has NO git hooks
     wired and no built agent-tools until these run (measured, Q-01 evidence) — a commit
     made before this step bypasses every blocking gate, and the Practice CLIs (claims,
     comms, validators) fail for want of `agent-tools/dist`.
   - **Verify gitleaks**: if `command -v gitleaks` finds nothing, run
     `bash .claude/hooks/ensure-gitleaks.sh` — the idempotent SessionStart provisioner
     (sha256-pinned install; fired sessions may not surface SessionStart hooks, so never
     assume it ran). The blocking `pnpm secrets:scan` must be able to pass BEFORE push;
     CI's copy of the scan runs after the push, which is too late for a leaked secret —
     never skip, bypass, or defer it to CI.
   - Run the `engraph-start-right-quick` skill; register identity per
     `register-active-areas-at-session-open`.
   - **Owner-decision surfacing**: read [`queued-decisions.md`](./queued-decisions.md)
     and carry every entry whose Outcome is OPEN into this firing's step 9 completion
     notification, so the owner is reminded of waiting decisions on every firing, not
     only when one is written.
4. **Claims scan**:
   `pnpm agent-tools:collaboration-state -- claims list --active .agent/state/collaboration/active-claims.json`
   — any live peer or owner claim touching your target surface defers this firing. A
   deferral lands its counter update via the bookkeeping path **only when no non-draft
   programme PR is already open** (step 5's WIP = 1 invariant binds here too — never open a
   second programme PR); when one is open, land the increment as a counter-only commit
   pushed to that open PR's head branch (bookkeeping scope: counter state only, nothing
   else) — it reaches the base when the PR merges, so later firings read a true streak.
   A completion summary is not repo state and cannot carry a counter; a deferral that
   cannot land its increment durably records that failure as a blocker in the summary
   instead of silently dropping it. Then stop.
5. **WIP = 1 — every open non-draft programme PR counts**: if any non-draft programme PR is
   open — a slice PR **or a bookkeeping PR** — drive it to merged (CI, review threads under
   ADR-051 clause 4, merge under clause 3, which covers both PR kinds per the QD-3
   amendment and whose full four-condition bar governs: every check green on the current
   head, every conversation properly and proportionately resolved — fixed or rejected,
   base not diverged from the tested head's merge base, diff within the PR kind's scope)
   and do nothing else. A bookkeeping PR is WIP for
   drive purposes even though merging it never counts as substantive progress — an unmerged
   counter update left behind would let later firings read a stale streak and keep the
   three-idle kill switch from ever firing. Driving a bookkeeping PR is itself
   zero-progress, and THIS firing's increment must land too: push it as a counter-only
   commit onto the bookkeeping PR's head branch **before** merging, so
   one merge carries both firings' counter state — "do nothing else" never waives step 8's
   every-firing counter duty. Otherwise claim the next `pending`
   queue row whose `depends_on` and Gate line are satisfied: mark it `in_progress` in the
   parent plan's frontmatter (rides in your slice PR) and re-verify the brief's premises
   against live state — premises moved means re-adjudicate, not execute.
6. **Execute one atomic TDD slice** per the parent plan's §Operating protocol step 4:
   pre-execution code-expert review (two dispatches) → failing proof → minimal change →
   reviewer pass per `invoke-reviewers` → full gates → PR whose final commit carries the
   slice's state landing (row → `complete`, counters, delivery-ledger row, handoff
   surfaces) → green → merge under clause 3 → orphan continuity commit → stop.
7. **Branches** (each is normal operation, not an error):
   - **Red head on arrival** (gates failing for causes outside your slice): at most ONE
     bounded green-the-head repair slice through the normal TDD/gate/review path, recorded
     in the delivery ledger and the completion summary; still red at firing end → stop and
     notify; subsequent firings attempt only head repair. Never skip, disable, or
     quarantine a test.
   - **Genuine owner fork**: write it to [`queued-decisions.md`](./queued-decisions.md)
     (question + recommendation + what-it-blocks) and reroute to the next unblocked row.
     Never decide release claims, `principles.md` edits, ADR acceptance, or sequencing
     supersession yourself.
   - **Slice fails its second consecutive firing**: mark the row `blocked` with a written
     diagnosis, convert its PR to a draft (never close it), and land the queue-state change
     via the bookkeeping path (row `blocked`, `failures:` count, pointer to the draft's
     diagnosis) so the next firing's scan sees it on the base.
8. **Counters** (durable repo state, parent plan §Failure counters): read
   `zero_progress_streak:` and the claimed row's `failures:` before acting; increment or
   reset as part of your landing. The streak resets only on substantive progress (slice PR
   merged, commit advancing a claimed slice, row completed, head-repair landed, queued
   decision recorded); an idle firing always increments it. An idle or deferring firing
   lands its update as a **bookkeeping PR** (counter/continuity state only, no product
   code; the ADR-051 clause 6 persistence mechanism, merged unattended at the clause 3 bar,
   which covers bookkeeping PRs per the QD-3 amendment; not a slice PR, never substantive
   progress).
9. **Close**: run the `engraph-session-handoff` skill. The completion notification must
   name: what merged, what advanced, queued decisions written, **every queued decision
   still OPEN and awaiting the owner (from the step 3 read — an empty register is stated
   as "no owner decisions waiting")**, blocked slices, counter
   values landed. Never end with the repo red without a clause-6 record, or a PR
   half-driven without the next firing's path clear.

## Stand-down broadcast (used by every loop exit this firing can perform)

```bash
pnpm agent-tools:collaboration-state -- comms send \
  --title "STAND-DOWN proof-programme Routine" \
  --body "criterion: <which>; closeout: <one line of what the loop accomplished>" \
  --platform claude-code --model <your model id>
```

The CLI resolves to the built `agent-tools/dist` artefact, which a pristine checkout lacks
(`use-built-agent-tools-cli`): if the command fails for want of the build, run
`pnpm install && pnpm --filter @engraph/agent-tools build` first — including on the STOP
and dry-run branches, where this build is the one permitted piece of work before standing
down. If the build itself fails, record the stand-down verbatim in your completion summary,
name the failed build, and stop — never skip the record silently.

Post it on: STOP-file observation, the three-zero-progress disable, and the terminal
queue-empty exit. An owner pause applied directly to the Routine needs no broadcast from
you.
