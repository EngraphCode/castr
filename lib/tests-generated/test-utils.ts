import {
  generateZodClientFromOpenAPI as generateZodClientFromOpenAPIBase,
  type GenerateZodClientFromOpenApiArgs,
} from '../src/rendering/generate-from-context.js';
import type { GenerationResult } from '../src/rendering/generation-result.js';

const STRIP_COMPATIBILITY_OPTIONS = { nonStrictObjectPolicy: 'strip' } as const;

/**
 * Generated-code validation helper: keep legacy OpenAPI fixtures on the explicit
 * strip compatibility path rather than relying on permissive default ingest.
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
