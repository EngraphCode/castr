# Reference-Closure Ledger — Oak → castr transplant

Running classification of every cross-reference in transplanted Practice surfaces, per PEEN's method:
**resolve** (target exists in castr), **rewrite** (re-point to a castr equivalent), **placeholder** (dangling, scheduled
for a later phase), or **retained-cross-host** (an honest, intentional reference to the originating host's phenotype that
castr does not and will not mirror — a _resolved_ disposition, not an open placeholder).

Phase-9 acceptance = **zero open `placeholder` entries**; `retained-cross-host` entries are accepted dispositions.

**Governance — PDR vs ADR (owner, 2026-06-05; sharpens PDR-079):** PDRs are **portable governance and never
repo-specific**; anything genuinely repo-specific **necessarily goes in a castr ADR**. When operationalising a
transplanted PDR, author a **castr ADR only if the portable PDR is not sufficient** for a repo-specific need — do not mint
an ADR by reflex. So Oak-ADR cites reference-close to the portable PDR wherever one suffices, and become a castr ADR only
when castr has a genuinely local decision to record.

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

90 distinct intra-PDR cites; all 91 PDR files (89 numbered slots — PDR-086 vacant, inherited from Oak; PDR-076 split into 076/076a/076b) transplanted together, so every intra-PDR reference resolves. ✓

### PDR / practice-verification → no `@oaknational`/`oak-` naming

Verified: 0 files carry Oak-package naming. No localisation required for the PDR estate or `practice-verification.md`. ✓

---

## Phase 1b — Core generation merge + provenance + practice-context retirement

### `provenance.yml` created (history union) — disposition: **resolve**

Phase 1a left the trinity + `practice-verification.md` pointing at `provenance: provenance.yml` with no such file
present (a dangling pointer). Phase 1b creates `.agent/practice-core/provenance.yml` as the union of Oak's four
per-file chains + castr's branch-local entries (the 2026-03-22 entry on `practice.md` + `practice-lineage.md`) + a
2026-06-05 merge node per tracked file. All four `provenance: provenance.yml` pointers now resolve. Identity-deduped
(castr's inline indices 0–7 ≡ Oak's shared-ancestry entries — not re-added); zero duplicate ids. ✓

### Core generation converged to Oak's current portable trinity — disposition: **resolve**

`practice.md`, `practice-lineage.md`, `practice-bootstrap.md`, `index.md`, `README.md` adopted from Oak's current
generation (0 `@oaknational`/`oak-` naming; self-containment clean — no navigable external links except
`../practice-index.md`). Verified castr's portable trinity carried no generic content Oak lacks (learned principles are
an Oak superset; "Paused is not future" already in Oak; the 2026-03-22 wording survives as provenance history).
`practice-verification.md` already current from 1a (cosmetic bullet style only). `CHANGELOG.md` = Oak's canonical
history (already carries `[castr] 2026-03-09`) + inserted `[castr] 2026-03-22` + prepended `[castr] 2026-06-05`
transplant entry. No localisation needed — every `oak-` hit is `[oak-open-curriculum-ecosystem]` repo-name provenance.

### `.agent/practice-context/` retirement — disposition: **rewrite (live) / retained-historical (immutable)**

Retired per PDR-007 amendment (2026-04-29). Directory removed; castr's 4 authored `outgoing/` notes archived to
`.agent/archive/practice-context-outgoing/` (git-mv, history preserved; README explains provenance).

- **Live navigational references repointed (rewrite):** `.agent/directives/AGENT.md` (structure list — surgical line
  removal, PRESERVE-safe), `.agent/README.md` (tree diagram), `.agent/practice-index.md` (removed the one navigable
  `](practice-context/)` table row — the only broken-link risk). 0 navigable `practice-context` links remain in `.agent`.
- **Core prose:** the adopted Core mentions `practice-context` only to document its retirement — correct, kept.
- **Retained-historical (NOT edited):** `practice-context` references inside 7 immutable PDRs + `decision-records/README.md`
  (PDR-001/PDR-079 immutability — they record the decision), 2 archived files, and 3 completed/future plans (historical
  record). Editing these for cosmetic cleanup would violate immutability and lose history.
- **Known cross-host prose inconsistency (retained-cross-host):** Oak's adopted Core prose names `decision-records/incoming/`
  as the inbound surface, but the actual Practice Box is `practice-core/incoming/` (present in both Oak and castr).
  Code-text only, non-breaking; mirrors Oak's own doc/disk state. Not corrected in 1b.
