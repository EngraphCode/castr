/**
 * How computed rows are joined to their proposals, and the bars on what may be proposed,
 * each proved on small inputs written here.
 */

import { describe, it, expect } from 'vitest';

import type { Inventory } from './inventory.js';
import type { ObjectProposals } from './object-proposals.js';
import { proposalOf, type Coded } from './outcomes.js';
import {
  barProblems,
  combine,
  keywordRows,
  objectRows,
  textRows,
  typeValueRows,
  type Row,
} from './table.js';

const CARRIED: Coded = ['C', 'C', 'K', ''];

function inventoryOf(objects: Inventory['objects']): Inventory {
  return { objects, folded: [], problems: [] };
}

function rowOf(id: string, group: Row['group'], coded: Coded): Row {
  return { id, group, label: id, source: 'computed', versions: [], proposal: proposalOf(coded) };
}

describe('proposalOf', () => {
  it('expands the three codes into outcomes', () => {
    expect(proposalOf(['S', 'K', 'O', 'why'])).toEqual({
      zod: 'carried as structure',
      zodByCastrCheck: false,
      typescript: 'carried by companion',
      endpoints: 'outside the target',
      note: 'why',
    });
  });

  it('records that Zod carries by a check Castr writes', () => {
    expect(proposalOf(['X', 'K', 'K', ''])).toMatchObject({
      zod: 'carried',
      zodByCastrCheck: true,
    });
  });

  it('refuses a check Castr writes in a column other than Zod', () => {
    expect(() => proposalOf(['C', 'X', 'K', ''])).toThrow('a Zod outcome only');
    expect(() => proposalOf(['C', 'K', 'X', ''])).toThrow('a Zod outcome only');
  });
});

describe('keywordRows', () => {
  it('makes a row for each keyword that has a proposal', () => {
    const result = keywordRows(
      [{ vocabulary: 'validation', keyword: 'maximum' }],
      new Map([['maximum', CARRIED]]),
    );

    expect(result.problems).toEqual([]);
    expect(result.rows).toEqual([
      {
        id: 'keyword:maximum',
        group: 'schema keyword',
        label: 'maximum (validation)',
        source: 'computed',
        versions: [],
        proposal: proposalOf(CARRIED),
      },
    ]);
  });

  it('reports a keyword that has no proposal', () => {
    const result = keywordRows([{ vocabulary: 'validation', keyword: 'maximum' }], new Map());

    expect(result.rows).toEqual([]);
    expect(result.problems).toEqual(['no proposal for keyword:maximum']);
  });

  it('reports a proposal for a keyword that was not computed', () => {
    const result = keywordRows([], new Map([['maximun', CARRIED]]));

    expect(result.problems).toEqual([
      'a proposal names a row that was not computed: keyword:maximun',
    ]);
  });
});

describe('typeValueRows', () => {
  it('makes a row for each value and reports one with no proposal', () => {
    const result = typeValueRows(['null', 'string'], new Map([['string', CARRIED]]));

    expect(result.rows.map((row) => row.id)).toEqual(['type:string']);
    expect(result.problems).toEqual(['no proposal for type:null']);
  });
});

describe('textRows', () => {
  it('makes a row that names the section of text defining it', () => {
    const result = textRows('format value', [
      { label: 'format: date', definedIn: 'Validation 7.3.1', proposal: CARRIED },
    ]);

    expect(result.rows).toEqual([
      {
        id: 'text:format: date',
        group: 'format value',
        label: 'format: date',
        source: 'Validation 7.3.1',
        versions: [],
        proposal: proposalOf(CARRIED),
      },
    ]);
  });
});

describe('objectRows', () => {
  const parameter31 = inventoryOf([
    {
      name: 'parameter',
      fields: [
        { name: 'in', values: ['path', 'query'] },
        { name: 'name', values: [] },
      ],
      keyedBy: [],
      extensible: true,
    },
  ]);
  const parameter32 = inventoryOf([
    {
      name: 'parameter',
      fields: [
        { name: 'in', values: ['path', 'query', 'querystring'] },
        { name: 'name', values: [] },
      ],
      keyedBy: [],
      extensible: true,
    },
  ]);
  const proposals = new Map<string, ObjectProposals>([['parameter', { fallback: CARRIED }]]);

  it('makes one row per fixed value and one for a field with none', () => {
    const result = objectRows('document', [{ version: '3.1', inventory: parameter31 }], proposals);

    expect(result.problems).toEqual([]);
    expect(result.rows.map((row) => row.id)).toEqual([
      'parameter.in=path',
      'parameter.in=query',
      'parameter.name',
    ]);
  });

  it('records which versions declare a row', () => {
    const result = objectRows(
      'document',
      [
        { version: '3.1', inventory: parameter31 },
        { version: '3.2', inventory: parameter32 },
      ],
      proposals,
    );
    const versionsOf = new Map(result.rows.map((row) => [row.id, row.versions]));

    expect(versionsOf.get('parameter.in=query')).toEqual(['3.1', '3.2']);
    expect(versionsOf.get('parameter.in=querystring')).toEqual(['3.2']);
    expect(versionsOf.get('parameter.name')).toEqual(['3.1', '3.2']);
  });

  it('prefers the proposal for a field over the one for its object', () => {
    const result = objectRows(
      'document',
      [{ version: '3.1', inventory: parameter31 }],
      new Map([
        ['parameter', { fallback: CARRIED, fields: new Map([['name', ['S', 'S', 'S', '']]]) }],
      ]),
    );

    expect(result.rows.find((row) => row.id === 'parameter.name')?.proposal.zod).toBe(
      'carried as structure',
    );
  });

  it('reports a field with no proposal, and an object with none', () => {
    const result = objectRows('document', [{ version: '3.1', inventory: parameter31 }], new Map());

    expect(result.rows).toEqual([]);
    expect(result.problems).toEqual([
      'no proposal for parameter.in',
      'no proposal for parameter.name',
    ]);
  });

  it('reports a proposal for a field or an object that was not computed', () => {
    const result = objectRows(
      'document',
      [{ version: '3.1', inventory: parameter31 }],
      new Map<string, ObjectProposals>([
        ['parameter', { fallback: CARRIED, fields: new Map([['nmae', CARRIED]]) }],
        ['paramter', { fallback: CARRIED }],
      ]),
    );

    expect(result.problems).toEqual([
      'a proposal names a field that was not computed: parameter.nmae',
      'a proposal names an object that was not computed: paramter',
    ]);
  });

  it('makes a row for each kind of entry an object keys', () => {
    const responses = inventoryOf([
      { name: 'responses', fields: [], keyedBy: ['^[1-5]'], extensible: true },
    ]);
    const result = objectRows(
      'document',
      [{ version: '3.1', inventory: responses }],
      new Map<string, ObjectProposals>([
        [
          'responses',
          {
            keyed: [
              ['an exact status code', CARRIED],
              ['a status range', CARRIED],
            ],
          },
        ],
      ]),
    );

    expect(result.problems).toEqual([]);
    expect(result.rows.map((row) => row.id)).toEqual([
      'responses[an exact status code]',
      'responses[a status range]',
    ]);
  });

  it('reports keyed entries with no proposal, and a keyed proposal with no entries', () => {
    const keyed = inventoryOf([{ name: 'paths', fields: [], keyedBy: ['^/'], extensible: true }]);
    const plain = inventoryOf([{ name: 'info', fields: [], keyedBy: [], extensible: true }]);

    expect(
      objectRows('document', [{ version: '3.1', inventory: keyed }], new Map()).problems,
    ).toEqual(['no proposal for the keyed entries of paths']);
    expect(
      objectRows(
        'document',
        [{ version: '3.1', inventory: plain }],
        new Map<string, ObjectProposals>([['info', { keyed: [['a key', CARRIED]] }]]),
      ).problems,
    ).toEqual(['a proposal names keyed entries that were not computed: info']);
  });

  it('carries forward what a reading reported', () => {
    const broken: Inventory = { objects: [], folded: [], problems: ['a reference has no target'] };

    expect(
      objectRows('document', [{ version: '3.2', inventory: broken }], new Map()).problems,
    ).toEqual(['3.2: a reference has no target']);
  });
});

describe('barProblems', () => {
  it('accepts a part of a schema that every target carries, and document content outside', () => {
    expect(
      barProblems([
        rowOf('keyword:maximum', 'schema keyword', ['C', 'K', 'K', '']),
        rowOf('info.title', 'document', ['O', 'O', 'O', '']),
      ]),
    ).toEqual([]);
  });

  it.each([
    'schema keyword',
    'type value',
    'format value',
    'schema construct',
    'schema vocabulary',
  ] as const)('refuses a %s proposed as outside a target', (group) => {
    expect(barProblems([rowOf('a', group, ['C', 'O', 'K', ''])])).toEqual([
      'a is part of a schema and is proposed as outside a target',
    ]);
  });

  it('accepts the four declarations a reader spends as read', () => {
    expect(
      barProblems([
        rowOf('keyword:$schema', 'schema keyword', ['R', 'R', 'R', '']),
        rowOf('keyword:$vocabulary', 'schema keyword', ['R', 'R', 'R', '']),
        rowOf('openapi.openapi', 'document', ['R', 'R', 'R', '']),
        rowOf('openapi.jsonSchemaDialect', 'document', ['R', 'R', 'R', '']),
      ]),
    ).toEqual([]);
  });

  it('refuses any other row proposed as read', () => {
    expect(barProblems([rowOf('keyword:not', 'schema keyword', ['R', 'R', 'R', ''])])).toEqual([
      'keyword:not is proposed as read and is not a declaration a reader spends',
    ]);
  });

  it('refuses a declaration a reader spends proposed as anything else', () => {
    expect(barProblems([rowOf('keyword:$schema', 'schema keyword', ['S', 'R', 'R', ''])])).toEqual([
      'keyword:$schema is a declaration a reader spends and is not proposed as read',
    ]);
  });
});

describe('combine', () => {
  it('puts results together and applies the bars', () => {
    const result = combine([
      { rows: [rowOf('a', 'document', ['C', 'C', 'S', ''])], problems: ['first'] },
      { rows: [rowOf('b', 'schema keyword', ['O', 'K', 'K', ''])], problems: [] },
    ]);

    expect(result.rows.map((row) => row.id)).toEqual(['a', 'b']);
    expect(result.problems).toEqual([
      'first',
      'b is part of a schema and is proposed as outside a target',
    ]);
  });

  it('refuses two rows with one identity', () => {
    const row = rowOf('a', 'document', ['C', 'C', 'S', '']);

    expect(combine([{ rows: [row, row], problems: [] }]).problems).toEqual([
      'two rows share the identity a',
    ]);
  });
});
