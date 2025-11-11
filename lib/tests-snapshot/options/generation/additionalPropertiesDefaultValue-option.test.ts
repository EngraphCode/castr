import { getZodSchema } from '../../../src/conversion/zod/index.js';
import { test, expect } from 'vitest';

test('additionalPropertiesDefaultValue-option', () => {
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({ str: z.string() }).partial().passthrough()",
        "schema": {
            "properties": {
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `);
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
      options: {
        additionalPropertiesDefaultValue: true,
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({ str: z.string() }).partial().passthrough()",
        "schema": {
            "properties": {
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `);
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
      options: {
        additionalPropertiesDefaultValue: { type: 'number' },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({ str: z.string() }).partial().passthrough()",
        "schema": {
            "properties": {
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `);
  expect(
    getZodSchema({
      schema: {
        type: 'object',
        properties: {
          str: { type: 'string' },
        },
      },
      options: {
        additionalPropertiesDefaultValue: false,
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "code": "z.object({ str: z.string() }).partial()",
        "schema": {
            "properties": {
                "str": {
                    "type": "string",
                },
            },
            "type": "object",
        },
    }
  `);
});
