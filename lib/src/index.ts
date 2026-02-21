export { generateZodClientFromOpenAPI } from './rendering/index.js';
export type { GenerateZodClientFromOpenApiArgs } from './rendering/index.js';

export type { GenerationResult } from './rendering/generation-result.js';
export { isSingleFileResult, isGroupedFileResult } from './rendering/generation-result.js';
export { getOpenApiDependencyGraph } from './shared/index.js';
// Note: validateOpenApiSpec and ValidationError removed in Phase 1 Part 5
// Replaced by prepareOpenApiDocument helper (internal) which uses SwaggerParser
export { maybePretty } from './shared/index.js';
export { logger } from './shared/index.js';
export { isMcpTool, isMcpToolInput, isMcpToolOutput } from './validation/mcp-type-guards.js';
export {
  formatMcpValidationError,
  type McpValidationError,
  type McpValidationErrorContext,
} from './validation/mcp-error-formatting.js';
// Canonical IR → OpenAPI writer (consolidated from generators/openapi and context/converter)
export { writeOpenApi } from './schema-processing/writers/openapi/index.js';
// Deprecated alias for backward compatibility
export { writeOpenApi as generateOpenAPI } from './schema-processing/writers/openapi/index.js';
export { loadOpenApiDocument } from './shared/load-openapi-document/orchestrator.js';
export { getZodSchema } from './schema-processing/conversion/zod/index.js';
export {
  type EndpointDefinition,
  type EndpointParameter,
  type EndpointError,
  type EndpointResponse,
  type HttpMethod,
  type RequestFormat,
  type ParameterType,
  type SchemaConstraints,
  extractParameterMetadata,
  extractSchemaConstraints,
  type ParameterMetadata,
} from './endpoints/index.js';
export {
  getZodClientTemplateContext,
  extractSchemaNamesFromDoc,
  type TemplateContext,
  type TemplateContextOptions,
  getMcpToolName,
  getMcpToolHints,
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
  buildMcpToolsFromIR,
  type TemplateContextMcpTool,
  buildIR,
  CastrSchemaProperties,
  type IRHttpMethod,
  type IRComponent,
  type CastrSchemaComponent,
  type IRSecuritySchemeComponent,
  type CastrParameterComponent,
  type CastrResponseComponent,
  type IRRequestBodyComponent,
  type CastrOperation,
  type CastrParameter,
  type IRRequestBody,
  type IRMediaType,
  type CastrResponse,
  type IRSecurityRequirement,
  type CastrSchema,
  type CastrSchemaNode,
  type CastrSchemaDependencyInfo,
  type IRInheritanceInfo,
  type IRZodChainInfo,
  type CastrDocument,
  type IRDependencyGraph,
  type IRDependencyNode,
  serializeIR,
  deserializeIR,
  isCastrDocument,
  isIRComponent,
  isCastrOperation,
  isCastrSchema,
  isCastrSchemaNode,
  type CastrSchemaContext,
  type IRComponentSchemaContext,
  type IRPropertySchemaContext,
  type IRCompositionMemberContext,
  type IRArrayItemsContext,
  type CastrParameterSchemaContext,
} from './schema-processing/context/index.js';
