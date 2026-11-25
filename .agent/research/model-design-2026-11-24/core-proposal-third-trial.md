# The third trial of a core for the model's structure

> **A proposal on trial, not the design.** The seat's third trial, 25 November 2026,
> written after three readers broke [the second](core-proposal-second-trial.md). Its
> shapes are run as a prototype on the branch `design/model-prototype`
> (`lib/tests-picture/design/`), which stays off main until the owner approves the
> amendment it supports. **The types in section 3 are that prototype's `model.ts`, copied
> whole; where this text and the prototype differ, the prototype governs.** [What it does with each of the readers' findings](third-trial-dispositions.md)
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

The types are in section 3: `DefinitionId`, `Step`, `ResourceId`, `Edge`, `Definition`,
`Resource`.

- A definition has one `DefinitionId`: the resource it is in, and where in it, as a list
  of steps from a closed set. The steps the prototype has are those the shape half needs;
  the half that holds an API's boundaries adds its own (a path, an operation, a
  parameter, a response, a media type), and they are not in the prototype yet.
- A definition has any number of **aliases**: a name a source gave it, a static anchor, a
  resource identifier, a Zod registry `id`. All resolve to the one definition. A dynamic
  anchor is not an alias: a resource declares it, apart. Nested `$defs/A/$defs/A` is two
  definitions, by two steps; A6's `$defs.a` is one definition with an alias.
- A schema inside data its dialect does not read as a schema (A11's `definitions/x` under
  2020-12, where `definitions` is no keyword) is at a `data` step: the keys and indexes
  that lead to it.
- **Before any canonical rule runs, the target of every edge is made a definition.** A
  reference into `#/properties/a`, or into a branch of a choice, makes that node a
  definition; its own place then holds an edge to it. So no rule can remove or move the
  target of a reference.
- An edge holds what the source wrote and a target that is resolved, undeclared or
  ambiguous. A fourth state, a target the text says to ignore, is owed with the
  boundary half.
- A reference in scope is produced only where the initially resolved target is a dynamic
  anchor; otherwise the reader makes a plain reference. **The dynamic scope** is the
  sequence of resources entered, by following an edge; a schema that begins a resource
  is a definition, so it is always entered by an edge. The reference resolves to the
  first resource in that sequence, outermost first, that declares the anchor, and
  otherwise to its edge's target.

## 3. A shape

A shape applied to a value at a place **accepts or refuses**, **produces** a value, and
**accounts for** some keys and items. All three are defined for every node.

```ts
/** A number held exactly: `coefficient × 10^exponent`, the coefficient not ending in 0. */
export interface Exact {
  readonly coefficient: bigint;
  readonly exponent: number;
}

/** A value a schema states: a JSON value whose numbers are exact. */
export type Constant =
  | { readonly kind: 'null' }
  | { readonly kind: 'boolean'; readonly value: boolean }
  | { readonly kind: 'number'; readonly value: Exact }
  | { readonly kind: 'string'; readonly value: string }
  | { readonly kind: 'array'; readonly items: readonly Constant[] }
  | { readonly kind: 'object'; readonly members: ReadonlyMap<string, Constant> };

/**
 * A regular expression. Its source is text in a grammar this model does not parse: the
 * dialect says which grammar, and the flags are data.
 */
export interface Pattern {
  readonly dialect: 'ecma-262';
  readonly source: string;
  readonly flags: readonly ('i' | 'm' | 's' | 'u' | 'v')[];
}

/** A named format, and whether its source asserts it or only says it. */
interface Format {
  readonly name: 'int32' | 'int64' | 'email' | 'uuid' | 'uri' | 'date-time' | 'date';
  readonly asserted: boolean;
}

export interface Bound {
  readonly value: Exact;
  readonly exclusive: boolean;
}

export interface NumberPart {
  readonly whole?: true;
  readonly least?: Bound;
  readonly most?: Bound;
  readonly multipleOf?: Exact;
  readonly format?: Format;
}

/** Counts are whole numbers, never negative, held as `bigint`. */
export interface StringPart {
  /** biginted in code points. */
  readonly length?: { readonly least?: bigint; readonly most?: bigint };
  readonly patterns?: readonly Pattern[];
  readonly format?: Format;
}

/**
 * What a shape does with a key or an item nothing else accounts for: a shape it must
 * satisfy (`none` closes, `every` opens), or `dropped`, which accepts any and produces none.
 */
export type RestShape = Shape | 'dropped';

export interface Field {
  readonly presence: 'required' | 'optional';
  readonly shape: Shape;
}

export interface ObjectPart {
  readonly fields?: ReadonlyMap<string, Field>;
  readonly patterns?: readonly { readonly pattern: Pattern; readonly shape: Shape }[];
  /** Keys that must be present. Naming a key here does not account for it. */
  readonly required?: ReadonlySet<string>;
  /** A shape every key must satisfy, as a string. A test. */
  readonly names?: Shape;
  readonly rest: RestShape | 'unstated';
  readonly count?: { readonly least?: bigint; readonly most?: bigint };
}

export interface ArrayPart {
  readonly positions?: readonly Shape[];
  readonly after: Shape | 'unstated';
  /** A test: how many items must satisfy the shape. */
  readonly contains?: { readonly shape: Shape; readonly least: bigint; readonly most?: bigint };
  readonly length?: { readonly least?: bigint; readonly most?: bigint };
  readonly distinct?: true;
}

/**
 * What a shape says of each kind of value. A kind that is absent is refused; `any` is
 * accepted with nothing said of it. An object part exists only where the source said
 * something of objects, and that is what Castr's profile reads.
 */
export interface ByKind {
  readonly null?: 'any';
  readonly boolean?: 'any';
  readonly number?: 'any' | NumberPart;
  readonly string?: 'any' | StringPart;
  readonly array?: 'any' | ArrayPart;
  readonly object?: 'any' | ObjectPart;
}

/** Where a definition is, in the model's own terms. */
export type Step =
  | { readonly step: 'named'; readonly name: string }
  | { readonly step: 'field'; readonly name: string }
  | { readonly step: 'position'; readonly index: number }
  | { readonly step: 'after' }
  | { readonly step: 'rest' }
  | { readonly step: 'branch'; readonly index: number }
  | { readonly step: 'test' }
  | { readonly step: 'then' }
  | { readonly step: 'otherwise' }
  | { readonly step: 'negated' }
  /** Inside data its source does not read as a schema, by the keys and indexes that lead there. */
  | { readonly step: 'data'; readonly path: readonly (string | number)[] };

/** A resource: a document, or a part of one that its source gave an identifier of its own. */
export interface ResourceId {
  readonly resource: string;
}

export interface DefinitionId {
  readonly resource: ResourceId;
  readonly place: readonly Step[];
}

/** A reference, as written and as resolved. */
export interface Edge {
  /** What the source wrote. Recorded; resolution does not read it again. */
  readonly written: string;
  readonly target:
    | { readonly state: 'resolved'; readonly to: DefinitionId }
    | { readonly state: 'undeclared' }
    | { readonly state: 'ambiguous'; readonly candidates: readonly DefinitionId[] };
}

/** What a source says about a shape without changing what it accepts. */
interface Said {
  readonly title?: string;
  readonly description?: string;
  readonly default?: Constant;
  readonly deprecated?: true;
  readonly direction?: 'read-only' | 'write-only';
}

export type Shape =
  | { readonly kind: 'every' }
  | { readonly kind: 'none' }
  | { readonly kind: 'by-kind'; readonly kinds: ByKind }
  | { readonly kind: 'values'; readonly values: readonly Constant[] }
  /**
   * Every branch must accept. `unknownKeys: 'together'` is a Zod intersection: a side
   * that is an object does not refuse or drop a key another side accounts for.
   */
  | { readonly kind: 'all'; readonly of: readonly Shape[]; readonly unknownKeys?: 'together' }
  | { readonly kind: 'some'; readonly of: readonly Shape[] }
  | { readonly kind: 'one'; readonly of: readonly Shape[] }
  | { readonly kind: 'first'; readonly of: readonly Shape[] }
  | { readonly kind: 'not'; readonly of: Shape }
  | {
      readonly kind: 'when';
      readonly test: Shape;
      readonly then?: Shape;
      readonly otherwise?: Shape;
    }
  | { readonly kind: 'reference'; readonly edge: Edge }
  | { readonly kind: 'reference-in-scope'; readonly anchor: string; readonly edge: Edge }
  | {
      readonly kind: 'rest-of';
      readonly over: Shape;
      readonly keys?: RestShape;
      readonly items?: Shape;
    }
  /** A default: an absent value becomes `value`, checked against `of` first or not. */
  | {
      readonly kind: 'absent-becomes';
      readonly of: Shape;
      readonly value: Constant;
      readonly checked: boolean;
    }
  | { readonly kind: 'said'; readonly said: Said; readonly of: Shape };

interface Definition {
  readonly id: DefinitionId;
  /** Names its sources gave it; each resolves to this one definition. */
  readonly aliases: readonly string[];
  readonly shape: Shape;
}

export interface Resource {
  readonly id: ResourceId;
  /** Dynamic anchors this resource declares, kept apart from its static names. */
  readonly dynamicAnchors: ReadonlyMap<string, DefinitionId>;
}

export interface Model {
  readonly definitions: readonly Definition[];
  readonly resources: readonly Resource[];
  /** The definition a value is read against. */
  readonly entry: DefinitionId;
}
```

- **A kind that is absent from `ByKind` is refused.** A schema that names no kind is
  read with every kind present: `'any'` for each kind it says nothing of, and a part for
  each it constrains. `'any'` is accepted with nothing said, and triggers nothing.
- **`said`** holds what a source says about a shape without changing what it accepts. It
  can stand on any shape. How two `said` nodes on one value combine (JSON Schema's "if
  any is true" for direction) is owed.
- **`keyed`**, a choice decided by one key's value, is stated in the second trial and is
  not in the prototype: owed.
- A format is one of a closed set with whether its source asserts it; the set in the
  prototype is a sample, and what a Zod format carries beyond its name is owed.

### 3.1 What each node accounts for (unchanged: every row survived attack)

| Node                              | Keys                                                                                    | Items                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `every`, `none`, `values`, `not`  | none                                                                                    | none                                                                                         |
| object part                       | each field present; each key matching a pattern; every key, if `rest` is not `unstated` | none                                                                                         |
| array part                        | none                                                                                    | each position present; every later item if `after` is a shape; each item matching `contains` |
| `all`                             | union of its branches                                                                   | union                                                                                        |
| `some`, `one`                     | union of the branches that accept                                                       | same                                                                                         |
| `first`                           | those of the branch that decided                                                        | same                                                                                         |
| `when`                            | those of `test` if it accepts, plus the branch taken                                    | same                                                                                         |
| `reference`, `reference-in-scope` | those of the target                                                                     | same                                                                                         |
| `rest-of`                         | every key if `keys` is given, else those of `over`                                      | likewise for `items`                                                                         |
| `absent-becomes`                  | those of `of`                                                                           | same                                                                                         |
| a shape that refuses              | none                                                                                    | none                                                                                         |

### 3.2 What each node produces

| Node                                   | Produces                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `every`, `values`, `not`, scalar parts | the value unchanged                                                                                                                                                                                                                                                                       |
| object part                            | each field's produced value; each pattern key's; a rest key's value as its rest shape produces it, or nothing if the rest is `dropped`                                                                                                                                                    |
| array part                             | each item as its shape produces it                                                                                                                                                                                                                                                        |
| `all`                                  | the key-wise merge of what its branches produce, as a Zod intersection merges: an object's keys are the keys of every branch's output, and a key two branches both produce is merged in turn. Where two branches produce different values that are not both objects, no value is accepted |
| `some`, `one`                          | defined only where every accepting branch produces the same value for the value in hand; a reader that cannot show this reads the source's choice as `first` or refuses it                                                                                                                |
| `first`                                | what the deciding branch produces                                                                                                                                                                                                                                                         |
| `when`                                 | what the branch taken produces, or the value unchanged where there is none. What `test` produces is discarded: a test decides, and changes nothing                                                                                                                                        |
| `reference`                            | what the target produces                                                                                                                                                                                                                                                                  |
| `rest-of`                              | what `over` produces, with the rest keys as `keys` produces them                                                                                                                                                                                                                          |
| `absent-becomes`                       | for an absent value: `value` unchanged if not `checked`, else what `of` produces for `value`; otherwise what `of` produces                                                                                                                                                                |

Zod does not refuse an intersection whose sides produce different values at one place:
it throws. The model has no third outcome, so a reader that can see such an
intersection (two different defaults at one key) gives a located rejection on reading,
and the evaluator's refusal is what is left where it cannot.

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
  rest. A schema that names no kind and says nothing of objects has `object: 'any'`
  (accepted, nothing said, triggers nothing); a schema that names kinds and not `object`
  has no `object` at all, and refuses one.
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

## What is open

Most of the trial. [The table of dispositions](third-trial-dispositions.md) says, for
each of the readers' findings, whether the prototype holds it with a test, the trial
only states it, or it is owed; the half that holds boundaries is stated here and is not
in the prototype.

One question the second trial left open is run. A Zod intersection is an `all` whose
sides reckon unknown keys together: a side that is an object holds its closed or dropped
rest, and a key no side accounts for is refused unless a side drops it. A side with a
catchall keeps its rest and so checks the other side's keys. The prototype holds this to
Zod for all sixteen pairings of the four policies.
