import { ToolSchema, type Tool } from '@modelcontextprotocol/sdk/types.js';
import { toUpper, trim } from 'lodash-es';

import type { EndpointDefinition } from '../../endpoints/definition.types.js';
import type { OperationSecurityMetadata } from '../conversion/json-schema/security/extract-operation-security.js';
import { getMcpToolName, getMcpToolHints } from './template-context.mcp.naming.js';
import {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  type McpToolSchemaResult,
} from './template-context.mcp.schemas.js';

// IR-based imports
import type { CastrDocument, CastrOperation } from '../ir/schema.js';
import { buildMcpToolSchemasFromIR } from './template-context.mcp.schemas.from-ir.js';
import { resolveOperationSecurityFromIR } from './template-context.mcp.security.from-ir.js';

/**
 * Metadata for an MCP tool generated from an OpenAPI operation.
 *
 * Contains the MCP tool definition, HTTP operation details, and security metadata.
 *
 * @public
 */
export interface TemplateContextMcpTool {
  tool: Tool;
  method: EndpointDefinition['method'];
  path: EndpointDefinition['path'];
  originalPath: string;
  operationId?: string;
  httpOperation: {
    method: EndpointDefinition['method'];
    path: EndpointDefinition['path'];
    originalPath: string;
    operationId?: string;
  };
  security: OperationSecurityMetadata;
}

/**
 * Normalize operation description for MCP tool from IR.
 *
 * @param operation - The CastrOperation
 * @returns Normalized title and description
 *
 * @internal
 */
const normalizeDescriptionFromIR = (
  operation: CastrOperation,
): {
  title?: string;
  description: string;
} => {
  const normalizeText = (value: string | undefined): string | undefined => {
    const normalized = value === undefined ? undefined : trim(value);
    return normalized && normalized.length > 0 ? normalized : undefined;
  };

  const summary = normalizeText(operation.summary);
  const primaryDescription = normalizeText(operation.description);
  const fallback = `${toUpper(operation.method)} ${operation.path}`;

  if (primaryDescription) {
    return {
      ...(summary ? { title: summary } : {}),
      description: primaryDescription,
    };
  }

  if (summary) {
    return {
      title: summary,
      description: summary,
    };
  }

  return {
    description: fallback,
  };
};

/**
 * Build MCP tools from a CastrDocument (IR).
 *
 * This function reads entirely from IR types (`CastrDocument`) and produces
 * `TemplateContextMcpTool[]` compatible with the existing infrastructure.
 *
 * @param ir - The CastrDocument containing operations and components
 * @returns Array of MCP tools ready for use
 *
 * @example
 * ```typescript
 * const ir = buildIR(openApiDoc);
 * const mcpTools = buildMcpToolsFromIR(ir);
 *
 * for (const { tool, security } of mcpTools) {
 *   console.log(tool.name, security.isPublic);
 * }
 * ```
 *
 * @public
 */
export const buildMcpToolsFromIR = (ir: CastrDocument): TemplateContextMcpTool[] => {
  return ir.operations.map((operation) => {
    // Build schemas from IR
    const { inputSchema, outputSchema } = buildMcpToolSchemasFromIR(ir, operation);

    // Resolve security from IR
    const security = resolveOperationSecurityFromIR(ir, operation);

    // Build tool metadata
    const { title, description } = normalizeDescriptionFromIR(operation);
    const toolCandidate = {
      name: getMcpToolName(operation.operationId, operation.method, operation.path),
      ...(title ? { title } : {}),
      description,
      inputSchema,
      ...(outputSchema ? { outputSchema } : {}),
      annotations: getMcpToolHints(operation.method),
    };

    const tool = ToolSchema.parse(toolCandidate);

    const httpOperation = {
      method: operation.method,
      path: operation.path,
      originalPath: operation.path,
      ...(operation.operationId ? { operationId: operation.operationId } : {}),
    };

    return {
      tool,
      method: operation.method,
      path: operation.path,
      originalPath: operation.path,
      ...(operation.operationId ? { operationId: operation.operationId } : {}),
      httpOperation,
      security,
    };
  });
};

export { getMcpToolName, getMcpToolHints };
export { buildInputSchemaObject, buildOutputSchemaObject, type McpToolSchemaResult };
