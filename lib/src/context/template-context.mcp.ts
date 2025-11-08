import { ToolSchema, type Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';

import type { EndpointDefinition, HttpMethod } from '../endpoints/definition.types.js';
import type { OperationSecurityMetadata } from '../conversion/json-schema/security/extract-operation-security.js';
import {
  getOperationForEndpoint,
  getOriginalPathWithBrackets,
} from './template-context.endpoints.helpers.js';
import { getMcpToolName, getMcpToolHints } from './template-context.mcp.naming.js';
import {
  buildInputSchemaObject,
  buildOutputSchemaObject,
  buildMcpToolSchemas,
  type McpToolSchemaResult,
} from './template-context.mcp.schemas.js';

const normalizeDescription = (
  operation: OperationObject,
  method: HttpMethod,
  path: string,
): {
  title?: OperationObject['summary'];
  description: string;
} => {
  const summary = operation.summary?.trim();
  const primaryDescription = operation.description?.trim();
  const fallback = `${method.toUpperCase()} ${path}`;

  if (primaryDescription && primaryDescription.length > 0) {
    return {
      title: summary && summary.length > 0 ? summary : undefined,
      description: primaryDescription,
    };
  }

  if (summary && summary.length > 0) {
    return {
      title: summary,
      description: summary,
    };
  }

  return {
    description: fallback,
  };
};

export type TemplateContextMcpTool = {
  tool: Tool;
  method: EndpointDefinition['method'];
  path: EndpointDefinition['path'];
  originalPath: string;
  operationId?: OperationObject['operationId'];
  security: OperationSecurityMetadata;
};

export const buildMcpTools = ({
  document,
  endpoints,
}: {
  document: OpenAPIObject;
  endpoints: EndpointDefinition[];
}): TemplateContextMcpTool[] => {
  return endpoints.map((endpoint) => {
    const operation = getOperationForEndpoint(document, endpoint);
    if (!operation) {
      throw new Error(`Missing operation for ${endpoint.method.toUpperCase()} ${endpoint.path}`);
    }

    const candidatePath = getOriginalPathWithBrackets(endpoint.path);
    const hasCanonicalPath = document.paths?.[candidatePath] !== undefined;
    const documentPath = hasCanonicalPath ? candidatePath : endpoint.path;

    const { inputSchema, outputSchema, security } = buildMcpToolSchemas({
      document,
      path: documentPath,
      method: endpoint.method,
    });

    const { title, description } = normalizeDescription(operation, endpoint.method, documentPath);
    const toolCandidate = {
      name: getMcpToolName(operation.operationId, endpoint.method, documentPath),
      ...(title ? { title } : {}),
      description,
      inputSchema,
      ...(outputSchema ? { outputSchema } : {}),
      annotations: getMcpToolHints(endpoint.method),
    };

    const tool = ToolSchema.parse(toolCandidate);

    return {
      tool,
      method: endpoint.method,
      path: endpoint.path,
      originalPath: documentPath,
      operationId: operation.operationId,
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
