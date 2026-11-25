> **A reader's report, not a finding of this repository.** A reader who knows Zod
> attacked a first proposal for the core of the model's structure on 25 November 2026
> and ran every claim against Zod 4.6.7. The proposal it read is
> [the second hand trial](core-proposal-second-trial.md), kept beside it. It is kept
> whole, as returned. What the seat checked of it, and what the design took from it, is
> in the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

# Attack on core-v2: the Zod 4 reader

25 November 2026. Reviewer: Zod 4 lane. Read-only for every repository.

Every claim below was run against Zod 4.6.7 (the installed copy), with `safeParse`, and the
behaviour was traced to `zod/v4/core/schemas.js` and `checks.js` where it surprised. The
scripts are `zod-work/p1-intersection.ts` to `zod-work/p10-formats.ts`; `zod-work/show.ts`
prints `label | input | OK produced` or `FAIL issue@path`, and `(frozen)` when the output is
frozen.

**Severity basis.** The brief's subset is "no function supplied by the author". Where
Appendix A rejects a construct that the brief counts as author-free (coerce, `.catch`), a
missing element is marked GAP, not BREAKS. Where Appendix A accepts the construct, or has no
row for it, a missing element is BREAKS.

## Findings, most damaging first

### 1. `z.url()` rewrites the value, and nothing in the proposal or Appendix A says so

**B. BREAKS.**

```text
z.url()                        "  https://a.com/x  "     OK   "https://a.com/x"
z.url()                        "https://a.com/x\n"       OK   "https://a.com/x"
z.url({normalize:true})        "HTTPS://A.com/./x/../y"  OK   "https://a.com/y"
z.httpUrl()                    " http://a.com "          OK   "http://a.com"
union([z.url(), z.string()])   " https://a.com "         OK   "https://a.com"
union([z.string(), z.url()])   " https://a.com "         OK   " https://a.com "
```

Source: `$ZodURL` sets `payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed)`.
The check has no `pattern`; it is WHATWG `new URL()` parsing. Appendix A's row for string
formats says the sides agree, and SPEC-P-2 says only defaults and stripping make them differ.
Both statements are false. The proposal reads `z.url()` as a `Format`, which changes nothing.
Rule 4 then merges the two unions above, which produce different values.

**Correction.** Either add a change for the URL rewrite (trim, strip tab and newline, and
WHATWG serialisation under `normalize`), or reject `z.url` and `z.httpUrl` under SPEC-P-2 and
correct Appendix A. Either way, a format must state whether it changes the value.

### 2. The intersection reading is false whenever one side is constrained

**E. BREAKS.** The full table is in section E below. A `.catchall(S)` side applies `S` to
every key outside its own shape, including the keys the other side declares. Zod reconciles
only two kinds of issue across the sides: `unrecognized_keys` and a record's `invalid_key`.

```text
strictObject({a:string}) & object({b:string}).catchall(number)   {"a":"x","b":"y"}   FAIL invalid_type@a
looseObject({a:string})  & object({b:string}).catchall(number)   {"a":"x","b":"y"}   FAIL invalid_type@a
object({a:string}).catchall(number) & object({b:string})         {"a":"x","b":"y"}   FAIL invalid_type@b
```

`rest-of{ over: all[A', B'], keys: P }` puts `a` among the keys `A'` accounts for, so no `P`
touches it. No single `P` states any of the 8 ordered pairs that hold a constrained side.

The production of `all` is not stated. Zod merges the two outputs key by key, and it
**throws** an exception, which is neither acceptance nor refusal, when they differ:

```text
object({a: string.default('x')}) & object({a: string.default('y')})   {}     THROW Unmergable intersection. Error path: ["a"]
tuple([string, number.default(1)]) & tuple([string, number.default(2)])   ["a"]  THROW Unmergable intersection. Error path: [1]
```

**Correction.** Read `z.intersection(A, B)` as
`rest-of{ over: all[Â, B̂], keys: P }`. In it, every closed, open or stripped side is taken
with `rest: unstated`, and every constrained side stands as it is. `P` is closed if every
lifted side is closed, open if any lifted side is open, and stripped otherwise. State that
`all` produces the key-wise merge of what its branches produce. Two `produces` at one place
that differ are a located rejection.

### 3. A check on a wrapper constrains the produced value, and check order matters without `.trim()`

**B. BREAKS.**

```text
z.string().default('abc').check(z.maxLength(2))                       undefined              FAIL too_big
object({f: string.default('abc').check(maxLength(2))})                {}                     FAIL too_big@f
z.tuple([z.string(), z.number().default(5)]).check(z.maxLength(1))    ["a"]                  FAIL too_big
z.string().url().max(15)                                              "   https://a.com   "  OK   "https://a.com"
z.string().max(15).url()                                              "   https://a.com   "  FAIL too_big
z.object({}).check(z.property('a', z.string()))                       {"a":"x"}              FAIL invalid_type@a
```

The proposal reads the first line as
`produces{ of: by-kind{string{length most 2}}, change: default 'abc' }`, which accepts
absence. Zod refuses it. A tuple read as `positions: [string, produces{number, default 5}],
length most 1` accepts `["a"]`; Zod accepts no value at all. `StringPart` is an unordered set
of facts, so the url and max lines would be one value, yet they differ. The last line shows
that a check on an object sees the object after stripping.

**Correction.** Give `produces` an optional shape that the produced value must satisfy
(`then`), so that checks after a change sit on the produced side. A string part needs its
checks in order wherever one of them rewrites the value. The trial's open question about
`.trim()` is already answered by `z.url()`.

### 4. `z.record` with a number key schema has no element, and it renames keys

**A and B. BREAKS** (Appendix A has no row for records).

```text
record(number().int().min(0), string)   {"1.0":"a"}   OK   {"1":"a"}
record(number().int().min(0), string)   {"01":"a"}    OK   {"1":"a"}
record(number().int().min(0), string)   {"1e2":"a"}   FAIL invalid_key@1e2
record(number().multipleOf(2), string)  {"3":"b","4":"a"}  FAIL invalid_key@3
record(literal([1,2]), string)          {"1":"a"}     FAIL invalid_type@2
```

Source: `$ZodRecord` retries a numeric-looking key as `Number(key)` and writes
`payload.value[outKey]`. Keys are strings, so `names: by-kind{number}` refuses every key, and
a synthesised regex loses the shape and the rename.

**Correction.** Add to the object part a key reading of "a numeric string, read as a number,
checked by a shape, written back as that number's text", or reject the construct.

### 5. `z.success(S)` produces `true`, and it has no element

**A and B. BREAKS** (Appendix A has no row; SPEC-P-2's sides clause would reject it).

```text
z.success(z.string())   5     FAIL invalid_type
z.success(z.string())   "a"   OK   true
```

The inner schema runs on the same payload, so a failure is a refusal and the output is never
`false`.

**Correction.** Either a change "replace with `true`", or an Appendix A row that rejects it.

### 6. Rule 4 is too weak as worded, and too strong where it matters

**C. BREAKS.** "Produces exactly what it accepts" is not defined in depth, through references,
for frozen values, or for absent input.

```text
union([looseObject({n: object({})}), looseObject({n: looseObject({})})])   {"n":{"x":1}}   OK {"n":{}}
union([looseObject({n: looseObject({})}), looseObject({n: object({})})])   {"n":{"x":1}}   OK {"n":{"x":1}}
union([strictObject({a}).readonly(), looseObject({a})])                    {"a":"x"}       OK {"a":"x"} (frozen)
union([looseObject({a}), strictObject({a}).readonly()])                    {"a":"x"}       OK {"a":"x"}
object({f: union([string.default('x'), number.default(1)])})               {}              OK {"f":"x"}
object({f: union([number.default(1), string.default('x')])})               {}              OK {"f":1}
```

Read shallowly, the rule merges each pair. The proposal holds `read-only-frozen` as a
meaning, so the frozen pair differs by the proposal's own terms. `z.url()` in a branch
(finding 1) is a fourth case.

The rule is also too strong. It keeps `first` where order cannot matter:

```text
union([object({a}), null])   {"a":"x","z":1}   OK {"a":"x"}   (same for the reverse order, and for object({a}).nullable())
union([K1, K2]) and union([K2, K1]), K1/K2 stripped objects with k: literal('1') / literal('2')   OK {"k":"2","a":"x"} both
```

So `union([A, null])` stays `first` while `A.nullable()` is one `by-kind`: one meaning, two
values.

**Exact condition.** A `z.union` standing at place `p` can be reordered without change if and
only if, for every input `x` and every pair of branches `i < j` that both accept `x`, the two
produce the same value. The input `x` is any JSON value, or absence where `p` is a key or a
tuple tail. "The same value" is compared deeply, including frozenness if frozenness is a
meaning.

**Correction.** Replace rule 4 by two conditions the reader can check. Under (a), no branch
reaches, at any depth or through any reference, a node that changes the value (stripped,
`produces`, the URL rewrite, a numeric-key record, `success`). Under (b), the branches are
pairwise disjoint: by kind, or by one required key with disjoint `values`, with absence
counted. If either holds, the `first` is `some`.

### 7. Zod's numbers are doubles, and `multipleOf` is a tolerance, not an exact multiple

**A, requirement 7. BREAKS.**

```text
number().multipleOf(0.1)   0.30000000000000004   OK
number().multipleOf(0.1)   1.0000000000000002    OK
number()                   JSON.parse('1e400') = Infinity                         FAIL invalid_type
number().max(0.1)          JSON.parse('0.10000000000000000001') = 0.1             OK
number().int()             JSON.parse('1.0000000000000001') = 1                   OK
```

Source: `floatSafeRemainder` accepts when `|ratio − round(ratio)| < 4·EPSILON·max(|ratio|, 1)`.
Read as `multipleOf: Exact` or as exact bounds, the Zod schema and a JSON Schema with the same
digits become one value, although they accept different JSON texts. The proposal also does
not say which decimal a Zod double is read as: the shortest round-trip text, or the exact
binary value.

**Correction.** State, on a number part read from Zod, that the domain is binary64 and that
`multipleOf` is Zod's tolerance test. Keep that fact in the value, not the record, because it
changes what is accepted. Then state the rule that turns a double into an `Exact`.

### 8. `z.property` and `z.properties` checks have no element

**A. BREAKS** (no author function; `$ZodCheckProperty` is listed, `$ZodCheckProperties` is
not).

```text
string().check(property('length', number().multipleOf(2)))   "abc"   FAIL not_multiple_of@length
string().check(property('length', number().multipleOf(2)))   "😀"    OK     (length 2: UTF-16 units)
array(string()).check(property('length', literal(2)))         ["a"]   FAIL
string().check(properties({length: number().max(1)}))         "😀"    FAIL too_big@length
object({a}).check(properties({a: string().min(3)}))            {"a":"xy"}   FAIL too_small@a
```

These checks apply a shape to a host property. A string's `length` here counts UTF-16 units,
while `.min` and `.max` count code points. `StringPart.length` holds only a least and a most.

**Correction.** Reject them with a located rejection, or add a "property of the host value"
node. The first is proportionate.

### 9. `Format` cannot carry what a Zod format means

**A and F. GAP.**

```text
z.email({pattern: /^a$/})            "a"   OK          (def.pattern overrides the default)
z.uuid({pattern: /^x$/})             "x"   OK
z.stringFormat('hex', /^x$/)  def keys [check,type,format,fn,pattern], format "hex"   = z.hex() def keys
z.iban()        "GB82WEST12345698765433"   FAIL   but def.pattern.test(...) = true    (mod-97 beyond the pattern)
z.creditCard()  "4111111111111112"         FAIL   but def.pattern.test(...) = true    (Luhn)
z.ipv6()        "::ffff:1.2.3.4"           OK     but def.pattern.test(...) = false
z.url(), z.jwt()                           def.pattern undefined                       (a procedure)
z.iso.datetime()  "2020-01-01T00:00:00+01:00"   FAIL   (JSON Schema date-time permits it)
```

`Format.name: string` does not say whose vocabulary the name is in. An author's format can
take Zod's name. A pattern override makes the name false. Several formats mean more than
their pattern. `parameters: Json` cannot hold the RegExp parameters (`url` `protocol` and
`hostname`, the `pattern` override).

**Correction.** Make `Format` one of three: a format of a named source vocabulary from its
closed set, with typed parameters; an author-named format with a pattern; or a pattern alone.
The Zod reader holds the def's pattern beside the name whenever the format is defined by its
pattern.

### 10. A template literal's parts are lost, and the regex Zod builds is not its parts

**A. GAP.**

```text
['id-', number()]              /^id--?\d+(?:\.\d+)?$/   "id--1" OK (positive() dropped)   "1e3" FAIL   "Infinity" FAIL
[string().min(2).max(3)]       /^[\s\S]{2,3}$/          "😀😀" FAIL   (bare string().min(2).max(3) accepts it: units vs code points)
[string().regex(/x/i)]         /^x$/                    "X" FAIL      (flag dropped)
[string().startsWith('a').endsWith('b')]   /^.*b$/      "xb" OK       (earlier pattern dropped)
```

The accepted set can be held exactly as a `Pattern`. The parts (needed for the TypeScript
type `` `id-${number}` `` and for the Zod writer) cannot be held, which H2 requires.

**Correction.** Add a string fact holding the parts in order (a literal, or a shape), beside
the computed pattern, and list what Zod drops in the report.

### 11. Canonical rules missing for spellings that are one meaning

**C. GAP.** No rule says that each of these pairs is one value. Each pair was run, and the two
members accept and produce the same.

- **Policies.** `rest: closed` against `constrained{by: none}`, and `open` against
  `constrained{by: every}`. Zod's own def of `strictObject` is `catchall: ZodNever` and of
  `looseObject` is `catchall: ZodUnknown`. JSON Schema's `additionalProperties: {"not": {}}`
  reaches `constrained{none}` through rule 6.
- **Nulls and booleans.** `by-kind{null}` against `values[null]` (`z.null()` has def
  `{type: "null"}`, `z.literal(null)` has def `{type: "literal", values: [null]}`). Likewise
  `by-kind{boolean}` against `values[true, false]`.
- **Values as a set.** `values` has order and duplicates. `some[values[a], values[b]]`
  against `values[a, b]` (`union([literal('a'), literal('b')])` against `enum(['a','b'])`).
- **Number formats.** A number format against whole-plus-bounds: `z.int()` has def
  `{format: "safeint"}`, while `z.number().int().min(-(2**53-1)).max(2**53-1)` and JSON
  Schema state bounds.
- **Where `produces` sits.** `string().default('x').nullable()` against
  `string().nullable().default('x')` (identical on `undefined`, `null` and `"a"`). The first
  is `some[produces…, by-kind{null}]`, which rule 3 cannot reach.
- **Tuples.** `length {least 2}` against `{least 2, most 2}` beside `after: none`. I2 is one
  value only if the reader never writes the redundant `most`.
- **Records.** A regex-keyed record read as `patterns + rest closed` against
  `names + rest constrained`. Section E's record rows show that Zod reconciles a record's
  `invalid_key` across an intersection, so only the first reading is right.
- **Repeated checks.** `min(1).min(3)`, `gt(5).gte(5)`, `multipleOf(2).multipleOf(3)` (Zod
  runs both: 6 OK, 4 FAIL). A `NumberPart` holds one `multipleOf`, so the reader must form
  the least common multiple, by a rule nobody has stated.

**Correction.** Add these as rules 7 onward. "Values is a set of exact JSON values" removes
three of them.

### 12. `keyed` cannot say that an absent discriminator picks a branch

**A. GAP.**

```text
DU('kind', [object({kind: literal('cat').optional(), m}), Dog])   {"m":"x"}   OK            (absent picks the first option)
DU('kind', [O1, O2]), both discriminators optional              {"m":"x"}   FAIL invalid_union@kind
the same with unionFallback: true                               {"m":"x"}   OK  {"m":"x"}   (falls back to first-match)
DU('kind', [object({kind: literal('cat').default('cat'), m}), Dog])   {"m":"x"}   OK {"kind":"cat","m":"x"}
```

`values: Json[]` has no absence. `unionFallback` is `otherwise: first[options]`, which the
proposal can hold. A non-object input is refused (`invalid_type`), and `keyed` does not say
so.

**Correction.** Let an entry of `keyed` list "absent" beside its values. State the refusal of
a non-object, and state `otherwise` for `unionFallback`.

### 13. Whether a field's presence differs by side is derivable, not stated

**B. GAP.**

**The question.** Is "optional in, present out" statable? Only by a derivation the proposal
does not write. A field has one `presence`. The produced presence follows from a
`produces{default|prefault}` at the root of the field's shape, through references. That
fails for `.catch` (no element). It fails for checks after a change (finding 3). It fails for
`.nonoptional()` over a default at a key: there absence is refused and `undefined` is
defaulted.

```text
object({a: string().default('x').nonoptional()})   {}                FAIL invalid_type@a
object({a: string().default('x').nonoptional()})   {"a":undefined}   OK {"a":"x"}
string().default('x').nonoptional()                undefined         OK "x"
```

This also corrects the cases note: D4's "`nonoptional` checks the produced value" holds at
the top level only. The outline's read-only and write-only facts appear nowhere in the field
type.

**Correction.** `presence: { accepted, produced }`, computed by a stated rule, with read-only
and write-only as facts on the field.

### 14. Zod's two kinds of `undefined` are not statable

**B. GAP.**

**The question.** Can the proposal tell an absent key from a key set to `undefined`? No, and
inside the JSON domain it rarely needs to. Four places still matter:

- `optional` and `exactOptional` are one value in JSON. Zod tells them apart only by class
  (their defs are identical: `{type: "optional", innerType}`), so the Zod writer cannot
  restore the class unless the record keeps it.
- `nonoptional` over a default at a key is a required key in JSON, with a default that can
  never apply (finding 13).
- `object({a: z.undefined()})` refuses `{}` and needs the key present as `undefined`, so in
  JSON no value satisfies it. The spec rejects it anyway.
- `record(enum(['a','b']), number().optional())` turns `{}` into
  `{a: undefined, b: undefined}`, which JSON cannot see.

**Correction.** State that Zod's `undefined` is read as absence at a key or a tuple tail, and
as no value elsewhere. Keep the Zod class in the record.

### 15. Names: the parent link, duplicate ids, and shared unnamed objects

**A. GAP.**

```text
N = string().meta({id:'N9', title:'t'});  globalRegistry.get(N.min(2)) = {"title":"t"}   get(N.optional()) = undefined
N.min(2)._zod.parent === N                → true;   for Name = string().meta({id:'Name'}), toJSONSchema writes Name.min(2) as {"minLength":2,"$ref":"#/$defs/Name"}
string().meta({id:'Dup'}) and number().meta({id:'Dup'}) in one schema → toJSONSchema THROW Duplicate schema id "Dup"
object({a: S, b: S}) with S unnamed       → shape.a === shape.b : true
```

The `id` does not follow a check, but the rest of the metadata does (correcting H2, which
says metadata follows). The proposal says nothing of:

- a clone whose parent is named (it should read as `all[reference(N), by-kind{string{least 2}}]`);
- two schemas that share an `id`;
- whether an unnamed object met twice is a definition;
- the `ResourceId` of a Zod module.

`Table: 'schema'` conflates `$defs`, `definitions` and Zod ids, and A11 requires `$defs` and
`definitions` to differ.

**Correction.** Add a reading rule for each of the four, with a located rejection for
duplicate ids. Give the place of a definition the source's own table.

### 16. `.catch(value)` has no change

**A and B. GAP** (Appendix A rejects every `.catch`).

```text
string().min(5).catch('x')                    1          OK "x"
object({a: string().catch('x')})              {}         OK {"a":"x"}
object({a: object({b}).catch({b:1,c:2})})     {"a":5}    OK {"a":{"b":1,"c":2}}   (not validated)
```

`def.catchValue` is a function in both forms. The value form is Zod's `() => value`, so
telling the forms apart needs the SPEC-N-3 technique. If the subset admits the value form,
`Change` needs `{change: 'catch', value}`: every input accepted, and the value produced
without validation when the inner refuses.

### 17. Coercion has no element

**A. GAP** (Appendix A rejects it).

```text
coerce.number()   "0x10" → 16   " " → 0   [] → 0   ["5"] → 5   null → 0   {} FAIL
coerce.string()   {} → "[object Object]"
coerce.boolean()  "false" → true
coerce.number().int()   "1.0" → 1
```

The def is `{type: "number", coerce: true}`, with no author function. The accepted set is
ECMAScript `ToNumber`, `ToString` or `ToBoolean` composed with the inner schema, which no
shape states.

**Correction.** Appendix A should give that as the reason for rejection, not author code.

### 18. `.trim()` cannot be told apart from an author's `.overwrite`

**A. GAP.**

```text
string().trim()                     def {check: "overwrite", tx: (input) => input.trim()}
string().overwrite(s => s.trim())   def {check: "overwrite", tx: s=>s.trim()}
```

Only the function's source text tells the two apart. If the trial admits `.trim()`, the
reader must recognise Zod's own closures by their text.

**Correction.** State that, or keep every `overwrite` outside the subset.

### 19. Enum entry names are lost

**A. GAP.**

```text
z.enum({A:'a', B:'b'})   def.entries {"A":"a","B":"b"}            options ["a","b"]
enum Num {X, Y}          def.entries {"0":"X","1":"Y","X":0,"Y":1}   options [0,1]
```

`values` keeps only the options. The names are what TypeScript and Zod users refer to
(`Schema.enum.A`).

**Correction.** Let `values` carry an optional name for each value, and keep it out of
equality.

### 20. Vocabulary used as structure

**F. LEAK.**

- `Change` names Zod constructs: `prefault` and `read-only-frozen`. It also uses `default`,
  which is JSON Schema's word for a different fact (an annotation, SPEC-P-6).
- `Format.parameters` names are Zod's def field names (`version`, `local`, `offset`,
  `precision`, `protocol`, `hostname`, `normalize`, `alg`, `delimiter`, `prefix`, `suffix`,
  `includes`, `position`).
- `Table` is OpenAPI's list of component kinds.
- `names` is documented as `propertyNames`.

**Correction.** Name the changes by effect: "inserted unvalidated", "inserted, then
validated", "frozen". Type each format's parameters per format.

### 21. Strings where a grammar is defined

**F, requirement 8. LEAK.**

- `Pattern.source` is ECMA-262 Pattern text.
- `Pattern.flags: string[]` should be the closed set `d g i m s u v y`.
- `Format.name` and the format parameter values hold regex sources, offsets and versions.
- `content.encoding` is an open string.

The sticky flag changes meaning (`regex(/a/y)` refuses `"ba"`), so flags are meaning, not
text.

**Correction.** Parse patterns into a regex syntax tree, or state the exception and its
reason. Make flags an enumeration.

### SOUND: tried to break, could not

- Rule 1: `union([X])` and `xor([X])` equal `X` as a field, with `X` defaulted (`{"f":"x"}`)
  and optional (`{}`).
- Rule 2: no Zod reading puts `rest-of` directly over a `by-kind` with an unstated rest
  except the lifted intersection. There it agrees with Zod for closed, open and stripped.
- Rule 3 over a nullable stripped object: `object({a}).nullable()` →
  `by-kind{null, object{a, stripped}}` keeps both sides (`{"a":"x","z":1}` → `{"a":"x"}`).
- Rule 5: `z.literal(0)` accepts `-0` and `z.literal('a')` equals `z.enum(['a'])`. Both
  agree with exact comparison.
- `first` is Zod's union: the source returns the first option with no issues.
- `one` is `z.xor`: two matches FAIL, and one match produces that branch.
- `keyed` is `z.discriminatedUnion`, including nested ones (`{"kind":"cow","c":true}` OK) and
  a discriminator that is an enum or a union of literals.
- String length counts code points in Zod 4.6.7 (`max(1)` accepts `"😀"`, `min(2)` refuses
  it), the same as JSON Schema. The unit should still be written in `StringPart`.
- `z.int()` and `z.number().int()` have the same def; `z.email()` and `z.string().email()`
  are one value; `z.uuid({version:'v4'})` has the same def as `z.uuidv4()`.
- Tuples: an optional tail gives `length least` = the first omittable index
  (`tuple([string.optional(), number])` refuses `[1]`). `.rest` is `after`, and a default
  tail lengthens the output (`["a"]` → `["a",5]`).
- Shapes no value satisfies are carried: `min(5).max(3)` (both issues reported), a field of
  `z.never()`, and `intersection(string, number)`.
- `.brand()` returns the same object (`plain.brand('X') === plain`), so there is nothing to
  hold.
- A getter or `z.lazy` is a reference (`shape.next._zod.def.innerType === Node`).
- C1, C3, C4, D2, I1, I4 and I5 (Zod members) are held as the proposal says.

## A. Coverage of every kind, check and format

### The 40 `def.type` values

| Kinds                                                                                               | Value in the proposal's notation                                                                                                                                                                                | Verdict                                                       |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `any`, `unknown`                                                                                    | `every` (a key of either is required: `object({a: unknown()})` refuses `{}`)                                                                                                                                    | held                                                          |
| `never`                                                                                             | `none`                                                                                                                                                                                                          | held                                                          |
| `null`, `boolean`                                                                                   | `by-kind{null}`, `by-kind{boolean}`                                                                                                                                                                             | held; no rule against `values` (finding 11)                   |
| `string` (no coerce)                                                                                | `by-kind{string{length, patterns, format}}`                                                                                                                                                                     | held, but formats lose (9) and checks are unordered (3)       |
| `number` (no coerce)                                                                                | `by-kind{number{whole, least, most, multipleOf}}`                                                                                                                                                               | holds by stating false exactness (7)                          |
| `literal`, `enum`                                                                                   | `values[…]`                                                                                                                                                                                                     | held; entry names lost (19)                                   |
| `array`                                                                                             | `by-kind{array{positions: [], after: S, length}}`                                                                                                                                                               | held                                                          |
| `tuple`                                                                                             | `by-kind{array{positions, after: rest or none, length least: first omittable index}}`                                                                                                                           | held; the redundant `most` (11)                               |
| `object`                                                                                            | `by-kind{object{fields, rest: closed, open, constrained or stripped}}`                                                                                                                                          | held; `catchall(never)` and `catchall(unknown)` rules (11)    |
| `union`                                                                                             | `z.union` → `first`; `z.xor` → `one`; `z.discriminatedUnion` → `keyed`                                                                                                                                          | held; rule 4 (6), absent discriminator (12)                   |
| `optional` (with `exactOptional`), `nullable`, `nonoptional`                                        | field presence or tuple length; `some[S, by-kind{null}]`; presence required                                                                                                                                     | held by derivation (13, 14)                                   |
| `default`, `prefault`                                                                               | `produces{default}`, `produces{prefault}`                                                                                                                                                                       | held; a check after a change is lost (3)                      |
| `readonly`                                                                                          | `produces{read-only-frozen}`                                                                                                                                                                                    | held; leaks Zod's name (20), rule 4 (6)                       |
| `lazy`                                                                                              | `reference`                                                                                                                                                                                                     | held                                                          |
| `intersection`                                                                                      | `rest-of{all}`                                                                                                                                                                                                  | **false for constrained sides (2)**                           |
| `record`                                                                                            | enum or literal keys: fields plus `rest: closed` (`partial`: optional; `loose`: open); regex or format keys: patterns plus closed (`loose`: open); `record(string, V)`: `constrained{V}`; number keys: **none** | the proposal states no record reading; number keys BREAKS (4) |
| `template_literal`                                                                                  | `by-kind{string{patterns: [the regex Zod builds]}}`                                                                                                                                                             | parts lost (10)                                               |
| `success`                                                                                           | none                                                                                                                                                                                                            | BREAKS (5)                                                    |
| `catch`                                                                                             | none                                                                                                                                                                                                            | GAP (16)                                                      |
| `string`, `number`, `boolean` with `coerce: true`                                                   | none                                                                                                                                                                                                            | GAP (17)                                                      |
| `bigint`, `date`, `map`, `set`, `symbol`, `undefined`, `void`, `nan`, `file`, `promise`, `function` | none                                                                                                                                                                                                            | outside the value domain (SPEC-P-5); consistent               |
| `custom`, `pipe`, `transform`                                                                       | none                                                                                                                                                                                                            | author function; outside                                      |
| `int`                                                                                               | in the def's type union only; `z.int()` has `type: "number"`                                                                                                                                                    | nothing to hold                                               |

The 48 schemas fall into these kinds. The ones that need a word of their own:

- `$ZodBigIntFormat` (`int64`, `uint64`) is outside the value domain. `z.int64()` refuses the
  number 1 and accepts `1n`.
- `$ZodNumberFormat` is the number row (below).
- `$ZodStringFormat` and `$ZodCustomStringFormat` are finding 9.
- `$ZodCodec` and `$ZodPreprocess` are `pipe`.
- `$ZodXor` and `$ZodDiscriminatedUnion` are `union`.
- `$ZodExactOptional` is `optional`.

### The 16 checks

| Check                                                               | Value                                        | Verdict                                               |
| ------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `greater_than`, `less_than`                                         | `Bound{value, inclusive}`                    | held; how a double becomes an `Exact` is unstated (7) |
| `min_length`, `max_length`, `length_equals`                         | `length` (string: code points; array: items) | held, except on a wrapper (3)                         |
| `multiple_of`                                                       | `multipleOf: Exact`                          | false: a tolerance (7); one per part (11)             |
| `number_format`                                                     | whole plus bounds, or `format`               | ambiguous (11)                                        |
| `string_format`                                                     | `Pattern` or `Format`                        | see the formats below                                 |
| `overwrite`                                                         | none                                         | open in the trial (18)                                |
| `property`, `properties`                                            | none                                         | BREAKS (8)                                            |
| `bigint_format`, `min_size`, `max_size`, `size_equals`, `mime_type` | none                                         | Set, File or bigint: outside the domain               |

### The 50 string formats

- **Held exactly as a `Pattern`** (Zod tests the def's pattern):
  - `regex`, with its flags;
  - `starts_with` and `ends_with`, whose patterns are escaped;
  - `lowercase` and `uppercase` (ASCII only: `"É"` passes `lowercase`);
  - `includes` without a position.

  With a position, `includes` runs `String.includes(s, position)`, which counts in UTF-16
  units, while its def pattern is `^.{p,}s`, whose dot excludes newlines. The pattern
  misstates the check.

- **A format defined by its pattern, which every one of them lets the author override**
  (finding 9). There are 38:
  - `base64`, `base64url`, `cuid`, `cuid2`, `ulid`, `xid`, `ksuid`, `nanoid`, `e164`, `emoji`;
  - `guid`, `uuid` (with its version), `email`;
  - `date`, `time` (precision), `datetime` (local, offset, precision), `duration`;
  - `cidrv4`, `ipv4`, `mac` (delimiter), `hex`, `hostname`, `currency_code`;
  - the 15 hash formats (`md5`, `sha1`, `sha256`, `sha384`, `sha512`, each in hex, base64
    and base64url).

  `currency_code` and `cidrv4` were not probed beyond their defs.

- **A format whose meaning goes beyond its pattern** (6), which only a name can hold: `url`
  (which also rewrites the value), `jwt`, `ipv6`, `cidrv6` (not probed), `iban` and
  `credit_card`.

That makes 6 + 38 + 6 = 50.

### The number formats

| Format    | Value                                                       |
| --------- | ----------------------------------------------------------- |
| `safeint` | `whole`, ±9007199254740991                                  |
| `int32`   | `whole`, −2147483648 to 2147483647                          |
| `uint32`  | `whole`, 0 to 4294967295                                    |
| `float32` | ±340282346638528859811704183484516925440, inclusive         |
| `float64` | ±1.7976931348623157e308, so the same values as `z.number()` |

`float32` checks the range only. It accepts `0.1`, accepts `3.4028234663852886e38` and refuses
`3.4028235e38`. The bag is empty in every case, so the reader must supply the bounds. The
bigint formats `int64` and `uint64` are outside the domain.

## B. Constructs whose produced value differs from the accepted value

| Construct                                                                           | Stated by the proposal?                                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `z.object()` stripping                                                              | yes: `stripped`                                                                     |
| `.default(v)`, `.prefault(v)`                                                       | yes: `produces`. A check after the change is lost (3)                               |
| `.readonly()`                                                                       | yes, but frozenness is invisible in JSON, and rule 4 ignores it (6)                 |
| `z.union` order                                                                     | yes: `first`                                                                        |
| `z.xor`, `z.discriminatedUnion`                                                     | by implication: the chosen branch                                                   |
| a tuple's default tail                                                              | by derivation (`["a"]` → `["a",5]`)                                                 |
| an exhaustive record's value default                                                | by derivation if read as fields (`{}` → `{"a":0,"b":0}`)                            |
| `.catchall(S)` where `S` changes values                                             | yes, through `S` (`catchall(object({x}))` strips inside; `catchall(z.url())` trims) |
| `z.url()`, `z.httpUrl()` trim and strip; with `normalize`, the WHATWG serialisation | **no (1)**                                                                          |
| a record with a number key schema renames its keys                                  | **no (4)**                                                                          |
| `z.success`                                                                         | **no (5)**                                                                          |
| `z.intersection` merges outputs, and throws when they differ                        | **no (2)**                                                                          |
| `.catch(value)`                                                                     | no (16)                                                                             |
| `z.coerce.*`                                                                        | no (17)                                                                             |
| `.trim()`, `.toLowerCase()`, `.toUpperCase()`, `.normalize()`                       | open (18)                                                                           |

Three more change only what JavaScript can see, not what JSON can:

- an optional key present as `undefined` stays present as `undefined`;
- an exhaustive record turns an optional value into a present `undefined`;
- the output keeps the order of the shape, not the order of the input.

Grepping `payload.value =` across `schemas.js` and `checks.js` shows no other site in the
subset that changes a value.

## C. Rules 1 to 6

| Rule | Verdict                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | SOUND (run)                                                                                                                                                                                              |
| 2    | SOUND for Zod                                                                                                                                                                                            |
| 3    | SOUND where the inner schema is a `by-kind`. With `nullable` over `produces` it does not apply, so two spellings are two values (11). It also needs `some`'s production stated: the branch that accepts. |
| 4    | BREAKS (6): too weak in depth, for frozenness and for absence; too strong for disjoint branches                                                                                                          |
| 5    | SOUND for one value. It does not reach `by-kind{null}`, nor several values (11)                                                                                                                          |
| 6    | Zod has no boolean schemas. `never` → `none` and `any`/`unknown` → `every` are sound. The missing partners are `closed` ≡ `constrained{none}` and `open` ≡ `constrained{every}` (11)                     |

## D. The cases' Zod members, in the notation

- **A20.**
  - `definitions[Name] = by-kind{string{patterns: []}}`.
  - Root: `by-kind{object{fields: [first required reference(Name), last required reference(Name)], patterns: [], required: [], rest: stripped}}`.
  - Cannot hold: the Zod resource's identity, a clone named through its parent, duplicate ids
    (15).
- **C1.** `rest`: closed, open, `constrained{by: by-kind{number{}}}`, stripped. Held.
- **C3.** `by-kind{object{fields: [a required string], rest: stripped}}`. Held on both sides.
- **C4.** As the proposal writes it, with `P` closed. Held.
- **C5.**
  - `record(enum)`: `object{fields: [a required number, b required number], rest: closed}`.
  - `partialRecord`: the same fields, optional.
  - `looseRecord(regex)`: `object{patterns: [{^x-: number}], rest: open}`.
  - Held by these readings, which the proposal does not state. Number keys cannot be held
    (4).
- **C6.** `first[A, AB]`; `one[A, AB]`;
  `keyed{key: 'kind', of: [{values: ['cat'], shape: Cat}, {values: ['dog'], shape: Dog}]}`.
  Held.
- **D1.** `produces{of: by-kind{string{length least 5}}, change: default 'x'}` and the same
  with `prefault`. The JSON `default` has no slot until the placement of annotations is
  decided. "Optional in, present out" is derived (13).
- **D2.** `first[A, AB]` and `first[AB, A]`, two values. Held.
- **D4.**
  - `trim`, `coerce` and `catch`: no element.
  - `default('x').nonoptional()`: at the top, `produces{default x}`; at a key, a required
    string (13).
  - The tuple:
    `by-kind{array{positions: [string, produces{number, default 5}], after: none, length least 1}}`.
- **E6.**
  - `z.int()`: whole plus bounds, or `format: safeint`. Ambiguous.
  - `z.int64()`: outside the domain.
  - `z.url({protocol})`: the RegExp parameter cannot be held as `Json`, and the rewrite is lost
    (1, 9).
  - `regex(/a/i)`: `Pattern{ecma-262, 'a', ['i']}`. Held.
  - `z.email()` and `z.string().email()`: one value. Held.
- **H2.**
  - The template literal: the pattern only (10).
  - `exactOptional` and `optional`: one value, with the class lost (14).
  - `readonly`: `produces{…, read-only-frozen}`.
  - `Node`: a definition `object{fields: [name required string, next optional reference(Node)], rest: stripped}`. Held.
  - `brand`: nothing.
  - `meta({title})`: `said`, which is open in the trial.
- **I1** (Zod): `by-kind{object{fields: [a optional string], rest: closed}}`. Held.
- **I2** (Zod): `by-kind{array{positions: [string, number], after: none, length {least 2}}}`.
  One value only if `most` is never also written (11).
- **I4** (Zod): `some[by-kind{string}, by-kind{null}]` → `by-kind{null, string}` by rule 3.
  Held, but the proposal never states that `nullable` is read as `some`.
- **I5** (Zod): `values['a']`. Held.

## E. Intersection of `{a: string}` with `{b: string}`, by policy

Each pair was run on `{a, b}`, on `{a, b, c: 1}` and on `{a, b, c: "z"}`; the outputs are as
run.

| A           | B           | `{a, b}`         | extra `c` | `P`      |
| ----------- | ----------- | ---------------- | --------- | -------- |
| closed      | closed      | OK               | refused   | closed   |
| closed      | open        | OK               | kept      | open     |
| closed      | stripped    | OK               | dropped   | stripped |
| open        | open        | OK               | kept      | open     |
| open        | stripped    | OK               | kept      | open     |
| stripped    | stripped    | OK               | dropped   | stripped |
| closed      | constrained | FAIL at `a`      | —         | **none** |
| open        | constrained | FAIL at `a`      | —         | **none** |
| stripped    | constrained | FAIL at `a`      | —         | **none** |
| constrained | constrained | FAIL at `a`, `b` | —         | **none** |

The constrained side's catchall checks the other side's declared keys. With number-valued
keys (`a`, `b`, and the catchall `number`), every pair that holds a constrained side accepts
`{a, b}`. It keeps `c: 3` and refuses `c: "z"` at `c`.

The same reconciliation applies to records:

- `strictObject({a}) & record(regex(/^x-/), string)` accepts `{a, x-c}` (the record's refusal
  of `a` is reconciled) and refuses `d` (`unrecognized_keys[d]`).
- `object({a}) & record(string, string)` refuses `{a, c: 1}` at `c` and keeps `c: "y"`.

Finding 2 gives the reading that matches all of these.

## Counts

- **BREAKS:** 8 (findings 1 to 8).
- **GAP:** 11 (findings 9 to 19).
- **LEAK:** 2 (findings 20 and 21).
- **SOUND:** 14.

## The three changes I would make first

1. **Give every node a stated production, in depth and through references.**
   - `all` merges, and an unmergeable result is a rejection.
   - `some`, `one` and `keyed` produce the branch that accepted.
   - Give `produces` a shape on the produced side, for checks after a change.
   - Order the checks that rewrite.
   - Add the value-changing constructs: the URL rewrite, the renaming of number keys,
     `success`, and `catch` if the subset takes it.

   Rule 4 then becomes a computable condition: no reachable change, or pairwise-disjoint
   branches, with absence counted.

2. **Replace the intersection reading.** Lift only the non-constrained sides. Take `P` from
   the order closed < stripped < open. Leave constrained sides as they stand. Read records as
   fields or patterns with `rest: closed`, so that they can be lifted.
3. **Make numbers and formats say what Zod tests.**
   - A Zod number part carries the binary64 domain and the tolerance of `multipleOf`.
   - A number format is read as whole plus exact bounds.
   - `Format` becomes a closed set per source vocabulary, with typed parameters, an
     author-named variant, and the def's pattern held beside the name.
   - Add rules 7 onward: `values` is a set; `by-kind{null}` ≡ `values[null]`;
     `constrained{none}` ≡ `closed`; `constrained{every}` ≡ `open`.
