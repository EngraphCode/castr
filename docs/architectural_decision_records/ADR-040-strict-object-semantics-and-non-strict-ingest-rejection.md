# ADR-040: Strict-By-Default Object Semantics With Optional Strip Normalization

**Date:** 2026-03-11  
**Status:** Accepted

---

## Context

Castr previously treated multiple object unknown-key modes as legitimate product scope:

- strict
- strip
- passthrough
- catchall

That direction forced the system to preserve, reconstruct, and prove behaviour for object semantics that are not equally representable across supported formats.

It also created a growing amount of architecture and proof work around preserving-mode edge cases, especially on the recursive Zod seam.

On 2026-03-11, product direction changed:

1. all Castr-generated object definitions are considered strict
2. where an output model can represent strict object semantics safely and natively, generated output must specify strictness explicitly
3. non-strict object features are rejected by default with helpful errors
4. an explicit compatibility option should exist for callers who deliberately want non-strict inputs normalized to strip semantics instead of rejected

This ADR records that decision.

## Decision

### 1. Strict object semantics are the default product mode

For Castr object semantics, the supported object model is:

- declared keys are allowed
- undeclared keys are rejected

Non-strict object behaviour is not part of the default correctness path.

Rejected object behaviour includes:

- accepting and stripping unknown keys
- accepting and preserving unknown keys
- accepting and validating unknown keys via a catchall schema

### 2. Generated outputs must state strictness explicitly where the target can do so honestly

When an output format can represent strict object semantics natively and safely, writers must emit that explicit representation.

Examples:

- OpenAPI / JSON Schema: `additionalProperties: false`
- Zod: an explicit strict object form rather than an implicit strip-mode form

If a target cannot express strictness natively, that limitation must remain explicit; the system must not silently imply support it does not have.

### 3. Ingest rejects non-strict object inputs by default across all supported formats

During ingest, non-strict object features must fail fast with helpful error messages unless the caller has explicitly opted into strip normalization mode.

Examples include:

- Zod object forms that are not strict
- OpenAPI / JSON Schema object schemas that permit extra keys
- preservation-oriented Castr extensions related to non-strict object behaviour

The repo must not silently parse non-strict object behaviour into IR and hope later stages constrain it.

### 4. An explicit strip-normalization compatibility mode is allowed, but it is deliberate and lossy

For callers who deliberately want to move non-strict object schemas through the system anyway, Castr should provide one explicit compatibility mode:

- normalize non-strict object input to strip semantics instead of rejecting it

Rules for this mode:

- it must be opt-in
- it must never be the default
- it must be documented as lossy normalization, not as faithful preservation
- it must normalize to strip semantics only
- it must not attempt to preserve passthrough or catchall behavior under a compatibility label
- its output implications must be documented explicitly rather than assumed from the default strict-output doctrine

This library is about correctness rather than flexibility. The compatibility mode exists as a deliberate escape valve for throughput-oriented callers, not as a change to the default doctrine.

### 5. Preserving-mode remediation is no longer the product direction

The previous workstream around preserving strip / passthrough / catchall distinctions remains useful as historical diagnostic evidence, but it is no longer the forward implementation target.

The forward target is:

- reject-by-default ingest
- explicit opt-in strip normalization for non-strict inputs
- explicit strict generation
- safe recursive strict Zod output with parser/writer lockstep

### 6. Recursive strict Zod output must still satisfy runtime safety and lockstep

The strict-only decision does not waive the correctness bar.

For recursive Zod objects:

- runtime-safe initialization is mandatory
- parser/writer lockstep is mandatory
- explicit strictness remains mandatory where Zod can support it safely

Current local evidence on 2026-03-11 was:

- `z.object({...}).strict()` is runtime-unsafe for getter-based recursive objects
- `z.strictObject({...})` is runtime-safe for getter-based recursive objects
- parser support for `z.strictObject({...})` was not yet implemented at decision time

Implementation note:

- `z.strictObject({...})` parser/writer lockstep is now implemented

That implementation gap is tracked as follow-on active work, not as a reason to keep non-strict object semantics in scope.

## Consequences

### Positive

- clearer default product semantics
- stronger alignment with the repo's strict-by-default doctrine
- explicit rather than accidental compatibility behavior
- less architecture spent preserving target-specific object-runtime distinctions

### Negative

- default ingest scope becomes materially narrower
- existing non-strict fixtures and parser behaviour will need to change
- some previously accepted object inputs will become explicit errors
- a compatibility option still needs careful API design and implementation
- recursive strict Zod output still needs lockstep implementation work before the doctrine is fully realized in code

## Alternatives Considered

### 1. Continue preserving all unknown-key modes

Rejected.

This keeps the repo investing in behaviour the product no longer wants to support.

### 2. Keep accepting non-strict input but canonicalize it to strict

Rejected.

That would silently change user intent and violate fail-fast doctrine.

### 3. Reject non-strict input always, with no compatibility path

Rejected.

Some callers do want to put non-strict schemas through the system deliberately. An explicit, lossy, opt-in strip normalization mode is acceptable as long as the default remains reject and the feature is documented honestly.

### 4. Accept non-strict input only in portable formats

Rejected.

The decision applies across all ingest formats, not only Zod.

## Supersession Notes

This ADR supersedes the forward-looking product direction of the unknown-key preservation workstream.

In particular:

- ADR-031 object-output sections must now be read through the strict-by-default doctrine
- ADR-032 object-input sections must now be read through the reject-by-default plus optional strip-normalization doctrine
- ADR-038 remains valuable as historical diagnosis, but its preservation-oriented remediation direction is superseded

## References

- [ADR-031: Zod 4 Output Strategy](./ADR-031-zod-output-strategy.md)
- [ADR-032: Zod 4 Input Strategy](./ADR-032-zod-input-strategy.md)
- [ADR-038: Object Unknown-Key Semantics and Parsed-Output Parity](./ADR-038-object-unknown-key-semantics.md)
- [strict-object-semantics-enforcement.md](../../.agent/plans/current/complete/strict-object-semantics-enforcement.md)
