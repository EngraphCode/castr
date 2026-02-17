import { describe, expect, test } from 'vitest';
import type { OpenAPIObject, ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';

import { buildSingleParameter } from './builder.parameters.js';
import type { IRBuildContext } from './builder.types.js';

function createContext(doc: OpenAPIObject): IRBuildContext {
  return {
    doc,
    path: ['/users/{id}', 'get'],
    required: false,
  };
}

describe('buildSingleParameter strict ref resolution', () => {
  test('resolves valid parameter component refs', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        parameters: {
          UserId: {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        },
      },
    };

    const ref: ReferenceObject = { $ref: '#/components/parameters/UserId' };
    const result = buildSingleParameter(ref, createContext(doc));

    expect(result).toMatchObject({
      name: 'id',
      in: 'path',
      required: true,
    } satisfies Partial<ParameterObject>);
  });

  test('throws on malformed parameter refs with actionable context', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: { parameters: {} },
    };

    const ref: ReferenceObject = { $ref: '#/components/parameters/' };

    expect(() => buildSingleParameter(ref, createContext(doc))).toThrow(
      /Invalid parameter reference.*Expected format/,
    );
  });

  test('throws on non-parameter component refs with actionable context', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: { type: 'object' },
        },
      },
    };

    const ref: ReferenceObject = { $ref: '#/components/schemas/User' };

    expect(() => buildSingleParameter(ref, createContext(doc))).toThrow(
      /Unsupported parameter reference.*Expected #\/components\/parameters\/\{name\}/,
    );
  });
});
