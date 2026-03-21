# ADR-031: Zod 4 Output Strategy

**Date:** 2026-01-21  
**Status:** Accepted

---

## Context

With the OpenAPI → Zod pipeline production-ready, we need to formalize decisions about Zod 4 output generation. This ADR documents the strategies for generating idiomatic, type-safe Zod 4 schemas from the IR.

> [!NOTE]
> **Round-trip (OpenAPI → Zod → OpenAPI) is a validation mechanism**, not a fundamental library requirement. It proves the pipeline works correctly. The Zod → IR parser exists (Session 3.2) and must remain in lockstep with writer output; doc-level Zod ingestion beyond schema declarations is a separate future scope.

> [!IMPORTANT]
> [ADR-040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) and [IDENTITY.md](../../.agent/IDENTITY.md) supersede the earlier multi-mode object direction in this ADR. Default-path object output is strict-only. The strip-normalization compatibility mode from ADR-040 has been removed per IDENTITY.md; strip normalization belongs in the doctor only.

## Decisions

### 1. Metadata Preservation via `.meta()`

All OpenAPI metadata that doesn't map to Zod validation is preserved using `.meta()`:

```typescript
z.string().meta({
  description: 'User email address',
  deprecated: true,
  examples: ['user@example.com'],
});
```

**Rationale:** Ensures NO CONTENT LOSS during transformations.

### 2. Format-Specific Functions

Use Zod 4's format-specific functions instead of generic `.format()`:

| OpenAPI format      | Zod 4 output       |
| ------------------- | ------------------ |
| `format: date-time` | `z.iso.datetime()` |
| `format: date`      | `z.iso.date()`     |
| `format: time`      | `z.iso.time()`     |
| `format: duration`  | `z.iso.duration()` |
| `format: email`     | `z.email()`        |
| `format: uuid`      | `z.uuid()`         |
| `format: uri`       | `z.url()`          |
| `format: hostname`  | `z.hostname()`     |
| `format: int32`     | `z.int32()`        |
| `format: int64`     | `z.int64()`        |
| `format: float`     | `z.float32()`      |
| `format: double`    | `z.float64()`      |

**Rationale:** More precise validation and better TypeScript types.

### 3. `oneOf` with Discriminator → `z.discriminatedUnion()`

When OpenAPI `oneOf` includes a `discriminator`, generate `z.discriminatedUnion()`:

```typescript
// OpenAPI: oneOf with discriminator.propertyName: 'type'
z.discriminatedUnion('type', [
  z.object({ type: z.literal('cat'), meow: z.string() }),
  z.object({ type: z.literal('dog'), bark: z.string() }),
]);
```

**Rationale:** More performant and provides better error messages.

### 4. `oneOf` without Discriminator → `z.xor()`

For mutual exclusivity without a discriminator, use `z.xor()`:

```typescript
z.xor(schemaA, schemaB);
```

**Rationale:** `z.xor()` enforces exactly-one semantics that matches `oneOf`.

### 5. Object Output Is Strict-Only

Object output must be explicitly strict where Zod can represent that honestly and safely:

```typescript
z.strictObject({ ... });
```

Bare `z.object({ ... })` is not an acceptable generated stand-in for strict object semantics because bare `z.object()` is strip-mode at runtime.

`.strip()`, `.passthrough()`, and `.catchall(...)` are no longer generated-object targets.

**Rationale:** Generated object definitions are strict-only product scope, so output should state strictness directly instead of preserving non-strict runtime modes.

### 6. Redundant Validation Filtering

Skip Zod validations that duplicate what the type already provides:

- Skip `.min(0)` on `z.int32()` (already non-negative if `minimum: 0` and unsigned)
- Skip `.nullable()` when type array includes 'null'

**Rationale:** Cleaner output, no runtime overhead.

### 7. Canonical Nullability Normalization

Writer output must never emit redundant nullability chains (e.g., `z.null().nullable()`).

- `type: 'null'` emits `z.null()` only.
- `type: [T, 'null']` emits canonical `T` form with exactly one `.nullable()`.
- `type: [T1, T2, 'null']` emits `z.union([T1, T2]).nullable()`.

**Rationale:** Idempotency and determinism. Nullability chains like `.nullable().nullable()` alter AST meaning without semantically changing validation semantics.

### 8. Recursive Getter Wrapper Canonicalization

> [!IMPORTANT]
> [ADR-040](./ADR-040-strict-object-semantics-and-non-strict-ingest-rejection.md) amends this section for object strictness.

Recursive schemas must emit **Zod 4 getter syntax** as the canonical output form; writer output must not regress to `z.lazy()`.

- Direct recursive refs emit direct getter returns (for example `get children() { return z.array(Category); }`).
- Optional recursive refs represented in IR as a direct `$ref` plus parent optionality emit canonical getter wrappers such as `get left() { return TreeNode.optional(); }`.
- Nullable recursive refs represented in IR as `anyOf: [{$ref}, {type: 'null'}]` emit canonical getter wrappers such as `get next() { return LinkedListNode.nullable(); }`.
- Optional nullable recursive refs emit `.nullish()` when the parent property is optional.

Writer output must treat these as **canonical recursive wrappers**, not as generic nullable compositions, so Scenario 2 / 4 / 6 round-trips remain lossless and idempotent.

Recursive object schemas on the default path must also remain explicitly strict.

The chosen recursive strict construction must therefore satisfy all of:

- getter-based recursion semantics
- runtime initialization safety
- parser/writer lockstep

Current local evidence shows that chained `.strict()` on getter-based `z.object({...})` is runtime-unsafe, so recursive strict output must use `z.strictObject({...})` and must not rely on chained `.strict()`.

**Rationale:** Getter-wrapper canonicalization still matters, but it must now operate inside a strict-only object doctrine.

### 9. Codecs (Deferred)

> [!NOTE]
> Zod 4 provides **codec examples** in documentation (e.g., `isoDatetimeToDate`, `base64ToBytes`), but these are **not first-class APIs**. Per Zod docs: _"these are not included as first-class APIs in Zod itself."_

**Current approach:** Use validation-only format functions (`z.iso.datetime()`, `z.url()`).

**Future consideration:** If runtime transformation becomes a requirement, we could bundle codec implementations in output or wait for Zod to promote them to first-class APIs.

### 10. UUID Subtype Emission Is Native-Only

> [!IMPORTANT]
> [ADR-039](./ADR-039-uuid-subtype-semantics-and-native-only-emission.md) amends this section.

UUID output is governed by first-class IR subtype semantics when present:

- plain `format: 'uuid'` emits `z.uuid()`
- `format: 'uuid'` + `uuidVersion: 4` emits `z.uuidv4()`
- `format: 'uuid'` + `uuidVersion: 7` emits `z.uuidv7()`

Writers must not emit subtype helpers from plain `format: 'uuid'` alone.

Portable OpenAPI / JSON Schema detours remain plain `format: 'uuid'`, so subtype widening is accepted when those targets cannot carry subtype natively.

**Rationale:** UUID subtype is first-class IR truth, but native-only emission keeps portable targets honest instead of inventing non-native output.

### 11. Integer Semantics Are Native-Only Where Necessary

Integer output is now governed by first-class IR semantics:

- IR `integerSemantics: 'int64'` emits canonical `z.int64()`
- IR `integerSemantics: 'bigint'` emits canonical `z.bigint()`
- plain IR `type: 'integer'` with no stronger semantic marker emits `z.int()`

Portable targets do not control this decision. The IR does.

- OpenAPI 3.1 can carry native `int64`, so that portable path remains valid.
- JSON Schema 2020-12 cannot carry native `int64` or `bigint`, so those target pairs fail fast rather than inventing custom portable numeric types.
- In Zod 4, `z.int64()` validates `bigint`, not JavaScript `number`, so generated TypeScript must use `bigint` for honest carrier parity.

**Rationale:** Preserve semantic truth in IR, emit native Zod helpers where supported, and reject non-native portable output instead of silently narrowing or inventing custom numeric types.

## Consequences

### Positive

- Idiomatic Zod 4 output that leverages library capabilities
- Metadata preserved for transform validation with sample input (including round-trip/idempotence proofs)
- Type-safe with full TypeScript inference

### Negative

- Requires Zod 4 runtime (not backward compatible with Zod 3)
- Some advanced features require careful testing

## References

- [zod4-advanced-features-research.md](../../.agent/reference/zod4-advanced-features-research.md)
- [Zod 4 documentation](https://zod.dev/v4)
