# Zod 4 → IR Parser Acceptance Criteria

> All requirements derived from the [Zod 4 Documentation](https://zod.dev/v4) and
> [Zod 4 API Reference](https://zod.dev/api).

---

## Scope

| Input              | Support Status   | Notes                                  |
| ------------------ | ---------------- | -------------------------------------- |
| Zod 4 (standard)   | ✅ MUST support  | All patterns we generate               |
| Zod 4 (mini)       | ❌ NOT supported | Different API surface                  |
| Zod 3 syntax       | ❌ MUST reject   | With clear, actionable error messages  |
| Arbitrary user Zod | ⚪ Best effort   | Focus is on parsing OUR generated code |

> [!IMPORTANT]
> **Primary Goal:** Parse Zod 4 schemas that we generate (via IR → Zod writer) and
> reconstruct the original IR. This enables true round-trip validation.

---

## Part 1: Zod 4 Syntax Recognition

### 1.1 Primitive Types

The parser MUST recognize these Zod 4 primitives:

| Zod 4 Expression | Target IR                          | Status |
| ---------------- | ---------------------------------- | ------ |
| `z.string()`     | `type: 'string'`                   |        |
| `z.number()`     | `type: 'number'`                   |        |
| `z.boolean()`    | `type: 'boolean'`                  |        |
| `z.null()`       | `type: 'null'`                     |        |
| `z.undefined()`  | (optional marker)                  |        |
| `z.bigint()`     | `type: 'integer', format: 'int64'` |        |

### 1.2 Integer Formats (Zod 4 Specific)

| Zod 4 Expression | Target IR                           | Status |
| ---------------- | ----------------------------------- | ------ |
| `z.int()`        | `type: 'integer'`                   |        |
| `z.int32()`      | `type: 'integer', format: 'int32'`  |        |
| `z.int64()`      | `type: 'integer', format: 'int64'`  |        |
| `z.uint32()`     | `type: 'integer', format: 'uint32'` |        |
| `z.float32()`    | `type: 'number', format: 'float'`   |        |
| `z.float64()`    | `type: 'number', format: 'double'`  |        |

### 1.3 String Formats (Zod 4 Top-Level Functions)

| Zod 4 Expression | Target IR                            | Status |
| ---------------- | ------------------------------------ | ------ |
| `z.email()`      | `type: 'string', format: 'email'`    |        |
| `z.url()`        | `type: 'string', format: 'uri'`      |        |
| `z.uuid()`       | `type: 'string', format: 'uuid'`     |        |
| `z.uuidv4()`     | `type: 'string', format: 'uuid'`     |        |
| `z.uuidv7()`     | `type: 'string', format: 'uuid'`     |        |
| `z.base64()`     | `type: 'string', format: 'byte'`     |        |
| `z.base64url()`  | `type: 'string', format: 'byte'`     |        |
| `z.ipv4()`       | `type: 'string', format: 'ipv4'`     |        |
| `z.ipv6()`       | `type: 'string', format: 'ipv6'`     |        |
| `z.jwt()`        | `type: 'string'` (format TBD)        |        |
| `z.e164()`       | `type: 'string'` (phone format)      |        |
| `z.hostname()`   | `type: 'string', format: 'hostname'` |        |
| `z.cidrv4()`     | `type: 'string'`                     |        |
| `z.cidrv6()`     | `type: 'string'`                     |        |

### 1.4 ISO Date/Time Formats (Zod 4 Specific)

| Zod 4 Expression   | Target IR                             | Status |
| ------------------ | ------------------------------------- | ------ |
| `z.iso.date()`     | `type: 'string', format: 'date'`      |        |
| `z.iso.datetime()` | `type: 'string', format: 'date-time'` |        |
| `z.iso.time()`     | `type: 'string', format: 'time'`      |        |
| `z.iso.duration()` | `type: 'string', format: 'duration'`  |        |

### 1.5 Literal Types

| Zod 4 Expression        | Target IR          | Status |
| ----------------------- | ------------------ | ------ |
| `z.literal("value")`    | `const: "value"`   |        |
| `z.literal(123)`        | `const: 123`       |        |
| `z.literal(true)`       | `const: true`      |        |
| `z.literal(["a", "b"])` | `enum: ["a", "b"]` |        |

### 1.6 Object Types

| Zod 4 Expression                 | Target IR                                 | Status |
| -------------------------------- | ----------------------------------------- | ------ |
| `z.object({ prop: z.string() })` | `type: 'object', properties: {...}`       |        |
| `.strict()`                      | `additionalProperties: false`             |        |
| `.passthrough()`                 | `additionalProperties: true`              |        |
| `z.strictObject({...})`          | Object with `additionalProperties: false` |        |
| `z.looseObject({...})`           | Object with `additionalProperties: true`  |        |
| `.catchall(schema)`              | `additionalProperties: schema`            |        |

### 1.7 Array Types

| Zod 4 Expression     | Target IR                           | Status |
| -------------------- | ----------------------------------- | ------ |
| `z.array(schema)`    | `type: 'array', items: schema`      |        |
| `schema.array()`     | `type: 'array', items: schema`      |        |
| `z.tuple([a, b, c])` | `type: 'array', prefixItems: [...]` |        |
| `z.tuple([a], rest)` | Tuple with variadic rest            |        |

### 1.8 Enum Types

| Zod 4 Expression          | Target IR                     | Status |
| ------------------------- | ----------------------------- | ------ |
| `z.enum(["a", "b", "c"])` | `type: 'string', enum: [...]` |        |

### 1.9 Union Types

| Zod 4 Expression                   | Target IR                                          | Status |
| ---------------------------------- | -------------------------------------------------- | ------ |
| `z.union([a, b])`                  | `anyOf: [a, b]`                                    |        |
| `z.xor([a, b])`                    | `oneOf: [a, b]`                                    |        |
| `z.discriminatedUnion(key, [...])` | `oneOf: [...], discriminator: {propertyName: key}` |        |

### 1.10 Intersection Types

| Zod 4 Expression       | Target IR       | Status |
| ---------------------- | --------------- | ------ |
| `z.intersection(a, b)` | `allOf: [a, b]` |        |

### 1.11 Optionality/Nullability

| Zod 4 Pattern        | Target IR                   | Status |
| -------------------- | --------------------------- | ------ |
| `.optional()`        | `required: false` in parent |        |
| `.nullable()`        | `type: ['...', 'null']`     |        |
| `.nullish()`         | Both optional and nullable  |        |
| `z.optional(schema)` | Equivalent to `.optional()` |        |
| `z.nullable(schema)` | Equivalent to `.nullable()` |        |

### 1.12 Constraints

| Zod 4 Method          | Target IR (strings)          | Target IR (numbers)   | Status |
| --------------------- | ---------------------------- | --------------------- | ------ |
| `.min(n)`             | `minLength: n`               | `minimum: n`          |        |
| `.max(n)`             | `maxLength: n`               | `maximum: n`          |        |
| `.length(n)`          | `minLength: n, maxLength: n` | N/A                   |        |
| `.regex(pattern)`     | `pattern: ...`               | N/A                   |        |
| `.gt(n)`              | N/A                          | `exclusiveMinimum: n` |        |
| `.lt(n)`              | N/A                          | `exclusiveMaximum: n` |        |
| `.gte(n)` / `.min(n)` | N/A                          | `minimum: n`          |        |
| `.lte(n)` / `.max(n)` | N/A                          | `maximum: n`          |        |
| `.multipleOf(n)`      | N/A                          | `multipleOf: n`       |        |
| `.positive()`         | N/A                          | `exclusiveMinimum: 0` |        |
| `.negative()`         | N/A                          | `exclusiveMaximum: 0` |        |
| `.nonnegative()`      | N/A                          | `minimum: 0`          |        |
| `.nonpositive()`      | N/A                          | `maximum: 0`          |        |

### 1.13 Metadata

| Zod 4 Method                  | Target IR                     | Status |
| ----------------------------- | ----------------------------- | ------ |
| `.meta({...})`                | Extract to IR metadata fields |        |
| `.describe("text")`           | `description: "text"`         |        |
| `.meta({ deprecated: true })` | `deprecated: true`            |        |
| `.meta({ examples: [] })`     | `examples: [...]`             |        |
| `.meta({ title: "..." })`     | `title: "..."`                |        |

### 1.14 Recursive References (Zod 4 Getter Syntax)

| Zod 4 Pattern                               | Target IR                            | Status |
| ------------------------------------------- | ------------------------------------ | ------ |
| `get prop() { return z.array(SameSchema) }` | `$ref: '#/...'` + circular detection |        |

### 1.15 Defaults

| Zod 4 Method      | Target IR        | Status |
| ----------------- | ---------------- | ------ |
| `.default(value)` | `default: value` |        |

---

## Part 2: Zod 3 Rejection Requirements

The parser MUST **reject** these Zod 3 patterns with **clear error messages**:

### 2.1 Deprecated Method Syntax

| Zod 3 Pattern (❌ REJECT) | Zod 4 Equivalent   | Required Error Message Pattern              |
| ------------------------- | ------------------ | ------------------------------------------- |
| `z.string().email()`      | `z.email()`        | "Use `z.email()` instead"                   |
| `z.string().url()`        | `z.url()`          | "Use `z.url()` instead"                     |
| `z.string().uuid()`       | `z.uuid()`         | "Use `z.uuid()` instead"                    |
| `z.string().datetime()`   | `z.iso.datetime()` | "Use `z.iso.datetime()` instead"            |
| `z.number().int()`        | `z.int()`          | "Use `z.int()` instead"                     |
| `.nonempty()`             | `.min(1)`          | "Use `.min(1)` instead"                     |
| `.nonnegative()`          | `.min(0)`          | "Use `.min(0)` or `.nonnegative()` (Zod 4)" |
| `.nonpositive()`          | `.max(0)`          | "Use `.max(0)` or `.nonpositive()` (Zod 4)" |

### 2.2 Error Quality Requirements

All rejection errors MUST include:

- ❌ The exact Zod 3 pattern detected
- 📍 Line and column number
- ✅ The correct Zod 4 replacement
- 📝 A clear, actionable message

---

## Part 3: Dynamic Schema Rejection

The parser MUST **reject** dynamic patterns that cannot be statically analyzed:

| Pattern                           | Error Code       | Required Message                                       |
| --------------------------------- | ---------------- | ------------------------------------------------------ |
| `z.object({ [key]: z.string() })` | `DYNAMIC_SCHEMA` | "Computed property keys cannot be statically analyzed" |
| `z.object({ ...otherSchema })`    | `DYNAMIC_SCHEMA` | "Spread operators cannot be statically analyzed"       |
| `someVariable` (reference)        | `UNRESOLVED_REF` | "Cannot resolve variable reference"                    |

---

## Part 4: Test Requirements

### 4.1 Happy Path Fixtures

For EACH pattern in Part 1:

- A Zod 4 fixture file MUST exist containing valid syntax
- A corresponding `.expected.json` MUST define the expected IR
- A test MUST assert successful parsing

### 4.2 Sad Path Fixtures

For EACH pattern in Part 2 and Part 3:

- A fixture file MUST exist containing the invalid syntax
- A corresponding `.expected-error.json` MUST define the expected error
- A test MUST assert the error is produced

### 4.3 Round-Trip Validation Tests

```
OpenAPI → IR₁ → Zod → IR₂
         └─────────┘
         IR₁ ≈ IR₂ (semantic equivalence)
```

Test Requirements:

- Parse Zod output generated by our writer
- Reconstructed IR must be semantically equivalent to original
- Use existing petstore and real-world fixtures

---

## Part 5: Implementation Status

> **Updated:** Not yet implemented

### Status Summary

| Category        | Total Patterns | Implemented | Tested |
| --------------- | -------------- | ----------- | ------ |
| Primitives      | 6              | ❌          | ❌     |
| Integer Formats | 6              | ❌          | ❌     |
| String Formats  | 14             | ❌          | ❌     |
| ISO Formats     | 4              | ❌          | ❌     |
| Literals        | 4              | ❌          | ❌     |
| Objects         | 6              | ❌          | ❌     |
| Arrays/Tuples   | 4              | ❌          | ❌     |
| Enums           | 1              | ❌          | ❌     |
| Unions          | 3              | ❌          | ❌     |
| Intersections   | 1              | ❌          | ❌     |
| Optionality     | 5              | ❌          | ❌     |
| Constraints     | 14             | ❌          | ❌     |
| Metadata        | 5              | ❌          | ❌     |
| Recursion       | 1              | ❌          | ❌     |
| Defaults        | 1              | ❌          | ❌     |
| **Total**       | **75**         | **0**       | **0**  |

### Zod 3 Rejection Status

| Pattern              | Detection | Error Message | Tested |
| -------------------- | --------- | ------------- | ------ |
| `.email()` method    | ❌        | ❌            | ❌     |
| `.url()` method      | ❌        | ❌            | ❌     |
| `.uuid()` method     | ❌        | ❌            | ❌     |
| `.datetime()` method | ❌        | ❌            | ❌     |
| `.int()` method      | ❌        | ❌            | ❌     |
| `.nonempty()`        | ❌        | ❌            | ❌     |

---

## References

- [Zod 4 Release Notes](https://zod.dev/v4)
- [Zod 4 API Reference](https://zod.dev/api)
- [ADR-031: Zod Output Strategy](../docs/architectural_decision_records/ADR-031-zod-output-strategy.md)
- [IR Schema](../../lib/src/ir/schema.ts)
