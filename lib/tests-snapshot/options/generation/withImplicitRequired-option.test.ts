import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('withImplicitRequired-option', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nested: {
            additionalProperties: { type: 'number' },
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({ str: z.string(), nested: z.record(z.number()) }).partial().passthrough()",
        "schema": {
            "properties": {
                "nested": {
                    "additionalProperties": {
                        "type": "number",
                    },
                },
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `,
  );
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
          nested: {
            additionalProperties: { type: 'number' },
          },
        },
      },
      options: {
        withImplicitRequiredProps: true,
      },
    }),
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({ str: z.string(), nested: z.record(z.number()) }).passthrough()",
        "schema": {
            "properties": {
                "nested": {
                    "additionalProperties": {
                        "type": "number",
                    },
                },
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `,
  );
});
