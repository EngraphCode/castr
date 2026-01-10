/**
 * Zod 3 Detection Tests
 *
 * TDD tests for detecting and rejecting Zod 3 syntax.
 * Write tests FIRST, then implement detection logic.
 *
 * @module parsers/zod/detection.test
 */

import { describe, it, expect } from 'vitest';
import { detectZod3Syntax, isZod3Method, detectDynamicSchemas } from './zod-parser.detection.js';

describe('Zod 3 Detection', () => {
  describe('isZod3Method', () => {
    it('should identify .nonempty() as Zod 3 method', () => {
      expect(isZod3Method('nonempty')).toBe(true);
    });

    it('should identify .nonnegative() as Zod 3 method', () => {
      expect(isZod3Method('nonnegative')).toBe(true);
    });

    it('should identify .nonpositive() as Zod 3 method', () => {
      expect(isZod3Method('nonpositive')).toBe(true);
    });

    it('should NOT identify .min() as Zod 3 method', () => {
      expect(isZod3Method('min')).toBe(false);
    });

    it('should NOT identify .max() as Zod 3 method', () => {
      expect(isZod3Method('max')).toBe(false);
    });

    it('should NOT identify .email() as Zod 3 method', () => {
      expect(isZod3Method('email')).toBe(false);
    });
  });

  describe('detectZod3Syntax', () => {
    it('should detect z.string().nonempty() as Zod 3 syntax', () => {
      const source = `const schema = z.string().nonempty();`;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error).toBeDefined();
      expect(error?.code).toBe('ZOD3_SYNTAX');
      expect(error?.message).toContain('nonempty');
      expect(error?.message).toContain('.min(1)');
    });

    it('should detect z.number().nonnegative() as Zod 3 syntax', () => {
      const source = `const schema = z.number().nonnegative();`;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error).toBeDefined();
      expect(error?.code).toBe('ZOD3_SYNTAX');
      expect(error?.message).toContain('nonnegative');
      expect(error?.message).toContain('.min(0)');
    });

    it('should detect z.number().nonpositive() as Zod 3 syntax', () => {
      const source = `const schema = z.number().nonpositive();`;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error).toBeDefined();
      expect(error?.code).toBe('ZOD3_SYNTAX');
      expect(error?.message).toContain('nonpositive');
      expect(error?.message).toContain('.max(0)');
    });

    it('should detect multiple Zod 3 methods in chain', () => {
      const source = `const schema = z.string().nonempty().email();`;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(1);
      expect(errors.at(0)?.code).toBe('ZOD3_SYNTAX');
    });

    it('should detect Zod 3 methods across multiple schemas', () => {
      const source = `
        const schema1 = z.string().nonempty();
        const schema2 = z.number().nonnegative();
      `;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e.code === 'ZOD3_SYNTAX')).toBe(true);
    });

    it('should NOT flag valid Zod 4 syntax', () => {
      const source = `
        const schema = z.string().min(1).email();
        const num = z.number().min(0).max(100);
      `;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(0);
    });

    it('should include location information in errors', () => {
      const source = `const schema = z.string().nonempty();`;
      const errors = detectZod3Syntax(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error?.location).toBeDefined();
      expect(error?.location?.line).toBeGreaterThan(0);
      expect(error?.location?.column).toBeGreaterThan(0);
    });
  });
});

describe('Dynamic Schema Detection', () => {
  describe('detectDynamicSchemas', () => {
    it('should detect schemas with computed property keys', () => {
      const source = `
        const key = 'name';
        const schema = z.object({ [key]: z.string() });
      `;
      const errors = detectDynamicSchemas(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error?.code).toBe('DYNAMIC_SCHEMA');
      expect(error?.message).toMatch(/computed/i);
    });

    it('should detect schemas using spread operator', () => {
      const source = `
        const baseFields = { name: z.string() };
        const schema = z.object({ ...baseFields, age: z.number() });
      `;
      const errors = detectDynamicSchemas(source);

      expect(errors).toHaveLength(1);
      const error = errors.at(0);
      expect(error?.code).toBe('DYNAMIC_SCHEMA');
      expect(error?.message).toMatch(/spread/i);
    });

    it('should NOT flag static object schemas', () => {
      const source = `
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });
      `;
      const errors = detectDynamicSchemas(source);

      expect(errors).toHaveLength(0);
    });

    it('should include location information in errors', () => {
      const source = `const schema = z.object({ [key]: z.string() });`;
      const errors = detectDynamicSchemas(source);

      expect(errors).toHaveLength(1);
      expect(errors.at(0)?.location).toBeDefined();
    });
  });
});
