import type { OpenAPIDocument, ResponsesObject, SchemaObject } from '../../shared/openapi-types.js';

/**
 * Creates a minimal OpenAPI spec for testing edge cases.
 *
 * @param overrides - Partial spec to merge with defaults
 * @returns Complete OpenAPIDocument ready for testing
 */
export function createMinimalSpec(overrides?: Partial<OpenAPIDocument>): OpenAPIDocument {
  const defaultSpec: OpenAPIDocument = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
  };
  return { ...defaultSpec, ...overrides };
}

/**
 * Creates a spec with a single schema component.
 *
 * @param schemaName - Name of the schema
 * @param schema - Schema definition
 * @param paths - Optional paths to include
 * @returns Complete OpenAPIDocument
 */
export function createSpecWithSchema(
  schemaName: string,
  schema: SchemaObject,
  paths?: OpenAPIDocument['paths'],
): OpenAPIDocument {
  return createMinimalSpec({
    components: {
      schemas: {
        [schemaName]: schema,
      },
    },
    paths: paths ?? {},
  });
}

/**
 * Creates a spec with multiple schemas.
 *
 * @param schemaDefinitions - Object mapping schema names to schema definitions
 * @param paths - Optional paths to include
 * @returns Complete OpenAPIDocument
 */
export function createSpecWithSchemas(
  schemaDefinitions: Record<string, SchemaObject>,
  paths?: OpenAPIDocument['paths'],
): OpenAPIDocument {
  return createMinimalSpec({
    components: {
      schemas: schemaDefinitions,
    },
    paths: paths ?? {},
  });
}

/**
 * Creates a standard operation response schema reference.
 *
 * @param schemaRef - Reference to schema (e.g., '#/components/schemas/User')
 * @returns Response object with schema reference
 */
export function createResponseWithSchema(schemaRef: string): ResponsesObject {
  return {
    '200': {
      description: 'Success',
      content: {
        'application/json': {
          schema: { $ref: schemaRef },
        },
      },
    },
  };
}

/**
 * Creates multiple schema definitions for bulk testing.
 *
 * @param count - Number of schemas to create
 * @param schemaFactory - Function that creates a schema for a given index
 * @returns Record mapping schema names to schema definitions
 */
export function createMultipleSchemas(
  count: number,
  schemaFactory: (index: number) => SchemaObject,
): Record<string, SchemaObject> {
  const schemas: Record<string, SchemaObject> = {};
  for (let i = 0; i < count; i++) {
    schemas[`Schema${i}`] = schemaFactory(i);
  }
  return schemas;
}
