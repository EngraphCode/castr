/**
 * The judge reads only the pinned schemas, and says where a document fails.
 */

import { describe, it, expect } from 'vitest';

import { isJsonValue, judgeDocument } from './judge.js';

const SCHEMA_3_1 = 'https://spec.openapis.org/oas/3.1/schema/2022-10-07';

describe('judgeDocument', () => {
  it('passes a document that holds the required fields and nothing else', async () => {
    const judgement = await judgeDocument(SCHEMA_3_1, {
      openapi: '3.1.0',
      info: { title: 't', version: '1' },
      paths: {},
    });

    expect(judgement).toEqual({ passes: true, failures: [] });
  });

  it('names the place and the keyword where a document fails', async () => {
    const judgement = await judgeDocument(SCHEMA_3_1, {
      openapi: '3.1.0',
      info: { title: 't' },
      paths: {},
    });

    expect(judgement.passes).toBe(false);
    expect(judgement.failures).toContainEqual({
      at: '#/info',
      keyword: `${SCHEMA_3_1}#/$defs/info/required`,
    });
  });

  it('refuses a schema the publisher gives that is not pinned here', async () => {
    await expect(
      judgeDocument('https://spec.openapis.org/oas/3.1/schema/2021-05-20', {}),
    ).rejects.toThrow('is not a schema pinned here');
  });

  it('refuses the copy of a schema that the validator carries under an undated address', async () => {
    await expect(judgeDocument('https://spec.openapis.org/oas/3.1/schema', {})).rejects.toThrow(
      'is not a schema pinned here',
    );
  });

  it('refuses a document that is not JSON', async () => {
    await expect(judgeDocument(SCHEMA_3_1, { openapi: undefined })).rejects.toThrow(
      'the document is not a JSON value',
    );
  });
});

describe('isJsonValue', () => {
  it('accepts nested arrays and objects of JSON values', () => {
    expect(isJsonValue({ a: [1, 'b', null, { c: true }] })).toBe(true);
  });

  it('refuses a number JSON cannot state', () => {
    expect(isJsonValue({ a: Number.POSITIVE_INFINITY })).toBe(false);
  });

  it('refuses an object that is not a plain one', () => {
    expect(isJsonValue({ a: new Date(0) })).toBe(false);
  });

  it('refuses an array with a hole', () => {
    const holed: unknown[] = [1, 2, 3];
    delete holed[1];

    expect(isJsonValue(holed)).toBe(false);
  });

  it('refuses a value that holds itself', () => {
    const cyclic: unknown[] = [];
    cyclic.push(cyclic);

    expect(isJsonValue(cyclic)).toBe(false);
  });

  it('accepts one object held in two places', () => {
    const shared = { a: 1 };

    expect(isJsonValue([shared, shared])).toBe(true);
  });
});
