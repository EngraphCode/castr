import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import type { TemplateContextGroupStrategy } from '../../../src/template-context.js';

// https://github.com/astahmer/openapi-zod-client/issues/157
describe('file group strategy with multi-props object as query parameter', () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.1',
    info: {
      version: 'v1',
      title: 'file group strategy with multi-props object as query parameter',
    },
    paths: {
      '/api/v1/test': {
        post: {
          parameters: [
            {
              name: 'req',
              in: 'query',
              required: true,
              schema: {
                required: ['prop1', 'prop2'],
                type: 'object',
                properties: {
                  prop1: { type: 'integer', format: 'int32' },
                  prop2: { type: 'integer', format: 'int32' },
                },
              },
            },
          ],
          responses: {
            200: {
              description: 'OK',
            },
          },
        },
      },
    },
  };

  const runTest = async (groupStrategy: TemplateContextGroupStrategy): Promise<void> => {
    const output = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
      options: { groupStrategy },
    });

    // Use snapshot testing instead of hardcoded expectations
    // This is more maintainable as template output evolves
    expect(output).toMatchSnapshot();
  };

  test('tag file', () => runTest('tag-file'));
  test('method file', () => runTest('method-file'));
});
