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
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strict' });
    expect(result?.properties?.get('id')?.type).toBe('string');
  });

  it('rejects passthrough objects by default', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        }).passthrough()
      `),
    ).toThrow(/strict object ingest is the default/);
  });

  it('normalizes passthrough objects to strip in compatibility mode', () => {
    const result = parseObjectZod(
      `
        z.object({
          id: z.string()
        }).passthrough()
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(true);
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strip' });
    expect(result?.properties?.get('id')?.type).toBe('string');
  });

  it('rejects a generic object (strip unknown - default)', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        })
      `),
    ).toThrow(/strict object ingest is the default/);
  });

  it('normalizes a generic object to strip in compatibility mode', () => {
    const result = parseObjectZod(
      `
        z.object({
          id: z.string()
        })
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result?.additionalProperties).toBe(true);
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('normalizes an explicit strip object in compatibility mode', () => {
    const result = parseObjectZod(
      `
        z.object({
          id: z.string()
        }).strip()
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(true);
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('normalizes a catchall object to strip in compatibility mode', () => {
    const result = parseObjectZod(
      `
        z.object({
          id: z.string()
        }).catchall(z.string())
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result?.type).toBe('object');
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strip' });
    expect(result?.additionalProperties).toBe(true);
  });

  it('should fail fast when a catchall schema cannot be parsed', () => {
    expect(() =>
      parseObjectZod(`
        z.object({
          id: z.string()
        }).catchall(UnknownSchema)
      `),
    ).toThrow(/Unsupported or unparseable Zod \.catchall\(\) schema/);
  });

  it('should let the last unknown-key modifier win before compatibility normalization', () => {
    const result = parseObjectZod(
      `
        z.object({
          id: z.string()
        }).passthrough().strict().strip()
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    expect(result?.additionalProperties).toBe(true);
    expect(result?.unknownKeyBehavior).toEqual({ mode: 'strip' });
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

  it('normalizes nested non-strict objects in compatibility mode', () => {
    const result = parseObjectZod(
      `
        z.strictObject({
          user: z.object({
            name: z.string()
          }).passthrough()
        })
      `,
      { nonStrictObjectPolicy: 'strip' },
    );

    const userSchema = result?.properties?.get('user');
    expect(userSchema?.type).toBe('object');
    expect(userSchema?.additionalProperties).toBe(true);
    expect(userSchema?.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });
});
