> **A proposal that was attacked and did not stand, kept as evidence.** The seat's second
> hand trial of a core for the model's structure, 25 November 2026, as three readers
> read it. Their reports are beside it (`attack-on-core-*.md`). It is not the design:
> the readers broke it in twenty-three places, and the thread record's step log says
> what was taken from it and what changed.

# A candidate core for the model: second hand trial (for attack)

25 November 2026. A proposal on trial, not a decision. Nothing here is in the repository.

## What the model is

`Model = { definitions, boundaries, document, record }`.

- **definitions**: every thing a source names or gives an identity, keyed by that
  identity. A definition holds a shape, or a boundary part (parameter, response, …).
- **boundaries**: the operations, each with its address, identity and slots.
- **document**: what a document says about the API itself.
- **record**: beside the meaning, never part of the equality of two meanings: for each
  node, where it was in its source, and for each fact whether the source stated it, a
  default of the format's text supplied it, or Castr's profile supplied it.

Two models are **one value** when their definitions, boundaries and document are equal
after the canonical rules below. The record may differ.

## A shape

A shape is what a validator does to one value: it accepts or refuses, it produces a
value, and it **accounts for** some of the value's keys (if an object) and items (if an
array). Accounting is what lets a policy for the rest reach across a composition.

```ts
type Shape =
  | { kind: 'every' } // accepts every value
  | { kind: 'none' } // accepts no value
  | { kind: 'by-kind'; kinds: ByKind } // per kind of value: refused, or accepted under a part
  | { kind: 'values'; values: Json[] } // exactly these values (const, enum, literal)
  | { kind: 'all'; of: Shape[] } // every branch accepts
  | { kind: 'some'; of: Shape[] } // at least one accepts; no order
  | { kind: 'one'; of: Shape[] } // exactly one accepts
  | { kind: 'first'; of: Shape[] } // the first that accepts decides what is produced
  | { kind: 'keyed'; key: string; of: { values: Json[]; shape: Shape }[]; otherwise?: Shape }
  // the value of one key picks the branch
  | { kind: 'not'; of: Shape }
  | { kind: 'when'; test: Shape; then?: Shape; otherwise?: Shape }
  | { kind: 'reference'; to: DefinitionId } // an edge; never expanded
  | { kind: 'reference-in-scope'; anchor: AnchorName; fallback: DefinitionId }
  // resolved by the outermost resource in the
  // dynamic scope that defines the anchor
  | { kind: 'rest-of'; over: Shape; keys?: Policy; items?: Shape }
  // constrains the keys / items `over` did not account for
  | { kind: 'produces'; of: Shape; change: Change }; // the two sides differ here

interface ByKind {
  // an absent kind is refused
  null?: {};
  boolean?: {};
  number?: NumberPart;
  string?: StringPart;
  array?: ArrayPart;
  object?: ObjectPart;
}
interface ObjectPart {
  fields: { name: string; presence: 'required' | 'optional'; shape: Shape }[];
  patterns: { pattern: Pattern; shape: Shape }[];
  required: string[]; // named as required, and not accounted for here
  names?: Shape; // every key must satisfy this (propertyNames)
  rest: Policy | { policy: 'unstated' }; // unstated leaves the keys to whatever encloses
  count?: { least?: number; most?: number };
}
type Policy =
  | { policy: 'closed' }
  | { policy: 'open' }
  | { policy: 'constrained'; by: Shape }
  | { policy: 'stripped' };
interface ArrayPart {
  positions: Shape[]; // by index
  after: Shape | 'unstated'; // every item past the positions
  contains?: { shape: Shape; least: number; most?: number };
  length?: { least?: number; most?: number };
  distinct?: true;
}
interface NumberPart {
  whole?: true;
  least?: Bound;
  most?: Bound;
  multipleOf?: Exact;
  format?: Format;
}
interface StringPart {
  length?: { least?: number; most?: number };
  patterns: Pattern[];
  format?: Format;
  content?: { encoding?: string; mediaType?: MediaType; shape?: Shape };
}
interface Bound {
  value: Exact;
  inclusive: boolean;
}
interface Format {
  name: string;
  parameters: { name: string; value: Json }[];
  asserted: boolean;
}
interface Pattern {
  dialect: 'ecma-262';
  source: string;
  flags: string[];
} // unanchored
type Change =
  | { change: 'default'; value: Json } // absent or undefined in: this value out, not validated
  | { change: 'prefault'; value: Json } // absent in: this value is put in, then validated
  | { change: 'read-only-frozen' }; // Zod .readonly(): output frozen
```

`Exact` is a decimal number held exactly. `Json` is a JSON value whose numbers are
`Exact`.

### What each node accounts for

| Node                              | Keys it accounts for                                                                                | Items it accounts for                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `every`, `none`, `values`, `not`  | none                                                                                                | none                                                                                         |
| `by-kind`, object part            | each field name present in the value; each key matching a pattern; every key, if `rest` is a policy | none                                                                                         |
| `by-kind`, array part             | none                                                                                                | each position present; every later item if `after` is a shape; each item matching `contains` |
| `all`                             | the union of its branches                                                                           | the union                                                                                    |
| `some`, `one`                     | the union of the branches that accept                                                               | the same                                                                                     |
| `first`, `keyed`                  | those of the branch that decided                                                                    | the same                                                                                     |
| `when`                            | those of `test` if it accepts, plus those of the branch taken                                       | the same                                                                                     |
| `reference`, `reference-in-scope` | those of the target                                                                                 | the same                                                                                     |
| `rest-of`                         | every key, if `keys` is given; else those of `over`                                                 | every item, if `items` is given; else those of `over`                                        |
| a shape that refuses              | none                                                                                                | none                                                                                         |

### Canonical rules (the reader applies them; the model never holds the left side)

1. A composition (`all`, `some`, `one`, `first`) of one branch is that branch.
2. `rest-of` with `keys` over a `by-kind` whose object part has `rest: unstated` is that
   `by-kind` with the policy as its `rest`. Likewise `items` and `after: unstated`.
3. `some` over `by-kind` nodes that accept disjoint kinds is one `by-kind` node.
4. `first` whose every branch produces exactly what it accepts is `some`.
5. `values` of one value written as `const`, `enum` of one, or a literal are the same
   node; a number is compared as an exact decimal.
6. A boolean schema `true` is `every`; `false` is `none`; `{}` is `every`; `{"not": {}}`
   is `none`.

**What is not claimed:** that any two schemas that accept the same values are one
value. Only the rules above are applied. Deciding equality in general is not feasible.

### How each format's spellings are read (examples)

- JSON Schema `{type: object, properties: {a}, additionalProperties: false}`:
  `by-kind{ object{ fields: [a optional], rest: closed } }`.
- The same with no `type`: every other kind accepted with an empty part, and the object
  part as above.
- `additionalProperties` is always read as the object part's own `rest`.
  `unevaluatedProperties` is `rest-of{ over: <the rest of the schema object>, keys }`,
  then rule 2.
- `required: [b]` with no `properties.b`: `required: ['b']`. With `properties.b`: a
  field with presence `required`.
- `dependentRequired`, `dependentSchemas`, Draft-07 `dependencies`: a `when` whose test
  is "the key is present".
- `if`/`then`/`else`: `when`.
- `oneOf` with an OpenAPI `discriminator`: `one`, with the discriminator held beside it
  as a fact (it never changes what validates). Zod `discriminatedUnion`: `keyed`.
- Zod `z.union`: `first` (then rule 4). `z.xor`: `one`.
- Zod `z.strictObject` / `looseObject` / `.catchall(S)` / `z.object`: object part with
  rest `closed` / `open` / `constrained by S` / `stripped`.
- Zod `z.intersection(A, B)` of objects: `rest-of{ over: all[A', B'], keys: P }` where
  A' and B' have `rest: unstated` and P is the combined policy.
- Zod `.default(v)` / `.prefault(v)`: `produces`. JSON Schema `default`: an annotation.
- Draft-07 `$ref` with siblings: `reference` alone. 2020-12: `all[reference, siblings]`.
- An object with no policy stated, read by Castr's profile (SPEC-P-1): at the outermost
  shape applied at a place a value stands (a property's value, an item, a media type's
  schema, a parameter's schema, the root), `rest-of{over, keys: closed}` is supplied,
  and the record says the profile supplied it. It is never supplied on a definition
  that other shapes build on, nor on a branch of a composition.

### Hand values for the opposing cases

- **I1** (three spellings of closed): each is
  `by-kind{ object{ fields: [a optional string], rest: closed } }`.
- **I1, not the same**: `all[ by-kind{object{a, rest: closed}}, by-kind{…others, object{b, rest: unstated}} ]`.
- **C2** (policy not stated): the same value as I1; record: "rest supplied by the profile".
- **B8**: `by-kind{ null, boolean, number, string, array, object{ fields: [a required] , rest: unstated } }`.
- **B1**: `rest-of{ over: all[ reference(Base), by-kind{…others, object{extra}} ], keys: closed }`;
  `Base` is `by-kind{ object{ id, rest: unstated } }`.
- **B2**: `rest-of{ over: some[ by-kind{…object{a required}}, by-kind{…object{b required}} ], keys: closed }`.
- **B9** first document: `all[ by-kind{…object{a}}, rest-of{ over: every, keys: closed } ]`: refuses `{a}`.
- **B13**: `rest-of{ over: when{ test: by-kind{…object{a: string}} }, keys: closed }`.
- **C4**: `rest-of{ over: all[ by-kind{object{a required, unstated}}, by-kind{object{b required, unstated}} ], keys: closed }`.
- **D2**: `first[A, AB]` and `first[AB, A]`, with A and AB stripped: two values.
- **A4**: 2020-12 `all[ reference(Name), by-kind{…others, string{length most 10}} ]`; Draft-07 `reference(Name)`.
- **B5**: `reference-in-scope{ anchor: 'node', fallback: tree }` inside `tree`; the
  strict tree is a resource that defines the anchor `node` and is
  `rest-of{ over: reference(tree), keys: closed }`.

## Names, identity and references

```ts
interface DefinitionId {
  resource: ResourceId;
  within: Place;
} // never a format's spelling
type Place =
  | { place: 'named'; table: Table; name: string } // components.schemas.Pet, $defs.Pet, a Zod id
  | { place: 'anchor'; name: AnchorName }
  | { place: 'root' }
  | { place: 'inside'; of: DefinitionId; step: Step[] }; // a property's schema, an operation by path and method
type Table =
  | 'schema'
  | 'parameter'
  | 'response'
  | 'request-body'
  | 'header'
  | 'example'
  | 'link'
  | 'callback'
  | 'path-item'
  | 'security-scheme'
  | 'media-type';
```

- A resource has its own identifier, base, dialect (a set of vocabularies) and anchors.
- An edge from a use to a definition carries what the use site may say:
  `{ to, summary?, description? }` for an OpenAPI Reference Object (which override the
  target's); nothing for a schema reference (its siblings are an `all`); for a path item
  reference, the sibling fields with the fact that their effect is undefined.
- Connections a source writes as a bare name are edges too: security requirement to
  scheme (by name, or in 3.2 by URI), operation to tag (a tag may have no declaration),
  tag to parent tag, link to operation (by id or by pointer), discriminator value to
  schema, path template expression to path parameter, `encoding` key to property.

## The other half, in outline

`Boundary { address: { path: PathTemplate; method: Method }, identity?, parameters,
body?, responses, security?: Requirement[][] | 'none', servers?, callbacks, said }`.

- `PathTemplate` is literal parts and expressions in order, each expression an edge to a
  path parameter. `Method` is a token as sent, not one of a fixed list.
- A parameter has a location (path, query, header, cookie, whole query string) and is
  described by a shape with a serialisation, or by one media type.
- A response key is an exact status, one of five ranges, or "every other".
- A body is media types, each a key that is a type or a range, with a shape, an
  optional item shape (3.2), and encodings keyed by edges to properties.
- Security is alternatives, each a set of schemes all required; "none stated here",
  "removed here" and "optional" are three different facts.
- Read-only and write-only are facts on a field that make `presence` differ by
  direction.
- Extensions are held on every node that may carry one, as `{ name, value: Json }`.

## Open in this trial

- Whether `produces` is a wrapper node or a property of the node it wraps.
- Whether checks that overwrite a value (Zod `.trim()`) are in the declarative subset;
  if they are, a string part's checks need an order.
- How annotations (title, description, examples, deprecated) sit: on each node as
  `said`, with an OpenAPI Reference Object's override on the edge.
- The notation the specification will state this in.
