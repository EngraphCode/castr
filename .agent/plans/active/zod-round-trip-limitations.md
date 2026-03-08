# Zod Round-Trip Pipeline — Known Structural Limitations

**Status:** 📋 Active reference document  
**Created:** 2026-03-08  
**Last Updated:** 2026-03-08  
**Related:** [Zod Defect Quarantine Remediation](./zod-defect-quarantine-remediation.md)

---

## Purpose

This document catalogs structural limitations in the Zod → IR → OpenAPI/JSON Schema → IR → Zod round-trip pipeline. These are not bugs — they are inherent to the semantic gap between Zod's runtime type system and the static schema formats (OpenAPI / JSON Schema) that serve as the IR's interchange format.

Each limitation is documented with: what is lost, why it is lost, where in the pipeline the loss occurs, and what would be required to resolve it.

---

## Limitation 1: Optional/Nullable Recursive Properties Dropped

### What Is Lost

Recursive properties with `.optional()` or `.nullable()` modifiers are silently dropped from generated code.

| Original Zod (input)                                     | Generated Zod (output) |
| -------------------------------------------------------- | ---------------------- |
| `get left() { return TreeNodeSchema.optional(); }`       | _(property absent)_    |
| `get right() { return TreeNodeSchema.optional(); }`      | _(property absent)_    |
| `get next() { return LinkedListNodeSchema.nullable(); }` | _(property absent)_    |

Required recursive properties without wrappers (`get subcategories() { return z.array(CategorySchema); }`) survive correctly.

### Where the Loss Occurs

**Stage:** Zod Parser → IR construction

The Zod parser identifies getter properties with `$ref` values (e.g., `CategorySchema` → `#/components/schemas/Category`). When the getter returns a direct schema reference or `z.array(ref)`, the `$ref` targets a top-level component and is preserved.

However, when the getter returns something like `TreeNodeSchema.optional()`, the AST shows a **method call chain** (`TreeNodeSchema → .optional()`), not a direct identifier reference. The parser treats the `.optional()` call as a modifier on a schema expression, and the resulting IR property gets a `$ref` wrapped in an optional context. During OpenAPI serialization, the `$ref` with optional/nullable wrapper uses a different schema structure that doesn't match the parent component's circular reference registry. The OpenAPI writer sees the property's `$ref` target but can't resolve it within the `allOf`/`oneOf` envelope it would need for `nullable`/`optional` semantics, so the property is omitted.

### Underlying Cause

The IR's circular reference tracking (`metadata.circularReferences: string[]`) only records **which component names** are involved in cycles. It does **not** record how those references are wrapped (optional, nullable, in-array, etc.). When the OpenAPI writer encounters a `$ref` to a component that's in the circular reference list, it must decide how to serialize it. Direct references and array-wrapped references produce valid `$ref` or `items.$ref` in OpenAPI. But `optional` and `nullable` require wrapping the `$ref` in structural constructs:

```yaml
# Optional circular $ref requires:
oneOf:
  - $ref: '#/components/schemas/TreeNode'
  - not: {} # or: type: 'null' for nullable


# But this creates a composition construct that bloats the schema
# and may not parse back into the same Zod structure.
```

The pipeline currently has no mechanism to:

1. Detect that a property's `$ref` uses optional/nullable wrapping
2. Serialize that wrapping into OpenAPI while preserving the `$ref` identity
3. Re-parse the wrapped `$ref` back into a Zod getter with `.optional()` / `.nullable()`

### Impact on Validation Parity

Valid payloads for the original schema that include deeply-nested data for these properties succeed in both original and generated schemas (the generated schema treats extra properties as unknown keys, which are stripped/passed through). **Invalid** payloads that rely on type-checking the recursive field itself cannot be tested since the field doesn't exist in the generated schema.

### What Would Be Required to Fix

1. **IR enhancement:** Extend `circularReferences` metadata to record the wrapping mode of each circular reference (direct, optional, nullable, array, etc.)
2. **OpenAPI writer:** Emit `oneOf` / `anyOf` envelopes for optional/nullable circular `$ref`s
3. **Zod writer:** Detect these envelopes during generation and reconstruct getter properties with the appropriate modifier
4. **OpenAPI parser:** Successfully parse `oneOf: [{$ref}, {type: null}]` as a nullable `$ref` (this partially exists but may not handle the circular case)

**Estimated complexity:** Medium-high. The fix spans 4 pipeline stages and requires new IR metadata fields.

---

## Limitation 2: `.passthrough()` Suppressed on Recursive Schemas

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

## Limitation 3: UUID Version Specificity Lost

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

## Limitation 4: `z.int64()` Maps to `bigint` at Runtime, `integer/int64` in IR

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

## Summary Matrix

| #   | Limitation                                       | Severity | Parity Impact                    | Fix Complexity          |
| --- | ------------------------------------------------ | -------- | -------------------------------- | ----------------------- |
| 1   | Optional/nullable recursive properties dropped   | **High** | Invalid payloads not testable    | Medium-high             |
| 2   | `.passthrough()` suppressed on recursive schemas | **Low**  | None (safeParse agrees)          | Blocked on Zod upstream |
| 3   | UUID version specificity lost                    | **Low**  | Generated schema more permissive | Low (needs custom ext)  |
| 4   | `z.int64()` → BigInt vs JSON number              | **Low**  | None (round-trip consistent)     | Accept / by design      |
