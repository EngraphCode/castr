# W-0 Owner Walk Ballot — Proof Programme Charter

**Status:** CLOSED — walked 2026-08-22, all verdicts recorded below; amended 2026-08-24 (B-15 re-balloted to push-only by owner decision card).
**Medium:** the owner walked the ballot interactively in-session (session prefix `5aef07`,
Incandescent Charring Ember), one decision at a time, on 2026-08-22; the verdicts were
recorded here in the same landing that executed their consequences (the follow-up landing,
PR #31). The authority surfaces (ADR-051, roadmap, active-lane dispositions, queue) are the
record; this ballot is the walk's worksheet and its closure note.
**Evidence:** [proof-programme report, Revision 3](../../report/castr-completeness-losslessness-proof-programme-2026-08-21.md)
(§1.4, §3.2, §7 T00a); PR #30 review record; the strict/no-legacy reduction (below).

Verdict vocabulary — four verdict classes, one success set: `RATIFY` (adopt as
recommended; `ACCEPT` and `APPROVE` are the **same success verdict** and unlock gates
identically) · `AMEND: <text>` (success in its amended form — gates treat the item as
ratified as amended) · `REJECT` · `DEFER: <where>`. Every gate in the programme checks for
"a success verdict", never an exact token.

## The strict/no-legacy reduction (owner-directed, 2026-08-22)

The owner ruled before the walk: Castr has no external users, no legacy interfaces to
preserve — no fallbacks, no compatibility layers, replace old with new, strict everywhere,
all the time. Run through that lens and the OCE decision heuristics, the original sixteen
items reduced to the ten walked below. The reduction warrants, logged so the removed items
never silently reappear:

- **Folded into B-01 as entailments** (each was a separate decision only while a
  compatibility shape existed to choose): discriminated versioned document roots replacing
  `CastrDocument` outright (was B-02), the five semantic facets (was B-03), and scoped
  same-family opaque carriage of `x-*`/unknown normative extensions (was B-05, absorbing
  B-06's preservation mechanics).
- **Dissolved** — no decision left to make under no-legacy: the legacy compatibility path
  (was B-04; `CastrDocument` is deleted in the same landing that ships the new roots, so
  there is no legacy path to govern); the projected-value boundary as a separate item (was
  B-08; its substance — cross-domain ingress only as a versioned projected artifact through
  the public envelope — is inside B-07 as walked).

---

## Part 1 — T00a product charter

### B-01 Product boundary and statement

Castr owns application value contracts and software interaction contracts. Product
statement: **"Castr compiles application value and interaction contracts between compatible
representations without silently changing their meaning."** Ratifying carries as direct
consequences: versioned discriminated roots
(`CastrValueContractDocument | CastrInteractionContractDocument`) replacing `CastrDocument`
outright, the five semantic facets (accepted-input, produced-output, ordered-processing,
annotation, interaction) as distinct persisted semantics, and scoped same-family opaque
carriage (typed opaque bags with key safety and stable provenance; no generic
foreign-artifact bag; no claim that opaque data affects unaware targets).

**Verdict: RATIFY** (2026-08-22, interactive walk).

### B-07 Graph boundary (negative claim only)

RDF/SHACL/JSON-LD graph semantics are not Castr's domain: Castr admits formats by
semantic-object fit, never carrier syntax, and never imports graph IR. Cross-domain input,
if it ever exists, enters only as a versioned projected application-value artifact through
the public envelope (report §09G, outcome-discriminated). The sibling graph product's
existence and name remain open as QD-1.

**Verdict: RATIFY** (2026-08-22, interactive walk).

## Part 2 — Doctrine and register

### B-09 Owner-gated doctrine amendments

`principles.md` (§Input-Output Pair Compatibility Model, §Strict-By-Default's object
clause), `VISION.md` ("Universal Schema Conversion"), `requirements.md`'s universal claims,
and `IDENTITY.md` contradict the ratified charter; `principles.md` requires prior explicit
owner approval to edit. This verdict authorises the executing slices to rewrite those
specific surfaces (plus `.agent/rules/input-output-pair-compatibility.md`) to express the
ratified charter, each landing recording retain/amend/supersede in the surface itself. The
doctrine-amendment wave is queue row Q-14.

**Verdict: APPROVE** (2026-08-22, interactive walk).

### B-10 Wholesale challenge-register ratification

The report §3.2 register's recommended dispositions (32 rows) are ratified with
stage-respecting scope: rows whose subject is a T00a matter are implementation direction
now; rows the staged court reserves for T00b/T00c are the default each consumer-head
charter walks in with. Two defaults hardened per the no-legacy ruling: Swagger 2.0 ingress
is removed/rejected outright (no upgrade shim), and `CastrDocument` is deleted in the same
landing that ships the new roots. The three already-owner-adjudicated rows are ratified as
mechanism only.

**Verdict: RATIFY** (2026-08-22, interactive walk).

### B-11 2026-06-19 roadmap sequencing reconciliation

The standing order (transplant first → remediation → explicit-additionalProperties) is
superseded by the parent plan's queue: pre-02A defect slices and PR extraction/closure run
under the queue; remaining transplant work is paused as a named position with re-entry
record QD-2 (revisit at programme completion, or earlier on the owner's ask). Roadmap and
active-lane dispositions executed in this landing.

**Verdict: RATIFY** (2026-08-22, interactive walk).

## Part 3 — Standing authorisations for the autonomous loop

### B-12 ADR-051 acceptance

[ADR-051](../../../docs/architectural_decision_records/ADR-051-autonomous-background-implementation-loop.md)
accepted as amended by the clause verdicts below (all success, no clause amendments), with
one owner amendment at acceptance: **clause 2's default cadence is three firings per day**
(the proposal said two). The Status line change and the cadence amendment landed together,
atomically, in this landing.

**Verdict: ACCEPT — AMEND: default cadence three firings per day** (2026-08-22,
interactive walk).

### B-13 Standing merge policy (ADR-051 clause 3)

A slice PR merges without a fresh owner ask when every check is green on the current head,
every conversation is resolved (fixed or carry-forward-dispositioned under clause 4), the
base has not diverged, and the diff matches the claimed slice scope; anything else queues.

**Verdict: RATIFY** (2026-08-22, interactive walk).

### B-14 Review-bot convergence (ADR-051 clause 4)

At most two fix rounds per PR for automated-reviewer findings, then carry-forward
dispositions; genuine correctness/security/data-loss defects blocking in every round; human
comments never capped. This explicitly amends the scope of
`pr-comments-resolve-and-recheck` for automated-reviewer comments: a recorded carry-forward
disposition reply IS that rule's measured rejection (scope note landed in the rule file in
this same landing, so the loop never runs against a contradictory rule). Live evidence: PR
#31's own eleven-round
arc (counts 8-9-3-1-2-3-4-2-2-4-2, every finding real, convergence structurally absent).

**Verdict: RATIFY** (2026-08-22, interactive walk).

### B-15 Notification and escalation channel

Completion notifications on every firing — push and email both on, no digest — with queued
decisions, blocked slices, and merges named in the summary; revisit after two weeks of
running. Scope note: a future REJECT/amendment here governs routine completion
notifications only — the escalation notifications clause 6 mandates (zero-progress disable,
red-head stop, blocked-slice stop) keep a delivery channel regardless.

**Verdict: RATIFY** (2026-08-22, interactive walk); **superseded in part by the
2026-08-24 amendment below.**

**Amendment (owner re-ballot, 2026-08-24, decision card — proof-programme loop
review OP-4): the channel set is push-only.** The loop review's finding D-2
measured the live Routine at `push: true, email: false` against this item's
"push and email both on"; presented the choice, the owner re-balloted to
push-only rather than repairing the config — the live configuration is now the
ratified one, and D-2 closes as a ratified change, not a defect. The scope note
stands: clause 6's escalation notifications keep a delivery channel regardless.

**Second amendment (owner card ruling, 2026-08-27, routine-configuration
session): the channel set is push + Slack, no email; the receipt gate closes
only on the device push.** The 2026-08-26 arming walk's notification repair
left the live trigger at push+Slack; presented the divergence against the
push-only amendment above, the owner ratified the live set rather than
restoring push-only — both channels stay, and the device push is the sole
gate-closing channel (a Slack arrival is recorded as corroboration, never the
gate). Supersedes the 2026-08-24 push-only amendment; the clause 6 scope note
stands unchanged.

### B-16 Red-head policy (ADR-051 clause 6)

One bounded out-of-queue green-the-head repair slice per firing through the normal
TDD/gate/review path, recorded in the ledger and the notification; still red at firing end →
stop and notify, subsequent firings attempt only head repair; no test is ever skipped,
disabled, or quarantined to get green.

**Verdict: RATIFY** (2026-08-22, interactive walk).

---

## After the walk — consequences executed in this landing (PR #31)

- ADR-051 Status → **Accepted** (clause 2 amended to three firings per day first, then the
  Status line — the atomic B-12 rule).
- Queue un-gated: Q-00 `completed`; Q-02..Q-07 eligible (B-11 success), Q-13 executes the
  recorded B-11 RATIFY outcome, Q-14 added for the B-09 doctrine wave; Q-10's charter gates
  are satisfied (T00a ratified) but it **waits on Q-14** (`depends_on`) so charter-consuming
  work never grounds in doctrine that contradicts the charter. Q-01 remains the next-run
  slice (loop readiness) — it arms the Routine, since the walk closed before Q-01's proof
  (the order-independent arming rule).
- Active-lane dispositions executed: `02-ir-fidelity-proof-harness.md` →
  `current/paused/` as a partially-absorbed record with its per-finding disposition table;
  `oak-practice-transplant.md` → `current/paused/` as a named position carrying the QD-2
  pointer.
- QD-2 opened in [`queued-decisions.md`](./queued-decisions.md) with its named trigger;
  roadmap, continuation prompt, and thread record banners synchronised.
- The Routine un-pause condition (success verdicts on B-12, B-13, B-16) is **met**; arming
  executes at Q-01 completion per the parent plan's order-independent arming rule.
