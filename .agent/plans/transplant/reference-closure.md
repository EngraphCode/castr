# Reference-Closure Ledger — Oak → castr transplant

Running classification of every cross-reference in transplanted Practice surfaces, per PEEN's method:
**resolve** (target exists in castr), **rewrite** (re-point to a castr equivalent), **placeholder** (dangling, scheduled
for a later phase), or **retained-cross-host** (an honest, intentional reference to the originating host's phenotype that
castr does not and will not mirror — a _resolved_ disposition, not an open placeholder).

Phase-9 acceptance = **zero open `placeholder` entries**; `retained-cross-host` entries are accepted dispositions.

---

## Phase 1 — Practice Core / PDRs

### PDR → Oak-ADR citations — disposition: **retained-cross-host**

The 92 transplanted PDRs cite **8 distinct Oak ADRs** (all > castr's ADR-047, so non-resolvable in castr):
`ADR-131, ADR-150, ADR-176, ADR-177, ADR-178, ADR-183, ADR-185, ADR-186`, across 10 PDR files (`PDR-011, PDR-053,
PDR-054, PDR-055, PDR-059, PDR-060, PDR-074, PDR-075, PDR-077, PDR-078`).

**Why retained, not rewritten or placeholdered:**

- PDRs are **portable governance and immutable once numbered** (PDR-001, PDR-079). They are not edited on receipt.
- Per the PDR/ADR distinction (PDR-079), a PDR names the portable principle and its **host-repo operationalisation lands
  as a repo-bound ADR**. These cites are honest statements that _in the originating Oak host_ the PDR is operationalised
  as ADR-NNN ("the host-repo implementation lands as ADR-176", "per ADR-185", etc.). They are **not instructions castr
  must follow** and not broken governance.
- castr has no equivalent ADRs and will not import Oak's product ADRs (owner decision). When castr later operationalises
  one of these PDRs, it authors its **own** ADR — at which point that PDR's castr phenotype is castr-local, and the Oak
  cite remains accurate origin history.
- The ~5 markdown-link forms (`[ADR-131](../../../docs/architecture/architectural-decisions/…)`) resolve to Oak's tree,
  not castr's, so the _links_ are non-functional in castr — but they are **non-load-bearing historical context**, and
  castr has no markdown-link gate. Editing immutable PDRs to de-link them would violate PDR-001 retention for cosmetic
  gain.

**Disposition:** retained-cross-host (resolved). No PDR edits. Re-evaluate only if castr adopts a markdown-link gate, in
which case the link _targets_ (not the references) get neutralised to plain text in a single governed sweep.

### PDR → PDR citations — disposition: **resolve**

90 distinct intra-PDR cites; all 92 PDRs transplanted together, so every intra-PDR reference resolves. ✓

### PDR / practice-verification → no `@oaknational`/`oak-` naming

Verified: 0 files carry Oak-package naming. No localisation required for the PDR estate or `practice-verification.md`. ✓
