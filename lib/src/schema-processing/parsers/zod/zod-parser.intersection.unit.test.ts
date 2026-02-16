/**
 * Zod Intersection Parser Tests
 *
 * TDD for Intersections (z.intersection and .and()).
 *
 * @module parsers/zod/intersection.test
 */

import { describe, it, expect } from 'vitest';
import { parseIntersectionZod } from './zod-parser.intersection.js';
import { parseZodSchemaFromNode } from './zod-parser.core.js';
import { createZodProject } from './zod-ast.js';
import { Node } from 'ts-morph';
// Side-effect imports to register parsers needed for nested parsing
import './zod-parser.primitives.js';
import './zod-parser.object.js';

// Wrapper to test core dispatch for .and()
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

describe('Zod Intersection Parsing', () => {
  describe('z.intersection(A, B)', () => {
    it('should parse z.intersection([A, B])', () => {
      // z.intersection arguments are A, B. Not array.
      const result = parseIntersectionZod('z.intersection(z.string(), z.number())');
      expect(result).toMatchObject({
        allOf: [{ type: 'string' }, { type: 'number' }],
      });
    });
  });

  describe('A.and(B)', () => {
    it('should parse object.and(object)', () => {
      const result = parseCode('z.object({ a: z.string() }).and(z.object({ b: z.number() }))');

      expect(result?.allOf).toHaveLength(2);

      const allOf0 = result?.allOf?.[0];
      expect(allOf0?.type).toBe('object');
      expect(allOf0?.properties?.get('a')?.type).toBe('string');

      const allOf1 = result?.allOf?.[1];
      expect(allOf1?.type).toBe('object');
      expect(allOf1?.properties?.get('b')?.type).toBe('number');
    });

    it('should handle chained .and()', () => {
      const result = parseCode('z.string().and(z.number()).and(z.boolean())');
      // Structure: (string & number) & boolean -> allOf [ allOf[str, num], bool ]
      // OpenAPI flattens allOf? No, valid to nest.
      expect(result).toMatchObject({
        allOf: [
          {
            allOf: [{ type: 'string' }, { type: 'number' }],
          },
          { type: 'boolean' },
        ],
      });
    });
  });
});
