import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { Expectation, StructureCase } from './structure-case.js';

const OK = { '200': { description: 'ok' } };
const PLAIN = { responses: OK };

function documentOf(paths: UnknownRecord, more: UnknownRecord = {}): UnknownRecord {
  return { openapi: '3.1.0', info: { title: 'case', version: '1' }, paths, ...more };
}

function value(held: string | number): Expectation {
  return { kind: 'value', value: held };
}

const DIFFERENCE: Expectation = { kind: 'difference' };

/** A case about one path item: the construct on `/things`, against a control path item. */
function pathItem(
  field: string,
  item: UnknownRecord,
  control: UnknownRecord,
  expects: Expectation,
  more: UnknownRecord = {},
): StructureCase {
  return {
    rowId: `path-item.${field}`,
    document: documentOf({ '/things': item }, more),
    control: documentOf({ '/things': control }, more),
    expects,
  };
}

/** A case about one operation: `get /things` with the construct, against one without. */
function operation(
  field: string,
  with_: UnknownRecord,
  expects: Expectation,
  without: UnknownRecord = {},
): StructureCase {
  return {
    rowId: `operation.${field}`,
    document: documentOf({ '/things': { get: { ...PLAIN, ...with_ } } }),
    control: documentOf({ '/things': { get: { ...PLAIN, ...without } } }),
    expects,
  };
}

function method(name: string): StructureCase {
  return pathItem(
    name,
    { [name]: PLAIN },
    { [name === 'get' ? 'post' : 'get']: PLAIN },
    value(name),
  );
}

const QUERY_PARAMETER = { name: 'kestrel', in: 'query', schema: { type: 'string' } };

const PATHS_AND_OPERATIONS: readonly StructureCase[] = [
  {
    rowId: 'paths[a path template]',
    document: documentOf({ '/kestrels': { get: PLAIN } }),
    control: documentOf({ '/things': { get: PLAIN } }),
    expects: value('/kestrels'),
  },

  // Each method of a path item, against a path item with another method.
  ...['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].map(method),
  {
    ...method('query'),
    document: { ...documentOf({ '/things': { query: PLAIN } }), openapi: '3.2.0' },
    control: { ...documentOf({ '/things': { get: PLAIN } }), openapi: '3.2.0' },
  },
  {
    rowId: 'path-item.additionalOperations',
    document: {
      ...documentOf({ '/things': { additionalOperations: { COPY: PLAIN } } }),
      openapi: '3.2.0',
    },
    control: { ...documentOf({ '/things': { get: PLAIN } }), openapi: '3.2.0' },
    expects: value('COPY'),
  },

  pathItem('summary', { summary: 'kestrel', get: PLAIN }, { get: PLAIN }, value('kestrel')),
  pathItem('description', { description: 'kestrel', get: PLAIN }, { get: PLAIN }, value('kestrel')),
  pathItem(
    'parameters',
    { parameters: [QUERY_PARAMETER], get: PLAIN },
    { get: PLAIN },
    value('kestrel'),
  ),
  // A path item that is a reference to a named one: the name is what is held.
  pathItem('$ref', { $ref: '#/components/pathItems/Kestrel' }, { get: PLAIN }, value('Kestrel'), {
    components: { pathItems: { Kestrel: { get: PLAIN } } },
  }),

  operation('operationId', { operationId: 'kestrelById' }, value('kestrelById'), {
    operationId: 'thingById',
  }),
  operation('summary', { summary: 'kestrel' }, value('kestrel')),
  operation('description', { description: 'kestrel' }, value('kestrel')),
  operation('deprecated', { deprecated: true }, DIFFERENCE),
  operation('parameters', { parameters: [QUERY_PARAMETER] }, value('kestrel')),
  operation(
    'requestBody',
    {
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { kestrel: { type: 'string' } },
              additionalProperties: false,
            },
          },
        },
      },
    },
    value('kestrel'),
  ),
  operation('responses', { responses: { ...OK, '404': { description: 'none' } } }, value(404)),
  operation(
    'callbacks',
    { callbacks: { onKestrel: { '{$request.body#/url}': { post: PLAIN } } } },
    value('onKestrel'),
  ),
];

const STRING = { type: 'string' };
const STRINGS = { type: 'array', items: STRING };

/** `get` on a path, with the parameters given. */
function getWith(
  path: string,
  parameters: readonly UnknownRecord[],
  openapi: string,
): UnknownRecord {
  return { ...documentOf({ [path]: { get: { ...PLAIN, parameters } } }), openapi };
}

/**
 * A case about one parameter: the parameter with the construct, against the same
 * parameter without it or with another value. A parameter in the path is on
 * `/things/{id}`, and any other on `/things`.
 */
function parameter(
  row: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  openapi = '3.1.0',
): StructureCase {
  const path = with_['in'] === 'path' ? '/things/{id}' : '/things';
  return {
    rowId: `parameter.${row}`,
    document: getWith(path, [with_], openapi),
    control: getWith(path, [without], openapi),
    expects,
  };
}

const IN_QUERY = { name: 'q', in: 'query', schema: STRING };
const IN_PATH = { name: 'id', in: 'path', required: true, schema: STRING };
const MANY_IN_QUERY = { name: 'q', in: 'query', schema: STRINGS };

const KESTREL_IN_QUERY = { name: 'kestrel', in: 'query', schema: STRING };
const KESTREL_IN_QUERYSTRING = {
  name: 'kestrel',
  in: 'querystring',
  content: { 'application/x-www-form-urlencoded': { schema: { type: 'object' } } },
};
const MOVABLE = ['query', 'header', 'cookie'];

function location(name: string): StructureCase {
  return {
    rowId: `parameter.in=${name}`,
    document: getWith('/things', [{ ...KESTREL_IN_QUERY, in: name }], '3.1.0'),
    control: getWith('/things', [], '3.1.0'),
    expects: value('kestrel'),
    apartFrom: MOVABLE.filter((other) => other !== name).map((other) =>
      getWith('/things', [{ ...KESTREL_IN_QUERY, in: other }], '3.1.0'),
    ),
  };
}

/** A style, against the same parameter with another style its location allows. */
function style(name: string, base: UnknownRecord, other: string, openapi?: string): StructureCase {
  return parameter(
    `style=${name}`,
    { ...base, style: name },
    { ...base, style: other },
    value(name),
    openapi,
  );
}

const PARAMETERS: readonly StructureCase[] = [
  parameter('name', { ...IN_QUERY, name: 'kestrel' }, IN_QUERY, value('kestrel')),

  // A parameter in each location: its name is held, and the definitions differ from
  // those for the same parameter in each other location.
  location('query'),
  location('header'),
  location('cookie'),
  // A parameter in the path cannot move while its template stays, so this case shows
  // only that it is held.
  {
    rowId: 'parameter.in=path',
    document: getWith(
      '/things/{kestrel}',
      [{ ...KESTREL_IN_QUERY, in: 'path', required: true }],
      '3.1.0',
    ),
    control: getWith('/things', [], '3.1.0'),
    expects: value('kestrel'),
  },
  {
    rowId: 'parameter.in=querystring',
    document: getWith('/things', [KESTREL_IN_QUERYSTRING], '3.2.0'),
    control: getWith('/things', [], '3.2.0'),
    expects: value('kestrel'),
    apartFrom: MOVABLE.map((other) =>
      getWith('/things', [{ ...KESTREL_IN_QUERY, in: other }], '3.2.0'),
    ),
  },

  parameter(
    'required',
    { ...IN_QUERY, required: false },
    { ...IN_QUERY, required: true },
    DIFFERENCE,
  ),
  parameter('required=true', { ...IN_QUERY, required: true }, IN_QUERY, DIFFERENCE),
  parameter(
    'schema',
    { ...IN_QUERY, schema: { type: 'string', enum: ['kestrel'] } },
    IN_QUERY,
    value('kestrel'),
  ),
  parameter(
    'content',
    {
      name: 'q',
      in: 'query',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { kestrel: STRING },
            additionalProperties: false,
          },
        },
      },
    },
    IN_QUERY,
    value('kestrel'),
  ),
  parameter('description', { ...IN_QUERY, description: 'kestrel' }, IN_QUERY, value('kestrel')),
  parameter('deprecated', { ...IN_QUERY, deprecated: true }, IN_QUERY, DIFFERENCE),
  parameter('allowEmptyValue', { ...IN_QUERY, allowEmptyValue: true }, IN_QUERY, DIFFERENCE),
  parameter('allowReserved', { ...IN_QUERY, allowReserved: true }, IN_QUERY, DIFFERENCE),
  parameter(
    'explode',
    { ...MANY_IN_QUERY, explode: false },
    { ...MANY_IN_QUERY, explode: true },
    DIFFERENCE,
  ),

  style('form', MANY_IN_QUERY, 'pipeDelimited'),
  style('spaceDelimited', MANY_IN_QUERY, 'form'),
  style('pipeDelimited', MANY_IN_QUERY, 'form'),
  style(
    'deepObject',
    {
      name: 'q',
      in: 'query',
      schema: { type: 'object', properties: { a: STRING }, additionalProperties: false },
    },
    'form',
  ),
  style('simple', IN_PATH, 'label'),
  style('label', IN_PATH, 'simple'),
  style('matrix', IN_PATH, 'simple'),
  style('cookie', { ...IN_QUERY, in: 'cookie' }, 'form', '3.2.0'),
];

/**
 * One case for each row of a document outside a schema that the endpoint definitions
 * are proposed to carry as structure. The families not yet here have no cell.
 */
export const STRUCTURE_CASES: readonly StructureCase[] = [...PATHS_AND_OPERATIONS, ...PARAMETERS];
