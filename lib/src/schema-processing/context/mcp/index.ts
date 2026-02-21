// Avoid re-exporting naming utilities if they collide
export {
  type TemplateContextMcpTool,
  buildMcpToolsFromIR,
  getMcpToolName,
  getMcpToolHints,
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
} from './template-context.mcp.js';
