import type { OpenAPIObject } from '../../src/shared/openapi-types.js';
import { describe, expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

// https://github.com/astahmer/@engraph/castr/issues/61
describe('object-default-values', () => {
  test('strict objects with default values are correctly generated', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'object default values',
      },
      paths: {
        '/sample': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'empty-object',
                schema: {
                  type: 'object',
                  properties: { foo: { type: 'string' } },
                  additionalProperties: false,
                  default: {},
                },
              },
              {
                in: 'query',
                name: 'default-object',
                schema: {
                  type: 'object',
                  properties: { foo: { type: 'string' } },
                  additionalProperties: false,
                  default: { foo: 'bar' },
                },
              },
            ],
            responses: {
              '200': {
                description: 'response',
              },
            },
          },
        },
      },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    assertSingleFileResult(output);
    // Prove: strict objects with defaults are generated without error
    expect(output.content).toContain('z.strictObject');
    expect(output.content).toContain('foo: z.string().optional()');
  });

  test('a constrained map is written as a catchall on a strict object', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'a constrained map',
      },
      paths: {
        '/sample': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'ref-object',
                schema: {
                  type: 'object',
                  additionalProperties: { $ref: '#/components/schemas/MyComponent' },
                  default: { id: 1, name: 'foo' },
                },
              },
            ],
            responses: {
              '200': {
                description: 'response',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          MyComponent: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    assertSingleFileResult(output);

    // The map's default follows as an annotation, so the expression runs over several lines.
    const written = output.content.split(' ').join('').split('\n').join('');
    expect(written).toContain('z.strictObject({}).catchall(MyComponent)');
    expect(written).toContain('.meta({default:{id:1,name:"foo"}})');
  });
});
