# Zod Output Acceptance Criteria

**Date:** January 19, 2026  
**Status:** Draft  
**Session:** 2.8 (Zod Output Compliance)

---

## Core Principles

> **ZERO INFORMATION LOSS** — Every IR field that has a Zod equivalent must be output.  
> **FAIL FAST** — Unsupported IR patterns must throw during generation, not produce invalid code.  
> **STRICTNESS** — Generated Zod schemas must be as strict as the source IR.

---

## Success Criteria

### 1. Schema Type Coverage

Every IR schema type must map to a valid Zod construct:

| IR Type   | Zod Output         | Notes                |
| --------- | ------------------ | -------------------- |
| `string`  | `z.string()`       | ✅                   |
| `number`  | `z.number()`       | ✅                   |
| `integer` | `z.number().int()` | Must enforce integer |
| `boolean` | `z.boolean()`      | ✅                   |
| `array`   | `z.array()`        | ✅                   |
| `object`  | `z.object()`       | ✅                   |
| `null`    | `z.null()`         | 3.1 type             |
| `enum`    | `z.enum([...])`    | String enums         |
| `const`   | `z.literal()`      | Single value         |

### 2. Constraint Preservation

All validation constraints must transfer:

| IR Constraint       | Zod Method           | Required            |
| ------------------- | -------------------- | ------------------- |
| `minLength`         | `.min()`             | ✅                  |
| `maxLength`         | `.max()`             | ✅                  |
| `pattern`           | `.regex()`           | ✅                  |
| `minimum`           | `.gte()` or `.min()` | ✅                  |
| `maximum`           | `.lte()` or `.max()` | ✅                  |
| `exclusiveMinimum`  | `.gt()`              | ✅                  |
| `exclusiveMaximum`  | `.lt()`              | ✅                  |
| `multipleOf`        | `.multipleOf()`      | ✅                  |
| `minItems`          | `.min()`             | ✅                  |
| `maxItems`          | `.max()`             | ✅                  |
| `uniqueItems`       | Custom refine        | Document limitation |
| `format: email`     | `.email()`           | ✅                  |
| `format: url`       | `.url()`             | ✅                  |
| `format: uuid`      | `.uuid()`            | ✅                  |
| `format: date`      | `.date()`            | Zod 4               |
| `format: date-time` | `.datetime()`        | ✅                  |

### 3. Composition Support

| IR Pattern                   | Zod Output                     | Notes                    |
| ---------------------------- | ------------------------------ | ------------------------ |
| `allOf`                      | `.and()` or `z.intersection()` | Must merge properly      |
| `oneOf`                      | `z.union()` with discriminator | ✅                       |
| `anyOf`                      | `z.union()`                    | Less strict than oneOf   |
| `not`                        | `.refine()`                    | May require custom logic |
| `nullable`                   | `.nullable()`                  | ✅                       |
| `optional` (not in required) | `.optional()`                  | ✅                       |

### 4. Reference Handling

| Pattern          | Behavior                                 |
| ---------------- | ---------------------------------------- |
| `$ref` to schema | Generate named export, reference by name |
| Circular refs    | Lazy evaluation via `z.lazy()`           |
| Inline schemas   | Generate inline or hoist to named        |

---

## Validation Parity Goal

The ultimate test: generated Zod schemas enforce the same constraints as the IR.

```typescript
// Valid data per IR must parse successfully
zodSchema.parse(validData); // No throw = pass

// Invalid data per IR must throw
expect(() => zodSchema.parse(invalidData)).toThrow();
```

> **Note:** Both `.parse()` (throws) and `.safeParse()` (returns result object) enforce identical
> validation rules. Either is acceptable—we use `.parse()` in tests because `expect().toThrow()`
> is idiomatic for testing validation failures.

---

## Metadata Preservation via `.meta()` (Zod 4)

Zod 4 introduces `z.globalRegistry` and `.meta()` which enables **ZERO information loss**:

```typescript
// Every OpenAPI field survives via .meta()
const UserSchema = z
  .object({
    name: z.string().meta({
      description: "The user's full name",
      examples: ['John Doe'],
      deprecated: true,
    }),
  })
  .meta({
    id: 'User',
    title: 'User Schema',
    description: 'A user in the system',
    externalDocs: { url: 'https://docs.example.com/user' },
  });
```

### Required GlobalMeta Extension

Add a `zod.d.ts` to extend the metadata interface:

```typescript
declare module 'zod' {
  interface GlobalMeta {
    examples?: unknown[];
    externalDocs?: { url: string; description?: string };
  }
}
export {};
```

### Field Mapping

| IR Field       | Zod 4 Method                   | Preserved?      |
| -------------- | ------------------------------ | --------------- |
| `description`  | `.meta({ description })`       | ✅ YES          |
| `deprecated`   | `.meta({ deprecated: true })`  | ✅ YES          |
| `example`      | `.meta({ examples: [value] })` | ✅ YES          |
| `examples`     | `.meta({ examples: [...] })`   | ✅ YES          |
| `title`        | `.meta({ title })`             | ✅ YES          |
| `externalDocs` | `.meta({ externalDocs })`      | ✅ YES          |
| `xml`          | `.meta({ xml })`               | ✅ YES (custom) |

> [!IMPORTANT]  
> **All metadata MUST use `.meta()`**. This is the Zod 4 standard approach.  
> `.describe()` exists for Zod 3 compatibility but `.meta()` is preferred.

---

## Strictness Rules

1. **Object schemas are strict by default** — Use `z.object().strict()` unless `additionalProperties: true`
2. **Unknown keys** — If `additionalProperties` is defined, use `.passthrough()` or `.catchall()`
3. **Required fields** — Only fields in `required` array omit `.optional()`
4. **No silent coercion** — Do not use `z.coerce` unless explicitly requested

---

## Fail-Fast Requirements

The writer **MUST throw** (not emit broken code) for:

1. Unsupported IR patterns with no Zod equivalent
2. Circular references without proper `z.lazy()` handling
3. Invalid constraint combinations (e.g., `min > max`)
4. Unknown schema types

---

## Verification Approach

### Test Categories

1. **Schema Type Tests** — Every IR type produces valid Zod
2. **Constraint Tests** — Every constraint is enforced
3. **Composition Tests** — allOf/oneOf/anyOf work correctly
4. **Round-Trip Validation** — Same data passes/fails both validators
5. **Generated Code Quality** — Output is syntactically valid TypeScript

### Fixtures

Use the same OpenAPI fixtures from Session 2.7:

- `petstore-expanded-3.0`
- `tictactoe-3.1`
- `oak-api` (real-world complexity)

For each: `OpenAPI → IR → Zod → validate sample data`

---

## Definition of Done

Session 2.8 is complete when:

- [ ] All IR schema types map to Zod
- [ ] All supported constraints are preserved
- [ ] `description` values flow to `.describe()`
- [ ] Generated code passes TypeScript compilation
- [ ] Generated schemas validate identically to OpenAPI
- [ ] All 10 quality gates pass
