/**
 * The OpenAPI fragments of the cases, judged.
 *
 * This test reads the cases note and the pinned schemas from the repository, so it is an
 * end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { readCaseDocuments, readCasesNote } from './case-documents.js';
import { readOpenApiFragments } from './json-schema-cases.js';
import { casesRefused, wholeDocument } from './openapi-cases.js';

describe('judging a fragment of an OpenAPI document', () => {
  it('supplies `openapi`, and `info` where the fragment has none', () => {
    expect(wholeDocument({ paths: {} }, '3.2.1')).toEqual({
      info: { title: 'A case', version: '1' },
      paths: {},
      openapi: '3.2.1',
    });
  });

  it("keeps the fragment's own `info`", () => {
    expect(wholeDocument({ info: { title: 'Pets', version: '2' } }, '3.2.1')).toEqual({
      info: { title: 'Pets', version: '2' },
      openapi: '3.2.1',
    });
  });

  it('names a case whose fragment the schema refuses, and no other', async () => {
    const cases = readCaseDocuments(
      [
        '### A1. A fragment that is valid',
        '```json',
        '{ "paths": {} }',
        '```',
        '### A2. A fragment that is not',
        '```json',
        '{ "paths": { "pets": {} } }',
        '```',
        '### A3. A schema, which is not judged',
        '```json',
        '{ "type": "string" }',
        '```',
      ].join('\n'),
    );

    const fragments = [
      { case: 'A1', document: 0 },
      { case: 'A2', document: 0 },
    ];

    expect(await casesRefused(cases, fragments, '3.2')).toEqual(['A2']);
  });

  it('refuses a fragment its case does not have', async () => {
    const cases = readCaseDocuments(
      ['### A1. A case', '```json', '{ "paths": {} }', '```'].join('\n'),
    );

    await expect(casesRefused(cases, [{ case: 'A1', document: 3 }], '3.2')).rejects.toThrow(
      'case A1 has no document 3',
    );
  });
});

describe('the OpenAPI fragments of the cases note', () => {
  const cases = readCasesNote();
  const fragments = readOpenApiFragments();

  it('are 31', () => {
    expect(fragments).toHaveLength(31);
  });

  it('are each a document the schema published for 3.2 admits', async () => {
    expect(await casesRefused(cases, fragments, '3.2')).toEqual([]);
  });

  it('are admitted by the schema for 3.1 too, but for four that use what 3.2 added', async () => {
    expect(await casesRefused(cases, fragments, '3.1')).toEqual(['A18', 'F6', 'F8', 'F9']);
  });
});
