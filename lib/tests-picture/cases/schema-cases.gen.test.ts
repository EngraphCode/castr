/**
 * The picture's Zod and TypeScript columns for the rows of a schema: every case run
 * through Castr and through the reference validator.
 *
 * This test runs Castr in this process, writes the module it generates and loads it, as
 * the generated-code suite does (`tests-generated/*.gen.test.ts`), and takes that suite's
 * name. It holds the record of the rows that are right today to exactly the
 * rows that are right.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { coverageOf } from './coverage.js';
import { casesTheirKeywordDoesNotDecide } from './control.js';
import { inertCases } from './inert.js';
import { RIGHT_TODAY, RIGHT_TODAY_TYPESCRIPT } from './right-today.js';
import { rowsWith, runSchemaCases, runTypeScriptCases } from './run-schema-cases.js';
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

  it('gives every case samples that the keyword it names decides', () => {
    // The reference accepts every number for these three formats, so the format decides
    // none of their samples: their cells say nothing about the format itself.
    expect(casesTheirKeywordDoesNotDecide(SCHEMA_CASES)).toEqual([
      'text:format: int64',
      'text:format: float',
      'text:format: double',
    ]);
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

  // The compiler checks every sample against the type Castr generated. Every case has a
  // row with a reading for a type, so every case has a cell.
  it('generates a type that is right on exactly the rows recorded as right', async () => {
    const { rows } = pictureRows(loadDefinition);

    const cells = await runTypeScriptCases(SCHEMA_CASES, rows);

    expect(cells.size).toBe(SCHEMA_CASES.length);
    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY_TYPESCRIPT);
    expect(rowsWith(cells, 'wrong')).toEqual([
      'keyword:enum',
      'keyword:prefixItems',
      'keyword:allOf',
      'text:format: int64',
      'text:`false` as a schema',
    ]);
  }, 60_000);
});
