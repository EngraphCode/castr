import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test, describe } from 'vitest';
import type { OpenAPIObject as OpenAPI30Object } from 'openapi3-ts/oas30';
import type { OpenAPIObject as OpenAPI31Object } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../../src/index.js';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';

/**
 * OAS 3.0 vs 3.1 Feature Parity Test
 *
 * Purpose: Verify that the codebase correctly handles both OpenAPI 3.0 and 3.1 specs.
 *
 * This library supports OpenAPI 3.0.x and 3.1.x.
 *
 * Key Differences Tested:
 * 1. OpenAPI 3.0.x: supported, generates code
 * 2. OpenAPI 3.1.x: supported, generates code with 3.1-specific features
 * 3. Both versions produce valid Zod schemas
 *
 * Note: Fixtures go through the public input pipeline so version-specific specs can
 * stay statically typed while mixed-version compatibility cases still exercise the
 * real loading boundary.
 */

async function generateFromFixture(openApiDoc: object) {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'castr-oas-parity-'));
  const input = path.join(tempDir, 'openapi.json');

  await writeFile(input, JSON.stringify(openApiDoc, null, 2));

  try {
    return await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      input,
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

describe('OAS 3.0 vs 3.1 Feature Parity', () => {
  test('OAS 3.0: exclusiveMinimum as boolean + minimum', async () => {
    const openApiDoc: OpenAPI30Object = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/NumericConstraints' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          NumericConstraints: {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
                minimum: 18,
                exclusiveMinimum: true, // OAS 3.0 style
              },
              score: {
                type: 'number',
                maximum: 100,
                exclusiveMaximum: true, // OAS 3.0 style
              },
            },
          },
        },
      },
    };

    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate gt() for exclusive minimum with boolean
    expect(output.content).toContain('gt(18)');
    // Should generate lt() for exclusive maximum with boolean
    expect(output.content).toContain('lt(100)');
  });

  test('OAS 3.1: exclusiveMinimum as number (standalone)', async () => {
    const openApiDoc: OpenAPI31Object = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/NumericConstraints' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          NumericConstraints: {
            type: 'object',
            properties: {
              age: {
                type: 'integer',
                exclusiveMinimum: 18, // OAS 3.1 style - no separate minimum
              },
              score: {
                type: 'number',
                exclusiveMaximum: 100, // OAS 3.1 style - no separate maximum
              },
            },
          },
        },
      },
    };

    // OpenAPI 3.1.x is now supported - should generate code successfully
    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate gt() for exclusive minimum
    expect(output.content).toContain('gt(18)');
    // Should generate lt() for exclusive maximum
    expect(output.content).toContain('lt(100)');
  });

  test('OAS 3.0: nullable property', async () => {
    const openApiDoc: OpenAPI30Object = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
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
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                nullable: true, // OAS 3.0 style
              },
            },
            required: ['name'],
          },
        },
      },
    };

    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate .nullable() for nullable property
    expect(output.content).toContain('nullable()');
  });

  test('OAS 3.1: type array with null', async () => {
    const openApiDoc: OpenAPI31Object = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
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
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: {
                type: ['string', 'null'], // OAS 3.1 style
              },
            },
            required: ['name'],
          },
        },
      },
    };

    // OpenAPI 3.1.x is now supported - should generate code successfully
    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate valid Zod schema
    expect(output.content).toBeDefined();
    expect(output.content).toContain('z.');
  });

  test('OAS 3.1: standalone type null', async () => {
    const openApiDoc: OpenAPI31Object = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/NullValue' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          NullValue: {
            type: 'null', // OAS 3.1 feature
          },
        },
      },
    };

    // OpenAPI 3.1.x is now supported - should generate code successfully
    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate valid Zod schema
    expect(output.content).toBeDefined();
    expect(output.content).toContain('z.');
  });

  test('OAS 3.1: multiple types in array', async () => {
    const openApiDoc: OpenAPI31Object = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/FlexibleValue' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          FlexibleValue: {
            type: ['string', 'number', 'boolean'], // OAS 3.1 feature
          },
        },
      },
    };

    // OpenAPI 3.1.x is now supported - should generate code successfully
    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate valid Zod schema
    expect(output.content).toBeDefined();
    expect(output.content).toContain('z.');
  });

  test('Mixed: Both OAS 3.0 and 3.1 features in same spec', async () => {
    // This is a realistic scenario - specs often mix features
    const openApiDoc = {
      openapi: '3.1.0', // Declared as 3.1
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/MixedFeatures' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          MixedFeatures: {
            type: 'object',
            properties: {
              // OAS 3.0 style nullable
              legacyField: {
                type: 'string',
                nullable: true,
              },
              // OAS 3.1 style type array
              modernField: {
                type: ['string', 'null'],
              },
              // OAS 3.1 numeric exclusive bounds
              age: {
                type: 'integer',
                exclusiveMinimum: 0,
              },
            },
          },
        },
      },
    };

    // OpenAPI 3.1.x is now supported - should generate code successfully
    const output = await generateFromFixture(openApiDoc);
    assertSingleFileResult(output);

    // Should generate valid Zod schema
    expect(output.content).toBeDefined();
    expect(output.content).toContain('z.');
  });
});
