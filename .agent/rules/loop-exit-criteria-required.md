# Templated Loops Require Exit Criteria

Every `/loop`, cron, scheduled wake-up, or other templated repeating
invocation MUST ship with an explicit exit criterion at invocation
time. Loops without stop conditions become ambient context-budget
tax under team load and silently outrun their useful work
horizon.

## The Invariant

A loop that has been a no-op for **five consecutive iterations**
stops by default, broadcasts a stand-down event to the team, and
closes out. The invoking session (or the owner) may name a
different exit criterion when the loop fires — the default exists
so a loop without an explicit criterion still has one.

"No-op" here means the loop iteration produced no work output,
no comms event addressed to the agent's identity, no claim
change, no commit, and no actionable observation from the
substrate it was watching. Five consecutive such iterations are
the trigger; the count resets on any iteration that produces
work or an observation worth acting on.

## When the Rule Fires

- Every `/loop` skill invocation. The invoking message names the
  exit criterion (e.g. "stand down after 5 idle iterations",
  "exit when claim `<id>` closes", "exit when broadcast event
  `<title>` arrives", "exit after `<n>` iterations"). The five-
  idle-iteration default applies if no criterion is named.
- Every cron or scheduled-wakeup template that hands an agent a
  loop body. The template MUST declare the criterion before the
  loop begins firing.
- Every long-running monitor that drives agent wake-ups via
  repeating prompts. The monitor's exit criterion is part of its
  setup, not an afterthought.

## Template Authorship

If a repo-local `/loop` skill, cron wrapper, scheduled-wakeup
template, or repeating-prompt helper is authored later, it cites this
rule instead of duplicating the doctrine. The template's invocation
contract names the exit criterion field and carries the five-idle-
iteration default by reference to this rule.

## When the Rule Does Not Fire

- One-shot tasks. A single invocation with no repeating template
  is not a loop.
- Event-driven monitors that wake an agent only when a stream
  produces matching output. The wake-up is not a loop iteration;
  the monitor terminates when the stream closes or the agent
  closes it. (See `use-monitor-for-event-driven-wake.md`.)
- Owner-driven manual wake-ups. The owner authoring each prompt
  is the exit criterion.

## Why

Owner-stated 2026-05-23 after a templated-loop cancellation
incident:

> "Every `/loop`, cron, scheduled wakeup must ship with an
> explicit exit criterion (canonical default: 5 consecutive idle
> loops → stand down + closeout broadcast); loops without stop
> conditions become ambient context-budget tax under team load"

The worked instance: a session was placed on `/loop 180s` and
the loop continued firing past its useful boundary because no
exit criterion was named. The owner cancelled it ~90 seconds
later with the corrective signal _"this loop has no natural
off-ramp under the current scoreboard"_. Pre-existing team
`/loop` instances had run for hours past their useful commit
cadence; the recurring pattern is loops outlasting their work
horizon and consuming team context budget while producing
no marginal output.

The five-idle-iteration default is concrete enough to be
applicable without prompting (an agent observing five no-op
iterations does not need to ask permission to stop) and small
enough to prevent the ambient-tax failure mode. Loops with
genuine periodic work continue past five iterations because
their iterations produce work; loops without genuine periodic
work stop quickly.

## Composition

- [`use-monitor-for-event-driven-wake`](use-monitor-for-event-driven-wake.md) —
  event-driven wake-ups belong on Monitor, not on a polling
  loop. This rule covers the polling-loop case; the Monitor
  rule covers the event-driven case. Loops that should be
  Monitor invocations are out of scope here — they are
  mis-shaped to begin with.
- [`agent-state-observable`](agent-state-observable.md) — the
  stand-down broadcast on loop exit is a standard observable
  event; peers see when an idle loop has stood down.
- [`use-agent-comms-log`](use-agent-comms-log.md) — the
  stand-down broadcast uses the standard comms event surface for
  same-instance peers; §Stand-Down Broadcast Shape item 4 governs
  cross-container audiences.

## Stand-Down Broadcast Shape

When a loop hits its exit criterion, the broadcast names:

1. The loop identity (skill name, cron id, monitor id, or
   invocation timestamp).
2. The exit criterion that fired (e.g. _"5 consecutive idle
   iterations"_, _"claim `<id>` closed"_, _"explicit owner
   stand-down"_).
3. A one-line closeout summary — what the loop accomplished
   across its full run, if anything.
4. The surface the broadcast lands on follows the audience: the
   standard comms event surface when the audience shares the
   broadcasting instance, plus tracked repo state on a surface
   the audience grounds on whenever a future container or the
   owner is the audience — instance-tier comms state does not
   cross containers (measured 2026-08-23, proof-programme
   incident I-1; owner ruling QD-5).

The broadcast is a stand-down signal, not a request for
permission. Peers and the owner observe; the loop does not
wait for confirmation before terminating.

## Owner Authority

The owner may override the default at invocation time by naming
a different exit criterion, by extending the idle threshold, or
by authorising "no automatic stop" for a specific loop with a
named end condition the owner will signal. Agent-authorised
overrides are not in scope — an agent invoking a loop without an
explicit owner override carries the five-idle-iteration default.

## Owner Sharpening History

- 2026-05-23 — owner direction captured during a templated-loop
  cancellation incident. Graduated to this rule on the same
  consolidation pass that captured the direction (PDR-076
  consolidation pass, separate lane).
- 2026-08-23 — §Stand-Down Broadcast Shape item 4 added (the
  broadcast surface follows the audience), executing the
  proof-programme QD-5 owner ruling: instance-tier comms state
  proved unobservable across containers (incident I-1), so a
  cross-container loop's durable broadcast is tracked repo state
  on a surface its audience grounds on.
