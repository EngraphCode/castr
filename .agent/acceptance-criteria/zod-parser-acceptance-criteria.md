# Zod 4 -> IR Parser Acceptance Criteria

> Detailed view of `.agent/directives/requirements.md` (Zod -> IR focus and union semantics)
> and `.agent/plans/archive/zod4-parser-plan-3.2-complete.md`. If any conflict exists, requirements win.

---

## Scope

| Input            | Support Status | Notes                     |
| ---------------- | -------------- | ------------------------- |
| Zod 4 (standard) | MUST support   | Idiomatic Zod 4 input     |
| Zod 4 (mini)     | NOT supported  | Different API surface     |
| Zod 3 syntax     | MUST reject    | Actionable errors         |
| Dynamic Zod      | MUST reject    | Not statically analyzable |

Primary goal: parse idiomatic Zod 4 schemas (including our output) and
reconstruct IR for lossless round-trip validation.

---

## Part 1: Zod 4 Syntax Recognition

### 1.1 Primitive Types

| Zod 4 Expression | Target IR                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `z.string()`     | `type: 'string'`                                                                                                     |
| `z.number()`     | `type: 'number'`                                                                                                     |
| `z.boolean()`    | `type: 'boolean'`                                                                                                    |
| `z.null()`       | `type: 'null'`                                                                                                       |
| `z.undefined()`  | **MUST reject** (undefined is not representable in OpenAPI/JSON Schema; use `.optional()` at the parent/field level) |
| `z.bigint()`     | `type: 'integer', format: 'int64'`                                                                                   |

### 1.2 Integer and Float Formats

| Zod 4 Expression | Target IR                          |
| ---------------- | ---------------------------------- |
| `z.int()`        | `type: 'integer'`                  |
| `z.int32()`      | `type: 'integer', format: 'int32'` |
| `z.int64()`      | `type: 'integer', format: 'int64'` |
| `z.float32()`    | `type: 'number', format: 'float'`  |
| `z.float64()`    | `type: 'number', format: 'double'` |

### 1.3 String Formats (Top-Level Functions)

| Zod 4 Expression | Target IR                            |
| ---------------- | ------------------------------------ |
| `z.email()`      | `type: 'string', format: 'email'`    |
| `z.url()`        | `type: 'string', format: 'uri'`      |
| `z.uuid()`       | `type: 'string', format: 'uuid'`     |
| `z.uuidv4()`     | `type: 'string', format: 'uuid'`     |
| `z.uuidv7()`     | `type: 'string', format: 'uuid'`     |
| `z.base64()`     | `type: 'string', format: 'byte'`     |
| `z.base64url()`  | `type: 'string', format: 'byte'`     |
| `z.ipv4()`       | `type: 'string', format: 'ipv4'`     |
| `z.ipv6()`       | `type: 'string', format: 'ipv6'`     |
| `z.cidrv4()`     | `type: 'string'`                     |
| `z.cidrv6()`     | `type: 'string'`                     |
| `z.jwt()`        | `type: 'string'`                     |
| `z.e164()`       | `type: 'string'`                     |
| `z.hostname()`   | `type: 'string', format: 'hostname'` |

### 1.4 ISO Date/Time Formats

| Zod 4 Expression   | Target IR                             |
| ------------------ | ------------------------------------- |
| `z.iso.date()`     | `type: 'string', format: 'date'`      |
| `z.iso.datetime()` | `type: 'string', format: 'date-time'` |
| `z.iso.time()`     | `type: 'string', format: 'time'`      |
| `z.iso.duration()` | `type: 'string', format: 'duration'`  |

### 1.5 Literal and Enum Types

| Zod 4 Expression          | Target IR               |
| ------------------------- | ----------------------- |
| `z.literal('value')`      | `const: 'value'`        |
| `z.literal(123)`          | `const: 123`            |
| `z.literal(true)`         | `const: true`           |
| `z.literal(['a', 'b'])`   | `enum: ['a', 'b']`      |
| `z.enum(['a', 'b', 'c'])` | `enum: ['a', 'b', 'c']` |

### 1.6 Object Types

| Zod 4 Expression                 | Target IR                           |
| -------------------------------- | ----------------------------------- |
| `z.object({ prop: z.string() })` | `type: 'object', properties: {...}` |
| `.strict()`                      | `additionalProperties: false`       |
| `.passthrough()`                 | `additionalProperties: true`        |
| `.catchall(schema)`              | `additionalProperties: schema`      |

### 1.7 Array and Tuple Types

| Zod 4 Expression     | Target IR                           |
| -------------------- | ----------------------------------- |
| `z.array(schema)`    | `type: 'array', items: schema`      |
| `schema.array()`     | `type: 'array', items: schema`      |
| `z.tuple([a, b, c])` | `type: 'array', prefixItems: [...]` |
| `z.tuple([a], rest)` | tuple with variadic rest            |

### 1.8 Union Types

| Zod 4 Expression                   | Target IR                                            |
| ---------------------------------- | ---------------------------------------------------- |
| `z.union([a, b])`                  | `anyOf: [a, b]`                                      |
| `z.xor(a, b)`                      | `oneOf: [a, b]`                                      |
| `z.discriminatedUnion(key, [...])` | `oneOf: [...], discriminator: { propertyName: key }` |

Union semantics must be preserved (see requirements section 8). If a union
requests `oneOf` semantics via metadata but disjointness cannot be proven,
parsing MUST fail fast with a helpful error.

### 1.9 Intersection Types

| Zod 4 Expression       | Target IR       |
| ---------------------- | --------------- |
| `z.intersection(a, b)` | `allOf: [a, b]` |

### 1.10 Optionality and Nullability

| Zod 4 Pattern        | Target IR               |
| -------------------- | ----------------------- |
| `.optional()`        | mark optional in parent |
| `.nullable()`        | `type: ['...', 'null']` |
| `.nullish()`         | optional + nullable     |
| `z.optional(schema)` | same as `.optional()`   |
| `z.nullable(schema)` | same as `.nullable()`   |

### 1.11 Constraints

String constraints:

- `.min(n)` -> `minLength: n`
- `.max(n)` -> `maxLength: n`
- `.length(n)` -> `minLength: n, maxLength: n`
- `.regex(/.../)` -> `pattern`
- `.startsWith()` / `.endsWith()` / `.includes()`:
  - If these appear in input, the parser MUST either map them to an equivalent JSON Schema constraint losslessly (typically via `pattern`) OR reject with a helpful, actionable error.
  - "Preserve in metadata" is not acceptable in strict mode unless there is a defined, lossless IR representation and a writer strategy that round-trips it deterministically.

Number constraints:

- `.min(n)` / `.gte(n)` -> `minimum: n`
- `.max(n)` / `.lte(n)` -> `maximum: n`
- `.gt(n)` -> `exclusiveMinimum: n`
- `.lt(n)` -> `exclusiveMaximum: n`
- `.positive()` -> `exclusiveMinimum: 0`
- `.negative()` -> `exclusiveMaximum: 0`
- `.multipleOf(n)` -> `multipleOf: n`

Array constraints:

- `.min(n)` -> `minItems: n`
- `.max(n)` -> `maxItems: n`
- `.length(n)` -> `minItems: n, maxItems: n`

### 1.12 Metadata

`.meta()` is the idiomatic Zod 4 approach for metadata and is always preferred.

**`.describe()` Handling (Deprecated):**

- `.describe(text)` in input is converted to `.meta({ description: text })` during parsing
- If both `.describe()` and `.meta({ description })` exist, `.meta()` takes precedence
- Output MUST always use `.meta()`, never `.describe()`

| Zod 4 Method                  | Target IR                                |
| ----------------------------- | ---------------------------------------- |
| `.meta({ title })`            | `title`                                  |
| `.meta({ description })`      | `description`                            |
| `.describe(text)`             | `description` (converted to meta format) |
| `.meta({ deprecated: true })` | `deprecated`                             |
| `.meta({ examples: [...] })`  | `examples`                               |

### 1.13 Recursive References (Zod 4 getter syntax ONLY)

| Zod 4 Pattern                               | Target IR                      |
| ------------------------------------------- | ------------------------------ |
| `get prop() { return z.array(SameSchema) }` | `$ref` with circular detection |

`z.lazy()` is NOT supported and MUST be rejected.

### 1.14 Defaults

| Zod 4 Method      | Target IR        |
| ----------------- | ---------------- |
| `.default(value)` | `default: value` |

---

## Part 2: Zod 3 Rejection Requirements

The parser MUST reject Zod 3-only patterns with actionable errors:

| Zod 3 Pattern (reject)  | Zod 4 Equivalent   | Required Error Message Pattern   |
| ----------------------- | ------------------ | -------------------------------- |
| `z.string().email()`    | `z.email()`        | "Use `z.email()` instead"        |
| `z.string().url()`      | `z.url()`          | "Use `z.url()` instead"          |
| `z.string().uuid()`     | `z.uuid()`         | "Use `z.uuid()` instead"         |
| `z.string().datetime()` | `z.iso.datetime()` | "Use `z.iso.datetime()` instead" |
| `z.number().int()`      | `z.int()`          | "Use `z.int()` instead"          |
| `.nonempty()`           | `.min(1)`          | "Use `.min(1)` instead"          |

All rejection errors MUST include:

- The exact Zod 3 pattern detected
- Line and column number
- The correct Zod 4 replacement
- A clear, actionable message

**Strictness requirement:** these are not warnings. If any Zod 3 syntax is detected, parsing MUST fail (throw), and MUST NOT return a partially-parsed IR.

---

## Part 3: Dynamic Schema Rejection

The parser MUST reject patterns that cannot be statically analyzed:

| Pattern                           | Error Code              | Required Message                                        |
| --------------------------------- | ----------------------- | ------------------------------------------------------- |
| `z.object({ [key]: z.string() })` | `DYNAMIC_SCHEMA`        | "Computed property keys cannot be statically analyzed"  |
| `z.object({ ...otherSchema })`    | `DYNAMIC_SCHEMA`        | "Spread operators cannot be statically analyzed"        |
| `someVariable` (reference)        | `UNRESOLVED_REF`        | "Cannot resolve variable reference"                     |
| `z.lazy(() => ...)`               | `UNSUPPORTED_RECURSION` | "Use getter-based recursion; z.lazy() is not supported" |

---

## Part 4: Test Requirements

### 4.1 Happy Path Fixtures

For each supported pattern in Part 1:

- A Zod 4 fixture file MUST exist
- A corresponding `.expected.json` MUST define expected IR
- Tests MUST assert successful parsing

### 4.2 Sad Path Fixtures

For each rejection pattern in Parts 2 and 3:

- A fixture MUST exist
- A corresponding `.expected-error.json` MUST define the error
- Tests MUST assert the error is produced

### 4.3 Round-Trip Validation Tests

```
OpenAPI -> IR1 -> Zod -> IR2
         (IR1 ~= IR2)
```

- Parse Zod output generated by the writer
- Reconstructed IR must be semantically equivalent
- Use petstore and real-world fixtures

---

## Strictness Addendum (Fail Fast, No Tolerance Paths)

The following must be true for the parser to comply with repository doctrine:

- **No partial success:** If parsing detects any unsupported / dynamic / Zod 3 patterns, the parser MUST throw a structured error (including line+column) and MUST NOT silently skip declarations.
- **No semantic degradation:** Standalone `z.undefined()` schemas MUST be rejected with a helpful error. Optionality must be expressed via `.optional()` at the parent/field level.
- **Lockstep with writer:** If the Zod writer can emit a construct (e.g. `z.hostname()`), the parser MUST accept it. If the parser accepts a construct and maps it into IR (e.g. `format: 'hostname'`), the writer MUST emit it losslessly or parsing/writing must fail fast upstream.
