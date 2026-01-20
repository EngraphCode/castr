import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../generate-from-context.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

// Note: Test fixtures use partial OpenAPI objects for brevity
// They contain enough structure for the generator to work correctly
// Type assertions as OpenAPIObject are used for test fixtures only

describe('schemas-with-metadata template - Core Template Functionality', () => {
  it('should generate schemas with Zod', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object' as const,
                    properties: {
                      name: { type: 'string' as const },
                      email: { type: 'string' as const, format: 'email' },
                    },
                    required: ['name', 'email'],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'User created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object' as const,
                      properties: {
                        id: { type: 'string' as const },
                        name: { type: 'string' as const },
                        email: { type: 'string' as const },
                      },
                      required: ['id', 'name', 'email'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // Quote-style test removed - validation is covered by generated-code-validation.gen.test.ts
    // Verify Zod import exists (any quote style)
    expect(result.content).toMatch(/import.*from ['"]zod['"]/);

    // MUST export schemas (inline schemas are named based on operation, like createUser_Body)
    expect(result.content).toContain('export const ');
    expect(result.content).toMatch(/export const createUser_Body\s*=/);

    // Schemas are exported individually (not as grouped object)
    expect(result.content).not.toContain('export const schemas = {');

    // MUST export endpoints metadata
    expect(result.content).toContain('export const endpoints');

    // MUST export MCP tools
    expect(result.content).toContain('export const mcpTools');
    expect(result.content).toContain('tool: {');
    expect(result.content).toContain('httpOperation: {');
    // MCP tools generate TypeScript objects (not JSON strings), so keys don't have quotes
    expect(result.content).toContain('type: "object"');
  });

  it('should export schemas object with all schemas', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object' as const,
            properties: {
              id: { type: 'string' as const },
              name: { type: 'string' as const },
            },
            required: ['id', 'name'],
          },
          Error: {
            type: 'object' as const,
            properties: {
              message: { type: 'string' as const },
              code: { type: 'number' as const },
            },
            required: ['message'],
          },
        },
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST have individual schema exports (not grouped)
    expect(result.content).toContain('export const User');
    expect(result.content).toContain('export const Error');

    // MUST include schema definitions with zod (flexible formatting)
    expect(result.content).toContain('.object('); // Will match z.object( or z\n  .object(
    expect(result.content).toContain('.strict()'); // Schemas-with-metadata uses strict by default
  });

  it('should export endpoints array directly without makeApi', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            description: 'Get all users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' as const, items: { type: 'object' as const } },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: { type: 'object' as const },
                  },
                },
              },
            },
          },
        },
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' as const },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'object' as const },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST export endpoints directly
    expect(result.content).toContain('export const endpoints = [');

    // MUST include endpoint metadata
    expect(result.content).toContain('method:');
    expect(result.content).toContain('path:');
    expect(result.content).toContain('operationId:');

    // MUST use 'as const' for endpoints
    expect(result.content).toMatch(/export const endpoints = \[[\s\S]*\] as const/);
  });

  it('should generate MCP-compatible tool definitions', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            description: 'Create a new user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { id: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST export mcpTools
    expect(result.content).toContain('export const mcpTools');

    // MUST include structured MCP metadata
    expect(result.content).toContain('tool: {');
    expect(result.content).toContain('httpOperation: {');
    expect(result.content).toContain('security: {');
  });
});

describe('schemas-with-metadata template - CLI Flag Integration', () => {
  it('should work with --no-client CLI flag', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Test that noClient option uses schemas-with-metadata template
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      noClient: true,
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // When noClient is true, should generate schemas and endpoints
    expect(result.content).toContain('export const'); // Has exports
    expect(result.content).toContain('export const endpoints'); // Has endpoints array
  });
});

describe('schemas-with-metadata template - Engraph Use Case: Full Request Validation', () => {
  it('should generate full request validation schemas for all parameter types', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
              },
              {
                name: 'include',
                in: 'query',
                schema: { type: 'string', enum: ['profile', 'settings'] },
              },
              {
                name: 'x-api-key',
                in: 'header',
                required: true,
                schema: { type: 'string' },
              },
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST have request validation structure
    expect(result.content).toContain('request:');

    // MUST have separate schemas for each parameter type
    // Note: z.object may span multiple lines due to ts-morph formatting
    expect(result.content).toContain('pathParams:');
    expect(result.content).toContain('queryParams:');
    expect(result.content).toContain('headers:');

    // MUST include parameter names
    expect(result.content).toContain('userId');
    expect(result.content).toContain('include');
    expect(result.content).toContain('x-api-key');
  });

  it('should generate full response validation including all error responses', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: { type: 'object', properties: { id: { type: 'string' } } },
                  },
                },
              },
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { error: { type: 'string' } },
                    },
                  },
                },
              },
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { type: 'object', properties: { error: { type: 'string' } } },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST have responses structure
    expect(result.content).toContain('responses:');

    // MUST include ALL status codes
    expect(result.content).toMatch(/201.*:/);
    expect(result.content).toMatch(/400.*:/);
    expect(result.content).toMatch(/401.*:/);

    // MUST include descriptions
    expect(result.content).toContain('Created');
    expect(result.content).toContain('Bad Request');
    expect(result.content).toContain('Unauthorized');

    // MUST have schema property for each response
    expect(result.content).toMatch(/schema.*:/);
  });
});

describe('schemas-with-metadata template - Optional Validation Helpers', () => {
  it('should generate validation helpers when flag is enabled', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withValidationHelpers: true,
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST export validateRequest helper
    expect(result.content).toContain('export function validateRequest');

    // MUST have all parameter types in signature
    expect(result.content).toMatch(/pathParams.*:/);
    expect(result.content).toMatch(/queryParams.*:/);
    expect(result.content).toMatch(/headers.*:/);
    expect(result.content).toMatch(/body.*:/);

    // MUST export validateResponse helper
    expect(result.content).toContain('export function validateResponse');

    // MUST use .parse() for validation
    expect(result.content).toMatch(/\.parse\(/);
  });

  it('should NOT generate validation helpers when flag is disabled', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withValidationHelpers: false,
      disableWriteToFile: true,
    });

    // MUST NOT have validation helpers
    expect(result).not.toContain('export function validateRequest');
    expect(result).not.toContain('export function validateResponse');
  });
});

describe('schemas-with-metadata template - Optional Schema Registry', () => {
  it('should generate schema registry builder when flag is enabled', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withSchemaRegistry: true,
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // MUST export buildSchemaRegistry helper
    expect(result.content).toContain('export function buildSchemaRegistry');

    // MUST have rename option
    expect(result.content).toMatch(/rename.*:/);

    // MUST sanitize keys by default
    expect(result.content).toMatch(/replace\(\/\[.*\]\/g/);
  });

  it('should NOT generate schema registry builder when flag is disabled', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withSchemaRegistry: false,
      disableWriteToFile: true,
    });

    // MUST NOT have schema registry builder
    expect(result).not.toContain('export function buildSchemaRegistry');
  });
});

describe('schemas-with-metadata template - Strict Types & Fail-Fast Validation', () => {
  it("should generate STRICT types with NO 'any' in validation helpers", async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withValidationHelpers: true,
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // ✅ MUST use 'unknown', NOT 'any'
    expect(result.content).toMatch(/:\s*unknown/);

    // ❌ MUST NOT contain 'any' type
    expect(result.content).not.toMatch(/:\s*any[,;)\s]/);
    expect(result.content).not.toContain('Record<string, any>');
    expect(result.content).not.toMatch(/\)\s*:\s*any/);
  });

  it('should generate FAIL-FAST validation using .parse() not .safeParse()', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      withValidationHelpers: true,
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // ✅ MUST use .parse() for fail-fast
    expect(result.content).toMatch(/\.parse\(/);

    // ❌ MUST NOT use .safeParse() in helpers
    expect(result.content).not.toContain('.safeParse(');

    // ✅ MUST document that it throws
    expect(result.content).toMatch(/@throws/i);
  });

  it('should generate STRICT schemas with .strict() by default', async () => {
    const openApiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object' as const,
            properties: {
              id: { type: 'string' as const },
              name: { type: 'string' as const },
            },
            required: ['id'],
            // No additionalProperties: true
          },
        },
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
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
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: openApiDoc as unknown as OpenAPIObject,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    assertSingleFileResult(result);

    // ✅ MUST use .strict() for objects (reject unknown keys)
    expect(result.content).toMatch(/\.strict\(\)/);

    // ❌ MUST NOT use .passthrough() by default (unless additionalProperties: true)
    // Note: This test assumes default behavior; passthrough is valid if spec says so
    const resultString = result.content;
    if (!resultString.includes('additionalProperties')) {
      expect(result.content).not.toMatch(/\.passthrough\(\)/);
    }
  });
});
