# W-0 Owner Walk Ballot — Proof Programme Charter

**Status:** OPEN — awaiting owner verdicts.
**Purpose:** one sitting that unblocks the autonomous background loop. Every item carries a
recommendation so the walk is ratify/amend/reject, not research. Verdicts are recorded inline
here (edit the Verdict lines), then the executing session synchronises the affected authority
surfaces (ADRs, directives, roadmap) in the follow-up landing — the surfaces are the record,
this ballot is the walk's worksheet.
**Evidence:** [proof-programme report, Revision 3](../../report/castr-completeness-losslessness-proof-programme-2026-08-21.md)
(§1.4, §3.2, §7 T00a); PR #30 review record.

Verdict vocabulary — four verdict classes, one success set: `RATIFY` (adopt as
recommended; the tokens `ACCEPT` and `APPROVE`, used naturally for ADR-acceptance and
doctrine-approval items, are the **same success verdict** and unlock gates identically) ·
`AMEND: <text>` (success in its amended form — gates treat the item as ratified as amended) ·
`REJECT` · `DEFER: <where>`. Every gate in the programme checks for "a success verdict",
never an exact token.

---

## Part 1 — T00a product charter (report §7, decisions 1–4, 14, 15, 19, 20)

### B-01 Product boundary and statement (decision 1)

Adopt the application-contract domain: Castr owns application value contracts and software
interaction contracts. Product statement: **"Castr compiles application value and interaction
contracts between compatible representations without silently changing their meaning."**
Recommendation: RATIFY (report §1.4; resolves the universal-IR problem).

**Verdict:**

### B-02 Discriminated artifact roots and schema version (decision 2)

Replace `CastrDocument` as canonical truth with versioned
`CastrValueContractDocument | CastrInteractionContractDocument`; legacy root survives only
behind an explicit compatibility/migration adapter. Recommendation: RATIFY (F-18 is
demonstrated in code: the current root forces fabricated OpenAPI identity onto Zod input).

**Verdict:**

### B-03 Semantic facets (decision 3)

Model accepted-input, produced-output, ordered-processing, annotation, and interaction facets
as distinct, independently persisted semantics. Recommendation: RATIFY.

**Verdict:**

### B-04 Legacy compatibility path (decision 4)

Legacy `CastrDocument` input maps exactly to the new artifacts or returns structured
findings/rejection; it never becomes a writer dependency; deprecation is explicit and
versioned. **Rule tension to adjudicate here:** `replace-dont-bridge` requires migrating
callers and deleting the superseded path in the same change — a "compatibility adapter"
kept as a live dual contract would violate it. Recommendation: RATIFY with the
rule-conformant shape — the legacy path is an explicit, directed **migration
transformation** (legacy document in → new artifacts out, per the report's `migration` edge
role), never a preserved live authoring path: all internal callers migrate to the new roots
in the 02B landing, the legacy root type leaves the public authoring surface in that same
landing, and only the migration edge (an input transformation, not a bridge) remains, with
its own deprecation horizon. If you prefer a true persistent dual path instead, that is an
AMEND of `replace-dont-bridge` and must be written here.

**Verdict:**

### B-05 Opaque round-trip preservation (decision 14)

Distinguish native semantic equivalence from scoped same-family opaque carriage (`x-*` and
unknown normative extensions in typed opaque bags); never claim opaque data affects unaware
target runtimes; no generic foreign-artifact bag. Recommendation: RATIFY.

**Verdict:**

### B-06 Normative extensions and unknown fields (decision 15)

Preserve `x-*` and unknown normative extensions at every legal position with key safety and
stable provenance, per the owning same-family profile contract. Recommendation: RATIFY.

**Verdict:**

### B-07 Graph ownership (decision 19)

RDF/SHACL/JSON-LD graph semantics live in a sibling system behind a versioned public
projection boundary; Castr admits formats by semantic-object fit, never carrier syntax. Note:
the sibling system's **existence and name remain an open W0 fork** from the overhaul plan —
this ballot ratifies only the boundary (what Castr is NOT), not the sibling product.
Recommendation: RATIFY the boundary; leave the sibling-product decision to its own walk.

**Verdict:**

### B-08 Projected-value boundary (decision 20)

Cross-domain input begins at a versioned projected application-value artifact consumed
through the public envelope (report §09G, outcome-discriminated); Castr never imports graph
IR. Recommendation: RATIFY.

**Verdict:**

## Part 2 — Doctrine amendments requiring explicit owner approval

### B-09 Owner-gated doctrine amendments

`principles.md`'s §Input-Output Pair Compatibility Model (Cartesian pairs, "IR is the
superset of ALL formats") and §Strict-By-Default ("Objects: Always strict") are reversed by
B-01/B-02/B-05 and by the standing IDENTITY.md 2026-04-16 `additionalProperties` direction;
the file's header requires prior explicit owner approval to edit. The same owner-gated bucket
(report §7) covers `VISION.md` (its "Universal Schema Conversion" title and goal are retired
by B-01), `requirements.md`'s universal claims, and `IDENTITY.md`. Recommendation: APPROVE —
this verdict authorises the executing slices to rewrite those specific surfaces to express
the ratified charter (each landing records retain/amend/supersede in the surface itself),
including `.agent/rules/input-output-pair-compatibility.md`.

**Verdict:**

### B-10 Wholesale challenge-register ratification

Ratify the report §3.2 register's **recommended dispositions** (32 rows; the three rows the
report marks already-owner-adjudicated — non-strict objects, omitted `additionalProperties`,
Zod catchall — are ratified as mechanism only, direction already standing) with a
**stage-respecting scope**: rows whose subject is a T00a matter become implementation
direction now; rows whose subject the report's staged court reserves for T00b/T00c (decisions
5–13, 16–18, 21, 22) are endorsed as the **default recommendation each consumer-head charter
walks in with** — this verdict does not pre-close those staged gates, it sets their
starting position. Per-landing reconciliation of each affected ADR/directive happens when its
subject is first touched. Any row you strike here becomes a queued decision instead.
Recommendation: RATIFY with that scope.

**Verdict:**

### B-11 2026-06-19 roadmap sequencing reconciliation

The standing order (transplant first → remediation → explicit-additionalProperties) predates
the 2026-08-22 planning contract. Recommendation: SUPERSEDE it with this parent plan's queue —
the pre-02A defect slices (remediation-02's core) and PR extraction/closure run under the
queue; remaining transplant work (Oak parity phases) is **paused as a named position with a
concrete re-entry record**: queued-decision QD-2 holds the re-entry question with a named
review trigger (revisit at programme completion, or earlier on your ask), and the paused
plan carries the pointer — the pause cannot strand the work silently. Roadmap updated
accordingly in the follow-up landing.

**Verdict:**

## Part 3 — Standing authorisations for the autonomous loop

### B-12 ADR-051 acceptance

Accept
[ADR-051 (autonomous background implementation loop)](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md):
fresh-session-per-firing Routine, default cadence twice daily, WIP = 1, bounded firings,
queued decisions, escalation and kill switches. **Acceptance is atomic with the clause
verdicts**: ACCEPT here means accepting the ADR _as amended by_ your B-13, B-14, and B-16
verdicts — any AMEND or REJECT on those items amends or strikes the corresponding clause in
the follow-up landing **before** the Status line changes, so the accepted text always equals
the clause-level verdicts and B-12 can never grant a power a sibling item declined.
Recommendation: ACCEPT.

**Verdict:**

### B-13 Standing merge policy (ADR-051 clause 3)

In short: a slice PR merges **without a fresh owner ask** only when every check is green on
the current head, every conversation is resolved (fixed or carry-forward-dispositioned under
clause 4), the base has not diverged, and the diff matches the claimed slice scope — anything
else queues for you. **The authoritative text is ADR-051 clause 3**; this item accepts it.
It generalises your PR-30 instruction into standing policy — the single authorisation that
lets the loop finish things. Recommendation: RATIFY.

**Verdict:**

### B-14 Review-bot convergence rule (ADR-051 clause 4)

In short: at most two fix rounds per PR for automated-reviewer findings, then carry-forward
dispositions and proceed under clause 3; genuine correctness/security/data-loss defects stay
blocking in every round; human review comments are never capped. **The authoritative text is
ADR-051 clause 4**; this item accepts it. **Ratifying this explicitly amends the scope of
`pr-comments-resolve-and-recheck` for automated-reviewer comments**: a per-comment
carry-forward disposition reply (recorded before merge, with the substance queued) IS that
rule's "measured rejection with rationale" — the rule's full fix-or-measured-reject duty
continues to apply unchanged to human comments, and the follow-up landing writes this scope
note into the rule file so no silent contradiction stands. Recommendation: RATIFY.

**Verdict:**

### B-15 Notification and escalation channel

Completion notifications on every firing; queued decisions and blocked slices surface there.
Recommendation: **push and email both on, per firing, no digest** — revisit after two weeks
of running; amend here if you want a different channel or cadence.

**Verdict:**

### B-16 Red-head policy (ADR-051 clause 6)

`principles.md` makes every gate failure blocking at all times; a firing that arrives to a
red head (caused outside its slice) can neither proceed nor usefully reroute — a red head
blocks every item. In short: one bounded out-of-queue green-the-head repair slice per firing
through the normal TDD/gate/review path, recorded in the delivery ledger and the completion
notification; still red at firing end → stop and notify, and subsequent firings attempt only
head repair; no test is ever skipped, disabled, or quarantined to get green. **The
authoritative text is ADR-051 clause 6**; this item accepts it. Recommendation: RATIFY.

**Verdict:**

---

## After the walk

The follow-up landing records the verdicts' consequences: ADR-051 status, new boundary ADRs
seeded (as Proposed, fleshed out by Q-10..Q-12 slices), the B-09 amendments scheduled as
early slices, the active-lane dispositions executed per the parent plan's §Active-lane
transition, roadmap and continuation-prompt banners, and this ballot marked CLOSED with the
date. Q-01 (loop readiness) is not gated on this walk and may already have proven the
Routine. **The Routine un-pauses for real slices only if B-12, B-13, and B-16 each
carry a success verdict** (the merge and red-head authorisations the loop cannot run
without); a REJECT or DEFER on any of those leaves the Routine paused and the programme in owner-driven,
per-PR-approval mode until a revised ADR-051 is re-balloted. Closing the walk with verdicts
recorded never by itself arms anything.
