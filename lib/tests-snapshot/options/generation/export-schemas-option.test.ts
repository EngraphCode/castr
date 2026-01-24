import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

/**
 * Test: shouldExportAllSchemas option
 *
 * BEHAVIORAL INTENT: When shouldExportAllSchemas is true,
 * both used AND unused schemas should appear in the generated output.
 * When false (default), only schemas actually referenced should appear.
 */
test('export-schemas-option', async () => {
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
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
        UnusedSchemas: {
          type: 'object',
          properties: {
            nested_prop: { type: 'boolean' },
            another: { type: 'string' },
          },
        },
      },
    },
  };

  // BEHAVIOR: With shouldExportAllSchemas=true, BOTH schemas should be in output
  const resultWithAll = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { shouldExportAllSchemas: true },
  });
  assertSingleFileResult(resultWithAll);

  // UnusedSchemas should appear when exporting all
  expect(resultWithAll.content).toContain('UnusedSchemas');
  expect(resultWithAll.content).toContain('Basic');
});
