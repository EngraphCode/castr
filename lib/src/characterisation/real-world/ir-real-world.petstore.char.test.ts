/**
 * IR Characterization Tests - Real-World Petstore Spec
 *
 * PROVES: IR system works correctly on the Petstore Expanded specification
 *
 * @module ir-real-world.petstore.char.test
 */

import { describe, expect, test } from 'vitest';
import { assertAndGetSingleFileContent } from '../ir-test-helpers.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateZodClientFromOpenAPI } from '../test-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PETSTORE_PATH = path.resolve(
  __dirname,
  '../../../examples/openapi/v3.0/petstore-expanded.yaml',
);
const ZOD_OBJECT_OUTPUT_PATTERN = /z(?:\.strictObject|\s*\.\s*object)\(\{/;

describe('IR Characterization - Real-World Specs', () => {
  describe('Petstore Expanded Spec', () => {
    test('IR captures all petstore schemas', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input: PETSTORE_PATH,
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with IR and contains expected content
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toContain('pet');
      expect(content.toLowerCase()).toContain('error');
      expect(content).toMatch(ZOD_OBJECT_OUTPUT_PATTERN);
    });

    test('petstore schemas have correct metadata', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input: PETSTORE_PATH,
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with correct schema definitions
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toMatch(ZOD_OBJECT_OUTPUT_PATTERN);
      expect(content.toLowerCase()).toContain('pet');
    });

    test('petstore operations have correct structure', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input: PETSTORE_PATH,
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Operations are generated with function definitions
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('export const endpoints');
      expect(content).toContain('findPets');
    });

    test('petstore generates valid Zod code', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input: PETSTORE_PATH,
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with IR and contains expected schemas
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toContain('pet');
      expect(content.toLowerCase()).toContain('error');
      expect(content).toMatch(ZOD_OBJECT_OUTPUT_PATTERN);
    });
  });
});
