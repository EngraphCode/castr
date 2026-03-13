# ADR-041: Native-Capability Seams, Governed Widening, and Early Rejection

**Date:** 2026-03-12  
**Status:** Accepted

---

## Context

Castr now has multiple examples of the same architectural problem showing up on different type seams:

- some semantics are native in one format but not another
- some distinctions are important enough that portable surface fields alone cannot carry them honestly
- target formats do not all fail in the same way:
  - some can preserve the semantic exactly
  - some can only support a governed widening
  - some cannot represent the semantic natively at all

Recent examples:

- `z.bigint()` and `int64` are not the same semantic, and OpenAPI / JSON Schema do not share Zod's arbitrary-precision integer carrier
- UUID subtype/version semantics can be preserved in native Zod output, but standard portable formats only natively carry plain `uuid`
- strict object semantics can be expressed honestly on some targets and must reject or normalize explicitly on others

Before this ADR, the repo risked solving each seam ad hoc:

- collapsing semantically distinct values too early
- inventing pseudo-portable formats
- relying on source provenance at write time
- silently widening or narrowing without a governed doctrine

The product doctrine remains:

- IR is the source of truth after parse
- behavior is strict, fail-fast, deterministic, and lossless by default
- unsupported behavior must be explicit rather than hidden behind convenience mappings

## Decision

### 1. Treat these cases as native-capability seams

When a semantic is not natively supported across all formats, Castr treats the problem as a native-capability seam.

The seam must be analysed as:

- source semantic
- IR semantic truth
- target native capability

not as a parser-local or writer-local convenience mapping.

### 2. Start with a standards-sourced capability matrix

For each seam, establish a durable capability matrix from primary standards or official docs before settling writer behavior.

The matrix must cover:

- each supported format involved
- the semantic distinction under investigation
- whether the target overlap is:
  - exact native overlap
  - partial / approximate overlap
  - no native overlap
  - custom-only overlap

This matrix becomes durable architecture, not just plan scratch work.

### 3. Add first-class IR truth when the portable surface is insufficient

If a semantic distinction matters to correctness and cannot be carried honestly by the portable surface alone, the IR must represent it directly.

Rules:

- the semantic marker must be usable without remembering source provenance
- output-facing fields such as portable `format` annotations must not be the only keeper of semantic truth
- metadata-only hints are not sufficient when the distinction changes writer behavior

### 4. Resolve target emission from `IR semantics x target capability`

Writers must decide behavior from the IR semantic and the requested target format's native capability.

Source-history coupling is not an acceptable substitute.

For each target, one of these outcomes must be chosen explicitly:

1. exact native emission
2. governed widening
3. early rejection

No silent fourth mode exists.

### 5. Governed widening is allowed only when it is explicit and documented

Some seams can widen honestly when the target lacks the narrower semantic but still has a legitimate native superset or nearby carrier.

That widening is acceptable only when all of the following are true:

- the widening is explicit in durable docs
- the widening is target-specific, not accidental
- the widening does not rely on invented custom portable types
- tests prove the widening path and its limits

ADR-039 is the canonical example of a widening-allowed seam.

### 6. Otherwise, reject early

If the target cannot represent the source semantic natively and no governed widening has been accepted, the transform must reject as early as possible.

Rules:

- rejection happens before writer emission work proceeds
- the error must say what semantic is unsupported
- the error must name the target format
- the error must say that Castr does not support custom portable rescue types for that case
- the error may suggest nearby supported native alternatives, but must not rewrite automatically

The `int64` / `bigint` seam is the canonical rejection-heavy example.

### 7. Custom portable rescue paths require a separate decision

Castr does not add custom extensions, pseudo-standard formats, or strategy flags by default to rescue unsupported native-capability gaps.

Any such path requires:

- a separate explicit ADR
- a clear product need
- updated proof obligations
- updated durable docs and roadmap entries

### 8. Close each seam with docs and proofs, not code alone

A seam is not complete when the code lands.

Completion requires:

- durable matrix documentation
- seam-specific ADR references
- proof coverage for the accepted emission / widening / rejection paths
- prompt and roadmap alignment so later sessions start from the settled doctrine

## Consequences

### Positive

- future seam work starts from one reusable doctrine instead of ad hoc local policy
- IR stays honest when portable formats differ in capability
- target-specific widening and rejection become explicit architectural choices
- contributors get one repeatable workflow for similar type problems

### Negative

- some seams will reject more often instead of producing a "best effort" artifact
- IR and capability-validation surfaces may grow as more distinctions become first-class
- custom-type requests now require deliberate product decisions rather than opportunistic implementation

## Alternatives Considered

### 1. Solve each seam independently

Rejected.

This invites inconsistent policy, hidden widening, and repeated architecture drift.

### 2. Preserve semantics with custom portable types by default

Rejected.

This breaks native-capability honesty and creates artifacts that are not actually standards-portable.

### 3. Keep semantic distinctions only in source-specific parser state

Rejected.

Writer behavior must work from IR truth and target capability, not remembered provenance.

### 4. Always reject when the target is not exact

Rejected.

Some seams can support a governed widening honestly. UUID subtype semantics are the current example.

## References

- [ADR-031: Zod 4 Output Strategy](./ADR-031-zod-output-strategy.md)
- [ADR-032: Zod 4 Input Strategy](./ADR-032-zod-input-strategy.md)
- [ADR-035: Transform Validation Parity and Scenario Matrix](./ADR-035-transform-validation-parity.md)
- [ADR-039: UUID Subtype Semantics and Native-Only Emission](./ADR-039-uuid-subtype-semantics-and-native-only-emission.md)
- [ADR-040: Strict-By-Default Object Semantics With Optional Strip Normalization](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md)
- [native-capability-matrix.md](../architecture/native-capability-matrix.md)
- [zod-round-trip-limitations.md](../architecture/zod-round-trip-limitations.md)
