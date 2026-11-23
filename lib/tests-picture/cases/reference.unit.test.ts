/**
 * The reference validator reads a case independently of Castr.
 */

import { describe, it, expect } from 'vitest';

import { referenceFor } from './reference.js';
import { documentFor } from './schema-case.js';

function reference(schema: unknown, components?: Readonly<Record<string, object>>) {
  return referenceFor(documentFor({ schema, ...(components ? { components } : {}) }));
}

describe('referenceFor', () => {
  it('decides a value by the schema of the case', () => {
    const result = reference({ type: 'string', maxLength: 2 });

    expect(result.readable && result.accepts('ab')).toBe(true);
    expect(result.readable && result.accepts('abc')).toBe(false);
  });

  it('asserts a format it has a checker for', () => {
    const result = reference({ type: 'string', format: 'date' });

    expect(result.readable && result.accepts('2026-11-20')).toBe(true);
    expect(result.readable && result.accepts('20/11/2026')).toBe(false);
  });

  it('resolves a reference to another component of the document', () => {
    const result = reference(
      { $ref: '#/components/schemas/Named' },
      { Named: { type: 'string', minLength: 2 } },
    );

    expect(result.readable && result.accepts('ab')).toBe(true);
    expect(result.readable && result.accepts('a')).toBe(false);
  });

  it('reads only the properties a value has itself, not those every object inherits', () => {
    const named = reference({
      type: 'object',
      properties: { toString: { type: 'string' } },
      additionalProperties: false,
    });
    const required = reference({ type: 'object', required: ['constructor'] });

    expect(named.readable && named.accepts({})).toBe(true);
    expect(required.readable && required.accepts({})).toBe(false);
  });

  it('does not refuse a keyword OpenAPI adds to a schema', () => {
    const result = reference({ type: 'string', xml: { name: 'x' } });

    expect(result.readable && result.accepts('a')).toBe(true);
  });

  it('does not judge a format it has no checker for', () => {
    expect(reference({ type: 'string', format: 'iri' })).toEqual({
      readable: false,
      reason:
        'the reference validator does not check it: ' +
        'unknown format "iri" ignored in schema at path "#"',
    });
  });

  it('does not judge a schema it cannot read', () => {
    const result = reference({ $ref: '#/components/schemas/Missing' });

    expect(result.readable).toBe(false);
  });
});
