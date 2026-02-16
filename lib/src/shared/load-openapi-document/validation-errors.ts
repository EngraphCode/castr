/**
 * Validation error formatting utilities for friendly, helpful error messages.
 *
 * Per RULES.md: "Fail fast, fail hard, be strict at all times"
 * But also be HELPFUL - show users exactly what's wrong and how to fix it.
 *
 * @module
 * @internal
 */

import { drop, endsWith, includes, join, split, startsWith, toLower } from 'lodash-es';

const ROOT_EMPTY_PATH = '' as const;
const ROOT_SLASH_PATH = '/' as const;
const READABLE_ROOT = '(root)' as const;
const PATH_SEPARATOR = '/' as const;
const PATH_DISPLAY_SEPARATOR = ' → ' as const;
const RESPONSES_SEGMENT = 'responses' as const;
const INFO_SUFFIX = '/info' as const;
const PATHS_PATH = '/paths' as const;
const TYPE_SUFFIX = '/type' as const;
const JSON_SCHEMA_DIALECT_TOKEN = 'jsonschemadialect' as const;
const WEBHOOKS_TOKEN = 'webhooks' as const;
const REQUIRED_PROPERTY_TOKEN = 'required property' as const;
const TYPE_ALLOWED_VALUES_TOKEN = 'equal to one of the allowed values' as const;
const NOT_EXPECTED_TOKEN = 'not expected' as const;
const NOT_ALLOWED_TOKEN = 'not allowed' as const;
const REF_REQUIRED_SINGLE_QUOTE = "required property '$ref'" as const;
const REF_REQUIRED_DOUBLE_QUOTE = 'required property "$ref"' as const;
const JSON_POINTER_ESCAPED_SLASH = '~1' as const;
const JSON_POINTER_ESCAPED_TILDE = '~0' as const;
const TILDE_TOKEN = '~' as const;
const OPENAPI_KEY = 'openapi' as const;
const NEWLINE_TOKEN = '\n' as const;
const ERROR_HEADER_PREFIX = '\n❌ Error ' as const;
const LOCATION_PREFIX = '  Location: ' as const;
const ISSUE_PREFIX = '  Issue: ' as const;
const HINT_PREFIX = '  Hint: ' as const;
const INVALID_OPENAPI_WITH_VERSION_PREFIX = 'Invalid OpenAPI ' as const;
const INVALID_OPENAPI_WITH_VERSION_SUFFIX = ' document:\n' as const;
const INVALID_OPENAPI_GENERIC_HEADER = 'Invalid OpenAPI document:\n' as const;

function replaceTokenEverywhere(text: string, token: string, replacement: string): string {
  return join(split(text, token), replacement);
}

function parsePointerSegments(path: string): string[] {
  if (startsWith(path, PATH_SEPARATOR)) {
    return drop(split(path, PATH_SEPARATOR), 1);
  }
  return split(path, PATH_SEPARATOR);
}

function normalizeMessage(message: string): string {
  return toLower(message);
}

function containsNormalizedToken(message: string, token: string): boolean {
  return includes(normalizeMessage(message), token);
}

function isNumericText(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Number(value));
}

/**
 * Check if a path ends with a response status code pattern (e.g., /responses/200)
 */
function isResponsePath(path: string): boolean {
  const segments = parsePointerSegments(path);
  const lastIndex = segments.length - 1;
  if (lastIndex < 2) {
    return false;
  }
  const parentSegment = segments[lastIndex - 1];
  const lastSegment = segments[lastIndex];
  return parentSegment === RESPONSES_SEGMENT && isNumericText(lastSegment ?? ROOT_EMPTY_PATH);
}

/**
 * Check if message contains "required property" (case insensitive)
 */
function isRequiredPropertyError(message: string): boolean {
  return containsNormalizedToken(message, REQUIRED_PROPERTY_TOKEN);
}

/**
 * Check if message contains type value error patterns
 */
function isTypeValueError(message: string): boolean {
  return containsNormalizedToken(message, TYPE_ALLOWED_VALUES_TOKEN);
}

/**
 * Check if message contains not expected/not allowed error patterns
 */
function isNotAllowedError(message: string): boolean {
  return (
    containsNormalizedToken(message, NOT_EXPECTED_TOKEN) ||
    containsNormalizedToken(message, NOT_ALLOWED_TOKEN)
  );
}

/**
 * Check if path is in components/schemas
 */
function isSchemaPath(path: string): boolean {
  return includes(path, '/components/schemas/');
}

/**
 * Check if message is about missing $ref (AJV validation quirk)
 */
function isMissingRefError(message: string): boolean {
  const normalized = normalizeMessage(message);
  return (
    includes(normalized, REF_REQUIRED_SINGLE_QUOTE) ||
    includes(normalized, REF_REQUIRED_DOUBLE_QUOTE)
  );
}

function pathContainsTokenCaseInsensitive(path: string, token: string): boolean {
  return includes(toLower(path), token);
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
    pathMatcher: isSchemaPath,
    messageMatcher: isMissingRefError,
    hint:
      "This often means the schema uses OpenAPI 3.1 syntax (like 'type: null' in anyOf) in a 3.0.x document. " +
      "Either upgrade to 'openapi: 3.1.0' or use 'nullable: true' instead of 'type: null'.",
  },
  {
    pathMatcher: isResponsePath,
    messageMatcher: isRequiredPropertyError,
    hint: "Response objects require a 'description' field (OpenAPI 3.0.x and 3.1.x)",
  },
  {
    pathMatcher: (path) => endsWith(path, INFO_SUFFIX),
    messageMatcher: isRequiredPropertyError,
    hint: "The 'info' object requires 'title' and 'version' fields",
  },
  {
    pathMatcher: (path) => path === PATHS_PATH,
    messageMatcher: isRequiredPropertyError,
    hint: "The 'paths' field is required in OpenAPI 3.0.x (optional in 3.1.x if webhooks or components present)",
  },
  {
    pathMatcher: (path) => endsWith(path, TYPE_SUFFIX),
    messageMatcher: isTypeValueError,
    hint: "In 3.0.x, 'type' must be: array, boolean, integer, number, object, or string. 'null' is 3.1.x only",
  },
  {
    pathMatcher: (path) => pathContainsTokenCaseInsensitive(path, JSON_SCHEMA_DIALECT_TOKEN),
    messageMatcher: isNotAllowedError,
    hint: "'jsonSchemaDialect' is only valid in OpenAPI 3.1.x",
  },
  {
    pathMatcher: (path) => pathContainsTokenCaseInsensitive(path, WEBHOOKS_TOKEN),
    messageMatcher: isNotAllowedError,
    hint: "'webhooks' is only valid in OpenAPI 3.1.x",
  },
];

function unescapePointerSegment(segment: string): string {
  const withSlashes = replaceTokenEverywhere(segment, JSON_POINTER_ESCAPED_SLASH, PATH_SEPARATOR);
  return replaceTokenEverywhere(withSlashes, JSON_POINTER_ESCAPED_TILDE, TILDE_TOKEN);
}

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
  if (path === ROOT_EMPTY_PATH || path === ROOT_SLASH_PATH) {
    return READABLE_ROOT;
  }

  const segments = parsePointerSegments(path);
  const unescapedSegments = segments.map((segment) => unescapePointerSegment(segment));
  return join(unescapedSegments, PATH_DISPLAY_SEPARATOR);
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
 */
export function formatValidationError(error: ValidationError): string {
  const location = formatValidationPath(error.path);
  const hint = getValidationHint(error.message, error.path);
  const lines = [`${LOCATION_PREFIX}${location}`, `${ISSUE_PREFIX}${error.message}`];

  if (hint !== undefined) {
    lines.push(`${HINT_PREFIX}${hint}`);
  }

  return join(lines, NEWLINE_TOKEN);
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
      ? `${INVALID_OPENAPI_WITH_VERSION_PREFIX}${version}${INVALID_OPENAPI_WITH_VERSION_SUFFIX}`
      : INVALID_OPENAPI_GENERIC_HEADER;

  const formattedErrors = errors.map((error, index) => {
    const errorHeader = `${ERROR_HEADER_PREFIX}${index + 1}:`;
    return `${errorHeader}${NEWLINE_TOKEN}${formatValidationError(error)}`;
  });

  return header + join(formattedErrors, NEWLINE_TOKEN);
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
  if (OPENAPI_KEY in document) {
    const openapi = document.openapi;
    if (typeof openapi === 'string') {
      return openapi;
    }
  }
  return undefined;
}

/**
 * Create formatted validation error message from Scalar validation result.
 */
export function createValidationErrorMessage(
  scalarErrors: readonly ScalarValidationError[] | undefined,
  bundledDocument: unknown,
): string {
  const errors: readonly ValidationError[] =
    scalarErrors?.map((e) => ({
      message: e.message,
      path: e.path ?? ROOT_EMPTY_PATH,
    })) ?? [];

  const version = extractOpenApiVersion(bundledDocument);
  return formatValidationErrors(errors, version);
}
