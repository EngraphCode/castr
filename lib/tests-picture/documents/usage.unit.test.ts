/**
 * How the rows a document uses are set against today's cells.
 */

import { describe, it, expect } from 'vitest';

import { proposalOf } from '../rows/outcomes.js';
import type { Row } from '../rows/table.js';

import { renderNotRight, renderUsage } from './render-usage.js';
import { stops, tally, usageOf } from './usage.js';

function rowOf(id: string): Row {
  return {
    id,
    group: 'schema keyword',
    label: `label of ${id}`,
    source: 'computed',
    versions: [],
    proposal: proposalOf(['C', 'C', 'K', '']),
  };
}

const rows = [rowOf('a'), rowOf('b'), rowOf('c'), rowOf('d')];
const today = {
  zod: new Map([
    ['a', { verdict: 'right', detail: '' }],
    ['b', { verdict: 'refused', detail: 'no' }],
    ['d', { verdict: 'wrong', detail: 'no' }],
  ] as const),
  typescript: new Map([['a', { verdict: 'wrong', detail: 'no' }]] as const),
  endpoints: new Map(),
};
const usage = usageOf(new Set(['c', 'a', 'b']), rows, today);

describe('usageOf', () => {
  it('gives each row used, in the order of the rows, with what each output says', () => {
    expect(usage.map((usedRow) => [usedRow.row.id, usedRow.zod, usedRow.typescript])).toEqual([
      ['a', 'right', 'wrong'],
      ['b', 'refused', 'no cell'],
      ['c', 'no cell', 'no cell'],
    ]);
  });
});

describe('tally', () => {
  it('counts the rows used by what one output says for them', () => {
    const counts = tally(usage, 'zod');

    expect(counts.get('right')).toBe(1);
    expect(counts.get('refused')).toBe(1);
    expect(counts.get('no cell')).toBe(1);
    expect(counts.get('wrong')).toBe(0);
  });
});

describe('stops', () => {
  it('gives the rows some output refuses or crashes on', () => {
    expect(stops(usage).map((usedRow) => usedRow.row.id)).toEqual(['b']);
  });
});

describe('renderUsage', () => {
  it('writes a line for each document with its counts, leaving out a count of none', () => {
    const written = renderUsage([{ name: 'kestrels', usage, unrecognised: ['openapi.host'] }]);

    expect(written).toContain(
      '| kestrels | 3 | right 1, refused 1, no cell 1 | wrong 1, no cell 2 | no cell 3 | openapi.host |',
    );
  });

  it('says that a cell is from a small document and not from this one', () => {
    expect(renderUsage([])).toContain('a construct right\nthere is not thereby right');
  });
});

describe('renderNotRight', () => {
  it('lists the rows where some output is neither right nor without a cell', () => {
    const written = renderNotRight('kestrels', usage);

    expect(written).toContain('## kestrels: the rows it uses that are not right (2 of 3)');
    expect(written).toContain('| label of a | right | wrong |  |');
    expect(written).toContain('| label of b | refused |  |  |');
    expect(written).not.toContain('label of c');
  });
});
