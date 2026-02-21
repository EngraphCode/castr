/**
 * Tests for IR-based MCP request body and response extraction.
 *
 * These tests verify that `resolveRequestBodySchemaFromIR` and
 * `resolvePrimarySuccessResponseSchemaFromIR` produce the same output
 * structure as the OpenAPI-based functions, but read from `CastrOperation`
 * instead of raw OpenAPI.
 *
 * @module template-context.mcp.responses.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import type { CastrSchema, CastrOperation, IRRequestBody, CastrResponse } from '../../ir/index.js';
import { createMockCastrSchemaNode } from '../../ir/index.js';
import {
  resolveRequestBodySchemaFromIR,
  resolvePrimarySuccessResponseSchemaFromIR,
} from './template-context.mcp.responses.js';

/**
 * Create a mock CastrSchema for testing.
 */
function createMockSchema(): CastrSchema {
  return {
    type: 'object',
    metadata: createMockCastrSchemaNode(),
  };
}

/**
 * Create a mock IRRequestBody for testing.
 */
function createMockRequestBody(
  options: { required?: boolean; contentType?: string; schema?: CastrSchema } = {},
): IRRequestBody {
  const {
    required = false,
    contentType = 'application/json',
    schema = createMockSchema(),
  } = options;
  return {
    required,
    content: {
      [contentType]: { schema },
    },
  };
}

/**
 * Create a mock CastrResponse with direct schema.
 */
function createMockResponseWithSchema(statusCode: string, schema: CastrSchema): CastrResponse {
  return {
    statusCode,
    schema,
  };
}

/**
 * Create a mock CastrResponse without schema (204 No Content style).
 */
function createMockResponseEmpty(statusCode: string): CastrResponse {
  return {
    statusCode,
  };
}

/**
 * Create a mock CastrResponse with content.
 */
function createMockResponseWithContent(
  statusCode: string,
  contentType: string,
  schema: CastrSchema,
): CastrResponse {
  return {
    statusCode,
    content: {
      [contentType]: { schema },
    },
  };
}

describe('resolveRequestBodySchemaFromIR', () => {
  test('returns undefined when operation has no request body', () => {
    // Use empty object cast to simulate missing optional property
    const operation = {} as Pick<CastrOperation, 'requestBody'>;

    const result = resolveRequestBodySchemaFromIR(operation);

    expect(result).toBeUndefined();
  });

  test('extracts schema from application/json content type', () => {
    const bodySchema = createMockSchema();
    const operation: Pick<CastrOperation, 'requestBody'> = {
      requestBody: createMockRequestBody({
        required: true,
        contentType: 'application/json',
        schema: bodySchema,
      }),
    };

    const result = resolveRequestBodySchemaFromIR(operation);

    expect(result).toBeDefined();
    expect(result?.schema).toBe(bodySchema);
    expect(result?.required).toBe(true);
  });

  test('handles optional request body (required: false)', () => {
    const bodySchema = createMockSchema();
    const operation: Pick<CastrOperation, 'requestBody'> = {
      requestBody: createMockRequestBody({
        required: false,
        schema: bodySchema,
      }),
    };

    const result = resolveRequestBodySchemaFromIR(operation);

    expect(result?.required).toBe(false);
  });

  test('finds first supported content type when multiple exist', () => {
    const jsonSchema = createMockSchema();
    const xmlSchema = createMockSchema();
    const operation: Pick<CastrOperation, 'requestBody'> = {
      requestBody: {
        required: true,
        content: {
          'application/xml': { schema: xmlSchema },
          'application/json': { schema: jsonSchema },
        },
      },
    };

    const result = resolveRequestBodySchemaFromIR(operation);

    // Should find application/json as a supported type
    expect(result).toBeDefined();
    expect(result?.schema).toBe(jsonSchema);
  });

  test('returns undefined when no supported content type exists', () => {
    const operation: Pick<CastrOperation, 'requestBody'> = {
      requestBody: {
        required: true,
        content: {
          'application/xml': { schema: createMockSchema() },
        },
      },
    };

    const result = resolveRequestBodySchemaFromIR(operation);

    expect(result).toBeUndefined();
  });
});

describe('resolvePrimarySuccessResponseSchemaFromIR', () => {
  test('returns undefined when operation has no responses', () => {
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    expect(result).toBeUndefined();
  });

  test('returns schema from first 2xx response', () => {
    const successSchema = createMockSchema();
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [
        createMockResponseWithSchema('200', successSchema),
        createMockResponseEmpty('400'),
      ],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    expect(result).toBe(successSchema);
  });

  test('ignores non-2xx responses', () => {
    const errorSchema = createMockSchema();
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [
        createMockResponseWithSchema('400', errorSchema),
        createMockResponseWithSchema('500', createMockSchema()),
      ],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    expect(result).toBeUndefined();
  });

  test('returns schema from lowest 2xx status code when multiple exist', () => {
    const ok200Schema = createMockSchema();
    const created201Schema = createMockSchema();
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [
        createMockResponseWithSchema('201', created201Schema),
        createMockResponseWithSchema('200', ok200Schema),
      ],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    // Should return 200 schema (lowest 2xx status code)
    expect(result).toBe(ok200Schema);
  });

  test('handles response with content instead of direct schema', () => {
    const contentSchema = createMockSchema();
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [createMockResponseWithContent('200', 'application/json', contentSchema)],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    expect(result).toBe(contentSchema);
  });

  test('returns undefined when success response has no schema', () => {
    const operation: Pick<CastrOperation, 'responses'> = {
      responses: [
        createMockResponseEmpty('204'), // No Content - no schema
      ],
    };

    const result = resolvePrimarySuccessResponseSchemaFromIR(operation);

    expect(result).toBeUndefined();
  });
});
