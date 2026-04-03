/**
 * Validation error formatting utilities for friendly, helpful error messages.
 *
 * Per principles.md: "Fail fast, fail hard, be strict at all times"
 * But also be HELPFUL - show users exactly what's wrong and how to fix it.
 *
 * @module
 * @internal
 */

import { drop, endsWith, includes, join, split, startsWith, toLower } from 'lodash-es';

const ROOT_EMPTY_PATH = '';
const ROOT_SLASH_PATH = '/';
const READABLE_ROOT = '(root)';
const PATH_SEPARATOR = '/';
const PATH_DISPLAY_SEPARATOR = ' → ';
const RESPONSES_SEGMENT = 'responses';
const INFO_SUFFIX = '/info';
const PATHS_PATH = '/paths';
const TYPE_SUFFIX = '/type';
const JSON_SCHEMA_DIALECT_TOKEN = 'jsonschemadialect';
const WEBHOOKS_TOKEN = 'webhooks';
const REQUIRED_PROPERTY_TOKEN = 'required property';
const TYPE_ALLOWED_VALUES_TOKEN = 'equal to one of the allowed values';
const NOT_EXPECTED_TOKEN = 'not expected';
const NOT_ALLOWED_TOKEN = 'not allowed';
const REF_REQUIRED_SINGLE_QUOTE = "required property '$ref'";
const REF_REQUIRED_DOUBLE_QUOTE = 'required property "$ref"';
const JSON_POINTER_ESCAPED_SLASH = '~1';
const JSON_POINTER_ESCAPED_TILDE = '~0';
const TILDE_TOKEN = '~';
const OPENAPI_KEY = 'openapi';
const NEWLINE_TOKEN = '\n';
const ERROR_HEADER_PREFIX = '\n❌ Error ';
const LOCATION_PREFIX = '  Location: ';
const ISSUE_PREFIX = '  Issue: ';
const HINT_PREFIX = '  Hint: ';
const INVALID_OPENAPI_WITH_VERSION_PREFIX = 'Invalid OpenAPI ';
const INVALID_OPENAPI_WITH_VERSION_SUFFIX = ' document:\n';
const INVALID_OPENAPI_GENERIC_HEADER = 'Invalid OpenAPI document:\n';

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
 * Check if message contains 'required property' or 'oneOf' validation error
 * (Missing description in responses triggers a oneOf error in OpenAPI 3.0 schemas)
 */
function isRequiredPropertyOrOneOfError(message: string): boolean {
  const norm = normalizeMessage(message);
  return includes(norm, REQUIRED_PROPERTY_TOKEN) || includes(norm, 'oneof');
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
      "This often means the schema uses OpenAPI 3.1+ syntax (like 'type: null' in anyOf) in a 3.0.x document. " +
      "Either upgrade to \"openapi: '3.2.0'\" or use 'nullable: true' instead of 'type: null'.",
  },
  {
    pathMatcher: isResponsePath,
    messageMatcher: isRequiredPropertyOrOneOfError,
    hint: "Response objects require a 'description' field (OpenAPI 3.0.x, 3.1.x, and 3.2.x)",
  },
  {
    pathMatcher: (path) => endsWith(path, INFO_SUFFIX),
    messageMatcher: isRequiredPropertyOrOneOfError,
    hint: "The 'info' object requires 'title' and 'version' fields",
  },
  {
    pathMatcher: (path) => path === PATHS_PATH,
    messageMatcher: isRequiredPropertyOrOneOfError,
    hint: "The 'paths' field is required in OpenAPI 3.0.x (optional in OpenAPI 3.1.x and 3.2.x if webhooks or components are present)",
  },
  {
    pathMatcher: (path) => endsWith(path, TYPE_SUFFIX),
    messageMatcher: isTypeValueError,
    hint: "In 3.0.x, 'type' must be: array, boolean, integer, number, object, or string. 'null' is only valid in OpenAPI 3.1.x and 3.2.x",
  },
  {
    pathMatcher: (path) => pathContainsTokenCaseInsensitive(path, JSON_SCHEMA_DIALECT_TOKEN),
    messageMatcher: isNotAllowedError,
    hint: "'jsonSchemaDialect' is only valid in OpenAPI 3.1.x and 3.2.x",
  },
  {
    pathMatcher: (path) => pathContainsTokenCaseInsensitive(path, WEBHOOKS_TOKEN),
    messageMatcher: isNotAllowedError,
    hint: "'webhooks' is only valid in OpenAPI 3.1.x and 3.2.x",
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
 * // => "Response objects require a 'description' field (OpenAPI 3.0.x, 3.1.x, and 3.2.x)"
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
  readonly path?: string | readonly string[];
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

function getPathString(path: string | readonly string[] | undefined): string {
  if (typeof path === 'string') {
    return path;
  }
  if (Array.isArray(path)) {
    return join(path, PATH_SEPARATOR);
  }
  if (path != null) {
    return String(path);
  }
  return ROOT_EMPTY_PATH;
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
      path: getPathString(e.path),
    })) ?? [];

  const version = extractOpenApiVersion(bundledDocument);
  return formatValidationErrors(errors, version);
}
