# Silence Is Never Liveness

Silence from a watcher, monitor, or background task is never evidence
that it is alive and healthy — a dead watcher and a quiet one look
identical. Liveness is claimed only from a positive signal.

## Trigger

Arming any watcher, monitor, poll loop, or long-running background
task; reading any such surface's state before relying on it; noticing
any gap in an expected signal.

## Action

1. **Pair every watcher with a positive deadman signal** at arm time:
   a heartbeat file whose mtime advances (the canonical comms watcher's
   seen-file heartbeat), a periodic emitted line, or an assertion
   command (`comms assert-watcher-live`, F-95). A watcher without a
   deadman pairing is not armed — it is a hope.
2. **Exits are loud, always.** A watcher reaching max-polls, a timeout,
   or any terminal condition emits a visible line AT exit naming why it
   ended. An exit that produces nothing recreates the gap this rule
   exists to close (the buffered-output variant counts: output released
   only after exit cannot wake anyone — stream, never buffer, wake
   signals).
3. **Re-arms carry a deadline-and-default.** Anything that must be
   re-armed (hourly watcher rotations, post-restart recovery) is
   watched by something else or bounded by a declared
   next-active-turn fallback, so a missed re-arm surfaces instead of
   accumulating.
4. **Before relying on any watch, verify the positive signal**, not
   the absence of alarms: stat the heartbeat file, run the assert, read
   the cursor movement. "No alerts" is not a health check.

## Worked evidence (2026-07-31 → 2026-08-01, four incidents, one shape)

An hourly watcher exited routinely and went un-re-armed — a directed
ask sat unabsorbed for two hours; a platform restart silently killed
six monitors at once — only the owner noticed; a single background
task was killed mid-write with no failure output — diagnosed only by
comparing surviving heartbeat streams; a PR watcher buffered its
output until exit — forty polls of history, zero wake signals. Every
one read as quiet until something else exposed it.

## Why a rule, not a PDR clause

One discrete operational invariant (positive-signal liveness) with one
trigger class (watch surfaces) and mechanical actions; it binds every
platform's sessions, which is exactly the rules corpus's job. The
per-surface mechanics (which heartbeat, which assert) stay in the
surfaces' own rules — this rule is the invariant they share.

## Related surfaces

- [`comms-all-channels-watcher`](comms-all-channels-watcher.md) — the
  canonical watcher's own heartbeat + F-95 assert mechanics.
- [`liveness-heartbeat-cron`](liveness-heartbeat-cron.md) — outgoing
  seat liveness; the peer-facing twin of this rule's self-facing
  invariant.
- [`use-monitor-for-event-driven-wake`](use-monitor-for-event-driven-wake.md)
  — the wake mechanics this rule's signals ride on.
