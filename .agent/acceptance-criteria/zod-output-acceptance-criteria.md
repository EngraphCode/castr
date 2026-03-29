# Zod Output Acceptance Criteria

> Detailed view of `.agent/directives/requirements.md` (Output Generation + Union Semantics)
> and ADR-031. If any conflict exists, requirements win.

> [!IMPORTANT]
> [IDENTITY.md](../../.agent/IDENTITY.md) establishes strict-only object output. The strip-normalization compatibility mode from ADR-040 has been removed. Object output is always `z.strictObject({...})`.

> [!IMPORTANT]
> Current implementation note (2026-03-22): Pack 5 and Pack 7 both closed `red`.
> The writer direction remains coherent, but the live writer/proof surface is narrower than the full contract below:
>
> - metadata preservation is not yet proven for every row in the metadata table
> - helper-format support is wider in doctrine than the parser/writer/proof lockstep currently proves
> - generated-code and transform suites do not yet prove every semantic claim below end to end
>
> Treat this file as target doctrine unless a proof suite or review note says the current surface is narrower.

---

## Scope

- Output is idiomatic Zod 4 only (no Zod 3 method syntax)
- Primary pipeline: OpenAPI -> IR -> Zod
- Output MUST be lossless with respect to IR semantics and metadata

---

## Core Principles

- ZERO INFORMATION LOSS: all IR fields with Zod equivalents are emitted
- FAIL FAST: unsupported IR patterns throw instead of generating invalid code
- STRICTNESS: output schemas must be as strict as the IR allows

---

## 1. Schema Type Coverage

Every IR schema type must map to a valid Zod 4 construct:

| IR Type             | Zod Output                       | Notes                       |
| ------------------- | -------------------------------- | --------------------------- |
| `string`            | `z.string()`                     | Default when no format      |
| `number`            | `z.number()`                     |                             |
| `integer`           | `z.int()`                        | Default integer             |
| `integer+format`    | `z.int32()` / `z.int64()`        | `int32` / `int64`           |
| `integer+semantic`  | `z.bigint()`                     | `bigint`                    |
| `boolean`           | `z.boolean()`                    |                             |
| `null`              | `z.null()`                       |                             |
| `array`             | `z.array(...)`                   |                             |
| `object`            | `z.strictObject({...})`          | Explicit strict object form |
| `enum` (single)     | `z.literal(value)`               | Any type                    |
| `enum` (all string) | `z.enum([...])`                  | String enums                |
| `enum` (mixed)      | `z.union([z.literal(...), ...])` | Mixed literals              |
| `const`             | `z.literal(value)`               |                             |

---

## 2. Format-Specific Output (Strings and Integers)

Zod 4 top-level format functions MUST be used where possible:

| IR Format                 | Zod Output         |
| ------------------------- | ------------------ |
| `email`                   | `z.email()`        |
| `uri` / `url`             | `z.url()`          |
| `uuid`                    | `z.uuid()`         |
| `uuid` + `uuidVersion: 4` | `z.uuidv4()`       |
| `uuid` + `uuidVersion: 7` | `z.uuidv7()`       |
| `date`                    | `z.iso.date()`     |
| `date-time`               | `z.iso.datetime()` |
| `time`                    | `z.iso.time()`     |
| `duration`                | `z.iso.duration()` |
| `ipv4`                    | `z.ipv4()`         |
| `ipv6`                    | `z.ipv6()`         |

Integer formats:

- `int32` -> `z.int32()`
- `int64` -> `z.int64()` (returns bigint)
- `bigint` semantics -> `z.bigint()`
- no format -> `z.int()`

Redundant validations MUST be filtered when a format function already provides
the validation (e.g., avoid `z.email().email()` or `z.int().int()`).

---

## 3. Constraint Preservation

All IR constraints must be preserved:

| IR Constraint      | Zod Method(s)                       |
| ------------------ | ----------------------------------- |
| `minLength`        | `.min()`                            |
| `maxLength`        | `.max()`                            |
| `pattern`          | `.regex()`                          |
| `minimum`          | `.gte()` / `.min()`                 |
| `maximum`          | `.lte()` / `.max()`                 |
| `exclusiveMinimum` | `.gt()`                             |
| `exclusiveMaximum` | `.lt()`                             |
| `multipleOf`       | `.multipleOf()`                     |
| `minItems`         | `.min()`                            |
| `maxItems`         | `.max()`                            |
| `uniqueItems`      | Custom refine (document limitation) |

---

## 4. Composition Support

| IR Pattern                 | Zod Output                         | Notes                               |
| -------------------------- | ---------------------------------- | ----------------------------------- |
| `allOf`                    | `z.intersection()` or `.and()`     | Must preserve semantics             |
| `oneOf` + discriminator    | `z.discriminatedUnion()`           | Required when discriminator present |
| `oneOf` (no discriminator) | `z.xor([...])`                     | Exclusive OR                        |
| `anyOf`                    | `z.union([...])`                   | Inclusive OR                        |
| `not`                      | Fail fast unless explicit strategy |                                     |

Union semantics MUST be preserved (see requirements section 8).

---

## 5. Optionality and Nullability

- Optional properties/parameters -> `.optional()`
- Nullability -> `.nullable()`
- `nullish` -> `.nullish()` when both optional and nullable

---

## 6. Metadata Preservation

Zod output MUST preserve schema metadata using `.meta()` (idiomatic Zod 4).
Description MUST be emitted via `.meta({ description })`; `.describe()` is not used.

Current implementation note: Pack 5 found the live metadata surface narrower than the full table below. Do not treat every row here as currently proven support until the Pack 5 / Pack 7 remediation closes.

| IR Field       | Zod 4 Output                   |
| -------------- | ------------------------------ |
| `title`        | `.meta({ title })`             |
| `description`  | `.meta({ description })`       |
| `deprecated`   | `.meta({ deprecated: true })`  |
| `example`      | `.meta({ examples: [value] })` |
| `examples`     | `.meta({ examples: [...] })`   |
| `externalDocs` | `.meta({ externalDocs })`      |
| `xml`          | `.meta({ xml })`               |

If no metadata is present, no `.meta()` call should be emitted.

---

## 7. Strictness Rules

- Objects are always emitted as explicit strict objects: `z.strictObject({...})`
- Bare `z.object({...})` is not an acceptable stand-in for strict object semantics
- `.strip()`, `.passthrough()`, and `.catchall(schema)` are not generated-object targets
- Recursive strict output must use `z.strictObject({...})`, the runtime-safe canonical strict form accepted by parser/writer lockstep
- No implicit coercion unless explicitly requested

---

## 8. Recursion

Recursive schemas MUST be emitted using Zod 4 getter-based recursion
and NOT `z.lazy()`.

---

## 9. Fail-Fast and Semantic Output Requirements

Per the [Input-Output Pair Compatibility Model](../directives/principles.md), the writer must handle IR keywords as follows:

- **Genuinely impossible patterns** (no Zod mechanism exists) → throw with "Genuinely impossible" prefix
- **Semantically expressible patterns** → emit `.refine()` runtime validation closures (e.g., `patternProperties`, `contains`)
- Invalid constraint combinations (e.g., `min > max`) → throw with actionable error
- Unknown schema types → throw
- Composition edge cases that cannot be represented safely → throw

---

## 10. Verification Approach

### Test Categories

1. Schema type tests
2. Constraint tests
3. Composition tests
4. Transform validation with sample input (OpenAPI -> IR -> Zod -> IR)
5. Generated code quality (TS compile, lint, format)

### Definition of Done

- All IR schema types map to valid Zod 4 output
- All supported constraints are preserved
- Metadata flows to `.meta()`
- Generated code compiles and passes quality gates
- Transform validation passes for normalized fixtures (including round-trip/idempotence proofs)
