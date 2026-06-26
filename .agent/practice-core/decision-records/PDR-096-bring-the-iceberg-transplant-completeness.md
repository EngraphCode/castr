---
pdr_kind: pattern
---

# PDR-096: Bring the Iceberg — A Transplanted Capability Is Complete Only When Its Supporting Infrastructure Resolves

**Status**: Accepted
**Date**: 2026-06-26
**Related**:
[PDR-035](PDR-035-agent-work-capabilities-belong-to-the-practice.md)
(agent-work capabilities are Practice substance — the doctrine that
makes a capability's supporting infrastructure a Practice concern, not
incidental scaffolding);
[PDR-060](PDR-060-tooling-friction-is-first-class-user-feedback.md)
(sibling pattern — a dangling post-transplant reference is exactly the
first-class friction signal that routes this work);
[PDR-007](PDR-007-promoting-pdrs-and-patterns-to-first-class-core.md)
(pattern PDRs are authored fresh via synthesis; the host-local
instances stay in `memory/active/patterns/`).

## Context

The Practice is portable: it hydrates a host repo by transplant, the
plasmid carrying skills, rules, validators, and the directives that
reference them. A transplant reliably brings a capability's **canonical
surface** — the skill body, the rule text, the validator entry point.
It does **not** reliably bring that surface's **supporting
infrastructure**: the root script proxies a skill invokes, the template
libraries a plan skill reads, the catch-validators a directive assumes
are wired. That infrastructure is the submerged mass under the visible
tip.

When the supporting infrastructure is dropped, the transplanted
capability still _looks_ present — the canonical file is there — but a
reference inside it no longer resolves. The symptom is indistinguishable
from ordinary **documentation drift**: a reference that points at
something absent. And the conventional cure for documentation drift is
to **patch the doc to match reality** (delete or rewrite the dangling
reference). Applied here, that cure is exactly wrong: it deletes the
reference to the missing infrastructure, hides the gap, and cements the
hollow transplant permanently.

Worked instances (castr, 2026-06-26 transplant-completeness program):

- **TC1** — the commit skill referenced ~15 root script proxies
  (`agent-tools:*`, `practice:*`) that the transplant had dropped.
  Restoring them un-hollowed the skill; the **iceberg recursed** — the
  restored commit orchestrator internally invoked further-dropped
  `practice:*` infrastructure, so the enumeration had to be transitive.
- **TC3a** — the structural catch itself (`validate-markdown-links`)
  was among the dropped infrastructure. The validator that would have
  _failed the gate_ on a hollow transplant was un-transplanted, which is
  precisely why the gaps went undetected.
- **Reason-skill bring** (the forward exemplar) — executing
  bring-by-default cleanly, bringing the skill _and_ its
  `grammar-of-thinking.md` reference together.
- **Twice in agent reasoning** — the reflex to patch the doc to match
  the gap (the wrong cure), and a manufactured owner-gate dissolved by
  bring-by-default.

## Decision

**A transplanted capability is complete only when its supporting
infrastructure resolves. When a reference does not resolve after a
transplant, the cure is to BRING the missing infrastructure so the
reference resolves — never to patch the documentation to match the
gap.**

The pattern has four load-bearing parts:

1. **Incomplete transplant ≠ documentation drift; the cure is the
   opposite.** Both present as a reference that does not resolve.
   Doc-drift's cure (patch the doc to match reality) _deletes_ the
   reference and cements the corpse. Incomplete-transplant's cure
   _brings_ the missing infrastructure so the reference resolves. Before
   patching any dangling reference, ask: is the target absent because it
   was never meant to exist here (drift → patch), or because it was
   _dropped in transplant_ (incomplete → bring)?

2. **Enumerate the iceberg transitively.** A restored piece of
   infrastructure can itself reference further-dropped infrastructure.
   The bring is not done when the first reference resolves; it is done
   when the transitive closure of references resolves.

3. **The structural catch is a validator that fails on a dangling
   reference — often plural, and often itself un-transplanted.** The
   detector for a class of defect is part of what a hollow transplant
   drops, which is _why_ the defect class slips through; when a defect
   class "slips through", check whether its detector was itself dropped,
   and bring it. The catch is frequently a **union of detectors by
   reference _kind_** rather than one validator — path/link references,
   activation/permission wiring, and command references are each
   invisible to the others' detectors, so a complete-transplant gate is
   their union, not a single check.

4. **Generalisation: a capability is only as good as the supporting
   context it carries.** The same shape recurs beyond transplant — a
   pinned upstream source that drifts to a corpse, a skill whose
   referenced infra is hollow, a plan whose controlling detail lives
   only in a volatile surface. A capability transplanted, cited, or
   relied upon without its supporting context is a tip without its
   iceberg.

## Scope

**Adopter scope**: every Practice-bearing repo. Any repo that hydrates
the Practice from another — or transplants a capability between its own
workspaces — faces the hollow-transplant shape. The substance is
portable; the host-local instances (which proxies, which validators)
are not, and stay in the host's transplant plans and
`memory/active/patterns/`.

## Consequences

### Required

- After transplanting a capability, verify that every reference it
  carries (script proxies, template libraries, catch-validators,
  cited surfaces) resolves — transitively.
- When a reference does not resolve, diagnose drift-vs-incomplete
  before choosing a cure; for incomplete-transplant, bring the missing
  infrastructure.
- Bring the catch-validators that enforce reference integrity, so the
  next hollow transplant fails the gate instead of going silent.

### Forbidden

- Patching a doc to match a hollow transplant (deleting/rewriting a
  dangling reference whose target was dropped in transplant). This is
  the doc-drift cure mis-applied; it hides the gap.
- Declaring a transplanted capability complete on the evidence that its
  canonical surface is present. Canonical-surface-present is the tip,
  not the iceberg.

### Accepted cost

- Transitive enumeration of an iceberg is more work than a one-line
  doc-patch. The cost amortises: the gap is closed and the detector is
  wired, rather than hidden to resurface in a later session.

## Notes

The standing **bring-by-default** policy — the default for every
capability is to bring it; the burden of proof is on _not_ bringing (a
positive deliberate-localisation reason), never uncertainty — is the
operational stance this pattern's cure assumes. Contrast
[`documentation-hygiene`](../../rules/documentation-hygiene.md): its
patch-the-doc-to-match-reality cure is correct when the absent target
was never meant to exist; this pattern is the exception — when the
target was dropped in transplant, bring it back rather than delete the
reference. Host-side adoption (which proxies, which validators, a given
transplant program's lanes) is recorded in the host's transplant plans
and bridge index, not here, per the Core portability constraint.

## Source

Graduates the `transplant-completeness — bring the iceberg` candidate
from [`pending-graduations.md`](../../memory/operational/pending-graduations.md)
(captured 2026-06-26, owner-named). Owner-approved for graduation at the
2026-06-26 dedicated consolidation (Eclipsed Lurking Moth). The
host-local distilled instance is the transplant-method block entry in
[`.agent/memory/active/distilled.md`](../../memory/active/distilled.md).
