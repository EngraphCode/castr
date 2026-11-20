import type { Coded } from './outcomes.js';

/**
 * The proposed outcome for every keyword of the seven JSON Schema 2020-12 vocabularies.
 * In the endpoint definitions a schema is a reference to the Zod schema of the same run,
 * so what Zod enforces or holds is carried there by companion.
 */
export const KEYWORD_PROPOSALS: ReadonlyMap<string, Coded> = new Map<string, Coded>([
  // core
  ['$id', ['S', 'S', 'K', 'Identity of an embedded resource; references resolve through it.']],
  ['$schema', ['R', 'R', 'R', 'Selects the dialect the schema is read in.']],
  ['$ref', ['C', 'C', 'K', 'Written as a reference to a named definition (SPEC-PR-3).']],
  ['$anchor', ['S', 'S', 'K', 'A name a reference can target.']],
  ['$dynamicRef', ['C', 'C', 'K', 'Resolved by the parser for each scope that reaches it.']],
  ['$dynamicAnchor', ['S', 'S', 'K', 'With `$dynamicRef`.']],
  ['$vocabulary', ['R', 'R', 'R', 'Has meaning only in a meta-schema.']],
  ['$comment', ['S', 'K', 'K', "A note for the schema's author."]],
  ['$defs', ['S', 'S', 'K', 'Named definitions, each written once.']],
  // applicator
  ['prefixItems', ['C', 'C', 'K', 'A tuple, with `items` as its rest.']],
  ['items', ['C', 'C', 'K', '']],
  ['contains', ['X', 'K', 'K', '']],
  ['additionalProperties', ['C', 'K', 'K', 'TypeScript cannot close an object.']],
  ['properties', ['C', 'C', 'K', '']],
  ['patternProperties', ['X', 'K', 'K', 'TypeScript shows an index signature.']],
  ['dependentSchemas', ['X', 'K', 'K', '']],
  ['propertyNames', ['X', 'K', 'K', '']],
  ['if', ['X', 'K', 'K', 'With `then` and `else`, one construct.']],
  ['then', ['X', 'K', 'K', '']],
  ['else', ['X', 'K', 'K', '']],
  ['allOf', ['C', 'C', 'K', 'Closed objects under `allOf` are merged before writing.']],
  ['anyOf', ['C', 'C', 'K', '']],
  ['oneOf', ['C', 'K', 'K', 'Zod: `z.xor`. A TypeScript union is `anyOf`.']],
  ['not', ['X', 'K', 'K', 'TypeScript has no negated type.']],
  // unevaluated
  ['unevaluatedItems', ['X', 'K', 'K', "The tuple's rest where the parser can settle it."]],
  ['unevaluatedProperties', ['X', 'K', 'K', 'The unknown-key policy where the parser can.']],
  // validation
  ['type', ['C', 'C', 'K', 'One row per value.']],
  ['const', ['C', 'C', 'K', 'A primitive value; an object or array value is its own row.']],
  ['enum', ['C', 'C', 'K', 'Primitive members; an object or array member is its own row.']],
  ['multipleOf', ['C', 'K', 'K', 'Zod divides in binary floating point.']],
  ['maximum', ['C', 'K', 'K', '']],
  ['exclusiveMaximum', ['C', 'K', 'K', '']],
  ['minimum', ['C', 'K', 'K', '']],
  ['exclusiveMinimum', ['C', 'K', 'K', '']],
  ['maxLength', ['C', 'K', 'K', 'Both count characters, not UTF-16 units.']],
  ['minLength', ['C', 'K', 'K', 'As `maxLength`.']],
  ['pattern', ['C', 'K', 'K', 'Both are ECMA-262 expressions.']],
  ['maxItems', ['C', 'K', 'K', '']],
  ['minItems', ['C', 'K', 'K', '']],
  ['uniqueItems', ['X', 'K', 'K', "Equality is JSON Schema's: by value."]],
  ['maxContains', ['X', 'K', 'K', 'With `contains`.']],
  ['minContains', ['X', 'K', 'K', 'With `contains`.']],
  ['maxProperties', ['X', 'K', 'K', '']],
  ['minProperties', ['X', 'K', 'K', '']],
  ['required', ['C', 'C', 'K', '']],
  ['dependentRequired', ['X', 'K', 'K', '']],
  // format
  ['format', ['C', 'K', 'K', 'One row per value.']],
  // content
  ['contentEncoding', ['S', 'K', 'K', 'An annotation in 2020-12; it asserts nothing.']],
  ['contentMediaType', ['S', 'K', 'K', 'As above.']],
  ['contentSchema', ['S', 'K', 'K', 'As above.']],
  // meta-data
  ['title', ['S', 'K', 'K', "Zod: the schema's registry entry. TypeScript: a comment."]],
  ['description', ['S', 'K', 'K', 'As `title`.']],
  ['default', ['S', 'K', 'K', 'An annotation, reported as a warning (SPEC-P-6).']],
  ['deprecated', ['S', 'K', 'K', 'TypeScript: `@deprecated`.']],
  ['readOnly', ['S', 'K', 'K', 'An annotation in 3.1.']],
  ['writeOnly', ['S', 'K', 'K', '']],
  ['examples', ['S', 'K', 'K', '']],
]);

/**
 * The proposed outcome for each value `type` may take.
 */
export const TYPE_VALUE_PROPOSALS: ReadonlyMap<string, Coded> = new Map<string, Coded>([
  ['array', ['C', 'C', 'K', '']],
  ['boolean', ['C', 'C', 'K', '']],
  ['integer', ['C', 'K', 'K', 'A number asserted to be a safe integer.']],
  ['null', ['C', 'C', 'K', '']],
  ['number', ['C', 'C', 'K', '']],
  ['object', ['C', 'C', 'K', '']],
  ['string', ['C', 'C', 'K', '']],
]);

/**
 * A row no published definition lists, with the section of text that defines it.
 */
export interface TextRow {
  readonly label: string;
  readonly definedIn: string;
  readonly proposal: Coded;
}

const V = 'JSON Schema Validation';
const O31 = 'OpenAPI 3.1, 4.3';

function format(value: string, definedIn: string, proposal: Coded): TextRow {
  return { label: `format: ${value}`, definedIn, proposal };
}

/**
 * The values of `format` the specifications define. They are defined in text only, so
 * this list is written by hand and is the part of the rows most likely to be incomplete.
 */
export const FORMAT_ROWS: readonly TextRow[] = [
  format('date-time', `${V} 7.3.1`, ['C', 'K', 'K', '`z.iso.datetime` with offsets.']),
  format('date', `${V} 7.3.1`, ['C', 'K', 'K', '']),
  format('time', `${V} 7.3.1`, ['C', 'K', 'K', 'A pattern: `z.iso.time` refuses an offset.']),
  format('duration', `${V} 7.3.1`, ['C', 'K', 'K', '']),
  format('email', `${V} 7.3.2`, ['X', 'K', 'K', '`z.email` is narrower than RFC 5321.']),
  format('idn-email', `${V} 7.3.2`, ['X', 'K', 'K', '']),
  format('hostname', `${V} 7.3.3`, ['C', 'K', 'K', '']),
  format('idn-hostname', `${V} 7.3.3`, ['X', 'K', 'K', '']),
  format('ipv4', `${V} 7.3.4`, ['C', 'K', 'K', '']),
  format('ipv6', `${V} 7.3.4`, ['C', 'K', 'K', '']),
  format('uri', `${V} 7.3.5`, ['X', 'K', 'K', '`z.url` follows WHATWG, not RFC 3986.']),
  format('uri-reference', `${V} 7.3.5`, ['X', 'K', 'K', '']),
  format('iri', `${V} 7.3.5`, ['X', 'K', 'K', '']),
  format('iri-reference', `${V} 7.3.5`, ['X', 'K', 'K', '']),
  format('uuid', `${V} 7.3.5`, ['C', 'K', 'K', '`z.guid`: no version check.']),
  format('uri-template', `${V} 7.3.6`, ['X', 'K', 'K', '']),
  format('json-pointer', `${V} 7.3.7`, ['X', 'K', 'K', '']),
  format('relative-json-pointer', `${V} 7.3.7`, ['X', 'K', 'K', '']),
  format('regex', `${V} 7.3.8`, ['X', 'K', 'K', '']),
  format('int32', O31, ['C', 'K', 'K', '']),
  format('int64', O31, ['C', 'K', 'K', 'A safe integer, by the owner (20 November 2026).']),
  format('float', O31, ['C', 'K', 'K', '']),
  format('double', O31, ['C', 'K', 'K', '']),
  format('password', O31, ['S', 'K', 'K', 'A hint to user interfaces; it asserts nothing.']),
  {
    label: 'format: a value no specification defines',
    definedIn: O31,
    proposal: ['S', 'K', 'K', 'An annotation, named in the run report; never a refusal.'],
  },
];

/**
 * Schema constructs that are not a keyword of their own, defined in text only.
 */
export const OTHER_SCHEMA_ROWS: readonly TextRow[] = [
  {
    label: '`true` as a schema',
    definedIn: 'JSON Schema Core 4.3.2',
    proposal: ['C', 'C', 'K', 'Every value.'],
  },
  {
    label: '`false` as a schema',
    definedIn: 'JSON Schema Core 4.3.2',
    proposal: ['C', 'C', 'K', 'No value.'],
  },
  {
    label: 'a list of types (`type: [..]`)',
    definedIn: `${V} 6.1.1`,
    proposal: ['C', 'C', 'K', ''],
  },
  {
    label: '`const` or an `enum` member that is an object or array',
    definedIn: `${V} 6.1.2, 6.1.3`,
    proposal: ['C', 'K', 'K', 'TypeScript types are structural.'],
  },
  {
    label: 'a keyword no vocabulary defines',
    definedIn: 'JSON Schema Core 6.5',
    proposal: ['S', 'K', 'K', 'An annotation, named in the run report; never a refusal.'],
  },
  {
    label: '`x-` extension on a schema',
    definedIn: 'OpenAPI 3.1, 4.9',
    proposal: ['S', 'K', 'K', ''],
  },
];
