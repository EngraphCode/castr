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

/**
 * One case for each row of a document outside a schema that the endpoint definitions
 * are proposed to carry as structure. The families not yet here have no cell.
 */
export const STRUCTURE_CASES: readonly StructureCase[] = [...PATHS_AND_OPERATIONS];
