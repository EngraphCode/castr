# Active Plans: Execution Contract

**Purpose:** Define how the `active/` directory is used as the operational entry point for the next session.  
**Status:** Canonical lifecycle guide for active-plan usage.

---

## Core Rule

Plans are **ephemeral execution tools**, not durable architecture records.

Permanent truth belongs in:

- `docs/architecture/*`
- `docs/architectural_decision_records/*`
- stable READMEs and other durable docs

Active plans exist only to drive the **next atomic slice of work**.

---

## What Belongs In `active/`

The `active/` directory should contain:

1. this `README.md`
2. one **primary active atomic plan**
3. optionally, one or more **companion active investigation plans** when they are tightly coupled to the same workstream

The default should be:

- one primary plan
- zero companion plans

Companion plans are allowed only when they help the next session investigate a cross-cutting concern without overloading the primary plan. Examples include:

- proof-budgeting or runtime-cost investigation that materially affects semantic diagnosis
- a shared discovery or measurement track that must inform the primary plan before implementation starts

If more than one plan is active, one of them must be explicitly identified as the **primary** plan in:

- `session-entry.prompt.md`
- `roadmap.md`

---

## What Must Not Happen

Do not use active plans as:

- the permanent source of truth for architecture
- a dumping ground for session history
- a backlog of unrelated ideas
- a hidden place where important context is left stranded

If a conclusion is durable, promote it to permanent docs or ADRs before the plan is archived.

---

## Lifecycle

### 1. Activate

When beginning a new workstream:

- create the new plan in `active/`
- make sure it is the smallest useful atomic slice
- link it from `roadmap.md`
- if relevant, point `session-entry.prompt.md` at it
- ensure any predecessor context already lives in permanent docs if it is still important

### 2. Execute

While a plan is active:

- treat the plan as the execution contract for the next session
- keep it focused on investigation or implementation steps, not long historical narrative
- update only what the next session genuinely needs
- if a new cross-cutting concern emerges, either:
  - extend the primary plan carefully, or
  - create a companion plan and explicitly cross-link both directions

### 3. Complete

When the atomic slice is complete:

- move the completed plan out of `active/`
- place it in `.agent/plans/current/complete/`
- update `roadmap.md`
- update `session-entry.prompt.md` if the next session should start somewhere else
- check whether any durable insight still trapped in the plan must be promoted first

### 4. Archive In Batches

Plans in `.agent/plans/current/complete/` are staged completions.

- keep them there while a related cluster of work is still recent or still informing adjacent slices
- archive them in batches into `.agent/plans/archive/` when that group of work is fully settled

Archiving is allowed only after durable context has already been extracted.

---

## Successor Promotion Rule

If a plan finishes and the next slice is known, create the successor plan before or during completion of the previous one so the handoff remains obvious.

The successor should:

- reference the relevant permanent docs first
- reference predecessor plans only as historical context
- avoid repeating architecture that already lives in ADRs or permanent docs

---

## Primary vs Companion Plans

If both a primary and companion plan are active:

- the primary plan owns the main user-facing objective
- the companion plan owns a tightly related supporting investigation
- both plans must cross-link each other explicitly
- the session-entry prompt must tell the next session when to switch between them

If the companion concern becomes the main workstream, promote it to primary status and update the prompt and roadmap accordingly.

---

## Deletion Test

Before moving or archiving a plan, ask:

> If this plan disappeared today, would we lose any important architectural truth or operational rule?

If the answer is yes, extract that truth first into:

- a permanent architecture doc
- an ADR
- a durable README
- or the next active plan if it is truly only execution context

The goal is that completed or archived plans can disappear without harming future understanding.

---

## Current Repo Pattern

At the time of writing, this repo allows:

- one primary active plan
- one companion investigation plan when the work is tightly coupled

This is stricter than an open-ended “many active plans” model, but more realistic than insisting the directory be literally empty except for one file at all times.

---

## Session Entry Expectation

A cold-start session should be able to use:

- `session-entry.prompt.md`
- the primary active plan
- any explicitly linked companion active plan

without needing hidden context from archived plans.

If that is not true, the active-plan lifecycle has not been followed correctly.
