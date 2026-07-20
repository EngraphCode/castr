# Concept-exploration record: the remediation roadmap and the plan of record (2026-07-17)

**Method:** the Resonance concept-exploration workflow (Four Movements — reflect on raw
observations → define the problem space → reflect on possible solutions → synthesise with
warrant + falsifier), applied before authoring
[`../plans/remediation/00-parallel-execution-program.md`](../plans/remediation/00-parallel-execution-program.md).
**Author:** Highland Spiralling Summit (claude-code / claude-fable-5, session prefix `5fb0b5`).
**Status:** exploration record — analytic provenance for the program record's §Method note; the
program record is authoritative for execution. Previously machine-local (session plan file);
homed here at handoff so the reasoning survives the session.

## Pass A — the remediation roadmap

**1 · Raw observations.** Six Criticals + ~34 further findings, all reproduced and re-verified
live (2026-07-04). The feature branch's Oak round-trip test reproduced C3 _at gate level_ on
2026-07-17 — the first gate-level reproduction. The 2026-06-04 roadmap's 8-PR grouping was
superseded by the 7-plan estate, which redistributed ownership (H7 split three ways; M7 absorbed
into plan 03). Pre-flight scouting had found the proof-harness substrate already exists.
Inherited assumption exposed: _"the roadmap is the plan"_ — it is not; the plan estate and its
banners are the live authority, the PR table a fossil.

**2 · Problem space.** Gap: the compiler pipeline silently corrupts semantics (AND→OR security,
dangling `$ref`s, no-op validators, silent parser drops) while gates show green; harms every
consumer trusting generated validators and blocks the finished feature slice. Mechanism: a proof
gap (H7) let implementation drift from doctrine — gates measured activity, not semantics.
Constraints: proof-first TDD, strictest-of-three, the verified file-collision clusters,
owner-gated doctrine edits. Success: every finding ID disposed; C2–C6/H1–H4 fixed red→green;
recurrence structurally prevented; feature slice integrated.

**3 · Solutions re-opened.** Fluent answer #1 — "execute plans 02–07 in numeric order" —
rejected: the numbering is authorship order, not the dependency DAG (05 → 02's C4 slice; 02's
interim step → 03). Fluent answer #2 — "one agent per roadmap PR" — rejected: the PR table is
superseded and collision-heavy. Fluent answer #3 — the roadmap's own "install the red suite
first, then fix" — **conflicts with post-transplant doctrine** (cycle-as-landing-unit: every
commit green; a red-only landing is forbidden). Resolution: red-first _inside each lane's
worktree_; proof + fix land as one green cycle.

**4 · Synthesis.** Decompose by **file-collision cluster (lane), not by plan number**: lanes are
tightly bounded file scopes with no pairwise overlap; the DAG orders only the genuine edges.
Unowned findings get a disposition slice. Warrant: the firsthand-verified collision matrix.
Falsifier: a lane's TDD forcing a cross-lane IR-model change (mitigated by pre-merging the
IR-honesty items into one lane; later borne out when the readiness review dissolved that lane
into L-F after the feature branch resolved its core). Unresolved evidence at the time: unscoped
effort of M8/M11/M13; whether ADR-047's per-keyword decisions surface new IR needs.

## Pass B — the plan of record

**1 · Raw observations.** The roadmap's frozen position-1 text said "Phase 7 in progress"; the
tracker, tags, and merge history said Phases 0–8 done and on main. The roadmap's newest banners
already named remediation-02 the recommended next slice. Branch doctrine changed (2026-07-03) to
per-slice PRs off main. D2/D4 sat implemented on unmerged branches 173 commits behind. Tags
phase-5/7/9 missing despite docs claiming 5 and 7 were cut. Main's copy of the feature-slice plan
did not know an implementation existed. A `strategy-vision-estate-overhaul` (W2) pending, not
promoted.

**2 · Problem space.** Gap: the plan of record's authoritative voice was fragmented (frozen text
vs banners vs tracker vs continuity prompt); an executor following the frozen text would redo
completed work. Harms: wasted execution, stale integration of finished value (the feature slice),
decision latency. Mechanism: append-only continuity surfaces outpaced the milestone frame.
Success: one reconciled execution frame; remediation actually executing; the feature integrated;
position-1 remainder explicitly owned, named, and deferred-or-running.

**3 · Solutions re-opened.** Fluent answer — "follow positions 1→2→3 serially" — interrogated:
the 2026-06-19 transplant-first intent was about not fragmenting a half-landed substrate; with
Phases 0–8 merged that intent was **substantively satisfied**, and the owner's newest banner
voice already pointed at remediation. Position-1's remainder is practice-estate work,
file-disjoint from product remediation. Serial execution of disjoint estates is wall-clock waste;
"no parking" is satisfied by _named positions_, not queueing.

**4 · Synthesis.** Two parallel programs plus a reconciliation slice; the owner then scoped to
product + reconciliation with practice landings deferred at their named position (owner decision
1, 2026-07-17). Warrant: file-disjointness of the two estates + the owner's latest recorded
voice. Falsifier: owner ruling the transplant-first order still binding — resolved by the owner's
explicit scope decision the same day.

## Postscript (2026-07-18)

The fragmentation mechanism named in Pass B §2 was subsequently confirmed empirically: five
successive bot-review rounds on the bootstrap PR walked the authority fan-out outward ring by
ring (program record → roadmap/README → continuity/prompt → delivery ledger → per-finding plans),
each ring closing only when the supersession reached it. The durable cure applied was
single-sourcing plus exhaustive ring sweeps — recorded in the napkin as a pattern candidate.
