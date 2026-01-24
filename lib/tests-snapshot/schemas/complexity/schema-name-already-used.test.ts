import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

/**
 * Test: schema-name-already-used
 *
 * BEHAVIORAL INTENT: When multiple operations use the same parameter name
 * but with different schemas, the generator should handle this gracefully
 * and produce valid output (no crashes, no undefined).
 */
test('schema-name-already-used', async () => {
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
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
          ],
        },
        put: {
          operationId: 'putTest',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
          parameters: [
            {
              // Same parameter name, DIFFERENT enum values
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
      },
    },
  };

  // BEHAVIOR: Should generate valid code even with name collisions
  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });
  assertSingleFileResult(result);

  // Both enum value sets should appear (no collision causing data loss)
  expect(result.content).toContain('xxx');
  expect(result.content).toContain('aaa');

  // No undefined in output (would indicate unresolved references)
  expect(result.content).not.toContain('undefined');
});
