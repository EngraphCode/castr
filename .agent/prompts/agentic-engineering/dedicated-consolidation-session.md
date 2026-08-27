# Dedicated Consolidation Session Prompts

## Skill composition note

`engraph-reason` stays in the composition alongside the newer `engraph-free-play`
and `engraph-concept-exploration` (owner question resolved 2026-08-27): the three
cover different phases, not the same ground. Free play is target-free divergence;
concept exploration shapes a still-unformed question — and its own method runs
alternating metacognition/reason movements, so it composes reason rather than
replacing it; reason is the convergent instrument for formed problems and
decisions. Consolidation dispositions (home, graduate, reject, defer) are formed
decisions, so the base composition keeps reason. Reach for free play or concept
exploration mid-session only when material turns out to be unshaped.

## Base

/goal ultrathink /engraph-metacognition /engraph-reason /engraph-start-right-thorough /engraph-consolidate-until-done

This is a dedicated consolidation session. As always, the goal is knowledge
curation, not chasing fitness numbers. The fitness function results are never the
goal, only conservation of understanding. Take care of the learning and the numbers
will take care of themselves. When you need to make a decision, run it through
the decision lenses and the reflection and reasoning processes
@.agent/directives/principles.md . Deal with discovered and created tombstones
as you go. Done means empty pending graduations and empty buffers.

Subagent results and sources MUST be critically assessed before being accepted or synthesised

Take your time to explore different approaches before you decide how to proceed. It's often a good
idea to start with all of the raw sources, then the napkin, then distilled, then re-assess the
situation. Starting with pending graduations means emptying those buffers then filling them
up again, but sometimes that is the right choice.

## Team Session

/goal ultrathink /engraph-metacognition /engraph-start-right-team
/engraph-consolidate-until-done

This is a dedicated consolidation session. As always, the goal is knowledge
curation, not chasing fitness numbers. The fitness function results are never the
goal, only conservation of understanding. Take care of the learning and the numbers
will take care of themselves.

Subagent results and sources MUST be critically assessed before being accepted or
synthesised

Take your time to explore different approaches before you decide how to proceed. It's often a good
idea to start with all of the raw sources, then the napkin, then distilled, then re-assess the
situation. Starting with pending graduations means emptying those buffers then filling them
up again, but sometimes that is the right choice.

Other agents are working in the repo

## Routine (unattended, scheduled)

The firing prompt for the owner's standing dedicated-consolidation Routine
(fresh session per firing; the cadence, name, and repo attachment are owner-set
in the Routine UI — the repo attachment is load-bearing, without it the firing
lands nothing):

/goal ultrathink /engraph-metacognition /engraph-reason /engraph-proportionality /engraph-plan /engraph-start-right-thorough /engraph-consolidate-until-done

This is an unattended dedicated consolidation session, fired on a schedule with
no owner present. As a cloud-session firing it carries the full mandatory
cloud-session skill stack per the cloud-session grounding contract
(`.agent/claude-harness-integrations/cloud-environment.md`).

FIRST, before any deep work: run the consolidate-docs trigger checklist as a
cheap assessment — the canonical trigger sources and required inventory in
`.agent/skills/consolidate-docs/SKILL-CANONICAL.md` (raw sources, buffers,
pending graduations, active and recent plans, the platform memory surfaces,
tombstones, the practice-core incoming box, and the drift and open-question
signals), not a private subset of them. Only if that checklist finds nothing to
consolidate: record a one-line no-op observation, make the firing's completion
notification read as a no-op, and end the session immediately. Do not
manufacture work to justify the firing.

Otherwise, consolidate. As always, the goal is knowledge curation, not chasing
fitness numbers. The fitness function results are never the goal, only
conservation of understanding. Take care of the learning and the numbers will
take care of themselves. When you need to make a decision, run it through the
decision lenses and the reflection and reasoning processes
@.agent/directives/principles.md . Deal with discovered and created tombstones
as you go. Done is consolidate-until-done's own completion contract — apply it
in full from `.agent/skills/consolidate-until-done/SKILL-CANONICAL.md`, never a
narrowed restatement of it.

Subagent results and sources MUST be critically assessed before being accepted or synthesised

Take your time to explore different approaches before you decide how to proceed. It's often a good
idea to start with all of the raw sources, then the napkin, then distilled, then re-assess the
situation. Starting with pending graduations means emptying those buffers then filling them
up again, but sometimes that is the right choice.

Unattended-session ground rules: work is not safe until committed, pushed, and
on a draft PR — end no firing with pushed work on a PR-less branch. Anything
blocked on the owner becomes a queued decision plus a mobile push alert, and the
session then closes out rather than waiting.

Exit criterion (per `.agent/rules/loop-exit-criteria-required.md` §Owner
Authority): this is an owner-commissioned standing schedule (2026-08-27) with no
automatic cross-firing idle stop — the named end condition is the owner
disabling the Routine. Each firing's no-change exit above governs that firing
only; fresh sessions carry no idle counter. The completion push notification on
every firing (no-op firings identified as such) is the owner-visible idle
streak, and a sustained no-op streak is the owner's signal to pause or delete
the Routine.
