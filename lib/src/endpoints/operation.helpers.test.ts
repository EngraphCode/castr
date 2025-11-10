/**
 * Unit tests for endpoint.operation.helpers
 *
 * These tests define the expected behavior with the new doc-based context API.
 * Tests are written FIRST (TDD) to define the desired system state.
 */

import { describe, test, expect } from 'vitest';
import type {
  OpenAPIObject,
  ParameterObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import {
  processRequestBody,
  processParameter,
  processResponse,
  processDefaultResponse,
} from './operation.helpers.js';
import type { ConversionTypeContext } from '../conversion/zod/index.js';

/**
 * Helper to create minimal ConversionTypeContext for testing
 */
function createTestContext(doc: OpenAPIObject): ConversionTypeContext {
  return {
    doc,
    zodSchemaByName: {},
  };
}

/**
 * Helper to create minimal getZodVarName function for testing
 */
const mockGetZodVarName = (_input: { toString: () => string }, fallbackName?: string) => {
  return fallbackName ?? 'MockVarName';
};

describe('processRequestBody', () => {
  test('should handle inline request body schema', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const operation = {
      responses: {},
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', properties: { name: { type: 'string' } } } as SchemaObject,
          },
        },
      },
    };

    const result = processRequestBody(operation, ctx, 'createUser', mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.parameter.type).toBe('Body');
    expect(result?.requestFormat).toBe('json');
  });

  test('should handle request body with $ref to component', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        requestBodies: {
          UserBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                } as SchemaObject,
              },
            },
          },
        },
      },
    };
    const ctx = createTestContext(doc);

    const operation = {
      responses: {},
      requestBody: { $ref: '#/components/requestBodies/UserBody' },
    };

    const result = processRequestBody(operation, ctx, 'createUser', mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.parameter.type).toBe('Body');
    expect(result?.requestFormat).toBe('json');
  });

  test('should handle inline body schema with $ref to schema component', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
    };
    const ctx = createTestContext(doc);

    const operation = {
      responses: {},
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
    };

    const result = processRequestBody(operation, ctx, 'createUser', mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.parameter.type).toBe('Body');
  });

  test('should throw on nested $ref in requestBody', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        requestBodies: {
          UserBody: { $ref: '#/components/requestBodies/OtherBody' },
        },
      },
    };
    const ctx = createTestContext(doc);

    const operation = {
      responses: {},
      requestBody: { $ref: '#/components/requestBodies/UserBody' },
    };

    expect(() => processRequestBody(operation, ctx, 'createUser', mockGetZodVarName)).toThrow(
      /Unexpected \$ref/,
    );
  });

  test('should handle different request formats', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const formats = [
      { mediaType: 'application/json', expected: 'json' },
      { mediaType: 'application/x-www-form-urlencoded', expected: 'form-url' },
      { mediaType: 'multipart/form-data', expected: 'form-data' },
      { mediaType: 'application/octet-stream', expected: 'binary' },
      { mediaType: 'text/plain', expected: 'text' },
    ] as const;

    for (const { mediaType, expected } of formats) {
      const operation = {
        responses: {},
        requestBody: {
          content: {
            [mediaType]: {
              schema: { type: 'string' } as SchemaObject,
            },
          },
        },
      };

      const result = processRequestBody(operation, ctx, 'testOp', mockGetZodVarName);
      expect(result?.requestFormat).toBe(expected);
    }
  });
});

describe('processParameter', () => {
  test('should handle inline parameter schema', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'userId',
      in: 'query',
      schema: { type: 'string' },
    };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.name).toBe('userId');
    expect(result?.type).toBe('Query');
  });

  test('should handle parameter $ref to component', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        parameters: {
          UserId: {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
          },
        },
      },
    };
    const ctx = createTestContext(doc);

    const param = { $ref: '#/components/parameters/UserId' };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.name).toBe('userId');
    expect(result?.type).toBe('Query');
  });

  test('should handle parameter with schema $ref', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          UserId: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'userId',
      in: 'query',
      schema: { $ref: '#/components/schemas/UserId' },
    };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.name).toBe('userId');
  });

  test('should convert path parameter names correctly', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'user-id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeDefined();
    // pathParamToVariableName should convert kebab-case to camelCase
    expect(result?.name).toBe('userId');
    expect(result?.type).toBe('Path');
  });

  test('should skip parameters not in path/query/header', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'cookie',
      in: 'cookie',
      schema: { type: 'string' },
    };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeUndefined();
  });

  test('should handle parameter with content instead of schema', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'filter',
      in: 'query',
      content: {
        'application/json': {
          schema: { type: 'object', properties: { name: { type: 'string' } } },
        },
      },
    };

    const result = processParameter(param, ctx, mockGetZodVarName);

    expect(result).toBeDefined();
    expect(result?.name).toBe('filter');
  });

  test('should throw on nested $ref in parameter', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        parameters: {
          UserId: { $ref: '#/components/parameters/OtherId' },
        },
      },
    };
    const ctx = createTestContext(doc);

    const param = { $ref: '#/components/parameters/UserId' };

    expect(() => processParameter(param, ctx, mockGetZodVarName)).toThrow(/Unexpected \$ref/);
  });

  test('should throw on parameter without schema or content', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const param: ParameterObject = {
      name: 'invalid',
      in: 'query',
      // Missing both schema and content
    };

    expect(() => processParameter(param, ctx, mockGetZodVarName)).toThrow(
      /must have either 'schema' or 'content'/,
    );
  });
});

describe('processResponse', () => {
  test('should handle inline response schema', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const responseObj: ResponseObject = {
      description: 'Success',
      content: {
        'application/json': {
          schema: { type: 'object', properties: { id: { type: 'number' } } },
        },
      },
    };

    const result = processResponse('200', responseObj, ctx, mockGetZodVarName);

    expect(result.mainResponse).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should handle response $ref to component', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        responses: {
          SuccessResponse: {
            description: 'Success',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { id: { type: 'number' } } },
              },
            },
          },
        },
      },
    };
    const ctx = createTestContext(doc);

    const responseObj = { $ref: '#/components/responses/SuccessResponse' };

    const result = processResponse('200', responseObj, ctx, mockGetZodVarName);

    expect(result.mainResponse).toBeDefined();
  });

  test('should handle response with schema $ref', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } },
        },
      },
    };
    const ctx = createTestContext(doc);

    const responseObj: ResponseObject = {
      description: 'User found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/User' },
        },
      },
    };

    const result = processResponse('200', responseObj, ctx, mockGetZodVarName);

    expect(result.mainResponse).toBeDefined();
  });

  test('should classify responses by status code', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const schema = { type: 'object' } as SchemaObject;
    const responseObj: ResponseObject = {
      description: 'Response',
      content: { 'application/json': { schema } },
    };

    // 2xx = main response
    const result200 = processResponse('200', responseObj, ctx, mockGetZodVarName);
    expect(result200.mainResponse).toBeDefined();
    expect(result200.error).toBeUndefined();

    // 4xx/5xx = error
    const result404 = processResponse('404', responseObj, ctx, mockGetZodVarName);
    expect(result404.mainResponse).toBeUndefined();
    expect(result404.error).toBeDefined();
    expect(result404.error?.status).toBe(404);

    // default = neither main nor error
    const resultDefault = processResponse('default', responseObj, ctx, mockGetZodVarName);
    expect(resultDefault.mainResponse).toBeUndefined();
    expect(resultDefault.error).toBeUndefined();
  });

  test('should handle empty response (no content)', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const responseObj: ResponseObject = {
      description: 'No content',
    };

    const result = processResponse('204', responseObj, ctx, mockGetZodVarName, {
      withAllResponses: true,
    });

    expect(result.responseEntry).toBeDefined();
    expect(result.responseEntry?.schema).toBe('z.void()');
  });

  test('should throw on nested $ref in response', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        responses: {
          SuccessResponse: { $ref: '#/components/responses/OtherResponse' },
        },
      },
    };
    const ctx = createTestContext(doc);

    const responseObj = { $ref: '#/components/responses/SuccessResponse' };

    expect(() => processResponse('200', responseObj, ctx, mockGetZodVarName)).toThrow(
      /Unexpected \$ref/,
    );
  });
});

describe('processDefaultResponse', () => {
  test('should use default response as main when no 2xx response exists (auto-correct)', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const defaultResponse: ResponseObject = {
      description: 'Default',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    };

    const result = processDefaultResponse(
      defaultResponse,
      ctx,
      mockGetZodVarName,
      false, // No main response yet
      'auto-correct',
    );

    expect(result.mainResponse).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should use default response as error when main response exists (auto-correct)', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const defaultResponse: ResponseObject = {
      description: 'Default',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    };

    const result = processDefaultResponse(
      defaultResponse,
      ctx,
      mockGetZodVarName,
      true, // Main response exists
      'auto-correct',
    );

    expect(result.mainResponse).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe('default');
  });

  test('should ignore default response in spec-compliant mode with main response', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const defaultResponse: ResponseObject = {
      description: 'Default',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    };

    const result = processDefaultResponse(
      defaultResponse,
      ctx,
      mockGetZodVarName,
      true, // Main response exists
      'spec-compliant',
    );

    expect(result.mainResponse).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.shouldIgnoreFallback).toBe(true);
  });

  test('should ignore default response in spec-compliant mode without main response', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };
    const ctx = createTestContext(doc);

    const defaultResponse: ResponseObject = {
      description: 'Default',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    };

    const result = processDefaultResponse(
      defaultResponse,
      ctx,
      mockGetZodVarName,
      false, // No main response
      'spec-compliant',
    );

    expect(result.mainResponse).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.shouldIgnoreGeneric).toBe(true);
  });
});
