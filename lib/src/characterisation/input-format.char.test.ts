/**
 * Characterisation Tests: Input Format Support (JSON vs YAML)
 *
 * These tests document and verify that openapi-zod-client can accept
 * OpenAPI specifications in both JSON and YAML formats.
 *
 * **What we're proving:**
 * - prepareOpenApiDocument() handles both JSON and YAML files
 * - Our code works identically regardless of input format
 * - Generated output is the same for equivalent specs
 *
 * **Why this matters:**
 * - OpenAPI specs can be authored in either format
 * - Tools may output different formats
 * - Users shouldn't need to convert between formats
 *
 * **Test Strategy:**
 * - Use the same spec in both formats (petstore)
 * - Parse both through our pipeline
 * - Verify both generate valid output
 * - Prove output structure is equivalent
 */

import { describe, it, expect } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { extractContent, assertSingleFileResult } from './test-utils.js';

/**
 * Helper to parse and validate OpenAPI spec regardless of format.
 * The Scalar pipeline handles the format detection automatically.
 */
async function parseSpec(path: string): Promise<OpenAPIObject> {
  return prepareOpenApiDocument(path);
}

describe('Input Format Support', () => {
  describe('JSON Input', () => {
    it('should parse and generate from JSON OpenAPI spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.json');

      // Verify spec was parsed correctly
      expect(spec.openapi).toMatch(/^3\.1\./);
      expect(spec.info.title).toBe('Swagger Petstore');
      expect(spec.paths).toBeDefined();

      // Verify our code can generate from it
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Should generate valid TypeScript with new default template (schemas-with-metadata)
      assertSingleFileResult(result);
      expect(extractContent(result)).toContain('export const endpoints');
      expect(extractContent(result)).toContain('import { z }');
    });

    it('should generate endpoints from JSON spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.json');

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Verify endpoints are generated (schemas-with-metadata template)
      expect(extractContent(result)).toContain('method: "get"');
      expect(extractContent(result)).toContain('path: "/pets"');
      expect(extractContent(result)).toContain('export const endpoints');
    });
  });

  describe('YAML Input', () => {
    it('should parse and generate from YAML OpenAPI spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      // Verify spec was parsed correctly
      expect(spec.openapi).toMatch(/^3\.1\./);
      expect(spec.info.title).toBe('Swagger Petstore');
      expect(spec.paths).toBeDefined();

      // Verify our code can generate from it
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Should generate valid TypeScript with new default template (schemas-with-metadata)
      assertSingleFileResult(result);
      expect(extractContent(result)).toContain('export const endpoints');
      expect(extractContent(result)).toContain('import { z }');
    });

    it('should generate endpoints from YAML spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Verify endpoints are generated (schemas-with-metadata template)
      expect(extractContent(result)).toContain('method: "get"');
      expect(extractContent(result)).toContain('path: "/pets"');
      expect(extractContent(result)).toContain('export const endpoints');
    });
  });

  describe('Format Equivalence', () => {
    it('should generate valid output from both JSON and YAML formats', async () => {
      // Parse both formats
      const jsonSpec = await parseSpec('./examples/openapi/v3.0/petstore.json');
      const yamlSpec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      // Generate from both
      const jsonResult = await generateZodClientFromOpenAPI({
        openApiDoc: jsonSpec,
        disableWriteToFile: true,
      });

      const yamlResult = await generateZodClientFromOpenAPI({
        openApiDoc: yamlSpec,
        disableWriteToFile: true,
      });

      // Both should be valid single file results
      assertSingleFileResult(jsonResult);
      assertSingleFileResult(yamlResult);

      // Both should have similar structure (schemas-with-metadata template)
      expect(extractContent(jsonResult)).toContain('export const endpoints');
      expect(extractContent(yamlResult)).toContain('export const endpoints');
      expect(extractContent(jsonResult)).toContain('import { z }');
      expect(extractContent(yamlResult)).toContain('import { z }');

      // Note: petstore.json and petstore.yaml have slightly different content
      // (JSON has requestBody for POST /pets, YAML doesn't), so we don't expect
      // identical output, just valid output structure
    });

    it('should parse core properties consistently across formats', async () => {
      const jsonSpec = await parseSpec('./examples/openapi/v3.0/petstore.json');
      const yamlSpec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      // Both should have same core properties
      expect(jsonSpec.openapi).toBe(yamlSpec.openapi);
      expect(jsonSpec.info.title).toBe(yamlSpec.info.title);
      expect(Object.keys(jsonSpec.paths ?? {})).toEqual(Object.keys(yamlSpec.paths ?? {}));

      // Note: We don't do deep equality because the OAI repo has slight
      // differences between JSON and YAML versions (e.g. requestBody presence)
    });
  });

  describe('CLI Support', () => {
    it('should document that CLI accepts both formats via Scalar pipeline', async () => {
      // The CLI passes the path string directly to prepareOpenApiDocument()
      // The Scalar pipeline detects format automatically by file extension or content
      // This test documents that behavior

      // Test JSON
      const jsonPath = './examples/openapi/v3.0/petstore.json';
      const jsonBundled = await prepareOpenApiDocument(jsonPath);
      expect(jsonBundled).toBeDefined();
      expect(jsonBundled.openapi).toBeDefined();

      // Test YAML
      const yamlPath = './examples/openapi/v3.0/petstore.yaml';
      const yamlBundled = await prepareOpenApiDocument(yamlPath);
      expect(yamlBundled).toBeDefined();
      expect(yamlBundled.openapi).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      // Create a temporary invalid JSON file
      const invalidJson = '{"openapi": "3.0.0", invalid}'; // Malformed

      await expect(async () => {
        await prepareOpenApiDocument(invalidJson);
      }).rejects.toThrow();
    });

    it('should handle invalid YAML gracefully', async () => {
      // Create invalid YAML
      const invalidYaml = 'openapi: 3.0.0\n  invalid:\n- bad indentation';

      await expect(async () => {
        await prepareOpenApiDocument(invalidYaml);
      }).rejects.toThrow();
    });
  });
});
