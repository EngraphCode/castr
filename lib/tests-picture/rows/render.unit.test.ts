/**
 * How the rows are written out as tables.
 */

import { describe, it, expect } from 'vitest';

import { proposalOf } from './outcomes.js';
import { renderRows, renderToday, renderUnexercised } from './render.js';
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
    const heading =
      '| Construct | OpenAPI | Castr today, to Zod | Castr today, to TypeScript | Castr today, to the endpoint definitions | Proposed: to Zod | Proposed: to TypeScript | Proposed: to the endpoint definitions | Defined | Note |';
    const rule = '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |';

    expect(
      renderRows([field, keyword], {
        zod: new Map([['keyword:not', { verdict: 'wrong', detail: '' }]]),
        typescript: new Map([['keyword:not', { verdict: 'right', detail: '' }]]),
        endpoints: new Map([['responses[a status range]', { verdict: 'missing', detail: '' }]]),
      }),
    ).toBe(
      [
        '## Schema keywords (1)',
        '',
        heading,
        rule,
        '| not (applicator) | all | wrong | right |  | carried, by a check Castr writes | carried by companion | carried by companion | computed | TypeScript has no negated type. |',
        '',
        '## Objects and fields of a document (1)',
        '',
        heading,
        rule,
        String.raw`| responses: an entry keyed by a\|b | 3.2 |  |  | missing | carried as structure | carried as structure | carried as structure | computed |  |`,
        '',
      ].join('\n'),
    );
  });

  it('writes nothing for no rows', () => {
    expect(renderRows([])).toBe('');
  });
});

describe('renderToday', () => {
  it('counts the cells by verdict and gives the words for each that is not right', () => {
    const today = new Map([
      ['keyword:not', { verdict: 'wrong', detail: '"a": the source says invalid' }],
      ['responses[a status range]', { verdict: 'right', detail: '' }],
    ] as const);

    expect(renderToday([keyword, field], today, "Castr's Zod output does")).toBe(
      [
        "## What Castr's Zod output does today (2 cases)",
        '',
        'right 1; wrong 1; refused 0; crashed 0; missing 0; not judged 0.',
        '',
        '| Construct | Castr today | What happened |',
        '| --- | --- | --- |',
        '| not (applicator) | wrong | "a": the source says invalid |',
        '',
      ].join('\n'),
    );
  });
});

describe('renderUnexercised', () => {
  it('writes a count for each output under a heading that says what the count is', () => {
    const written = renderUnexercised([
      ['to Zod', 2],
      ['to TypeScript', 0],
    ]);

    expect(written).toContain('## Proposed and not exercised yet');
    expect(written).toContain('- to Zod: 2 rows');
    expect(written).toContain('- to TypeScript: 0 rows');
  });
});
