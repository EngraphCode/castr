/**
 * The limits the specification declares for the Zod that Castr writes (SPEC-P-7 and
 * SPEC-P-8), each held as a case: it is tracked here so that it is known, and so that a
 * change in what Zod does fails a test. A limit is no cell of the picture, because it is
 * neither right nor an undeclared wrong.
 *
 * This test runs Castr in this process, writes the module it generates and loads it, as
 * the generated-code suite does (`tests-generated/*.gen.test.ts`), and takes that suite's
 * name.
 */

import { describe, it, expect } from 'vitest';

import { createCastrConvert } from './castr-convert.js';
import {
  DECLARED_LIMITS,
  renderDeclaredLimits,
  URI_ACCEPTED_BY_ZOD_ALONE,
  URI_REFUSED_BY_ZOD_ALONE,
} from './declared-limits.js';
import { referenceFor } from './reference.js';
import { documentFor } from './schema-case.js';
import { SCHEMA_CASES } from './schema-cases.js';

const PROTO = '__proto__';

function holdsAnOwnProto(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return Object.hasOwn(value, PROTO) || Object.values(value).some(holdsAnOwnProto);
}

describe('a property named `__proto__` (SPEC-P-7)', () => {
  it('is checked by the source, and neither checked nor returned by the Zod Castr writes', async () => {
    const document = documentFor({
      schema: { type: 'object', additionalProperties: { type: 'number' } },
    });
    // An object literal would set the prototype and make no property. Parsed JSON makes
    // an own property of that name, which is what a value read from a response holds.
    const value: unknown = JSON.parse('{"a": 1, "__proto__": "not a number"}');
    const reference = referenceFor(document);
    const castr = await createCastrConvert();
    try {
      const converted = await castr.convert(document, [value]);

      expect(holdsAnOwnProto(value)).toBe(true);
      expect(reference.readable && reference.accepts({ a: 1 })).toBe(true);
      expect(reference.readable && reference.accepts(value)).toBe(false);
      expect(converted.kind === 'decides' && converted.accepts(value)).toBe(true);
      const returned = converted.kind === 'decides' ? converted.returns?.(value) : undefined;
      expect(returned).toEqual({ a: 1 });
      expect(holdsAnOwnProto(returned)).toBe(false);
    } finally {
      await castr.dispose();
    }
  }, 60_000);

  it('is in no sample of a case, so that no cell rests on the limit', () => {
    const withOne = SCHEMA_CASES.filter((schemaCase) => schemaCase.samples.some(holdsAnOwnProto));

    expect(withOne.map((schemaCase) => schemaCase.rowId)).toEqual([]);
  });
});

describe('`format: uri`, written `z.url()` (SPEC-P-8)', () => {
  const document = documentFor({ schema: { type: 'string', format: 'uri' } });
  const differing = [...URI_ACCEPTED_BY_ZOD_ALONE, ...URI_REFUSED_BY_ZOD_ALONE];

  it('differs from the source in both directions, on the strings the clause names', async () => {
    const reference = referenceFor(document);
    const castr = await createCastrConvert();
    try {
      const converted = await castr.convert(document, differing);
      const zodAccepts = (value: string): boolean =>
        converted.kind === 'decides' && converted.accepts(value);
      const sourceAccepts = (value: string): boolean =>
        reference.readable && reference.accepts(value);

      expect(converted.kind).toBe('decides');
      expect(URI_ACCEPTED_BY_ZOD_ALONE.filter(zodAccepts)).toEqual(URI_ACCEPTED_BY_ZOD_ALONE);
      expect(URI_ACCEPTED_BY_ZOD_ALONE.filter(sourceAccepts)).toEqual([]);
      expect(URI_REFUSED_BY_ZOD_ALONE.filter(zodAccepts)).toEqual([]);
      expect(URI_REFUSED_BY_ZOD_ALONE.filter(sourceAccepts)).toEqual(URI_REFUSED_BY_ZOD_ALONE);
    } finally {
      await castr.dispose();
    }
  }, 60_000);

  it('is in no sample of the row, so that its cell does not rest on the limit', () => {
    const row = SCHEMA_CASES.find((schemaCase) => schemaCase.rowId === 'text:format: uri');

    expect(row?.samples.filter((sample) => differing.some((value) => value === sample))).toEqual(
      [],
    );
  });
});

describe('the declared limits, as the picture prints them', () => {
  it('names each clause that declares one', () => {
    const printed = renderDeclaredLimits();

    expect(DECLARED_LIMITS.map((limit) => limit.clause)).toEqual(['SPEC-P-7', 'SPEC-P-8']);
    expect(printed).toContain('| SPEC-P-7 |');
    expect(printed).toContain('| SPEC-P-8 | `format: uri` |');
  });
});
