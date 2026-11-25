> **A reader's report, not a finding of this repository.** A reader who knows Zod
> attacked the draft of
> [the cases the model's design must hold](../../analysis-and-reports/model-design-cases-2026-11-25.md)
> on 25 November 2026 and ran every claim against Zod 4.6.7. It is kept whole, as returned. The case numbers are
> those of the draft it read; the note has since gained cases and its section I was
> renumbered. What the seat checked of it, and what it changed, is in the note and in
> the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

Zod 4.6.7 attack on cases.md: 2 WRONG, 4 OVERCLAIM, 12 MISSING-CASE; C1, C3, D2, I2, I4, I5, exactOptional and brand hold.

Every line below was run with `npx tsx` from castr/lib. The scripts are in the zod-work directory (c1, d1, d2, inter, h2, i2, i45, m1 to m8 `.ts`). Where a script printed `undefined` as `null` or dropped function-valued keys, I re-ran it (m6.ts), and the outputs below are those re-runs.

## Findings on the note's claims

### 1. I1, and the preamble on line 15: WRONG

- **Run:**
  - `z.strictObject({ a: z.string() }).safeParse({})` gives `invalid_type: expected string, received undefined`.
  - `z.toJSONSchema` of the same schema gives `{"type":"object","properties":{"a":{"type":"string"}},"required":["a"],"additionalProperties":false}`.
  - `z.strictObject({ a: z.string().optional() })` parses `{}` as ok, and its JSON Schema has no `required`.
- **Correction:**
  - The Zod member requires `a`. The two JSON members leave it optional, so this member is not in the set.
  - Use `z.strictObject({ a: z.string().optional() })`, or `.exactOptional()` if JS `undefined` counts.
  - Line 15 ("every Zod fragment … does what its case says") is false here and in finding 2.

### 2. H2, the getter: WRONG

- **Run:**
  - `z.object({ get self() { return z.string(); } })` gives a JSON Schema of `"self":{"type":"string"}`. That is identical to `z.object({ self: z.string() })`.
  - Before the first access, `def.shape` is a getter, and the source getter is kept on `.raw`.
  - After the first read, `def.shape` and `self` are both plain data properties.
  - The recursive case is `N = z.object({ name: z.string(), get next() { return N.optional(); } })`. There, `N._zod.def.shape.next._zod.def.innerType === N` is true, and the JSON Schema has `"next":{"$ref":"#"}`.
- **Correction:**
  - A getter is not a reference, and after the first access the runtime keeps nothing of it.
  - In a runtime Zod schema, a reference is instance identity: a cycle, or a shared instance.
  - The fragment must be recursive. The "Holds" line should say "a cycle, which the Zod writer must write as a getter".
  - The getter is visible only if the reader parses the source text, not the runtime schema.

### 3. D1: OVERCLAIM

- **Run:**
  - `z.string().transform(s => s.length).prefault('hello').parse(undefined)` gives `5`.
  - The same schema with `.default(7)` gives `7`; the transform is skipped.
  - `z.object({ a: z.string().min(5).default('x') }).safeParse({ a: undefined })` gives ok `{a:'x'}`.
  - For `z.object({ a: z.string().default('x'), b: z.string().prefault('y') })`:
    - input JSON Schema: both properties carry `default`, and there is no `required`;
    - output JSON Schema: `required:["a","b"]`, and `b` has no `default`.
  - For `transform.default(7)`: input `{"type":"string"}`, output `{"default":7}`.
  - For `z.number().default(() => Math.random())`: `def.defaultValue` is an enumerable getter, and the JSON Schema got `"default":0.1414…`.
- **Correction:**
  - "Absent" includes an explicit `undefined`.
  - The default value is an output-side value. It bypasses the inner schema, transforms included.
  - The prefault value is an input-side value. It is parsed by the inner schema, so it is transformed, not merely validated.
  - Both make the key optional on the input side and required on the output side.
  - A function default has no value to hold: every read of the def calls the function.

### 4. H2, `.readonly()` "as a fact of an object": OVERCLAIM

- **Run:**
  - The def is `{type:'readonly', innerType}`.
  - `z.string().readonly().parse('x')` is ok.
  - Frozen and unfrozen inputs are both accepted.
  - The output is frozen for an object and for an array (`Object.isFrozen` is true).
  - The JSON Schema has `"readOnly":true` on both sides.
- **Correction:**
  - `.readonly()` is a wrapper on any schema, not a fact of an object.
  - It changes nothing on the accepted side; it only freezes the produced value.
  - Zod's writer turns it into JSON Schema `readOnly`, an annotation with a different meaning. So `.readonly()` and JSON Schema `readOnly` must not be one value.

### 5. H2, metadata "held in a registry": OVERCLAIM

- **Run:** with `m = z.string().meta({ title: 'A name' })`:
  - The def is `{type:'string'}`, and `globalRegistry.get(m)` gives `{title}`.
  - `m.min(3)`, `m.refine(…)` and `m.clone()` still give `{title}`. `m.min(3)._zod.parent === m` is true, and the lookup follows that parent link.
  - `m.optional()` and `m.transform(…)` give `undefined` on the wrapper; the inner schema keeps the title.
  - The JSON Schema still has `title` for `.optional()`, and for `.nullable()` it is on the inner `anyOf` branch. A pipe's output side is `{}`.
  - `z.string().register(z.registry(), { title: 'R' })` gives `undefined` from `globalRegistry`, and the writer drops it.
  - `.describe('D').meta({ description: 'M' })` gives `{description:'M'}`.
- **Correction:**
  - Metadata belongs to one node.
  - It carries over through `.min`, `.refine` and `.clone` (the `_zod.parent` chain), not through wrappers.
  - Only `globalRegistry` is visible to the writer.
  - Its `id` is Zod's only runtime name (M2).

### 6. H2, template literal "parts in order": OVERCLAIM

- **Run:**
  - `z.templateLiteral([z.string().min(2).max(3), '-', z.number().int().positive()])` has the pattern `/^[\s\S]{2,3}--?\d+$/`.
    - It accepts `'ab--1'` and `'ab-0'`, so `positive` is ignored.
  - `z.templateLiteral([z.number().max(5)])` accepts `'99'`.
  - For the `z.number()` part of the note's fragment:
    - `'id-1.5'` and `'id--1'` are accepted;
    - `'id-1e3'`, `'id-Infinity'` and `'id-NaN'` are rejected.
  - A part that transforms throws when the schema is built: `Invalid template literal part, no pattern found: ZodPipe`.
- **Correction:**
  - The accepted set is the regex Zod derives from each part.
  - That regex keeps string length, regex and int, and silently drops numeric range checks.
  - The model must derive the set by Zod's rule, or report the dropped checks.

## Claims that hold, with the output

### C1

- The four factories give these defs:
  - `catchall: <never>` for `strictObject`;
  - `catchall: <unknown>` for `looseObject`;
  - `catchall: <number>` for `.catchall(z.number())`;
  - no `catchall` key for `z.object`.
- The method forms give the same defs:
  - `.strict()` is the same def as `strictObject` and `.catchall(z.never())`;
  - `.loose()` and `.passthrough()` are the same def as `looseObject` and `.catchall(z.unknown())`.
- `.catchall(z.any())` differs only in the def.
- After `strictObject(…).strip()`, `'catchall' in def` is true and its value is `undefined`. Test the value, not the key.
- A catchall can transform:
  - `.catchall(z.string().transform(s => s.length))` parses `{a:'x', b:'hello'}` to `{a:'x', b:5}`;
  - its input JSON Schema has `additionalProperties:{type:string}`, its output `{}`.

### C3

- `z.object` turns `{a:'x', b:1}` into `{a:'x'}`.
- Its accepted set equals `looseObject`'s on every value tried. Both accept a plain object, a class instance, a Map and a Date, and both reject an array.
- The JSON Schema has no `additionalProperties` on the input side and `additionalProperties:false` on the output side.

### D2

- The fragment gives `{a:'x'}` and `{a:'x', b:'y'}` as stated. Both unions accept `{a}` and `{a, b:1}`, and both reject `{b}` and `{}`.
- It also holds for transforms: `union([T1, T2])` gives `'T1:q'`, and the reverse order gives `'T2:q'`.
- It does not hold for `xor`: when both alternatives match, it fails with `more than one option matched`.
- It does not hold for `discriminatedUnion` by default. Each value goes to one alternative, and a repeated value throws a plain Error at the first parse.
- It does not hold for `intersection`, where the outputs are merged: `{a, b}` in both orders.
- It does hold for `discriminatedUnion(…, { unionFallback: true })` when the discriminator is absent. `[O1, O2]` gives `{a:'x'}`, and `[O2, O1]` gives `{a:'x', b:'y'}`.

### I2

- `z.tuple([z.string(), z.number()])`:
  - rejects `['a']` and `[]` (`too_small`, at least 2);
  - rejects `['a', 1, 2]` (`too_big`, at most 2);
  - has `rest: null` in its def.
- Its JSON Schema:
  - 2020-12: `prefixItems`, `items:false`, `minItems:2`, `maxItems:2`;
  - draft-07: `items:[…]`, `additionalItems:false`, `minItems:2`, `maxItems:2`.
- `.rest(z.boolean())` gives a def with `rest` set to the boolean schema, and a JSON Schema with `items:{type:boolean}` and `minItems:2`.
- Tuples with an optional or defaulted tail are M11.

### I4

- `.nullable()` and `z.nullable(…)` give the def `{type:'nullable'}`. `z.union([z.string(), z.null()])` gives `{type:'union'}`.
- All three accept `null` and `'a'`, and reject `undefined` and `1`.
- The 2020-12 JSON Schema is `type:["string","null"]` for all three. The order follows the union order: `["null","string"]` for `[null, string]`.
- The openapi-3.0 target writes them differently.
- Same accepted and produced sets, but two def shapes.

### I5

- The defs:
  - `z.literal('a')`: `{values:['a']}`;
  - `z.enum(['a'])`: `{entries:{a:'a'}}`;
  - `z.union([z.literal('a')])`: `{options:[literal]}`;
  - `z.literal(['a'])`: the same as `z.literal('a')`.
- All accept only `'a'`.
- The JSON Schemas are `{type:string, const:a}`, `{type:string, enum:[a]}` and `{anyOf:[{type:string, const:a}]}`.
- Two cases outside the set:
  - `z.enum({ X: 'a' })` has the same accepted set, but its def keeps the member name `X`, which SPEC-PR-1 must carry.
  - A numeric TS enum has `entries:{"1":"A","2":"B","A":1,"B":2}` while its accepted set is {1, 2}. Read `_zod.values`, not `entries`.

### H2, exactOptional

- For `{ a: exactOptional, b: optional }`:
  - `{}` is ok;
  - `{a: undefined}` is rejected;
  - `{b: undefined}` is ok.
- The defs are identical, `{type:'optional', innerType}`. Only the class and the trait `$ZodExactOptional` differ.
- The JSON Schema is the same for both, and on JSON-parsed input both accept the same values.

### H2, brand

- `s.brand('Id') === s` is true, and the def stays `{type:'string'}`. Brand returns the very same instance.

## Missing cases, most damaging first

### M1. An intersection combines the unknown-key policies

- **Run:** with `SA = strictObject({a})` and `SB = strictObject({b})`:
  - `z.intersection(SA, SB)` accepts `{a, b}` and rejects `{a, b, c}` (`unrecognized_keys: c`).
  - `SA & z.object({b})` parses `{a, b, c}` to ok `{a, b}`: `c` is stripped, not rejected.
  - `z.object({a}) & z.looseObject({})` parses `{a, c}` to `{a, c}`.
  - The def is `{type:'intersection', left, right}`.
  - The writer flattens `SA & SB` into one object with `required:[a,b]` and `additionalProperties:false`.
  - `intersection(str→1, str→2).safeParse('q')` throws a plain Error, `Unmergable intersection`, instead of returning an issue.
- **Why a naive structure loses it:** if intersection is read as `allOf` with each branch closed, it becomes the unsatisfiable shape in I1's "not the same value" bullet. Zod closes over the union of the keys, which is what `unevaluatedProperties: false` would do.

### M2. Where a Zod name comes from

- **Run:**
  - `z.string().meta({ id: 'Name' })` used twice gives `$defs:{Name}` and two `$ref`s.
  - A shared instance with no `id` is inlined twice.
  - With `{ reused: 'ref' }`, the writer makes `$defs:{__schema0}`.
  - The TS const name is not present at runtime. Recursion shows only as instance identity.
- **Why a naive structure loses it:** section A has no Zod case. Identity taken from the variable name exists only in the source, and identity taken from instance identity exists only at runtime. The `id` is in the registry, not in the def.

### M3. The record family

- **Run:**
  - `z.record(z.enum(['a','b']), z.number())` rejects `{a:1}` (b is missing) and `{a, b, c}` (`unrecognized_keys: c`). Its JSON Schema has `propertyNames:{enum}` and `required:[a,b]`.
  - `partialRecord` adds `partial:true` to the def, and `{}` is ok.
  - `looseRecord(z.string().regex(/^x-/), z.number())` adds `mode:'loose'`. It accepts `{'x-a':1, b:'q'}` and lets `b` through; its JSON Schema uses `patternProperties`.
  - The same `z.record` gives `invalid_key` for `b`, and its JSON Schema uses `propertyNames`.
  - `z.record(z.number(), …)` accepts the key `'1'` and rejects `'x'`.
  - `z.record(z.string().transform(k => k.toUpperCase()), …)` parses `{a:1}` to `{A:1}`.
- **Why a naive structure loses it:** a plain "key shape to value shape" map loses three things:
  - that a finite key set makes every key required;
  - whether unmatched keys pass through or are rejected;
  - that the produced keys can differ from the accepted keys.

### M4. Checks that overwrite the value

- **Run:**
  - `z.string().trim()` has `checks:[{check:'overwrite', tx: fn}]`.
  - `trim().min(2)` rejects `' a '`, whose length is 3.
  - The JSON Schema for `trim().min(2)` is `minLength:2`, which accepts `' a '`.
  - The JSON Schema for `.trim()` alone is `{type:string}`.
- **Why a naive structure loses it:** checks run in order, and an overwrite changes both what later checks see and what is produced. A set of constraints loses both.

### M5. `z.coerce`

- **Run:**
  - The def is `{type:'number', coerce:true, checks:[]}`.
  - It parses `'12'` to 12, `''` to 0, `null` to 0, `[5]` to 5 and `true` to 1. `'x'` gives an error, because it becomes NaN.
  - The input JSON Schema is `{type:number}`.
- **Why a naive structure loses it:** the accepted side is any value that `Number()` turns into a finite number. Zod's own writer states the wrong accepted set.

### M6. `.catch`

- **Run:**
  - The def is `{type:'catch', innerType, catchValue: fn}`.
  - `z.string().min(5).catch('x').safeParse(1)` gives ok `'x'`.
  - The JSON Schema on both sides is `{default:'x', type:string, minLength:5}`.
- **Why a naive structure loses it:** the accepted set is every value, and the catch value is a function. Reading it as a default loses the accepted side.

### M7. Number formats

- **Run:**
  - `z.int()` has the def `{type:'number', check:'number_format', format:'safeint'}`: the schema is its own check.
  - `z.number().int()` has `{type:'number', checks:[that check]}`.
  - Both reject `2**53`.
  - The JSON Schema for `z.int32()` is `{type:integer, minimum:-2147483648, maximum:2147483647}`, with no `format`.
  - `z.int64()` has `{type:'bigint', format:'int64'}`. `safeParse(1)` gives `expected bigint`, and its JSON Schema is `{}`.
- **Why a naive structure loses it:**
  - Zod's own writer makes E5's loss: the format becomes a range.
  - `{type:integer, format:int64}` read as `z.int64()` rejects every JSON number.
  - `z.int()` is not an unbounded integer.
  - One meaning has two def shapes.

### M8. String formats with parameters

- **Run:**
  - `z.url({ protocol: /^https$/ })` keeps `protocol` in its def and rejects `'http://…'` and `'mailto:x@y'`. Its JSON Schema is only `format:'uri'`; the writer drops `protocol` and `hostname`.
  - `z.iso.datetime({ local: true })` and `{ precision: -1 }`: the writer drops `format`.
  - `{ offset: true }` accepts `'+01:00'`, which the default rejects.
  - `z.uuid({ version: 'v4' })` keeps `version` in its def.
  - `z.guid()` is written as `format:'uuid'`.
  - `z.jwt({ alg })`: the writer drops `alg`.
  - `z.stringFormat('even', fn)` has the def `{format:'even', fn}` with no pattern, and is written as `format:'even'`.
  - `z.email()` is itself the check, while `z.string().email()` puts the check in `checks`.
- **Why a naive structure loses it:**
  - A format name alone loses parameters that change the accepted set.
  - One meaning has two def shapes.
  - A format defined by a function is not declarative.

### M9. Three kinds of choice under one `def.type: 'union'`

- **Run:**
  - `union` has `{options}`.
  - `xor` has `{options, inclusive:false}`.
  - `discriminatedUnion` has `{options, discriminator, inclusive:false}`, and `unionFallback` when it is set.
  - `xor` over `{a}` and `{a, b}` fails on `{a, b}` with `more than one option matched`.
  - The writer turns `union` into `anyOf`, and `xor` and `discriminatedUnion` into `oneOf`.
  - A discriminatedUnion with a repeated discriminator value builds, then throws a plain Error at the first parse.
  - One whose discriminator is not a literal throws `Invalid discriminated union option` at the first parse.
- **Why a naive structure loses it:** reading `type` alone merges three behaviours:
  - the first match wins, so order matters;
  - exactly one must match;
  - the key picks the alternative.
  - D2's order fact is real only for the first, and for the fallback.

### M10. `.nonoptional()` and `.required()`

- **Run:**
  - `z.string().optional().nonoptional()` has `{type:'nonoptional', innerType: optional}` and rejects `undefined`.
  - `z.string().default('x').nonoptional()` accepts `undefined` and gives `'x'`.
  - `.required()` on `{a: string, b: number.optional()}` wraps both keys: `a` becomes `nonoptional(string)`, `b` becomes `nonoptional(optional(number))`.
- **Why a naive structure loses it:** nonoptional checks the produced value, not presence. A "required" flag loses the defaulted keys and the nested wrappers.

### M11. A tuple's tail differs by side

- **Run:**
  - `z.tuple([z.string(), z.number().optional()])` accepts `['a']` and `['a', undefined]`, and rejects `['a', null]`. Its JSON Schema has `minItems:1`.
  - `z.tuple([z.string(), z.number().default(5)])` parses `['a']` to `['a', 5]`. Its input JSON Schema has `minItems:1`, its output `minItems:2`.
  - With the optional in the middle, `[undefined, 1]` is ok and `[1]` gives `too_small`.
- **Why a naive structure loses it:** positions, a rest shape and one minimum length are not enough. The minimum differs by side and comes from the optional tail. I2's "minimum of two" holds only for its own tuple.

### M12. Regex flags

- **Run:** `z.string().regex(/a/i)` keeps `/a/i` in its def and accepts `'A'`. Its JSON Schema is `pattern:'a'`.
- **Why a naive structure loses it:** a pattern held as JSON Schema's string with no flags changes the accepted set. The model must hold the flags, or refuse them.

## Tested, not in the top 12

- `z.success(z.string().min(3))`: the accepted side is the inner schema's, and the produced value is `true`. The input JSON Schema says `type:boolean`.
- `z.json()` and `z.lazy()` have the def keys `type` and `getter`. `z.json()`'s getter returns a union, and the JSON Schema writes it with `$ref:"#"`.
- `z.nan()` has the def `{type:'nan'}`, and its JSON Schema is `{}`.
- `z.number().multipleOf(0.01)` accepts `0.07` and `1.1`, so Zod's divisor is decimal. This supports E1.

Count: WRONG 2, OVERCLAIM 4, MISSING-CASE 12.
