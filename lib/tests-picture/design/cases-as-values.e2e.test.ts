/**
 * The cases' JSON Schema documents, as values of the prototype, held to what the
 * documents accept.
 *
 * Every statement the cases note makes about a JSON Schema document is run against the
 * hand-written value for that document, as its source states it: the prototype must
 * accept what the validator accepts and refuse what it refuses. The statements are read
 * from the repository, so this is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { readJsonSchemaExpectations } from '../cases/json-schema-cases.js';

import { VALUES } from './cases-as-values.js';
import { asStated, underProfile } from './evaluate.js';

describe('the cases as values of the prototype', () => {
  const expectations = readJsonSchemaExpectations();

  it('has a value for every JSON Schema document a statement is made about', () => {
    const missing = expectations
      .filter((one) => VALUES[one.case]?.[one.document] === undefined)
      .map((one) => `${one.case} document ${String(one.document)}`);

    expect([...new Set(missing)]).toEqual([]);
  });

  it('accepts and refuses, as stated, what each document does', () => {
    const wrong = expectations.flatMap((one) => {
      const value = VALUES[one.case]?.[one.document];
      if (value === undefined) {
        return [];
      }
      const { accepted } = asStated(value, { present: true, value: one.instance });
      return accepted === one.accepts
        ? []
        : [`${one.case} document ${String(one.document)}: ${JSON.stringify(one.instance)}`];
    });

    expect(wrong).toEqual([]);
  });
});

describe("Castr's profile, by value", () => {
  const C2 = VALUES['C2']?.[0];
  const B1 = VALUES['B1']?.[0];

  it('refuses a key of an object that states no policy', () => {
    expect(C2 && underProfile(C2, { a: 's', b: 1 }).accepted).toBe(false);
    expect(C2 && underProfile(C2, { a: 's' }).accepted).toBe(true);
  });

  it('leaves a definition that states no policy free to be built on', () => {
    expect(B1 && underProfile(B1, { id: 'x', extra: 'y' }).accepted).toBe(true);
  });
});
