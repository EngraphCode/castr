/**
 * What the prototype does with each kind of construct a format has: the coverage map.
 *
 * Each kind has one entry. An entry names the elements of the prototype that hold the
 * kind, or says the kind decides how a document is read and is held nowhere, or cites the
 * clause of the specification that puts it outside the model, or says plainly that it is
 * owed. `coverage.e2e.test.ts` recomputes the lists of kinds and fails on a kind with no
 * entry, an entry for a kind that is gone, and an entry naming an element the prototype
 * does not have.
 *
 * So far: the keywords and the type values of JSON Schema Draft 2020-12 and Draft-07, the
 * four names the 2020-12 dialect constrains outside its vocabularies, and Zod's schema
 * definitions and checks. The hand lists, Zod's formats and OpenAPI are not in the map
 * yet.
 */

/** What the prototype does with one kind. */
export type Coverage =
  /** Held by these elements, each a name `elements()` gives. */
  | { readonly held: readonly string[] }
  /** Decides how a document is read. The model holds what was read, not this. */
  | { readonly reading: string }
  /** Outside the model, by this clause of the specification. */
  | { readonly refused: string }
  /** Not yet held, and not refused. */
  | { readonly owed: string };

const WHEN = { held: ['Shape[when]'] } as const;
const LEAST_OR_MOST = { held: ['NumberPart.least', 'NumberPart.most', 'Bound.exclusive'] } as const;

/** Keywords that mean the same in both drafts. */
const SHARED: Readonly<Record<string, Coverage>> = {
  $id: { held: ['Resource.id', 'Definition.aliases'] },
  $schema: { reading: 'names the dialect a resource is read under' },
  $ref: { held: ['Shape[reference]', 'Edge.target'] },
  $comment: { owed: 'a note for whoever maintains the schema; no element' },
  items: { held: ['ArrayPart.after', 'ArrayPart.positions'] },
  contains: { held: ['ArrayPart.contains'] },
  additionalProperties: { held: ['ObjectPart.rest'] },
  properties: { held: ['ObjectPart.fields'] },
  patternProperties: { held: ['ObjectPart.patterns'] },
  propertyNames: { held: ['ObjectPart.names'] },
  if: WHEN,
  then: WHEN,
  else: WHEN,
  allOf: { held: ['Shape[all]'] },
  anyOf: { held: ['Shape[some]'] },
  oneOf: { held: ['Shape[one]'] },
  not: { held: ['Shape[not]'] },
  type: { held: ['ByKind', 'NumberPart.whole'] },
  const: { held: ['Shape[values]'] },
  enum: { held: ['Shape[values]'] },
  multipleOf: { held: ['NumberPart.multipleOf'] },
  maximum: LEAST_OR_MOST,
  exclusiveMaximum: LEAST_OR_MOST,
  minimum: LEAST_OR_MOST,
  exclusiveMinimum: LEAST_OR_MOST,
  maxLength: { held: ['StringPart.length'] },
  minLength: { held: ['StringPart.length'] },
  pattern: { held: ['StringPart.patterns'] },
  maxItems: { held: ['ArrayPart.length'] },
  minItems: { held: ['ArrayPart.length'] },
  uniqueItems: { held: ['ArrayPart.distinct'] },
  maxProperties: { held: ['ObjectPart.count'] },
  minProperties: { held: ['ObjectPart.count'] },
  required: { held: ['ObjectPart.required', 'Field.presence'] },
  format: { owed: 'held on number and string parts only; a format may stand on any kind' },
  contentEncoding: { owed: 'no element' },
  contentMediaType: { owed: 'no element' },
  title: { held: ['Said.title'] },
  description: { held: ['Said.description'] },
  default: { held: ['Said.default'] },
  readOnly: { held: ['Said.direction'] },
  writeOnly: { held: ['Said.direction'] },
  examples: { owed: 'no element' },
};

export const DRAFT_2020_12: Readonly<Record<string, Coverage>> = {
  ...SHARED,
  $anchor: { held: ['Definition.aliases'] },
  $dynamicRef: { held: ['Shape[reference-in-scope]'] },
  $dynamicAnchor: { held: ['Resource.dynamicAnchors'] },
  $vocabulary: { reading: 'in a meta-schema, names the vocabularies a dialect has' },
  $defs: { held: ['Definition', 'Step[named]'] },
  prefixItems: { held: ['ArrayPart.positions'] },
  dependentSchemas: WHEN,
  dependentRequired: WHEN,
  unevaluatedItems: { held: ['Shape[rest-of].items'] },
  unevaluatedProperties: { held: ['Shape[rest-of].keys'] },
  maxContains: { held: ['ArrayPart.contains'] },
  minContains: { held: ['ArrayPart.contains'] },
  contentSchema: { owed: 'no element' },
  deprecated: { held: ['Said.deprecated'] },
};

export const DRAFT_07: Readonly<Record<string, Coverage>> = {
  ...SHARED,
  additionalItems: { held: ['ArrayPart.after'] },
  definitions: { held: ['Definition', 'Step[named]'] },
  dependencies: WHEN,
};

/** The values of `type`, the same seven in both drafts. */
export const TYPE_VALUES: Readonly<Record<string, Coverage>> = {
  array: { held: ['ByKind.array'] },
  boolean: { held: ['ByKind.boolean'] },
  integer: { held: ['ByKind.number', 'NumberPart.whole'] },
  null: { held: ['ByKind.null'] },
  number: { held: ['ByKind.number'] },
  object: { held: ['ByKind.object'] },
  string: { held: ['ByKind.string'] },
};

/** Names the 2020-12 dialect constrains that are keywords of none of its vocabularies. */
export const DIALECT_2020_12_OWN_NAMES: Readonly<Record<string, Coverage>> = {
  definitions: { held: ['Step[data]'] },
  dependencies: { owed: 'a name that is not a keyword, with a value: no element for one' },
  $recursiveAnchor: { owed: 'a name that is not a keyword, with a value: no element for one' },
  $recursiveRef: { owed: 'a name that is not a keyword, with a value: no element for one' },
};

const OUTSIDE_VALUES = { refused: 'SPEC-P-5, by Appendix A: not in the value domain' } as const;
const AUTHOR_CODE = { refused: 'SPEC-P-2, by Appendix A: a function its author supplied' } as const;
const CHANGES_VALUE = {
  refused: 'SPEC-P-2: what it produces differs by more than a default or a dropped key',
} as const;
const SIZE = { refused: 'SPEC-P-5, by Appendix A: a check on a set, a map or a file' } as const;

/** Zod's schema definitions, by the name of the type that declares each. */
export const ZOD_SCHEMAS: Readonly<Record<string, Coverage>> = {
  $ZodAny: { held: ['Shape[every]'] },
  $ZodArray: { held: ['ByKind.array', 'ArrayPart.after'] },
  $ZodBigInt: OUTSIDE_VALUES,
  $ZodBigIntFormat: OUTSIDE_VALUES,
  $ZodBoolean: { held: ['ByKind.boolean'] },
  $ZodCatch: CHANGES_VALUE,
  $ZodCodec: AUTHOR_CODE,
  $ZodCustom: AUTHOR_CODE,
  $ZodCustomStringFormat: AUTHOR_CODE,
  $ZodDate: OUTSIDE_VALUES,
  $ZodDefault: { held: ['Shape[absent-becomes]'] },
  $ZodDiscriminatedUnion: { owed: 'a choice decided by one key has no element yet' },
  $ZodEnum: { owed: 'held as `Shape[values]`, which loses the names of the entries' },
  $ZodExactOptional: { owed: 'a key that may be absent and may not be `undefined`' },
  $ZodFile: OUTSIDE_VALUES,
  $ZodFunction: OUTSIDE_VALUES,
  $ZodIntersection: { held: ['Shape[all].unknownKeys'] },
  $ZodLazy: { held: ['Shape[reference]', 'Definition'] },
  $ZodLiteral: { held: ['Shape[values]'] },
  $ZodMap: OUTSIDE_VALUES,
  $ZodNaN: OUTSIDE_VALUES,
  $ZodNever: { held: ['Shape[none]'] },
  $ZodNonOptional: { owed: 'refuses absence after a default has filled it: no element' },
  $ZodNull: { held: ['ByKind.null'] },
  $ZodNullable: { held: ['ByKind.null'] },
  $ZodNumber: { owed: 'held as `ByKind.number`, which is exact; Zod tests a double' },
  $ZodNumberFormat: { owed: 'a number format carries bounds and wholeness, not a name alone' },
  $ZodObject: { held: ['ObjectPart.fields', 'ObjectPart.rest', 'Field.presence'] },
  $ZodOptional: { held: ['Field.presence'] },
  $ZodPipe: AUTHOR_CODE,
  $ZodPrefault: { held: ['Shape[absent-becomes].checked'] },
  $ZodPreprocess: AUTHOR_CODE,
  $ZodPromise: OUTSIDE_VALUES,
  $ZodReadonly: { owed: 'freezes what it produces, which no JSON value shows: no element' },
  $ZodRecord: { owed: 'held as fields or patterns with a rest; a number key schema is not' },
  $ZodSet: OUTSIDE_VALUES,
  $ZodString: { held: ['ByKind.string'] },
  $ZodStringFormat: { owed: 'a format carries parameters and a pattern, not a name alone' },
  $ZodSuccess: CHANGES_VALUE,
  $ZodSymbol: OUTSIDE_VALUES,
  $ZodTemplateLiteral: { owed: 'the parts of a template have no element' },
  $ZodTransform: AUTHOR_CODE,
  $ZodTuple: { held: ['ArrayPart.positions', 'ArrayPart.after'] },
  $ZodUndefined: OUTSIDE_VALUES,
  $ZodUnion: { held: ['Shape[first]'] },
  $ZodUnknown: { held: ['Shape[every]'] },
  $ZodVoid: OUTSIDE_VALUES,
  $ZodXor: { held: ['Shape[one]'] },
};

/** Zod's checks, by the name of the type that declares each. */
export const ZOD_CHECKS: Readonly<Record<string, Coverage>> = {
  $ZodCheckBigIntFormat: OUTSIDE_VALUES,
  $ZodCheckGreaterThan: { held: ['NumberPart.least', 'Bound.exclusive'] },
  $ZodCheckLengthEquals: { held: ['StringPart.length', 'ArrayPart.length'] },
  $ZodCheckLessThan: { held: ['NumberPart.most', 'Bound.exclusive'] },
  $ZodCheckMaxLength: { held: ['StringPart.length', 'ArrayPart.length'] },
  $ZodCheckMaxSize: SIZE,
  $ZodCheckMimeType: SIZE,
  $ZodCheckMinLength: { held: ['StringPart.length', 'ArrayPart.length'] },
  $ZodCheckMinSize: SIZE,
  $ZodCheckMultipleOf: {
    owed: 'held exactly as `NumberPart.multipleOf`; Zod tests within a tolerance',
  },
  $ZodCheckNumberFormat: { owed: 'a number format carries bounds and wholeness, not a name alone' },
  $ZodCheckOverwrite: AUTHOR_CODE,
  $ZodCheckProperties: { owed: 'a check on a property of the value: no element' },
  $ZodCheckProperty: { owed: 'a check on a property of the value: no element' },
  $ZodCheckSizeEquals: SIZE,
  $ZodCheckStringFormat: { owed: 'a format carries parameters and a pattern, not a name alone' },
};
