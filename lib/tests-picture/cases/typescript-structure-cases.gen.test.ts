/**
 * The picture's TypeScript column for the rows whose construct decides no value: every
 * such case run through Castr, and the types it exports read for what the construct
 * states.
 *
 * This test runs Castr in this process and has the TypeScript compiler read the module it
 * generates, as the generated-code suite does (`tests-generated/*.gen.test.ts`), and
 * takes that suite's name.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { needsTypeScriptStructureCase, structureCoverageOf } from './coverage.js';
import { RIGHT_TODAY_TYPESCRIPT_STRUCTURE } from './right-today.js';
import { rowsWith, runStructureCases } from './run-schema-cases.js';
import {
  typescriptRowsNoCaseIsolates,
  typescriptStructureCases,
} from './typescript-structure-cases.js';

describe('the cases for the rows the TypeScript output holds as structure', () => {
  const { rows } = pictureRows(loadDefinition);
  const cases = typescriptStructureCases(rows);
  const notIsolated = typescriptRowsNoCaseIsolates(rows);

  it('has exactly one case for every such row but those no case can isolate', () => {
    expect(structureCoverageOf(rows, cases, needsTypeScriptStructureCase)).toEqual({
      uncased: [...notIsolated.keys()],
      strays: [],
      repeated: [],
    });
  });

  it('holds what the construct states on exactly the rows recorded as right', async () => {
    const cells = await runStructureCases(cases, 'TypeScript types', notIsolated);

    expect(rowsWith(cells, 'right')).toEqual(RIGHT_TODAY_TYPESCRIPT_STRUCTURE);
    // Castr refuses the document for each of these.
    expect(rowsWith(cells, 'refused')).toEqual(['media-type.itemSchema', 'keyword:$dynamicAnchor']);
    expect(rowsWith(cells, 'not judged')).toEqual([...notIsolated.keys()]);
    // Every other row is missing, and for one reason: the types are the same.
    const missing = rowsWith(cells, 'missing').map((rowId) => cells.get(rowId)?.detail);
    expect(new Set(missing)).toEqual(new Set(['the TypeScript types are the same without it']));
    expect(rowsWith(cells, 'wrong')).toEqual([]);
    expect(rowsWith(cells, 'crashed')).toEqual([]);
  }, 120_000);
});
