/**
 * Zod Object Parser Tests
 *
 * TDD for Zod Object schemas, strictness, and property extraction.
 *
 * @module parsers/zod/object.test
 */

import { describe, it, expect } from 'vitest';
import { parseObjectZod } from './zod-parser.object.js';
// Side-effect import to register primitive parser needed for property parsing
import './zod-parser.primitives.js';

describe('Zod Object Parsing', () => {
  it('should parse a basic strict object with primitive properties', () => {
    const result = parseObjectZod(`
      z.strictObject({
        name: z.string(),
        age: z.number(),
        active: z.boolean()
      })
    `);

    expect(result?.type).toBe('object');
    expect(result?.properties?.get('name')?.type).toBe('string');
    expect(result?.properties?.get('age')?.type).toBe('number');
    expect(result?.properties?.get('active')?.type).toBe('boolean');
    expect(result?.required).toEqual(['name', 'age', 'active']);
  });

  it('should parse a strict object (additionalProperties: false)', () => {
    const result = parseObjectZod(`
      z.strictObject({
        id: z.string()
      })
    `);

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(false);
    expect(result?.properties?.get('id')?.type).toBe('string');
  });

  it('rejects passthrough objects', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        }).passthrough()
      `),
    ).toThrow(/closed-world object semantics/);
  });

  it('rejects a generic z.object() (strip unknown - default)', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        })
      `),
    ).toThrow(/closed-world object semantics/);
  });

  it('rejects an explicit strip object', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        }).strip()
      `),
    ).toThrow(/closed-world object semantics/);
  });

  it('rejects a catchall object', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        }).catchall(z.string())
      `),
    ).toThrow(/closed-world object semantics/);
  });

  it('accepts z.object().strict() as equivalent to z.strictObject()', () => {
    const result = parseObjectZod(`
      z.object({
        id: z.string()
      }).strict()
    `);

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(false);
  });

  it('should handle optional and nullable properties correctly in required list', () => {
    const result = parseObjectZod(`
      z.strictObject({
        req: z.string(),
        opt: z.string().optional(),
        nullable: z.string().nullable(),
        nullish: z.string().nullish()
      })
    `);

    expect(result?.required).toContain('req');
    expect(result?.required).toContain('nullable');
    expect(result?.required).not.toContain('opt');
    expect(result?.required).not.toContain('nullish');
  });

  it('should parse nested strict objects', () => {
    const result = parseObjectZod(`
      z.strictObject({
        user: z.strictObject({
          name: z.string()
        })
      })
    `);

    const userSchema = result?.properties?.get('user');
    expect(userSchema?.type).toBe('object');
    expect(userSchema?.properties?.get('name')?.type).toBe('string');
  });

  it('rejects nested non-strict objects', () => {
    expect(() =>
      parseObjectZod(`
        z.strictObject({
          user: z.object({
            name: z.string()
          }).passthrough()
        })
      `),
    ).toThrow(/closed-world object semantics/);
  });
});
