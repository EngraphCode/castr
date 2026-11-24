import { describe, expect, it } from 'vitest';

import { writeOpenApi } from '../../../writers/openapi/index.js';
import { buildIR } from '../index.js';

const DOCUMENT: object = {
  openapi: '3.1.0',
  info: { title: 'parameters at two levels', version: '1' },
  paths: {
    '/things/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
        { $ref: '#/components/parameters/Page' },
      ],
      get: {
        operationId: 'getThing',
        parameters: [{ name: 'q', in: 'query', schema: { type: 'number' } }],
        responses: { '200': { description: 'ok' } },
      },
      delete: {
        operationId: 'dropThing',
        parameters: [{ name: 'page', in: 'query', schema: { type: 'string' } }],
        responses: { '204': { description: 'gone' } },
      },
    },
  },
  components: {
    parameters: { Page: { name: 'page', in: 'query', schema: { type: 'integer' } } },
  },
};

function parametersOf(operationId: string): readonly string[] {
  const operation = buildIR(DOCUMENT).operations.find(
    (candidate) => candidate.operationId === operationId,
  );
  return (operation?.parameters ?? []).map(
    (parameter) =>
      `${parameter.in} ${parameter.name}: ${String(parameter.schema.type)}` +
      (parameter.required ? ', required' : ''),
  );
}

describe('the parameters of a path item and of its operation', () => {
  it("holds the operation's own where both state one of the same name and place", () => {
    expect(parametersOf('getThing')).toContain('query q: number');
    expect(parametersOf('getThing')).not.toContain('query q: string, required');
  });

  it("holds a path item's parameter that is given by reference to a component", () => {
    expect(parametersOf('getThing')).toEqual([
      'path id: string, required',
      'query page: integer',
      'query q: number',
    ]);
  });

  it("holds the operation's own in place of a referenced one of the same name and place", () => {
    expect(parametersOf('dropThing')).toEqual([
      'path id: string, required',
      'query q: string, required',
      'query page: string',
    ]);
  });

  it('holds each by its place, once', () => {
    const [operation] = buildIR(DOCUMENT).operations;

    expect(operation?.parametersByLocation.query.map((parameter) => parameter.name)).toEqual([
      'page',
      'q',
    ]);
  });

  it('is written back to OpenAPI with no parameter stated twice in one operation', () => {
    const written = writeOpenApi(buildIR(DOCUMENT));
    const pathItem = written.paths?.['/things/{id}'];
    const names = (pathItem?.get?.parameters ?? []).map((parameter) =>
      '$ref' in parameter ? parameter.$ref : `${parameter.in} ${parameter.name}`,
    );

    expect(names).toEqual(['path id', 'query q']);
    expect(pathItem?.parameters).toEqual([{ $ref: '#/components/parameters/Page' }]);
  });
});
