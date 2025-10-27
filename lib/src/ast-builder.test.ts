import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, it, expect } from 'vitest';

/**
 * Exploratory tests for ts-morph API
 * These tests explore ts-morph capabilities to inform AstBuilder design
 */
describe('ts-morph API exploration', () => {
  describe('Type Alias Generation', () => {
    it('should create simple type alias', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'User',
        type: '{ id: number; name: string }',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type User');
      expect(output).toContain('id: number');
      expect(output).toContain('name: string');
    });

    it('should create union type alias', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'Status',
        type: '"active" | "inactive" | "pending"',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type Status');
      expect(output).toContain('"active"');
      expect(output).toContain('"inactive"');
      expect(output).toContain('"pending"');
    });

    it('should create intersection type alias', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'Extended',
        type: 'Base & { extra: string }',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type Extended');
      expect(output).toContain('Base &');
      expect(output).toContain('extra: string');
    });
  });

  describe('Interface Generation', () => {
    it('should create interface with properties', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addInterface({
        name: 'Person',
        isExported: true,
        properties: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string', hasQuestionToken: true },
        ],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export interface Person');
      expect(output).toContain('id: number');
      expect(output).toContain('name: string');
      expect(output).toContain('email?: string');
    });

    it('should create interface with index signature', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addInterface({
        name: 'Dictionary',
        isExported: true,
        indexSignatures: [{ keyName: 'key', keyType: 'string', returnType: 'any' }],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export interface Dictionary');
      expect(output).toContain('[key: string]: any');
    });
  });

  describe('Import Generation', () => {
    it('should add named imports', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addImportDeclaration({
        moduleSpecifier: 'zod',
        namedImports: ['z', 'ZodType'],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('import { z, ZodType } from "zod"');
    });

    it('should add default import', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addImportDeclaration({
        moduleSpecifier: 'axios',
        defaultImport: 'axios',
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('import axios from "axios"');
    });

    it('should add namespace import', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addImportDeclaration({
        moduleSpecifier: 'fs',
        namespaceImport: 'fs',
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('import * as fs from "fs"');
    });
  });

  describe('Variable Declarations', () => {
    it('should create const variable', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: 'API_URL',
            initializer: '"https://api.example.com"',
          },
        ],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export const API_URL');
      expect(output).toContain('https://api.example.com');
    });

    it('should create variable with type annotation', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: 'config',
            type: 'Config',
            initializer: '{ timeout: 5000 }',
          },
        ],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export const config: Config');
      expect(output).toContain('timeout: 5000');
    });
  });

  describe('Function Declarations', () => {
    it('should create function with parameters and return type', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addFunction({
        name: 'add',
        isExported: true,
        parameters: [
          { name: 'a', type: 'number' },
          { name: 'b', type: 'number' },
        ],
        returnType: 'number',
        statements: 'return a + b;',
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export function add(a: number, b: number): number');
      expect(output).toContain('return a + b;');
    });

    it('should create async function', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addFunction({
        name: 'fetchData',
        isExported: true,
        isAsync: true,
        parameters: [{ name: 'url', type: 'string' }],
        returnType: 'Promise<Response>',
        statements: 'return fetch(url);',
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export async function fetchData(url: string): Promise<Response>');
      expect(output).toContain('return fetch(url);');
    });
  });

  describe('Complex Type Structures', () => {
    it('should create nested object type', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'NestedUser',
        type: '{ id: number; profile: { name: string; age: number } }',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type NestedUser');
      expect(output).toContain('profile: { name: string; age: number }');
    });

    it('should create array type', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'Users',
        type: 'User[]',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type Users = User[]');
    });

    it('should create tuple type', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'Point',
        type: '[number, number]',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type Point = [number, number]');
    });

    it('should create readonly properties', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addInterface({
        name: 'ImmutableUser',
        isExported: true,
        properties: [
          { name: 'id', type: 'number', isReadonly: true },
          { name: 'name', type: 'string', isReadonly: true },
        ],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('export interface ImmutableUser');
      expect(output).toContain('readonly id: number');
      expect(output).toContain('readonly name: string');
    });
  });

  describe('Comments and Documentation', () => {
    it('should add JSDoc comments', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addInterface({
        name: 'User',
        isExported: true,
        docs: ['Represents a user in the system'],
        properties: [
          {
            name: 'id',
            type: 'number',
            docs: ['Unique identifier'],
          },
        ],
      });

      const output = sourceFile.getFullText();
      expect(output).toContain('/**');
      expect(output).toContain('* Represents a user in the system');
      expect(output).toContain('* Unique identifier');
    });
  });

  describe('Formatting and Output', () => {
    it('should format code consistently', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({
        name: 'Test',
        type: '{ a: number; b: string; c: boolean }',
        isExported: true,
      });

      const output = sourceFile.getFullText();
      // ts-morph respects TypeScript's formatting
      expect(output).toMatch(/export type Test/);
      expect(output.trim()).not.toBe(''); // Should have content
    });

    it('should handle multiple declarations', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });

      sourceFile.addTypeAlias({ name: 'Type1', type: 'string', isExported: true });
      sourceFile.addTypeAlias({ name: 'Type2', type: 'number', isExported: true });
      sourceFile.addTypeAlias({ name: 'Type3', type: 'boolean', isExported: true });

      const output = sourceFile.getFullText();
      expect(output).toContain('export type Type1 = string');
      expect(output).toContain('export type Type2 = number');
      expect(output).toContain('export type Type3 = boolean');
    });
  });
});
