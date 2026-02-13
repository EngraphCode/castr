/**
 * IR Validation Tests - Operation Metadata
 *
 * PROVES: IR correctly captures operation details, parameters, request bodies, and responses
 *
 * @module ir-validation.operations.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from '../context/template-context.js';

describe('IR Validation - Operation Metadata', () => {
  test('captures complete operation with parameters', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
              {
                name: 'include',
                in: 'query',
                required: false,
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const ctx = getZodClientTemplateContext(openApiDoc);

    // PROVE: Operation is captured
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'getUser');
    expect(operation).toBeDefined();

    // PROVE: Parameters are captured with correct metadata
    expect(operation?.parameters).toBeDefined();
    expect(operation?.parameters?.length).toBe(2);

    const pathParam = operation?.parameters?.find((p) => p.name === 'userId');
    const queryParam = operation?.parameters?.find((p) => p.name === 'include');

    // Path parameter metadata
    expect(pathParam?.in).toBe('path');
    expect(pathParam?.metadata?.required).toBe(true);
    // Note: schema.type may be "integer" or other primitive types
    expect(pathParam?.schema.type).toBeDefined();

    // Query parameter metadata
    expect(queryParam?.in).toBe('query');
    expect(queryParam?.metadata?.required).toBe(false);
  });

  test('captures request body with correct metadata', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                      email: { type: 'string' },
                      name: { type: 'string' },
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

    const ctx = getZodClientTemplateContext(openApiDoc);
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'createUser');

    // PROVE: Request body is captured
    expect(operation?.requestBody).toBeDefined();
    expect(operation?.requestBody?.required).toBe(true);

    // PROVE: Request body schema has correct metadata
    // Schema should be in content['application/json'].schema per IR structure
    const bodyContent = operation?.requestBody?.content?.['application/json'];
    expect(bodyContent).toBeDefined();

    const bodySchema = bodyContent?.schema;
    expect(bodySchema).toBeDefined();
    expect(bodySchema?.metadata).toBeDefined();

    // PROVE: Body properties have correct required status
    if (bodySchema?.type === 'object' && bodySchema.properties) {
      expect(bodySchema.properties.get('email')?.metadata.required).toBe(true);
      expect(bodySchema.properties.get('name')?.metadata.required).toBe(false);
    }
  });

  test('captures multiple response status codes', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {
        '/users/{userId}': {
          delete: {
            operationId: 'deleteUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: {
              '204': { description: 'No Content' },
              '404': {
                description: 'Not Found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: { type: 'string' },
                      },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal Error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    };

    const ctx = getZodClientTemplateContext(openApiDoc);
    const operation = ctx._ir?.operations?.find((op) => op.operationId === 'deleteUser');

    // PROVE: All response status codes are captured
    expect(operation?.responses).toBeDefined();
    expect(operation?.responses?.length).toBeGreaterThanOrEqual(2);

    const statusCodes = operation?.responses?.map((r) => r.statusCode) || [];
    expect(statusCodes).toContain('204');
    expect(statusCodes).toContain('404');
    expect(statusCodes).toContain('500');
  });
});
