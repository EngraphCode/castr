# Plan (Complete): Zod Round-Trip Pipeline — Known Structural Limitations

**Status:** ✅ Complete (historical working record; superseded by permanent docs)  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-09  
**Related:** [Recursive Wrapper Remediation](./recursive-wrapper-remediation.md), [Zod Defect Quarantine Remediation](./zod-defect-quarantine-remediation.md), [Permanent Reference](../../../docs/architecture/zod-round-trip-limitations.md)

---

## Purpose

This document catalogs the remaining structural limitations in the Zod → IR → OpenAPI/JSON Schema → IR → Zod round-trip pipeline, and records the resolved recursive-wrapper work so the diagnosis history stays technically accurate.

This file is retained as historical execution context only. The permanent source of truth is [docs/architecture/zod-round-trip-limitations.md](../../../docs/architecture/zod-round-trip-limitations.md).

Each entry is documented with: what was or is lost, where the loss occurs, why it occurs, and whether it has now been resolved.

---

## Resolved 1: Optional Recursive Properties Were Previously Dropped

### Historical Failure

Optional recursive properties were previously dropped from the first IR produced by the Zod parser.

| Original Zod (input)                                | Previous generated Zod |
| --------------------------------------------------- | ---------------------- |
| `get left() { return TreeNodeSchema.optional(); }`  | _(property absent)_    |
| `get right() { return TreeNodeSchema.optional(); }` | _(property absent)_    |

Required recursive properties without wrappers (`get subcategories() { return z.array(CategorySchema); }`) survive correctly.

### Proven Loss Point

**Stage:** Zod Parser → IR construction

The previous diagnosis overstated how late the loss occurred. The first proven loss point was the Zod parser itself:

- Direct identifier refs like `CategorySchema` were already parsed as `$ref`.
- Identifier-rooted wrapper calls like `TreeNodeSchema.optional()` were not recognized by the parser dispatch.
- The property therefore never entered the first IR, so later OpenAPI / JSON Schema stages had nothing to preserve.

### Implemented Resolution

Optional recursive refs are now represented with the existing IR only:

- Property schema: direct `$ref`
- Property optionality: parent `required` omission only
- Generated Zod: canonical getter form `get left() { return TreeNode.optional(); }`

This did **not** require new IR fields.

### Current Status

Resolved. Optional recursive properties now survive:

- the first Zod parse
- OpenAPI and JSON Schema detours
- Zod regeneration with canonical getter syntax

---

## Resolved 2: Nullable / Nullish Recursive Properties Were Previously Dropped

### Historical Failure

Nullable and nullish recursive properties were also previously absent from generated code.

| Original Zod (input)                                     | Previous generated Zod |
| -------------------------------------------------------- | ---------------------- |
| `get next() { return LinkedListNodeSchema.nullable(); }` | _(property absent)_    |
| `get next() { return LinkedListNodeSchema.nullish(); }`  | _(property absent)_    |

### Proven Design Constraint

Unlike optional recursion, nullable recursion cannot be expressed as a direct `$ref` plus parent optionality. Nullability must survive the interchange formats structurally.

### Implemented Resolution

Nullable and nullish recursive refs now use the existing composition IR:

```yaml
anyOf:
  - $ref: '#/components/schemas/LinkedListNode'
  - type: 'null'
```

The distinction is:

1. **Nullable:** property remains in the parent `required` list and regenerates as `.nullable()`
2. **Nullish:** property is omitted from the parent `required` list and regenerates as canonical nullable+optional output (`.nullish()`)

This required:

1. Zod parser support for identifier-rooted wrapper chains (`.nullable()`, `.nullish()`, `.optional().nullable()`)
2. Writer-side detection of nullable reference compositions as recursive getter candidates
3. Canonical Zod emission for nullable reference compositions in recursive getter context
4. OpenAPI / JSON Schema parse-write proofs that preserve the `anyOf: [$ref, null]` structure

### Current Status

Resolved. Nullable and nullish recursive properties now survive:

- the first Zod parse
- OpenAPI and JSON Schema detours
- Zod regeneration with canonical recursive getter syntax

---

## Limitation 3: `.passthrough()` Suppressed on Recursive Schemas

### What Is Lost

Recursive schemas that would normally emit `.passthrough()` (because `additionalProperties: true` or undefined) instead emit no modifier, defaulting to Zod's strip mode.

| Original Zod                    | Generated Zod     | Behavioral Difference                                                  |
| ------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `z.object({...}).passthrough()` | `z.object({...})` | Original **preserves** extra keys in output; generated **strips** them |
| `z.object({...})` (default)     | `z.object({...})` | None (both strip)                                                      |

### Where the Loss Occurs

**Stage:** Zod Writer → code generation

The `shouldPassthrough()` function in `additional-properties.ts` checks `schema.metadata?.circularReferences.length > 0`. If the schema has circular references, `.passthrough()` is suppressed to prevent a `ReferenceError`.

### Underlying Cause

In Zod 4, `.passthrough()` eagerly evaluates the object's shape (including all getter properties) to create the passthrough wrapper. For recursive schemas, getter properties reference the schema being defined:

```typescript
// This CRASHES with ReferenceError:
export const Category = z
  .object({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  })
  .passthrough();
//  ^ .passthrough() reads shape → triggers getter → Category is not yet initialized
```

This is a Zod 4 runtime behavior — `.passthrough()` accesses the object descriptor's property getters during its own execution, which triggers evaluation of the `Category` identifier before the `const Category = ...` assignment completes (temporal dead zone).

### Impact on Validation Parity

**None for `safeParse` validation.** Both `.passthrough()` and default (strip) accept the same payloads — they agree on `success: true` / `success: false`. The difference is only in the **output data**: `.passthrough()` preserves unknown keys in the parsed result, strip mode discards them. Since parity tests only check `safeParse.success`, this difference is invisible.

The limitation would only matter if downstream code relies on the parsed output preserving unknown keys from recursive schemas.

### What Would Be Required to Fix

This is a Zod 4 runtime limitation. Possible approaches:

1. **Zod upstream fix:** If `.passthrough()` used lazy shape evaluation (deferred until first parse), getters wouldn't trigger during initialization. This would need to be fixed in Zod itself.
2. **Two-phase initialization:** Generate code that first creates the base schema, then wraps it with `.passthrough()` in a separate statement. But this changes the schema identity and may break recursive references.
3. **`z.lazy()` wrapper:** Wrap the entire recursive schema in `z.lazy()` which defers all evaluation. But `z.lazy()` has its own ergonomic trade-offs and may not support `.passthrough()`.

**Estimated complexity:** Low-medium (if Zod fixes it upstream), high (if we need a workaround).

---

## Limitation 4: UUID Version Specificity Lost

### What Is Lost

`z.uuidv4()` (Zod 4's UUID-v4-specific validator) round-trips to `z.uuid()` (any UUID version).

| Original Zod | IR format        | Generated Zod |
| ------------ | ---------------- | ------------- |
| `z.uuidv4()` | `format: 'uuid'` | `z.uuid()`    |
| `z.uuid()`   | `format: 'uuid'` | `z.uuid()`    |

### Where the Loss Occurs

**Stage:** Zod Parser → IR (format extraction)

Both `z.uuidv4()` and `z.uuid()` map to the OpenAPI/JSON Schema `format: 'uuid'`. There is no standard OpenAPI format string for "UUID v4 only" — the `uuid` format means any valid UUID per RFC 9562.

### Underlying Cause

OpenAPI 3.x and JSON Schema 2020-12 define `format: 'uuid'` as RFC 9562-compliant, which covers all UUID versions (v1, v3, v4, v5, v7, etc.). There is no standard sub-format or extension for "v4 only". Encoding version specificity would require a custom `x-` extension:

```yaml
format: uuid
x-uuid-version: 4
```

But custom extensions violate the project's no-escape-hatch philosophy and would not be portable.

### Impact on Validation Parity

The generated `z.uuid()` accepts UUIDs of **any** version, while the original `z.uuidv4()` only accepts v4. This means the generated schema is **more permissive** — it accepts some payloads that the original would reject. This is a **content loss** in the strict sense: the v4 constraint is information that is discarded.

In practice, most UUID usage does not distinguish versions, and the v4 constraint is rarely load-bearing. The current fixtures use `z.uuid()`, not `z.uuidv4()`, so no tests are affected.

### What Would Be Required to Fix

1. **IR extension:** Add a `uuidVersion` field to `CastrSchema` (or use a custom metadata field)
2. **OpenAPI writer:** Emit an `x-uuid-version: 4` extension
3. **OpenAPI parser:** Read the `x-uuid-version` extension and restore version specificity
4. **Zod writer:** Map `uuidVersion: 4` → `z.uuidv4()`

**Estimated complexity:** Low. But it requires a non-standard extension, which may conflict with project philosophy.

---

## Limitation 5: `z.int64()` Maps to `bigint` at Runtime, `integer/int64` in IR

### What Is Observed

`z.int64()` in Zod 4 validates `bigint` values (JavaScript BigInt), not `number`. The OpenAPI format `int64` is typically used for 64-bit integers representable as JSON numbers. This means:

- Original `z.int64()` → safeParse of `100` fails (`expects bigint, received number`)
- Generated code from `integer + format:int64` → `z.int64()` → also fails for `100`

This is **not** a round-trip bug (both agree), but it means test payloads for int64 fields must use `BigInt(100)` or `100n`, which cannot be represented in JSON. This complicates testing and limits interoperability with JSON-based systems.

### Underlying Cause

Zod 4 made an intentional design decision to map `z.int64()` to JavaScript's `BigInt` type for safety (JavaScript `Number` can only safely represent integers up to 2^53 - 1, not the full int64 range of -2^63 to 2^63 - 1). This is semantically correct but creates a mismatch with OpenAPI/JSON Schema where `int64` is assumed to be a JSON number.

### Impact

- Test payloads must use `BigInt()` for int64 fields
- JSON-based transport cannot carry `BigInt` values (no JSON representation)
- The round-trip is **internally consistent** but **externally surprising** for API consumers

### What Would Be Required to Fix

This is a Zod 4 design decision, not a castr bug. Options:

1. **Accept it:** Document that int64 fields require BigInt payloads in Zod validation
2. **Map differently:** Use `z.number().int()` instead of `z.int64()` for int64 format (loses 64-bit range safety)
3. **Coercion:** Add `.coerce` to the generated schema (changes validation semantics)

**Current decision:** Accept it. Int64 → BigInt is Zod 4's intended behavior.

---

## Status Matrix

| #   | Topic                                            | Status     | Parity Impact                    | Notes                                |
| --- | ------------------------------------------------ | ---------- | -------------------------------- | ------------------------------------ |
| 1   | Optional recursive properties                    | Resolved   | None after remediation           | Direct `$ref` + parent optionality   |
| 2   | Nullable / nullish recursive properties          | Resolved   | None after remediation           | `anyOf: [$ref, null]` representation |
| 3   | `.passthrough()` suppressed on recursive schemas | Limitation | None for `safeParse` parity      | Blocked on Zod upstream/runtime      |
| 4   | UUID version specificity lost                    | Limitation | Generated schema more permissive | Low complexity, non-standard fix     |
| 5   | `z.int64()` → BigInt vs JSON number              | Limitation | None (round-trip consistent)     | Accepted Zod 4 design trade-off      |
