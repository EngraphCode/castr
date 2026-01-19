/**
 * Complete Field Coverage Tests - Writer (Output)
 *
 * PROVES that the writer correctly outputs ALL IR fields to valid OpenAPI 3.1.x.
 * Tests all fields from openapi-acceptance-criteria.md.
 *
 * @module
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

import { buildIR } from '../../src/parsers/openapi/index.js';
import { writeOpenApi } from '../../src/writers/openapi/openapi-writer.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = resolve(__dirname, '../__fixtures__');

describe('Writer Field Coverage - OpenAPI 3.1.x', () => {
  let output: OpenAPIObject;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(`${FIXTURES_DIR}/complete-fields-3.1.yaml`);
    const ir = buildIR(result.document);
    output = writeOpenApi(ir);
  });

  // ==========================================================================
  // Root Object Fields
  // ==========================================================================

  describe('Root Object', () => {
    it('writes openapi version as 3.1.0', () => {
      expect(output.openapi).toBe('3.1.0');
    });

    it('writes info object', () => {
      expect(output.info).toBeDefined();
      expect(output.info.title).toBe('Complete Field Coverage Test');
      expect(output.info.description).toBe(
        'Tests ALL OpenAPI 3.1.x fields for parser/writer coverage',
      );
      expect(output.info.version).toBe('1.0.0');
      expect(output.info.termsOfService).toBe('https://example.com/terms');
    });

    it('writes info.contact', () => {
      expect(output.info.contact).toBeDefined();
      expect(output.info.contact?.name).toBe('API Support');
      expect(output.info.contact?.url).toBe('https://example.com/support');
      expect(output.info.contact?.email).toBe('support@example.com');
    });

    it('writes info.license', () => {
      expect(output.info.license).toBeDefined();
      expect(output.info.license?.name).toBe('Apache 2.0');
      expect(output.info.license?.identifier).toBe('Apache-2.0');
    });

    it('writes jsonSchemaDialect', () => {
      // jsonSchemaDialect is a 3.1.x field not in base type
      expect((output as unknown as { jsonSchemaDialect?: string }).jsonSchemaDialect).toBe(
        'https://json-schema.org/draft/2020-12/schema',
      );
    });

    it('writes servers', () => {
      expect(output.servers).toBeDefined();
      expect(output.servers?.[0]?.url).toBe('https://api.example.com/v1');
      expect(output.servers?.[0]?.description).toBe('Production server');
      expect(output.servers?.[0]?.variables?.['port']).toBeDefined();
    });

    it('writes tags', () => {
      expect(output.tags).toBeDefined();
      expect(output.tags?.[0]?.name).toBe('users');
      expect(output.tags?.[0]?.externalDocs?.url).toBe('https://example.com/docs/users');
    });

    it('writes externalDocs', () => {
      expect(output.externalDocs).toBeDefined();
      expect(output.externalDocs?.url).toBe('https://example.com/docs');
    });

    it('writes security (document-level)', () => {
      expect(output.security).toBeDefined();
      expect(output.security?.[0]).toEqual({ bearerAuth: [] });
    });

    it('writes webhooks', () => {
      expect(output.webhooks).toBeDefined();
      expect(output.webhooks?.['newUserWebhook']).toBeDefined();
    });
  });

  // ==========================================================================
  // Components
  // ==========================================================================

  describe('Components', () => {
    it('writes schemas', () => {
      expect(output.components?.schemas?.['User']).toBeDefined();
    });

    it('writes parameters', () => {
      expect(output.components?.parameters?.['UserId']).toBeDefined();
    });

    it('writes responses', () => {
      expect(output.components?.responses?.['NotFound']).toBeDefined();
    });

    it('writes headers', () => {
      expect(output.components?.headers?.['X-Rate-Limit']).toBeDefined();
    });

    it('writes securitySchemes', () => {
      expect(output.components?.securitySchemes?.['bearerAuth']).toBeDefined();
    });

    it('writes links', () => {
      expect(output.components?.links?.['GetUser']).toBeDefined();
    });

    it('writes callbacks', () => {
      expect(output.components?.callbacks?.['UserCallback']).toBeDefined();
    });

    it('writes pathItems', () => {
      expect(output.components?.pathItems?.['SharedPath']).toBeDefined();
    });

    it('writes examples', () => {
      expect(output.components?.examples?.['UserExample']).toBeDefined();
    });
  });

  // ==========================================================================
  // Paths and Operations
  // ==========================================================================

  describe('Paths and Operations', () => {
    it('writes all paths', () => {
      expect(output.paths?.['/users']).toBeDefined();
      expect(output.paths?.['/users/{id}']).toBeDefined();
    });

    it('writes trace method', () => {
      expect(output.paths?.['/users/{id}']?.trace).toBeDefined();
      expect(output.paths?.['/users/{id}']?.trace?.operationId).toBe('traceUser');
    });

    it('writes operation metadata', () => {
      const getOp = output.paths?.['/users']?.get;
      expect(getOp?.operationId).toBe('listUsers');
      expect(getOp?.summary).toBe('List all users');
      expect(getOp?.description).toBe('Get a list of all users');
      expect(getOp?.tags).toContain('users');
      expect(getOp?.deprecated).not.toBe(true);
    });

    it('writes operation externalDocs', () => {
      const getOp = output.paths?.['/users']?.get;
      expect(getOp?.externalDocs).toBeDefined();
      expect(getOp?.externalDocs?.url).toBe('https://example.com/docs/list-users');
    });

    it('writes operation security', () => {
      const getOp = output.paths?.['/users']?.get;
      expect(getOp?.security).toBeDefined();
      expect(getOp?.security?.[0]).toEqual({ bearerAuth: [] });
    });

    it('writes operation servers', () => {
      const getOp = output.paths?.['/users']?.get;
      expect(getOp?.servers).toBeDefined();
      expect(getOp?.servers?.[0]?.url).toBe('https://read.example.com');
    });

    it('writes operation callbacks', () => {
      const postOp = output.paths?.['/users']?.post;
      expect(postOp?.callbacks).toBeDefined();
      expect(postOp?.callbacks?.['onUserCreated']).toBeDefined();
    });

    it('writes operation parameters', () => {
      const getOp = output.paths?.['/users']?.get;
      expect(getOp?.parameters).toBeDefined();
      const limitParam = getOp?.parameters?.find(
        (p) => typeof p === 'object' && 'name' in p && p.name === 'limit',
      );
      expect(limitParam).toBeDefined();
    });

    it('writes operation requestBody', () => {
      const postOp = output.paths?.['/users']?.post;
      expect(postOp?.requestBody).toBeDefined();
    });
  });

  // ==========================================================================
  // PathItem-Level Fields
  // ==========================================================================

  describe('PathItem-Level Fields', () => {
    it('writes pathItem summary', () => {
      expect(output.paths?.['/users']?.summary).toBe('User collection operations');
    });

    it('writes pathItem description', () => {
      expect(output.paths?.['/users']?.description).toBe('Operations for managing users');
    });

    it('writes pathItem servers', () => {
      expect(output.paths?.['/users']?.servers).toBeDefined();
      expect(output.paths?.['/users']?.servers?.[0]?.url).toBe('https://users.example.com');
    });
  });

  // ==========================================================================
  // Response Fields
  // ==========================================================================

  describe('Response Fields', () => {
    it('writes response description', () => {
      const response = output.paths?.['/users']?.get?.responses?.['200'];
      expect(response?.description).toBe('User list');
    });

    it('writes response content', () => {
      const response = output.paths?.['/users']?.get?.responses?.['200'];
      expect(response?.content?.['application/json']).toBeDefined();
    });

    it('writes response headers', () => {
      const response = output.paths?.['/users']?.get?.responses?.['200'];
      expect(response?.headers?.['X-Total-Count']).toBeDefined();
    });

    it('writes response links', () => {
      const response = output.paths?.['/users']?.get?.responses?.['200'];
      expect(response?.links?.['GetUserById']).toBeDefined();
    });
  });

  // ==========================================================================
  // JSON Schema 2020-12 Keywords and OpenAPI Extensions
  // ==========================================================================

  describe('JSON Schema 2020-12 Keywords', () => {
    it('writes prefixItems for tuple schemas', () => {
      const coordinate = output.components?.schemas?.['Coordinate'];
      expect(coordinate).toBeDefined();
      expect((coordinate as { prefixItems?: unknown[] })?.prefixItems).toHaveLength(3);
    });

    it('writes unevaluatedProperties', () => {
      const config = output.components?.schemas?.['StrictConfig'];
      expect(config).toBeDefined();
      expect((config as { unevaluatedProperties?: boolean })?.unevaluatedProperties).toBe(false);
    });

    it('writes unevaluatedItems', () => {
      const arr = output.components?.schemas?.['StrictArray'];
      expect(arr).toBeDefined();
      expect((arr as { unevaluatedItems?: { type: string } })?.unevaluatedItems).toEqual({
        type: 'string',
      });
    });

    it('writes dependentSchemas', () => {
      const payment = output.components?.schemas?.['PaymentMethod'];
      expect(payment).toBeDefined();
      const deps = (payment as { dependentSchemas?: { cardNumber?: object } })?.dependentSchemas;
      expect(deps).toBeDefined();
      expect(deps?.cardNumber).toBeDefined();
    });

    it('writes dependentRequired', () => {
      const user = output.components?.schemas?.['User'];
      expect(user).toBeDefined();
      const deps = (user as { dependentRequired?: Record<string, string[]> })?.dependentRequired;
      expect(deps).toBeDefined();
      expect(deps?.['callbackUrl']).toEqual(['name']);
    });

    it('writes minContains', () => {
      const tagged = output.components?.schemas?.['TaggedArray'];
      expect(tagged).toBeDefined();
      expect((tagged as { minContains?: number })?.minContains).toBe(1);
    });

    it('writes maxContains', () => {
      const tagged = output.components?.schemas?.['TaggedArray'];
      expect(tagged).toBeDefined();
      expect((tagged as { maxContains?: number })?.maxContains).toBe(3);
    });
  });

  describe('OpenAPI Schema Extensions', () => {
    it('writes xml object on schema', () => {
      const pet = output.components?.schemas?.['Pet'];
      expect(pet).toBeDefined();
      expect((pet as { xml?: { name: string } })?.xml?.name).toBe('Pet');
    });

    it('writes externalDocs on schema', () => {
      const pet = output.components?.schemas?.['Pet'];
      expect(pet).toBeDefined();
      expect((pet as { externalDocs?: { url: string } })?.externalDocs?.url).toBe(
        'https://example.com/docs/pet',
      );
    });
  });

  describe('Request Body Encoding', () => {
    it('writes encoding in multipart request body', () => {
      const uploadOp = output.paths?.['/users/{id}/upload']?.post;
      expect(uploadOp).toBeDefined();
      const reqBody = uploadOp?.requestBody;
      expect(reqBody).toBeDefined();
      if (reqBody && 'content' in reqBody) {
        const multipartContent = reqBody.content?.['multipart/form-data'];
        expect(multipartContent?.encoding).toBeDefined();
        const avatarEncoding = multipartContent?.encoding?.['avatar'];
        expect(avatarEncoding).toBeDefined();
        expect(avatarEncoding?.contentType).toBe('image/png, image/jpeg');
      }
    });
  });
});

describe('Writer Output - Version Validation', () => {
  it('always outputs as OpenAPI 3.1.0', async () => {
    const result30 = await loadOpenApiDocument(`${FIXTURES_DIR}/complete-fields-3.0.yaml`);
    const ir30 = buildIR(result30.document);
    const output30 = writeOpenApi(ir30);

    expect(output30.openapi).toBe('3.1.0');
  });

  it('does NOT output 3.1.x-only fields from 3.0.x input', async () => {
    const result30 = await loadOpenApiDocument(`${FIXTURES_DIR}/complete-fields-3.0.yaml`);
    const ir30 = buildIR(result30.document);
    const output30 = writeOpenApi(ir30);

    // These fields should be undefined because they weren't in the 3.0.x input
    expect(output30.jsonSchemaDialect).toBeUndefined();
    expect(output30.webhooks).toBeUndefined();
    expect(output30.components?.pathItems).toBeUndefined();
    expect(output30.info.license?.identifier).toBeUndefined();
  });
});
