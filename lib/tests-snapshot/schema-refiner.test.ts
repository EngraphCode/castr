import { isReferenceObject } from 'openapi3-ts/oas30';
import { getZodSchema } from '../src/openApiToZod.js';
import { test, expect } from 'vitest';

test('schema-refiner', () => {
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
          if (isReferenceObject(schema) || !schema.properties) {
            return schema;
          }

          if (!schema.required && schema.properties) {
            for (const key in schema.properties) {
              const prop = schema.properties[key];

              if (prop && !isReferenceObject(prop)) {
                prop.nullable = true;
              }
            }
          }

          return schema;
        },
      },
    }),
  ).toMatchInlineSnapshot(
    '"z.object({ name: z.string().nullable(), email: z.string().nullable() }).partial().passthrough()"',
  );
});
