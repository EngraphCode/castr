/**
 * Generation Result Types
 *
 * Discriminated union types for code generation results.
 * Provides type-safe handling of single-file vs. grouped-file generation.
 *
 * @module generation-result
 * @since 2.0.0
 * @public
 */

/**
 * Result of code generation - discriminated union for type safety.
 *
 * Uses TypeScript discriminated unions to ensure type-safe handling
 * of different generation modes (single file vs. grouped files).
 *
 * @example Single file result
 * ```typescript
 * const result: GenerationResult = {
 *   type: 'single',
 *   content: 'export const schema = z.object({...});',
 *   path: './api-client.ts',
 * };
 * ```
 *
 * @example Grouped file result
 * ```typescript
 * const result: GenerationResult = {
 *   type: 'grouped',
 *   files: {
 *     'users.ts': 'export const UserSchema = ...',
 *     'posts.ts': 'export const PostSchema = ...',
 *   },
 *   paths: ['users.ts', 'posts.ts'],
 * };
 * ```
 *
 * @see {@link isSingleFileResult} for type guard
 * @see {@link isGroupedFileResult} for type guard
 *
 * @public
 */
const GENERATION_RESULT_TYPE_SINGLE = 'single' as const;
const GENERATION_RESULT_TYPE_GROUPED = 'grouped' as const;

export type GenerationResult =
  | {
      /** Discriminator: single file output */
      type: typeof GENERATION_RESULT_TYPE_SINGLE;
      /** Generated code content */
      content: string;
      /** Optional output file path */
      path?: string | undefined;
    }
  | {
      /** Discriminator: grouped file output */
      type: typeof GENERATION_RESULT_TYPE_GROUPED;
      /** Generated files by name/path */
      files: Record<string, string>;
      /** List of file paths */
      paths: string[];
    };

/**
 * Type guard for single file result.
 *
 * Narrows GenerationResult to single file variant, enabling
 * type-safe access to the content field.
 *
 * @param result - Generation result to check
 * @returns True if result is a single file result
 *
 * @example
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({...});
 * if (isSingleFileResult(result)) {
 *   console.log(result.content); // Type-safe: string
 *   result.content.includes('z.object'); // ✅ Type-safe method call
 * }
 * ```
 *
 * @public
 */
export function isSingleFileResult(
  result: GenerationResult,
): result is Extract<GenerationResult, { type: 'single' }> {
  return result.type === GENERATION_RESULT_TYPE_SINGLE;
}

/**
 * Type guard for grouped file result.
 *
 * Narrows GenerationResult to grouped file variant, enabling
 * type-safe access to the files field.
 *
 * @param result - Generation result to check
 * @returns True if result is a grouped file result
 *
 * @example
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({...});
 * if (isGroupedFileResult(result)) {
 *   for (const [filename, content] of Object.entries(result.files)) {
 *     console.log(`${filename}: ${content.length} bytes`);
 *   }
 * }
 * ```
 *
 * @public
 */
export function isGroupedFileResult(
  result: GenerationResult,
): result is Extract<GenerationResult, { type: 'grouped' }> {
  return result.type === GENERATION_RESULT_TYPE_GROUPED;
}
