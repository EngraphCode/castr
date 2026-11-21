/**
 * The picture's Zod column for the rows of a schema that decide no value: every such
 * case run through Castr, and the validators it generates read for what the construct
 * states.
 *
 * This test runs Castr in this process, writes the module it generates and loads it, as
 * the generated-code suite does (`tests-generated/*.gen.test.ts`), and takes that suite's
 * name.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { needsZodStructureCase, structureCoverageOf } from './coverage.js';
import { RIGHT_TODAY_ZOD_STRUCTURE } from './right-today.js';
import { rowsWith, runStructureCases } from './run-schema-cases.js';
import { SCHEMA_STRUCTURE_CASES } from './schema-structure-cases.js';

describe('the cases for the rows of a schema that decide no value', () => {
  it('has exactly one case for every row the Zod output is to carry as structure', () => {
    const { rows } = pictureRows(loadDefinition);

    expect(structureCoverageOf(rows, SCHEMA_STRUCTURE_CASES, needsZodStructureCase)).toEqual({
      uncased: [],
      strays: [],
      repeated: [],
    });
  });

  it('holds what the construct states on exactly the rows recorded as right', async () => {
    const cells = await runStructureCases(SCHEMA_STRUCTURE_CASES, 'Zod validators');

    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY_ZOD_STRUCTURE);
    // Castr refuses the document for each of these.
    expect(rowsWith(cells, 'refused')).toEqual([
      'keyword:$dynamicAnchor',
      'text:format: password',
      'text:format: a value no specification defines',
    ]);
    // Every other row is missing, and for one reason: the validators are the same.
    const missing = rowsWith(cells, 'missing').map((rowId) => cells.get(rowId)?.detail);
    expect(new Set(missing)).toEqual(new Set(['the Zod validators are the same without it']));
    expect(rowsWith(cells, 'wrong')).toEqual([]);
    expect(rowsWith(cells, 'crashed')).toEqual([]);
    expect(rowsWith(cells, 'not judged')).toEqual([]);
  }, 60_000);
});
