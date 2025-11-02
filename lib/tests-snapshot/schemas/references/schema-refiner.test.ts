import { isReferenceObject, type SchemaObject } from 'openapi3-ts/oas30';
import { getZodSchema } from '../../../src/openApiToZod.js';
import { test, expect } from 'vitest';

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
      if (isReferenceObject(prop)) {
        modified[key] = prop;
      } else {
        modified[key] = { ...prop, nullable: true };
      }
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
    '"z.object({ name: z.string().nullable(), email: z.string().nullable() }).partial().passthrough()"',
  );
});
