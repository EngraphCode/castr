import type { OpenAPIObject } from 'openapi3-ts/oas31';
import {
  extractContent,
  assertSingleFileResult,
} from '../../tests-helpers/generation-result-assertions.js';
import {
  generateZodClientFromOpenAPI as generateZodClientFromOpenAPIBase,
  type GenerateZodClientFromOpenApiArgs,
} from '../rendering/index.js';
import type { GenerationResult } from '../rendering/generation-result.js';
import {
  getZodClientTemplateContext as getZodClientTemplateContextBase,
  type TemplateContext,
  type TemplateContextOptions,
} from '../schema-processing/context/index.js';

const STRIP_COMPATIBILITY_OPTIONS = { nonStrictObjectPolicy: 'strip' } as const;

/**
 * Type Guard: Assert value is a string
 *
 * Used in tests to narrow the type of generated code from `string | undefined` to `string`.
 * Follows fail-fast principle from principles.md.
 *
 * @param value - The value to check
 * @param context - Optional context for error message
 * @throws {Error} If value is not a string
 */
export function assertIsString(value: unknown, context?: string): asserts value is string {
  if (typeof value !== 'string') {
    const contextPart = context ? ` for ${context}` : '';
    throw new Error(`Expected string${contextPart}, got ${typeof value}`);
  }
}

/**
 * Assert value is GenerationResult and extract content as string.
 *
 * Used in characterisation tests to handle the GenerationResult discriminated union.
 * Combines type guard with extraction for cleaner test code.
 *
 * @param result - The GenerationResult to extract content from
 * @param context - Optional context for error message
 * @returns The content string from single file result
 * @throws {Error} If result is not a single file result
 */
export function assertAndExtractContent(result: GenerationResult, context?: string): string {
  const contextPart = context ? ` for ${context}` : '';
  try {
    return extractContent(result);
  } catch (error) {
    throw new Error(`Expected single file GenerationResult${contextPart}: ${error}`);
  }
}

/**
 * Characterisation helper: keep legacy non-strict OpenAPI fixtures on the explicit
 * compatibility path instead of silently relying on default permissive ingest.
 */
export function generateZodClientFromOpenAPI(
  args: GenerateZodClientFromOpenApiArgs,
): Promise<GenerationResult> {
  return generateZodClientFromOpenAPIBase({
    ...args,
    options: {
      ...STRIP_COMPATIBILITY_OPTIONS,
      ...args.options,
    },
  });
}

/**
 * Characterisation helper: parse legacy non-strict OpenAPI fixtures via explicit
 * strip compatibility mode.
 */
export function getZodClientTemplateContext(
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): TemplateContext {
  return getZodClientTemplateContextBase(doc, {
    ...STRIP_COMPATIBILITY_OPTIONS,
    ...options,
  });
}

// Re-export for convenience
export { extractContent, assertSingleFileResult };
