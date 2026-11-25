/**
 * What a writer reads at one boundary, from the model alone.
 */

import { describe, it, expect } from 'vitest';

import { boundariesOf, parametersInForce, securityInForce, serversInForce } from './boundaries.js';
import type {
  Api,
  Boundaries,
  Operation,
  Parameter,
  Part,
  PathItem,
  Security,
  Server,
  Use,
} from './boundary.js';
import type { DefinitionId, TemplatePart } from './model.js';

const NOTHING = new Map<string, never>();

function at(name: string): DefinitionId {
  return { resource: { resource: 'the description' }, place: [{ step: 'named', name }] };
}

function use(name: string): Use {
  return { edge: { target: { state: 'resolved', to: at(name) } } };
}

function server(text: string): Server {
  return { address: [{ part: 'text', text }], variables: NOTHING, extensions: NOTHING };
}

function operation(more: Partial<Operation> = {}): Part {
  return {
    part: 'operation',
    is: {
      tags: [],
      parameters: [],
      responses: [],
      callbacks: NOTHING,
      deprecated: false,
      extensions: NOTHING,
      ...more,
    },
  };
}

function item(more: Partial<PathItem> = {}): Part {
  return {
    part: 'path-item',
    is: { parameters: [], operations: [], extensions: NOTHING, ...more },
  };
}

function parameter(name: string, location: Parameter['location'], description: string): Part {
  return {
    part: 'parameter',
    is: {
      name,
      location,
      description,
      required: location === 'path',
      deprecated: false,
      mayBeEmpty: false,
      carried: {
        by: 'shape',
        shape: { kind: 'by-kind', kinds: { string: 'any' } },
        styled: {
          style: location === 'path' ? 'simple' : 'form',
          explode: location !== 'path',
          reserved: false,
        },
      },
      examples: NOTHING,
      extensions: NOTHING,
    },
  };
}

function path(...parts: (string | { readonly variable: string })[]): readonly TemplatePart[] {
  return parts.map((part) =>
    typeof part === 'string'
      ? { part: 'text', text: part }
      : { part: 'variable', name: part.variable },
  );
}

function description(
  paths: Api['paths'],
  parts: Readonly<Record<string, Part>>,
  api: Partial<Api> = {},
): Boundaries {
  return {
    api: {
      title: 'An API',
      version: '1',
      servers: [server('/')],
      security: [],
      tags: [],
      paths,
      webhooks: NOTHING,
      extensions: NOTHING,
      ...api,
    },
    parts: Object.entries(parts).map(([name, part]) => ({ id: at(name), aliases: [name], part })),
    record: { unsaid: [] },
  };
}

describe('the boundaries of an API', () => {
  it('are two where one item is used at two paths, with one operation', () => {
    const model = description(
      [
        { path: path('/a'), item: use('shared') },
        { path: path('/b'), item: use('shared') },
      ],
      {
        shared: item({ operations: [{ method: { method: 'get' }, operation: use('read') }] }),
        read: operation({ name: 'read' }),
      },
    );
    const found = boundariesOf(model);

    expect(found.map((one) => one.path)).toEqual([path('/a'), path('/b')]);
    expect(found.map((one) => one.operation)).toEqual([at('read'), at('read')]);
  });

  it('are none at a path whose item has no operation, and the path is still held', () => {
    const model = description([{ path: path('/hidden'), item: use('empty') }], { empty: item() });

    expect(boundariesOf(model)).toEqual([]);
    expect(model.api.paths).toHaveLength(1);
  });
});

describe('what is in force at a boundary', () => {
  const key: Security = [[{ scheme: { target: { state: 'resolved', to: at('key') } }, asks: [] }]];
  const model = description(
    [{ path: path('/things/', { variable: 'id' }), item: use('things') }],
    {
      things: item({
        servers: [server('https://path.example')],
        parameters: [use('id'), use('trace-of-path')],
        operations: [
          { method: { method: 'get' }, operation: use('read') },
          { method: { method: 'delete' }, operation: use('remove') },
        ],
      }),
      read: operation({ parameters: [use('trace-of-read'), use('page')] }),
      remove: operation({ security: [], servers: [server('https://remove.example')] }),
      id: parameter('id', 'path', 'which thing'),
      'trace-of-path': parameter('trace', 'header', 'said of the path'),
      'trace-of-read': parameter('trace', 'header', 'said of the operation'),
      page: parameter('page', 'query', 'which page'),
    },
    { servers: [server('https://api.example')], security: key },
  );
  const [read, remove] = boundariesOf(model);

  it('is the path’s parameters, each replaced by the operation’s of the same name and place', () => {
    const inForce = read === undefined ? [] : parametersInForce(model, read);

    expect(inForce.map((one) => [one.name, one.location, one.description])).toEqual([
      ['id', 'path', 'which thing'],
      ['trace', 'header', 'said of the operation'],
      ['page', 'query', 'which page'],
    ]);
  });

  it('is the API’s security unless the operation states its own, which may be none', () => {
    expect(read && securityInForce(model, read)).toEqual(key);
    expect(remove && securityInForce(model, remove)).toEqual([]);
  });

  it('is the operation’s servers, else its path’s, else the API’s', () => {
    expect(read && serversInForce(model, read)).toEqual([server('https://path.example')]);
    expect(remove && serversInForce(model, remove)).toEqual([server('https://remove.example')]);
  });
});

describe('what a source left unsaid', () => {
  it('is in the record, so a style stated and the same style supplied are one value', () => {
    const parts = { things: item(), id: parameter('id', 'path', 'which thing') };
    const stated = description([{ path: path('/things'), item: use('things') }], parts);
    const supplied: Boundaries = {
      ...stated,
      record: { unsaid: [{ of: at('id'), fact: 'style', from: 'the text' }] },
    };

    expect([supplied.api, supplied.parts]).toEqual([stated.api, stated.parts]);
    expect(supplied.record).not.toEqual(stated.record);
  });
});

describe('security', () => {
  it('tells no requirement from one requirement that asks nothing', () => {
    const none: Security = [];
    const optional: Security = [[]];

    expect(none).not.toEqual(optional);
  });
});
