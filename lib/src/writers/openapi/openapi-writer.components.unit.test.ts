/**
 * Unit tests for OpenAPI components writer.
 *
 * Tests conversion from IR components to OpenAPI ComponentsObject.
 * Follows TDD - tests written first, implementation follows.
 *
 * @module
 */

import { describe, it, expect } from 'vitest';

import type {
  CastrSchemaComponent,
  IRSecuritySchemeComponent,
  CastrParameterComponent,
  CastrResponseComponent,
  CastrSchemaNode,
  IRComponent,
} from '../../context/ir-schema.js';

import { writeOpenApiComponents } from './openapi-writer.components.js';

/**
 * Creates a minimal valid CastrSchemaNode for testing.
 */
function createMetadata(overrides: Partial<CastrSchemaNode> = {}): CastrSchemaNode {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
    ...overrides,
  };
}

describe('writeOpenApiComponents', () => {
  describe('schema components', () => {
    it('converts single schema component', () => {
      const components: IRComponent[] = [
        {
          type: 'schema',
          name: 'User',
          schema: { type: 'object', metadata: createMetadata() },
          metadata: createMetadata(),
        } satisfies CastrSchemaComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.schemas).toBeDefined();
      expect(result.schemas?.['User']).toEqual({ type: 'object' });
    });

    it('converts multiple schema components', () => {
      const components: IRComponent[] = [
        {
          type: 'schema',
          name: 'User',
          schema: { type: 'object', metadata: createMetadata() },
          metadata: createMetadata(),
        } satisfies CastrSchemaComponent,
        {
          type: 'schema',
          name: 'Address',
          schema: { type: 'object', metadata: createMetadata() },
          metadata: createMetadata(),
        } satisfies CastrSchemaComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.schemas?.['User']).toBeDefined();
      expect(result.schemas?.['Address']).toBeDefined();
    });

    it('preserves schema component description', () => {
      const components: IRComponent[] = [
        {
          type: 'schema',
          name: 'User',
          schema: {
            type: 'object',
            description: 'A user object',
            metadata: createMetadata(),
          },
          metadata: createMetadata(),
          description: 'A user object',
        } satisfies CastrSchemaComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.schemas?.['User']?.description).toBe('A user object');
    });
  });

  describe('security scheme components', () => {
    it('converts bearer auth security scheme', () => {
      const components: IRComponent[] = [
        {
          type: 'securityScheme',
          name: 'bearerAuth',
          scheme: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        } satisfies IRSecuritySchemeComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.securitySchemes).toBeDefined();
      expect(result.securitySchemes?.['bearerAuth']).toEqual({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });
    });

    it('converts apiKey security scheme', () => {
      const components: IRComponent[] = [
        {
          type: 'securityScheme',
          name: 'apiKey',
          scheme: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        } satisfies IRSecuritySchemeComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.securitySchemes?.['apiKey']).toEqual({
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      });
    });
  });

  describe('parameter components', () => {
    it('converts query parameter component', () => {
      const components: IRComponent[] = [
        {
          type: 'parameter',
          name: 'PageSize',
          parameter: {
            name: 'pageSize',
            in: 'query',
            required: false,
            schema: { type: 'integer', metadata: createMetadata() },
          },
        } satisfies CastrParameterComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.parameters).toBeDefined();
      expect(result.parameters?.['PageSize']).toEqual({
        name: 'pageSize',
        in: 'query',
        required: false,
        schema: { type: 'integer' },
      });
    });

    it('converts header parameter with description', () => {
      const components: IRComponent[] = [
        {
          type: 'parameter',
          name: 'Authorization',
          parameter: {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string', metadata: createMetadata() },
            description: 'Bearer token',
          },
        } satisfies CastrParameterComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.parameters?.['Authorization']).toEqual({
        name: 'Authorization',
        in: 'header',
        required: true,
        schema: { type: 'string' },
        description: 'Bearer token',
      });
    });
  });

  describe('response components', () => {
    it('converts response component', () => {
      const components: IRComponent[] = [
        {
          type: 'response',
          name: 'NotFound',
          response: {
            statusCode: '404',
            description: 'Resource not found',
            schema: { type: 'object', metadata: createMetadata() },
          },
        } satisfies CastrResponseComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.responses).toBeDefined();
      const notFoundResponse = result.responses?.['NotFound'];
      expect(notFoundResponse).toBeDefined();
      expect(notFoundResponse?.description).toBe('Resource not found');
    });
  });

  describe('mixed components', () => {
    it('converts all component types in single call', () => {
      const components: IRComponent[] = [
        {
          type: 'schema',
          name: 'User',
          schema: { type: 'object', metadata: createMetadata() },
          metadata: createMetadata(),
        } satisfies CastrSchemaComponent,
        {
          type: 'securityScheme',
          name: 'bearerAuth',
          scheme: { type: 'http', scheme: 'bearer' },
        } satisfies IRSecuritySchemeComponent,
        {
          type: 'parameter',
          name: 'PageSize',
          parameter: {
            name: 'pageSize',
            in: 'query',
            required: false,
            schema: { type: 'integer', metadata: createMetadata() },
          },
        } satisfies CastrParameterComponent,
      ];

      const result = writeOpenApiComponents(components);

      expect(result.schemas?.['User']).toBeDefined();
      expect(result.securitySchemes?.['bearerAuth']).toBeDefined();
      expect(result.parameters?.['PageSize']).toBeDefined();
    });
  });

  describe('empty components', () => {
    it('returns empty object for empty input', () => {
      const result = writeOpenApiComponents([]);

      expect(result).toEqual({});
    });
  });
});
