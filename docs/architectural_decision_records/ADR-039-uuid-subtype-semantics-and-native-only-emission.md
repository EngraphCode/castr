# ADR-039: UUID Subtype Semantics and Native-Only Emission

**Date:** 2026-03-10  
**Status:** Accepted

---

## Context

UUID schemas have stricter subtype semantics than the current portable pipeline preserves:

- `z.uuid()` means any valid UUID
- `z.uuidv4()` means UUID version 4
- `z.uuidv7()` means UUID version 7

The repo previously collapsed those distinctions too early:

1. `z.uuidv4()` normalized to plain `format: 'uuid'`, so direct Zod -> IR -> Zod lost subtype specificity.
2. `z.uuidv7()` normalized to the pseudo-format `format: 'uuidv7'`, which is not a native OpenAPI / JSON Schema representation.
3. Portable OpenAPI / JSON Schema targets natively carry `format: 'uuid'`, but not UUID subtype/version semantics.

That left the system in an awkward state:

- direct native Zod generation could not preserve subtype semantics honestly
- portable artifacts leaked a nonstandard UUID representation
- earlier thinking drifted toward extensions or synthesized regex patterns as a durable preservation mechanism

The repo doctrine remains:

- after parse, decisions use IR + target writer semantics, not source provenance
- TypeScript-source parsing must stay AST/semantic, not string/regex heuristic driven (ADR-026)
- existing content such as `pattern` must still be preserved if it already exists in IR

The open question was how to preserve UUID subtype semantics without reintroducing source-history coupling or inventing non-native portable output.

## Decision

### 1. UUID subtype is first-class IR truth

`CastrSchema` gains:

```ts
type IRUuidVersion = 1 | 3 | 4 | 5 | 6 | 7 | 8;

interface CastrSchema {
  type?: SchemaObject['type'];
  format?: string;
  uuidVersion?: IRUuidVersion;
}
```

`uuidVersion` is valid only when:

- `type === 'string'`
- `format === 'uuid'`

UUID subtype semantics are not modeled as metadata-only hints.

### 2. Standard portable UUID output stays plain `format: 'uuid'`

Portable writers must not invent non-native subtype carriers in this slice:

- no UUID subtype `x-*` extension
- no synthesized subtype-preserving `pattern`
- no nonstandard `format: 'uuidv7'`

If IR already contains a `pattern`, writers preserve it as schema content. They do not synthesize one merely to preserve subtype.

### 3. One narrow parse-time regex exception is allowed

Regex-based UUID subtype inference is allowed only for UUID semantics, and only at parse time.

Rules:

- inference is centralized in one governed utility
- inference is allowed only when the incoming structure does not already express subtype explicitly
- inference is fail-closed for non-governed or ambiguous regex shapes
- this exception is semantic-data parsing only; it does not relax ADR-026 for TypeScript-source parsing

Initial governed canonical patterns in this slice:

- UUID v4
- UUID v7

### 4. Explicit subtype beats inferred subtype

- explicit + matching inferred subtype is valid
- explicit + contradictory inferred subtype fails fast

The parser preserves the original `pattern` as content even when it also infers subtype semantics from it.

### 5. Writers emit subtype only when the target has a native construct

Zod writer:

- plain `format: 'uuid'` -> `z.uuid()`
- `format: 'uuid'` + `uuidVersion: 4` -> `z.uuidv4()`
- `format: 'uuid'` + `uuidVersion: 7` -> `z.uuidv7()`
- other UUID subtype values -> `z.uuid()` until the target has a native helper

OpenAPI / JSON Schema writers:

- always emit `format: 'uuid'`
- preserve an existing `pattern` only if it is already present in IR
- never add `pattern` purely to preserve subtype

### 6. Accepted target-capacity widening is part of the model

UUID subtype preservation is now explicitly target-dependent:

- direct native Zod output can preserve subtype where Zod has a native helper
- detours through standard OpenAPI / JSON Schema may widen subtype semantics back to plain UUID

That widening is accepted when the target cannot carry subtype natively. Castr must not invent non-native output just to avoid that widening.

## Consequences

### Positive

- UUID subtype becomes honest IR semantics instead of hidden source intent
- direct IR -> Zod can preserve more subtype meaning than before
- the nonstandard portable pseudo-format `uuidv7` is removed
- writers no longer need source provenance to decide UUID output

### Negative

- some cross-format detours still widen to plain UUID
- UUID subtype preservation is intentionally target-dependent
- IR surface and parser/writer contracts grow

## Alternatives Considered

### 1. Pattern/regex as the durable cross-format preservation mechanism

Rejected.

Regex is allowed only as a narrow parse-time subtype inference exception, not as the durable portable representation.

### 2. Custom UUID subtype extension (`x-*`)

Rejected.

This slice does not introduce a new portable extension for UUID subtype semantics.

### 3. Keep `format: 'uuidv7'` as a pseudo-standard portable representation

Rejected.

It is not native to OpenAPI / JSON Schema and leaks target-specific semantics into portable output.

### 4. Metadata-only hint for UUID subtype

Rejected.

UUID subtype affects writer behavior and must therefore be first-class IR truth, not secondary metadata.

## References

- [ADR-026: No String Manipulation for Parsing](./ADR-026-no-string-manipulation-for-parsing.md)
- [ADR-031: Zod 4 Output Strategy](./ADR-031-zod-output-strategy.md)
- [ADR-032: Zod 4 Input Strategy](./ADR-032-zod-input-strategy.md)
- [zod-round-trip-limitations.md](../architecture/zod-round-trip-limitations.md)
