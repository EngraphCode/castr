/**
 * Tests for IR-based MCP parameter extraction.
 *
 * These tests verify that `collectParameterGroupsFromIR` produces the same
 * output structure as the OpenAPI-based `collectParameterGroups`, but reads
 * from `CastrOperation` instead of raw OpenAPI.
 *
 * @module template-context.mcp.parameters.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import type { CastrOperation, CastrParameter } from './ir-schema.js';
import { createMockCastrSchemaNode } from './ir-test-helpers.js';
import { collectParameterGroupsFromIR } from './template-context.mcp.parameters.js';

/**
 * Create a mock CastrParameter for testing.
 */
function createMockParameter(overrides: Partial<CastrParameter>): CastrParameter {
  return {
    name: 'testParam',
    in: 'query',
    required: false,
    schema: {
      type: 'string',
      metadata: createMockCastrSchemaNode(),
    },
    ...overrides,
  };
}

/**
 * Create a mock CastrOperation with parametersByLocation.
 */
function createMockOperation(
  parametersByLocation: CastrOperation['parametersByLocation'],
): Pick<CastrOperation, 'parametersByLocation'> {
  return { parametersByLocation };
}

describe('collectParameterGroupsFromIR', () => {
  test('returns empty object when no parameters exist', () => {
    const operation = createMockOperation({
      path: [],
      query: [],
      header: [],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    expect(result).toEqual({});
  });

  test('extracts path parameters with required flag always true', () => {
    const pathParam = createMockParameter({
      name: 'userId',
      in: 'path',
      required: true,
      schema: { type: 'string', metadata: createMockCastrSchemaNode() },
    });

    const operation = createMockOperation({
      path: [pathParam],
      query: [],
      header: [],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    expect(result.path).toBeDefined();
    expect(result.path?.properties).toHaveProperty('userId');
    expect(result.path?.required.has('userId')).toBe(true);
  });

  test('extracts query parameters with correct required status', () => {
    const requiredParam = createMockParameter({
      name: 'limit',
      in: 'query',
      required: true,
      schema: { type: 'integer', metadata: createMockCastrSchemaNode() },
    });
    const optionalParam = createMockParameter({
      name: 'offset',
      in: 'query',
      required: false,
      schema: { type: 'integer', metadata: createMockCastrSchemaNode() },
    });

    const operation = createMockOperation({
      path: [],
      query: [requiredParam, optionalParam],
      header: [],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    expect(result.query).toBeDefined();
    expect(result.query?.properties).toHaveProperty('limit');
    expect(result.query?.properties).toHaveProperty('offset');
    expect(result.query?.required.has('limit')).toBe(true);
    expect(result.query?.required.has('offset')).toBe(false);
  });

  test('extracts header parameters', () => {
    const headerParam = createMockParameter({
      name: 'Authorization',
      in: 'header',
      required: true,
      schema: { type: 'string', metadata: createMockCastrSchemaNode() },
    });

    const operation = createMockOperation({
      path: [],
      query: [],
      header: [headerParam],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    expect(result.header).toBeDefined();
    expect(result.header?.properties).toHaveProperty('Authorization');
    expect(result.header?.required.has('Authorization')).toBe(true);
  });

  test('normalizes dotted path parameter names to camelCase', () => {
    const dottedParam = createMockParameter({
      name: 'profile.id',
      in: 'path',
      required: true,
      schema: { type: 'string', metadata: createMockCastrSchemaNode() },
    });

    const operation = createMockOperation({
      path: [dottedParam],
      query: [],
      header: [],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    // Should be normalized: profile.id -> profileId
    expect(result.path?.properties).toHaveProperty('profileId');
    expect(result.path?.required.has('profileId')).toBe(true);
  });

  test('does not include cookie parameters (unsupported in MCP)', () => {
    const cookieParam = createMockParameter({
      name: 'session',
      in: 'cookie',
      required: true,
      schema: { type: 'string', metadata: createMockCastrSchemaNode() },
    });

    const operation = createMockOperation({
      path: [],
      query: [],
      header: [],
      cookie: [cookieParam],
    });

    const result = collectParameterGroupsFromIR(operation);

    // cookie is not a supported location for MCP
    expect(result).not.toHaveProperty('cookie');
  });

  test('preserves CastrSchema in properties for later JSON Schema conversion', () => {
    const paramWithConstraints = createMockParameter({
      name: 'page',
      in: 'query',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        metadata: createMockCastrSchemaNode(),
      },
    });

    const operation = createMockOperation({
      path: [],
      query: [paramWithConstraints],
      header: [],
      cookie: [],
    });

    const result = collectParameterGroupsFromIR(operation);

    const schema = result.query?.properties['page'];
    expect(schema).toBeDefined();
    expect(schema?.type).toBe('integer');
    expect(schema?.minimum).toBe(1);
    expect(schema?.maximum).toBe(100);
  });
});
