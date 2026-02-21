/**
 * Zod Endpoint Parsing Unit Tests
 *
 * Tests for parsing endpoint definitions from `defineEndpoint({...})` calls.
 *
 * @module parsers/zod/endpoint.unit.test
 */

import { describe, it, expect } from 'vitest';
import { parseEndpointDefinition, buildCastrOperationFromEndpoint } from './zod-parser.endpoint.js';
import type { EndpointDefinition } from './zod-parser.endpoint.types.js';
import type { CastrResponse } from '../../../ir/index.js';

describe('Endpoint Zod Parsing', () => {
  describe('parseEndpointDefinition', () => {
    it('should parse defineEndpoint with method and path', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/users',
        response: { 200: 'z.array(UserSchema)' },
      })`);

      expect(result).toBeDefined();
      expect(result?.method).toBe('get');
      expect(result?.path).toBe('/users');
    });

    it('should parse defineEndpoint with summary and description', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/users/{id}',
        summary: 'Get user by ID',
        description: 'Returns a single user',
        response: { 200: 'UserSchema' },
      })`);

      expect(result?.summary).toBe('Get user by ID');
      expect(result?.description).toBe('Returns a single user');
    });

    it('should parse defineEndpoint with tags and deprecated', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/legacy/users',
        tags: ['users', 'legacy'],
        deprecated: true,
        response: { 200: 'UserSchema' },
      })`);

      expect(result?.tags).toEqual(['users', 'legacy']);
      expect(result?.deprecated).toBe(true);
    });

    it('should parse defineEndpoint with path parameters', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/users/{userId}',
        parameters: {
          path: { userId: 'z.string().uuid()' },
        },
        response: { 200: 'UserSchema' },
      })`);

      expect(result?.parameters?.path).toBeDefined();
      expect(result?.parameters?.path?.['userId']).toBe('z.string().uuid()');
    });

    it('should parse defineEndpoint with query parameters', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/users',
        parameters: {
          query: {
            page: 'z.number().int().positive()',
            limit: 'z.number().int().max(100).optional()',
          },
        },
        response: { 200: 'z.array(UserSchema)' },
      })`);

      expect(result?.parameters?.query?.['page']).toBe('z.number().int().positive()');
      expect(result?.parameters?.query?.['limit']).toBe('z.number().int().max(100).optional()');
    });

    it('should parse defineEndpoint with body for POST', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'post',
        path: '/users',
        body: 'z.object({ name: z.string(), email: z.string().email() })',
        response: { 201: 'UserSchema' },
      })`);

      expect(result?.method).toBe('post');
      expect(result?.body).toBe('z.object({ name: z.string(), email: z.string().email() })');
    });

    it('should parse defineEndpoint with multiple responses', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
        path: '/users/{id}',
        response: {
          200: 'UserSchema',
          404: 'z.object({ error: z.literal("not_found") })',
          500: 'ErrorSchema',
        },
      })`);

      expect(result?.responses['200']).toBe('UserSchema');
      expect(result?.responses['404']).toBe('z.object({ error: z.literal("not_found") })');
      expect(result?.responses['500']).toBe('ErrorSchema');
    });

    it('should return undefined for non-endpoint expressions', () => {
      const result = parseEndpointDefinition('z.string()');

      expect(result).toBeUndefined();
    });

    it('should return undefined for missing required fields', () => {
      const result = parseEndpointDefinition(`defineEndpoint({
        method: 'get',
      })`);

      expect(result).toBeUndefined();
    });
  });

  describe('buildCastrOperationFromEndpoint', () => {
    it('should build CastrOperation from endpoint definition', () => {
      const definition: EndpointDefinition = {
        method: 'get',
        path: '/users/{userId}',
        summary: 'Get user by ID',
        parameters: {
          path: { userId: 'z.string().uuid()' },
        },
        responses: {
          '200': 'UserSchema',
        },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.method).toBe('get');
      expect(result.path).toBe('/users/{userId}');
      expect(result.summary).toBe('Get user by ID');
      expect(result.parameters).toHaveLength(1);
      expect(result.parameters[0]?.name).toBe('userId');
      expect(result.parameters[0]?.in).toBe('path');
      expect(result.parameters[0]?.required).toBe(true);
    });

    it('should populate parametersByLocation correctly', () => {
      const definition: EndpointDefinition = {
        method: 'get',
        path: '/users/{userId}',
        parameters: {
          path: { userId: 'z.string()' },
          query: { include: 'z.string().optional()' },
        },
        responses: { '200': 'UserSchema' },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.parametersByLocation.path).toHaveLength(1);
      expect(result.parametersByLocation.query).toHaveLength(1);
      expect(result.parametersByLocation.header).toHaveLength(0);
      expect(result.parametersByLocation.cookie).toHaveLength(0);
    });

    it('should derive query optionality from parsed schema semantics, not string matching', () => {
      const definition: EndpointDefinition = {
        method: 'get',
        path: '/users',
        parameters: {
          query: { include: 'z.string().optional ()' },
        },
        responses: { '200': 'UserSchema' },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.parameters).toHaveLength(1);
      expect(result.parameters[0]?.in).toBe('query');
      expect(result.parameters[0]?.required).toBe(false);
    });

    it('should build requestBody for POST endpoints', () => {
      const definition: EndpointDefinition = {
        method: 'post',
        path: '/users',
        body: 'z.object({ name: z.string() })',
        responses: { '201': 'UserSchema' },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.requestBody).toBeDefined();
      expect(result.requestBody?.required).toBe(true);
      expect(result.requestBody?.content['application/json']).toBeDefined();
    });

    it('should build responses with status codes', () => {
      const definition: EndpointDefinition = {
        method: 'get',
        path: '/users',
        responses: {
          '200': 'z.array(UserSchema)',
          '500': 'ErrorSchema',
        },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.responses).toHaveLength(2);
      expect(result.responses.find((r: CastrResponse) => r.statusCode === '200')).toBeDefined();
      expect(result.responses.find((r: CastrResponse) => r.statusCode === '500')).toBeDefined();
    });

    it('should include tags and deprecated status', () => {
      const definition: EndpointDefinition = {
        method: 'get',
        path: '/legacy',
        tags: ['legacy', 'deprecated'],
        deprecated: true,
        responses: { '200': 'OldSchema' },
      };

      const result = buildCastrOperationFromEndpoint(definition);

      expect(result.tags).toEqual(['legacy', 'deprecated']);
      expect(result.deprecated).toBe(true);
    });
  });
});
