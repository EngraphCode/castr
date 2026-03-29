# ADR-042: JSON Schema 2020-12 Egress Normal Form

**Status:** Accepted  
**Date:** 2026-03-28  
**Related:** [ADR-035](ADR-035-transform-validation-parity.md), [ADR-041](ADR-041-native-capability-seams-governed-widening-and-early-rejection.md)

---

## Context

The JSON Schema writer (`writeJsonSchema`, `writeJsonSchemaDocument`, `writeJsonSchemaBundle`) emits pure JSON Schema 2020-12 output from the format-neutral CastrSchema IR. The shared field writer infrastructure is shared between the JSON Schema and OpenAPI writers. Three normalisation dimensions needed explicit canonical policy:

1. **Nullability form** — how nullable types are represented
2. **`$ref` sibling policy** — whether sibling fields accompany `$ref`
3. **`example`/`examples` keyword** — which metadata keyword is emitted

## Decision

### 1. Nullability: `type` array form

**Canonical form:** `type: ["T", "null"]`

Nullable types are emitted as type arrays, not as `oneOf` decomposition. This is the JSON Schema 2020-12 preferred representation and is already correctly implemented in `writeTypeField()`.

### 2. `$ref` sibling policy: bare `$ref` only

**Canonical form:** `{ "$ref": "#/$defs/Name" }` — no siblings.

In the CastrSchema IR, `$ref` is a resolved reference pointer. Sibling fields on IR schemas carrying `$ref` are resolution artifacts, not intentional 2020-12 siblings. The writer correctly emits bare `$ref` objects. While JSON Schema 2020-12 permits `$ref` siblings, the IR's closed-world reference model does not carry them intentionally.

### 3. `example`/`examples`: `examples` only

**Canonical form:** `examples: [value1, value2]` — the `example` singular keyword is suppressed.

JSON Schema 2020-12 defines `examples` (array) as the standard keyword. The singular `example` keyword is an OpenAPI Schema Object extension and is not part of the JSON Schema vocabulary. The JSON Schema writer now:

- Suppresses `example` from output
- If only `example` is present in the IR (no `examples`), folds it into `examples: [value]`
- If both are present, emits `examples` only (it takes precedence)

The OpenAPI writer continues to emit both `example` and `examples` as OAS requires.

## Implementation

The normalisation is applied in `json-schema-writer.schema.ts` via `normaliseExampleForJsonSchema()`, which runs after the shared `writeAllJsonSchemaFields()` call. This keeps the shared writer untouched for OpenAPI consumers.

## Consequences

- JSON Schema output is now canonically normalised across all three dimensions
- Round-trip proofs remain lossless (the parser accepts both forms)
- The OpenAPI writer is unaffected — it continues to use the shared module directly
- External consumers can depend on predictable JSON Schema output shapes
