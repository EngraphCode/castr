import { describe, it, expect } from 'vitest';
import { writeTypeScript, writeIndexFile, writeCommonFile } from './typescript.js';
import type { TemplateContext } from '../context/index.js';

describe('writers/typescript', () => {
  describe('writeTypeScript', () => {
    it('should generate basic imports and schemas', () => {
      const context: TemplateContext = {
        schemas: {
          User: 'export const User = z.object({ name: z.string() });',
        },
        endpoints: [],
        endpointsGroups: {},
        types: {},
        circularTypeByName: {},
        emittedType: {},
        mcpTools: [],
      };

      const output = writeTypeScript(context);
      expect(output).toContain('import { z } from "zod";');
      expect(output).toContain('// Zod Schemas');
      expect(output).toContain('export const User = z.object({ name: z.string() });');
    });

    it('should generate endpoints', () => {
      const context: TemplateContext = {
        schemas: {},
        endpoints: [
          {
            method: 'get',
            path: '/users',
            requestFormat: 'json',
            parameters: [],
            errors: [],
            response: 'z.array(User)',
          },
        ],
        endpointsGroups: {},
        types: {},
        circularTypeByName: {},
        emittedType: {},
        mcpTools: [],
      };

      const output = writeTypeScript(context);
      expect(output).toContain('export const endpoints = [');
      expect(output).toContain('method: "get"');
      expect(output).toContain('path: "/users"');
      expect(output).toContain('response: z.array(User)');
    });

    it('should generate validation helpers when enabled', () => {
      const context: TemplateContext = {
        schemas: {},
        endpoints: [],
        endpointsGroups: {},
        types: {},
        circularTypeByName: {},
        emittedType: {},
        mcpTools: [],
        options: {
          withValidationHelpers: true,
        },
      };

      const output = writeTypeScript(context);
      expect(output).toContain('export function validateRequest');
      expect(output).toContain('export function validateResponse');
    });
  });

  describe('writeIndexFile', () => {
    it('should generate exports for groups', () => {
      const groups = {
        users: 'users-group',
        posts: 'posts-group',
      };

      const output = writeIndexFile(groups);
      expect(output).toContain('export * as users from "./users-group";');
      expect(output).toContain('export * as posts from "./posts-group";');
    });
  });

  describe('writeCommonFile', () => {
    it('should generate common schemas and types', () => {
      const schemas = {
        Error: 'export const Error = z.object({ message: z.string() });',
      };
      const types = {
        ErrorType: 'export type ErrorType = z.infer<typeof Error>;',
      };

      const output = writeCommonFile(schemas, types);
      expect(output).toContain('import { z } from "zod";');
      expect(output).toContain('export const Error = z.object({ message: z.string() });');
      expect(output).toContain('export type ErrorType = z.infer<typeof Error>;');
    });
  });
});
