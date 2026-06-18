# No Manufactured Permission to Bypass an Absolute

Operationalises [`principles.md` §Strict And Complete Everywhere, All The Time](../directives/principles.md)
and [`principles.md` §Quality Gates](../directives/principles.md) ("All
quality gate issues are blocking at ALL times, regardless of where or why
they happen").

An absolute holds in every case it governs. When one is in the way, the
impulse is to manufacture a permission structure that lets you past it
without paying the cost. That reach is the failure. This rule names the
reach itself as the tripwire, before the permission is built.

## When This Fires

An absolute blocks the easy path — `never-disable-checks`, strict-and-complete-everywhere,
a fail-fast invariant, sacred-file protection, the no-parking / sequenced-positions
discipline — and you reach for one of:

- **a label** that reclassifies the obstacle away — `SACRED`, `parked-in-place`,
  `known issue`, `informational`, `not a real failure`;
- **an inherited or fabricated decision** invoked as authority — "the owner
  parked this", "a prior session decided", an annotation read as a verdict;
- **an undefined-later** — "note it for a future slice", "handle separately",
  "TODO: fix later", any deferral without a named position;
- **a precedent** — "we already disabled four sonarjs rules, so one more is
  fine", "it has always been done this way".

The common shape: the absolute is not being satisfied or repaired; it is being
_relabelled, attributed, deferred, or normalised_ so the work can proceed past
it. The moment you reach for any of these to get past an absolute, this rule
has fired.

## The Cure

The reach is the signal — stop before constructing the permission.

1. **Obey the absolute.** Fix it now, or sequence it with a **named** position
   (a specific phase, slice, or owner-gated register entry — never an undefined
   later, never a softened gate).
2. **A label is not a fix.** Reclassifying a defect (`informational`, `known
issue`, `SACRED`) does not discharge it; the defect is still blocking.
3. **Locate the authority.** If you are leaning on an inherited or attributed
   decision, find the owner's actual words ([`precedence-is-not-approval`](precedence-is-not-approval.md));
   a prior act is precedence, not approval.
4. **If you genuinely cannot resolve it**, surface it to the owner as a doctrine
   decision ([`rules-have-no-exceptions` §When a case seems not to fit](rules-have-no-exceptions.md),
   [`owner-attention-at-action-moments`](owner-attention-at-action-moments.md)) —
   never encode a carve-out and proceed.

## Why This Is Strict

Each manufactured permission is a small licence to stop thinking, and the next
author reads it as a precedent — which feeds straight back into the precedent
face of this same tripwire. An absolute that can be softened by relabelling,
attribution, or "for later" is not absolute; it is advisory wearing an
absolute's name. The cost of obeying it once is far less than the cost of an
estate where every absolute has a known escape hatch.

## Composition

This rule is the cross-cutting tripwire over four absolutes whose individual
homes each see only one face of the same failure:

- [`never-disable-checks`](never-disable-checks.md) — the check-disabling /
  relabel-the-gate face.
- [`rules-have-no-exceptions`](rules-have-no-exceptions.md) — do not freeze the
  misfit into the rule as a carve-out; repair or surface instead.
- [`precedence-is-not-approval`](precedence-is-not-approval.md) — the precedent
  and inherited-decision face; backed by [PDR-091](../practice-core/decision-records/PDR-091-precedence-is-not-approval.md).
- [`no-speed-pressure`](no-speed-pressure.md) / no-parking — the undefined-later
  face; a deferral is honest only with a named position.

## Worked Instances

- **2026-06-10 — caught four times in one session.** A `SACRED`-label parking →
  a fabricated "parked-in-place" attribution → an undefined "CI-modernisation
  slice" → "precedent matters for the lint decision." Owner: _"no disabling
  checks, strict everywhere all the time… no circumstance, including prior work,
  bypasses that rule."_
- **2026-06-09 — a fabricated owner decision.** A continuity surface recorded
  "the owner parked the feature slice"; the attribution was never the owner's,
  and it sat in front of six shipped Critical defects for four days. Owner: _"I
  have never decided anything should be 'parked in place' and I never would. All
  issues MUST be fixed."_
- **2026-06 — a defect behind the SACRED label.** A `stale-script` finding
  inside `principles.md` was first parked as "an owner action-moment behind the
  SACRED label." Owner: _"Nothing is sacred, this is engineering discipline, not
  dogma. Known issues are always blocking, resolve them."_

## Classification

`always-on`. The reach for manufactured permission can happen at any decision
moment, so the tripwire must be loaded in every session.
