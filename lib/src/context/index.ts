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

// IR exports
export * from './ir-schema.js';
export { buildIR } from './ir-builder.js';
