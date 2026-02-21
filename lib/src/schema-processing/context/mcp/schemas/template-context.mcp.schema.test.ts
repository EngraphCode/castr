import { describe, expect, test } from 'vitest';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { buildInputSchemaObject, buildOutputSchemaObject } from './template-context.mcp.schemas.js';
import { getTemplateContext } from '../../template-context.js';
import {
  createParameterSectionSchema,
  type ParameterAccumulator,
} from '../template-context.mcp.parameters.js';

const baseSchema: SchemaObject = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
};

describe('template-context MCP schema helpers', () => {
  describe('createParameterSectionSchema', () => {
    test('omits required property when there are no required parameters', () => {
      const accumulator: ParameterAccumulator = {
        properties: {
          include: { type: 'string' },
        },
        required: new Set(),
      };

      const schema = createParameterSectionSchema(accumulator);

      expect(schema).toEqual({
        type: 'object',
        properties: {
          include: { type: 'string' },
        },
      });
      expect(Object.hasOwn(schema, 'required')).toBe(false);
    });
  });

  describe('buildInputSchemaObject', () => {
    test('returns the input when already object typed', () => {
      expect(buildInputSchemaObject(baseSchema)).toEqual(baseSchema);
    });

    test('wraps primitives to enforce object type', () => {
      const primitive: SchemaObject = { type: 'string' };
      expect(buildInputSchemaObject(primitive)).toEqual({
        type: 'object',
        properties: {
          value: primitive,
        },
      });
    });

    test('wraps undefined schema as empty object schema', () => {
      expect(buildInputSchemaObject(undefined)).toEqual({
        type: 'object',
      });
    });
  });

  describe('buildOutputSchemaObject', () => {
    test('returns object schemas unchanged', () => {
      expect(buildOutputSchemaObject(baseSchema)).toEqual(baseSchema);
    });

    test('wraps primitive outputs and includes value property', () => {
      const primitive: SchemaObject = { type: 'integer' };
      expect(buildOutputSchemaObject(primitive)).toEqual({
        type: 'object',
        properties: {
          value: primitive,
        },
      });
    });

    test('wraps undefined output with passthrough object', () => {
      expect(buildOutputSchemaObject(undefined)).toEqual({
        type: 'object',
      });
    });
  });
});

describe('buildMcpToolsFromIR (via getTemplateContext)', () => {
  test('retains templated and original paths while resolving dotted parameters', () => {
    const doc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Profiles', version: '1.0.0' },
      paths: {
        '/users/{userId}/profiles/{profile.id}': {
          get: {
            operationId: 'showProfile',
            summary: 'Get profile',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'profile.id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Profile',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const context = getTemplateContext(doc);
    const profileTool = context.mcpTools.find((tool) => tool.operationId === 'showProfile');

    expect(profileTool).toBeDefined();
    // Note: Current implementation preserves dotted parameter names in path
    // Both path and originalPath retain OpenAPI {param} format
    expect(profileTool?.httpOperation.path).toBe('/users/{userId}/profiles/{profile.id}');
    expect(profileTool?.httpOperation.originalPath).toBe('/users/{userId}/profiles/{profile.id}');
    expect(profileTool?.httpOperation.method).toBe('get');
    expect(profileTool?.tool.name).toBe('show_profile');
    expect(JSON.stringify(profileTool?.tool)).not.toContain('"$ref"');
  });
});
