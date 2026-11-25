/**
 * The JSON Schema documents of the cases, run.
 *
 * This test reads the cases note and the expectations from the repository and runs each
 * under a validator, so it is an end-to-end test. It proves that each document accepts
 * and refuses what the note says of it, and that no JSON Schema document of the note goes
 * unrun.
 */

import { describe, it, expect } from 'vitest';

import { readCaseDocuments, readCasesNote } from './case-documents.js';
import {
  accepts,
  contradictions,
  accountOfDocuments,
  readJsonSchemaExpectationList,
  readJsonSchemaExpectations,
  readOpenApiFragmentList,
  readOpenApiFragments,
} from './json-schema-cases.js';

describe('running one document against one value', () => {
  const documents = [
    { type: 'string', maxLength: 2 },
    {
      definitions: { a: { type: 'string' } },
      properties: { x: { $ref: '#/definitions/a', maxLength: 1 } },
    },
    true,
  ];

  it('says a value the schema accepts is accepted', async () => {
    const result = await accepts(documents, {
      document: 0,
      draft: '2020-12',
      with: [],
      instance: 'ab',
    });

    expect(result).toBe(true);
  });

  it('says a value the schema refuses is refused', async () => {
    const result = await accepts(documents, {
      document: 0,
      draft: '2020-12',
      with: [],
      instance: 'abc',
    });

    expect(result).toBe(false);
  });

  it('reads a document under the draft it is given: Draft-07 ignores a keyword beside a reference', async () => {
    const result = await accepts(documents, {
      document: 1,
      draft: 'draft-07',
      with: [],
      instance: { x: 'abc' },
    });
    const later = await accepts(documents, {
      document: 1,
      draft: '2020-12',
      with: [],
      instance: { x: 'abc' },
    });

    expect([result, later]).toEqual([true, false]);
  });

  it('runs a boolean schema', async () => {
    const result = await accepts(documents, {
      document: 2,
      draft: '2020-12',
      with: [],
      instance: 5,
    });

    expect(result).toBe(true);
  });

  it('leaves nothing registered when a later document cannot be read', async () => {
    const withOwnAddress = [{ $id: 'https://cases.invalid/own', type: 'string' }];
    const failing = accepts(withOwnAddress, {
      document: 5,
      draft: '2020-12',
      with: [0],
      instance: 's',
    });
    await expect(failing).rejects.toThrow('document 5 is not a schema');

    const again = await accepts(withOwnAddress, {
      document: 0,
      draft: '2020-12',
      with: [],
      instance: 's',
    });

    expect(again).toBe(true);
  });

  it('refuses a document the case does not have', async () => {
    await expect(
      accepts(documents, { document: 7, draft: '2020-12', with: [], instance: 5 }),
    ).rejects.toThrow('document 7 is not a schema');
  });
});

describe('finding what the validator contradicts, and what is not run', () => {
  const cases = readCaseDocuments(
    [
      '### A1. A case',
      '```json',
      '{ "type": "string" }',
      '```',
      '```json',
      '{ "paths": {} }',
      '```',
      '```json',
      '{ "type": "number" }',
      '```',
    ].join('\n'),
  );
  const expectations = readJsonSchemaExpectationList({
    note: 'Expectations.',
    expectations: [
      { case: 'A1', document: 0, draft: '2020-12', instance: 's', accepts: true },
      { case: 'A1', document: 0, draft: '2020-12', instance: 5, accepts: true },
    ],
  });

  it('names an expectation the validator contradicts, and no other', async () => {
    expect(await contradictions(cases, expectations)).toEqual([
      'A1 document 0 (2020-12) refuses 5',
    ]);
  });

  it('names a document that is neither run nor listed as a fragment', () => {
    const fragments = [{ case: 'A1', document: 1 }];

    expect(accountOfDocuments(cases, expectations, fragments)).toEqual({
      neither: ['A1 document 2'],
      both: [],
      absent: [],
    });
  });

  it('names a document that is both run and listed as a fragment, and one the note lacks', () => {
    const fragments = [
      { case: 'A1', document: 0 },
      { case: 'A1', document: 1 },
      { case: 'A1', document: 2 },
      { case: 'A1', document: 9 },
    ];

    expect(accountOfDocuments(cases, expectations, fragments)).toEqual({
      neither: [],
      both: ['A1 document 0'],
      absent: ['A1 document 9'],
    });
  });

  it('refuses an expectation whose `with` is not a list', () => {
    const wrong = {
      note: 'Expectations.',
      expectations: [
        { case: 'A1', document: 0, draft: '2020-12', with: null, instance: 5, accepts: true },
      ],
    };

    expect(() => readJsonSchemaExpectationList(wrong)).toThrow('expectation 1: with is not a list');
  });

  it('refuses a list of fragments with a key it does not have', () => {
    const wrong = { note: 'Fragments.', fragments: [{ case: 'A1', document: 0, kind: 'x' }] };

    expect(() => readOpenApiFragmentList(wrong)).toThrow('fragment 1');
  });

  it('refuses an expectation that does not say whether the value is accepted', () => {
    const wrong = {
      note: 'Expectations.',
      expectations: [{ case: 'A1', document: 0, draft: '2020-12', instance: 5 }],
    };

    expect(() => readJsonSchemaExpectationList(wrong)).toThrow(
      'expectation 1 does not say whether the value is accepted',
    );
  });

  it('refuses a draft the cases do not have', () => {
    const wrong = {
      note: 'Expectations.',
      expectations: [{ case: 'A1', document: 0, draft: 'draft-04', instance: 5, accepts: true }],
    };

    expect(() => readJsonSchemaExpectationList(wrong)).toThrow('expectation 1: draft');
  });
});

describe('the JSON Schema documents of the cases note', () => {
  const cases = readCasesNote();
  const expectations = readJsonSchemaExpectations();

  it('accept and refuse what the note says of them', async () => {
    expect(await contradictions(cases, expectations)).toEqual([]);
  });

  it('are each run by an expectation, and every other JSON document is listed as OpenAPI', () => {
    expect(accountOfDocuments(cases, expectations, readOpenApiFragments())).toEqual({
      neither: [],
      both: [],
      absent: [],
    });
  });

  it('are stated by 123 expectations', () => {
    expect(expectations).toHaveLength(123);
  });
});
