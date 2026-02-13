import { getZodSchema } from '../../../src/schema-processing/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('use-union-only-when-multiple-choices', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          singleOneOf: { oneOf: [{ type: 'string' }] },
          multipleOneOf: { oneOf: [{ type: 'string' }, { type: 'number' }] },
          //
          singleAnyOf: { anyOf: [{ type: 'string' }] },
          multipleAnyOf: { anyOf: [{ type: 'string' }, { type: 'number' }] },
          //
          singleAllOf: { allOf: [{ type: 'string' }] },
          multipleAllOf: { allOf: [{ type: 'string' }, { type: 'number' }] },
        },
      },
    }),
  ).toMatchInlineSnapshot(
    `
    {
        "code": "z.object({
      singleOneOf: z.string().optional(),
      multipleOneOf: z.xor([z.string(), z.number()]).optional(),
      singleAnyOf: z.string().optional(),
      multipleAnyOf: z.union([z.string(), z.number()]).optional(),
      singleAllOf: z.string().optional(),
      multipleAllOf: z.string().and(z.number()).optional(),
    }).passthrough()",
        "schema": {
            "properties": {
                "multipleAllOf": {
                    "allOf": [
                        {
                            "type": "string",
                        },
                        {
                            "type": "number",
                        },
                    ],
                },
                "multipleAnyOf": {
                    "anyOf": [
                        {
                            "type": "string",
                        },
                        {
                            "type": "number",
                        },
                    ],
                },
                "multipleOneOf": {
                    "oneOf": [
                        {
                            "type": "string",
                        },
                        {
                            "type": "number",
                        },
                    ],
                },
                "singleAllOf": {
                    "allOf": [
                        {
                            "type": "string",
                        },
                    ],
                },
                "singleAnyOf": {
                    "anyOf": [
                        {
                            "type": "string",
                        },
                    ],
                },
                "singleOneOf": {
                    "oneOf": [
                        {
                            "type": "string",
                        },
                    ],
                },
            },
            "type": "object",
        },
    }
  `,
  );
});
