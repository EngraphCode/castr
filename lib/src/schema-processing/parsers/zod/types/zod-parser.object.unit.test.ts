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
  it('should parse a basic object with primitive properties', () => {
    const result = parseObjectZod(`
      z.object({
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
      z.object({
        id: z.string()
      }).strict()
    `);

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(false);
    expect(result?.properties?.get('id')?.type).toBe('string');
  });

  it('should parse a passthrough object (additionalProperties: true)', () => {
    const result = parseObjectZod(`
      z.object({
        id: z.string()
      }).passthrough()
    `);

    expect(result?.type).toBe('object');
    expect(result?.additionalProperties).toBe(true);
    expect(result?.properties?.get('id')?.type).toBe('string');
  });

  it('should parse a generic object (strip unknown - default)', () => {
    const result = parseObjectZod(`
      z.object({
        id: z.string()
      })
    `);

    expect(result?.additionalProperties).toBeUndefined(); // or whatever default behavior we map to IR (usually open or specific?)
    // OpenAPI default is open. Zod default is strip (which acts like explicit validation of allowed keys ONLY).
    // IR usually leaves additionalProperties undefined for default objects.
  });

  it('should handle optional and nullable properties correctly in required list', () => {
    const result = parseObjectZod(`
      z.object({
        req: z.string(),
        opt: z.string().optional(),
        nullable: z.string().nullable(),
        nullish: z.string().nullish()
      })
    `);

    expect(result?.required).toContain('req');
    expect(result?.required).toContain('nullable'); // nullable is still required key, value can be null
    expect(result?.required).not.toContain('opt');
    expect(result?.required).not.toContain('nullish');
  });

  it('should parse nested objects', () => {
    const result = parseObjectZod(`
      z.object({
        user: z.object({
          name: z.string()
        })
      })
    `);

    const userSchema = result?.properties?.get('user');
    expect(userSchema?.type).toBe('object');
    expect(userSchema?.properties?.get('name')?.type).toBe('string');
  });

  // Note: z.object({...}).extend({...}) is composition/inheritance.
  // We might test it here if parseObjectZod supports it, or later.
  // For basic parser, focus on z.object() definition.
});
