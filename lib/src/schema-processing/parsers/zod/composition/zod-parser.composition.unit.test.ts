/**
 * Zod Composition Parser Tests
 *
 * TDD for Arrays, Tuples, and Enums.
 */

import { describe, it, expect } from 'vitest';
import type { CastrSchema } from '../../../ir/index.js';
import { parseCompositionZod } from './zod-parser.composition.js';
import { parseZodSchemaFromNode } from '../zod-parser.core.js';
import { createZodProject } from '../ast/zod-ast.js';
import { Node } from 'ts-morph';
// Side-effect imports to register parsers needed for nested parsing
import '../types/zod-parser.primitives.js';
import '../types/zod-parser.object.js';
import './zod-parser.union.js';
import './zod-parser.intersection.js';

// Narrow an `items` value to the single-schema shape, failing loudly
// when the parser produced an array form (or nothing) instead.
function singleItemsOf(schema: { items?: CastrSchema | CastrSchema[] } | undefined): CastrSchema {
  const items = schema?.items;
  if (items === undefined || Array.isArray(items)) {
    throw new Error('expected a single items schema');
  }
  return items;
}

// Wrapper to test core dispatch for the .array() schema-method shorthand
function parseCode(code: string) {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${code};`);
  const varDecl = sourceFile.getVariableDeclarations()[0];
  if (!varDecl) {
    return undefined;
  }
  const init = varDecl.getInitializer();
  if (init && Node.isCallExpression(init)) {
    return parseZodSchemaFromNode(init, resolver);
  }
  return undefined;
}
// Note: We test the public wrapper parseCompositionZod which uses string -> Node -> Core -> Composition
// Or we test parseCompositionZodFromNode directly?
// Let's test parseCompositionZod logic mainly.
// For recursion, we rely on core dispatcher working (verification in integration tests).

describe('Zod Composition Parsing', () => {
  describe('Arrays', () => {
    it('should parse z.array(z.string())', () => {
      const result = parseCompositionZod('z.array(z.string())');
      expect(result).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('should parse array with min/max length', () => {
      const result = parseCompositionZod('z.array(z.string()).min(1).max(10)');
      expect(result).toMatchObject({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
      });
    });

    it('should parse array with exact length', () => {
      const result = parseCompositionZod('z.array(z.string()).length(5)');
      expect(result).toMatchObject({
        type: 'array',
        minItems: 5,
        maxItems: 5,
      });
    });

    it('should parse nested arrays', () => {
      const result = parseCompositionZod('z.array(z.array(z.number()))');
      expect(result).toMatchObject({
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' },
        },
      });
    });
  });

  describe('.array() schema-method shorthand', () => {
    // z.string().array() is equivalent to z.array(z.string()) — verified
    // against zod 4.4.3, including .array().array() nesting and the
    // element/array split of modifiers before/after the .array() link.

    it('parses z.string().array() like z.array(z.string())', () => {
      expect(parseCode('z.string().array()')).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('applies modifiers before .array() to the element', () => {
      const result = parseCode('z.string().min(3).array()');
      expect(result).toMatchObject({
        type: 'array',
        items: { type: 'string', minLength: 3 },
      });
      expect(result?.minItems).toBeUndefined();
    });

    it('keeps element optionality before .array() on the element, not the array', () => {
      const result = parseCode('z.string().optional().array()');
      expect(singleItemsOf(result).metadata.required).toBe(false);
      expect(result?.metadata.required).toBe(true);
    });

    it('applies trailing modifiers after .array() to the array', () => {
      const result = parseCode('z.string().array().min(2).optional()');
      expect(result).toMatchObject({
        type: 'array',
        minItems: 2,
        items: { type: 'string' },
      });
      expect(singleItemsOf(result).minLength).toBeUndefined();
      expect(result?.metadata.required).toBe(false);
    });

    it('parses nested .array().array()', () => {
      expect(parseCode('z.string().array().array()')).toMatchObject({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
      });
    });

    it('parses .array() over an .or() union with the outermost .array() owning the chain', () => {
      expect(parseCode('z.string().or(z.number()).array()')).toMatchObject({
        type: 'array',
        items: { anyOf: [{ type: 'string' }, { type: 'number' }] },
      });
    });

    it('parses .or() after .array() with the outermost .or() owning the chain', () => {
      expect(parseCode('z.string().array().or(z.number())')).toMatchObject({
        anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'number' }],
      });
    });

    it('parses .array() over an .and() intersection', () => {
      expect(parseCode('z.string().and(z.number()).array()')).toMatchObject({
        type: 'array',
        items: { allOf: [{ type: 'string' }, { type: 'number' }] },
      });
    });

    it('parses .array() chained onto z.intersection() instead of rejecting the chain', () => {
      expect(parseCode('z.intersection(z.string(), z.number()).array()')).toMatchObject({
        type: 'array',
        items: { allOf: [{ type: 'string' }, { type: 'number' }] },
      });
    });

    it('parses the .array() shorthand inside an object property (reviewer example)', () => {
      const result = parseCode('z.strictObject({ tags: z.string().array() })');
      expect(result?.properties?.get('tags')).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
      expect(result?.required).toEqual(['tags']);
    });

    it('still parses the canonical z.array(z.string()) through core dispatch', () => {
      expect(parseCode('z.array(z.string()).min(1)')).toMatchObject({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      });
    });

    it('rejects an unsupported trailing method after .array() instead of dropping it', () => {
      expect(() => parseCode('z.string().array().refine((value) => true)')).toThrow(/\.refine\(/);
    });

    it('rejects a string-only method after .array() instead of applying it to the element', () => {
      expect(() => parseCode('z.string().array().email()')).toThrow(/\.email\(/);
    });
  });

  describe('Tuples', () => {
    it('should parse z.tuple([string, number])', () => {
      const result = parseCompositionZod('z.tuple([z.string(), z.number()])');
      expect(result).toMatchObject({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 2,
        maxItems: 2,
      });
    });

    it('should parse variadic tuple .rest()', () => {
      const result = parseCompositionZod('z.tuple([z.string()]).rest(z.number())');
      expect(result).toMatchObject({
        type: 'array',
        prefixItems: [{ type: 'string' }],
        minItems: 1, // Rest allows more
        // items: { type: 'number' } // OpenAPI 3.1: items is the rest schema
      });
      expect(result?.items).toMatchObject({ type: 'number' });
      expect(result?.maxItems).toBeUndefined();
    });
  });
});
