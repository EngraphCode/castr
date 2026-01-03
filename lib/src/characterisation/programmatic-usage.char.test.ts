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
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { extractContent, assertAndExtractContent } from './test-utils.js';
import type { GenerationResult } from '../rendering/generation-result.js';

/**
 * Type guard to assert that generateZodClientFromOpenAPI returned a single file result.
 *
 * The function returns `GenerationResult` which is a discriminated union.
 * This helper makes our assumption explicit and fails fast with a clear message
 * if it's wrong, then extracts and returns the content.
 */
function assertAndExtractResult(value: unknown, context: string): string {
  return assertAndExtractContent(value as GenerationResult, context);
}

/**
 * Wrapper around prepareOpenApiDocument that handles both file paths and objects.
 *
 * The Scalar pipeline (via prepareOpenApiDocument) automatically bundles and
 * upgrades specs to OpenAPI 3.1, providing consistent dereferencing behavior.
 *
 * @param pathOrSpec - Either a file path string or an OpenAPIObject to process
 */
async function dereferenceSpec(pathOrSpec: string | OpenAPIObject): Promise<OpenAPIObject> {
  return prepareOpenApiDocument(pathOrSpec);
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
    expect(extractContent(result)).toContain('export const User');
    expect(extractContent(result)).toContain('.object({');
    expect(extractContent(result)).not.toContain('as unknown as');
    expect(extractContent(result)).not.toMatch(/ as (?!const\b)/); // No type assertions except 'as const'
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
    const content = assertAndExtractResult(result, 'Scenario 1.2: dependency order with $refs');

    // Acceptance criteria:
    // Address must be defined before User
    const addressPos = content.indexOf('export const Address');
    const userPos = content.indexOf('export const User');
    expect(addressPos).toBeGreaterThan(0);
    expect(userPos).toBeGreaterThan(addressPos);
  });

  /**
   * Scenario 1.3 (P1): Spec with circular refs
   *
   * Acceptance Criteria:
   * - Uses z.lazy() for circular references
   * - Named schema exported
   *
   * Note: Circular references are handled by the Scalar pipeline's bundling process
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
      // Note: Pipeline uses bundle mode which preserves $refs, allowing proper circular ref handling with z.lazy()
      disableWriteToFile: true,
      options: { shouldExportAllSchemas: true }, // Export schemas even with no endpoints
    });

    // Acceptance criteria:
    expect(extractContent(result)).toContain('z.lazy(');
    expect(extractContent(result)).toContain('export const Node');
  });
});

/**
 * Category 2: Programmatic Usage - After Dereferencing
 * Tests behavior when caller processes spec before passing to our API
 */
describe('E2E: Programmatic Usage - After prepareOpenApiDocument()', () => {
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
    expect(extractContent(result)).toContain('export const User');
    expect(extractContent(result)).toContain('.object({');
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
    expect(extractContent(result)).toContain('export const');
    expect(extractContent(result)).not.toContain('$ref'); // Should not leak $ref into generated code
    expect(extractContent(result)).not.toContain('as unknown as');
  });
});

/**
 * Category 3: CLI Usage
 * Tests that CLI behavior matches programmatic usage
 * Note: CLI automatically calls prepareOpenApiDocument() internally
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
    // CLI automatically calls prepareOpenApiDocument()
    const spec = await dereferenceSpec('./examples/openapi/v3.0/petstore.yaml');

    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    // Acceptance criteria:
    expect(extractContent(result)).toContain('export const');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    expect(extractContent(result)).toContain('export const User');
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
    expect(extractContent(result)).toContain('page');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    expect(extractContent(result)).toContain('name');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    expect(extractContent(result)).toContain('id');
    expect(extractContent(result)).not.toContain('as unknown as');
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
    expect(extractContent(result)).toContain('export const SpecialProps');
    expect(extractContent(result)).toContain('kebab-case');
    expect(extractContent(result)).toContain('dot.notation');
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
    expect(extractContent(result)).toContain('export const User');
    expect(extractContent(result)).not.toContain('as unknown as');
  });
});
