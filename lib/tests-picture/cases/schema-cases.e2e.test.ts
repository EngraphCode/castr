/**
 * The picture's Zod column for the rows of a schema: every case run through Castr and
 * through the reference validator.
 *
 * This test runs Castr, writes the module it generates and loads it, so it is an
 * end-to-end test. It holds the record of the rows that are right today to exactly the
 * rows that are right.
 */

import { afterAll, beforeAll, describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { createCastrConvert } from './castr-convert.js';
import { coverageOf } from './coverage.js';
import { referenceFor } from './reference.js';
import { RIGHT_TODAY } from './right-today.js';
import { runCase } from './run-case.js';
import { documentFor } from './schema-case.js';
import { SCHEMA_CASES } from './schema-cases.js';
import type { Cell } from './verdict.js';

describe('the cases for the rows of a schema', () => {
  const cells = new Map<string, Cell>();
  let dispose: () => Promise<void> = () => Promise.resolve();

  beforeAll(async () => {
    const castr = await createCastrConvert();
    dispose = castr.dispose;
    for (const schemaCase of SCHEMA_CASES) {
      cells.set(schemaCase.rowId, await runCase(schemaCase, castr.convert));
    }
  });

  afterAll(async () => {
    await dispose();
  });

  it('has exactly one case for every row whose construct decides a value', () => {
    const { rows } = pictureRows(loadDefinition);

    expect(coverageOf(rows, SCHEMA_CASES)).toEqual({ uncased: [], strays: [], repeated: [] });
  });

  it('gives every case a value its schema accepts and a value it refuses', () => {
    const inert = SCHEMA_CASES.filter((schemaCase) => {
      const reference = referenceFor(documentFor(schemaCase));
      if (!reference.readable) {
        return false;
      }
      const decisions = schemaCase.samples.map((sample) => reference.accepts(sample));
      return !decisions.includes(true) || !decisions.includes(false);
    });

    // `true` as a schema accepts every value: no sample can be refused.
    expect(inert.map((schemaCase) => schemaCase.rowId)).toEqual(['text:`true` as a schema']);
  });

  it('is right today on exactly the rows recorded as right', () => {
    const right = [...cells].filter(([, cell]) => cell.verdict === 'right').map(([rowId]) => rowId);

    expect(right).toEqual(RIGHT_TODAY);
  });

  it('judges every case the reference validator can check', () => {
    const notJudged = [...cells]
      .filter(([, cell]) => cell.verdict === 'not judged')
      .map(([rowId]) => rowId);

    expect(notJudged).toEqual([
      'text:format: idn-email',
      'text:format: idn-hostname',
      'text:format: iri',
      'text:format: iri-reference',
    ]);
  });
});
