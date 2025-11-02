/**
 * E2E Test Matrix for Programmatic Usage
 *
 * These tests define ACCEPTANCE CRITERIA for Phase 1 implementation.
 * They test WHAT should work, not HOW it works (that's what unit tests do).
 *
 * Based on: .agent/analysis/E2E-TEST-MATRIX.md
 *
 * Test Priorities:
 * - P0 (8 scenarios): MUST pass before Phase 1 complete
 * - P1 (4 scenarios): SHOULD pass (nice to have)
 */

import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';

/**
 * Type guard to assert that generateZodClientFromOpenAPI returned a string.
 *
 * The function can return `string | Record<string, string>` depending on
 * whether grouped output is used. This helper makes our assumption explicit
 * and fails fast with a clear message if it's wrong.
 */
function assertIsString(value: unknown, context: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(
      `Expected string result in ${context}, got ${typeof value}. ` +
        `This likely means grouped output was unexpectedly enabled.`,
    );
  }
}

/**
 * Type-safe wrapper around SwaggerParser.dereference().
 *
 * SwaggerParser uses openapi-types internally, but we use openapi3-ts throughout
 * this codebase. These types are structurally compatible (same properties) but
 * nominally different (different package origins).
 *
 * This wrapper explicitly handles the type boundary with `as unknown as` to avoid
 * lying about types while acknowledging this is a known-safe conversion.
 *
 * @param pathOrSpec - Either a file path string or an OpenAPIObject to dereference
 */
async function dereferenceSpec(pathOrSpec: string | OpenAPIObject): Promise<OpenAPIObject> {
  // @ts-expect-error TS2345 - SwaggerParser.dereference() accepts openapi-types, not openapi3-ts types
  // Both are structurally compatible (same OpenAPI 3.0 spec), but TypeScript treats them as incompatible
  const spec = await SwaggerParser.dereference(pathOrSpec as unknown);
  // Explicit type boundary: openapi-types -> openapi3-ts
  // Safe because both packages model the same OpenAPI 3.0 spec
  return spec as unknown as OpenAPIObject;
}

/**
 * Category 1: Programmatic Usage - Internal Refs Only
 * Tests specs with only internal component references (no external files)
 */
describe('E2E: Programmatic Usage - Internal Refs Only', () => {
  /**
   * Scenario 1.1 (P0): Spec with internal component schema refs
   *
   * Acceptance Criteria:
   * - Named schemas exported (export const User)
   * - Uses z.object
   * - NO type assertions
   */
  it('should generate named schemas from components.schemas', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
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
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const User');
    expect(result).toContain('z.object');
    expect(result).not.toContain('as unknown as');
    expect(result).not.toMatch(/ as (?!const\b)/); // No type assertions except 'as const'
  });

  /**
   * Scenario 1.2 (P0): Spec with nested component refs (dependency tracking)
   *
   * Acceptance Criteria:
   * - Schemas ordered by dependencies (Address before User)
   * - Both schemas exported
   */
  it('should handle schema dependencies correctly', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Address: {
            type: 'object',
            properties: { street: { type: 'string' } },
          },
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { $ref: '#/components/schemas/Address' },
            },
          },
        },
      },
      paths: {},
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
      options: { shouldExportAllSchemas: true }, // Export schemas even with no endpoints
    });
    assertIsString(result, 'Scenario 1.2: dependency order with $refs');

    // Acceptance criteria:
    // Address must be defined before User
    const addressPos = result.indexOf('export const Address');
    const userPos = result.indexOf('export const User');
    expect(addressPos).toBeGreaterThan(0);
    expect(userPos).toBeGreaterThan(addressPos);
  });

  /**
   * Scenario 1.3 (P1): Spec with circular refs
   *
   * Acceptance Criteria:
   * - Uses z.lazy() for circular references
   * - Named schema exported
   */
  it('should handle circular references with z.lazy()', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              children: {
                type: 'array',
                items: { $ref: '#/components/schemas/Node' },
              },
            },
          },
        },
      },
      paths: {},
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
      options: { shouldExportAllSchemas: true }, // Export schemas even with no endpoints
    });

    // Acceptance criteria:
    expect(result).toContain('z.lazy(');
    expect(result).toContain('export const Node');
  });
});

/**
 * Category 2: Programmatic Usage - After Dereferencing
 * Tests behavior when caller dereferences spec before passing to our API
 */
describe('E2E: Programmatic Usage - After SwaggerParser.dereference()', () => {
  /**
   * Scenario 2.1 (P0): Caller dereferences spec before passing
   *
   * Acceptance Criteria:
   * - Even after dereference, component schemas extracted as named exports
   * - Uses z.object
   */
  it('should still extract named schemas from components', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
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

    // User dereferences before calling our API
    const dereferenced = await dereferenceSpec(spec);

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
      options: { shouldExportAllSchemas: true }, // Export all schemas from components
    });

    // Acceptance criteria:
    // Even after dereference, component schemas should be extracted as named exports
    expect(result).toContain('export const User');
    expect(result).toContain('z.object');
  });

  /**
   * Scenario 2.2 (P0): Spec with external refs (requires dereferencing)
   *
   * Acceptance Criteria:
   * - Named schemas exported
   * - No $ref in output
   * - No type assertions
   */
  it('should work with external refs after dereferencing', async () => {
    // This test uses actual files with external $refs
    const spec = await dereferenceSpec('./examples/openapi/v3.0/petstore.yaml');

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const');
    expect(result).not.toContain('$ref'); // Should not leak $ref into generated code
    expect(result).not.toContain('as unknown as');
  });
});

/**
 * Category 3: CLI Usage
 * Tests that CLI behavior matches programmatic usage
 * Note: CLI automatically calls SwaggerParser.dereference() internally
 */
describe('E2E: CLI Usage', () => {
  /**
   * Scenario 3.1 (P0): CLI with file containing external refs
   *
   * Acceptance Criteria:
   * - Named schemas exported
   * - No type assertions
   *
   * Note: This would test via execSync in real implementation.
   * For now, we simulate CLI behavior (which auto-dereferences).
   */
  it('should handle external refs via CLI path', async () => {
    // CLI automatically calls SwaggerParser.dereference()
    const spec = await dereferenceSpec('./examples/openapi/v3.0/petstore.yaml');

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const');
    expect(result).not.toContain('as unknown as');
  });

  /**
   * Scenario 3.2 (P1): CLI with inline spec (no external refs)
   *
   * Acceptance Criteria:
   * - Named schemas exported from inline spec
   */
  it('should work with inline specs via CLI path', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
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

    // CLI would dereference even if not needed
    const dereferenced = await dereferenceSpec(spec);

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
      options: { shouldExportAllSchemas: true }, // Export all schemas from components
    });

    // Acceptance criteria:
    expect(result).toContain('export const User');
  });
});

/**
 * Category 4: Operation-Level Refs
 * Tests refs in operation parameters, requestBody, responses
 * These should be dereferenced by caller (or will be handled gracefully)
 */
describe('E2E: Operation-Level Refs', () => {
  /**
   * Scenario 4.1 (P0): Refs in operation.parameters
   *
   * Acceptance Criteria:
   * - After dereference, operation.parameters should NOT have $refs
   * - No type assertions
   */
  it('should handle $refs in operation.parameters', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        parameters: {
          PageParam: {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
        },
      },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            parameters: [{ $ref: '#/components/parameters/PageParam' }],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const dereferenced = await dereferenceSpec(spec);
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    // After dereference, operation.parameters should NOT have $refs
    expect(result).toContain('page');
    expect(result).not.toContain('as unknown as');
  });

  /**
   * Scenario 4.2 (P0): Refs in operation.requestBody
   *
   * Acceptance Criteria:
   * - Request body schema handled correctly
   * - No type assertions
   */
  it('should handle $refs in operation.requestBody', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        requestBodies: {
          UserBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
        },
      },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            requestBody: { $ref: '#/components/requestBodies/UserBody' },
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const dereferenced = await dereferenceSpec(spec);
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('name');
    expect(result).not.toContain('as unknown as');
  });

  /**
   * Scenario 4.3 (P0): Refs in operation.responses
   *
   * Acceptance Criteria:
   * - Response schema handled correctly
   * - No type assertions
   */
  it('should handle $refs in operation.responses', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        responses: {
          UserResponse: {
            description: 'User response',
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
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUserById',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': { $ref: '#/components/responses/UserResponse' },
            },
          },
        },
      },
    };

    const dereferenced = await dereferenceSpec(spec);
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('id');
    expect(result).not.toContain('as unknown as');
  });
});

/**
 * Category 5: Special Characters and Edge Cases
 * Tests handling of special characters in schema names and properties
 */
describe('E2E: Edge Cases', () => {
  /**
   * Scenario 5.1 (P1): Schema names with special characters
   *
   * Acceptance Criteria:
   * - Schema name preserved
   * - Property names with special chars handled
   */
  it('should handle schema names with special characters', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          SpecialProps: {
            type: 'object',
            properties: {
              'kebab-case': { type: 'string' },
              'dot.notation': { type: 'number' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SpecialProps' },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const SpecialProps');
    expect(result).toContain('kebab-case');
    expect(result).toContain('dot.notation');
  });
});

/**
 * Category 6: Templates and Options
 * Tests that different templates preserve correct behavior
 */
describe('E2E: Templates', () => {
  /**
   * Scenario 6.1 (P1): schemas-with-metadata template preserves schema names
   *
   * Acceptance Criteria:
   * - Named schemas exported
   * - No type assertions
   */
  it('should preserve schema names in schemas-with-metadata template', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
      paths: {},
    };

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      template: 'schemas-with-metadata',
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(result).toContain('export const User');
    expect(result).not.toContain('as unknown as');
  });
});
