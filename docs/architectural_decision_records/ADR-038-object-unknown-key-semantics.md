# ADR-038: Object Unknown-Key Semantics and Parsed-Output Parity

**Date:** 2026-03-09  
**Status:** Superseded by ADR-040 on 2026-03-11, then by [IDENTITY.md](../../.agent/IDENTITY.md) on 2026-03-21

---

> [!IMPORTANT]
> [ADR-040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) superseded the forward-looking preservation direction in this ADR.
> [IDENTITY.md](../../.agent/IDENTITY.md) further supersedes both ADR-038 and ADR-040's strip-normalization compatibility mode.
>
> This document remains useful as historical diagnosis:
>
> - why multi-mode object preservation was investigated
> - why recursive preserving-mode Zod reconstruction was difficult
> - why parsed-output parity mattered
>
> It is no longer the active product direction. The current doctrine still
> rejects strip / passthrough runtime modes and keeps no `unknownKeyBehavior` in
> the IR, but on 2026-04-16 product direction was clarified to admit explicit
> source `additionalProperties` honestly. Read this ADR as diagnosis for the old
> multi-mode direction, not as a blanket ban on explicit catchall semantics.

## Context

Zod object schemas distinguish several unknown-key behaviors that are not equivalent at runtime:

- `.strict()` rejects unknown keys
- default `z.object()` and explicit `.strip()` accept unknown keys but remove them from parsed output
- `.passthrough()` accepts unknown keys and preserves them in parsed output
- `.catchall(schema)` accepts, validates, and preserves unknown keys using a typed schema

The current architecture does not preserve those distinctions end-to-end:

1. The Zod object parser currently collapses default `strip`, explicit `.strip()`, and `.passthrough()` to the same IR shape: `additionalProperties: true`.
2. The parser currently degrades `.catchall(schema)` to `additionalProperties: true`, silently losing the typed additional-properties schema.
3. The Zod writer can emit `.strict()`, `.passthrough()`, and `.catchall()`, but it suppresses recursive `.passthrough()` today because Zod 4 eagerly evaluates getter-backed object shapes and can trigger temporal-dead-zone failures.
4. Recursive `.catchall()` has the same eager-evaluation runtime problem as recursive `.passthrough()`.
5. The transform parity harness currently proves `safeParse(...).success` parity only; it does not compare parsed outputs, so output-shape regressions can remain invisible.
6. OpenAPI / JSON Schema `additionalProperties` expresses validation acceptance for extra keys, but it does not express whether accepted keys are stripped or preserved in parsed output.

That means the current system silently loses legitimate Zod object semantics at the parser boundary, compensates later with writer suppression, and then under-proves the remaining regression in transform tests.

This violates the repo's IR-first and no-silent-loss principles.

## Decision

### 1. Unknown-key runtime behavior is a first-class IR concern

The follow-on remediation will introduce a dedicated object-semantics field to the IR:

```ts
type IRUnknownKeyBehavior =
  | { mode: 'strict' }
  | { mode: 'strip' }
  | { mode: 'passthrough' }
  | { mode: 'catchall'; schema: CastrSchema };
```

The field name for implementation will be `unknownKeyBehavior`.

This field is distinct from `additionalProperties`.

### 2. `additionalProperties` remains the portable validation/interchange view

`additionalProperties` continues to model OpenAPI / JSON Schema acceptance semantics:

- `false` means unknown keys are rejected
- `true` means unknown keys are accepted, but retention semantics are not implied
- a schema means unknown keys are accepted and validated by that schema

`additionalProperties` is no longer treated as sufficient to model full Zod object runtime behavior.

### 3. Zod-origin semantics must populate `unknownKeyBehavior`

For Zod input, the parser target becomes:

- `.strict()` -> `unknownKeyBehavior: { mode: 'strict' }`
- default `z.object()` -> `unknownKeyBehavior: { mode: 'strip' }`
- `.strip()` -> `unknownKeyBehavior: { mode: 'strip' }`
- `.passthrough()` -> `unknownKeyBehavior: { mode: 'passthrough' }`
- `.catchall(schema)` -> `unknownKeyBehavior: { mode: 'catchall', schema }`

The parser must not silently collapse those modes.

### 4. Cross-format preservation uses standards first, then a governed extension

When OpenAPI / JSON Schema can represent the behavior directly, writers use standard fields only:

- `strict` -> `additionalProperties: false`
- `catchall` -> `additionalProperties: <schema>`

When standard fields cannot preserve the distinction, writers use a governed extension:

- extension name: `x-castr-unknownKeyBehavior`
- allowed values: `strip` and `passthrough`

The extension is emitted only when needed to preserve a distinction that standard fields cannot carry.

OpenAPI / JSON Schema parsers must read this extension centrally and reject unsupported values.

### 5. Unsupported recursive Zod emission must fail fast, not degrade silently

Until a safe recursive construction strategy exists that preserves all three of the following simultaneously:

- recursive initialization safety
- canonical getter-based recursion
- parsed-output retention of unknown keys

the Zod writer must not silently rewrite recursive `passthrough` or recursive `catchall` objects into strip-mode output.

The required behavior is:

- preserve the semantics in IR and portable artifacts
- fail fast with a clear error when Zod generation is asked to emit recursive unknown-key-preserving behavior that cannot yet be reconstructed safely

### 6. Transform proofs for object unknown-key behavior require parsed-output parity

For fixtures that exercise object unknown-key behavior, transform proof obligations are two-dimensional:

1. validation parity: `safeParse(...).success`
2. parsed-output parity: successful parses must produce equivalent outputs

Validation-only parity is insufficient for strip / passthrough / catchall semantics.

## Consequences

### Positive

- Parser-stage silent loss becomes an explicit defect target instead of hidden doctrine
- IR regains authority over Zod object unknown-key behavior
- Cross-format round-trips can preserve strip vs passthrough explicitly instead of relying on accidental writer choices
- Recursive unsupported cases become honest fail-fast errors instead of quiet behavioral drift
- Transform tests gain a proof shape that can actually detect parsed-output regressions

### Negative

- IR and parser/writer contracts become more explicit and therefore broader
- OpenAPI / JSON Schema outputs may include a Castr-governed extension when preserving Zod-only behavior
- Some currently "green" recursive round-trips will become explicit generation failures until safe emission exists
- Follow-on remediation will touch parser, IR, OpenAPI writer/parser, JSON Schema writer/parser, Zod writer, fixtures, and transform helpers

## Alternatives Considered

### 1. Writer-only workaround

Rejected.

Runtime probes showed that naive two-phase constructions either fail during construction, fail later at parse time, or preserve unknown keys only at the root while stripping them in nested recursion.

### 2. Keep acceptance-only semantics in IR

Rejected.

This is the current architectural defect. It loses legitimate runtime behavior at first parse and relies on later stages to paper over the loss.

### 3. Govern preservation only in OpenAPI / JSON Schema extensions

Rejected as a complete answer.

An extension can preserve distinctions through portable artifacts, but it cannot recover semantics that were already lost before the IR was built.

### 4. Fail fast for all non-standard object semantics

Rejected as the primary direction.

This would avoid silent loss but would also block legitimate Zod structures that the system should be able to model internally.

### 5. Accept current loss with stronger rationale

Rejected.

This would keep a known semantic regression, keep the transform harness under-proving it, and conflict with the repo's no-content-loss doctrine.

## References

- [ADR-031: Zod 4 Output Strategy](./ADR-031-zod-output-strategy.md)
- [ADR-032: Zod 4 Input Strategy](./ADR-032-zod-input-strategy.md)
- [ADR-035: Transform Validation Parity & Scenario Matrix](./ADR-035-transform-validation-parity.md)
- [recursive-unknown-key-semantics.md](../architecture/recursive-unknown-key-semantics.md)
- [zod-round-trip-limitations.md](../architecture/zod-round-trip-limitations.md)
