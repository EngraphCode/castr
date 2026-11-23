/**
 * How a document is walked for the rows it states a construct of.
 */

import { describe, it, expect } from 'vitest';

import type { JsonObject } from '../rows/json.js';

import { rowsUsedBy } from './rows-used.js';

const ROWS = new Set([
  'openapi.openapi',
  'openapi.paths',
  'openapi.components',
  'components.schemas',
  'components.parameters',
  'components.pathItems',
  'components[a component name]',
  'paths[a path template]',
  'path-item.get',
  'path-item.$ref',
  'operation.parameters',
  'operation.responses',
  'parameter.name',
  'parameter.in=query',
  'parameter.required',
  'parameter.required=true',
  'parameter.schema',
  'reference.$ref',
  'reference.description',
  'map-of-strings[an entry of a map of strings]',
  'components.links',
  'link.parameters',
  'schema.discriminator',
  'discriminator.mapping',
  'operation.callbacks',
  'callbacks[a callback expression]',
  'openapi.webhooks',
  'content[a media type]',
  'media-type.schema',
  'response.content',
  'responses.default',
  'responses[an exact status code]',
  'responses[a status range]',
  'response.description',
  'specification-extensions[an `x-` extension]',
  'keyword:type',
  'keyword:format',
  'keyword:properties',
  'keyword:items',
  'keyword:enum',
  'keyword:const',
  'keyword:additionalProperties',
  'keyword:propertyNames',
  'keyword:minProperties',
  'type:string',
  'type:null',
  'type:object',
  'type:array',
  'text:a list of types (`type: [..]`)',
  'text:format: uuid',
  'text:format: a value no specification defines',
  'text:`false` as a schema',
  'text:`const` or an `enum` member that is an object or array',
  'text:a keyword no vocabulary defines',
  'text:`x-` extension on a schema',
  'text:`additionalProperties: false`',
  'text:a map: `additionalProperties` with a schema',
  'text:a map: a `propertyNames` that refuses no name',
  'schema.xml',
  'xml.name',
  'xml.nodeType=attribute',
  'extensible[an `x-` extension]',
]);

function used(document: JsonObject): readonly string[] {
  return [...rowsUsedBy(document, ROWS).used];
}

function withSchema(schema: unknown): JsonObject {
  return { components: { schemas: { Kestrel: schema } } };
}

describe('rowsUsedBy', () => {
  it('names a field of an object, and the objects inside it by their own fields', () => {
    const document = {
      openapi: '3.1.0',
      paths: { '/kestrels': { get: { responses: { '200': { description: 'ok' } } } } },
    };

    expect(used(document)).toEqual([
      'openapi.openapi',
      'openapi.paths',
      'paths[a path template]',
      'path-item.get',
      'operation.responses',
      'responses[an exact status code]',
      'response.description',
    ]);
  });

  it('names a value the definitions fix, beside the field where the field is also free', () => {
    const parameter = { name: 'q', in: 'query', required: true };
    const document = { paths: { '/k': { get: { parameters: [parameter] } } } };

    expect(used(document)).toEqual(
      expect.arrayContaining([
        'parameter.name',
        'parameter.in=query',
        'parameter.required',
        'parameter.required=true',
      ]),
    );
  });

  it('tells a default response, an exact status code and a status range apart', () => {
    const responses = { default: {}, '404': {}, '4XX': {} };
    const document = { paths: { '/k': { get: { responses } } } };

    expect(used(document)).toEqual(
      expect.arrayContaining([
        'responses.default',
        'responses[an exact status code]',
        'responses[a status range]',
      ]),
    );
  });

  it('names a reference by what a reference holds, and does not walk it as the object', () => {
    const reference = { $ref: '#/components/parameters/Q', description: 'here', name: 'never' };
    const document = { paths: { '/k': { get: { parameters: [reference] } } } };
    const found = rowsUsedBy(document, ROWS);

    expect([...found.used]).toEqual(
      expect.arrayContaining(['reference.$ref', 'reference.description']),
    );
    expect(found.used.has('parameter.name')).toBe(false);
    expect(found.unrecognised).toEqual(['reference.name']);
  });

  it('names a callback given by reference as a reference, not as a callback expression', () => {
    const callbacks = { onKestrel: { $ref: '#/components/callbacks/K' } };
    const found = used({ paths: { '/k': { get: { callbacks } } } });

    expect(found).toContain('reference.$ref');
    expect(found).not.toContain('callbacks[a callback expression]');
  });

  it('reports an extension beside a `$ref`, since a reference holds none', () => {
    const reference = { $ref: '#/components/parameters/Q', 'x-note': 1 };
    const found = rowsUsedBy({ paths: { '/k': { get: { parameters: [reference] } } } }, ROWS);

    expect(found.used.has('specification-extensions[an `x-` extension]')).toBe(false);
    expect(found.unrecognised).toEqual(['reference.x-note']);
  });

  it('reports a response keyed by neither a status code, a range nor `default`', () => {
    const found = rowsUsedBy({ paths: { '/k': { get: { responses: { kestrel: {} } } } } }, ROWS);

    expect(found.used.has('responses[an exact status code]')).toBe(false);
    expect(found.unrecognised).toEqual(['responses.kestrel']);
  });

  it('names a component name only where a kind of component has an entry', () => {
    const named = 'components[a component name]';

    expect(used({ components: { schemas: {} } })).not.toContain(named);
    expect(used({ components: { 'x-kestrel': { a: 1 } } })).not.toContain(named);
    expect(used({ components: { kestrels: { a: 1 } } })).not.toContain(named);
    expect(used({ components: { parameters: { Q: {} } } })).toContain(named);
  });

  it('reads a path item with `$ref` as a path item, in 3.1 and in 3.2, wherever it is held', () => {
    const referenced = { $ref: '#/components/pathItems/K', get: {} };
    const callbacks = { onEvent: { '{$request.body#/url}': referenced } };
    const documents = [
      { webhooks: { onKestrel: referenced } },
      { components: { pathItems: { Other: referenced } } },
      { paths: { '/k': { get: { callbacks } } } },
    ];

    // Its `$ref` is a field of its own beside the others, and it is not a reference.
    for (const openapi of ['3.1.0', '3.2.0']) {
      for (const document of documents) {
        const found = rowsUsedBy({ openapi, ...document }, ROWS);

        expect(found.used.has('path-item.$ref')).toBe(true);
        expect(found.used.has('path-item.get')).toBe(true);
        expect(found.used.has('reference.$ref')).toBe(false);
        expect(found.unrecognised).toEqual([]);
      }
    }
  });

  it('reads a media type whose name begins `x-` as a media type', () => {
    const content = { 'x-kestrel/json': { schema: { type: 'string' } } };
    const found = used({ paths: { '/k': { get: { responses: { '200': { content } } } } } });

    expect(found).toEqual(expect.arrayContaining(['content[a media type]', 'media-type.schema']));
    expect(found).not.toContain('specification-extensions[an `x-` extension]');
  });

  it('names an entry of a map of strings where the definitions say a field is one', () => {
    const entry = 'map-of-strings[an entry of a map of strings]';
    const link = (parameters: JsonObject): JsonObject => ({
      components: { links: { K: { parameters } } },
    });

    expect(used(link({ id: '$response.body#/id' }))).toContain(entry);
    expect(used(link({}))).not.toContain(entry);
    // A discriminator's mapping is not declared as a map of strings.
    expect(used(withSchema({ discriminator: { mapping: { a: '#/a' } } }))).not.toContain(entry);
  });

  it('walks a path item beside its own `$ref`', () => {
    const document = { paths: { '/k': { $ref: './other.yaml', get: {} } } };

    expect(used(document)).toEqual(expect.arrayContaining(['path-item.$ref', 'path-item.get']));
  });

  it('names a schema keyword, each type it gives and the format it gives', () => {
    const schema = {
      type: ['string', 'null'],
      format: 'uuid',
      properties: { a: { type: 'array', items: false } },
    };

    expect(used(withSchema(schema))).toEqual(
      expect.arrayContaining([
        'components.schemas',
        'components[a component name]',
        'keyword:type',
        'text:a list of types (`type: [..]`)',
        'type:string',
        'type:null',
        'keyword:format',
        'text:format: uuid',
        'keyword:properties',
        'type:array',
        'keyword:items',
        'text:`false` as a schema',
      ]),
    );
  });

  it('names a format no specification defines, and a keyword no vocabulary defines', () => {
    const found = used(withSchema({ format: 'kestrel', nullable: true }));

    expect(found).toContain('text:format: a value no specification defines');
    expect(found).toContain('text:a keyword no vocabulary defines');
  });

  it('names a `const` or an `enum` member that is an object or an array', () => {
    expect(used(withSchema({ const: { a: 1 } }))).toContain(
      'text:`const` or an `enum` member that is an object or array',
    );
    expect(used(withSchema({ enum: ['a', ['b']] }))).toContain(
      'text:`const` or an `enum` member that is an object or array',
    );
    expect(used(withSchema({ enum: ['a', null] }))).not.toContain(
      'text:`const` or an `enum` member that is an object or array',
    );
  });

  it('names an extension by where it is: a document object, a schema, or an object in one', () => {
    expect(used({ 'x-kestrel': 1 })).toEqual(['specification-extensions[an `x-` extension]']);
    expect(used(withSchema({ 'x-kestrel': 1 }))).toContain('text:`x-` extension on a schema');
    expect(used(withSchema({ xml: { name: 'k', nodeType: 'attribute', 'x-kestrel': 1 } }))).toEqual(
      expect.arrayContaining([
        'schema.xml',
        'xml.name',
        'xml.nodeType=attribute',
        'extensible[an `x-` extension]',
      ]),
    );
  });

  it('reports a field no row names, in order, and does not call it used', () => {
    const found = rowsUsedBy({ swagger: '2.0', host: 'example.com' }, ROWS);

    expect([...found.used]).toEqual([]);
    expect(found.unrecognised).toEqual(['openapi.host', 'openapi.swagger']);
  });

  it('names a map by its own rows, and not by the keywords the rows narrow', () => {
    const map = {
      type: 'object',
      additionalProperties: { type: 'string' },
      propertyNames: { type: 'string' },
      minProperties: 1,
    };
    const found = used(withSchema(map));

    expect(found).toEqual(
      expect.arrayContaining([
        'text:a map: `additionalProperties` with a schema',
        'text:a map: a `propertyNames` that refuses no name',
        'keyword:minProperties',
        'type:string',
      ]),
    );
    expect(found).not.toContain('keyword:additionalProperties');
    expect(found).not.toContain('keyword:propertyNames');
  });

  it.each([
    ['names a property', { properties: { a: {} } }],
    ['is composed', { allOf: [{}] }],
    ['states no type', { type: undefined }],
  ])('names the keywords themselves where the schema %s', (_, beside) => {
    const schema = {
      type: 'object',
      additionalProperties: { type: 'string' },
      propertyNames: { type: 'string' },
      ...beside,
    };
    const found = used(withSchema(JSON.parse(JSON.stringify(schema))));

    expect(found).toEqual(
      expect.arrayContaining(['keyword:additionalProperties', 'keyword:propertyNames']),
    );
    expect(found).not.toContain('text:a map: `additionalProperties` with a schema');
    expect(found).not.toContain('text:a map: a `propertyNames` that refuses no name');
  });

  it('names `additionalProperties: false` by its own row, wherever it stands', () => {
    const schema = { type: 'object', properties: { a: {} }, additionalProperties: false };
    const found = used(withSchema(schema));

    expect(found).toContain('text:`additionalProperties: false`');
    expect(found).not.toContain('keyword:additionalProperties');
  });

  it.each([
    ['`true`', true],
    ['the empty schema', {}],
  ])('names the keyword where `additionalProperties` is %s', (_, additionalProperties) => {
    const found = used(withSchema({ type: 'object', additionalProperties }));

    expect(found).toContain('keyword:additionalProperties');
    expect(found).not.toContain('text:a map: `additionalProperties` with a schema');
  });

  it('names the keyword where `propertyNames` can refuse a name', () => {
    const schema = { type: 'object', propertyNames: { type: 'string', pattern: '^a' } };
    const found = used(withSchema(schema));

    expect(found).toContain('keyword:propertyNames');
    expect(found).not.toContain('text:a map: a `propertyNames` that refuses no name');
  });
});
