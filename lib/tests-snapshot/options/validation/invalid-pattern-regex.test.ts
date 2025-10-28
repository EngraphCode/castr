import { getZodSchema } from '../../../src/index.js';
import { expect, test } from 'vitest';
import { getZodChain } from '../../../src/openApiToZod.js';
import { type SchemaObject } from 'openapi3-ts/oas30';

test('invalid-pattern-regex', () => {
  const invalidSchema: SchemaObject = {
    type: 'string',
    pattern: '[0-9]+',
  };
  const schema: SchemaObject = {
    type: 'string',
    pattern: '/[0-9]+/',
  };
  const controlCharacters: SchemaObject = {
    type: 'string',
    pattern:
      '/[\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F\uFFFE\uFFFF]+/',
  };
  expect(
    getZodSchema({ schema: schema }).toString() + getZodChain({ schema }).toString(),
  ).toMatchInlineSnapshot('"z.string().regex(/[0-9]+/).optional()"');
  expect(
    getZodSchema({ schema: invalidSchema }).toString() +
      getZodChain({ schema: invalidSchema }).toString(),
  ).toMatchInlineSnapshot('"z.string().regex(/[0-9]+/).optional()"');
  expect(
    getZodSchema({ schema: controlCharacters }).toString() +
      getZodChain({ schema: controlCharacters }).toString(),
  ).toMatchInlineSnapshot(
    String.raw`"z.string().regex(/[\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\ufffe\uffff]+/u).optional()"`,
  );
});
