> **A reader's report, not a finding of this repository.** A reader who knows JSON Schema
> attacked the draft of
> [the cases the model's design must hold](../../analysis-and-reports/model-design-cases-2026-11-25.md)
> on 25 November 2026 and ran Ajv and Hyperjump and read the four texts. It is kept whole, as returned. The case numbers are
> those of the draft it read; the note has since gained cases and its section I was
> renumbered. What the seat checked of it, and what it changed, is in the note and in
> the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

# Attack on cases.md: the JSON Schema cases

## How this was checked

- Fences were extracted from cases.md by heading, not retyped.
- Every JSON Schema fence is meta-valid, except E2 under Draft-07 (finding 3).

Validators:

- ajv 8.20.0, `ajv/dist/2020` for 2020-12 and the default export for Draft-07.
- ajv 6.15.0, Draft-07 only.
- @hyperjump/json-schema 1.18.1, both 2020-12 and Draft-07.

Where the validators disagree, the text decides. The four drafts were fetched from ietf.org this session into `js-work/texts/`.

Raw output, one file per script, is in `<scratchpad>/attack/js-work/out/`, under the scratchpad named in the brief:

- `b`, `b5`, `b5h`, `a`, `i`, `ce`, `m`, `z`, `extra` and `vocab`, each `.txt`.
- Scripts are in `js-work/*.mjs`, with the shared harness in `h.mjs`.

Rows read `ajv=` for ajv 8, `ajv6=` for ajv 6 and `hj=` for hyperjump.

Evidence tags:

- **RAN**: checked by running a validator.
- **READ**: checked against the text this session.
- **MEM**: from memory.
- **REASONED**: derived from a quoted sentence, not run.

## Findings

### 1. C2 against B1 (and, conditionally, B2 and B6): WRONG, the cases contradict each other

**Tags:** RAN, READ.

SPEC-P-1 states the closed reading as a profile decision: "An object that does not state its policy is read as **closed**. This applies to every document Castr reads". It also admits that this "narrows the source's accepted set". So C2 is not arguing with the text.

RAN shows the source itself is open:

```text
C2 @2020 / @07 inst={"a":"s","b":1} ajv=pass | ajv6=pass | hj=pass
```

**The contradiction.** Neither C2 nor SPEC-P-1 says which schema object counts as "an object".

- B1's `Base` has `type: object` and states no policy, so the rule closes it. Yet B1 says Base "is not itself closed" and that `{id, extra}` passes.
- RAN, out/m.txt:

  ```text
  B1 w/ Base closed inst={"id":"x","extra":"y"} expect=note:pass ajv=FAIL( additionalProperties:extra) | hj=FAIL()
  ```

- Conditional, because these branches have no `type: object`:

  ```text
  B2 w/ branches closed inst={"a":"x","b":"y"} ajv=FAIL(... anyOf ...) | hj=FAIL(# anyOf)
  B6 w/ dependent closed inst={"card":"c","billing":"b"} ajv=FAIL(...) | hj=FAIL()
  ```

- I1 is not affected. Closing its single `allOf` branch leaves every row unchanged (out/extra.txt).

**Correction:**

- C2, and through it SPEC-P-1 and SPEC-G-4's closing transformation, must say where the supplied closure lands.
- SPEC-P-1's Writing bullet points to the composed object, written with `unevaluatedProperties` across composition. The closure must never land on an in-place branch or on a `$ref` target.
- The model holds "open, because nothing is stated" as the source's meaning. It holds the supplied closure as a separate, reported fact on that composed location.
- Otherwise B1 cannot be held.

### 2. B4: OVERCLAIM

**Tags:** RAN, READ.

"A tuple of two, closed" says more than the schema does. RAN, out/b.txt:

```text
inst=[] ajv=pass | hj=pass
inst=["s"] ajv=pass | hj=pass
inst="notarray" ajv=pass | hj=pass
inst=["s",1,2] ajv=FAIL( unevaluatedItems) | hj=FAIL()
```

2020-12 core §10.3.1.1: "This keyword does not constrain the length of the array." The claim also contradicts the note's own I2.

**Correction:** "At most two items: a string first, then a number second where present. A value that is not an array passes, because there is no `type`."

### 3. E2: INVALID-DOCUMENT under Draft-07

**Tags:** RAN, READ.

The fence has no `$schema`. RAN, out/ce.txt:

```text
E2 0 07 META-INVALID ["/enum must NOT have duplicate items (items ## 1 and 2 are identical)"]
E2 0 2020 meta-valid
```

READ: both the ajv copy and the hyperjump copy of the Draft-07 meta-schema say `"enum": {"type":"array","items":true,"minItems":1,"uniqueItems":true}`.

Validation §6.1.2, in both drafts: "Elements in the array SHOULD be unique."

**Correction:** pin the fence to 2020-12 and say that it breaks a SHOULD. Or show the merge without duplicates, for example `{"const": 1.0}` against `{"enum": [1]}`.

### 4. A5: OVERCLAIM

**Tags:** RAN, READ.

The fence has no `$schema`, so what it means depends on the dialect.

- 2020-12 core §8.1.1: "If absent from the document root schema, the resulting behavior is implementation-defined."
- Under Draft-07 the root is a `$ref` object. Draft-07 core §8.3: "All other properties in a "$ref" object MUST be ignored."
- The target `#/$defs/Node` therefore lies inside an ignored sibling, which is also an unknown keyword.

RAN, out/a.txt:

```text
A5-07 inst={"next":{"next":{}}} ajv=pass | ajv6=pass | hj=ERROR Value at '/$defs' is undefined and does not have property 'Node'
```

The case also cites the wrong text. "The OpenAPI text says references may form a cycle" is the OpenAPI document, but this is a JSON Schema fence. The JSON Schema rule is core §9.4.1: "A schema MUST NOT be run into an infinite loop against an instance." A5 recurses through `properties.next`, so each step consumes part of the instance and the loop is legal.

**Correction:** add `$schema` for 2020-12, and cite §9.4.1.

### 5. E5: OVERCLAIM

**Tags:** READ.

"Tests: SPEC-P-3, `format` asserts" is the project's rule, not the texts' rule.

- 2020-12 validation §7.2.1: format "MUST be collected as an annotation". Asserting is optional, and "MUST be disabled by default".
- `int64` appears in none of the four texts; grep finds it 0 times in each.
- §7.2.3: "When the Format-Assertion vocabulary is specified, implementations MUST fail upon encountering unknown formats."

**Correction:**

- The model also holds which vocabulary the source dialect gives `format`: annotation or assertion.
- `int64` is a format JSON Schema does not know. Under the 2020-12 assertion vocabulary, the text says such a format makes validation fail.

### 6. B5: OVERCLAIM, minor

**Tags:** RAN, READ.

The behaviour holds. Entered at strict-tree (out/b5.txt):

```text
inst={"children":[{"extra":1}]} ajv=FAIL(/children/0 unevaluatedProperties:extra) | hj=FAIL()
```

The same failure happens two levels deep, and `{"children":[{"children":[]}]}` passes.

Entered at `tree` directly, or through an outer schema with no dynamic anchor, every row passes:

- ajv `getSchema` (out/b5.txt) gives `tree-direct=pass via-outer=pass` for all four instances.
- hyperjump will not enter an embedded resource by its URI, so `tree` was registered as its own resource (out/b5h.txt):

  ```text
  {"children":[{"extra":1}]} tree-direct= true via-outer= true strict-tree= false
  ```

But the fence is not "the worked example":

- Appendix C uses two separate documents, and its tree has `"data": true`.
- The fence embeds `tree` with the relative `$id: "tree"` and drops `data`.
- The rule itself is §8.2.3.2: resolve to "the outermost schema resource in the dynamic scope (Section 7.1) that defines an identically named fragment with "$dynamicAnchor"".

**Correction:** say "adapted from Appendix C", and cite §8.2.3.2.

### 7. I6, the unknown-keyword pair: OVERCLAIM

**Tags:** READ.

Both behaviours are SHOULDs, not MUSTs.

- 2020-12 core §4.3.1: "Unknown keywords SHOULD be treated as annotations, where the value of the keyword is the value of the annotation."
- Draft-07 core §4.3.1: "Unknown keywords SHOULD be ignored."

The two differ only in the annotations produced, never in which values are accepted (REASONED).

**Correction:** say SHOULD in both, and say the difference is only in annotations.

### 8. I1: OVERCLAIM, minor

**Tags:** RAN, REASONED.

The equivalence holds. RAN, out/i.txt: 10 instances against the 3 spellings give the same pass or fail everywhere.

- `{a:"s",b:1}` gives `ajv=FAIL( additionalProperties:b)` for the plain spelling and `ajv=FAIL( unevaluatedProperties:b)` for the composed one, with `hj=FAIL()` for both.
- `5`, `[]` and `null` fail all three spellings.

The reason the note gives is wrong. It says the equivalence holds "because its composition has one branch that every value takes".

- An `allOf` of one branch is simply that branch.
- The equivalence holds because, for every value that passes, the evaluated names are the fixed set `{a}`.
- That is REASONED from §11.3. I did not dump the annotations.

"Not the same value" is a real difference, but it is overstated. RAN, out/m.txt, with `allOf:[{type:object,properties:{a},additionalProperties:false},{properties:{b}}]`:

- It accepts `{}` and `{a:"s"}`.
- It rejects `{b:1}` and `{a:"s",b:1}`, with `additionalProperties:b`.

So the schema can be satisfied; it only forbids the other branch's keys. It accepts nothing only when the other branch requires one of them. RAN with `required:["b"]`: every object fails.

**Correction:** reword both sentences to match these results.

### 9. A11: OVERCLAIM, minor

**Tags:** RAN, READ.

The two are distinct targets. RAN, out/a.txt: `{"a":1}` fails with `/a type`, and `{"b":"s"}` fails with `/b type`.

"The text says to treat it as `$defs`" overstates the text.

- Validation Appendix A: "implementations SHOULD assume that "$defs" and "definitions" have the same behavior when that meta-schema is used."
- If that SHOULD is not followed, `definitions` is an unknown keyword.
- A reference target under an unknown keyword is covered by core §9.4.2: it "cannot be reliably implemented, and the resulting behavior is undefined."

**Correction:** say it is a SHOULD, that it applies only under the default meta-schema, and that otherwise the behaviour is undefined.

### 10. E1: OVERCLAIM, minor

**Tags:** RAN, READ.

The precision claims hold.

- `JSON.parse("18446744073709551615") === 2**64` is `true` (out/ce.txt).
- So hyperjump passes 2^64 against a maximum of 2^64−1: `E1 inst(JS)=18446744073709552000 ... hj=pass`.
- Validation §4.2: instances "can be arbitrarily large … regardless of the ability of the underlying programming language".

But the case uses the wrong type to show the divisor.

- With `type: "integer"`, `multipleOf: 0.01` rejects no instance by the text, since every integer is a multiple of 0.01.
- ajv's floating-point division still fails 2^64 on `multipleOf`: `ajv=FAIL( multipleOf)`, in ajv 6 as well.
- ajv also fails `0.07` against `{type:number, multipleOf:0.01}`. That contradicts §6.2.1: "A numeric instance is valid only if division by this keyword's value results in an integer."

**Correction:** use `type: "number"`, so the divisor changes which values are accepted.

## Claims confirmed as stated

- **A4 (RAN, READ).**
  - 2020-12 applies `maxLength` beside `$ref`: `inst={"name":"xxxxxxxxxxxx"} ajv=FAIL(/name maxLength) | hj=FAIL(#/name maxLength)`. Core §8.2.3.1: "other keywords can appear alongside of "$ref"".
  - Draft-07 ignores it, per §8.3: `A4-07 inst={"name":"xxxxxxxxxxxx"} ajv=FAIL(/name maxLength) | ajv6=pass | hj=pass`.
  - **ajv 8 deviates here.** It prints "$ref: keywords ignored" and then applies `maxLength` anyway.
- **A6 (RAN).** `{"x":1}` fails with `/x type`, and `{"y":"s"}` fails with `/y type`.
- **B1 to B7 (RAN, out/b.txt):**
  - **B1:** `{id,extra}` passes; `{id,z}` fails with `unevaluatedProperties:z`.
  - **B2:** `{a}`, `{b}` and `{a,b}` pass, and `{a,c}` fails. `{a:"x",b:5}` fails with `unevaluatedProperties:b`, because a failed branch's annotations are dropped. `5` passes, because there is no `type`.
  - **B3:** `{kind:"a",y}` and `{kind:"b",x}` fail. With `kind` absent, `{y}` passes and `{x}` fails.
  - **B6:** `{billing}` on its own fails with `unevaluatedProperties:billing`, and `{card}` on its own fails with `required`.
  - **B7:** `{z:1}` passes. Without `additionalProperties:{}`, `{a,b}` fails with `unevaluatedProperties:b`.
- **D1, E3, E4, H1 (RAN under both drafts, out/ce.txt and out/extra.txt):**
  - **D1's JSON fence:** `"x"` fails `minLength` under both drafts, so `default` changes nothing. §9.2 says only that it can "supply a default JSON value associated with a particular schema".
  - **D1 nit:** the fence breaks "It is RECOMMENDED that a default value be valid against the associated schema."
  - **E3 and E4:** behave as the note says under both drafts.
  - **H1:** `{}` and `{b:1}` pass under both drafts, so only `/properties/a` can never be satisfied.
- **I2 (RAN, READ).**
  - Neither draft sets a lower bound on length: `[]` and `["s"]` pass both fences, and `["s",1,2]` fails both.
  - Draft-07 §6.4.1: "against the schema at the same position, if any".
- **I3 (RAN).** The results match on 8 instances: `{a}` fails (`dependencies` / `dependentRequired`), `{c}` fails (`required`), and `5` passes.
- **I4 and I5 (RAN, READ).**
  - The results match under both drafts on every instance.
  - I5: 2020-12 §6.1.3 says "Use of this keyword is functionally equivalent to an "enum" … with a single value". Draft-07 has no such sentence, but behaves the same.
- **I6 pairs (RAN).**
  - **`oneOf` against `anyOf`:** real. B2 written as `oneOf` rejects `{a,b}` (out/z.txt).
  - **Absent against `{}`:** real (B7).
  - **A1 against the same schema written inline:** real. "Accept the same values" is true of this example but not in general. Core §B.2: "Reference removal is not always safe".

**Do not use ajv 8 as the oracle.** It departs from the text in:

- A4 under Draft-07.
- Missing cases 6, 7, 9 and 10.
- Decimal `multipleOf`.

Hyperjump followed the text in every case I checked.

## Missing cases, most damaging first

Each one gives its row in `json-schema-text-constructs.json`, or says there is none.

1. **An assertion does not imply a type.**
   - `{"properties":{"a":{"type":"string"}},"required":["a"]}` accepts `5`, `"x"`, `[]` and `null` (RAN, `noType` rows).
   - B2, B4, B7, E3 and I3 all omit `type`, yet the note's Holds lines read them as objects or tuples.
   - Core §7.6.1: "the instance is considered to conform to the assertion."
   - _Fixture §7.6.1._
2. **`unevaluated*` does not see cousins or the referrer.**
   - `{"allOf":[{"properties":{"a":true}},{"unevaluatedProperties":false}]}` rejects `{a:1}` (RAN, `cousin inst={"a":1} ajv=FAIL | hj=FAIL()`).
   - `{"$ref":"#/$defs/C","properties":{"b":true},"$defs":{"C":{"properties":{"a":true},"unevaluatedProperties":false}}}` rejects `{a,b}` (RAN).
   - B1 shows only a parent seeing its children.
   - _Fixture §11._
3. **`patternProperties` with `additionalProperties: false`.** No case has it.
   - Schema: `{"type":"object","properties":{"id":{"type":"string"}},"patternProperties":{"^x-":{"type":"string"},"y":{"maxLength":2}},"additionalProperties":false}`.
   - RAN: `"x-y":"sss"` must satisfy both patterns and fails `maxLength`. `"ax-"` is rejected. `"xy"` is allowed.
   - A closure written as a list of key names cannot hold this.
   - _Fixture §10.3.2.2._
4. **`not`.** No case has it.
   - `{"type":"object","not":{"required":["a"]}}` forbids a key (RAN).
   - `{"not":{"not":{"properties":{"a":true}}},"unevaluatedProperties":false}` rejects `{a:1}`, because annotations under `not` are dropped (RAN; core §7.7.1.2).
   - _Fixture §10.2.1.4._
5. **A `$ref` to a place that has no name.**
   - `{"properties":{"a":{"type":"string","maxLength":2},"b":{"$ref":"#/properties/a"},"self":{"$ref":"#"}}}` (RAN on both validators).
   - Every A case points at a named definition.
   - Core §8.2.3.1: the reference "produces the URI of the schema to apply".
   - _Fixture §5 and §9.2 cover pointer fragments; no row names a target that has no name._
6. **Keywords of the wrong draft in a 2020-12 document.**
   - `additionalItems:false` beside `prefixItems` is ignored: `["s",1,2]` passes on both validators (RAN).
   - `dependencies:{a:["b"]}` is only an annotation: hyperjump passes `{a:1}`, while ajv fails it (an ajv deviation).
   - The array form of `items` is meta-invalid (RAN).
   - A reader that maps keywords by name changes the meaning.
   - _Fixture: validation Appendix A; core §4.3.1, §6.5 and §8.1.2._
7. **A resource embedded in another dialect.**
   - A `$defs` entry with a Draft-07 `$schema` and its own `$id`, holding `{"$ref":"#/definitions/s","maxLength":1}`.
   - RAN, out/z.txt: `inst={"n":{"v":"abc"}} ajv=FAIL(/n/v maxLength) | hj=pass`. Hyperjump applies Draft-07 §8.3.
   - Core §8.1.1: `$schema` "MAY be used in the root schema objects of embedded schema resources".
   - A4 assumes one dialect per document.
   - _Fixture §9.3, §9.3.2 and §9.3.3._
8. **A dialect that drops a vocabulary.**
   - A meta-schema whose `$vocabulary` lists only core and applicator, used by `{"type":"string","properties":{"a":{"maxLength":1}}}`.
   - RAN, out/vocab.txt, hyperjump: `5`, `"x"` and `{"a":"long"}` all pass.
   - Core §8.1.2: "Together, this information forms a dialect."
   - _Fixture §3, §4.3.3 and §8.1.2._
9. **`contains` with `unevaluatedItems`.**
   - `{"type":"array","contains":{"type":"string"},"unevaluatedItems":{"type":"number"}}`.
   - RAN: `inst=["s",true] ajv=pass | hj=FAIL(#/1 type)`. ajv deviates.
   - §11.2: `unevaluatedItems` applies to "any index … which does not appear in any annotation value for "contains"".
   - I2's "positions and a shape for the rest" cannot hold this.
   - Add `minContains` and `maxContains` (RAN).
   - _Fixture §11.2, §6.4.4 and §6.4.5._
10. **A lone `if` feeds evaluation.**
    - `{"if":{"properties":{"a":{"type":"string"}}},"unevaluatedProperties":false}`.
    - RAN: `inst={"a":"s"} ajv=FAIL | hj=pass`, and `inst={"a":1} ajv=FAIL | hj=FAIL()`. ajv deviates.
    - §10.2.2.1: annotations are collected "including when the keyword is present without either "then" or "else"".
    - _No fixture row._ The §10.2.2 rows say only that `then` and `else` are ignored without `if`.
11. **Draft-07 anchors and base URIs made by `$id`.**
    - `definitions:{a:{"$id":"#here",type:string}, b:{"$id":"sub/other.json", definitions:{c:{"$id":"#here",type:number}}}}`, with `$ref:"#here"` and `$ref:"sub/other.json#here"`.
    - These are two different targets (RAN on ajv 8, ajv 6 and hyperjump).
    - Draft-07 core §8.2.3. A6 covers only 2020-12's `$anchor`.
    - _Fixture Draft-07 §5, §8.2 and §8.2.1._
12. **Section I lacks an equivalence set for boolean schemas:** `true` with `{}`, and `false` with `{"not":{}}`.
    - 2020-12 core §4.3.2: "true: Always passes validation, as if the empty schema {}".
    - RAN: `additionalProperties:true` and `additionalProperties:{}` behave the same beside `unevaluatedProperties`.
    - _Fixture §4.3._

**Left out to stay at 12:**

- `propertyNames` (RAN; fixture §10.3.2.4).
- Several values of one annotation at one location, such as `readOnly` or `deprecated` from two schemas joined by OR. Not run; fixture §7.7 and §10.2.1, validation §9.3 and §9.4.

**Count:** WRONG 1, OVERCLAIM 8, INVALID-DOCUMENT 1, MISSING-CASE 12.
