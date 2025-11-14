import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateZodClientFromOpenAPI } from '../src/rendering/generate-from-context.js';
import { isSingleFileResult } from '../src/rendering/generation-result.js';
import { join } from 'path';
import { validateRuntime } from './validation-harness.js';
import { createTempDir, cleanupTempDir, writeTempFile, removeTempFile } from './temp-file-utils.js';

/**
 * Runtime Validation Test Suite for Generated Code
 *
 * This suite validates that generated TypeScript/Zod code from OpenAPI specs
 * meets runtime execution requirements: non-empty, contains required imports,
 * and is suitable for execution.
 *
 * Representative fixtures exercise all code generation paths:
 * - tictactoe: Simple schema with basic types (primitives, objects, arrays)
 * - petstore: Complex objects with nested structures, allOf compositions
 * - non-oauth: References ($ref) and security metadata extraction
 * - multi-file: External $ref resolution across multiple files with x-ext vendor extension
 * - api-examples: Constraints (enum, patterns, min/max, formats, examples)
 */
describe('Generated Code - Runtime Validation', () => {
  const fixtures = [
    {
      name: 'tictactoe',
      path: 'examples/openapi/v3.1/tictactoe.yaml',
      reason: 'Simple schema with basic types (primitives, objects, arrays)',
    },
    {
      name: 'petstore',
      path: 'examples/openapi/v3.0/petstore-expanded.yaml',
      reason: 'Complex objects with nested structures, allOf compositions',
    },
    {
      name: 'non-oauth',
      path: 'examples/openapi/v3.1/non-oauth-scopes.yaml',
      reason: 'References ($ref) and security metadata extraction',
    },
    {
      name: 'multi-file',
      path: 'examples/openapi/multi-file/main.yaml',
      reason: 'External $ref resolution across multiple files (Scalar x-ext vendor extension)',
    },
    {
      name: 'api-examples',
      path: 'examples/openapi/v3.0/api-with-examples.yaml',
      reason: 'Constraints (enum, patterns, min/max, formats, examples)',
    },
  ];

  let tempDir: string;

  beforeAll(async () => {
    tempDir = await createTempDir();
  });

  afterAll(async () => {
    await cleanupTempDir(tempDir);
  });

  fixtures.forEach(({ name, path, reason }) => {
    describe(`${name} (${reason})`, () => {
      let tempFilePath: string | null = null;
      let generationError: Error | null = null;

      beforeAll(async () => {
        try {
          const fullPath = join(process.cwd(), path);
          const result = await generateZodClientFromOpenAPI({
            input: fullPath,
            disableWriteToFile: true,
            options: {
              withAlias: true,
            },
          });
          if (!isSingleFileResult(result)) {
            throw new Error('Expected single file result');
          }
          const generatedCode = result.content;

          tempFilePath = await writeTempFile(tempDir, name, generatedCode);
        } catch (error) {
          generationError = error instanceof Error ? error : new Error(String(error));
        }
      });

      afterAll(async () => {
        if (tempFilePath) {
          await removeTempFile(tempFilePath);
        }
      });

      it('generates executable Zod schemas', async () => {
        if (generationError || !tempFilePath) {
          throw new Error(
            `Code generation failed for ${name}: ${generationError?.message ?? 'Unknown error'}`,
          );
        }

        const result = await validateRuntime(tempFilePath);

        if (!result.valid) {
          console.error(`\nRuntime error in ${name}:`, result.error);
        }

        expect(result.valid).toBe(true);
      });
    });
  });
});
