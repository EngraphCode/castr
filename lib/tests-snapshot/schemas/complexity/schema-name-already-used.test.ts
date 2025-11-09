import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';

import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';
import {
  schemaNameAlreadyUsedContextSnapshot,
  schemaNameAlreadyUsedOutputSnapshot,
} from '../../__fixtures__/schemas/schema-name-already-used.js';

test('schema-name-already-used', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/schema-name-already-used': {
        get: {
          operationId: 'getSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['xxx', 'yyy', 'zzz'] },
            },
          ],
        },
        put: {
          operationId: 'putSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        delete: {
          operationId: 'deleteSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ddd', 'eee', 'fff'] },
            },
          ],
        },
        post: {
          operationId: 'postSchemaNameAlreadyUsed',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'schemaNameAlreadyUsed',
              in: 'query',
              schema: { type: 'string', enum: ['ggg', 'hhh', 'iii'] },
            },
          ],
        },
      },
    },
  };

  const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
  expect(ctx).toStrictEqual(schemaNameAlreadyUsedContextSnapshot);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { complexityThreshold: 2 },
  });

  expect(result).toBe(schemaNameAlreadyUsedOutputSnapshot);
});
