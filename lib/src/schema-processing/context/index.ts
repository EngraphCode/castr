// Main context generation
export {
  getZodClientTemplateContext,
  extractSchemaNamesFromDoc,
  type TemplateContext,
  type TemplateContextOptions,
} from './template-context.js';
export { getMcpToolName, getMcpToolHints } from './template-context.mcp.js';
export {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
  buildMcpToolsFromIR,
  type TemplateContextMcpTool,
} from './template-context.mcp.js';

// IR exports - re-exported from canonical location for backward compatibility
// NOTE: These re-exports are deprecated. Import directly from '../ir/index.js' instead.
export * from '../ir/index.js';

// Parser exports - re-exported for backward compatibility
// NOTE: These re-exports are deprecated. Import directly from '../parsers/openapi/index.js' instead.
export { buildIR } from '../parsers/openapi/index.js';
