/**
 * The picture's Zod column for the rows of a schema: every case run through Castr and
 * through the reference validator.
 *
 * This test runs Castr, writes the module it generates and loads it, so it is an
 * end-to-end test. It holds the record of the rows that are right today to exactly the
 * rows that are right.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { coverageOf } from './coverage.js';
import { inertCases } from './inert.js';
import { RIGHT_TODAY } from './right-today.js';
import { rowsWith, runSchemaCases } from './run-schema-cases.js';
import { SCHEMA_CASES } from './schema-cases.js';

describe('the cases for the rows of a schema', () => {
  it('has exactly one case for every row whose construct decides a value', () => {
    const { rows } = pictureRows(loadDefinition);

    expect(coverageOf(rows, SCHEMA_CASES)).toEqual({ uncased: [], strays: [], repeated: [] });
  });

  it('gives every case a value its schema accepts and a value it refuses', () => {
    // `true` as a schema accepts every value: no sample can be refused.
    expect(inertCases(SCHEMA_CASES)).toEqual(['text:`true` as a schema']);
  });

  // One test runs Castr once and holds both facts about its cells, so no result is
  // shared between tests.
  it('is right on exactly the rows recorded as right, and judges every case it can', async () => {
    const cells = await runSchemaCases(SCHEMA_CASES);

    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY);
    expect(rowsWith(cells, 'not judged')).toEqual([
      'text:format: idn-email',
      'text:format: idn-hostname',
      'text:format: iri',
      'text:format: iri-reference',
    ]);
  });
});
