/**
 * The picture's endpoint-definition column for the rows of a document outside a schema:
 * every structure case run through Castr.
 *
 * This test runs Castr in this process, writes the module it generates and loads it, as
 * the generated-code suite does (`tests-generated/*.gen.test.ts`), and takes that suite's
 * name.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { structureCoverageOf } from './coverage.js';
import { RIGHT_TODAY_ENDPOINTS } from './right-today.js';
import { rowsWith, runStructureCases } from './run-schema-cases.js';
import { STRUCTURE_CASES } from './structure-cases.js';

describe('the cases for the rows of a document outside a schema', () => {
  it('has no case for a row that needs none, and no row with two', () => {
    const { rows } = pictureRows(loadDefinition);
    const { strays, repeated } = structureCoverageOf(rows, STRUCTURE_CASES);

    expect({ strays, repeated }).toEqual({ strays: [], repeated: [] });
  });

  it('holds what the construct states on exactly the rows recorded as right', async () => {
    const cells = await runStructureCases(STRUCTURE_CASES);

    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY_ENDPOINTS);
    expect(rowsWith(cells, 'not judged')).toEqual([]);
  }, 60_000);
});
