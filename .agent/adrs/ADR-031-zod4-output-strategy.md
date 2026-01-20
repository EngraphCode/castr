# ADR-031: Zod 4 Output Strategy

**Date:** January 20, 2026  
**Status:** Accepted  
**Decision Makers:** @jim  
**Related:** [zod-output-acceptance-criteria.md](../zod-output-acceptance-criteria.md)

---

## Context

Castr generates Zod schemas from OpenAPI specifications via the IR. With Zod 4, new features enable more precise and semantically correct schema generation.

## Decision

### 1. Exclusive Unions: `oneOf` → `z.xor()`

OpenAPI's `oneOf` requires **exactly one** schema to match (XOR semantics). Zod 4 provides `z.xor()` for this:

```typescript
// OpenAPI oneOf
{
  oneOf: [{ type: 'string' }, { type: 'number' }];
}

// Zod 4 output
z.xor([z.string(), z.number()]);
```

**Rationale:** `z.union()` accepts any matching schema (inclusive OR), which is incorrect for `oneOf`. `z.xor()` enforces exclusivity.

### 2. Inclusive Unions: `anyOf` → `z.union()`

OpenAPI's `anyOf` requires **at least one** schema to match (OR semantics):

```typescript
// OpenAPI anyOf
{
  anyOf: [{ type: 'string' }, { type: 'number' }];
}

// Zod 4 output
z.union([z.string(), z.number()]);
```

### 3. Discriminated Unions: `oneOf` + `discriminator` → `z.discriminatedUnion()`

When OpenAPI `oneOf` includes a `discriminator`, use Zod's optimized discriminated union:

```typescript
// OpenAPI
{
  oneOf: [...],
  discriminator: { propertyName: "type" }
}

// Zod 4 output
z.discriminatedUnion("type", [...])
```

**Rationale:** `z.discriminatedUnion()` uses the discriminator property for O(1) lookup instead of trying each schema.

### 4. Integer Formats: Format-Specific Functions

| OpenAPI Format          | Zod 4 Output |
| ----------------------- | ------------ |
| `integer` (no format)   | `z.int()`    |
| `integer format: int32` | `z.int32()`  |
| `integer format: int64` | `z.int64()`  |

**Note:** `z.int64()` returns `bigint`, not `number`.

### 5. String Formats: Top-Level Functions

| OpenAPI Format             | Zod 4 Output       |
| -------------------------- | ------------------ |
| `string format: email`     | `z.email()`        |
| `string format: uri`       | `z.url()`          |
| `string format: uuid`      | `z.uuidv4()`       |
| `string format: date`      | `z.iso.date()`     |
| `string format: date-time` | `z.iso.datetime()` |
| `string format: time`      | `z.iso.time()`     |
| `string format: duration`  | `z.iso.duration()` |
| `string format: ipv4`      | `z.ipv4()`         |
| `string format: ipv6`      | `z.ipv6()`         |

**Rationale:** Zod 4 top-level format functions are tree-shakable and future-proof. The method syntax (`z.string().email()`) is deprecated.

### 6. Redundant Validation Filtering

When using format-specific functions, their built-in validations are skipped from the chain:

```typescript
// Incorrect: z.int().int() (redundant)
// Correct: z.int()

// Incorrect: z.email().email() (redundant)
// Correct: z.email()
```

**Implementation:** `filterRedundantValidations()` in `primitives.ts` removes duplicate validations.

### 7. Metadata Preservation via `.meta()`

All OpenAPI metadata flows to Zod's `.meta()`:

| OpenAPI Field          | Zod `.meta()`       |
| ---------------------- | ------------------- |
| `title`                | `meta.title`        |
| `description`          | `meta.description`  |
| `deprecated`           | `meta.deprecated`   |
| `example` / `examples` | `meta.examples`     |
| `externalDocs`         | `meta.externalDocs` |
| `xml`                  | `meta.xml`          |

---

## Consequences

### Positive

- Semantically correct `oneOf` behavior
- Optimized discriminated union parsing
- Precise integer/string format validation
- Future-proof Zod 4 API usage

### Negative

- `z.int64()` returns `bigint`, requiring downstream handling
- Breaking change if consumers relied on incorrect `z.union()` for `oneOf`

---

## Implementation

| File                                 | Change                                                           |
| ------------------------------------ | ---------------------------------------------------------------- |
| `lib/src/writers/zod/composition.ts` | `z.xor()` for oneOf, `z.discriminatedUnion()` with discriminator |
| `lib/src/writers/zod/primitives.ts`  | Format-specific functions, redundant validation filtering        |
| `lib/src/writers/zod/metadata.ts`    | `.meta()` for all metadata fields                                |
