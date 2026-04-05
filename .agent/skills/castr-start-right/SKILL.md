---
name: castr-start-right
classification: active
description: Use at the start of a new Castr session, after a context switch, or whenever work needs to be re-anchored on doctrine, architecture, and the current entrypoint.
---

# Castr Start Right

## Goal

Re-anchor a Castr session on the repo's doctrine, current workstream, and quality gates before substantial work begins.

The standing question is:

> Are we solving the right problem, at the right layer?

## Read In This Order

1. [AGENT.md](../../directives/AGENT.md)
2. [principles.md](../../directives/principles.md)
3. [testing-strategy.md](../../directives/testing-strategy.md)
4. [requirements.md](../../directives/requirements.md)
5. [DEFINITION_OF_DONE.md](../../directives/DEFINITION_OF_DONE.md)
6. [practice-index.md](../../practice-index.md)
7. [sub-agents/README.md](../../sub-agents/README.md)
8. [invoke-reviewers.md](../../rules/invoke-reviewers.md)
9. [session-continuation.prompt.md](../../prompts/session-continuation.prompt.md)
10. [active/README.md](../../plans/active/README.md)
11. [roadmap.md](../../plans/roadmap.md)
12. the primary active plan named by `session-continuation.prompt.md`
13. any companion or paused workstream explicitly linked from the primary plan
14. the ADRs and durable architecture docs named by that active plan

Do not treat archived plans or stale prompt fragments as the source of truth when a durable doc or current active plan says otherwise.

## First Questions

Ask and answer these before committing to an approach:

1. What impact are we trying to create for the user with this change?
2. What is the source of truth for this problem after parsing?
3. Is the issue a standards gap, IR gap, parser/writer contract issue, canonicalization choice, or upstream runtime/dependency issue?
4. Is the current workstream in investigation mode or execution mode?
5. What measurable evidence will prove success?
6. What surface must become complete end to end before this work is honestly done?

## Working Posture

1. Start by understanding the codebase and current workstream state before changing code.
2. Prefer durable architecture over local patching.
3. Treat `docs/architecture/*` and `docs/architectural_decision_records/*` as permanent truth.
4. Treat plans as execution tools, not architecture storage.
5. Respect the primary-versus-companion plan split documented in [active/README.md](../../plans/active/README.md).
6. If the primary active plan is investigation-first, do not jump into implementation until its execution trigger is satisfied.
7. If durable doctrine changes, update ADRs or permanent docs instead of leaving conclusions only in a plan.

## Planning Standard

Any new or substantially updated plan must include:

1. the user impact to optimize for
2. explicit scope and out-of-scope boundaries
3. assumptions that must be validated
4. measurable success criteria
5. a stage map or architecture map when semantic loss or representational drift is involved
6. option families or fix families compared at the right architectural layer
7. TDD order
8. documentation outputs:
   - TSDoc where code changes warrant it
   - markdown documentation where user or maintainer guidance changes
   - ADRs where doctrine or architecture decisions change
9. an execution trigger or clear completion criteria
10. the canonical quality-gate protocol from `DEFINITION_OF_DONE.md`

## Implementation Standard

When the active workstream is ready for execution:

1. write failing tests first
2. prefer pure helpers and narrow seams before broad rewrites
3. keep parser/writer logic centralized
4. preserve IR honesty even when interchange formats are lossy
5. fail fast instead of silently canonicalizing away user-visible semantics
6. update durable docs when behavior, doctrine, or architecture meaning changes
7. if a newly discovered legitimate gap appears, explicitly triage it:
   - include now
   - queue it in the active workstream
   - or record it durably as later-scope work if it is truly outside the current slice

## Session Close-Out

Before ending any session:

1. promote durable findings into docs or ADRs
2. make sure the active plan reflects the real next step
3. update `session-continuation.prompt.md` and `roadmap.md` if the entry point changed
4. avoid leaving critical context stranded only in commentary or ephemeral notes
5. leave the next session with one obvious place to start

## Practice Box

At session start, also check:

- `.agent/practice-core/incoming/`
- `.agent/practice-context/incoming/`

If files are present, treat them as incoming Practice exchange material and integrate them through the local Practice rather than leaving them stranded.
