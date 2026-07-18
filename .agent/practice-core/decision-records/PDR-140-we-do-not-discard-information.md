---
pdr_kind: governance
---

# PDR-140: We Do Not Discard Information — the Conservation Invariant

**Status**: Adopted (owner-worded 2026-07-10, stated as standing doctrine
in the same session that produced three of its worked instances; the
directive and rule landings ride the same change set as this record)
**Date**: 2026-07-10
**Related**: [PDR-011](PDR-011-continuity-surfaces-and-surprise-pipeline.md)
(the capture pipeline this invariant underwrites);
[PDR-046](PDR-046-layered-knowledge-processing.md) (preserve first,
restructure second — the knowledge-layer instance);
[PDR-094](PDR-094-coordination-event-rotation-is-class-tiered-archive-not-delete.md)
(archive-not-delete — the state-plane instance); [PDR-139](PDR-139-comms-events-thread-at-creation.md)
(threading required at creation — information captured when it exists,
because no later process can recover it); the host estate's
`principles.md` (the type-discipline and fail-fast instances) and
`knowledge-preservation-over-fitness-warnings`,
`never-use-git-to-remove-work`, and `read-diagnostic-artefacts-in-full`
rules (enforcement edges).

Owner provenance (2026-07-10, verbatim substance): "unless there is an
operational constraint, such as buffer excession, ALL repo command output
MUST be read in full at ALL times. That means no redirection to /dev/null,
but also more subtle things like not tail. Where this is a problem caused
by length, we fix the underlying cause in the loquacious process, we don't
discard information. **That is the invariant, in our type policies, our
system design, our approach to command output, our archiving of prior
plans... we do not discard information.**" — and, ratifying its reach:
"That goes straight to directives, and to PDRs, and the very core of the
Practice."

## Context

The Practice accumulated, over months and estates, a family of rules that
were authored independently and enforced separately: never widen types,
never use type escape hatches, fail fast and loud, append-only event
stores, archive-not-delete rotation, verbatim count-conserved napkin
rotation, roll-forward-only git history, the conservation invariant on
knowledge surfaces, read-diagnostic-artefacts-in-full. Each carried its
own rationale. On 2026-07-10 a session produced three same-day owner
corrections — a fitness cure rejected for trimming knowledge to fit a
limit, a validator scoped to git-tracked files as if tracking bounded
care, and a command wrapper that silenced a fail-fast error — and the
owner named what the corrections had in common. They were not three
rules; they were one invariant violated at three layers.

## Decision

**Information, once it exists, is never discarded — at any layer, in any
representation.** The invariant binds:

1. **Types**: widening, escape hatches (`as`, `any`, `!`), and lossy
   extractions destroy type information irreversibly. (The type policies
   were always this invariant; `principles.md` §Type System Discipline is
   its oldest enforcement edge.)
2. **System design**: event stores are append-only; corrections are new
   entries that name what they correct; rotation is archive-move, never
   delete; history is roll-forward, never amend; state that must exist at
   creation time is captured at creation time (PDR-139), because absence
   is unrecoverable.
3. **Command output**: unless a genuine operational constraint (such as
   buffer excession) applies, ALL repo command output is read in full, at
   all times. No `>/dev/null`, and none of the subtle forms either —
   `tail`, `head`, and noise-filtering `grep` on repo command output all
   discard unobserved information, and the discarded region is exactly
   where the surprise lives. Capture-to-file preserves (the file is the
   complete record and the diagnosis artefact); the read is full by
   default.
4. **Knowledge and plans**: completed plans archive whole with
   supersession mappings; knowledge surfaces are never trimmed to satisfy
   a size signal; size pressure resolves by graduation upward or
   structural rotation — moving information, never destroying it. There
   is no my-own-prose exception: authorship grants no discard licence.

**The corollary that makes the invariant operable**: when volume makes
full observation impractical, **fix the underlying cause in the loquacious
process** — quiet the emitter, remove recursion banner noise, make
success output one line of signal and errors verbose — never normalise
discarding at the reader. An operational constraint is the trigger to fix
the emitter, not a standing licence.

**The boundary (data rights outrank conservation)**: the invariant
governs the estate's ENGINEERING information — types, command output,
history, plans, knowledge. It never overrides the product's data-rights
obligations: user, private, and regulated data follow the host product's
retention, no-raw-retention, deletion, and redaction contracts, wherever
that estate records them. Deleting data the product is obliged to delete
is not discarding information — it honours a different invariant, the
user's rights over their own data, which outranks this one wherever the
two meet. Each adopting estate draws the same line at its own product
boundary and records the host-side citation in its bridge index (this
estate's principles directive carries its own pointer).

## Consequences

- Every existing conservation-family rule gains a common citable root;
  new rules in the family cite this PDR rather than re-deriving the
  rationale.
- Agent transport habits (`>/dev/null 2>&1 && echo ok`, `| tail -3`,
  `| grep -v` noise filters) are doctrine violations even when the
  wrapped command succeeds — the violation is the discarding, not the
  outcome.
- Tooling inherits an output-contract obligation: emitters must make full
  reading practical (signal-dense success lines, verbose errors, no
  banner noise), because the invariant binds both sides of the seam.
- Fitness and size signals estate-wide are confirmed as routing signals
  only; any cure whose mechanism is deletion of substance is invalid by
  construction.
- The invariant travels with the Core: adopting estates inherit it as the
  root of their conservation family, then express it through host-local
  enforcement edges.

## Falsifiability

The record is wrong, or incomplete, if: (a) a layer is found where
deliberate information discard is the architecturally correct steady
state and no move/fix-the-emitter alternative exists (the owner-named
operational-constraint escape is bounded and emitter-fixing, so it does
not falsify); or (b) the unification mis-predicts — a future
conservation-family correction that this invariant, applied at the right
layer, would not have prevented. Three same-day worked instances
(2026-07-10: the trimming rejection, the tracking-scoped validator, the
silenced exit-2) currently confirm the predictive form.
