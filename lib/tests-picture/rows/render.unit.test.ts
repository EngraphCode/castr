/**
 * How the rows are written out as tables.
 */

import { describe, it, expect } from 'vitest';

import { proposalOf } from './outcomes.js';
import { renderRows } from './render.js';
import type { Row } from './table.js';

const keyword: Row = {
  id: 'keyword:not',
  group: 'schema keyword',
  label: 'not (applicator)',
  source: 'computed',
  versions: [],
  proposal: proposalOf(['X', 'K', 'K', 'TypeScript has no negated type.']),
};

const field: Row = {
  id: 'responses[a status range]',
  group: 'document',
  label: 'responses: an entry keyed by a|b',
  source: 'computed',
  versions: ['3.2'],
  proposal: proposalOf(['S', 'S', 'S', '']),
};

describe('renderRows', () => {
  it('writes one table for each part of a document that has rows, with its count', () => {
    expect(renderRows([field, keyword])).toBe(
      [
        '## Schema keywords (1)',
        '',
        '| Construct | OpenAPI | To Zod | To TypeScript | To the endpoint definitions | Defined | Note |',
        '| --- | --- | --- | --- | --- | --- | --- |',
        '| not (applicator) | all | carried, by a check Castr writes | carried by companion | carried by companion | computed | TypeScript has no negated type. |',
        '',
        '## Objects and fields of a document (1)',
        '',
        '| Construct | OpenAPI | To Zod | To TypeScript | To the endpoint definitions | Defined | Note |',
        '| --- | --- | --- | --- | --- | --- | --- |',
        String.raw`| responses: an entry keyed by a\|b | 3.2 | carried as structure | carried as structure | carried as structure | computed |  |`,
        '',
      ].join('\n'),
    );
  });

  it('writes nothing for no rows', () => {
    expect(renderRows([])).toBe('');
  });
});
