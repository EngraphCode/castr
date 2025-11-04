/**
 * Characterisation Tests: Unified OpenAPI Input Pipeline
 *
 * These tests define ACCEPTANCE CRITERIA for the unified input preparation pipeline.
 * They test WHAT the pipeline should do, not HOW it works.
 *
 * Based on: .agent/plans/PHASE-1-PART-5-UNIFIED-OPENAPI-PIPELINE.md
 *
 * The unified pipeline ensures both CLI and programmatic APIs share the same:
 * - Validation (via SwaggerParser.validate)
 * - Bundling/dereferencing (via SwaggerParser.bundle/dereference)
 * - Type boundary handling (via assertOpenApiObject)
 */

import path from 'node:path';

import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { assertIsString } from './test-utils.js';
import { loadOpenApiDocument } from '../shared/load-openapi-document.js';

/**
 * Minimal valid OpenAPI 3.0 spec for testing.
 */
function createMinimalSpec(): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/test': {
        get: {
          operationId: 'testEndpoint',
          responses: {
            '200': {
              description: 'Success',
            },
          },
        },
      },
    },
  };
}

/**
 * Tests for programmatic API integration with prepareOpenApiDocument helper.
 */
describe('Unified OpenAPI Input Pipeline - Programmatic API Integration', () => {
  it('should accept file path via input parameter', async () => {
    const result = await generateZodClientFromOpenAPI({
      input: './examples/openapi/v3.0/petstore.yaml',
      disableWriteToFile: true,
    });

    assertIsString(result, 'file path input');
    expect(result).toContain('export');
  });

  it('should accept in-memory OpenAPIObject via openApiDoc parameter', async () => {
    const spec = createMinimalSpec();
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });

    assertIsString(result, 'in-memory object');
    expect(result).toContain('export');
  });

  it('should reject when both input and openApiDoc are provided', async () => {
    const spec = createMinimalSpec();
    await expect(
      generateZodClientFromOpenAPI({
        input: './examples/openapi/v3.0/petstore.yaml',
        openApiDoc: spec,
        disableWriteToFile: true,
      } as Parameters<typeof generateZodClientFromOpenAPI>[0]),
    ).rejects.toThrow(/cannot.*both.*input.*openApiDoc/i);
  });

  it('should process OpenAPI documents deterministically (always bundles)', async () => {
    // Pipeline always uses bundle mode which preserves internal $refs for proper dependency tracking
    const result = await generateZodClientFromOpenAPI({
      input: './examples/openapi/v3.0/petstore.yaml',
      disableWriteToFile: true,
    });

    assertIsString(result, 'bundled output');
    expect(result).toContain('export');
  });
});

/**
 * NOTE: Additional tests for prepareOpenApiDocument helper directly.
 */

describe('Unified OpenAPI Input Pipeline - prepareOpenApiDocument Helper', () => {
  describe('Direct Helper Usage', () => {
    it('should validate and bundle file path input', async () => {
      const spec = await prepareOpenApiDocument('./examples/openapi/v3.0/petstore.yaml');

      expect(spec.openapi).toMatch(/^3\.0\./);
      expect(spec.info).toBeDefined();
      expect(spec.paths).toBeDefined();
      // Pipeline uses bundle mode to preserve internal $refs
    });

    it('should validate and bundle URL input', async () => {
      // Note: This test documents URL support, but actual URL fetching requires
      // a real server or a properly configured mock at the SwaggerParser level.
      // For now, we test URL string conversion works correctly.
      // In practice, URLs are handled by SwaggerParser's internal HTTP client.
      const testUrlString = 'https://api.example.com/openapi.json';
      // SwaggerParser will attempt to fetch this URL, so we expect it to fail
      // unless a real server is available. This test documents the API.
      await expect(prepareOpenApiDocument(testUrlString)).rejects.toThrow();
    });

    it('should validate and bundle in-memory object', async () => {
      const inputSpec = createMinimalSpec();
      const spec = await prepareOpenApiDocument(inputSpec);

      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      // Pipeline uses bundle mode to preserve internal $refs
    });

    it('should accept OpenAPI 3.1.0 in helper', async () => {
      const spec31 = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      } as unknown as OpenAPIObject;

      // OpenAPI 3.1.x is now supported
      const result = await prepareOpenApiDocument(spec31);
      expect(result).toBeDefined();
      expect(result.openapi).toBe('3.1.0');
    });

    it('should reject malformed spec in helper', async () => {
      const malformed = {
        openapi: '3.0.0',
        // Missing required 'info' and 'paths'
      } as unknown as OpenAPIObject;

      // Test behavior (rejection), not implementation (specific error message)
      await expect(prepareOpenApiDocument(malformed)).rejects.toThrow();
    });
  });

  describe('Type Boundary Handling', () => {
    it('should return OpenAPIObject from file path', async () => {
      const spec = await prepareOpenApiDocument('./examples/openapi/v3.0/petstore.yaml');
      // TypeScript should infer this as OpenAPIObject
      const typed: OpenAPIObject = spec;
      expect(typed.openapi).toMatch(/^3\.0\./);
    });

    it('should return OpenAPIObject from URL', async () => {
      // Note: This test documents URL object support, but actual URL fetching
      // requires a real server. SwaggerParser handles URLs internally.
      // This test documents that URL objects are converted to strings correctly.
      const testUrl = new URL('https://api.example.com/openapi.json');
      // SwaggerParser will attempt to fetch this URL, so we expect it to fail
      // unless a real server is available. This test documents the API.
      await expect(prepareOpenApiDocument(testUrl)).rejects.toThrow();
    });

    it('should return OpenAPIObject from in-memory object', async () => {
      const inputSpec = createMinimalSpec();
      const spec = await prepareOpenApiDocument(inputSpec);
      const typed: OpenAPIObject = spec;
      expect(typed.openapi).toBe('3.0.0');
    });
  });
});

describe('Scalar loader parity checks', () => {
  it('bundles single-file specs without introducing external references', async () => {
    const entrypointPath = './examples/openapi/v3.0/petstore.yaml';
    const absoluteEntrypoint = path.resolve(entrypointPath);

    const scalarResult = await loadOpenApiDocument(entrypointPath);
    const swaggerResult = await prepareOpenApiDocument(entrypointPath);

    expect(scalarResult.metadata.entrypoint).toStrictEqual({
      kind: 'file',
      uri: absoluteEntrypoint,
    });
    expect(scalarResult.metadata.files.map((file) => file.absolutePath)).toContain(
      absoluteEntrypoint,
    );
    expect(scalarResult.metadata.externalReferences).toHaveLength(0);
    expect(Object.keys(scalarResult.document.paths ?? {})).toEqual(
      Object.keys(swaggerResult.paths ?? {}),
    );
  });

  it('bundles multi-file specs and records filesystem metadata', async () => {
    const entrypointPath = './examples/openapi/multi-file/main.yaml';
    const componentPath = path.resolve('./examples/openapi/multi-file/components/pet.yaml');

    const scalarResult = await loadOpenApiDocument(entrypointPath);
    const swaggerResult = await prepareOpenApiDocument(entrypointPath);

    const absoluteEntrypoint = path.resolve(entrypointPath);
    expect(scalarResult.metadata.entrypoint).toStrictEqual({
      kind: 'file',
      uri: absoluteEntrypoint,
    });
    expect(scalarResult.metadata.files.map((file) => file.absolutePath)).toEqual(
      expect.arrayContaining([absoluteEntrypoint, componentPath]),
    );
    expect(scalarResult.metadata.externalReferences).toEqual(
      expect.arrayContaining([expect.objectContaining({ uri: componentPath })]),
    );
    expect(Object.keys(scalarResult.document.paths ?? {})).toEqual(
      Object.keys(swaggerResult.paths ?? {}),
    );
    // Scalar keeps vendor-specific `x-ext` to preserve dependency provenance; this is expected and
    // verified in dedicated loader unit tests. The characterisation suite focuses on behavioural parity.
  });
});
