# Component: Documentation Propagation

Use this component in any strategic roadmap or executable plan where work may
change the agentic engineering practice, planning standards, or repository
guidance.

## Required Canonical Documents

Plans must include update handling for:

1. the impacted decision records under
   `docs/architectural_decision_records/` and
   `.agent/practice-core/decision-records/`
2. `.agent/directives/AGENT.md` (where behaviour, interfaces, or
   contributor workflows changed)

Also include any additionally impacted ADRs, `/docs/` pages, and README files.

## Required Behaviour

For each phase or major workstream:

- update impacted documents directly, or
- record an explicit no-change rationale

No phase is complete until one of those outcomes is documented.

Also apply the
[`engraph-consolidate-docs` workflow](../../../skills/consolidate-docs/SKILL-CANONICAL.md)
before closure to ensure settled documentation is extracted from plans.

## Recommended Tracking Pattern

- Keep the collection's documentation-sync-log (`.agent/memory/operational/documentation-sync-logs/[collection].md` — operational memory, never inside the plans tree) with one section per
  phase/workstream.
- In each section capture:
  - status
  - update/no-update rationale for each required canonical document
  - additional ADR/docs/README updates

## Merge-Readiness Rule

If documentation propagation is incomplete, the plan is not merge-ready.
