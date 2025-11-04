import { isReferenceObject, type SchemaObject } from 'openapi3-ts/oas31';
import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

// Helper to convert a schema property to nullable OpenAPI 3.1 style
function convertToNullableProperty(prop: SchemaObject): SchemaObject {
  const propType = prop.type;
  if (propType === undefined) {
    return prop;
  }
  const nullableType: SchemaObject['type'] = Array.isArray(propType)
    ? [...propType, 'null']
    : [propType, 'null'];
  return { ...prop, type: nullableType };
}

test('schema-refiner', () => {
  const makeNullableIfNotRequired = (
    properties: SchemaObject['properties'],
  ): SchemaObject['properties'] => {
    if (!properties) {
      return properties;
    }
    const modified: NonNullable<SchemaObject['properties']> = {};
    for (const key in properties) {
      const prop = properties[key];
      if (!prop) {
        continue;
      }
      modified[key] = isReferenceObject(prop) ? prop : convertToNullableProperty(prop);
    }
    return modified;
  };

  expect(
    getZodSchema({
      schema: {
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
      },
      options: {
        schemaRefiner(schema) {
          if (isReferenceObject(schema)) {
            return schema;
          }

          if (!schema.properties) {
            return schema;
          }

          if (schema.required) {
            return schema;
          }

          return {
            ...schema,
            properties: makeNullableIfNotRequired(schema.properties),
          };
        },
      },
    }),
  ).toMatchInlineSnapshot(
    `"z.object({ name: z.union([z.string(), z.null()]).nullable(), email: z.union([z.string(), z.null()]).nullable() }).partial().passthrough()"`,
  );
});
