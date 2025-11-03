export {
  type CodeMeta,
  type CodeMetaData,
  type ConversionTypeContext,
} from './shared/code-meta.js';
export { generateZodClientFromOpenAPI } from './rendering/index.js';
export type { GenerateZodClientFromOpenApiArgs } from './rendering/index.js';
export { getHandlebars } from './rendering/index.js';
export { getOpenApiDependencyGraph } from './shared/index.js';
// Note: validateOpenApiSpec and ValidationError removed in Phase 1 Part 5
// Replaced by prepareOpenApiDocument helper (internal) which uses SwaggerParser
export * from './endpoints/index.js';
export { maybePretty } from './shared/index.js';
export { getZodSchema } from './conversion/zod/index.js';
export * from './context/index.js';
export { logger } from './shared/index.js';
