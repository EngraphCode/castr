/**
 * Which proposed cells of the picture nothing exercises yet.
 *
 * This test reads the pinned files from the repository, so it is an end-to-end test. It
 * holds the count of such cells in each column, so that a row gaining a proposal with no
 * kind of case, or a kind of case being built, is a change someone makes on purpose.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import { pictureRows } from '../rows/picture-rows.js';

import { unexercised } from './coverage.js';

describe('the proposed cells no kind of case exercises', () => {
  const { rows } = pictureRows(loadDefinition);
  const isOfASchema = new Map(rows.map((row) => [row.id, row.group !== 'document']));

  function split(ids: readonly string[]): { ofASchema: number; outsideASchema: number } {
    const ofASchema = ids.filter((id) => isOfASchema.get(id) === true).length;
    return { ofASchema, outsideASchema: ids.length - ofASchema };
  }

  it('are, for Zod, the rows of a document outside a schema', () => {
    expect(split(unexercised(rows, 'zod'))).toEqual({ ofASchema: 0, outsideASchema: 56 });
  });

  it('are none for TypeScript', () => {
    expect(unexercised(rows, 'typescript')).toEqual([]);
  });

  it('are, for the endpoint definitions, the one row for which nothing is written', () => {
    // The specification's Appendix B.2 classes this row as carried with nothing written.
    // No case can show a definition holding nothing, so the cell stays empty.
    expect(unexercised(rows, 'endpoints')).toEqual([
      'text:a map: a `propertyNames` that refuses no name',
    ]);
  });
});
