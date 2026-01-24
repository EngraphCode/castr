export { generateZodClientFromOpenAPI } from './rendering/index.js';
export type { GenerateZodClientFromOpenApiArgs } from './rendering/index.js';

export type { GenerationResult } from './rendering/generation-result.js';
export { isSingleFileResult, isGroupedFileResult } from './rendering/generation-result.js';
export { getOpenApiDependencyGraph } from './shared/index.js';
// Note: validateOpenApiSpec and ValidationError removed in Phase 1 Part 5
// Replaced by prepareOpenApiDocument helper (internal) which uses SwaggerParser
export * from './endpoints/index.js';
export { maybePretty } from './shared/index.js';
export * from './context/index.js';
export { logger } from './shared/index.js';
export { isMcpTool, isMcpToolInput, isMcpToolOutput } from './validation/mcp-type-guards.js';
export {
  formatMcpValidationError,
  type McpValidationError,
  type McpValidationErrorContext,
} from './validation/mcp-error-formatting.js';
// Canonical IR → OpenAPI writer (consolidated from generators/openapi and context/converter)
export { writeOpenApi } from './writers/openapi/index.js';
// Deprecated alias for backward compatibility
export { writeOpenApi as generateOpenAPI } from './writers/openapi/index.js';
export { loadOpenApiDocument } from './shared/load-openapi-document/orchestrator.js';
export { getZodSchema } from './conversion/zod/index.js';
