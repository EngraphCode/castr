# Paused Workstreams

**Purpose:** Define how incomplete but non-primary workstreams are parked while another active workstream becomes the repo's operational entry point.
**Status:** Canonical lifecycle guide for paused-workstream usage.

---

## Core Rule

Paused workstreams are **not abandoned** and **not future backlog**.

They are:

- incomplete
- still believed to matter
- intentionally not the next atomic slice
- expected to resume when they become the right next priority again

Paused workstreams live under `.agent/plans/current/paused/` until they are reactivated, completed, or explicitly re-scoped into `future/`.

Paused does not mean vague: the stored context must stay complete enough to resume honestly without hidden commentary.

---

## What Belongs Here

Use `.agent/plans/current/paused/` for a workstream only when all of the following are true:

1. the work is real and still desired
2. the work is not currently the primary active slice
3. moving it to `future/` would falsely imply "later maybe" rather than "paused but resumable"
4. enough context remains in the plans for a later reactivation without hidden commentary

---

## What Must Not Happen

Do not use this directory as:

- a silent graveyard
- a substitute for `future/`
- a place to hide architectural truth that should live in durable docs
- a second `active/` directory in disguise

If a paused workstream contains durable conclusions, promote them before or while pausing it.

---

## Lifecycle

### 1. Pause

When an unfinished workstream needs to stop being primary:

- move its plan set out of `active/` into a named subdirectory here
- update `session-entry.prompt.md`
- update `roadmap.md`
- update any links that still imply the workstream is active

### 2. Maintain

While paused:

- keep links accurate
- keep durable docs authoritative
- avoid routine churn unless a later discovery requires a factual correction

### 3. Reactivate

When the workstream becomes the next atomic slice again:

- move the relevant plan back into `active/`
- promote only one plan to primary status
- create companion active plans only if the `active/README.md` contract still justifies them
- update `session-entry.prompt.md` and `roadmap.md`

### 4. Complete Or Re-scope

If the paused workstream is finished after reactivation, move completed plans to `.agent/plans/current/complete/`.

If the work truly becomes later-scope rather than paused, move it to `future/` only after updating its framing to match that reality.

---

## Deletion Test

Before pausing a workstream, ask:

> If this workstream stayed paused for a month, would the repo still have one obvious place to start and enough context to resume later?

If the answer is no, fix the active prompt, roadmap, and plan links before pausing it.
