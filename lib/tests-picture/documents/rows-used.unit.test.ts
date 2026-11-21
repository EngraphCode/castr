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
  'operation.callbacks',
  'callbacks[a callback expression]',
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
});
