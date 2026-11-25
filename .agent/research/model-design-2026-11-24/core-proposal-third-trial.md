# The third trial of a core for the model's structure

> **A proposal on trial, not the design.** The seat's third trial, 25 November 2026,
> written after three readers broke [the second](core-proposal-second-trial.md). Its
> shapes are run as a prototype on the branch `design/model-prototype`
> (`lib/tests-picture/design/`), which stays off main until the owner approves the
> amendment it supports. [What it does with each of the readers' findings](third-trial-dispositions.md)
> is beside it. Readers have not attacked it yet.

## 1. What the model is

`Model = { definitions, entry, record }`.

- **definitions**: everything a document states that has a place: every schema, and every
  boundary part (path item, operation, parameter, response, …). Each has ONE identity.
- **entry**: what the entry document says of the API itself, and which path items it
  publishes at which paths, and which webhooks.
- **record**: beside the meaning, not part of the equality of two meanings.

Two models are one value when `definitions` and `entry` are equal after the canonical
rules of section 5. The record may differ.

## 2. Identity, aliases and edges

```ts
interface DefinitionId { resource: ResourceId; place: Step[] }   // where the thing is, in the model's own terms
type Step =                                                       // closed; never a JSON Pointer token
  | { step: 'named'; in: Kind; name: string }      // a table of named things of one kind
  | { step: 'field'; name: string } | { step: 'pattern-field'; pattern: Pattern }
  | { step: 'position'; index: number } | { step: 'after' } | { step: 'rest' }
  | { step: 'branch'; of: 'all' | 'some' | 'one' | 'first'; index: number }
  | { step: 'test' } | { step: 'then' } | { step: 'otherwise' } | { step: 'negated' }
  | { step: 'path'; template: PathTemplate } | { step: 'operation'; method: Method }
  | { step: 'parameter'; location: Location; name: string }
  | { step: 'response'; key: StatusKey } | { step: 'media'; key: MediaRange } | …;
type Kind = 'shape' | 'path-item' | 'operation' | 'parameter' | 'response' | 'body' | 'header'
  | 'example' | 'link' | 'callback' | 'security-scheme' | 'media' | 'tag' | 'server';
```

- A definition has one `DefinitionId` (where it is) and any number of **aliases**: a
  name a source gave it, an anchor (static or dynamic, kept apart), a resource
  identifier, a Zod registry `id`. All resolve to the one definition. A11's two `x` are
  two definitions because they are in two places; A6's `$defs.a` is one definition with
  an anchor alias; nested `$defs/A/$defs/A` is two definitions.
- **Before any canonical rule runs, the target of every edge is made a definition.** A
  reference into `#/properties/a`, or into a branch of a choice, makes that node a
  definition with its own identity; the node's parent then holds an edge to it. So no
  rule can remove or move the target of a reference.
- A resource has an identifier, a base, a dialect (the set of vocabularies in force), and
  its static and dynamic anchors.

```ts
interface Edge {
  written: Written; // what the source wrote, as data: a URI reference, a bare name, a pointer
  kind: Kind; // what kind of thing the place requires
  target:
    | { state: 'resolved'; to: DefinitionId }
    | { state: 'undeclared' } // a tag with no declaration
    | { state: 'ambiguous'; candidates: DefinitionId[] } // the text leaves it to the implementation
    | { state: 'ignored'; why: Clause }; // the text says it has no effect
  override?: { summary?: string; description?: string }; // an OpenAPI Reference Object
}
```

A shape's reference is `{ kind: 'reference'; edge: Edge }`. A dynamic reference is
`{ kind: 'reference-in-scope'; anchor: DynamicAnchorId; edge: Edge }`, produced only
where the initially resolved target is a dynamic anchor (otherwise it is a plain
`reference`). **The dynamic scope** of an evaluation is the sequence of resources
entered, by following an edge or by descending into a definition that begins a
resource; the reference resolves to the first resource in that sequence, outermost
first, that declares the dynamic anchor.

## 3. A shape

A shape applied to a value at a place **accepts or refuses**, **produces** a value, and
**accounts for** some keys and items. All three are defined for every node.

```ts
type Shape =
  | { kind: 'every' }
  | { kind: 'none' }
  | { kind: 'by-kind'; kinds: ByKind }
  | { kind: 'values'; values: Json[] } // a set: no order, no repeats
  | { kind: 'all'; of: Shape[] } // a set
  | { kind: 'some'; of: Shape[] } // a set
  | { kind: 'one'; of: Shape[] } // a set
  | { kind: 'first'; of: Shape[] } // a sequence: order is meaning
  | { kind: 'keyed'; key: string; of: { values: Json[]; shape: Shape }[]; absent?: Shape }
  | { kind: 'not'; of: Shape }
  | { kind: 'when'; test: Shape; then?: Shape; otherwise?: Shape }
  | { kind: 'reference'; edge: Edge }
  | { kind: 'reference-in-scope'; anchor: DynamicAnchorId; edge: Edge }
  | { kind: 'rest-of'; over: Shape; keys?: RestShape; items?: Shape }
  | { kind: 'absent-becomes'; of: Shape; value: Json; checked: boolean }; // default (false) / prefault (true)

interface ByKind {
  null?: 'any';
  boolean?: 'any';
  number?: 'any' | NumberPart;
  string?: 'any' | StringPart;
  array?: 'any' | ArrayPart;
  object?: 'any' | ObjectPart;
} // an absent kind is refused
interface ObjectPart {
  fields: Map<string, { presence: 'required' | 'optional'; shape: Shape }>;
  patterns: Map<Pattern, Shape>;
  required: Set<string>; // named required, not accounted for here
  names?: Shape;
  rest: RestShape | 'unstated';
  count?: { least?: Count; most?: Count };
}
type RestShape = Shape | 'dropped'; // `none` is closed, `every` is open, a shape constrains,
// 'dropped' accepts any and produces none (stripped)
interface ArrayPart {
  positions: Shape[];
  after: Shape | 'unstated';
  contains?: { shape: Shape; least: Count; most?: Count };
  length?: { least?: Count; most?: Count };
  distinct?: true;
}
```

`Count` is a non-negative whole number held exactly. A `Format` is one of a closed set
of formats with its typed parameters and whether its source asserts it; a pattern is
`{ dialect, source, flags }` with the dialect one of a closed set, because the grammar
a pattern is written in differs by source.

### 3.1 What each node accounts for (unchanged: every row survived attack)

| Node                              | Keys                                                                                    | Items                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `every`, `none`, `values`, `not`  | none                                                                                    | none                                                                                         |
| object part                       | each field present; each key matching a pattern; every key, if `rest` is not `unstated` | none                                                                                         |
| array part                        | none                                                                                    | each position present; every later item if `after` is a shape; each item matching `contains` |
| `all`                             | union of its branches                                                                   | union                                                                                        |
| `some`, `one`                     | union of the branches that accept                                                       | same                                                                                         |
| `first`, `keyed`                  | those of the branch that decided                                                        | same                                                                                         |
| `when`                            | those of `test` if it accepts, plus the branch taken                                    | same                                                                                         |
| `reference`, `reference-in-scope` | those of the target                                                                     | same                                                                                         |
| `rest-of`                         | every key if `keys` is given, else those of `over`                                      | likewise for `items`                                                                         |
| `absent-becomes`                  | those of `of`                                                                           | same                                                                                         |
| a shape that refuses              | none                                                                                    | none                                                                                         |

### 3.2 What each node produces

| Node                                   | Produces                                                                                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `every`, `values`, `not`, scalar parts | the value unchanged                                                                                                                                                                                                      |
| object part                            | each field's produced value; each pattern key's; a rest key's value as its rest shape produces it, or nothing if the rest is `dropped`                                                                                   |
| array part                             | each item as its shape produces it                                                                                                                                                                                       |
| `all`                                  | the merge of what its branches produce: a key any branch drops is dropped only if every branch that accounts for it drops it; where two branches produce different values for one place, the shape accepts no such value |
| `some`, `one`                          | defined only where every accepting branch produces the same value for the value in hand; a reader that cannot show this reads the source's choice as `first` or refuses it                                               |
| `first`, `keyed`                       | what the deciding branch produces                                                                                                                                                                                        |
| `when`                                 | the merge of `test`'s branch as `all` does                                                                                                                                                                               |
| `reference`                            | what the target produces                                                                                                                                                                                                 |
| `rest-of`                              | what `over` produces, with the rest keys as `keys` produces them                                                                                                                                                         |
| `absent-becomes`                       | for an absent value: `value` unchanged if not `checked`, else what `of` produces for `value`; otherwise what `of` produces                                                                                               |

A shape **changes nothing** when no node reachable from it, through any edge, is
`absent-becomes`, a `dropped` rest, or a `first`/`keyed` whose branches differ in this
respect. This is decidable by walking the graph of definitions.

## 4. Castr's profile: an object that states no policy

The specification's writing clause already says closure across composition is
`unevaluatedProperties`. The profile is that keyword's meaning, applied by value:

> **Layer 1** is evaluation as stated, with no supplied closure. It gives, for each place
> in the value, the keys accounted for there by every shape that was applied there and
> accepted (table 3.1; nothing inside a `not` counts).
> **Layer 2** is the profile. At each place where the value is an object and an object
> part **in a describing position** accepted it, a key not accounted for is refused, and
> so the whole value is.

- **Describing position:** the shape of a root, field, pattern key, rest key, position,
  later item, parameter or media type, and everything reached from one through `all`,
  `some`, `one`, `first`, `keyed`, a `when`'s `then`/`otherwise`, a reference, `rest-of`
  or `absent-becomes`. **Test position** (never triggers, at any depth below it):
  `when.test`, `not.of`, `contains.shape`, `names`. A test that accepts still accounts
  for keys (table 3.1), exactly as an `if` does under `unevaluatedProperties`.
- **An object part exists only where the source said something of objects:** it named
  `object` as a kind, or stated a field, pattern, required key, name shape, count or
  rest. `ByKind.object` is otherwise `'any'` (accepted, nothing said, triggers nothing).
  So `{}` and `{"minLength": 3}` accept any object; `{"type": "object"}` accepts only
  `{}` and is reported; `{"required": ["a"]}` alone accepts no object and is reported.
- The supplied closure needs no node and has no place in a schema. Two `allOf` branches
  that each describe `/p` close over the keys of both (F1). `anyOf` of two unstated
  objects accepts a value with the keys of both, as `unevaluatedProperties: false` round
  the `anyOf` would; a Zod union of two strict objects does not, because each states
  closed.
- A stated rest accounts for every key, so layer 2 never refuses there.
- The record lists each definition holding an object part with `rest: 'unstated'`.
- Writers: where every shape applied at a place is reachable from one schema location,
  write `unevaluatedProperties: false` there; otherwise restructure or reject, a row of
  the tables.

## 5. Canonical rules

Applied by the reader after edge targets are made definitions. Each must leave
unchanged, in any enclosing context: what is accepted, what is produced, the keys and
items accounted for at each place, and whether an object part in a describing position
accepted there.

1. `all`, `some`, `one` and `first` of one branch are that branch.
2. `all` inside `all` is flattened; an `every` branch of `all` is dropped; a schema
   object that states only a composition is that composition.
3. `rest-of{keys: R}` over a `by-kind` whose object part has `rest: 'unstated'` is that
   `by-kind` with `rest: R`; over one whose rest is stated, it is that `by-kind`; over
   `every`, it is the `by-kind` accepting every kind whose object part has `rest: R`.
   For `items`, the same only where the array part has no `contains`.
4. `some` over `by-kind` nodes on disjoint kinds, none of which is a definition or
   carries anything said of it, is one `by-kind`.
5. `first` is `some` where its branches are pairwise disjoint (by kind, or by a required
   field with disjoint `values`); or where the shape changes nothing (3.2) and every
   branch that can accept an object states its rest, and likewise for items, so that
   each accepting branch accounts for everything.
6. `values` is a set of exact values. `true` and `{}` are `every`; `false`,
   `not{every}` and `{"not": {}}` are `none`. A `by-kind` whose every kind is `'any'` is
   `every`. A non-object part that constrains nothing is `'any'`. A bound the text gives
   as a default (`minItems: 0`) is absent.

A stated closed rest is **not** made one value with an unstated one: they differ
wherever another shape is composed (B1). Not claimed: that any two schemas accepting the
same values are one value.

## 6. Boundaries

A `path-item` and an `operation` are definitions. `entry.paths` is a map from
`PathTemplate` to an edge to a path item; `entry.webhooks` from a name to an edge.
A **boundary** is derived: for each published path and each operation of the path item
it resolves to, `{ path, method, operation: DefinitionId, pathItem: DefinitionId }`.
One operation definition reached from two paths is two boundaries; a path item with no
operation is a path with none.

- A path item holds its own summary, description, servers, parameters and extensions,
  and its operations by method (`Method` is a token as sent).
- A path template's expressions are bound per boundary, to the parameter in force there
  (the operation's by name and location, else the path item's).
- A callback is a definition holding a map from a URL template (literal parts and
  runtime expressions, in order) to an edge to a path item.

## 7. What the source left unsaid

Four kinds, each held differently:

| Kind                 | Example                                                                                                             | In the value                                                                        | In the record            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| **Constant** default | `required` absent is false; `servers` absent is one server `/`                                                      | the default                                                                         | "unsaid"                 |
| **Chained** default  | `explode` follows `style`, `style` follows the location                                                             | the resolved value                                                                  | "unsaid", and from what  |
| **Derived** default  | an encoding's `contentType` from the property's schema; an XML name                                                 | the derived value, resolved by the reader from the source before any canonical rule | "derived", and from what |
| **Mode**             | an Encoding Object in which any of `style`, `explode`, `allowReserved` is present is serialised by a different rule | which mode: a field of the value                                                    | nothing                  |

## 8. What the specification's own subset excludes, and a conflict in it

SPEC-P-2 admits a Zod construct only if what it produces differs from what it accepts
by an inserted default or a dropped key. By that definition a record with a number key
schema (it renames keys), `z.success`, `.catch`, `z.coerce` and an overwriting check are
outside, and Appendix A's rows are to say so. `.readonly()` freezes, which no JSON value
shows; it is something said of the shape.

**`z.url()` is a conflict between two approved clauses, for the owner:** it trims, so
SPEC-P-2 excludes it, and SPEC-P-8 has Castr write it for `format: uri`. The model can
hold either answer; it does not decide.

## Open questions in this trial

None that the prototype has not run. A Zod intersection is an `all` whose sides reckon
unknown keys together: a side that is an object holds its closed or dropped rest, and a
key no side accounts for is refused unless a side drops it. A side with a catchall keeps
its rest and so checks the other side's keys. The prototype holds this to Zod for all
sixteen pairings of the four policies. `all` produces the key-wise merge of what its
branches produce, as Zod's intersection does.
