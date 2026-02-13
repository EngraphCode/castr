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
| `format: int32`     | `z.int32()`        |
| `format: int64`     | `z.int64()`        |

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

### 5. Strict Objects by Default

Objects use `.strict()` unless `additionalProperties: true`:

```typescript
z.object({ ... }).strict(); // default
z.object({ ... }).passthrough(); // additionalProperties: true
```

**Rationale:** Matches OpenAPI's default behavior and fail-fast principles.

### 6. Redundant Validation Filtering

Skip Zod validations that duplicate what the type already provides:

- Skip `.min(0)` on `z.int32()` (already non-negative if `minimum: 0` and unsigned)
- Skip `.nullable()` when type array includes 'null'

**Rationale:** Cleaner output, no runtime overhead.

### 7. Codecs (Deferred)

> [!NOTE]
> Zod 4 provides **codec examples** in documentation (e.g., `isoDatetimeToDate`, `base64ToBytes`), but these are **not first-class APIs**. Per Zod docs: _"these are not included as first-class APIs in Zod itself."_

**Current approach:** Use validation-only format functions (`z.iso.datetime()`, `z.url()`).

**Future consideration:** If runtime transformation becomes a requirement, we could bundle codec implementations in output or wait for Zod to promote them to first-class APIs.

## Consequences

### Positive

- Idiomatic Zod 4 output that leverages library capabilities
- Metadata preserved for round-trip validation
- Type-safe with full TypeScript inference

### Negative

- Requires Zod 4 runtime (not backward compatible with Zod 3)
- Some advanced features require careful testing

## References

- [zod4-advanced-features-research.md](../../.agent/reference/zod4-advanced-features-research.md)
- [Zod 4 documentation](https://zod.dev/v4)
