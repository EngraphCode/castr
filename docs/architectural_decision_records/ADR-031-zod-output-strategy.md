# ADR-031: Zod 4 Output Strategy

**Date:** 2026-01-21  
**Status:** Accepted

---

## Context

With the OpenAPI → Zod pipeline production-ready, we need to formalize decisions about Zod 4 output generation. This ADR documents the strategies for generating idiomatic, type-safe Zod 4 schemas from the IR.

> [!NOTE]
> **Round-trip (OpenAPI → Zod → OpenAPI) is a validation mechanism**, not a fundamental library requirement. It proves the pipeline works correctly. The Zod → IR parser exists (Session 3.2) and must remain in lockstep with writer output; doc-level Zod ingestion beyond schema declarations is a separate future scope.

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

### 5. Object Unknown-Key Emission Is Driven By IR Semantics First

Object output is governed first by explicit IR unknown-key semantics:

```typescript
z.object({ ... }).strict();
z.object({ ... }).strip();
z.object({ ... }).passthrough();
z.object({ ... }).catchall(z.string());
```

Recursive strip objects are emitted as bare `z.object({ ... })`, because strip is Zod's default object mode and explicit `.strip()` eagerly evaluates recursive getter-backed shapes.

When IR does not carry explicit runtime unknown-key semantics, writers still use the existing portable-policy fallback based on `additionalProperties` and `strictObjects`.

**Rationale:** Preserve runtime semantics when the IR knows them, preserve existing portable-policy behaviour when it does not, and keep recursive strip output safe.

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
> [ADR-038](./ADR-038-object-unknown-key-semantics.md) amends this section for unknown-key behavior.
> Recursive strip is supported via bare `z.object({...})`. Recursive `.passthrough()` and `.catchall()` now fail fast instead of degrading silently.

Recursive schemas must emit **Zod 4 getter syntax** as the canonical output form; writer output must not regress to `z.lazy()`.

- Direct recursive refs emit direct getter returns (for example `get children() { return z.array(Category); }`).
- Optional recursive refs represented in IR as a direct `$ref` plus parent optionality emit canonical getter wrappers such as `get left() { return TreeNode.optional(); }`.
- Nullable recursive refs represented in IR as `anyOf: [{$ref}, {type: 'null'}]` emit canonical getter wrappers such as `get next() { return LinkedListNode.nullable(); }`.
- Optional nullable recursive refs emit `.nullish()` when the parent property is optional.

Writer output must treat these as **canonical recursive wrappers**, not as generic nullable compositions, so Scenario 2 / 4 / 6 round-trips remain lossless and idempotent.

Recursive object schemas cannot safely append `.passthrough()` or `.catchall()` today. In Zod 4, both eagerly evaluate getter-backed shapes and can trigger temporal-dead-zone failures during recursive schema initialization. Per ADR-038, the implemented policy is:

- preserve the semantics in IR and portable artifacts
- emit bare `z.object({...})` for recursive strip semantics
- emit a clear fail-fast error for recursive unknown-key-preserving output until a safe construction strategy exists
- never silently rewrite the behavior to strip-mode output

**Rationale:** Getter-wrapper canonicalization preserves recursion semantics without inventing new IR fields, and it keeps writer output aligned with parser expectations and transform parity proofs.

### 9. Codecs (Deferred)

> [!NOTE]
> Zod 4 provides **codec examples** in documentation (e.g., `isoDatetimeToDate`, `base64ToBytes`), but these are **not first-class APIs**. Per Zod docs: _"these are not included as first-class APIs in Zod itself."_

**Current approach:** Use validation-only format functions (`z.iso.datetime()`, `z.url()`).

**Future consideration:** If runtime transformation becomes a requirement, we could bundle codec implementations in output or wait for Zod to promote them to first-class APIs.

### 10. UUID Canonicalization Uses `z.uuid()`, Not `z.uuidv4()`

OpenAPI / JSON Schema `format: 'uuid'` emits canonical `z.uuid()`.

- `z.uuid()` accepts any RFC 9562-compliant UUID version.
- `z.uuidv4()` is more specific and cannot be represented losslessly by standard OpenAPI / JSON Schema `format: 'uuid'`.
- Writers must not emit `z.uuidv4()` from plain `format: 'uuid'`.

**Rationale:** Version-4 specificity is not representable without non-standard extensions, so canonical output must choose the lossless standard target.

### 11. `int64` Canonicalization Uses `z.int64()` and Therefore `bigint`

OpenAPI / JSON Schema `type: 'integer', format: 'int64'` emits canonical `z.int64()`.

- In Zod 4, `z.int64()` validates `bigint`, not JavaScript `number`.
- This is internally round-trip consistent, but it means parity fixtures and contributor examples must use `BigInt(...)` / `100n`, not JSON numbers.
- This behavior is accepted as a Zod 4 runtime trade-off, not treated as a Castr defect.

**Rationale:** Preserving the canonical Zod 4 helper is preferred over silently weakening the range/typing semantics to plain `number`.

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
