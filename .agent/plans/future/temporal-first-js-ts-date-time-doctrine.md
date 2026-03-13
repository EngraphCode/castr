# Plan (Future): Temporal-First JavaScript / TypeScript Date-Time Doctrine

**Status:** Planned  
**Created:** 2026-03-12  
**Last Updated:** 2026-03-12

---

## Goal

Define the permanent Castr doctrine for JavaScript / TypeScript date and timestamp carriers, with the current direction that `Temporal` should be preferred over `Date`.

## User Impact To Optimise For

- honest date-time carrier choices in generated TypeScript / JavaScript-facing surfaces
- no quiet reliance on legacy `Date` semantics where the repo wants stricter temporal meaning
- one explicit answer for future seams involving `date`, `date-time`, and timestamp-like values

## Scope

In scope:

- JavaScript runtime carrier options relevant to Castr:
  - `Date`
  - `Temporal` types
  - string-carried ISO forms where those remain the honest portable representation
- TypeScript output doctrine for date and date-time semantics
- standards and runtime support evidence needed to choose between `Date`, `Temporal`, or string-first output
- interaction with ADR-041 native-capability seam doctrine

Out of scope:

- implementing Temporal-based code generation
- broad timezone/business-calendar policy design
- polyfill packaging decisions unless the doctrine proves they are required
- changing unrelated numeric semantics

## Assumptions To Validate

1. `Date` is a legacy JavaScript carrier with semantic drawbacks for strict schema work.
2. `Temporal` is the preferred long-term direction, but runtime availability and ecosystem support may constrain current output policy.
3. Portable OpenAPI / JSON Schema `date` and `date-time` remain string-based standards constructs even if JS/TS chooses a richer native carrier.

## Actions

1. Build a standards-and-platform matrix for:
   - OpenAPI `date`
   - OpenAPI `date-time`
   - JSON Schema date/date-time conventions
   - Zod date/date-time support
   - TypeScript carrier options
   - JavaScript runtime carrier options
2. Compare `Date`, `Temporal`, and string-first output against repo doctrine:
   - strictness
   - fail-fast behavior
   - determinism
   - losslessness
   - platform realism
3. Decide whether current Castr output should:
   - stay string-first
   - move to Temporal-first
   - allow a governed split between transport and native runtime carriers
4. Define any required IR or writer-surface changes.
5. Write durable doctrine and proof obligations before implementation.

## Success Criteria

- the repo has a durable, explicit answer for JS/TS date and timestamp carrier doctrine
- the answer distinguishes transport representation from runtime carrier honestly
- the outcome states whether `Temporal` is:
  - immediate doctrine
  - target direction pending platform maturity
  - rejected for now
- any required implementation slice is clearly separated from the doctrine slice

## TDD / Proof Order

1. Standards and platform evidence first.
2. Lock doctrine before code changes.
3. If implementation is later approved, add failing proof cases for the accepted carrier policy before code changes.

## Documentation Outputs

- one ADR or durable architecture note
- updates to `docs/architecture/native-capability-matrix.md` if the doctrine changes
- roadmap update showing whether this remains future work or becomes active

## Execution Trigger

Promote this plan only if:

- reviewer closure on the `int64` / `bigint` slice is complete, and
- date/time carrier doctrine becomes the next concrete seam needing settlement

## References

- `.agent/plans/current/complete/int64-bigint-semantics-investigation.md`
- `.agent/plans/roadmap.md`
- `docs/architecture/native-capability-matrix.md`
- `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`
- `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`
- `docs/architectural_decision_records/ADR-041-native-capability-seams-governed-widening-and-early-rejection.md`
