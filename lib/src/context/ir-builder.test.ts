/**
 * Tests for Information Retrieval (IR) Builder
 *
 * Following TDD: These tests are written FIRST (RED phase)
 * Implementation in ir-builder.ts will follow (GREEN phase)
 */

import { describe, expect, it } from 'vitest';
import type { ComponentsObject, OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { buildIR, buildIRSchemas } from './ir-builder.js';
import type { IRDocument } from './ir-schema.js';

describe('buildIRSchemas', () => {
  describe('primitive schemas', () => {
    it('should build IR for string schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Username: {
            type: 'string',
            description: 'User name',
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'schema',
        name: 'Username',
        schema: expect.objectContaining({
          type: 'string',
          metadata: expect.objectContaining({
            required: false,
            nullable: false,
          }),
        }),
      });
    });

    it('should build IR for number schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Age: {
            type: 'number',
            description: 'User age',
            minimum: 0,
            maximum: 150,
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.type).toBe('number');
      expect(result[0]?.name).toBe('Age');
    });

    it('should build IR for boolean schema', () => {
      const components: ComponentsObject = {
        schemas: {
          IsActive: {
            type: 'boolean',
            description: 'Active status',
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.type).toBe('boolean');
      expect(result[0]?.name).toBe('IsActive');
    });

    it('should build IR for integer schema', () => {
      const components: ComponentsObject = {
        schemas: {
          Count: {
            type: 'integer',
            format: 'int32',
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.type).toBe('integer');
    });

    it('should handle nullable primitive types (OAS 3.1)', () => {
      const components: ComponentsObject = {
        schemas: {
          NullableString: {
            type: ['string', 'null'],
            description: 'Optional string',
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.metadata.nullable).toBe(true);
    });

    it('should handle multiple primitive schemas', () => {
      const components: ComponentsObject = {
        schemas: {
          Name: { type: 'string' } as SchemaObject,
          Age: { type: 'number' } as SchemaObject,
          Active: { type: 'boolean' } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toEqual(['Name', 'Age', 'Active']);
    });
  });

  describe('object schemas', () => {
    it('should build IR for simple object schema with properties', () => {
      const components: ComponentsObject = {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              age: { type: 'number' } as SchemaObject,
            },
            required: ['name'],
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('User');
      expect(result[0]?.schema.type).toBe('object');
      expect(result[0]?.schema.properties).toBeDefined();
      expect(Object.keys(result[0]?.schema.properties ?? {})).toEqual(['name', 'age']);
    });

    it('should mark required properties correctly', () => {
      const components: ComponentsObject = {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              tag: { type: 'string' } as SchemaObject,
            },
            required: ['name'],
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);
      const properties = result[0]?.schema.properties;

      expect(properties?.['name']?.metadata.required).toBe(true);
      expect(properties?.['tag']?.metadata.required).toBe(false);
    });

    it('should handle nested object schemas', () => {
      const components: ComponentsObject = {
        schemas: {
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' } as SchemaObject,
              city: { type: 'string' } as SchemaObject,
            },
          } as SchemaObject,
          Person: {
            type: 'object',
            properties: {
              name: { type: 'string' } as SchemaObject,
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' } as SchemaObject,
                  city: { type: 'string' } as SchemaObject,
                },
              } as SchemaObject,
            },
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(2);
      const personSchema = result.find((c) => c.name === 'Person');
      expect(personSchema?.schema.properties?.['address']?.type).toBe('object');
      expect(personSchema?.schema.properties?.['address']?.properties).toBeDefined();
    });

    it('should handle empty objects', () => {
      const components: ComponentsObject = {
        schemas: {
          EmptyObject: {
            type: 'object',
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.type).toBe('object');
    });
  });

  describe('array schemas', () => {
    it('should build IR for simple array schema', () => {
      const components: ComponentsObject = {
        schemas: {
          StringArray: {
            type: 'array',
            items: { type: 'string' } as SchemaObject,
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.type).toBe('array');
      expect(result[0]?.schema.items).toBeDefined();
      if (!Array.isArray(result[0]?.schema.items)) {
        expect(result[0]?.schema.items?.type).toBe('string');
      }
    });

    it('should handle array of objects', () => {
      const components: ComponentsObject = {
        schemas: {
          UserArray: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' } as SchemaObject,
              },
            } as SchemaObject,
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      if (!Array.isArray(result[0]?.schema.items)) {
        expect(result[0]?.schema.items?.type).toBe('object');
        expect(result[0]?.schema.items?.properties).toBeDefined();
      }
    });
  });

  describe('composition schemas', () => {
    it('should build IR for allOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Dog: {
            allOf: [
              { type: 'object', properties: { name: { type: 'string' } } } as SchemaObject,
              { type: 'object', properties: { breed: { type: 'string' } } } as SchemaObject,
            ],
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result).toHaveLength(1);
      expect(result[0]?.schema.allOf).toBeDefined();
      expect(result[0]?.schema.allOf).toHaveLength(2);
    });

    it('should build IR for oneOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Pet: {
            oneOf: [
              { type: 'object', properties: { bark: { type: 'boolean' } } } as SchemaObject,
              { type: 'object', properties: { meow: { type: 'boolean' } } } as SchemaObject,
            ],
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result[0]?.schema.oneOf).toBeDefined();
      expect(result[0]?.schema.oneOf).toHaveLength(2);
    });

    it('should build IR for anyOf composition', () => {
      const components: ComponentsObject = {
        schemas: {
          Value: {
            anyOf: [{ type: 'string' } as SchemaObject, { type: 'number' } as SchemaObject],
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      expect(result[0]?.schema.anyOf).toBeDefined();
      expect(result[0]?.schema.anyOf).toHaveLength(2);
    });
  });

  describe('reference ($ref) schemas', () => {
    it('should preserve $ref in schema', () => {
      const components: ComponentsObject = {
        schemas: {
          User: {
            type: 'object',
            properties: {
              address: { $ref: '#/components/schemas/Address' },
            },
          } as SchemaObject,
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' } as SchemaObject,
            },
          } as SchemaObject,
        },
      };

      const result = buildIRSchemas(components);

      const userSchema = result.find((c) => c.name === 'User');
      expect(userSchema?.schema.properties?.['address']?.$ref).toBe('#/components/schemas/Address');
    });
  });
});

describe('buildIR', () => {
  it('should build complete IR document from minimal OpenAPI spec', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {},
    };

    const result = buildIR(doc);

    expect(result).toMatchObject({
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: [],
      operations: [],
    } satisfies Partial<IRDocument>);
    expect(result.dependencyGraph).toBeDefined();
  });

  it('should include schemas in IR document', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {},
      components: {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          } as SchemaObject,
        },
      },
    };

    const result = buildIR(doc);

    expect(result.components).toHaveLength(1);
    expect(result.components[0]?.name).toBe('Pet');
  });
});
