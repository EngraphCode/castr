import { ToolSchema, type Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { EndpointDefinition, HttpMethod } from '../endpoints/definition.types.js';
import type { OperationSecurityMetadata } from '../conversion/json-schema/security/extract-operation-security.js';
import { getOriginalPathWithBrackets } from './template-context.endpoints.helpers.js';
import { getMcpToolName, getMcpToolHints } from './template-context.mcp.naming.js';
import {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  buildMcpToolSchemas,
  type McpToolSchemaResult,
} from './template-context.mcp.schemas.js';
import { replaceHyphenatedPath } from '../shared/utils/index.js';

// IR-based imports
import type { CastrDocument, CastrOperation } from './ir-schema.js';
import { buildMcpToolSchemasFromIR } from './template-context.mcp.schemas.from-ir.js';
import { resolveOperationSecurityFromIR } from './template-context.mcp.security.from-ir.js';

const normalizeDescription = (
  operation: OperationObject,
  method: HttpMethod,
  path: string,
): {
  title?: OperationObject['summary'];
  description: string;
} => {
  const normalizeText = (value: string | undefined): string | undefined => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  };

  const summary = normalizeText(operation.summary);
  const primaryDescription = normalizeText(operation.description);
  const fallback = `${method.toUpperCase()} ${path}`;

  if (primaryDescription) {
    return {
      title: summary,
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

export interface TemplateContextMcpTool {
  tool: Tool;
  method: EndpointDefinition['method'];
  path: EndpointDefinition['path'];
  originalPath: string;
  operationId?: OperationObject['operationId'];
  httpOperation: {
    method: EndpointDefinition['method'];
    path: EndpointDefinition['path'];
    originalPath: string;
    operationId?: OperationObject['operationId'];
  };
  security: OperationSecurityMetadata;
}

const collectCandidatePaths = (
  documentPaths: OpenAPIObject['paths'],
  templatedPath: string,
): string[] => {
  const availablePaths = documentPaths ?? {};
  const uniquePaths = new Set<string>();

  const directCandidates = [templatedPath, getOriginalPathWithBrackets(templatedPath)];
  for (const candidate of directCandidates) {
    if (candidate && availablePaths[candidate]) {
      uniquePaths.add(candidate);
    }
  }

  for (const candidate of Object.keys(availablePaths)) {
    if (replaceHyphenatedPath(candidate) === templatedPath) {
      uniquePaths.add(candidate);
    }
  }

  return [...uniquePaths];
};

const resolveOperationForEndpoint = (
  document: OpenAPIObject,
  endpoint: EndpointDefinition,
): { operation: OperationObject; originalPath: string } => {
  const documentPaths = document.paths ?? {};

  const candidatePaths = collectCandidatePaths(documentPaths, endpoint.path);

  for (const candidatePath of candidatePaths) {
    const pathItem = documentPaths[candidatePath];
    if (!pathItem || isReferenceObject(pathItem)) {
      continue;
    }

    const operation = pathItem[endpoint.method];
    if (operation) {
      return { operation, originalPath: candidatePath };
    }
  }

  throw new Error(`Missing operation for ${endpoint.method.toUpperCase()} ${endpoint.path}`);
};

export const buildMcpTools = ({
  document,
  endpoints,
}: {
  document: OpenAPIObject;
  endpoints: EndpointDefinition[];
}): TemplateContextMcpTool[] => {
  return endpoints.map((endpoint) => {
    const { operation, originalPath } = resolveOperationForEndpoint(document, endpoint);

    const { inputSchema, outputSchema, security } = buildMcpToolSchemas({
      document,
      path: originalPath,
      method: endpoint.method,
    });

    const { title, description } = normalizeDescription(operation, endpoint.method, originalPath);
    const toolCandidate = {
      name: getMcpToolName(operation.operationId, endpoint.method, originalPath),
      ...(title ? { title } : {}),
      description,
      inputSchema,
      ...(outputSchema ? { outputSchema } : {}),
      annotations: getMcpToolHints(endpoint.method),
    };

    const tool = ToolSchema.parse(toolCandidate);

    const httpOperation = {
      method: endpoint.method,
      path: endpoint.path,
      originalPath,
      ...(operation.operationId ? { operationId: operation.operationId } : {}),
    };

    return {
      tool,
      method: endpoint.method,
      path: endpoint.path,
      originalPath,
      ...(operation.operationId ? { operationId: operation.operationId } : {}),
      httpOperation,
      security,
    };
  });
};

// ============================================================================
// IR-based MCP Tool Builder
// ============================================================================

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
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  };

  const summary = normalizeText(operation.summary);
  const primaryDescription = normalizeText(operation.description);
  const fallback = `${operation.method.toUpperCase()} ${operation.path}`;

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
 * It replaces `buildMcpTools` which requires raw OpenAPI objects.
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
 * @see {@link buildMcpTools} for legacy OpenAPI-based implementation
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
export {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  buildMcpToolSchemas,
  type McpToolSchemaResult,
};
