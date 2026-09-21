---
title: Castr course — from the present code to the specification
status: active
lane: active
created: 2026-09-21
last_updated: 2026-09-21
destination: docs/SPECIFICATION.md
owner_directive: >-
  Owner, 2026-09-21: "Before we go further we stop, and we define a destination,
  and we compare it to where we are, and we plot a course, not a course to
  justify sunk cost, and course to a better place, useful functionality, and
  excellence in engineering and software design and architecture."
todos:
  - id: ALERTS
    content: Dependency alerts on main reach zero through dependency-update pull requests that land without analysis; until then nothing else merges (SPEC-G-1)
    status: pending
    depends_on: []
  - id: RATIFY
    content: The owner ratifies the specification locally (SPEC-CC-2); the ratified file and a README pointer land on main; nothing else in this repository is wired to it
    status: pending
    depends_on: [ALERTS]
  - id: MOVE
    content: Castr moves into the Engraph Open Curriculum Ecosystem repository as workspaces with its history, under a boundary rule that no Castr workspace depends on a package outside Castr; the specification travels as the only description of the destination; this repository is archived
    status: pending
    depends_on: [RATIFY]
  - id: MEASURE
    content: The coverage table for SPEC-C-1 — what today's generator gets right on the pinned Oak corpus, scored against the source document by an independent validator, never against the libraries being replaced; nothing red enters any repository
    status: pending
    depends_on: [MOVE]
  - id: PLOT
    content: The legs to SPEC-C-1 are written into this plan from the MEASURE table and the model design (SPEC-N-1), each with an observable exit state, and reviewed by assumptions-expert
    status: pending
    depends_on: [MEASURE]
---

# Castr course

## Goal

Reach the destination in [the specification](../../../docs/SPECIFICATION.md): SPEC-C-1
first, then SPEC-C-2, on an architecture that meets its architecture requirements and a
proof standard that meets its definition of green.

## Mechanism

The destination is fixed by a change-controlled document, so the course can change while
the target stays still. A consumer in the same repository makes the first target finite
and its acceptance a workspace dependency. The specification's computed count of
`NOT-YET-BUILT` rejections (SPEC-PR-6) is the measure of distance remaining.

## RATIFY: how the specification is ratified

The specification is draft 0.3.0. The owner chose to walk its ratification checklist one
decision card per clause: each card states the clause in plain language with its reason
and its cost, and records confirm, change or strike. When the checklist is empty, the
owner (or mantagen, a human collaborator) approves the version in their own words in a
working session, and the agent records those words, the date and the SHA-256 of the text
in the change log (SPEC-CC-2).

Settled by the owner on 21 September 2026 and already in the draft: the value-domain
reading (SPEC-P-5); OpenAPI 2.0 is not read; zero open dependency alerts on `main` to
merge (SPEC-G-1); the approval mechanism.

## First work: dependency alerts to zero

`main` has seven open dependency alerts (two high, five moderate, 21 September 2026), so
under SPEC-G-1 the only pull requests that merge are the ones that cure them. They land
without analysis. Pull request #109 (green and clean at `SHA:31d12bd2`) and the
specification's pull request #110 merge after that. The owner granted agents permission to
merge product pull requests that are green and clean; the permission rule is the owner's
to add to the project settings. The specification is merged by the owner only.

## The Oak API specification's unsatisfiable shapes

Owner decision, 21 September 2026: the eight `allOf` sites that accept no value are fixed
in the document at source. Castr reports each with its location and carries it faithfully
(SPEC-PR-7); it never guesses intent.

The measured evidence behind the specification is in
[the review record](../../research/castr-specification-review-2026-09-21.md).

## MOVE: what travels

The specification, the course plan, the review record, the product code with its history,
and the engineering doctrine Castr needs that the new repository lacks. Every other
statement of Castr's destination, fidelity contract or capability list (the review record
lists them) is left behind or rewritten to state the specification's position, once, in
the new repository. The owner approved rewriting the contradicting passages of
`principles.md`, `requirements.md`, `IDENTITY.md` and the input-output pair rule as part
of this work, each shown to the owner before it merges.

## Known on 21 September 2026

- The present model fails SPEC-AR-1 on two counts: its vocabulary is the OpenAPI and JSON
  Schema keyword set, and every node carries mandatory Zod output text built by the
  OpenAPI parser. The design question for PLOT is therefore the cost and order of
  replacing the model, and SPEC-AR-2 says its structure is designed whole first.
- The present Zod and TypeScript writers assemble target syntax as text; SPEC-AR-3
  requires syntax-tree construction.
- The Oak API specification (OpenAPI 3.1.0, 34 paths, 33 component schemas) uses `$ref`,
  explicit closed objects, two constrained records with `propertyNames`, `allOf`, `anyOf`,
  `oneOf`, `const`, `enum`, `default`, `example`, `description`, `format: uri`, `maximum`
  and `minItems`, with responses 200, 400, 401 and 404. Eight of its `allOf` sites combine
  two closed objects and accept no value under a conforming validator; SPEC-PR-7 says
  Castr reports that, and the owner decides whether the document is corrected at source
  before SPEC-C-1's second acceptance part can pass.
- The consuming code applies about seventeen string and regular-expression rewrites to
  generated output today; SPEC-C-1 removes them, and any decision one of them encodes
  becomes a profile decision in the specification.
- The consumer's typed client resolves responses through numeric status keys; a `paths`
  type with string keys compiles and types every response as `never`.

## History

On 21 September 2026 the owner wrote off every dirty worktree and orphaned branch and the
thirteen open pull requests #11–#13, #15–#18, #20, #21, #23, #26, #27 and #81 were closed;
their commits stay reachable at `refs/pull/<n>/head`. The identity-chain cure, complete
before the ruling, is pull request #109.

## Fixed properties of every leg

- Every leg ends merge-green (SPEC-G-1) with the README advertising only what holds.
- Test and cure land together in one small pull request; nothing red is ever committed,
  pushed or opened.
- No leg carries a list of things for later. A finding outside a pull request's story is
  cured in its own next pull request or dropped with the reason stated to the owner.
- Records trail reality: nothing is marked done before it is merged.
- Per pull request: a pre-execution `code-reviewer`, at most three gateway reviewers,
  freeze, open, two review rounds. A specification amendment gets the reviewers its
  substance needs.

## Acceptance

- **RATIFY:** the specification's status is `ratified`, its approval is recorded per
  SPEC-CC-2, and it is on `main`.
- **MOVE:** Castr's gates pass inside the new repository, the boundary rule is enforced
  by that repository's own checks, and this repository is archived.
- **MEASURE:** a table of construct by outcome (`exact`, `wrong output`, `rejects`,
  `absent`, `vacuous proof`), every cell backed by a command and its output.
- **PLOT:** this file's todos name every leg to SPEC-C-1 with an observable exit state.
- **Plan complete:** SPEC-C-1 and SPEC-C-2 are advertised and SPEC-G-2 holds.

## Non-goals

What the specification's "Not part of Castr for now" section excludes; any work on this
repository's `.agent` machinery; recovering anything written off.

## Risks

- **The course drifts again.** The specification's change control is the cure; this plan
  changes freely, the destination changes only by approval.
- **The move stalls product work.** MOVE imports the code as it is and changes nothing
  else; redesign starts after it.
- **The consumer's document is unsatisfiable in places.** Reported by Castr, decided by
  the owner, corrected at source.
