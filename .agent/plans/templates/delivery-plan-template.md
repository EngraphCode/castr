# Delivery-plan template

One step of a lane, authored by its implementer at pickup. One page.
Copy, fill, delete the guidance. Born in `current/` (queued, executable);
moves to `active/` only when implementation starts. The frontmatter is
metadata plus machine-readable todos; the narrative (goal, mechanism,
acceptance) lives in the body (PDR-018).

```markdown
---
title: <Human name — what this step delivers>
status: current
lane: current
created: <YYYY-MM-DD>
last_updated: <YYYY-MM-DD>
owner_directive: >-
  <The owner words or plan row that commissioned this step — verbatim
  where quoted; omit only for self-evident queue pickups.>
todos:
  - id: <T1>
    content: <One TDD cycle: the failing test, the product code, the refactor — one landing unit>
    status: pending
    depends_on: []
---

# <Name>

## Goal

<What is true when this lands that is not true now — one short
paragraph.>

## Mechanism

<How, briefly. Mechanism only: anything internal rides the linked
ticket.>

## Acceptance criteria (each with a proof — required)

Each criterion names its proof and the proof's evidence class:

- `repo-safe` — provable inside the repository (a test, a validator, a
  CI check); cite the instrument.
- `owner-held` — provable only with owner-held access (a production
  console, an external dashboard); name who verifies and where the
  verification is recorded.

## Todos (optional; proofs on todos optional)

<Slices, each a single-story PR carrying its round-budget class
(PDR-132: default ≤2 review rounds; name the budget if it differs and
why).>

## Out of scope

<Explicit. What a reasonable reader might assume is included but is
not, each with one clause of why.>
```

At completion — acceptance criteria proven — the plan moves to
`current/complete/` first (this repo's completion staging), and archives
in batches from there per the roadmap's archival cadence.
