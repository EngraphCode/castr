/**
 * How the cases are set against the rows.
 */

import { describe, it, expect } from 'vitest';

import { proposalOf, type Coded } from '../rows/outcomes.js';
import type { Row } from '../rows/table.js';

import { coverageOf, needsDecidingCase, typescriptReadingFor } from './coverage.js';
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
