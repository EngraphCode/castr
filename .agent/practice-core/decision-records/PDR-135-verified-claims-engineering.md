---
pdr_kind: pattern
---

# PDR-135: Verified-Claims Engineering

**Status:** Accepted  
**Date:** 2026-09-06  
**Authority:** Owner-ratified two-product frame, 2026-08-23; publication held to
the accompanying vision revision by owner direction, 2026-08-27.  
**Related:** [PDR-018](PDR-018-planning-discipline.md),
[PDR-096](PDR-096-bring-the-iceberg-transplant-completeness.md),
[PDR-105](PDR-105-reference-direction-invariants.md)

## Context

Product and engineering-process claims fail in the same way when the visible
signal proves less than the words attached to it. A passing test may observe
structure rather than behaviour. A configured detector may never execute.
A completed task may not deliver the outcome of its parent programme.
Documentation can preserve the original claim after its evidence has changed.

The recurring problem is the missing relationship between a claim's scope and
the observation that could disprove it.

## Decision

Every consequential claim names the outcome, boundary, evidence and warrant that
connects the evidence to the outcome. Use machine-checkable behavioural proof
where the claim has an executable truth condition. For owner-held decisions and
non-code outcomes, identify the appropriate authoritative statement or review
observation and its limits; do not invent a machine signal.

Apply the same discipline to product behaviour and the mechanisms used to
develop it:

1. State the exact profile, scope and conditions of the claim.
2. Select an instrument that observes that outcome, with an independent basis
   where comparison could otherwise validate the same mistake twice.
3. Prove that the instrument can distinguish the relevant failure. Configuration,
   existence, activity and a green aggregate alone do not establish this.
4. Bind evidence to the artifact or state it actually observed. Refresh the
   warrant when that state changes.
5. Report the narrowest supported conclusion. Preserve required but unimplemented
   behaviour as a visible obligation rather than redefining it as complete.

Completion belongs to the claimed outcome's acceptance contract. Closing a
session, landing a slice or passing a subset of checks does not complete a
broader programme.

## Rationale

The same pattern explains unsupported product fidelity claims, inactive
enforcement mechanisms, stale documentation and mistaken delivery reports.
Naming the common relation allows each domain to use the right proof without
building a general-purpose oversight apparatus.

Neither maximum test count nor universal instrumentation is the objective.
The instrument must be strong enough to prove the consequential claim and
small enough to remain directly connected to it.

## Consequences

- Support and fitness measurements require explicit, complete denominators.
- Partial observations remain useful when their limits are stated.
- Historical evidence is retained with its date and scope rather than silently
  promoted to current authority.
- Missing proof remains an obligation; it is not evidence of success or failure.
- A declaration of strictness cannot replace demonstrated preservation.
- Existing planning and completeness doctrine remains in force; this pattern
  connects those disciplines rather than replacing their contracts.

## Host adoption

Host-specific observations, implementation carriers and adoption history are
reached through the adopting repository's local Practice bridge. They are not
portable doctrine.
