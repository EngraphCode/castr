import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { snakeCase } from 'lodash-es';
import type { HttpMethod } from '../endpoints/definition.types.js';

type McpToolHints = Pick<ToolAnnotations, 'readOnlyHint' | 'destructiveHint' | 'idempotentHint'>;

const READ_ONLY_METHODS = new Set<HttpMethod>(['get', 'head', 'options']);

const normalizeSeparators = (value: string): string =>
  value
    .split('_')
    .filter((segment) => segment.length > 0)
    .join('_');

const toSnakeCase = (value: string): string => normalizeSeparators(snakeCase(value));

const stripWrappingDelimiters = (segment: string): string => {
  if (segment.startsWith('{') && segment.endsWith('}')) {
    return segment.slice(1, -1);
  }
  if (segment.startsWith(':')) {
    return segment.slice(1);
  }
  return segment;
};

const sanitizePathSegment = (segment: string): string => {
  if (segment.length === 0) {
    return '';
  }

  const trimmed = stripWrappingDelimiters(segment);
  return toSnakeCase(trimmed);
};

/**
 * Derive the canonical MCP tool name for an operation.
 * Prefers snake_case operationId with a method/path fallback.
 */
export const getMcpToolName = (
  operationId: string | undefined,
  method: HttpMethod,
  path: string,
): string => {
  const trimmedOperationId = operationId?.trim();
  if (trimmedOperationId && trimmedOperationId.length > 0) {
    const candidate = toSnakeCase(trimmedOperationId);
    if (candidate.length > 0) {
      return candidate;
    }
  }

  const methodPart = toSnakeCase(method);
  const pathParts = path
    .split('/')
    .map((segment) => sanitizePathSegment(segment))
    .filter((segment): segment is string => segment.length > 0);

  const parts = pathParts.length > 0 ? pathParts : ['root'];
  const combined = [methodPart, ...parts].join('_');
  return normalizeSeparators(combined);
};

/**
 * Map HTTP method to MCP behavioral hints.
 * Defaults to all hints false.
 */
export const getMcpToolHints = (method: HttpMethod): McpToolHints => {
  if (READ_ONLY_METHODS.has(method)) {
    return {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    };
  }

  if (method === 'delete') {
    return {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    };
  }

  if (method === 'put') {
    return {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    };
  }

  return {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  };
};
