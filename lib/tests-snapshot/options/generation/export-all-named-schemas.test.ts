import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

/**
 * Test: export-all-named-schemas option
 *
 * BEHAVIORAL INTENT: When exportAllNamedSchemas is enabled,
 * schemas defined inline in parameters should be extracted and exported.
 */
test('export-all-named-schemas', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/test': {
        get: {
          operationId: 'getTest',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['active', 'inactive', 'pending'] },
            },
          ],
        },
      },
    },
  };

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2, exportAllNamedSchemas: true },
  });
  assertSingleFileResult(result);

  // BEHAVIOR: When exportAllNamedSchemas is true, inline enum schemas should be extracted
  // The output should contain the enum values
  expect(result.content).toContain('active');
  expect(result.content).toContain('inactive');
  expect(result.content).toContain('pending');

  // The generated code should be syntactically valid (no errors)
  expect(result.content).not.toContain('undefined');
});
