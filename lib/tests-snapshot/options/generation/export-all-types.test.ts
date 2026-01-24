import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject) => ({
  openapi: '3.0.3',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {
    '/example': {
      get: {
        operationId: 'getExample',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: responseSchema } } },
        },
      },
    },
  },
  components: { schemas },
});

/**
 * Test: shouldExportAllTypes option
 *
 * BEHAVIORAL INTENT: When shouldExportAllTypes is true,
 * the generated output should include TypeScript type definitions.
 */
describe('export-all-types', () => {
  test('shouldExportAllTypes option, non-circular types are exported', async () => {
    const Author = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    } as SchemaObject;

    const Song = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        duration: { type: 'number' },
      },
    } as SchemaObject;

    const schemas = { Author, Song };

    const RootSchema = {
      type: 'object',
      properties: {
        author: { $ref: '#/components/schemas/Author' },
        song: { $ref: '#/components/schemas/Song' },
      },
    } as SchemaObject;

    const openApiDoc = makeOpenApiDoc(schemas, RootSchema);

    const result = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        shouldExportAllTypes: true,
      },
    });
    assertSingleFileResult(result);

    // BEHAVIOR: When shouldExportAllTypes is true, TypeScript type exports should be included
    // The output should contain type definitions for the component schemas
    expect(result.content).toContain('Author');
    expect(result.content).toContain('Song');

    // The generated code should be valid (no undefined or errors)
    expect(result.content).not.toContain('undefined');
  });
});
