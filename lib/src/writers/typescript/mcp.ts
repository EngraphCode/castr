import { Writers, type WriterFunction } from 'ts-morph';
import type { TemplateContextMcpTool } from '../../context/template-context.mcp.js';

export function createMcpToolWriter(tool: TemplateContextMcpTool): WriterFunction {
  const httpOpProps: Record<string, string> = {
    method: `"${tool.httpOperation.method}"`,
    path: `"${tool.httpOperation.path}"`,
    originalPath: `"${tool.httpOperation.originalPath}"`,
  };

  if (tool.httpOperation.operationId) {
    httpOpProps['operationId'] = `"${tool.httpOperation.operationId}"`;
  }

  const toolProps: Record<string, string | WriterFunction> = {
    tool: JSON.stringify(tool.tool, null, 2),
    httpOperation: Writers.object(httpOpProps),
  };

  if (tool.security) {
    toolProps['security'] = JSON.stringify(tool.security, null, 2);
  }

  return Writers.object(toolProps);
}
