/**
 * IR Characterization Tests - Operation Complexity
 *
 * PROVES: IR system works correctly on complex operation patterns like multiple content types, many parameters, etc.
 *
 * @module ir-real-world.operations.char.test
 */

import { generateZodClientFromOpenAPI } from '../../index.js';
import { getZodClientTemplateContext } from '../../schema-processing/context/index.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { assertAndGetSingleFileContent } from '../ir-test-helpers.js';

describe('IR Characterization - Real-World Specs', () => {
  describe('Operation Complexity', () => {
    test('handles operations with multiple content types', async () => {
      const multiContentDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Multi Content Test' },
        paths: {
          '/upload': {
            post: {
              operationId: 'uploadFile',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        filename: { type: 'string' },
                        content: { type: 'string' },
                      },
                    },
                  },
                  'multipart/form-data': {
                    schema: {
                      type: 'object',
                      properties: {
                        file: { type: 'string' }, // removed format: 'binary' because string formats must be emittable or fail-fast
                      },
                    },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(multiContentDoc);

      // PROVE: IR captures operation with multiple content types
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'uploadFile');
      expect(operation).toBeDefined();
      expect(operation?.requestBody).toBeDefined();

      // PROVE: Code generation handles multiple content types
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: multiContentDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      expect(content).toContain('uploadFile');
    });

    test('handles operations with many parameters', async () => {
      const manyParamsDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Many Parameters Test' },
        paths: {
          '/search': {
            get: {
              operationId: 'advancedSearch',
              parameters: [
                { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100 } },
                { name: 'sort', in: 'query', schema: { type: 'string' } },
                { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
                {
                  name: 'filter',
                  in: 'query',
                  schema: { type: 'array', items: { type: 'string' } },
                },
                { name: 'X-API-Key', in: 'header', required: true, schema: { type: 'string' } },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(manyParamsDoc);

      // PROVE: IR captures all parameters
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'advancedSearch');
      expect(operation).toBeDefined();
      expect(operation?.parameters?.length).toBe(7);

      // Every parameter must have metadata
      operation?.parameters?.forEach((param) => {
        expect(param.metadata).toBeDefined();
      });

      // PROVE: Code generation handles many parameters
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: manyParamsDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      expect(content).toContain('advancedSearch');
    });
  });
});
