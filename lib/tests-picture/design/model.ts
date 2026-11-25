/**
 * A prototype of the model's structure: the types of the third trial.
 *
 * Nothing in `src` reads this. It exists so that the cases of the design can be written
 * as values and run: `evaluate.ts` says what a shape accepts, accounts for and produces,
 * and the tests beside it hold each case to what its source accepts.
 *
 * The half that holds an API's boundaries is not here yet; this is the half that holds
 * shapes, definitions and the edges between them.
 */

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
