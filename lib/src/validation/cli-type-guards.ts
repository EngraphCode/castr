/**
 * Type guards for CLI option validation
 *
 * These guards ensure CLI string options conform to expected literal types
 * without using type assertions.
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';

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
  const strategies: readonly string[] = GROUP_STRATEGIES;
  return strategies.includes(value);
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
  const behaviors: readonly string[] = DEFAULT_STATUS_BEHAVIORS;
  return behaviors.includes(value);
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

/**
 * Checks for required structural fields (openapi version string + info object).
 * @internal
 */
function hasRequiredOpenApiFields(obj: object): boolean {
  return (
    'openapi' in obj &&
    typeof obj.openapi === 'string' &&
    'info' in obj &&
    typeof obj.info === 'object'
  );
}

/**
 * Checks that the document has at least one content section (paths, webhooks, or components).
 * OAS 3.1: Either paths or webhooks must be present (or both). Components-only is also valid.
 * @internal
 */
function hasDocumentContent(obj: object): boolean {
  const hasPaths = 'paths' in obj && typeof obj.paths === 'object';
  const hasWebhooks = 'webhooks' in obj && typeof obj.webhooks === 'object';
  const hasComponents = 'components' in obj && typeof obj.components === 'object';
  return hasPaths || hasWebhooks || hasComponents;
}

/**
 * Type guard to check if an object is a valid OpenAPIObject
 *
 * Performs minimal structural validation to distinguish SwaggerParser's OpenAPI type
 * from openapi3-ts's OpenAPIObject. Both are structurally compatible.
 *
 * Note: In OpenAPI 3.1, `paths` is optional if `webhooks` is present. A valid
 * document can have just `webhooks` (e.g., webhook-example.yaml).
 *
 * @param obj - Object to check (typically from SwaggerParser.bundle())
 * @returns True if the object has required OpenAPI properties
 */
export function isOpenAPIObject(obj: unknown): obj is OpenAPIObject {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return hasRequiredOpenApiFields(obj) && hasDocumentContent(obj);
}
