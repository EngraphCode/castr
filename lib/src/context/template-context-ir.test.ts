/**
 * IR Integration Tests for Template Context
 *
 * Tests for IRDocument population in template context.
 * Separated from main template-context.test.ts to respect file length limits.
 *
 * @module template-context-ir.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from './template-context.js';

/**
 * Test IR (Information Retrieval) integration
 */
describe('getZodClientTemplateContext - IR integration', () => {
  test('should populate _ir field with IRDocument', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {
        '/test': {
          get: {
            operationId: 'test',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/TestSchema' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          TestSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const result = getZodClientTemplateContext(openApiDoc);

    // IR field should be present
    expect(result._ir).toBeDefined();
    expect(result._ir).not.toBeNull();

    // IR should have expected structure
    expect(result._ir?.version).toBe('1.0.0');
    expect(result._ir?.info).toBeDefined();
    expect(result._ir?.components).toBeDefined();
    expect(result._ir?.operations).toBeDefined();
  });

  // eslint-disable-next-line complexity
  test('should populate IR with schemas from components', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          Profile: {
            type: 'object',
            properties: {
              bio: { type: 'string' },
            },
          },
        },
      },
    };

    const result = getZodClientTemplateContext(openApiDoc);

    // IR should contain components array
    expect(result._ir?.components).toBeDefined();
    expect(Array.isArray(result._ir?.components)).toBe(true);
    expect(result._ir?.components?.length).toBe(2);

    // Find User and Profile schemas
    const userComponent = result._ir?.components?.find((c) => c.name === 'User');
    const profileComponent = result._ir?.components?.find((c) => c.name === 'Profile');

    expect(userComponent).toBeDefined();
    expect(userComponent?.type).toBe('schema');
    expect(profileComponent).toBeDefined();
    expect(profileComponent?.type).toBe('schema');
  });

  test('should populate IR with operations from paths', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            responses: {
              '201': {
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
      components: {
        schemas: {},
      },
    };

    const result = getZodClientTemplateContext(openApiDoc);

    // IR should contain operations
    expect(result._ir?.operations).toBeDefined();
    expect(result._ir?.operations?.length).toBe(2);
    expect(result._ir?.operations?.some((op) => op.operationId === 'getUsers')).toBe(true);
    expect(result._ir?.operations?.some((op) => op.operationId === 'createUser')).toBe(true);
  });
});
