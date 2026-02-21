/**
 * Unit tests for Zod primitive schema generation.
 *
 * Tests the generation of:
 * - Integer formats: z.int(), z.int32(), z.int64()
 * - String formats: z.email(), z.url(), z.uuidv4(), z.iso.*, z.ipv4(), z.ipv6()
 * - filterRedundantValidations()
 *
 * @module writers/zod/primitives.unit.test
 */

import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { writePrimitiveSchema, filterRedundantValidations } from './primitives.js';
import type { CastrSchema } from '../../../ir/index.js';

describe('ZodPrimitivesWriter', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generatePrimitive(schema: CastrSchema): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    const writer = sourceFile.getProject().createWriter();
    const handled = writePrimitiveSchema(schema, writer);
    if (!handled) {
      return 'NOT_PRIMITIVE';
    }
    return writer.toString();
  }

  function createMockSchema(overrides: Partial<CastrSchema> = {}): CastrSchema {
    return {
      type: 'string',
      metadata: {
        required: true,
        nullable: false,
        circularReferences: [],
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        zodChain: { presence: '', validations: [], defaults: [] },
      },
      ...overrides,
    } as CastrSchema;
  }

  describe('Integer formats', () => {
    it('generates z.int() for integer without format', () => {
      const schema = createMockSchema({ type: 'integer' });
      expect(generatePrimitive(schema)).toBe('z.int()');
    });

    it('generates z.int32() for integer format: int32', () => {
      const schema = createMockSchema({ type: 'integer', format: 'int32' });
      expect(generatePrimitive(schema)).toBe('z.int32()');
    });

    it('generates z.int64() for integer format: int64', () => {
      const schema = createMockSchema({ type: 'integer', format: 'int64' });
      expect(generatePrimitive(schema)).toBe('z.int64()');
    });

    it('throws error for unsupported integer format to prevent silent format loss', () => {
      const schema = createMockSchema({ type: 'integer', format: 'int16' });
      expect(() => generatePrimitive(schema)).toThrow(/Unsupported integer format "int16"/);
    });
  });

  describe('Number formats', () => {
    it('generates z.number() for number without format', () => {
      const schema = createMockSchema({ type: 'number' });
      expect(generatePrimitive(schema)).toBe('z.number()');
    });

    it('generates z.float32() for number format: float', () => {
      const schema = createMockSchema({ type: 'number', format: 'float' });
      expect(generatePrimitive(schema)).toBe('z.float32()');
    });

    it('generates z.float64() for number format: double', () => {
      const schema = createMockSchema({ type: 'number', format: 'double' });
      expect(generatePrimitive(schema)).toBe('z.float64()');
    });

    it('throws error for unsupported number format to prevent silent format loss', () => {
      const schema = createMockSchema({ type: 'number', format: 'decimal' });
      expect(() => generatePrimitive(schema)).toThrow(/Unsupported number format "decimal"/);
    });
  });

  describe('String formats', () => {
    it('generates z.email() for string format: email', () => {
      const schema = createMockSchema({ type: 'string', format: 'email' });
      expect(generatePrimitive(schema)).toBe('z.email()');
    });

    it('generates z.url() for string format: uri', () => {
      const schema = createMockSchema({ type: 'string', format: 'uri' });
      expect(generatePrimitive(schema)).toBe('z.url()');
    });

    it('generates z.url() for string format: url', () => {
      const schema = createMockSchema({ type: 'string', format: 'url' });
      expect(generatePrimitive(schema)).toBe('z.url()');
    });

    it('generates z.uuidv4() for string format: uuid', () => {
      const schema = createMockSchema({ type: 'string', format: 'uuid' });
      expect(generatePrimitive(schema)).toBe('z.uuidv4()');
    });

    it('generates z.iso.date() for string format: date', () => {
      const schema = createMockSchema({ type: 'string', format: 'date' });
      expect(generatePrimitive(schema)).toBe('z.iso.date()');
    });

    it('generates z.iso.datetime() for string format: date-time', () => {
      const schema = createMockSchema({ type: 'string', format: 'date-time' });
      expect(generatePrimitive(schema)).toBe('z.iso.datetime()');
    });

    it('generates z.iso.time() for string format: time', () => {
      const schema = createMockSchema({ type: 'string', format: 'time' });
      expect(generatePrimitive(schema)).toBe('z.iso.time()');
    });

    it('generates z.iso.duration() for string format: duration', () => {
      const schema = createMockSchema({ type: 'string', format: 'duration' });
      expect(generatePrimitive(schema)).toBe('z.iso.duration()');
    });

    it('generates z.ipv4() for string format: ipv4', () => {
      const schema = createMockSchema({ type: 'string', format: 'ipv4' });
      expect(generatePrimitive(schema)).toBe('z.ipv4()');
    });

    it('generates z.ipv6() for string format: ipv6', () => {
      const schema = createMockSchema({ type: 'string', format: 'ipv6' });
      expect(generatePrimitive(schema)).toBe('z.ipv6()');
    });

    it('generates z.hostname() for string format: hostname', () => {
      const schema = createMockSchema({ type: 'string', format: 'hostname' });
      expect(generatePrimitive(schema)).toBe('z.hostname()');
    });

    it('throws error for unsupported string format to prevent silent format loss', () => {
      const schema = createMockSchema({ type: 'string', format: 'password' });
      expect(() => generatePrimitive(schema)).toThrow(/Unsupported string format "password"/);
    });

    it('generates z.string() for string without format', () => {
      const schema = createMockSchema({ type: 'string' });
      expect(generatePrimitive(schema)).toBe('z.string()');
    });
  });

  describe('filterRedundantValidations', () => {
    it('filters .int() for integer type', () => {
      const schema = createMockSchema({ type: 'integer' });
      const validations = ['.min(1)', '.int()', '.max(100)'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual(['.min(1)', '.max(100)']);
    });

    it('filters .email() for string format: email', () => {
      const schema = createMockSchema({ type: 'string', format: 'email' });
      const validations = ['.min(5)', '.email()'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual(['.min(5)']);
    });

    it('filters .url() for string format: uri', () => {
      const schema = createMockSchema({ type: 'string', format: 'uri' });
      const validations = ['.url()'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual([]);
    });

    it('filters .uuid() for string format: uuid', () => {
      const schema = createMockSchema({ type: 'string', format: 'uuid' });
      const validations = ['.uuid()'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual([]);
    });

    it('keeps all validations for string without format', () => {
      const schema = createMockSchema({ type: 'string' });
      const validations = ['.min(1)', '.email()'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual(['.min(1)', '.email()']);
    });

    it('keeps all validations for number type', () => {
      const schema = createMockSchema({ type: 'number' });
      const validations = ['.min(0)', '.int()'];
      const result = filterRedundantValidations(validations, schema);
      expect(result).toEqual(['.min(0)', '.int()']);
    });
  });
});
