import { parseComponentRef } from '../../../shared/ref-resolution.js';

const STANDARD_COMPONENT_REF_PREFIX = '#/components/' as const;
const X_EXT_COMPONENT_REF_PREFIX = '#/x-ext/' as const;
const EXPECTED_COMPONENT_REF_FORMAT =
  'Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}.' as const;

function hasPrefix(value: string, prefix: string): boolean {
  if (value.length < prefix.length) {
    return false;
  }

  for (let i = 0; i < prefix.length; i++) {
    if (value.charCodeAt(i) !== prefix.charCodeAt(i)) {
      return false;
    }
  }

  return true;
}

function hasSupportedComponentRefPrefix(refPath: string): boolean {
  return (
    hasPrefix(refPath, STANDARD_COMPONENT_REF_PREFIX) ||
    hasPrefix(refPath, X_EXT_COMPONENT_REF_PREFIX)
  );
}

/**
 * Track visited component refs and fail fast on cycles.
 * @internal
 */
export function assertNoCircularComponentRef(
  refPath: string,
  location: string,
  seenRefs: Set<string>,
  componentLabel: string,
): void {
  if (seenRefs.has(refPath)) {
    throw new Error(
      `Circular ${componentLabel} reference "${refPath}" at ${location}. ` +
        `${componentLabel} component refs must not form cycles.`,
    );
  }

  seenRefs.add(refPath);
}

/**
 * Parse a component ref and enforce component type.
 * @internal
 */
export function parseComponentNameForType(
  refPath: string,
  expectedComponentType: string,
  location: string,
  componentLabel: string,
  expectedRefPattern: string,
): string {
  if (!hasSupportedComponentRefPrefix(refPath)) {
    throw new Error(
      `Invalid ${componentLabel} reference "${refPath}" at ${location}. ${EXPECTED_COMPONENT_REF_FORMAT}`,
    );
  }

  let parsedRef;
  try {
    parsedRef = parseComponentRef(refPath);
  } catch (error) {
    throw new Error(
      `Invalid ${componentLabel} reference "${refPath}" at ${location}. ${describeUnknownError(error)}`,
    );
  }

  if (parsedRef.componentType !== expectedComponentType) {
    throw new Error(
      `Unsupported ${componentLabel} reference "${refPath}" at ${location}. ` +
        `Expected ${expectedRefPattern}.`,
    );
  }

  return parsedRef.componentName;
}

function describeUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
