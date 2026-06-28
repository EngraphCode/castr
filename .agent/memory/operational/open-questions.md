---
fitness_line_target: 180
fitness_line_limit: 240
fitness_char_limit: 14000
fitness_line_length: 100
drain_strategy: >-
  Surface owner-decision items during consolidate-docs; move answered or
  withdrawn entries to an archive when the register needs rotation.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Open Questions

Register of non-urgent unresolved planning, design, or process questions —
questions that shape future work but do not block any current cycle. Urgent
or cycle-blocking questions belong in the active plan or an owner escalation,
not here. Answered or withdrawn entries are drained at `consolidate-docs`.

Each entry should carry: a `Q-NNN` id, a `Captured` provenance stamp, the
question, why it shapes future work, why it is not cheaply answerable now, its
owning artefact / discussion home (if any), and a status line.

> **Materialised 2026-06-18 (Practice transplant Phase 6).** The register is new
> in castr; entries are populated from castr's own state by the Phase-6 napkin
> drain and later consolidation passes — not copied from any other repo.

<!-- Q-entries appended below by drains and consolidation passes. -->

_Register empty (2026-06-26). Q-006 graduated to ADR-049; Q-007 decided by the owner (markdown-links gate
end-state → scoped-blocking on transplant-completed surfaces, recorded in the transplant-completeness plan
TC3b). The permanent homes are the record, not a tombstone here. New questions are appended below by future
drains and consolidation passes._

### Q-008 — should the machine-local-paths invariant also clean `archive/` before any publish?

`Captured: 2026-06-28 | source: LC3a (machine-local-paths validator) consolidation`

**Question:** the `no-machine-local-paths` rule's own Detection scope exempts `archive/` (frozen historical
records), and the LC3a validator + write-time guard honour that exemption. But archived napkins still contain
real user-home segments (e.g. `/Users/<user>/...`) that would leak a username (PII) if the repo is ever made
public. Should there be a publish-time (or pre-publish) pass that de-PII's archives, or is the archive-exemption
acceptable because castr is private?

**Why it shapes future work:** it is a release/publication-boundary decision (affects whether a public-repo move
needs an archive-scrubbing step), and it is the kind of latent PII exposure that is cheap to fix before publish
and expensive after.

**Why not cheaply answerable now:** depends on the owner's intent for ever publishing this repo, and on whether
archives should be rewritten (history-altering) vs scrubbed-at-export. Owner-decision-class.

**Owning artefact:** the `no-machine-local-paths` rule + the LC3 lane (`practice-loop-closure-remediation.md`).
**Status:** open — surfaced to owner at the LC3a closeout (2026-06-28).

### Q-009 — how to renumber the 23 incoming Oak PDRs given the 096/097 collision?

`Captured: 2026-06-28 | source: Oak→castr gap rescan`

**Question:** the bring backlog includes 23 Oak PDRs (Oak 096–119). castr's own PDR-096
(bring-the-iceberg) and PDR-097 (dependency-currency) are castr-originals occupying those
numbers — Oak's 096/097 are different PDRs. So the cross-repo PDR-number correspondence
(shared for 001–095) already broke at 096. Bringing Oak's 096–119 needs a renumbering scheme:
(a) import Oak's as castr 098+ (accept permanent number-skew from Oak), or (b) renumber
castr's two originals and take Oak's 096/097 (restore correspondence, churn castr refs), or
(c) a mapping table. **Why it shapes future work:** every one of the 23 PDR brings + their
cross-references depends on the scheme; choosing late means rework. **Why not cheaply now:**
governance decision about the castr↔Oak PDR-numbering invariant (is shared numbering a goal?).
**Owning artefact:** `oak-castr-gap-rescan-2026-06-28.md` §PDRs. **Status:** **DECIDED 2026-06-28 (owner) →
mapping table.** Keep castr's own 096/097; import each Oak PDR at its Oak number where free; for the 096/097
collisions assign the next free castr number and record the Oak↔castr correspondence in a **transient import
artifact** (plan-level/ephemeral, in the transplant area) that is **DELETED once the bulk PDR import completes** —
nothing permanent may reference it (durability axis); imported PDRs end self-contained at their final castr numbers.
**PDR-105 (reference-direction) has no collision → lands at castr-105 directly** (its deps PDR-007/019 + the two
rules already exist in castr); the map is only load-bearing for the colliding/bulk import. (Drained at next consolidate-docs.)

### Q-010 — reconcile principles.md `Result<T,E>` examples with castr's fail-fast doctrine

`Captured: 2026-06-28 | source: Oak→castr gap rescan (use-result-pattern reclassification)`

**Question:** `.agent/directives/principles.md` carries `Result<T,E>` error-handling examples
(lines 854/939/1199/1796) while castr's codebase doctrine is fail-fast/throw (it rejected
`@oaknational/result`→throw in the D4 lane, and declined to bring Oak's `use-result-pattern`
rule on those grounds). The rescan surfaced this as a castr-internal doctrine-vs-reality
tension. **Resolution path:** rewrite principles.md's Result examples to throw-based, OR scope
`Result<T,E>` to a narrow explicitly-allowed use and state the boundary. **Why not cheaply
now:** needs an owner call on whether Result has any sanctioned place in castr or is fully
superseded by fail-fast. **Owning artefact:** `principles.md` + `oak-castr-gap-rescan-2026-06-28.md`
§Firsthand corrections. **Status:** open — castr-internal cleanup, owner-facing.

### Q-011 — how should the three axes (A transplant/parity, B product-remediation, C delivery) be sequenced?

`Captured: 2026-06-28 | source: plan-system coherence review`

**Question:** the "one deep enhancement" has three axes: **(A)** the Oak→castr Practice transplant + parity-or-better
(active — the gap-rescan backlog, which the 2026-06-28 rescan just enlarged substantially); **(B)** the deep-review
product-correctness remediation — **5 reproduced Critical defects remain (C2–C6); C1 is already FIXED** (plan 01,
`a2c86ab`/merged `8ed2b0a`). Firsthand status (verified 2026-06-28): plan **02** (C2/C3/C4 + H1–H4/M10 — silent
content loss/corruption while gates stay green; the plan's own words: _"the single highest-leverage item in the
review"_) sits in `.agent/plans/active/02-ir-fidelity-proof-harness.md` but is marked **Status: Backlog** (promoted-
then-parked); plans **03 (C6)** and **04 (C5)** are dormant in `.agent/plans/remediation/`. So B is parked, not
demoted-by-completion. **(C)** delivery (the one PR to `main` — deprioritised). The review found B sits in tension with
the owner's own roadmap doctrine ("all issues MUST be fixed, mostly now; an undefined 'later' is never; advancing the
transplant does not demote remediation") — and Axis A just grew, pushing B further out.
**Why it shapes future work:** it decides whether the next slices come from the gap-rescan backlog (A) or whether B
(the reproduced Criticals) is interleaved/promoted; it is the top-level priority call for the whole programme.
**Why not cheaply now:** a genuine owner priority/risk decision (ship-correctness-first vs finish-the-substrate-first),
not an engineering determination. **Owning artefacts:** `roadmap.md` §Current Workstream Status, `remediation/README.md`,
and `oak-castr-gap-rescan-2026-06-28.md`. **Status:** **DECIDED 2026-06-28 (owner) → Axis A first** — execute the
gap-rescan Tier-1 bring spine (trusted-git → CI/gitleaks → collaboration-safety cluster → …). The owner chose A over
the recommended B-first. This makes Axis B a **defined** sequencing ("after the Tier-1 spine"), not an undefined later,
so the no-park-doctrine tension is resolved by an explicit owner call: the 5 reproduced Criticals (C2–C6, plan 02
parked) are addressed after Tier-1, not abandoned. Re-surface B for promotion at Tier-1 close. (Drained at next
consolidate-docs.)

_Transplant decisions (delivery framing, single-TS-override, statusline, release tooling, hook-matcher
precision) are carried by
[`threads/practice-transplant.next-session.md`](threads/practice-transplant.next-session.md)
§ Standing decisions + Lanes._
