import { describe, expect, test } from 'vitest';
import type {
  OpenAPIDocument,
  ParameterObject,
  ReferenceObject,
} from '../../../../shared/openapi-types.js';

import { buildSingleParameter } from './builder.parameters.js';
import type { IRBuildContext } from '../builder.types.js';

function createContext(doc: OpenAPIDocument): IRBuildContext {
  return {
    doc,
    path: ['/users/{id}', 'get'],
    required: false,
  };
}

describe('buildSingleParameter strict ref resolution', () => {
  test('resolves valid parameter component refs', () => {
    const doc: OpenAPIDocument = {
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
    const doc: OpenAPIDocument = {
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
    const doc: OpenAPIDocument = {
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

  test('falls back to examples.default.dataValue for the singular example', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const parameter: ParameterObject = {
      name: 'filter',
      in: 'query',
      schema: {
        type: 'string',
        example: 'schema fallback should not be used',
      },
      examples: {
        default: {
          summary: 'Filter with spaces',
          dataValue: 'active devices',
          serializedValue: 'active%20devices',
        },
      },
    };

    const result = buildSingleParameter(parameter, createContext(doc));

    expect(result.example).toBe('active devices');
    expect(result.examples).toEqual(parameter.examples);
  });

  test('prefers examples.default.value over dataValue for the singular example', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const parameter: ParameterObject = {
      name: 'filter',
      in: 'query',
      schema: {
        type: 'string',
        example: 'schema fallback should not be used',
      },
      examples: {
        default: {
          value: 'value wins',
          dataValue: 'dataValue loses',
          serializedValue: 'value%20wins',
        },
      },
    };

    const result = buildSingleParameter(parameter, createContext(doc));

    expect(result.example).toBe('value wins');
    expect(result.examples).toEqual(parameter.examples);
  });

  test('does not derive the singular example from serializedValue alone', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const parameter: ParameterObject = {
      name: 'filter',
      in: 'query',
      schema: {
        type: 'string',
        example: 'schema fallback',
      },
      examples: {
        default: {
          serializedValue: 'active%20devices',
        },
      },
    };

    const result = buildSingleParameter(parameter, createContext(doc));

    expect(result.example).toBe('schema fallback');
    expect(result.examples).toEqual(parameter.examples);
  });

  test('derives a compatibility schema from itemSchema-only parameter content', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const parameter: ParameterObject = {
      name: 'phase-e-filter',
      in: 'query',
      content: {
        'application/x-ndjson': {
          itemSchema: {
            type: 'string',
            minLength: 1,
          },
        },
      },
    };

    const result = buildSingleParameter(parameter, createContext(doc));
    const mediaType = result.content?.['application/x-ndjson'];

    expect(result.schema.type).toBe('string');
    expect(mediaType).toBeDefined();
    if (!mediaType || '$ref' in mediaType) {
      throw new Error('Expected inline media type entry');
    }

    expect(mediaType.itemSchema?.type).toBe('string');
    expect(mediaType.itemSchema?.minLength).toBe(1);
  });
});
