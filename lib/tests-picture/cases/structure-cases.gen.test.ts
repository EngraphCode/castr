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
import { ROWS_NO_CASE_ISOLATES, STRUCTURE_CASES } from './structure-cases.js';

describe('the cases for the rows of a document outside a schema', () => {
  it('has no case for a row that needs none, and no row with two', () => {
    const { rows } = pictureRows(loadDefinition);
    const cased = [
      ...STRUCTURE_CASES,
      ...[...ROWS_NO_CASE_ISOLATES.keys()].map((rowId) => ({ rowId })),
    ];
    const { strays, repeated } = structureCoverageOf(rows, cased);

    expect({ strays, repeated }).toEqual({ strays: [], repeated: [] });
  });

  it('holds what the construct states on exactly the rows recorded as right', async () => {
    const cells = await runStructureCases(STRUCTURE_CASES, ROWS_NO_CASE_ISOLATES);

    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY_ENDPOINTS);
    // A cookie parameter is written as a header parameter, so neither is told apart. A
    // response's content changes the definitions and its media type is not in them.
    expect(rowsWith(cells, 'wrong')).toEqual([
      'parameter.in=header',
      'parameter.in=cookie',
      'response.content',
    ]);
    // A status range makes Castr emit a module that does not load, so the two other
    // kinds of response key cannot be set against it. The last two have no case.
    expect(rowsWith(cells, 'not judged')).toEqual([
      'responses.default',
      'responses[an exact status code]',
      'parameter.in=path',
      'header.style=simple',
    ]);
    // Every row that is none of these is missing.
    expect(rowsWith(cells, 'refused')).toEqual(['media-type.itemSchema']);
    expect(rowsWith(cells, 'crashed')).toEqual(['responses[a status range]']);
  }, 60_000);
});
