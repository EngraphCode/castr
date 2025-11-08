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
  buildMcpToolSchemas,
  type McpToolSchemaResult,
  buildMcpTools,
  type TemplateContextMcpTool,
} from './template-context.mcp.js';
