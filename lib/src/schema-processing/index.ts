// Additional parsers not re-exported by context
export { parseZodSource } from './parsers/zod/index.js';

// Writers
export { writeOpenApi } from './writers/openapi/index.js';
export { writeZodSchema } from './writers/zod/index.js';
export { writeTypeScript, writeIndexFile, writeCommonFile } from './writers/typescript/index.js';
export { writeMarkdown } from './writers/markdown/index.js';

// Conversions
export { convertOpenApiSchemaToJsonSchema } from './conversion/json-schema/index.js';
export { getZodSchema } from './conversion/zod/index.js';
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
} from './context/index.js';
