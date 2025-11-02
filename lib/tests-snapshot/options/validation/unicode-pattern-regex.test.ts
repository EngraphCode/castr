import { getZodSchema } from '../../../src/index.js';
import { expect, test } from 'vitest';
import { getZodChain } from '../../../src/conversion/zod/index.js';
import { type SchemaObject } from 'openapi3-ts/oas30';

test('unicode-pattern-regex', () => {
  const schema: SchemaObject = {
    type: 'string',
    pattern: String.raw`\p{L}+`,
  };
  const schemaWithSlashes: SchemaObject = {
    type: 'string',
    pattern: String.raw`/\p{L}+/`,
  };
  const schemaWithComplexUnicodePattern: SchemaObject = {
    type: 'string',
    pattern: String.raw`$|^[\p{L}\d]+[\p{L}\d\s.&()\*'',-;#]*|$`,
  };
  const schemaWithSlashU: SchemaObject = {
    type: 'string',
    pattern: String.raw`\u{1F600}+`,
  };
  expect(
    getZodSchema({ schema: schema }).toString() + getZodChain({ schema }).toString(),
  ).toMatchInlineSnapshot(String.raw`"z.string().regex(/\p{L}+/u).optional()"`);
  expect(
    getZodSchema({ schema: schemaWithSlashes }).toString() +
      getZodChain({ schema: schemaWithSlashes }).toString(),
  ).toMatchInlineSnapshot(String.raw`"z.string().regex(/\p{L}+/u).optional()"`);
  expect(
    getZodSchema({ schema: schemaWithComplexUnicodePattern }).toString() +
      getZodChain({ schema: schemaWithComplexUnicodePattern }).toString(),
  ).toMatchInlineSnapshot(
    String.raw`"z.string().regex(/$|^[\p{L}\d]+[\p{L}\d\s.&()\*'',-;#]*|$/u).optional()"`,
  );
  expect(
    getZodSchema({ schema: schemaWithSlashU }).toString() +
      getZodChain({ schema: schemaWithSlashU }).toString(),
  ).toMatchInlineSnapshot(String.raw`"z.string().regex(/\u{1F600}+/u).optional()"`);
});
