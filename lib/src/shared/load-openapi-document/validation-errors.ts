/**
 * Validation error formatting utilities for friendly, helpful error messages.
 *
 * Per RULES.md: "Fail fast, fail hard, be strict at all times"
 * But also be HELPFUL - show users exactly what's wrong and how to fix it.
 *
 * @module
 * @internal
 */

/**
 * Check if a path ends with a response status code pattern (e.g., /responses/200)
 */
function isResponsePath(path: string): boolean {
  const segments = path.split('/');
  const lastIndex = segments.length - 1;
  if (lastIndex < 2) {
    return false;
  }
  const parentSegment = segments[lastIndex - 1];
  const lastSegment = segments[lastIndex];
  // Check if parent is 'responses' and last is a number
  return parentSegment === 'responses' && !Number.isNaN(Number(lastSegment));
}

/**
 * Check if message contains "required property" (case insensitive)
 */
function isRequiredPropertyError(message: string): boolean {
  return message.toLowerCase().includes('required property');
}

/**
 * Check if message contains type value error patterns
 */
function isTypeValueError(message: string): boolean {
  return message.toLowerCase().includes('equal to one of the allowed values');
}

/**
 * Check if message contains not expected/not allowed error patterns
 */
function isNotAllowedError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('not expected') || lower.includes('not allowed');
}

/**
 * Validation hint definitions using string matching
 */
const VALIDATION_HINTS: readonly {
  pathMatcher: (path: string) => boolean;
  messageMatcher: (message: string) => boolean;
  hint: string;
}[] = [
  {
    pathMatcher: isResponsePath,
    messageMatcher: isRequiredPropertyError,
    hint: "Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)",
  },
  {
    pathMatcher: (path) => path.endsWith('/info'),
    messageMatcher: isRequiredPropertyError,
    hint: "The 'info' object requires 'title' and 'version' fields",
  },
  {
    pathMatcher: (path) => path === '/paths',
    messageMatcher: isRequiredPropertyError,
    hint: "The 'paths' field is required in OpenAPI 3.0.x (optional in 3.1.x if webhooks or components present)",
  },
  {
    pathMatcher: (path) => path.endsWith('/type'),
    messageMatcher: isTypeValueError,
    hint: "In 3.0.x, 'type' must be: array, boolean, integer, number, object, or string. 'null' is 3.1.x only",
  },
  {
    pathMatcher: (path) => path.toLowerCase().includes('jsonschemadialect'),
    messageMatcher: isNotAllowedError,
    hint: "'jsonSchemaDialect' is only valid in OpenAPI 3.1.x",
  },
  {
    pathMatcher: (path) => path.toLowerCase().includes('webhooks'),
    messageMatcher: isNotAllowedError,
    hint: "'webhooks' is only valid in OpenAPI 3.1.x",
  },
];

/**
 * Convert a JSON pointer path to a human-readable format.
 *
 * @param path - JSON pointer path (e.g., "/paths/~1test/get/responses/200")
 * @returns Human-readable path (e.g., "paths → /test → get → responses → 200")
 *
 * @example
 * formatValidationPath('/paths/~1test/get/responses/200')
 * // => 'paths → /test → get → responses → 200'
 */
export function formatValidationPath(path: string): string {
  if (path === '' || path === '/') {
    return '(root)';
  }

  // Remove leading slash and split into segments
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path;
  const segments = pathWithoutLeadingSlash.split('/');

  // Unescape each segment (JSON pointer: ~1 = /, ~0 = ~)
  const unescapedSegments = segments.map((segment) => {
    let result = segment;
    // Replace all ~1 with / and all ~0 with ~
    while (result.includes('~1')) {
      result = result.split('~1').join('/');
    }
    while (result.includes('~0')) {
      result = result.split('~0').join('~');
    }
    return result;
  });

  return unescapedSegments.join(' → ');
}

/**
 * Get a helpful hint for a validation error based on the error context.
 *
 * @param message - The error message from the validator
 * @param path - The JSON pointer path to the error
 * @returns A helpful hint string, or undefined if no hint is available
 *
 * @example
 * getValidationHint('must have required property', '/paths/~1test/get/responses/200')
 * // => "Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)"
 */
export function getValidationHint(message: string, path: string): string | undefined {
  for (const { pathMatcher, messageMatcher, hint } of VALIDATION_HINTS) {
    if (pathMatcher(path) && messageMatcher(message)) {
      return hint;
    }
  }
  return undefined;
}

/**
 * Validation error structure from Scalar.
 */
export interface ValidationError {
  readonly message: string;
  readonly path: string;
}

/**
 * Format a validation error into a user-friendly string.
 *
 * @param error - The validation error from Scalar
 * @returns A formatted error string with location, issue, and optional hint
 *
 * @example
 * formatValidationError({ message: 'must have required property', path: '/paths/~1test/get/responses/200' })
 * // =>
 * // "  Location: paths → /test → get → responses → 200
 * //   Issue: must have required property
 * //   Hint: Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)"
 */
export function formatValidationError(error: ValidationError): string {
  const location = formatValidationPath(error.path);
  const hint = getValidationHint(error.message, error.path);

  const lines = [`  Location: ${location}`, `  Issue: ${error.message}`];

  if (hint !== undefined) {
    lines.push(`  Hint: ${hint}`);
  }

  return lines.join('\n');
}

/**
 * Format multiple validation errors into a comprehensive error message.
 *
 * @param errors - Array of validation errors from Scalar
 * @param version - The OpenAPI version declared in the document
 * @returns A formatted error message string
 */
export function formatValidationErrors(
  errors: readonly ValidationError[],
  version?: string,
): string {
  const header =
    version !== undefined
      ? `Invalid OpenAPI ${version} document:\n`
      : 'Invalid OpenAPI document:\n';

  const formattedErrors = errors.map((error, index) => {
    const errorHeader = `\n❌ Error ${index + 1}:`;
    return `${errorHeader}\n${formatValidationError(error)}`;
  });

  return header + formattedErrors.join('\n');
}

/**
 * Scalar error object with optional path property.
 */
interface ScalarValidationError {
  readonly message: string;
  readonly path?: string;
}

/**
 * Extract OpenAPI version from a bundled document.
 */
function extractOpenApiVersion(document: unknown): string | undefined {
  if (typeof document !== 'object' || document === null) {
    return undefined;
  }
  // Use 'in' operator for safe type narrowing without assertions
  if ('openapi' in document) {
    const openapi = document.openapi;
    if (typeof openapi === 'string') {
      return openapi;
    }
  }
  return undefined;
}

/**
 * Create formatted validation error message from Scalar validation result.
 *
 * This helper encapsulates the error extraction and formatting logic,
 * reducing complexity in the orchestrator.
 *
 * @param scalarErrors - Errors from Scalar's validate() result
 * @param bundledDocument - The bundled document being validated
 * @returns Formatted error message string
 */
export function createValidationErrorMessage(
  scalarErrors: readonly ScalarValidationError[] | undefined,
  bundledDocument: unknown,
): string {
  const errors: readonly ValidationError[] =
    scalarErrors?.map((e) => ({
      message: e.message,
      path: e.path ?? '',
    })) ?? [];

  const version = extractOpenApiVersion(bundledDocument);
  return formatValidationErrors(errors, version);
}
