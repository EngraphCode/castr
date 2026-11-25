> **A reader's report, not a finding of this repository.** A reader who knows JSON Schema
> attacked a first proposal for the core of the model's structure on 25 November 2026
> and ran Hyperjump on schemas made to tell a wrong rule from a right one. The proposal it read is
> [the second hand trial](core-proposal-second-trial.md), kept beside it. It is kept
> whole, as returned. What the seat checked of it, and what the design took from it, is
> in the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

# Attack on core-v2: the JSON Schema reader (2020-12 and Draft-07)

25 November 2026. The trial attacked is `design/core-v2.md`. The oracle is Hyperjump
`@hyperjump/json-schema` 1.18.1. The texts are the four in `dl-texts/`. Every run is a
script in `design/js-work/` (`a-accounting.mjs`, `b-rules.mjs`, `c-dyn-ident.mjs`,
`c2-recheck.mjs`, `f-profile.mjs`, `g-more.mjs`, on `harness.mjs`), run with node from
`castr/lib`.

Labels:

- **RAN**: the validator's verdict on the schema shown.
- **READ**: a sentence of a text, quoted.
- **REASONED**: the proposal's own table and rules applied by hand.

In section F, the "closed" schemas are my hand application of the profile rule. RAN
covers only the validator's verdict on them.

Notation: `by-kind{…others, X}` is the proposal's own shorthand. It means the five other
kinds are accepted with empty parts.

## Findings, most damaging first

### 1. Rule 2 for items is false where the array part has `contains` (B, BREAKS, RAN)

Rule 2's "Likewise `items` and `after: unstated`" turns
`rest-of{ over: by-kind{array{contains: C}}, items: S }` into
`by-kind{array{after: S, contains: C}}`. That is `unevaluatedItems: S` rewritten as
`items: S`. The two differ: `unevaluatedItems` skips the items `contains` matched, and
`items` does not.

```json
{ "type": "array", "contains": { "type": "string" }, "unevaluatedItems": { "type": "number" } }
```

```json
{ "type": "array", "contains": { "type": "string" }, "items": { "type": "number" } }
```

- Instance `["s", 1]`: the first schema (B12) gives `true`, the second `false`.
- With `prefixItems: [true]`, `contains: string`, and `unevaluatedItems: false` against
  `items: false`, instance `[1, "s"]`: `true` against `false`.

Applied to B12, rule 2 gives a value that refuses `["s", 1]`. The fixture row and the
case both say it is accepted.

Text, 2020-12 core 11.2: "Otherwise, the subschema MUST be applied to any index greater
than the largest annotation value for "prefixItems", which does not appear in any
annotation value for "contains"." And 10.3.1.2 (`items`): "This keyword applies its
subschema to all instance elements at indexes greater than the length of the
"prefixItems" array in the same schema object".

**Correction:** rule 2 for items applies only to an array part with no `contains`.

### 2. The Castr closing rule cannot be placed: closure is per instance location, the rule is per schema location (F, BREAKS, RAN)

"The outermost shape applied at a place a value stands" names a schema location. One
instance location is often reached from several schema locations.

**F1.** Two branches of an `allOf` each name keys of `/p`:

```json
{
  "type": "object",
  "allOf": [
    { "properties": { "p": { "type": "object", "properties": { "a": { "type": "string" } } } } },
    { "properties": { "p": { "type": "object", "properties": { "b": { "type": "string" } } } } }
  ]
}
```

| Reading                                                                       | Instance                          | Result                                 |
| ----------------------------------------------------------------------------- | --------------------------------- | -------------------------------------- |
| Source                                                                        | `{"p":{"a":"x","b":"y"}}`         | `true`                                 |
| Closure at each property's value (`unevaluatedProperties: false` in each `p`) | `{"p":{"a":"x","b":"y"}}`         | `false`: refuses what the author meant |
| "Never on a branch", read as "nothing inside a branch", so the root only      | `{"p":{"a":"x","b":"y","zzz":1}}` | `true`: fails to close `p`             |

The intended meaning needs the two `p` shapes brought under one `all` at `/p`. That is a
restructuring, and neither the model nor JSON Schema can state it as a placement.

The same pattern is OpenAPI's usual `allOf: [{$ref: Pet}, {properties: {owner: {…}}}]`
where `Pet.owner` is also an object.

**F5.** A `then` adds a key at `/p`:

- schema: `properties.p` names `a`, and `then.properties.p` names `b` when `kind` is `x`;
- instance: `{"kind":"x","p":{"a":1,"b":1}}`;
- result: source `true`, closed at each `p` `false`.

**G3.** The root is both "a place a value stands" and "a definition other shapes build
on":

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "child": { "allOf": [{ "$ref": "#" }], "properties": { "extra": true } }
  }
}
```

- Instance `{"name":"r","child":{"name":"c","extra":1}}`.
- Source: `true`. Closure on the root definition: `false`.
- Closure at the entry use, with the root body moved to `$defs/Root` and the entry made
  `{$ref: Root, unevaluatedProperties: false}`: `true`, and it still refuses
  `{"name":"r","zzz":1}`.
- The two clauses of the rule collide. Only reading "the root" as an entry use separate
  from the root definition resolves it, and then the writer must move the root's body,
  which changes its identity.

**F2, F3, F4.** Closure also changes the meaning of a shape that is not an object with
no policy:

| Case | Schema                                                                                                                                              | Instance                   | Source | Closed  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------ | ------- |
| F2   | `properties: {meta: {}}` (closure on `every`)                                                                                                       | `{"meta":{"x":1}}`         | `true` | `false` |
| F3   | `contains: {type: object, properties: {kind: {const: "x"}}, required: ["kind"]}` (closure on a `contains` subschema, which is applied at each item) | `[{"kind":"x","extra":1}]` | `true` | `false` |
| F4   | `properties: {p: {not: {required: ["a"]}}}` (closure on `not`)                                                                                      | `{"p":{"b":1}}`            | `true` | `false` |

**Correction:**

- State the predicate exactly: a shape with an object part whose `rest` is unstated,
  reached by no enclosing `rest-of`.
- Exclude test positions: `contains`, `if`, the inside of `not`, `propertyNames`, and the
  test of a dependent schema.
- Say what happens where several schema locations meet at one instance location (F1,
  F5). This is an owner decision: restructure, or a located rejection.

### 3. A definition's identity collides inside one resource; `Table` is OpenAPI's vocabulary (C/E, BREAKS + LEAK, RAN)

`Place.named{table: 'schema', name}` is keyed by resource. Two different schemas in one
resource get the same `DefinitionId`:

```json
{
  "$defs": { "A": { "type": "string", "$defs": { "A": { "type": "number" } } } },
  "properties": { "x": { "$ref": "#/$defs/A" }, "y": { "$ref": "#/$defs/A/$defs/A" } }
}
```

`{"x":"s","y":1}` gives `true`, `{"y":"s"}` `false`, `{"x":1}` `false`: two targets.
Both are `{named, schema, A}` in the same resource.

- **A11** has the same collision if `definitions` under 2020-12 is read as a named table
  (the proposal does not say how it is read).
- The same happens in OpenAPI 3.1 for `components.schemas.Pet` beside a `$defs.Pet`
  inside any schema of that document.
- `Table` is the list of OpenAPI `components` keys: one format's vocabulary as structure
  (requirement 2).

**Correction:** identify a definition by its place relative to its containing definition
(or by a typed source-location path within its resource), not by a per-resource table.
State that a 2020-12 `definitions` is a distinct place from `$defs`.

### 4. B5: `reference-in-scope{anchor, fallback}` with "resources define anchors" cannot state 8.2.3.2 (C, BREAKS, RAN)

Text, 2020-12 core 8.2.3.2: "If the initially resolved starting point URI includes a
fragment that was created by the "$dynamicAnchor" keyword, the initial URI MUST be
replaced by the URI (including the fragment) for the outermost schema resource in the
dynamic scope (Section 7.1) that defines an identically named fragment with
"$dynamicAnchor". Otherwise, its behavior is identical to "$ref", and no runtime
resolution is needed."

Text, 7.1: "from the perspective of dynamic scope, following a reference is no different
from descending into a subschema present as a value."

**What the proposal cannot state:**

| Run | What it shows                                                                                                                                                                            | Result                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| D1  | An outer resource with a **static** `$anchor: "node"` (closed) wraps a tree whose `$dynamicRef: "#node"` initially targets a `$dynamicAnchor`. The outer static anchor must not capture. | `{"children":[{"extra":1}]}` gives `true` (open) |
| D2  | The bookend. The initial target is a static `$anchor: "node"` and the outer resource has `$dynamicAnchor: "node"`. The reference behaves as `$ref`.                                      | `true`                                           |

- **D1:** the model keeps one kind of anchor, so "the outermost resource that defines
  the anchor" would pick the outer resource and refuse.
- **D2:** the rule needs to know that the initial target is a dynamic anchor. The model
  cannot tell. The reader can decide it on load, but the proposal does not say it does.

**What works when read right:**

| Run | What it shows                                                                                                                                                                                                                                             | Result                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| D4  | `$dynamicRef: "#"` (a pointer fragment) behaves as `$ref`.                                                                                                                                                                                                | `true`                                                                               |
| D3  | The outer resource's dynamic anchor can be a non-root subschema (`$defs/strictNode`); resolution goes to that subschema, not the resource root.                                                                                                           | `{"children":[{"extra":1}]}` gives `false`; `{"extra":1,"children":[]}` gives `true` |
| G1  | `unevaluatedProperties: false` beside a `$dynamicRef`. Through an outer resource whose dynamic target names `base, more`: `{"base":1,"more":1}` gives `true`. Through the fallback, which names `base`: `false`. The table's "those of the target" holds. | as stated                                                                            |
| B5  | Strict tree `false`; the same tree reached directly gives `true`.                                                                                                                                                                                         | as stated                                                                            |

**The dynamic scope is not defined in model terms.** Per 7.1 it includes resources
entered by descent into an inline embedded `$id`, not only by reference edges. The model
does not say where a resource begins in the shape tree.

`anchor` and `fallback` are given separately, so the model can hold an anchor name that
is not the fallback's.

**Correction:**

- Resources carry dynamic anchors apart from static ones.
- The node is `reference-in-scope{ fallback: <id of a dynamic anchor> }`, and the reader
  produces it only when the initial target is a dynamic anchor. Otherwise it produces
  `reference`.
- The dynamic scope is the stack of resources entered from the start of evaluation, by
  reference edges and by inline resource boundaries, which the model must mark.

### 5. Rule 3 merges branches that carry different annotations (A/D, BREAKS, RAN)

```json
{
  "anyOf": [
    { "type": "string", "title": "S" },
    { "type": "null", "title": "N" }
  ]
}
```

Hyperjump's annotation output gives `"s"` → `["S"]` and `null` → `["N"]`. Rule 3 makes
this one `by-kind{string, null}` node. With annotations "on each node as `said`", both
titles land on every accepted value.

Text, 2020-12 core 7.7.1.2: "Schema objects that produce a false assertion result MUST
NOT produce any annotation results, whether from their own keywords or from keywords in
subschemas". Its example: "the title annotation "Integer Value" is discarded because the
type assertion in that schema object fails."

The same holds for `default`, `readOnly`, `writeOnly`, `deprecated` and `examples`
(JT-097 to JT-100, JT-134).

Rule 1 also merges two schema objects that each carry a `title`. `allOf: [{title: inner,
…}]` with `title: outer` gives `["outer","inner"]`. Both apply, but each annotation's
schema location (JT-026) then lives only in the record.

**Correction:** rule 3 applies only where no branch carries an annotation, or annotations
sit on each kind's part.

### 6. Rule 4 contradicts the accounting table (B, BREAKS, REASONED)

The table: `first` accounts for "those of the branch that decided"; `some` for "the union
of the branches that accept".

- Take `A = by-kind{object{a, rest: unstated}}` and `B = by-kind{object{b, rest:
unstated}}`. Each produces exactly what it accepts.
- Under an enclosing `rest-of{keys: closed}`, against `{a: 1, b: 1}`:
  - `first[A, B]` accounts for `{a}` and refuses;
  - `some[A, B]` accounts for `{a, b}` and accepts.
- Rule 4 makes two meanings one value. JSON Schema has no `first`, so nothing here can
  be run.

**Correction:** for the Zod reader to settle. Either `first` accounts as `some`, or rule 4
needs "and no enclosing `rest-of` reads it".

### 7. How one schema object is read is not stated; the I1 and B1 hand values depend on it (C, GAP, REASONED)

The proposal never says how the keywords of one schema object combine. I1 member 3, B1
and A5 reach their stated values only with three rules it does not write down:

1. A keyword group that states nothing contributes no branch. A5's root is `$ref` beside
   `$defs` only; the reading "2020-12: `all[reference, siblings]`" gives
   `all[reference(Node), every]`, and no rule removes `every`.
2. A schema object with only `allOf` is that `all`, with no empty `by-kind` beside it.
   Otherwise I1 member 3 becomes `all[by-kind{all six, empty}, all[X]]`, and rules 1 and
   2 never apply.
3. Nested `all` is flattened. `{allOf: [A, B], properties: {c}}` and
   `{allOf: [A, B, {properties: {c}}]}` are one meaning; flattening is sound under the
   table, since a union of unions is a union.

**Correction:** write the reading of a schema object and these three rules, each checked
against the table.

### 8. A definition with several identities (C, GAP, RAN)

A6's `$defs.a` is both `#/$defs/a` and `#here`.

```json
{
  "$defs": { "a": { "$anchor": "here", "type": "string" } },
  "properties": { "x": { "$ref": "#here" }, "z": { "$ref": "#/$defs/a" } }
}
```

`{"z":1}` gives `false`. One schema, two URIs.

- "Keyed by that identity" (singular) gives two keys, so it is written twice, against
  requirement 5. Or it gives one key with unstated aliases.
- A bundled resource has its `$id` and its `$defs` key. JT-047: the key "is not meant to
  be referred to".

**Correction:** one canonical identity per definition, plus a set of alias identities
(anchors, `$id`, pointer paths) that all resolve to it.

### 9. `inside{of, step: Step[]}` is undefined and fragile (C/E, GAP + LEAK, REASONED)

A21 (`$ref: "#/properties/a"`) needs it.

- If `Step` is a JSON Pointer token (`properties`, `allOf`, `0`), it is format vocabulary.
- If it is a path in the model's shape tree, the canonical rules move the target:
  - rule 1 removes `allOf/0`;
  - rules 2 and 3 merge nodes.

**Correction:** every referenced place becomes a definition at read time. Its source path
is a record fact, never a path into the shape tree.

### 10. One meaning written two ways, two values: missing rules (B, GAP, RAN where marked)

Each pair below is shown equal under the validator in an enclosing context, or follows
from the texts. No stated rule makes them one value:

- **(a)** `{unevaluatedProperties: false}` alone is `rest-of{over: every, keys: closed}`.
  `{additionalProperties: false}` alone is `by-kind{…others, object{rest: closed}}`.
  Equal on `{}`, `{a:1}` and `5`, inside `allOf` with an outer `unevaluatedProperties`
  (RAN).
- **(b)** `rest-of{keys}` over a `by-kind` whose `rest` is already a policy is that
  `by-kind`: B7 with and without the outer `unevaluatedProperties` (RAN, `{z:1}` and
  `{a:1}` both `true`).
- **(c)** `constrained{by: every}` against `open`, and `constrained{by: none}` against
  `closed`: `additionalProperties: {}` against `true` (RAN equal); `{"not":{}}` against
  `false`. Making `rest` a `Shape | 'stripped' | 'unstated'` removes the duplication.
- **(d)** Order. `all.of`, `some.of`, `one.of`, `fields`, `patterns` and `values` are
  lists.
  - Core 4.2.1: "object: An unordered set of properties mapping a string to an instance".
  - 10.2: "subschemas may be applied in any order".
  - So `properties {a, b}` against `{b, a}`, `allOf [A, B]` against `[B, A]`, and
    `enum [1, 2]` against `[2, 1]` are two values each (REASONED).
- **(e)** Text defaults: `minItems: 0` against absent (JT-080) gives `length.least: 0`
  against no `length`.
- **(f)** `every` against `by-kind` with all six kinds and empty parts (`{}` against
  `{"type":[…all six]}`).
- **(g)** `not{every}` against `none`. Rule 6 names only the spelling `{"not": {}}`.

### 11. Counts are JavaScript numbers (D/E, GAP against requirement 7, READ)

These are typed `number`:

- `length.least/most`, `count.least/most`;
- `contains.least/most`.

Validation 6.x: "The value of this keyword MUST be a non-negative integer." Core 4.2.1:
"number: An arbitrary-precision, base-10 decimal number value".

`maxItems: 9007199254740993` reads as `…992`. No instance a machine can hold shows the
difference, so no case fails.

**Correction:** use `Exact` (a non-negative integer) for every count.

### 12. `Pattern` is a string with a grammar, and its mode differs by draft (E, LEAK, READ)

- `source: string` holds an ECMA-262 pattern, which has a grammar (requirement 8).
- `flags: string[]` is not a closed set (requirement 4).
- `dialect: 'ecma-262'` cannot tell the drafts apart:
  - 2020-12 core 6.4: "Regular expressions SHOULD be built with the "u" flag (or
    equivalent) to provide Unicode support", and the reference names the 11th edition.
  - Draft-07 validation 4.3: "These regular expressions SHOULD be valid according to the
    ECMA 262 [ecma262] regular expression dialect", with no edition and no Unicode.
  - So `^.$` against an astral character, and `\p{L}`, can mean different things in the
    two drafts. Hyperjump gives `true` for `^.$` against U+1F600 in both, so it does not
    tell the drafts apart here.

**Correction:**

- Store a parsed pattern, or a typed pattern checked against the grammar.
- Make the flags a closed set.
- The reader sets the Unicode mode per draft.

### 13. Other string leaves, undefined aliases, and vocabulary as structure (E, LEAK, READ)

- **Undefined aliases.** These are never defined:
  - `AnchorName` has two grammars: 2020-12 core 8.2.2 begins with a letter or `_`, with
    no `:`; Draft-07 8.2.3 (JT-106) allows `:`.
  - `ResourceId` should be a URI. It is also not said what it is for a document with no
    `$id`, as in A23.
  - `MediaType`, `Step`, and `Exact`'s representation.
- **Strings with a grammar:**
  - `content.encoding: string` (RFC 2045 token, JT-095 and JT-131);
  - `Method` (RFC 9110 token);
  - an extension's `name` (`^x-`).
- **Six-kind `ByKind`.** It is JSON's data model, and it is also JSON Schema's `type`
  vocabulary.
  - "An absent kind is refused" refuses every value outside the six kinds.
  - JT-008 leaves such a value to each keyword: "most validation keywords always pass or
    always fail". JT-023 (core 7.6.1) says an assertion about one kind passes values of
    the other kinds.
  - So the model fixes `{minLength: 2}` to refuse `undefined`, a `bigint` or a `Date`,
    and cannot hold Zod's `z.int64()` (bigint, E6). E6 is for the Zod reader.
- **`content` as part of `StringPart`.** In 2020-12 it is annotation only (JT-094); it
  should sit with annotations.
- **`Format.asserted: boolean`.** It has no state for Draft-07's "a tool may also check"
  (JT-114, JT-126); Castr's profile decides, and the record says so.
- **Leaves with no grammar.** `Format.name`, field names, `required`, `keyed.key` and
  `Place.named.name` are names with no grammar. These are acceptable.

### 14. Unknown keywords have no place (C, GAP, READ)

- JT-002: in 2020-12 a keyword the tool does not know is collected as an annotation.
  JT-104: in Draft-07 it is ignored.
- I8 says these are not one value.
- A22's `additionalItems` and `dependencies`, and A24's `type` and `maxLength` (under a
  dialect without validation), must be held as unknown-keyword annotations.
- The proposal's extensions are OpenAPI `x-` only.

**Correction:** an `unknown: {name, value: Json}[]` on each node, with the dialect's rule
for it.

### 15. `format` only on numbers and strings (C, GAP, READ)

Validation 7.1: "a format attribute can be specified to apply to any instance types
defined in the data model".

`{"type":"object","format":"x"}` cannot be held. Nor can an unknown format with no
`type`: E5's `int64` is named in no text, so its kinds are not known.

**Correction:** `format` on the shape (or on every kind's part), with its kinds.

### 16. readOnly and writeOnly as "facts on a field" (C, GAP, READ)

In JSON Schema they are annotations of any schema. They can stand at the root, on an
item, or in one `allOf` branch of a field's shape, and they combine "if any is true"
(JT-099 for 2020-12, where the text says "should"; JT-134 for Draft-07, where it says
"must").

A field fact loses all of these except the plain `properties.x.readOnly`.

### 17. The `when` test for a dependent schema is unstated (A, GAP, RAN)

The test must be `by-kind{object{required: [k]}}`: object only, and naming the key with
no field.

- If the test is a field, it accounts for the key. But
  `{dependentSchemas: {card: {properties: {billing: true}}}, unevaluatedProperties:
false}` against `{"card":1,"billing":1}` gives `false`.
- If the test accepts other kinds, `then` applies to them. But
  `{dependentSchemas: {a: {type: string}}}` against `5` gives `true`.
- Text, 10.2.2.4: "evaluated if the instance is an object and contains a certain
  property".

The same applies to `dependentRequired` and Draft-07 `dependencies`. For I3, the
array form and `{required: […]}` must read to the same `then`.

### 18. The profile, C2 and B8 (C, GAP, READ)

- C2 against I8 is conceded in `notes-1.md`.
- Still open: the hand values mix the readings before and after the profile.
  - B8 is shown `rest: unstated`.
  - The profile bullet closes B8's root, and with rule 2 that gives `rest: closed`.
  - C2 is shown after the profile. Its fixture row (`{"a":"s","b":1}` accepted) is the
    source's meaning, which the model's value refuses. The source's meaning then lives
    only in the record.

**Correction:** say which the model holds, and that a fixture is checked against it only
after undoing the profile, using the record.

### 19. Smaller gaps (A/D, GAP)

- **`produces` is missing from the accounting table.** Presumably "those of `of`".
- **Two lower bounds in one schema object.** `minimum` with `exclusiveMinimum` (JT-078)
  must fit one `least`: the reader merges, by a rule it does not state, or splits into
  `all`.
- **A dialect is "a set of vocabularies".** The set loses whether each vocabulary is
  required or optional (JT-001).
- **The undefined rows have no element.** JT-005, 030, 032, 038, 048, 049, 068 and 108
  have none; say each is a located rejection on reading, or a held fact. JT-038 cannot
  be held at all, since two anchors of one name in one resource collide in
  `DefinitionId`. Text, 8.2.2: "The effect of specifying the same fragment name multiple
  times within the same resource, using any combination of "$anchor" and/or
  "$dynamicAnchor", is undefined."
- **The record is per node.** Rule 2 merges `unevaluatedProperties` (one place) into an
  object part built from `properties` (another place), so the record must be per fact.

### Sound (tried to break, could not)

**Accounting table** (RAN; each row gave the text's result):

| Row tested                                                                                 | Run    | Result              |
| ------------------------------------------------------------------------------------------ | ------ | ------------------- |
| A failing `anyOf` branch drops its keys                                                    | A1     | `{a:1,b:1}` `false` |
| `not` and not-not account for nothing                                                      | A2     | as the table says   |
| `if` with `then`; `if` failing with `else`; `if` vacuously passing, so `else` is not taken | A3     | `{b:1}` `false`     |
| `then` without `if` is ignored                                                             | A3     | as the table says   |
| A lone `if` never fails                                                                    | A3     | as the table says   |
| `oneOf`                                                                                    | A4     | as the table says   |
| `contains` with `minContains` 0, 2 and `maxContains` 1, including under `allOf`            | A5     | as the table says   |
| `items` applying to nothing                                                                | A6     | as the table says   |
| Cousins                                                                                    | A7, B9 | as the table says   |
| `$ref` to a schema with `unevaluatedProperties` true or false                              | A8     | as the table says   |
| `additionalProperties` beside `allOf`                                                      | A9     | as the table says   |
| `propertyNames` accounts for nothing                                                       | A10    | as the table says   |
| `required` and `dependentRequired` account for nothing                                     | A11    | as the table says   |
| `const` accounts for nothing                                                               | A13    | as the table says   |
| `additionalProperties` / `items` given `true` or `{}` against absent                       | A14    | as the table says   |
| `$dynamicRef` accounting                                                                   | G1     | as the table says   |

**Claims and rules:**

| Claim or rule                                                           | Label             | What was tried                                                                                                                                                                                     |
| ----------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `additionalProperties` is the object part's own rest                    | REASONED + A9     |                                                                                                                                                                                                    |
| `unevaluatedProperties` is `rest-of` over the rest of its schema object | REASONED + B1–B14 |                                                                                                                                                                                                    |
| Rule 2 for keys                                                         | RAN               | Inside an enclosing `anyOf` with `unevaluatedProperties`, and with patterns, `required`, `propertyNames` and a constrained rest inside `allOf`: equal on every instance tried                      |
| Rule 1                                                                  | RAN               | `allOf`, `anyOf` and `oneOf` of one branch against the unwrapped schema, under `unevaluatedProperties`: equal                                                                                      |
| Rule 3, for acceptance and keys                                         | RAN               | Equal; only annotations break it (finding 5)                                                                                                                                                       |
| Rule 5                                                                  | REASONED          |                                                                                                                                                                                                    |
| Rule 6                                                                  | RAN               | `true` against `{}` as `additionalProperties` and `unevaluatedProperties` values; `false` against `{not:{}}`                                                                                       |
| Cross-dialect                                                           | RAN               | A 2020-12 `unevaluatedProperties` over a `$ref` to a Draft-07 resource with `properties: {a}` accepts `{a:1}`. The text does not say; the proposal's dialect-free accounting agrees with Hyperjump |
| String length                                                           | RAN               | JSON Schema counts code points, and so does Zod 4.6.7: `z.string().min(2)` refuses U+1F600. `StringPart.length` with one unit is right                                                             |

### Caveat on the oracle, for the lead (not a finding against the proposal)

Hyperjump 1.18.1 honours an `$id` beside a Draft-07 `$ref`. It fails the suite's case
"$ref prevents a sibling $id from changing the base uri": `5` gives `false` and `"a"`
gives `true`, the reverse of the suite.

Draft-07 core 8.3: "All other properties in a "$ref" object MUST be ignored." The
proposal's "Draft-07 `$ref`with siblings:`reference` alone" follows the text.

Hyperjump does ignore `definitions` beside a Draft-07 `$ref`: the reference dangles,
which is consistent with the text and with `notes-1.md`. Do not use Hyperjump as the
judge for a Draft-07 `$id` beside `$ref`.

## C. Each JSON Schema case in the proposal's notation

✓ = held exactly; ✗ = not held; ~ = held with a loss named.

| Case | Value                                                                                                                                                                                                          | Held                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A4   | 2020-12: field `name` = `all[reference(Name), by-kind{…others, string{length most 10}}]`; `description` is `said` (open). Draft-07: field `name` = `reference(Name)`                                           | ~ validation ✓; `description` has no settled home                                     |
| A5   | root `reference(Node)`; `Node = by-kind{object{fields:[next optional reference(Node)], rest: unstated}}`                                                                                                       | ~ only under finding 7(1); else `all[reference(Node), every]`                         |
| A6   | `x = reference({root, anchor here})`, `y = reference({other, anchor here})`                                                                                                                                    | ~ `$defs.a` has two identities (finding 8)                                            |
| A11  | two definitions `{root, named schema x}` twice                                                                                                                                                                 | ✗ collision (finding 3)                                                               |
| A21  | `b = reference({root, inside{root, ?}})`, `self = reference({root, root})`                                                                                                                                     | ~ `Step` undefined (finding 9)                                                        |
| A22  | `by-kind{…others, array{positions:[by-kind{string}], after: unstated}}`; `additionalItems`, `dependencies` unknown                                                                                             | ~ validation ✓; unknown keywords not held (finding 14)                                |
| A23  | `x = reference({R0, anchor here})`, `y = reference({R0⊕sub/other.json, anchor here})`                                                                                                                          | ~ `ResourceId` of a document with no `$id` unstated                                   |
| A24  | `by-kind{…all six, object{fields:[a optional every]}}`; `type`, `maxLength` unknown; dialect {core, applicator}                                                                                                | ~ validation ✓; unknown keywords and required/optional flags lost                     |
| B1   | as the proposal                                                                                                                                                                                                | ✓ (under finding 7)                                                                   |
| B2   | as the proposal                                                                                                                                                                                                | ✓                                                                                     |
| B3   | `rest-of{over: all[by-kind{…, object{kind: string}}, when{test: by-kind{…, object{kind required values['a']}}, then: by-kind{…, object{x: string}}, otherwise: by-kind{…, object{y: string}}}], keys: closed}` | ✓ all four rows                                                                       |
| B4   | `rest-of{over: all[by-kind{…, array{[string]}}, by-kind{…, array{[every, number]}}], items: none}`                                                                                                             | ✓ all six rows                                                                        |
| B5   | as the proposal                                                                                                                                                                                                | ✗ static against dynamic anchors, bookend, dynamic scope (finding 4)                  |
| B6   | `rest-of{over: all[by-kind{object{card: string}}, when{test: by-kind{object{required:[card]}}, then: by-kind{…, object{billing required string}}}], keys: closed}`                                             | ✓ if the test is as in finding 17                                                     |
| B7   | `rest-of{over: by-kind{…, object{a optional every, rest: constrained every}}, keys: closed}`                                                                                                                   | ✓; two values for one meaning (finding 10b, 10c)                                      |
| B8   | as the proposal                                                                                                                                                                                                | ✓ before the profile; see finding 18                                                  |
| B9   | doc 0 as the proposal; doc 1 `all[reference(C), by-kind{…, object{b}}]`, `C = by-kind{…, object{a, rest: closed}}`                                                                                             | ✓                                                                                     |
| B10  | `by-kind{object{fields:[id: string], patterns:[^x-: string, y: by-kind{…, string{most 2}}], rest: closed}}`                                                                                                    | ✓ all five rows; pattern is a string (finding 12)                                     |
| B11  | doc 0 `all[by-kind{object{}}, not{by-kind{…, object{required:[a]}}}]`; doc 1 `rest-of{over: not{not{by-kind{…, object{a: every}}}}, keys: closed}`                                                             | ✓                                                                                     |
| B12  | `rest-of{over: by-kind{array{contains:{by-kind{string}, least 1}}}, items: by-kind{number}}`                                                                                                                   | ✗ rule 2 rewrites it to refuse `["s",1]` (finding 1)                                  |
| B13  | as the proposal                                                                                                                                                                                                | ✓                                                                                     |
| B14  | `rest-of{over: one[…a required…, …b required…], keys: closed}`                                                                                                                                                 | ✓                                                                                     |
| C2   | `by-kind{object{a optional string, rest: closed}}`; record: profile                                                                                                                                            | ~ the source meaning (open) only in the record (finding 18)                           |
| D1   | `by-kind{string{length least 5}}`; `default "x"` annotation                                                                                                                                                    | ~ validation ✓; `default` home open                                                   |
| E1   | `by-kind{number{least 0 incl, most 18446744073709551615 incl, multipleOf 0.01}}`                                                                                                                               | ✓                                                                                     |
| E2   | `values[1]` from both                                                                                                                                                                                          | ✓                                                                                     |
| E3   | `by-kind{…, object{fields:[anything required every, nothing optional none]}}`                                                                                                                                  | ✓                                                                                     |
| E4   | `all[by-kind{string}, values[5]]`                                                                                                                                                                              | ✓ (needs finding 7's reading: `const` is its own node)                                |
| E5   | `by-kind{number{whole, format{int64, [], asserted: false}}}`                                                                                                                                                   | ✓; the profile's assertion goes in the record                                         |
| H1   | `by-kind{object{fields:[a optional all[by-kind{string}, values[5]]]}}` + places                                                                                                                                | ✓; per-keyword places needed (finding 19)                                             |
| I1   | each `by-kind{object{a optional string, rest: closed}}`                                                                                                                                                        | ✓ only under finding 7; "not the same" ✓                                              |
| I2   | `by-kind{array{positions:[string, number], after: none, length least 2}}`                                                                                                                                      | ✓                                                                                     |
| I3   | `all[when{a present → required [b]}, when{c present → required [d]}]`                                                                                                                                          | ✓ only if `all` is unordered and both spellings read to one `then` (findings 10d, 17) |
| I4   | `by-kind{string, null}`                                                                                                                                                                                        | ✓ (rule 3); annotation caveat (finding 5)                                             |
| I5   | `values['a']`                                                                                                                                                                                                  | ✓                                                                                     |
| I6   | `every`; `none`                                                                                                                                                                                                | ✓                                                                                     |

## D. Hand-list rows with no element or a doubtful one

All 97 rows marked `holds`, `default` or `undefined` were walked. These are the rows with
no element or a doubtful one:

| Rows                                      | Element  | Problem                                                                |
| ----------------------------------------- | -------- | ---------------------------------------------------------------------- |
| JT-001                                    | dialect  | required or optional per vocabulary lost                               |
| JT-003, JT-051                            | lists    | no order rule (finding 10d)                                            |
| JT-005, 030, 032, 038, 048, 049, 068, 108 | none     | undefined constructs: no stated handling; JT-038 collides (finding 19) |
| JT-007                                    | `Json`   | equality not stated (objects unordered, numbers by value)              |
| JT-008                                    | none     | six-kind `by-kind` refuses non-JSON kinds (finding 13)                 |
| JT-014, JT-043, JT-047                    | doubtful | several URIs per schema (finding 8)                                    |
| JT-018, JT-040                            | doubtful | dynamic scope; dynamic against static anchors (finding 4)              |
| JT-024–028, JT-097–100, JT-134            | doubtful | `said` is open, and rules 1 and 3 merge annotated objects (finding 5)  |
| JT-029, JT-133                            | doubtful | `$defs` and `definitions` collide (finding 3)                          |
| JT-046                                    | doubtful | accounting is dialect-free; Hyperjump agrees, the text is silent       |
| JT-055, JT-084, JT-125                    | doubtful | `when` test unstated (finding 17)                                      |
| JT-064                                    | doubtful | table right, rule 2 wrong (finding 1)                                  |
| JT-071                                    | doubtful | counts as `number` (finding 11)                                        |
| JT-078                                    | doubtful | two lower bounds, one `least`                                          |
| JT-080                                    | doubtful | `least: 0` against absent (finding 10e)                                |
| JT-085                                    | none     | `format` only on number and string (finding 15)                        |
| JT-099, JT-134                            | none     | readOnly and writeOnly as field facts (finding 16)                     |
| JT-114, JT-126                            | doubtful | `asserted: boolean` against Draft-07's "may check"                     |

## Counts

| Severity | Count | Findings                                                 |
| -------- | ----- | -------------------------------------------------------- |
| BREAKS   | 6     | 1–6                                                      |
| GAP      | 11    | 7–11, 14–19                                              |
| LEAK     | 3     | 3 (`Table`, counted under BREAKS), 12, 13                |
| SOUND    | 25    | 16 accounting-table rows and 9 claims or rules, each run |

## The three changes to make first

1. **Restrict the canonical rules and check each against the table, in any enclosing
   `rest-of`.**
   - Rule 2 (items) only without `contains`.
   - Rule 3 only where branches carry no annotations.
   - Rule 4 only where no `rest-of` reads it.
   - Then write the reading of one schema object and the missing equivalence rules
     (findings 7 and 10).
2. **Replace `Place`'s table and step.** Use an identity relative to the containing
   definition, or a typed path within the resource, with a set of alias identities, so
   that nested `$defs`, A11, A6 and A21 hold, each written once.
3. **Give resources dynamic anchors distinct from static ones.** Then:
   - make `reference-in-scope` take only a dynamic anchor's id, produced only when the
     initial target is one;
   - define the dynamic scope over reference edges and inline resource boundaries.

The profile's placement (finding 2) is an owner decision rather than a change. Where
several schema locations meet at one instance location, there is no placement that
keeps the author's meaning.
