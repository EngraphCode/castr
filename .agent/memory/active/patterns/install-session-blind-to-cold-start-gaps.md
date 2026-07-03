---
name: Install-Session Blind to Cold-Start Gaps
polarity: anti-pattern
use_this_when: 'authoring a rule, plan, or surface with full context and assuming a fresh reader will understand it without an externally-grounded cold-start check'
category: process
status: provisional
discovered: 2026-04-29
proven_in: imported
related_pdr: PDR-027
---

> **POLARITY: ANTI-PATTERN.** This entry names a _failure mode to avoid_, not a shape to repeat. The name is the diagnostic: when the failure mode is about to fire, recognising the shape is the first move in not repeating it.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern) for the polarity discipline.

# Install-Session Blind to Cold-Start Gaps

The session that authors a rule, plan, or surface has perfect context
and is structurally blind to what a fresh reader would miss. Only an
externally-grounded check — owner question, onboarding-expert,
deliberately context-reset reviewer — surfaces the gaps the install
session cannot see.

## The Anti-Pattern

An install session looks like this:

1. The agent authors a new rule, ADR, plan, or surface.
2. The agent reads back what they wrote and confirms it makes sense.
3. The agent dispatches an in-context reviewer who agrees the work
   is well-structured.
4. The agent ships.
5. A fresh reader (owner, future contributor, fresh agent session)
   encounters the surface and asks "where does this fit? what was
   assumed?" — questions the install session never asked because the
   answers were ambient.

The install session's confidence is a _property of context_, not a
_property of the surface_. The surface is judged by readers who do
not have that context.

## Why It Recurs

- **Context-blind self-review.** The author's reading of their own
  text reads through their own context. Of course it makes sense to
  the author; they wrote it.
- **In-context reviewer dispatch.** A reviewer dispatched within the
  same session inherits the briefing the agent writes. The agent
  writes a brief that matches their understanding; the reviewer
  validates against that brief. Both miss the gaps a cold reader sees.
- **Lack of an external check.** The work flows from context
  (high) directly to commit (live) without a stage that re-reads from
  outside the context bubble.

## The Fix

Three valid external-grounding moves:

1. **Owner question.** Before shipping a substantive new surface,
   ask the owner a question that requires them to read the surface
   cold. Their answer surfaces gaps the install session cannot see.
2. **Onboarding-expert dispatch.** Dispatch a reviewer with an
   _uninformed brief_ — "read this surface as if you have never seen
   the context that produced it; what is missing?" The reviewer's
   findings reveal context-blindness.
3. **Deliberate context reset.** Open a fresh session, read the
   surface from cold, and note what is unclear. The fresh session
   has no inherited context; its confusion is the gap audit.

Concretely:

- After authoring a new ADR, before shipping, ask: "what would a
  contributor with no context ask about this ADR's first paragraph?"
- After installing a new rule, dispatch a reviewer briefed only on
  the rule file, no surrounding session history.
- After a long arc lands, before declaring the work done, run a
  cold-start grounding pass on the surface as the "first thing a
  fresh agent would read."

## Cross-References

- Sibling pattern:
  [`recital-loses-to-recipe-momentum.md`](recital-loses-to-recipe-momentum.md)
  — the doctrine I author and quote at session open is the doctrine I
  most likely bypass when recipe-momentum dominates. Same shape:
  authoring confidence does not translate into compliance.
- Sibling pattern:
  [`passive-guidance-loses-to-artefact-gravity.md`](passive-guidance-loses-to-artefact-gravity.md)
  — passive prose loses to active artefact-gravity events; install
  sessions write passive prose under the illusion that having written
  it is sufficient.
- Adjacent: PDR-029 (perturbation-mechanism bundle) — the perturbation
  layer is the canonical solution to "install session sees only what
  it brought to the session"; the perturbation event has to fire from
  outside the session to be useful.
