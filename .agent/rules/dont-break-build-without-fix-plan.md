# Don't Break the Build Without a Fix Plan

Operationalises the green-gate invariant of
[`DEFINITION_OF_DONE.md`](../directives/DEFINITION_OF_DONE.md) and
[`quality-gate-failures.md`](quality-gate-failures.md) for the cross-agent
context introduced by
[`agent-collaboration.md`](../directives/agent-collaboration.md).

## Origin authority (Oak phenotype, verbatim)

From Oak's `gate-recovery-cadence.plan.md` `## Intent` (cross-host origin;
the plan is Oak-local):

> Restore the invariant that build, type-check, lint, format, markdown,
> depcruise, knip, and static checks stay green even during TDD. RED is
> allowed only as intentional failing behavioural tests, not as missing
> imports, broken types, lint warnings, or build failures.

The procedural application lives in `## Recovery Sequence` point 2 of the
same plan ("Make non-test gates green first"): replace missing-symbol
failures with typed minimal seams that compile and fail behaviourally.

## Rule

**Do not commit, push, or leave the working tree in a state that breaks
build/type-check/lint/format/madge/depcruise/knip without a named,
in-flight fix plan owned by you in the current session.**

The gate scope is the whole repository. Do not narrow hooks or quality gates to
the staged bundle to make a commit land: the only result that matters is that
the whole repo passes. The commit queue verifies staged-bundle integrity; it
does not excuse whole-tree breakage.

In a single-agent context this is a personal-discipline rule. In the
multi-agent context introduced by `agent-collaboration.md`, breaking the
build couples a local quality issue into a _coupling failure across
parallel agent sessions_: another agent's pristine staged work depends
on the same gates passing on the same working tree.

## What "fix plan" means

- A named workstream / TDD slice you are actively working through;
- Recoverable in the current session for small issues — formatting,
  lint autofix, and similarly mechanical repairs are fixed immediately;
- Surfaced to other agents through the shared communication log
  (`.agent/state/collaboration/shared-comms-log.md`) when the breakage will outlive
  the immediate edit;
- Highest-priority next work when the issue is too large to repair
  immediately, with an owner-visible plan or escalation before unrelated work
  continues;
- Aligned with the recovery sequence quoted above: typed seams that
  compile and fail behaviourally, not missing-symbol REDs.

## What is forbidden

- Missing-import REDs that break type-check or build at the working-tree
  level;
- Lint or format warnings left in place because "tests still pass";
- Disabling a gate (eslint-disable, `--no-verify`, `--quiet`) to make a
  warning go away (cross-cutting:
  [`no-warning-toleration.md`](no-warning-toleration.md));
- Leaving a partial-state intermediate where two parallel agents'
  pre-commit hooks both fail because of one agent's WIP.
- Introducing compatibility layers, shims, or fallback paths as the fastest
  way to make a gate pass. Fix the boundary instead.

## Cross-references

- Authority surfaces:
  [`DEFINITION_OF_DONE.md`](../directives/DEFINITION_OF_DONE.md) and
  [`quality-gate-failures.md`](quality-gate-failures.md) — all gate
  failures are blocking, regardless of location, cause, or context.
- Adjacent doctrine:
  [`no-warning-toleration.md`](no-warning-toleration.md) — warnings are
  not deferrable.
- Containing directive:
  [`agent-collaboration.md`](../directives/agent-collaboration.md) §Scope
  Discipline Across Agent Boundaries.
- Operational pattern: `parallel-track-pre-commit-gate-coupling` —
  founding instances recorded in Oak's napkin under the 2026-04-24 and
  2026-04-25 entries (cross-host origin).
- Origin: Oak's `gate-recovery-cadence.plan.md` (cross-host; quoted
  above) cites this rule as the cross-agent operationalisation;
  bidirectional references are validated at consolidation time per
  [`consolidate-docs`](../skills/consolidate-docs/SKILL-CANONICAL.md).
