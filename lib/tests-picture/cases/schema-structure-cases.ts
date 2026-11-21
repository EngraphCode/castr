import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import { documentFor } from './schema-case.js';
import type { Expectation, StructureCase } from './structure-case.js';

const STRING = { type: 'string' };

function value(held: string | number): Expectation {
  return { kind: 'value', value: held };
}

const DIFFERENCE: Expectation = { kind: 'difference' };

function documentOf(schema: unknown, components: UnknownRecord = {}): UnknownRecord {
  return documentFor({ schema, components });
}

/** The same document as OpenAPI 3.2, for a construct only that version has. */
function in32(document: UnknownRecord): UnknownRecord {
  return { ...document, openapi: '3.2.0' };
}

/** A string schema with the construct, against the string schema alone. */
function onAString(rowId: string, construct: UnknownRecord, expects: Expectation): StructureCase {
  return {
    rowId,
    document: documentOf({ ...STRING, ...construct }),
    control: documentOf(STRING),
    expects,
  };
}

const IDENTIFIERS: readonly StructureCase[] = [
  // The schema refers to nothing, so the base its `$id` sets changes no reference.
  onAString(
    'keyword:$id',
    { $id: 'https://kestrel.example/schemas/t' },
    value('https://kestrel.example/schemas/t'),
  ),
  onAString('keyword:$anchor', { $anchor: 'kestrelAnchor' }, value('kestrelAnchor')),
  onAString('keyword:$dynamicAnchor', { $dynamicAnchor: 'kestrelPoint' }, value('kestrelPoint')),
  // Nothing refers to the definition: a reference into `$defs` is another construct.
  onAString('keyword:$defs', { $defs: { KestrelPart: { type: 'number' } } }, value('KestrelPart')),
];

const ANNOTATIONS: readonly StructureCase[] = [
  onAString('keyword:$comment', { $comment: 'a kestrel comment' }, value('a kestrel comment')),
  onAString('keyword:title', { title: 'Kestrel title' }, value('Kestrel title')),
  onAString('keyword:description', { description: 'Kestrel words.' }, value('Kestrel words.')),
  onAString('keyword:default', { default: 'kestrel by default' }, value('kestrel by default')),
  onAString('keyword:examples', { examples: ['a kestrel example'] }, value('a kestrel example')),
  onAString('keyword:deprecated', { deprecated: true }, DIFFERENCE),
  onAString('keyword:readOnly', { readOnly: true }, DIFFERENCE),
  onAString('keyword:writeOnly', { writeOnly: true }, DIFFERENCE),
  onAString('keyword:contentEncoding', { contentEncoding: 'base32' }, value('base32')),
  onAString(
    'keyword:contentMediaType',
    { contentMediaType: 'application/vnd.kestrel' },
    value('application/vnd.kestrel'),
  ),
  // `contentSchema` says something only beside `contentMediaType`, so both documents
  // state the media type.
  {
    rowId: 'keyword:contentSchema',
    document: documentOf({
      ...STRING,
      contentMediaType: 'application/json',
      contentSchema: { type: 'boolean' },
    }),
    control: documentOf({ ...STRING, contentMediaType: 'application/json' }),
    expects: value('boolean'),
  },
  onAString('text:format: password', { format: 'password' }, value('password')),
  onAString(
    'text:format: a value no specification defines',
    { format: 'kestrel-format' },
    value('kestrel-format'),
  ),
  onAString(
    'text:a keyword no vocabulary defines',
    { kestrelKeyword: 'a kestrel value' },
    value('a kestrel value'),
  ),
  onAString(
    'text:`x-` extension on a schema',
    { 'x-kestrel': 'a kestrel extension' },
    value('a kestrel extension'),
  ),
  onAString('schema.example', { example: 'one kestrel example' }, value('one kestrel example')),
];

const DOCS = 'https://kestrel.example/docs';

const EXTERNAL_DOCS: readonly StructureCase[] = [
  onAString('schema.externalDocs', { externalDocs: { url: DOCS } }, value(DOCS)),
  // Against the same object with another address, since `url` is required of it.
  {
    rowId: 'external-docs.url',
    document: documentOf({ ...STRING, externalDocs: { url: DOCS } }),
    control: documentOf({ ...STRING, externalDocs: { url: 'https://example.com/docs' } }),
    expects: value(DOCS),
  },
  {
    rowId: 'external-docs.description',
    document: documentOf({
      ...STRING,
      externalDocs: { url: DOCS, description: 'Where kestrels are described.' },
    }),
    control: documentOf({ ...STRING, externalDocs: { url: DOCS } }),
    expects: value('Where kestrels are described.'),
  },
  // An extension on an object OpenAPI adds to a schema, not on the schema itself.
  {
    rowId: 'extensible[an `x-` extension]',
    document: documentOf({
      ...STRING,
      externalDocs: { url: DOCS, 'x-kestrel': 'an extension inside' },
    }),
    control: documentOf({ ...STRING, externalDocs: { url: DOCS } }),
    expects: value('an extension inside'),
  },
];

/** An object with one string property, which holds the `xml` object under test. */
function withXml(xml: UnknownRecord | undefined): UnknownRecord {
  const thing = xml === undefined ? STRING : { ...STRING, xml };
  return documentOf({ type: 'object', properties: { thing } });
}

/** A field of the `xml` object, against an `xml` object that states only a name. */
function xmlField(field: string, held: unknown, expects: Expectation): StructureCase {
  return {
    rowId: `xml.${field}`,
    document: withXml({ name: 'thing', [field]: held }),
    control: withXml({ name: 'thing' }),
    expects,
  };
}

const NODE_TYPES = ['element', 'attribute', 'text', 'cdata', 'none'];

const STRINGS = { type: 'array', items: STRING };

/** A document whose one property is `host` with an `xml` object stating `nodeType`. */
function nodeTypeOn(host: UnknownRecord, held: string | undefined): UnknownRecord {
  const xml = held === undefined ? {} : { nodeType: held };
  return in32(documentOf({ type: 'object', properties: { thing: { ...host, xml } } }));
}

/**
 * The schema a value of `nodeType` is stated on, chosen so that the value is not the
 * default there and has something to say: `element` is the default except on an array,
 * and `none` puts a schema's subschemas under its parent, so it is stated on an object.
 */
function hostOf(held: string): UnknownRecord {
  if (held === 'element') {
    return STRINGS;
  }
  return held === 'none' ? { type: 'object', properties: { part: STRING } } : STRING;
}

/**
 * One value of `nodeType`, which is a choice: against no `nodeType`, and apart from each
 * other value on the same schema. No name is stated, since a name is ignored for three of
 * the five.
 */
function nodeType(held: string): StructureCase {
  const host = hostOf(held);
  return {
    rowId: `xml.nodeType=${held}`,
    document: nodeTypeOn(host, held),
    control: nodeTypeOn(host, undefined),
    expects: value(held),
    apartFrom: NODE_TYPES.filter((other) => other !== held).map((other) => nodeTypeOn(host, other)),
  };
}

const XML: readonly StructureCase[] = [
  {
    rowId: 'schema.xml',
    document: withXml({ name: 'kestrelElement' }),
    control: withXml(undefined),
    expects: value('kestrelElement'),
  },
  {
    rowId: 'xml.name',
    document: withXml({ name: 'kestrelElement' }),
    control: withXml({ name: 'thing' }),
    expects: value('kestrelElement'),
  },
  xmlField('namespace', 'https://kestrel.example/ns', value('https://kestrel.example/ns')),
  xmlField('prefix', 'kes', value('kes')),
  xmlField('attribute', true, DIFFERENCE),
  // `wrapped` says something only on an array, and `xml` only on a property.
  {
    rowId: 'xml.wrapped',
    document: documentOf({
      type: 'object',
      properties: { things: { ...STRINGS, xml: { name: 'things', wrapped: true } } },
    }),
    control: documentOf({
      type: 'object',
      properties: { things: { ...STRINGS, xml: { name: 'things' } } },
    }),
    expects: DIFFERENCE,
  },
  ...NODE_TYPES.map(nodeType),
];

/** An animal told from the other by both of its properties, so that either can discriminate. */
function animal(kinds: readonly string[], sort: string): UnknownRecord {
  return {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: kinds },
      sort: { type: 'string', enum: [sort] },
    },
    required: ['kind', 'sort'],
  };
}

// A dog's `kind` may also be `kestrel`, the value the mapping case maps to it.
const ANIMALS = { Cat: animal(['Cat'], 'feline'), Dog: animal(['Dog', 'kestrel'], 'canine') };
const DOG = '#/components/schemas/Dog';

/** A choice between two named schemas, with a discriminator or with none. */
function choice(discriminator: UnknownRecord | undefined): UnknownRecord {
  const oneOf = [{ $ref: '#/components/schemas/Cat' }, { $ref: DOG }];
  return documentOf(discriminator === undefined ? { oneOf } : { oneOf, discriminator }, ANIMALS);
}

const DISCRIMINATORS: readonly StructureCase[] = [
  {
    rowId: 'schema.discriminator',
    document: choice({ propertyName: 'kind' }),
    control: choice(undefined),
    expects: DIFFERENCE,
  },
  // Both properties are in both documents, so only which one discriminates differs.
  {
    rowId: 'discriminator.propertyName',
    document: choice({ propertyName: 'kind' }),
    control: choice({ propertyName: 'sort' }),
    expects: DIFFERENCE,
  },
  // The mapped value must be one a dog's `kind` allows, so it is in both documents and
  // cannot be searched for.
  {
    rowId: 'discriminator.mapping',
    document: choice({ propertyName: 'kind', mapping: { kestrel: DOG } }),
    control: choice({ propertyName: 'kind' }),
    expects: DIFFERENCE,
  },
  {
    rowId: 'discriminator.defaultMapping',
    document: in32(choice({ propertyName: 'kind', defaultMapping: DOG })),
    control: in32(choice({ propertyName: 'kind' })),
    expects: DIFFERENCE,
  },
];

/**
 * One case for each row of a schema that the Zod output is proposed to carry as
 * structure: the construct decides no value, and the validators are to hold what it says.
 */
export const SCHEMA_STRUCTURE_CASES: readonly StructureCase[] = [
  ...IDENTIFIERS,
  ...ANNOTATIONS,
  ...EXTERNAL_DOCS,
  ...XML,
  ...DISCRIMINATORS,
];
