/**
 * Type guards for CLI option validation
 *
 * These guards ensure CLI string options conform to expected literal types
 * without using type assertions.
 */

import type { OpenAPIDocument } from '../shared/openapi-types.js';

type UnknownObject = Record<PropertyKey, unknown>;

/**
 * Valid group strategy values per CLI documentation
 */
const GROUP_STRATEGIES = ['none', 'tag', 'method', 'tag-file', 'method-file'] as const;
type GroupStrategy = (typeof GROUP_STRATEGIES)[number];

/**
 * Type guard to check if a value is a valid group strategy
 *
 * @param value - Value to check (typically from CLI options)
 * @returns True if the value is a valid GroupStrategy
 */
export function isGroupStrategy(value: unknown): value is GroupStrategy {
  if (typeof value !== 'string') {
    return false;
  }
  for (const strategy of GROUP_STRATEGIES) {
    if (value === strategy) {
      return true;
    }
  }
  return false;
}

/**
 * Valid default status behavior values per CLI documentation
 */
const DEFAULT_STATUS_BEHAVIORS = ['spec-compliant', 'auto-correct'] as const;
type DefaultStatusBehavior = (typeof DEFAULT_STATUS_BEHAVIORS)[number];

/**
 * Type guard to check if a value is a valid default status behavior
 *
 * @param value - Value to check (typically from CLI options)
 * @returns True if the value is a valid DefaultStatusBehavior
 */
export function isDefaultStatusBehavior(value: unknown): value is DefaultStatusBehavior {
  if (typeof value !== 'string') {
    return false;
  }
  for (const behavior of DEFAULT_STATUS_BEHAVIORS) {
    if (value === behavior) {
      return true;
    }
  }
  return false;
}

/**
 * Type guard to validate package.json structure
 *
 * @param obj - Parsed JSON object
 * @returns True if the object has a valid version property
 */
export function hasVersionProperty(obj: unknown): obj is { version?: unknown } {
  return typeof obj === 'object' && obj !== null;
}

function isObjectLike(value: unknown): value is UnknownObject {
  return typeof value === 'object' && value !== null;
}

function hasStringProperty(obj: object, key: string): boolean {
  return typeof Reflect.get(obj, key) === 'string';
}

function hasValidInfoObject(value: unknown): boolean {
  return (
    isObjectLike(value) && hasStringProperty(value, 'title') && hasStringProperty(value, 'version')
  );
}

function hasValidServer(value: unknown): boolean {
  return isObjectLike(value) && hasStringProperty(value, 'url');
}

function hasValidServers(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.every(hasValidServer));
}

/**
 * Checks for required structural fields (openapi version string + info object).
 * @internal
 */
function hasRequiredOpenApiFields(obj: object): boolean {
  return (
    hasStringProperty(obj, 'openapi') &&
    hasValidInfoObject(Reflect.get(obj, 'info')) &&
    hasValidServers(Reflect.get(obj, 'servers'))
  );
}

/**
 * Checks that the document has at least one content section (paths, webhooks, or components).
 * OAS 3.1+: Either paths or webhooks must be present (or both). Components-only is also valid.
 * @internal
 */
function hasDocumentContent(obj: object): boolean {
  const hasPaths = 'paths' in obj && typeof obj.paths === 'object';
  const hasWebhooks = 'webhooks' in obj && typeof obj.webhooks === 'object';
  const hasComponents = 'components' in obj && typeof obj.components === 'object';
  return hasPaths || hasWebhooks || hasComponents;
}

/**
 * Type guard to check if an object is a valid OpenAPIDocument
 *
 * Performs minimal structural validation to distinguish raw loader output from
 * the canonical downstream OpenAPI document shape.
 *
 * Note: In OpenAPI 3.1+, `paths` is optional if `webhooks` is present. A valid
 * document can have just `webhooks` (e.g., webhook-example.yaml).
 *
 * @param obj - Object to check (typically from SwaggerParser.bundle())
 * @returns True if the object has required OpenAPI properties
 */
export function isOpenAPIDocument(obj: unknown): obj is OpenAPIDocument {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return hasRequiredOpenApiFields(obj) && hasDocumentContent(obj);
}

/**
 * This module intentionally exports a single canonical document guard.
 */
