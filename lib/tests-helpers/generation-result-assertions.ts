/**
 * Test Helper: Generation Result Assertions
 *
 * Provides reusable assertion helpers for working with GenerationResult
 * discriminated unions in test code. These helpers combine type guards
 * with assertions to fail fast with clear error messages.
 *
 * @module tests-helpers/generation-result-assertions
 * @internal Test utilities only
 */

import {
  type GenerationResult,
  isSingleFileResult,
  isGroupedFileResult,
} from '../src/rendering/generation-result.js';

/**
 * Asserts that a generation result is a single file result.
 *
 * Combines type guard with assertion - throws descriptive error
 * if result is not a single file result, otherwise narrows the
 * type for caller.
 *
 * @param result - Generation result to check
 * @throws {Error} If result is not a single file result
 *
 * @example Before (BROKEN - calls string method on union type)
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({...});
 * expect(result).toMatch(/import/); // ❌ TypeError: result.toMatch is not a function
 * ```
 *
 * @example After (FIXED - proper type narrowing)
 * ```typescript
 * import { assertSingleFileResult } from '../tests-helpers/generation-result-assertions.js';
 *
 * const result = await generateZodClientFromOpenAPI({...});
 * assertSingleFileResult(result); // Throws if not single file, narrows type
 * expect(result.content).toMatch(/import/); // ✅ Type-safe access to content
 * ```
 *
 * @public
 */
export function assertSingleFileResult(
  result: GenerationResult,
): asserts result is Extract<GenerationResult, { type: 'single' }> {
  if (!isSingleFileResult(result)) {
    throw new Error(
      `Expected single file result but got grouped result with ${result.paths.length} files: ${result.paths.join(', ')}`,
    );
  }
}

/**
 * Asserts that a generation result is a grouped file result.
 *
 * Combines type guard with assertion - throws descriptive error
 * if result is not a grouped file result, otherwise narrows the
 * type for caller.
 *
 * @param result - Generation result to check
 * @throws {Error} If result is not a grouped file result
 *
 * @example
 * ```typescript
 * import { assertGroupedFileResult } from '../tests-helpers/generation-result-assertions.js';
 *
 * const result = await generateZodClientFromOpenAPI({
 *   groupStrategy: { type: 'tag' },
 * });
 * assertGroupedFileResult(result); // Throws if not grouped, narrows type
 * expect(result.files['users']).toContain('export'); // ✅ Type-safe access to files
 * ```
 *
 * @public
 */
export function assertGroupedFileResult(
  result: GenerationResult,
): asserts result is Extract<GenerationResult, { type: 'grouped' }> {
  if (!isGroupedFileResult(result)) {
    const pathInfo = result.path ? ' at path: ' + result.path : '';
    throw new Error('Expected grouped file result but got single file result' + pathInfo);
  }
}

/**
 * Safely extracts content from a generation result.
 *
 * Throws descriptive error if result is grouped (which doesn't have
 * a single content field). Use when you need content and want explicit
 * error if generation produced multiple files.
 *
 * @param result - Generation result to extract content from
 * @returns The content string from single file result
 * @throws {Error} If result is a grouped file result
 *
 * @example
 * ```typescript
 * import { extractContent } from '../tests-helpers/generation-result-assertions.js';
 *
 * const result = await generateZodClientFromOpenAPI({...});
 * const content = extractContent(result); // Throws if grouped
 * expect(content).toContain('import { z } from "zod"');
 * ```
 *
 * @public
 */
export function extractContent(result: GenerationResult): string {
  assertSingleFileResult(result);
  return result.content;
}

/**
 * Safely extracts files record from a generation result.
 *
 * Throws descriptive error if result is single file (which doesn't have
 * a files record). Use when you need files and want explicit error if
 * generation produced single file.
 *
 * @param result - Generation result to extract files from
 * @returns The files record from grouped file result
 * @throws {Error} If result is a single file result
 *
 * @example
 * ```typescript
 * import { extractFiles } from '../tests-helpers/generation-result-assertions.js';
 *
 * const result = await generateZodClientFromOpenAPI({
 *   groupStrategy: { type: 'tag' },
 * });
 * const files = extractFiles(result); // Throws if single file
 * expect(Object.keys(files)).toContain('users');
 * expect(files['users']).toContain('export const UserSchema');
 * ```
 *
 * @public
 */
export function extractFiles(result: GenerationResult): Record<string, string> {
  assertGroupedFileResult(result);
  return result.files;
}
