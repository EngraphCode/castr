import type { ZodError } from 'zod';

/**
 * MCP-friendly validation error response.
 *
 * @public
 */
export interface McpValidationError {
  /** JSON-RPC 2.0 error code (-32602 for Invalid params) */
  readonly code: number;
  /** Human-readable error message */
  readonly message: string;
  /** Structured error data with issue details */
  readonly data: {
    /** JSON pointer to the first error location (e.g., "/inputSchema/properties/id") */
    readonly pointer?: string;
    /** Expected type or format (if available) */
    readonly expected?: string;
    /** Actual value received (if available) */
    readonly received?: unknown;
    /** Array of all validation issues */
    readonly issues: readonly {
      /** Path to the error as array of keys/indices/symbols */
      readonly path: readonly (string | number | symbol)[];
      /** Error message for this specific issue */
      readonly message: string;
    }[];
  };
}

/**
 * Context information for formatting MCP validation errors.
 *
 * @public
 */
export interface McpValidationErrorContext {
  /** Name of the MCP tool that failed validation */
  readonly toolName?: string;
  /** Whether validation failed on input or output */
  readonly direction?: 'input' | 'output';
}

/**
 * Convert issue path to JSON pointer (RFC 6901).
 *
 * @param path - Array of path segments from Zod issue
 * @returns JSON pointer string
 *
 * @internal
 */
function pathToPointer(path: readonly (string | number | symbol)[]): string {
  if (path.length === 0) {
    return '/';
  }
  return `/${path.map((segment) => String(segment)).join('/')}`;
}

/**
 * Build error message based on context.
 *
 * @param context - Optional context about the tool and validation direction
 * @returns Human-readable error message
 *
 * @internal
 */
function buildErrorMessage(context?: McpValidationErrorContext): string {
  if (context?.toolName && context?.direction) {
    return `Validation failed for tool "${context.toolName}" ${context.direction}`;
  }
  if (context?.toolName) {
    return `Validation failed for tool "${context.toolName}"`;
  }
  return 'MCP validation failed';
}

/**
 * Convert a Zod validation error to an MCP-friendly error response.
 *
 * Transforms Zod validation errors into the JSON-RPC 2.0 error format expected
 * by MCP clients, including JSON pointer paths for precise error location tracking
 * and structured issue details for comprehensive error reporting.
 *
 * @param error - Zod validation error from schema.parse() or similar
 * @param context - Optional context about the tool and validation direction
 * @returns Structured error conforming to JSON-RPC 2.0 and MCP expectations
 *
 * @example Format a tool input validation error
 * ```typescript
 * import { formatMcpValidationError } from '@engraph/castr';
 * import { z } from 'zod';
 *
 * const inputSchema = z.object({ id: z.string() });
 *
 * try {
 *   inputSchema.parse({ id: 123 });
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const mcpError = formatMcpValidationError(error, {
 *       toolName: 'get_user',
 *       direction: 'input'
 *     });
 *     // Send mcpError to MCP client
 *     return { error: mcpError };
 *   }
 * }
 * ```
 *
 * @example Handle validation in API middleware
 * ```typescript
 * app.use((err, req, res, next) => {
 *   if (err instanceof z.ZodError) {
 *     const mcpError = formatMcpValidationError(err, {
 *       toolName: req.body.toolName,
 *       direction: 'input'
 *     });
 *     return res.status(400).json({
 *       jsonrpc: '2.0',
 *       error: mcpError,
 *       id: req.body.id
 *     });
 *   }
 *   next(err);
 * });
 * ```
 *
 * @remarks
 * - Always uses JSON-RPC 2.0 error code -32602 (Invalid params) for validation errors
 * - JSON pointer format follows RFC 6901 for precise error location
 * - Original Zod error information is preserved in the issues array
 * - Multiple validation errors are aggregated into a single response
 *
 * @see {@link McpValidationError} for the return type structure
 * @see {@link McpValidationErrorContext} for context options
 *
 * @public
 */
export function formatMcpValidationError(
  error: ZodError,
  context?: McpValidationErrorContext,
): McpValidationError {
  const issues = error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));

  const firstPath = issues[0]?.path;
  const pointer = firstPath ? pathToPointer(firstPath) : '/';
  const message = buildErrorMessage(context);

  return {
    code: -32602, // JSON-RPC 2.0 Invalid params
    message,
    data: {
      pointer,
      issues,
    },
  };
}
