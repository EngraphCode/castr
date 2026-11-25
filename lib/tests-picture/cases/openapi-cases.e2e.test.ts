/**
 * The OpenAPI fragments of the cases, judged.
 *
 * This test reads the cases note and the pinned schemas from the repository, so it is an
 * end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { readCaseDocuments, readCasesNote } from './case-documents.js';
import { casesRefused, countOpenApiFragments, wholeDocument } from './openapi-cases.js';

describe('judging a fragment of an OpenAPI document', () => {
  it('supplies `openapi`, and `info` where the fragment has none', () => {
    expect(wholeDocument({ paths: {} }, '3.2.0')).toEqual({
      info: { title: 'A case', version: '1' },
      paths: {},
      openapi: '3.2.0',
    });
  });

  it("keeps the fragment's own `info`", () => {
    expect(wholeDocument({ info: { title: 'Pets', version: '2' } }, '3.2.0')).toEqual({
      info: { title: 'Pets', version: '2' },
      openapi: '3.2.0',
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

    expect(await casesRefused(cases, '3.2')).toEqual(['A2']);
    expect(countOpenApiFragments(cases)).toBe(2);
  });
});

describe('the OpenAPI fragments of the cases note', () => {
  const cases = readCasesNote();

  it('are 31', () => {
    expect(countOpenApiFragments(cases)).toBe(31);
  });

  it('are each a document the schema published for 3.2 admits', async () => {
    expect(await casesRefused(cases, '3.2')).toEqual([]);
  });

  it('are admitted by the schema for 3.1 too, but for four that use what 3.2 added', async () => {
    expect(await casesRefused(cases, '3.1')).toEqual(['A18', 'F6', 'F8', 'F9']);
  });
});
