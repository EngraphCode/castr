# Zod Writer

Generates **Zod 4 schemas** from the IR. See [ADR-031](../../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md) for design decisions.

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
| `string format: uuid`      | `z.uuid()`             |
| `string format: date`      | `z.iso.date()`         |
| `string format: date-time` | `z.iso.datetime()`     |

> [!NOTE]
> `z.iso.datetime()` only accepts UTC (`Z` suffix). Timezone offsets like `+05:00` are rejected.

## Object Unknown-Key Modes

- When IR carries `unknownKeyBehavior`, the writer emits the exact runtime mode:
  - `strict` -> `.strict()`
  - non-recursive `strip` -> `.strip()`
  - recursive `strip` -> bare `z.object({...})`
  - non-recursive `passthrough` -> `.passthrough()`
  - non-recursive `catchall` -> `.catchall(schema)`
- Recursive `.passthrough()` and recursive `.catchall()` fail fast with explicit generation errors.
- Inline endpoint objects (queryParams, pathParams, headers) are always `.strict()`.

## Recursive Schemas

- **Getter syntax is canonical** for recursive output.
- Recursive wrappers are emitted canonically when representable:
  - direct recursion → getter returning the direct schema expression
  - optional recursion → `.optional()`
  - nullable recursion → `.nullable()`
  - optional nullable recursion → `.nullish()`
- Recursive strip objects emit bare `z.object({...})`, because explicit `.strip()` eagerly evaluates getter-backed shapes.
- Recursive `.passthrough()` and `.catchall()` fail fast because Zod 4 eagerly evaluates getter-backed shapes during those calls and can trigger temporal-dead-zone failures.

## Important Semantics

- `format: uuid` canonicalizes to `z.uuid()`, not `z.uuidv4()`, because UUID version specificity is not representable losslessly in standard OpenAPI / JSON Schema.
- `format: int64` canonicalizes to `z.int64()`, which means runtime validation expects `bigint` payloads.

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

- [ADR-031](../../../../docs/architectural_decision_records/ADR-031-zod-output-strategy.md) — Full design decisions
- [zod-output-acceptance-criteria.md](../../../.agent/zod-output-acceptance-criteria.md) — Requirements
