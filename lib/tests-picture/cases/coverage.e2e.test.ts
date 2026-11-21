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

  it('are, for TypeScript, those rows and seven rows of a schema carried as structure', () => {
    const ids = unexercised(rows, 'typescript');

    expect(split(ids)).toEqual({ ofASchema: 7, outsideASchema: 56 });
    expect(ids.filter((id) => isOfASchema.get(id) === true)).toEqual([
      'keyword:$id',
      'keyword:$anchor',
      'keyword:$dynamicAnchor',
      'keyword:$defs',
      'discriminator.mapping',
      'discriminator.propertyName',
      'discriminator.defaultMapping',
    ]);
  });

  it('are none for the endpoint definitions', () => {
    expect(unexercised(rows, 'endpoints')).toEqual([]);
  });
});
