/**
 * IR Validation Tests - Real-World Integration
 *
 * PROVES: IR works correctly on realistic API specifications
 *
 * @module ir-validation.integration.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from './template-context.js';
import { isCastrDocument } from './ir-validators.js';
import { assertSchemaComponent } from './ir-test-helpers.js';

describe('IR Validation - Real-World Integration', () => {
  test('handles a realistic API specification', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'User Management API' },
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', minimum: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', minimum: 1, maximum: 100 },
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
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                        total: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateUserRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'email'],
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              name: { type: ['string', 'null'] },
              profile: { $ref: '#/components/schemas/Profile' },
            },
          },
          Profile: {
            type: 'object',
            properties: {
              bio: { type: 'string' },
              avatar: { type: 'string', format: 'uri' },
            },
          },
          CreateUserRequest: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const ctx = getZodClientTemplateContext(openApiDoc);

    // PROVE: Complete IR is generated
    expect(ctx._ir).toBeDefined();
    expect(isCastrDocument(ctx._ir)).toBe(true);

    // PROVE: All schemas are captured
    expect(ctx._ir?.components?.length).toBe(3);
    const schemaNames = ctx._ir?.components?.map((c) => c.name) || [];
    expect(schemaNames).toContain('User');
    expect(schemaNames).toContain('Profile');
    expect(schemaNames).toContain('CreateUserRequest');

    // PROVE: All operations are captured
    expect(ctx._ir?.operations?.length).toBe(2);
    const operationIds = ctx._ir?.operations?.map((op) => op.operationId) || [];
    expect(operationIds).toContain('listUsers');
    expect(operationIds).toContain('createUser');

    // PROVE: Complex metadata is correct (nullable field in User)
    const userComponent = ctx._ir?.components?.find((c) => c.name === 'User');
    const userSchema = assertSchemaComponent(userComponent).schema;
    if (userSchema?.type === 'object' && userSchema.properties) {
      // name field is nullable
      expect(userSchema.properties.get('name')?.metadata.nullable).toBe(true);
      // email field is required and not nullable
      expect(userSchema.properties.get('email')?.metadata.required).toBe(true);
      expect(userSchema.properties.get('email')?.metadata.nullable).toBe(false);
    }

    // PROVE: Request body is correctly linked
    const createOp = ctx._ir?.operations?.find((op) => op.operationId === 'createUser');
    expect(createOp?.requestBody).toBeDefined();
    expect(createOp?.requestBody?.required).toBe(true);
  });
});
