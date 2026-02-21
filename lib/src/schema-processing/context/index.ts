// Main context generation
export {
  getZodClientTemplateContext,
  extractSchemaNamesFromDoc,
  type TemplateContext,
  type TemplateContextOptions,
} from './template-context.js';
export { getMcpToolName, getMcpToolHints } from './mcp/index.js';
export {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
  buildMcpToolsFromIR,
  type TemplateContextMcpTool,
} from './mcp/index.js';

// IR exports - re-exported from canonical location for backward compatibility
// NOTE: These re-exports are deprecated. Import directly from '../ir/index.js' instead.
// Parser exports - re-exported for backward compatibility
// NOTE: These re-exports are deprecated. Import directly from '../parsers/openapi/index.js' instead.
export { buildIR } from '../parsers/openapi/index.js';
export {
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
} from '../ir/index.js';
