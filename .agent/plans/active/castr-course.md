---
title: Castr course — from the present code to the specification
status: active
lane: active
created: 2026-09-21
last_updated: 2026-11-02
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
  - id: PROBE
    content: "A read-only lint probe: OCE's lint configuration, with its type-aware rules, runs over Castr's product code without changing it, and the table of rule, hits and area is saved under .agent/analysis-and-reports/; it is the first step of the owner's question of 1 November 2026, 'run your analysis on the code as-is', an input to the reflection after MEASURE, and RULES's starting point; run on 2 November 2026, its table is .agent/analysis-and-reports/oce-lint-probe-2026-11-02.md"
    status: pending
    depends_on: []
  - id: CURRENCY
    content: "After MEASURE and scoped by what the reflection decides travels (owner's decision card, 2 November 2026: 'After MEASURE, scoped'): if code travels, lib and the root tooling at latest within the holds the toolchain forces, TypeScript 6 (ts-morph 28 vendors it; typescript-eslint's peer range ends below 6.1), @types/node 24 (engines.node 24.x, ADR-049), vitest 4 and tsup 8 (OCE's majors), and the Scalar packages, which the C-1 OpenAPI reader replaces, one proof-gated commit per type-affecting cycle; if MOVE starts fresh, no pass on code that is archived; agent-tools is outside it either way, because it does not travel"
    status: pending
    depends_on: [MEASURE]
  - id: RATIFY
    content: "The owner approved draft 0.5.0 in this repository's working session on 2 November 2026 ('I approve draft 0.5.0 , if we need to review and change it later that is fine.'), recorded per SPEC-CC-2 with its SHA-256 at SHA:0e2ca07a; the ratified file lands on main together with the SPEC-CC-3 check, which does not yet exist"
    status: pending
    depends_on: [ALERTS]
  - id: MEASURE
    content: "The coverage table for SPEC-C-1: what today's generator does on both Oak documents at their latest published versions, its Zod output loaded under the latest Zod 4, scored against the source document by an independent validator, never against the libraries being replaced; it makes no decision (owner's decision card, 2 November 2026: 'Measure without making decisions, drop the thresholds, we figure out what we have, then we reflect on it'); the owner and the agent then reflect on it and decide what travels; a throwaway probe, nothing red enters any repository"
    status: pending
    depends_on: [RATIFY]
  - id: RULES
    content: "Only if code travels: OCE's lint rules are adopted in this repository for the code that travels, starting from the PROBE table, and that code is fixed until they pass with no suppression (SPEC-G-3), before MOVE; the owner's decision card, 2 November 2026: 'At move the OCE rules will apply, the point of applying them early is to fix issues in isolation before moving'"
    status: pending
    depends_on: [CURRENCY, PROBE]
  - id: MOVE
    content: Castr moves into the Engraph Open Curriculum Ecosystem repository as workspaces and is fully integrated there (owner, 2 November 2026); what travels (the code with its history, or the specification with fresh workspaces) is decided at the reflection on the MEASURE table; the specification travels as the only description of the destination, and its SPEC-CC-3 check is given a home in OCE; the approval record covers the specification's exact bytes, so if its arrival in OCE changes any byte above its change log (OCE's formatter or markdownlint), the move carries a format-only amendment approved in words (SPEC-CC-1); this repository is archived
    status: pending
    depends_on: [RULES]
  - id: PLOT
    content: The legs to SPEC-C-1 are written into this plan from the MEASURE table and the model design (SPEC-N-1), each with an observable exit state, and reviewed by assumptions-expert
    status: pending
    depends_on: [MOVE]
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

## Order of the legs

Owner decision, 21 September 2026 (recorded 23 September): MEASURE precedes MOVE. The
measure is one session of throwaway probing and it answers the question that decides what
is worth moving — evolve the present model, or rebuild it. If the answer is rebuild,
carrying the present product code and its history into the new repository imports the
clutter the owner wrote off on 21 September; the move is then the specification plus fresh
workspaces. Where Castr ends up is unchanged; only the order is.

Owner decisions by card, 2 November 2026, after the approval of 0.5.0. MEASURE measures
and decides nothing: "Measure without making decisions, drop the thresholds, we figure out
what we have, then we reflect on it". What travels is decided at that reflection, with the
owner. CURRENCY follows MEASURE and is scoped by what travels ("After MEASURE, scoped"):
no pass on code that is archived, and `agent-tools` is outside it either way. OCE's lint
rules are applied here, before the move, to the code that travels: "At move the OCE rules
will apply, the point of applying them early is to fix issues in isolation before moving".
The agent reads this as a RULES leg after CURRENCY and before MOVE, which restores the
owner's 1 November order, "dependencies, then rules"; the reflection confirms that reading
before any RULES work starts. The order is therefore ALERTS, RATIFY, MEASURE, the
reflection, CURRENCY, RULES, MOVE, PLOT, with PROBE (read-only) at any time before the
reflection.

## RATIFY: how the specification is ratified

The owner walked the ratification checklist on 2 November 2026, one decision card per
clause, each stating the clause in plain language with its reason and its cost; cards 17
to 20 were settled by the owner's word "In each case take the default", and cards 21 to
30 together on one card that listed each clause with its recommended answer. Two profile
mismatches raised by the Engraph Open Curriculum Ecosystem were decided on cards the same
day. Draft 0.5.0 carries every decision, and its change log names what changed. The owner
approved it in a working session the same day, in their own words: "I approve draft 0.5.0 ,
if we need to review and change it later that is fine." The agent recorded the words, the
date and the SHA-256 of the text above the change log in the change that set the status to
`ratified` (`SHA:0e2ca07a`, SPEC-CC-2). From that ratification the document changes only by
approved amendment (SPEC-CC-1): an amended text is committed only together with its
version, its change-log row and its approval record, because the SPEC-CC-3 check fails on
committed text that does not match the latest approved record. That check does not exist
yet; it is written test-first and lands in the same pull request as the ratified file.

Settled by the owner on 21 September 2026 and already in the draft: the value-domain
reading (SPEC-P-5); OpenAPI 2.0 is not read; zero open dependency alerts on `main` to
merge (SPEC-G-1); the approval mechanism. Approval is the spoken word recorded under
SPEC-CC-2; merging the specification's pull request is mechanics that an agent performs
(owner, 23 September 2026).

## ALERTS

`main` had seven open dependency alerts on 21 September 2026. Pull request #111 cured all
seven with capped security floors (`SHA:fc94488f`). New advisories reopened the leg: on
2 November 2026 `main` had 30 open alerts (3 critical, 8 high, 15 medium, 4 low). The owner
confirmed SPEC-G-1's cure-only rule that day, so until they are cured only alert-cure pull
requests merge. Pull request #109, the identity-chain cure, merged after #111
(`SHA:8b0aa438`) at the end of its second review round. The owner's ruling on #109 was
"land it frozen". From it the agent drew a working rule, which is the agent's wording and
not the owner's: nothing more goes into the present writer code, and a review finding
against the present model is cured only when it blocks a landing, otherwise dropped with
the reason stated. Agents merge green-and-clean pull requests; the owner granted that on
21 September 2026, and the permission rule lives in the agent's local settings, outside
version control.

## The Oak API specification's unsatisfiable shapes

Owner decision, 21 September 2026: the eight `allOf` sites that accept no value are fixed
in the document at source. Castr reports each with its location and carries it faithfully
(SPEC-PR-7); it never guesses intent.

The measured evidence behind the specification is in
[the review record](../../research/castr-specification-review-2026-09-21.md).

## MOVE: what travels

The specification, the course plan, the review record, the engineering doctrine Castr
needs that the new repository lacks, and — only if the reflection on the MEASURE table
decides it — the product code with its history. Every other
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
  SPEC-CC-2, the SPEC-CC-3 check passes in the aggregate gate, and both are on `main`.
- **MEASURE:** a table of construct by outcome (`exact`, `wrong output`, `rejects`,
  `absent`, `vacuous proof`) for both Oak documents, every cell backed by a command and its
  output, with no verdict; then the owner's reflection decides what travels.
- **RULES:** OCE's lint rules pass, with no suppression, on the code that travels; or, if
  nothing travels, the leg is closed with that reason.
- **MOVE:** Castr's gates pass inside the new repository and this repository is archived.
- **PROBE:** the table is saved and every row is backed by the command that produced it.
- **CURRENCY:** in the code that travels, only the named holds are outdated, `pnpm audit`
  reports zero and the gates are green; or, if nothing travels, the leg is closed with that
  reason.
- **PLOT:** this file's todos name every leg to SPEC-C-1 with an observable exit state.
- **Plan complete:** SPEC-C-1 and SPEC-C-2 are advertised and SPEC-G-2 holds.

## Non-goals

What the specification's "Not part of Castr for now" section excludes; any work on this
repository's `.agent` machinery; recovering anything written off.

## Risks

- **The course drifts again.** The specification's change control is the cure; this plan
  changes freely, the destination changes only by approval.
- **The move stalls product work.** MOVE imports what MEASURE decided is worth carrying
  and changes nothing else; redesign starts after it.
- **The consumer's document is unsatisfiable in places.** Reported by Castr, decided by
  the owner, corrected at source.
