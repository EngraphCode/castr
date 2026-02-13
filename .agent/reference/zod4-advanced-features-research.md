# Zod 4 Advanced Features Research

**Status:** ✅ Research Complete (January 2026)

## Purpose

Research and document Zod 4 features with factual findings.

**Reference:** <https://zod.dev/v4>

---

## Performance Improvements

### Runtime Performance

| Operation      | Improvement |
| -------------- | ----------- |
| String parsing | 14x faster  |
| Array parsing  | 7x faster   |
| Object parsing | 6.5x faster |

### TypeScript Compiler Performance

- **100x reduction in `tsc` instantiations** for typical schemas
- Chained `.extend()` and `.omit()` operations compile 10x faster
- Redesigned generics in `ZodObject` eliminate "instantiation explosions"
- Works well with upcoming `tsgo` compiler

### Bundle Size

| Variant  | Core Bundle (gzipped) |
| -------- | --------------------- |
| Zod 3    | 12.47kb               |
| Zod 4    | 5.36kb (2.3x smaller) |
| Zod Mini | 1.88kb (6.6x smaller) |

---

## Zod Mini (`zod/mini`)

Tree-shakable variant with functional API:

```typescript
import * as z from 'zod/mini';

z.optional(z.string()); // instead of z.string().optional()
z.union([z.string(), z.number()]);
z.extend(baseObject, { age: z.number() });
```

**Parsing methods are identical:**

```typescript
z.string().parse('asdf');
z.string().safeParse('asdf');
```

**Refinements via `.check()`:**

```typescript
z.array(z.number()).check(
  z.minLength(5),
  z.maxLength(10),
  z.refine((arr) => arr.includes(5)),
);
```

---

## Codecs (Bidirectional Transforms)

**New in Zod 4.1** — Bidirectional transformations between schemas:

```typescript
const stringToDate = z.codec(
  z.iso.datetime(), // input schema
  z.date(), // output schema
  {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  },
);

// Forward (decode)
z.decode(stringToDate, '2024-01-15T10:30:00.000Z'); // => Date

// Reverse (encode)
z.encode(stringToDate, new Date('2024-01-15')); // => "2024-01-15T00:00:00.000Z"
```

**Pre-built codecs available:**

- `stringToNumber`, `stringToInt`, `stringToBigInt`
- `isoDatetimeToDate`, `epochSecondsToDate`, `epochMillisToDate`
- `jsonCodec`, `utf8ToBytes`, `base64ToBytes`, `hexToBytes`
- `stringToURL`, `stringToHttpURL`, `uriComponent`, `stringToBoolean`

---

## `.overwrite()` Method

Transforms that don't change inferred type (returns original class, not `ZodPipe`):

```typescript
z.number()
  .overwrite((val) => val ** 2)
  .max(100); // => ZodNumber (not ZodPipe)
```

`.trim()`, `.toLowerCase()`, `.toUpperCase()` are reimplemented using `.overwrite()`.

---

## `z.stringbool()` — Env-Style Boolean Coercion

```typescript
const strbool = z.stringbool();

strbool.parse('true'); // => true
strbool.parse('1'); // => true
strbool.parse('yes'); // => true
strbool.parse('on'); // => true
strbool.parse('enabled'); // => true

strbool.parse('false'); // => false
strbool.parse('0'); // => false
strbool.parse('no'); // => false
strbool.parse('disabled'); // => false

strbool.parse('anything'); // throws ZodError
```

**Customizable:**

```typescript
z.stringbool({ truthy: ['yes', 'true'], falsy: ['no', 'false'] });
```

---

## Unified Error Customization

Single `error` param replaces `message`, `errorMap`, `required_error`, `invalid_type_error`:

```typescript
// Simple string
z.string().min(5, { error: 'Too short.' });

// Function (error map)
z.string({
  error: (issue) => (issue.input === undefined ? 'This field is required' : 'Not a string'),
});

// Access issue properties
z.string().min(5, {
  error: (iss) => `Value must be >${iss.minimum}`,
});
```

---

## Global Configuration (`z.config()`)

```typescript
z.config({
  customError: (iss) => {
    if (iss.code === 'invalid_type') {
      return `Invalid type, expected ${iss.expected}`;
    }
  },
});
```

---

## Internationalization (i18n)

Built-in locales for error messages:

```typescript
import * as z from 'zod';
import { en, fr } from 'zod/locales';

z.config(en()); // English (default in zod)
z.config(fr()); // French
```

**Lazy loading:**

```typescript
const { default: locale } = await import(`zod/v4/locales/${lang}.js`);
z.config(locale());
```

---

## Branded Types

Simulate nominal typing in TypeScript:

```typescript
const Cat = z.object({ name: z.string() }).brand<'Cat'>();
const Dog = z.object({ name: z.string() }).brand<'Dog'>();

type Cat = z.infer<typeof Cat>; // { name: string } & z.$brand<"Cat">
type Dog = z.infer<typeof Dog>; // { name: string } & z.$brand<"Dog">

const pluto = Dog.parse({ name: 'pluto' });
const simba: Cat = pluto; // ❌ Type error
```

**Direction control (4.2+):**

```typescript
z.string().brand<'USD', 'in'>(); // output branded (default)
z.string().brand<'USD', 'out'>(); // input branded
z.string().brand<'USD', 'inout'>(); // both branded
```

---

## `.readonly()` Method

Returns frozen objects at runtime:

```typescript
const ReadonlyUser = z.object({ name: z.string() }).readonly();

type R = z.infer<typeof ReadonlyUser>; // Readonly<{ name: string }>

const result = ReadonlyUser.parse({ name: 'fido' });
result.name = 'simba'; // throws TypeError (Object.freeze)
```

---

## `z.json()` — JSON-Encodable Values

Validates any JSON-serializable value:

```typescript
const jsonSchema = z.json();

// Equivalent to:
z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);
```

---

## Defaults vs Prefaults

**`.default()`** — Short-circuits parsing, returns value directly:

```typescript
z.string()
  .transform((val) => val.length)
  .default(0);
// parse(undefined) => 0 (transform not called)
```

**`.prefault()`** — Passes through parsing pipeline:

```typescript
z.string()
  .transform((val) => val.length)
  .prefault('tuna');
// parse(undefined) => 4 (transform called on "tuna")

z.string().trim().toUpperCase().prefault(' tuna ');
// parse(undefined) => "TUNA"
```

---

## Refinements Inside Schemas

In Zod 4, refinements are stored inside schemas (not wrapped in `ZodEffects`):

```typescript
// Works in Zod 4 (failed in Zod 3)
z.string()
  .refine((val) => val.includes('@'))
  .min(5); // ✅ .min() still available
```

---

## Custom Email Regex

```typescript
z.email(); // Zod default (Gmail rules)
z.email({ pattern: z.regexes.html5Email }); // Browser input[type=email]
z.email({ pattern: z.regexes.rfc5322Email }); // RFC 5322
z.email({ pattern: z.regexes.unicodeEmail }); // Unicode support
```

---

## `zod/v4/core` — Extensible Foundation

Shared sub-package enabling Zod as a "validation substrate" for other libraries:

```typescript
import * as core from 'zod/v4/core';
// Build custom validation libraries on top
```

---

## Previous Research (Retained)

### z.toJSONSchema()

Converts Zod → JSON Schema with multiple targets:

- `draft-2020-12` (default)
- `draft-07`
- `draft-04`
- `openapi-3.0`

**Unrepresentable types throw by default:** `z.bigint()`, `z.int64()`, `z.date()`, `z.map()`, `z.set()`, `z.transform()`, etc.

### z.fromJSONSchema() (Experimental)

Converts JSON Schema → Zod. Not part of stable API.

### Native Recursive Objects

Getter syntax instead of `z.lazy()`:

```typescript
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});
```

### Registry & Metadata

`.meta()` stores metadata in `z.globalRegistry`. All metadata flows to JSON Schema output.

### Numeric Formats

`z.int64()` and `z.uint64()` return `ZodBigInt` (not `ZodNumber`).

---

---

## Recommendations for Castr

Based on this research, the following Zod 4 features are prioritized for Castr:

### High-Impact (Immediate Value)

| Feature               | Benefit                                                     |
| --------------------- | ----------------------------------------------------------- |
| **Codecs**            | Bidirectional encode/decode for network boundary transforms |
| **Native Recursion**  | Cleaner ts-morph AST output, no `z.lazy()` casting          |
| **Metadata Registry** | Already using via `.meta()` (ADR-031)                       |

### Medium-Impact (Quality of Life)

- **Performance gains** — 14x string, 6.5x object parsing
- **Zod Mini** — Optional minimal bundle target for size-sensitive apps

### Deferred

- **`z.toJSONSchema()`** — JSON Schema support is future work
- **`z.fromJSONSchema()`** — Experimental, not stable for Zod → IR

### Constraints

- Metadata loss on `.transform()` — affects round-trip fidelity
- `z.int64()` → BigInt — unrepresentable in strict JSON
