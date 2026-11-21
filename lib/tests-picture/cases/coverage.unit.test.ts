/**
 * How the cases are set against the rows.
 */

import { describe, it, expect } from 'vitest';

import { proposalOf, type Coded } from '../rows/outcomes.js';
import type { Row } from '../rows/table.js';

import {
  coverageOf,
  needsDecidingCase,
  needsStructureCase,
  needsTypeScriptStructureCase,
  needsZodStructureCase,
  structureCoverageOf,
  typescriptReadingFor,
  unexercised,
} from './coverage.js';
import type { SchemaCase } from './schema-case.js';

function rowOf(id: string, group: Row['group'], coded: Coded): Row {
  return { id, group, label: id, source: 'computed', versions: [], proposal: proposalOf(coded) };
}

function caseFor(rowId: string): SchemaCase {
  return { rowId, schema: {}, samples: [] };
}

const maximum = rowOf('keyword:maximum', 'schema keyword', ['C', 'K', 'K', '']);
const not = rowOf('keyword:not', 'schema keyword', ['X', 'K', 'K', '']);
const title = rowOf('keyword:title', 'schema keyword', ['S', 'K', 'K', '']);
const required = rowOf('parameter.required', 'document', ['C', 'C', 'S', '']);

describe('needsDecidingCase', () => {
  it('holds for a part of a schema that Zod is proposed to carry', () => {
    expect(needsDecidingCase(maximum)).toBe(true);
    expect(needsDecidingCase(not)).toBe(true);
  });

  it('does not hold for a row carried as structure, or a row of the document', () => {
    expect(needsDecidingCase(title)).toBe(false);
    expect(needsDecidingCase(required)).toBe(false);
  });
});

describe('typescriptReadingFor', () => {
  /** A type that admits a sample the source refuses. */
  const widerThanTheSource = [{ sample: 'abc', reference: false, castr: true }];

  it('holds a type to the source where TypeScript is proposed to carry the row', () => {
    expect(typescriptReadingFor(required)?.judge(widerThanTheSource).verdict).toBe('wrong');
  });

  it('lets a type admit more where the row is proposed as carried by companion', () => {
    expect(typescriptReadingFor(maximum)?.judge(widerThanTheSource).verdict).toBe('right');
  });

  it('names what Castr emits as a type', () => {
    expect(typescriptReadingFor(maximum)?.emits).toBe('type');
  });

  it('has no reading for a row with any other proposal', () => {
    const outside = rowOf('parameter.style', 'document', ['O', 'O', 'S', '']);

    expect(typescriptReadingFor(outside)).toBeUndefined();
  });
});

describe('coverageOf', () => {
  it('finds nothing amiss where every row that needs a case has exactly one', () => {
    expect(
      coverageOf([maximum, not, title], [caseFor('keyword:maximum'), caseFor('keyword:not')]),
    ).toEqual({ uncased: [], strays: [], repeated: [] });
  });

  it('names a row that needs a case and has none', () => {
    expect(coverageOf([maximum, not], [caseFor('keyword:maximum')]).uncased).toEqual([
      'keyword:not',
    ]);
  });

  it('names a case whose row is not a row of the picture', () => {
    expect(coverageOf([maximum], [caseFor('keyword:maximun')]).strays).toEqual(['keyword:maximun']);
  });

  it('names a row with more than one case', () => {
    expect(
      coverageOf([maximum], [caseFor('keyword:maximum'), caseFor('keyword:maximum')]).repeated,
    ).toEqual(['keyword:maximum']);
  });
});

describe('structureCoverageOf', () => {
  const summary = rowOf('operation.summary', 'document', ['O', 'S', 'S', '']);
  const servers = rowOf('openapi.servers', 'document', ['O', 'O', 'O', '']);

  it('needs a case for a row of the document the endpoint definitions carry as structure', () => {
    expect(needsStructureCase(summary)).toBe(true);
    expect(needsStructureCase(servers)).toBe(false);
    expect(needsStructureCase(title)).toBe(false);
  });

  it('needs a Zod structure case for a part of a schema Zod carries as structure', () => {
    expect(needsZodStructureCase(title)).toBe(true);
    expect(needsZodStructureCase(maximum)).toBe(false);
    expect(needsZodStructureCase(summary)).toBe(false);
  });

  it('sets the cases against the rows the given rule says need one', () => {
    expect(
      structureCoverageOf(
        [title, summary],
        [{ rowId: 'operation.summary' }],
        needsZodStructureCase,
      ),
    ).toEqual({ uncased: ['keyword:title'], strays: ['operation.summary'], repeated: [] });
  });

  it('names the rows with no case, the cases with no such row, and the rows with two', () => {
    expect(
      structureCoverageOf(
        [summary, servers],
        [{ rowId: 'openapi.servers' }, { rowId: 'operation.gone' }],
      ),
    ).toEqual({
      uncased: ['operation.summary'],
      strays: ['openapi.servers', 'operation.gone'],
      repeated: [],
    });
    expect(
      structureCoverageOf(
        [summary],
        [{ rowId: 'operation.summary' }, { rowId: 'operation.summary' }],
      ).repeated,
    ).toEqual(['operation.summary']);
  });
});

describe('needsTypeScriptStructureCase', () => {
  const anchor = rowOf('keyword:$anchor', 'schema keyword', ['S', 'S', 'K', '']);

  it('holds for a row TypeScript is proposed to carry as structure, in a schema or not', () => {
    expect(needsTypeScriptStructureCase(anchor)).toBe(true);
    expect(
      needsTypeScriptStructureCase(rowOf('operation.summary', 'document', ['O', 'S', 'S', ''])),
    ).toBe(true);
  });

  it('holds for a row outside a schema that TypeScript is proposed to carry', () => {
    expect(needsTypeScriptStructureCase(required)).toBe(true);
  });

  it('does not hold for a part of a schema TypeScript carries, or a row it does not', () => {
    expect(
      needsTypeScriptStructureCase(rowOf('keyword:type', 'schema keyword', ['C', 'C', 'K', ''])),
    ).toBe(false);
    expect(needsTypeScriptStructureCase(maximum)).toBe(false);
  });
});

describe('unexercised', () => {
  const template = rowOf('paths[a path template]', 'document', ['S', 'S', 'S', '']);
  const anchor = rowOf('keyword:$anchor', 'schema keyword', ['S', 'S', 'K', '']);
  const servers = rowOf('openapi.servers', 'document', ['O', 'O', 'O', '']);

  it('names a row an output is to carry that no kind of case exercises', () => {
    expect(unexercised([template, anchor, title, maximum, servers], 'zod')).toEqual([
      'paths[a path template]',
    ]);
  });

  it('names a part of a schema TypeScript is to carry where Zod is not', () => {
    const typedOnly = rowOf('keyword:typed', 'schema keyword', ['K', 'C', 'K', '']);

    expect(unexercised([typedOnly, maximum], 'typescript')).toEqual(['keyword:typed']);
  });

  it('names no row where every proposal to carry has a kind of case', () => {
    expect(unexercised([template, anchor, title, maximum, servers], 'typescript')).toEqual([]);
    expect(unexercised([template, anchor, title, maximum, servers], 'endpoints')).toEqual([]);
  });
});
