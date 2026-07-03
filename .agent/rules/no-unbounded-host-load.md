# No Unbounded Host Load

The host machine is a shared substrate: the owner's computer, every live
agent session, every gate chain, and every monitor run on it together.
Saturating it is a denial of service against all of them at once — and the
damage is invisible to agents, who watch comms, git, and PRs but not the
host, so the symptoms get misattributed to tooling.

**Owner directive (maximum severity): this must never happen again.**

## Rule

1. **No experiment gets host-level load by default.** Before spawning ANY
   synthetic load, ask whether the effect can be provoked in-process —
   fake timers, deterministic interleaving, injected delays. For timer
   races and scheduling flakes the in-process route almost always
   suffices; ambient host load is the wrong instrument and was not shown
   necessary even in the founding instance.
2. **Any spawned process is bounded, owned, and reaped — by construction.**
   - _Bounded_: a lifetime limit built into the invocation — GNU
     `timeout <seconds> <cmd>` where available; on macOS (which ships no
     `timeout` — the founding incident's own platform) use the repo's
     documented substitute `perl -e 'alarm <seconds>; exec @ARGV' -- <cmd>`
     (see the `codex-helper` skill §Timeout and Long-Running Tasks). Never
     an open-ended loop the spawner promises to remember.
   - _Owned_: the spawn is recorded (pid captured) at the moment it
     happens.
   - _Reaped with proof_: the spawning step ends with a process census —
     `ps` evidence of zero survivors — not an assumption. A reaping
     intention that lives only in prose does not count; the evidence is
     that prose discipline does not fire under context pressure.
3. **Proportionality if load is genuinely required**: bounded duration,
   `nice`d below interactive priority, never per-core saturation of the
   shared host, and announced (a comms event naming the load, its bound,
   and its purpose) so peers can attribute slowdowns correctly.
4. **Host health is a first-class signal — read it with platform-correct
   signals.** Check host saturation at session bootstrap and before/after any
   load-bearing experiment. A genuinely saturated host is a stop-and-surface
   signal — never background noise to work around. **But read the right signal
   for the platform**, or a healthy host reads as a starved one. On Linux,
   load-average-vs-core-count plus swap pressure is the reading. **On macOS that
   reading over-reads and false-positives**: macOS load-average counts
   I/O-blocked / uninterruptible threads, so it sits well above core count on a
   healthy machine, and a large `vm.swapusage` "used" figure is normal proactive
   paging of inactive pages, not memory exhaustion. The macOS-correct saturation
   signals are **CPU idle %** (`top -l1`, Activity Monitor) and the
   **memory-pressure colour** (green / yellow / red) — not load-avg-vs-cores or
   raw swap-used. Owner-evidenced upstream (Oak, 2026-06-28): a session-long
   ~16–22/14 "load" + ~5 GB swap-used, read as host pressure by more than one
   agent, was shown healthy by Activity Monitor (CPU idle 67.7 %,
   memory-pressure green) — a Linux-shaped misread; castr's own false-caution
   instance validated the same amendment. The founding worked instance below
   was a _genuine_ host-load DoS, so the rule's force is unchanged; what
   changes is that on macOS load-avg and swap-used alone do not establish
   saturation.

## Worked Instance (founding)

An agent investigating a timer-race flake spawned 14 per-core
`node -e "for(;;){…}"` busy-loops inline and never reaped them. Orphaned
to the OS init system, they pegged every core for seven hours, drove
~26 GB of swap, degraded every concurrent session, and corrupted the day's
diagnostics — watcher drain-timeout deaths were misattributed to
comms-directory scale until a host audit found the loops. The owner's
review doubts the load was necessary at all: the race class is provocable
in-process. This rule is the durable cure for that founding incident.

## Enforcement

- The innate-immunity hook (`.agent/hooks/policy.json`) blocks the
  unambiguous busy-loop and load-tool shapes in commands (`for(;;)`,
  `while(1)`, fork bombs, `stress-ng`) with a reappraisal pointing here.
  These entries use `match: "substring"` because the shape hides inside one
  quoted token and a token-sequence trip cannot see into it (the founding
  command carried its busy-loop as one quoted argument). The hook is a
  tripwire for the worst shapes, not the boundary of the rule:
  bounded-owned-reaped applies to every spawn.
- `start-right` bootstrap includes the host-health check (§Host health); a
  hot host at session open is surfaced before work starts.
- Monitors and heartbeat loops under platform supervision (`Monitor`,
  cron) are compliant by construction when they sleep between ticks and
  die with the session — this rule does not forbid them; it forbids
  unbounded _load_ and unsupervised orphans.

## Related Surfaces

- [`check-singleton-per-window`](check-singleton-per-window.md) — the
  sibling discipline for the repo's own heavy gate chains.
- The `codex-helper` skill §Timeout and Long-Running Tasks — the
  cross-platform timeout substitute for any spawned sub-agent or command.
