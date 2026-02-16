import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { endsWith, join, snakeCase, split, startsWith, trim, trimStart } from 'lodash-es';
import type { HttpMethod } from '../../endpoints/definition.types.js';

type McpToolHints = Pick<ToolAnnotations, 'readOnlyHint' | 'destructiveHint' | 'idempotentHint'>;

const READ_ONLY_METHODS = new Set<HttpMethod>(['get', 'head', 'options']);
const UNDERSCORE_TOKEN = '_' as const;
const PATH_SEPARATOR = '/' as const;
const ROOT_SEGMENT = 'root' as const;
const BRACE_SEGMENT_CHARS = '{}' as const;
const OPEN_BRACE = '{' as const;
const CLOSE_BRACE = '}' as const;
const COLON_PREFIX = ':' as const;
const METHOD_DELETE = 'delete' as const;
const METHOD_PUT = 'put' as const;

const normalizeSeparators = (value: string): string => {
  const segments = split(value, UNDERSCORE_TOKEN);
  const nonEmpty = segments.filter((segment) => segment.length > 0);
  return join(nonEmpty, UNDERSCORE_TOKEN);
};

const toSnakeCase = (value: string): string => normalizeSeparators(snakeCase(value));

const stripWrappingDelimiters = (segment: string): string => {
  if (startsWith(segment, OPEN_BRACE) && endsWith(segment, CLOSE_BRACE)) {
    return trim(segment, BRACE_SEGMENT_CHARS);
  }
  if (startsWith(segment, COLON_PREFIX)) {
    return trimStart(segment, COLON_PREFIX);
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
  const trimmedOperationId = operationId === undefined ? undefined : trim(operationId);
  if (trimmedOperationId && trimmedOperationId.length > 0) {
    const candidate = toSnakeCase(trimmedOperationId);
    if (candidate.length > 0) {
      return candidate;
    }
  }

  const methodPart = toSnakeCase(method);
  const pathParts = split(path, PATH_SEPARATOR)
    .map((segment) => sanitizePathSegment(segment))
    .filter((segment): segment is string => segment.length > 0);

  const parts = pathParts.length > 0 ? pathParts : [ROOT_SEGMENT];
  const combined = join([methodPart, ...parts], UNDERSCORE_TOKEN);
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

  if (method === METHOD_DELETE) {
    return {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    };
  }

  if (method === METHOD_PUT) {
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
