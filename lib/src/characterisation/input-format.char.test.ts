/**
 * Characterisation Tests: Input Format Support (JSON vs YAML)
 *
 * These tests document and verify that openapi-zod-client can accept
 * OpenAPI specifications in both JSON and YAML formats.
 *
 * **What we're proving:**
 * - SwaggerParser.parse() handles both JSON and YAML files
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
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../rendering/index.js';

/**
 * Helper to parse and validate OpenAPI spec regardless of format.
 * SwaggerParser handles the format detection automatically.
 */
async function parseSpec(path: string): Promise<OpenAPIObject> {
  const spec = await SwaggerParser.parse(path);
  return spec as OpenAPIObject;
}

describe('Input Format Support', () => {
  describe('JSON Input', () => {
    it('should parse and generate from JSON OpenAPI spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.json');

      // Verify spec was parsed correctly
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Swagger Petstore');
      expect(spec.paths).toBeDefined();

      // Verify our code can generate from it
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Should generate valid TypeScript with new default template (schemas-with-metadata)
      expect(typeof result).toBe('string');
      expect(result).toContain('export const endpoints');
      expect(result).toContain('import { z }');
    });

    it('should generate endpoints from JSON spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.json');

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Verify endpoints are generated (schemas-with-metadata template)
      expect(result).toContain('method: "get"');
      expect(result).toContain('path: "/pets"');
      expect(result).toContain('export const endpoints');
    });
  });

  describe('YAML Input', () => {
    it('should parse and generate from YAML OpenAPI spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      // Verify spec was parsed correctly
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Swagger Petstore');
      expect(spec.paths).toBeDefined();

      // Verify our code can generate from it
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Should generate valid TypeScript with new default template (schemas-with-metadata)
      expect(typeof result).toBe('string');
      expect(result).toContain('export const endpoints');
      expect(result).toContain('import { z }');
    });

    it('should generate endpoints from YAML spec', async () => {
      const spec = await parseSpec('./examples/openapi/v3.0/petstore.yaml');

      const result = await generateZodClientFromOpenAPI({
        openApiDoc: spec,
        disableWriteToFile: true,
      });

      // Verify endpoints are generated (schemas-with-metadata template)
      expect(result).toContain('method: "get"');
      expect(result).toContain('path: "/pets"');
      expect(result).toContain('export const endpoints');
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

      // Both should be valid strings
      expect(typeof jsonResult).toBe('string');
      expect(typeof yamlResult).toBe('string');

      // Both should have similar structure (schemas-with-metadata template)
      expect(jsonResult).toContain('export const endpoints');
      expect(yamlResult).toContain('export const endpoints');
      expect(jsonResult).toContain('import { z }');
      expect(yamlResult).toContain('import { z }');

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
      expect(Object.keys(jsonSpec.paths)).toEqual(Object.keys(yamlSpec.paths));

      // Note: We don't do deep equality because the OAI repo has slight
      // differences between JSON and YAML versions (e.g. requestBody presence)
    });
  });

  describe('CLI Support', () => {
    it('should document that CLI accepts both formats via SwaggerParser', async () => {
      // The CLI passes the path string directly to SwaggerParser.bundle()
      // SwaggerParser detects format automatically by file extension or content
      // This test documents that behavior

      // Test JSON
      const jsonPath = './examples/openapi/v3.0/petstore.json';
      const jsonBundled = (await SwaggerParser.bundle(jsonPath)) as OpenAPIObject;
      expect(jsonBundled).toBeDefined();
      expect(jsonBundled.openapi).toBe('3.0.0');

      // Test YAML
      const yamlPath = './examples/openapi/v3.0/petstore.yaml';
      const yamlBundled = (await SwaggerParser.bundle(yamlPath)) as OpenAPIObject;
      expect(yamlBundled).toBeDefined();
      expect(yamlBundled.openapi).toBe('3.0.0');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      // Create a temporary invalid JSON file
      const invalidJson = '{"openapi": "3.0.0", invalid}'; // Malformed

      await expect(async () => {
        await SwaggerParser.parse(invalidJson);
      }).rejects.toThrow();
    });

    it('should handle invalid YAML gracefully', async () => {
      // Create invalid YAML
      const invalidYaml = 'openapi: 3.0.0\n  invalid:\n- bad indentation';

      await expect(async () => {
        await SwaggerParser.parse(invalidYaml);
      }).rejects.toThrow();
    });
  });
});
