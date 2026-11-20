import type { Coded } from './outcomes.js';

const DOC: Coded = ['O', 'O', 'O', 'Document content.'];
const SER: Coded = ['O', 'O', 'S', 'A serialisation rule: the endpoint definitions hold it.'];
const EX: Coded = ['O', 'O', 'O', 'An example of a body or parameter, not of a schema.'];
const SAY: Coded = ['O', 'K', 'S', 'Said about a boundary: a comment in TypeScript.'];
const KEY: Coded = ['S', 'S', 'S', ''];
const SLOT: Coded = ['C', 'C', 'S', ''];
const SCHEMA_SAYS: Coded = ['S', 'K', 'K', 'Said about a shape.'];
const XML: Coded = ['S', 'K', 'K', 'How a value is written as XML; said about a shape.'];

/**
 * The proposals for one object: a default for its fields, and the fields that differ.
 * `keyed` holds the proposals for the entries the object holds under a pattern or any key.
 */
export interface ObjectProposals {
  readonly fallback?: Coded;
  readonly fields?: ReadonlyMap<string, Coded>;
  readonly keyed?: readonly KeyedProposal[];
}

/**
 * What an object's keyed entries are, and the proposal for them. One object may key
 * entries of more than one kind (an exact status code, a status range).
 */
export type KeyedProposal = readonly [what: string, proposal: Coded];

function fields(...entries: readonly (readonly [string, Coded])[]): ReadonlyMap<string, Coded> {
  return new Map(entries);
}

/**
 * The proposed outcome for every object and field of an OpenAPI 3.1 or 3.2 document
 * outside the schema object. A field or value only 3.2 defines is proposed here too.
 */
export const OBJECT_PROPOSALS: ReadonlyMap<string, ObjectProposals> = new Map<
  string,
  ObjectProposals
>([
  [
    'openapi',
    {
      fallback: DOC,
      fields: fields(
        ['openapi', ['R', 'R', 'R', 'Selects the version the document is read as.']],
        ['jsonSchemaDialect', ['R', 'R', 'R', 'Selects the dialect its schemas are read in.']],
        ['$self', ['S', 'S', 'S', "The document's own identity; references resolve through it."]],
        ['paths', ['S', 'S', 'S', 'Each path template is a key.']],
        ['webhooks', KEY],
        ['components', KEY],
      ),
    },
  ],
  ['info', { fallback: DOC }],
  ['contact', { fallback: DOC }],
  ['license', { fallback: DOC }],
  ['server', { fallback: DOC }],
  ['server-variable', { fallback: DOC }],
  [
    'components',
    {
      fallback: ['S', 'S', 'S', 'A named component stays named (SPEC-PR-3).'],
      fields: fields(
        ['schemas', ['C', 'C', 'K', 'Each named schema is written once.']],
        ['examples', EX],
        ['links', DOC],
        ['securitySchemes', DOC],
      ),
      keyed: [['a component name', ['S', 'S', 'S', 'Its grammar is fixed (SPEC-PR-3).']]],
    },
  ],
  ['paths', { keyed: [['a path template', ['S', 'S', 'S', 'The template is the key.']]] }],
  [
    'path-item',
    {
      fallback: ['S', 'S', 'S', 'The method is a key.'],
      fields: fields(
        ['$ref', ['C', 'C', 'S', 'Written as a reference (SPEC-PR-3).']],
        ['parameters', ['C', 'C', 'S', 'Apply to every operation of the path.']],
        ['servers', DOC],
        ['summary', SAY],
        ['description', SAY],
      ),
    },
  ],
  [
    'operation',
    {
      fallback: SAY,
      fields: fields(
        ['operationId', ['S', 'S', 'S', "The boundary's identity."]],
        ['parameters', SLOT],
        ['requestBody', SLOT],
        ['responses', SLOT],
        ['callbacks', KEY],
        ['security', DOC],
        ['servers', DOC],
        ['tags', DOC],
        ['externalDocs', DOC],
      ),
    },
  ],
  ['external-documentation', { fallback: DOC }],
  [
    'parameter',
    {
      fallback: SER,
      fields: fields(
        ['name', KEY],
        ['in', ['S', 'S', 'S', 'Each location is a key.']],
        ['required', SLOT],
        ['schema', SLOT],
        ['content', ['C', 'C', 'S', 'Keyed by media type.']],
        ['description', SAY],
        ['deprecated', SAY],
        ['example', EX],
        ['examples', EX],
      ),
    },
  ],
  [
    'request-body',
    {
      fields: fields(
        ['content', ['C', 'C', 'S', 'Keyed by media type.']],
        ['required', SLOT],
        ['description', SAY],
      ),
    },
  ],
  ['content', { keyed: [['a media type', ['S', 'S', 'S', 'The media type is the key.']]] }],
  [
    'media-type',
    {
      fallback: SER,
      fields: fields(
        ['schema', SLOT],
        ['itemSchema', SLOT],
        ['description', SAY],
        ['example', EX],
        ['examples', EX],
      ),
    },
  ],
  ['encoding', { fallback: SER }],
  [
    'responses',
    {
      fields: fields(['default', ['S', 'S', 'S', 'Kept apart from every status (SPEC-C-1).']]),
      keyed: [
        ['an exact status code', ['S', 'S', 'S', 'Takes precedence over a range (SPEC-C-1).']],
        ['a status range', ['S', 'S', 'S', 'Never widened from a code or collapsed to one.']],
      ],
    },
  ],
  [
    'response',
    {
      fields: fields(
        ['content', ['C', 'C', 'S', 'Keyed by media type.']],
        ['headers', SLOT],
        ['description', SAY],
        ['summary', SAY],
        ['links', DOC],
      ),
    },
  ],
  [
    'callbacks',
    { keyed: [['a callback expression', ['S', 'S', 'S', 'The expression is the key.']]] },
  ],
  ['example', { fallback: EX }],
  ['link', { fallback: DOC }],
  [
    'header',
    {
      fallback: SER,
      fields: fields(
        ['required', SLOT],
        ['schema', SLOT],
        ['content', SLOT],
        ['description', SAY],
        ['deprecated', SAY],
        ['example', EX],
        ['examples', EX],
      ),
    },
  ],
  ['tag', { fallback: DOC }],
  [
    'reference',
    {
      fields: fields(
        ['$ref', ['C', 'C', 'S', 'Written as a reference (SPEC-PR-3).']],
        ['summary', SAY],
        ['description', SAY],
      ),
    },
  ],
  ['security-scheme', { fallback: DOC }],
  ['oauth-flows', { fallback: DOC }],
  ['oauth-flows/implicit', { fallback: DOC }],
  ['oauth-flows/password', { fallback: DOC }],
  ['oauth-flows/client-credentials', { fallback: DOC }],
  ['oauth-flows/authorization-code', { fallback: DOC }],
  ['oauth-flows/device-authorization', { fallback: DOC }],
  ['security-requirement', { keyed: [['a security scheme name', DOC]] }],
  [
    'specification-extensions',
    {
      keyed: [
        [
          'an `x-` extension',
          ['O', 'O', 'O', 'Outside a schema. On a schema it is said of a shape.'],
        ],
      ],
    },
  ],
  ['map-of-strings', { keyed: [['an entry of a map of strings', DOC]] }],
]);

/**
 * The proposed outcome for the keywords OpenAPI adds to the schema object and the fields
 * of each. All are said about a shape, so none is outside the target.
 */
export const SCHEMA_VOCABULARY_PROPOSALS: ReadonlyMap<string, ObjectProposals> = new Map<
  string,
  ObjectProposals
>([
  [
    'schema',
    {
      fallback: SCHEMA_SAYS,
      fields: fields(['xml', XML]),
    },
  ],
  ['discriminator', { fallback: ['S', 'S', 'K', 'A hint: it changes no accepted value.'] }],
  ['external-docs', { fallback: SCHEMA_SAYS }],
  ['xml', { fallback: XML }],
  [
    'extensible',
    { keyed: [['an `x-` extension', ['S', 'K', 'K', 'On a keyword OpenAPI adds to a schema.']]] },
  ],
]);
