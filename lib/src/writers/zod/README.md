# Zod Writer

Generates **Zod 4 schemas** from the IR. See [ADR-031](../../../.agent/adr/ADR-031-zod-output-strategy.md) for design decisions.

## Key Files

| File             | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `index.ts`       | Main entry point, schema generation               |
| `composition.ts` | Union/intersection handling (oneOf, anyOf, allOf) |
| `primitives.ts`  | Primitive types, format-specific functions        |
| `metadata.ts`    | `.meta()` for OpenAPI metadata                    |

## Composition Mapping

| OpenAPI                   | Zod 4                                               |
| ------------------------- | --------------------------------------------------- |
| `allOf: [A, B]`           | `z.intersection(A, B)`                              |
| `anyOf: [A, B]`           | `z.union([A, B])`                                   |
| `oneOf: [A, B]`           | `z.xor([A, B])` — **exclusive** OR                  |
| `oneOf` + `discriminator` | `z.discriminatedUnion("prop", [...])` — O(1) lookup |

## Format-Specific Functions

Zod 4 top-level format functions are preferred (tree-shakable, future-proof):

| OpenAPI                    | Zod 4                  |
| -------------------------- | ---------------------- |
| `integer`                  | `z.int()`              |
| `integer format: int32`    | `z.int32()`            |
| `integer format: int64`    | `z.int64()` → `bigint` |
| `string format: email`     | `z.email()`            |
| `string format: uri`       | `z.url()`              |
| `string format: uuid`      | `z.uuidv4()`           |
| `string format: date`      | `z.iso.date()`         |
| `string format: date-time` | `z.iso.datetime()`     |

> [!NOTE]
> `z.iso.datetime()` only accepts UTC (`Z` suffix). Timezone offsets like `+05:00` are rejected.

## Strictness

- **Objects use `.strict()`** unless `additionalProperties: true` is explicit
- **Inline endpoint objects** (queryParams, pathParams, headers) are always `.strict()`

## Fail-Fast

Unsupported patterns **throw immediately**. Never fall back to `z.unknown()`.

## Metadata via `.meta()`

All OpenAPI metadata flows to Zod's `.meta()`:

```typescript
z.string().meta({ title, description, deprecated, examples, externalDocs, xml });
```

## Codecs (Deferred)

Zod 4 provides codec **examples** (`isoDatetimeToDate`, `base64ToBytes`) in documentation, but these are **not first-class APIs** — they're recipes to copy/paste.

**Current:** Using validation-only format functions (`z.iso.datetime()`, `z.url()`).

**Future:** Could bundle codec implementations if runtime transformation becomes a requirement.

## Related

- [ADR-031](../../../.agent/adr/ADR-031-zod-output-strategy.md) — Full design decisions
- [zod-output-acceptance-criteria.md](../../../.agent/zod-output-acceptance-criteria.md) — Requirements
