// Avoid re-exporting naming utilities if they collide
export {
  type TemplateContextMcpTool,
  type BuildMcpToolsFromIROptions,
  buildMcpToolsFromIR,
  getMcpToolName,
  getMcpToolHints,
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
} from './template-context.mcp.js';
