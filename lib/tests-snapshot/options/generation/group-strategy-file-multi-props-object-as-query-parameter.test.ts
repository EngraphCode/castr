import type { OpenAPIObject } from '../../../src/shared/openapi-types.js';
import { describe, expect, test } from 'vitest';
import { assertGroupedFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import type { GenerationResult } from '../../../src/index.js';
import type { TemplateContextGroupStrategy } from '../../../src/schema-processing/context/template-context.js';

// https://github.com/astahmer/@engraph/castr/issues/157
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

  const runTest = async (
    groupStrategy: TemplateContextGroupStrategy,
  ): Promise<Extract<GenerationResult, { type: 'grouped' }>> => {
    const output = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
      options: { groupStrategy },
    });
    assertGroupedFileResult(output);
    return output;
  };

  test('tag file', async () => {
    const output = await runTest('tag-file');
    // Snapshot testing is more maintainable than hardcoded expectations as
    // template output evolves.
    expect(output.files).toMatchSnapshot();
  });
  test('method file', async () => {
    const output = await runTest('method-file');
    expect(output.files).toMatchSnapshot();
  });
});
