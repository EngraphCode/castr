/**
 * Zod Union Parser Tests
 *
 * TDD for Unions, Discriminated Unions, and XOR.
 */

import { describe, it, expect } from 'vitest';
import { parseUnionZod } from './zod-parser.union.js';
import { parseZodSchemaFromNode } from '../zod-parser.core.js';
import { createZodProject } from '../ast/zod-ast.js';
import { Node } from 'ts-morph';
// Side-effect imports to register parsers needed for nested parsing
import '../types/zod-parser.primitives.js';
import '../types/zod-parser.object.js';
import './zod-parser.intersection.js';

// Wrapper to test core dispatch for chained .or()
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

describe('Zod Union Parsing', () => {
  describe('Unions (anyOf)', () => {
    it('should parse z.union([string, number])', () => {
      const result = parseUnionZod('z.union([z.string(), z.number()])');
      expect(result).toMatchObject({
        anyOf: [{ type: 'string' }, { type: 'number' }],
      });
    });

    it('should parse nested unions', () => {
      const result = parseUnionZod('z.union([z.string(), z.union([z.number(), z.boolean()])])');
      expect(result).toMatchObject({
        anyOf: [
          { type: 'string' },
          {
            anyOf: [{ type: 'number' }, { type: 'boolean' }],
          },
        ],
      });
    });
  });

  describe('A.or(B) union shorthand (anyOf)', () => {
    it('parses z.string().or(z.number()) as an anyOf union', () => {
      const result = parseCode('z.string().or(z.number())');
      expect(result).toMatchObject({
        anyOf: [{ type: 'string' }, { type: 'number' }],
      });
    });

    it('parses chained .or() as nested unions', () => {
      const result = parseCode('z.string().or(z.number()).or(z.boolean())');
      // (string | number) | boolean -> anyOf [ anyOf[str, num], bool ]
      expect(result).toMatchObject({
        anyOf: [{ anyOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses .or() chained onto z.union() instead of rejecting the chain', () => {
      const result = parseCode('z.union([z.string(), z.number()]).or(z.boolean())');
      expect(result).toMatchObject({
        anyOf: [{ anyOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses .or() chained onto z.intersection() instead of rejecting the chain', () => {
      const result = parseCode('z.intersection(z.string(), z.number()).or(z.boolean())');
      expect(result).toMatchObject({
        anyOf: [{ allOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses A.and(B).or(C) with the outermost .or() owning the chain', () => {
      const result = parseCode('z.string().and(z.number()).or(z.boolean())');
      expect(result).toMatchObject({
        anyOf: [{ allOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses A.or(B).and(C) with the outermost .and() owning the chain', () => {
      const result = parseCode('z.string().or(z.number()).and(z.boolean())');
      expect(result).toMatchObject({
        allOf: [{ anyOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses .and() chained onto z.union() instead of rejecting the chain', () => {
      const result = parseCode('z.union([z.string(), z.number()]).and(z.boolean())');
      expect(result).toMatchObject({
        allOf: [{ anyOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });

    it('parses .or() chained onto z.xor() instead of rejecting the chain', () => {
      const result = parseCode('z.xor([z.string(), z.number()]).or(z.boolean())');
      expect(result).toMatchObject({
        anyOf: [{ oneOf: [{ type: 'string' }, { type: 'number' }] }, { type: 'boolean' }],
      });
    });
  });

  describe('.or() with trailing chained modifiers', () => {
    it('parses z.string().or(z.number()).optional() and captures presence', () => {
      const result = parseCode('z.string().or(z.number()).optional()');
      expect(result).toMatchObject({
        anyOf: [{ type: 'string' }, { type: 'number' }],
      });
      expect(result?.metadata.required).toBe(false);
      expect(result?.metadata.zodChain.presence).toBe('.optional()');
    });

    it('parses .or() followed by .describe() and captures the description', () => {
      const result = parseCode("z.string().or(z.number()).describe('A union value')");
      expect(result?.anyOf).toHaveLength(2);
      expect(result?.description).toBe('A union value');
    });

    it('rejects an unsupported trailing method after .or() instead of dropping it', () => {
      expect(() => parseCode('z.string().or(z.number()).refine((value) => true)')).toThrow(
        /\.refine\(/,
      );
    });

    it('rejects an .or() member the parser cannot represent instead of dropping it', () => {
      expect(() => parseCode('z.string().or(someUnknownSchema)')).toThrow(/\.or\(\) union member/);
    });
  });

  describe('Discriminated Unions (oneOf + discriminator)', () => {
    // Note: z.discriminatedUnion expects object schemas with literal discriminators
    it('should parse z.discriminatedUnion', () => {
      const result = parseUnionZod(`
        z.discriminatedUnion("type", [
          z.strictObject({ type: z.literal("a"), val: z.string() }),
          z.strictObject({ type: z.literal("b"), val: z.number() })
        ])
      `);

      // Verify structure
      expect(result?.oneOf).toHaveLength(2);
      expect(result?.discriminator).toMatchObject({ propertyName: 'type' });

      // Verify first variant
      const variant0 = result?.oneOf?.[0];
      expect(variant0?.type).toBe('object');
      expect(variant0?.properties?.get('type')?.type).toBe('string');
      expect(variant0?.properties?.get('type')?.enum).toEqual(['a']);
      expect(variant0?.properties?.get('val')?.type).toBe('string');

      // Verify second variant
      const variant1 = result?.oneOf?.[1];
      expect(variant1?.type).toBe('object');
      expect(variant1?.properties?.get('type')?.type).toBe('string');
      expect(variant1?.properties?.get('type')?.enum).toEqual(['b']);
      expect(variant1?.properties?.get('val')?.type).toBe('number');
    });
  });
});
