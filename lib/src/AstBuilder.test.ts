/**
 * Unit tests for AstBuilder - A type-safe wrapper around ts-morph
 * 
 * TDD: These tests define the API before implementation
 * 
 * Design Goals:
 * - Zero type assertions
 * - Fluent API (method chaining)
 * - Simple, focused methods
 * - Hide ts-morph complexity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AstBuilder } from './AstBuilder.js';

describe('AstBuilder', () => {
  describe('constructor', () => {
    it('should create a new instance', () => {
      const builder = new AstBuilder();
      expect(builder).toBeInstanceOf(AstBuilder);
    });

    it('should start with empty output', () => {
      const builder = new AstBuilder();
      const output = builder.toString();
      expect(output.trim()).toBe('');
    });
  });

  describe('addImport', () => {
    it('should add named imports', () => {
      const builder = new AstBuilder();
      builder.addImport('zod', ['z', 'ZodType']);
      
      const output = builder.toString();
      expect(output).toContain('import { z, ZodType } from "zod"');
    });

    it('should add single named import', () => {
      const builder = new AstBuilder();
      builder.addImport('openapi3-ts/oas30', ['OpenAPIObject']);
      
      const output = builder.toString();
      expect(output).toContain('import { OpenAPIObject } from "openapi3-ts/oas30"');
    });

    it('should support method chaining', () => {
      const builder = new AstBuilder();
      const result = builder.addImport('zod', ['z']);
      
      expect(result).toBe(builder); // Returns this for chaining
    });

    it('should add multiple imports separately', () => {
      const builder = new AstBuilder();
      builder
        .addImport('zod', ['z'])
        .addImport('axios', ['AxiosResponse']);
      
      const output = builder.toString();
      expect(output).toContain('import { z } from "zod"');
      expect(output).toContain('import { AxiosResponse } from "axios"');
    });
  });

  describe('addTypeAlias', () => {
    it('should add simple type alias', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('UserId', 'string');
      
      const output = builder.toString();
      expect(output).toContain('export type UserId = string');
    });

    it('should add object type alias', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('User', '{ id: number; name: string }');
      
      const output = builder.toString();
      expect(output).toContain('export type User');
      expect(output).toContain('id: number');
      expect(output).toContain('name: string');
    });

    it('should add union type alias', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Status', '"active" | "inactive" | "pending"');
      
      const output = builder.toString();
      expect(output).toContain('export type Status');
      expect(output).toContain('"active"');
      expect(output).toContain('"inactive"');
    });

    it('should add intersection type alias', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Extended', 'Base & { extra: string }');
      
      const output = builder.toString();
      expect(output).toContain('export type Extended = Base & { extra: string }');
    });

    it('should support non-exported types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Internal', 'string', { exported: false });
      
      const output = builder.toString();
      expect(output).toContain('type Internal = string');
      expect(output).not.toContain('export type Internal');
    });

    it('should support method chaining', () => {
      const builder = new AstBuilder();
      const result = builder.addTypeAlias('User', 'string');
      
      expect(result).toBe(builder);
    });

    it('should add JSDoc comments', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('User', '{ id: number }', {
        docs: ['Represents a user in the system'],
      });
      
      const output = builder.toString();
      expect(output).toContain('/**');
      expect(output).toContain('* Represents a user in the system');
      expect(output).toContain('*/');
    });

    it('should add multiple JSDoc lines', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Config', '{ timeout: number }', {
        docs: [
          'Configuration object',
          '@example',
          '{ timeout: 5000 }',
        ],
      });
      
      const output = builder.toString();
      expect(output).toContain('Configuration object');
      expect(output).toContain('@example');
      expect(output).toContain('{ timeout: 5000 }');
    });
  });

  describe('addInterface', () => {
    it('should add simple interface', () => {
      const builder = new AstBuilder();
      builder.addInterface('Person', [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
      ]);
      
      const output = builder.toString();
      expect(output).toContain('export interface Person');
      expect(output).toContain('id: number');
      expect(output).toContain('name: string');
    });

    it('should add optional properties', () => {
      const builder = new AstBuilder();
      builder.addInterface('User', [
        { name: 'id', type: 'number' },
        { name: 'email', type: 'string', optional: true },
      ]);
      
      const output = builder.toString();
      expect(output).toContain('id: number');
      expect(output).toContain('email?: string');
    });

    it('should add readonly properties', () => {
      const builder = new AstBuilder();
      builder.addInterface('ImmutableUser', [
        { name: 'id', type: 'number', readonly: true },
      ]);
      
      const output = builder.toString();
      expect(output).toContain('readonly id: number');
    });

    it('should support method chaining', () => {
      const builder = new AstBuilder();
      const result = builder.addInterface('User', [{ name: 'id', type: 'number' }]);
      
      expect(result).toBe(builder);
    });

    it('should add index signature', () => {
      const builder = new AstBuilder();
      builder.addInterface('Dictionary', [], {
        indexSignature: { keyName: 'key', keyType: 'string', returnType: 'any' },
      });
      
      const output = builder.toString();
      expect(output).toContain('[key: string]: any');
    });

    it('should support non-exported interfaces', () => {
      const builder = new AstBuilder();
      builder.addInterface('Internal', [{ name: 'id', type: 'number' }], { exported: false });
      
      const output = builder.toString();
      expect(output).toContain('interface Internal');
      expect(output).not.toContain('export interface Internal');
    });

    it('should add JSDoc comments', () => {
      const builder = new AstBuilder();
      builder.addInterface('User', [{ name: 'id', type: 'number' }], {
        docs: ['User interface'],
      });
      
      const output = builder.toString();
      expect(output).toContain('/**');
      expect(output).toContain('* User interface');
    });
  });

  describe('complex type expressions', () => {
    it('should handle nested object types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('User', '{ id: number; profile: { name: string; age: number } }');
      
      const output = builder.toString();
      expect(output).toContain('profile: { name: string; age: number }');
    });

    it('should handle array types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Users', 'User[]');
      
      const output = builder.toString();
      expect(output).toContain('export type Users = User[]');
    });

    it('should handle tuple types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Point', '[number, number]');
      
      const output = builder.toString();
      expect(output).toContain('export type Point = [number, number]');
    });

    it('should handle generic types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Result', 'Promise<User>');
      
      const output = builder.toString();
      expect(output).toContain('export type Result = Promise<User>');
    });

    it('should handle readonly array types', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('ReadonlyUsers', 'readonly User[]');
      
      const output = builder.toString();
      expect(output).toContain('readonly User[]');
    });

    it('should handle Partial utility type', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('PartialUser', 'Partial<User>');
      
      const output = builder.toString();
      expect(output).toContain('Partial<User>');
    });
  });

  describe('multiple declarations', () => {
    it('should add multiple type aliases', () => {
      const builder = new AstBuilder();
      builder
        .addTypeAlias('UserId', 'string')
        .addTypeAlias('UserName', 'string')
        .addTypeAlias('User', '{ id: UserId; name: UserName }');
      
      const output = builder.toString();
      expect(output).toContain('export type UserId');
      expect(output).toContain('export type UserName');
      expect(output).toContain('export type User');
    });

    it('should add imports and types in order', () => {
      const builder = new AstBuilder();
      builder
        .addImport('zod', ['z'])
        .addTypeAlias('Schema', 'z.ZodType<User>')
        .addTypeAlias('User', '{ id: string }');
      
      const output = builder.toString();
      const importIndex = output.indexOf('import');
      const schemaIndex = output.indexOf('type Schema');
      const userIndex = output.indexOf('type User');
      
      expect(importIndex).toBeLessThan(schemaIndex);
      expect(schemaIndex).toBeLessThan(userIndex);
    });

    it('should mix interfaces and type aliases', () => {
      const builder = new AstBuilder();
      builder
        .addInterface('IPerson', [{ name: 'id', type: 'number' }])
        .addTypeAlias('PersonId', 'IPerson["id"]');
      
      const output = builder.toString();
      expect(output).toContain('interface IPerson');
      expect(output).toContain('type PersonId');
    });
  });

  describe('toString', () => {
    it('should return formatted TypeScript code', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('User', 'string');
      
      const output = builder.toString();
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    });

    it('should include all declarations', () => {
      const builder = new AstBuilder();
      builder
        .addImport('zod', ['z'])
        .addTypeAlias('A', 'string')
        .addTypeAlias('B', 'number')
        .addInterface('C', [{ name: 'x', type: 'boolean' }]);
      
      const output = builder.toString();
      expect(output).toContain('import');
      expect(output).toContain('type A');
      expect(output).toContain('type B');
      expect(output).toContain('interface C');
    });

    it('should be callable multiple times with same result', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('User', 'string');
      
      const output1 = builder.toString();
      const output2 = builder.toString();
      
      expect(output1).toBe(output2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string type gracefully', () => {
      const builder = new AstBuilder();
      // This is technically invalid TypeScript, but builder shouldn't crash
      builder.addTypeAlias('Empty', '');
      
      const output = builder.toString();
      expect(output).toContain('type Empty');
    });

    it('should handle special characters in type names', () => {
      const builder = new AstBuilder();
      // $ is valid in TypeScript identifiers
      builder.addTypeAlias('$User', 'string');
      
      const output = builder.toString();
      expect(output).toContain('$User');
    });

    it('should handle very long type expressions', () => {
      const builder = new AstBuilder();
      const longType = '{ ' + Array.from({ length: 100 }, (_, i) => `prop${i}: string`).join('; ') + ' }';
      builder.addTypeAlias('LongType', longType);
      
      const output = builder.toString();
      expect(output).toContain('type LongType');
      expect(output).toContain('prop0');
      expect(output).toContain('prop99');
    });
  });

  describe('real-world usage patterns', () => {
    it('should support OpenAPI schema type alias pattern', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Pet', '{ id: number; name: string; status: "available" | "pending" | "sold" }');
      
      const output = builder.toString();
      expect(output).toContain('export type Pet');
      expect(output).toContain('"available"');
      expect(output).toContain('"sold"');
    });

    it('should support referenced schemas', () => {
      const builder = new AstBuilder();
      builder
        .addTypeAlias('PetId', 'string')
        .addTypeAlias('Pet', '{ id: PetId; name: string }')
        .addTypeAlias('PetResponse', '{ data: Pet; status: number }');
      
      const output = builder.toString();
      expect(output).toContain('type PetId');
      expect(output).toContain('type Pet');
      expect(output).toContain('type PetResponse');
      expect(output).toContain('id: PetId');
      expect(output).toContain('data: Pet');
    });

    it('should support nullable types (union with null)', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('NullableString', 'string | null');
      
      const output = builder.toString();
      expect(output).toContain('string | null');
    });

    it('should support allOf intersection pattern', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('ExtendedPet', 'Pet & { category: string }');
      
      const output = builder.toString();
      expect(output).toContain('Pet & { category: string }');
    });

    it('should support oneOf union pattern', () => {
      const builder = new AstBuilder();
      builder.addTypeAlias('Response', 'SuccessResponse | ErrorResponse');
      
      const output = builder.toString();
      expect(output).toContain('SuccessResponse | ErrorResponse');
    });
  });
});

