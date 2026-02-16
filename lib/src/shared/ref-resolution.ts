/**
 * Centralized utilities for resolving OpenAPI component $refs.
 *
 * Supports both:
 * - Standard OpenAPI refs: `#/components/{type}/{name}`
 * - Scalar's x-ext vendor extension: `#/x-ext/{hash}/components/{type}/{name}`
 *
 * The x-ext format preserves file provenance in multi-file specs while
 * maintaining backward compatibility with single-file specs.
 *
 * @module ref-resolution
 * @see {@link https://github.com/scalar/scalar} - Scalar bundler documentation
 */

import { drop, join, split, startsWith } from 'lodash-es';

const STANDARD_PREFIX = '#/components/' as const;
const X_EXT_PREFIX = '#/x-ext/' as const;
const LEGACY_PREFIX = '#components/' as const;
const HASH_PREFIX = '#' as const;
const COMPONENTS_SEGMENT = 'components' as const;
const STANDARD_LEADING_SEGMENT = '#';
const LEGACY_LEADING_SEGMENT = '#components' as const;
const X_EXT_SEGMENT = 'x-ext' as const;
const STANDARD_BARE_COMPONENT_TYPE = 'schemas' as const;
const SLASH_TOKEN = '/' as const;
const STANDARD_MIN_SEGMENT_COUNT = 4;
const X_EXT_MIN_SEGMENT_COUNT = 6;
const LEGACY_MIN_SEGMENT_COUNT = 3;
const STANDARD_COMPONENTS_SEGMENT_INDEX = 1;
const STANDARD_COMPONENT_TYPE_INDEX = 2;
const STANDARD_COMPONENT_NAME_START_INDEX = 3;
const X_EXT_SEGMENT_INDEX = 1;
const X_EXT_KEY_INDEX = 2;
const X_EXT_COMPONENTS_INDEX = 3;
const X_EXT_COMPONENT_TYPE_INDEX = 4;
const X_EXT_COMPONENT_NAME_START_INDEX = 5;
const LEGACY_COMPONENT_TYPE_INDEX = 1;
const LEGACY_COMPONENT_NAME_START_INDEX = 2;

function isValidXExtLeadingSegments(parts: string[]): boolean {
  return (
    parts[0] === STANDARD_LEADING_SEGMENT &&
    parts[X_EXT_SEGMENT_INDEX] === X_EXT_SEGMENT &&
    parts[X_EXT_COMPONENTS_INDEX] === COMPONENTS_SEGMENT
  );
}

/**
 * Parsed representation of an OpenAPI component $ref.
 *
 * Distinguishes between standard refs and external refs (Scalar's x-ext format)
 * to enable proper component lookup in multi-file specifications.
 *
 * @example Standard ref
 * ```typescript
 * const parsed = parseComponentRef('#/components/schemas/Pet');
 * // {
 * //   componentType: 'schemas',
 * //   componentName: 'Pet',
 * //   isExternal: false,
 * //   originalRef: '#/components/schemas/Pet'
 * // }
 * ```
 *
 * @example External ref (x-ext)
 * ```typescript
 * const parsed = parseComponentRef('#/x-ext/425563c/components/schemas/Pet');
 * // {
 * //   componentType: 'schemas',
 * //   componentName: 'Pet',
 * //   isExternal: true,
 * //   xExtKey: '425563c',
 * //   originalRef: '#/x-ext/425563c/components/schemas/Pet'
 * // }
 * ```
 *
 * @public
 */
export interface ParsedRef {
  /**
   * Component type (schemas, parameters, responses, requestBodies, etc.)
   */
  componentType: string;

  /**
   * Component name within the type
   */
  componentName: string;

  /**
   * Whether this ref points to an external file (x-ext format)
   */
  isExternal: boolean;

  /**
   * Hash key for x-ext lookup (only present when isExternal is true)
   */
  xExtKey?: string;

  /**
   * Original $ref string (preserved for error messages)
   */
  originalRef: string;
}

/**
 * Parse an OpenAPI component $ref into its constituent parts.
 *
 * Supports both standard OpenAPI refs and Scalar's x-ext vendor extension format
 * for multi-file specifications. Uses fail-fast error handling with clear messages.
 *
 * For backward compatibility, also accepts bare component names (without '#/')
 * which are treated as standard schema refs.
 *
 * @param ref - The $ref string to parse, or a bare component name
 * @returns Parsed ref with component type, name, and location metadata
 *
 * @throws {Error} When ref format is invalid or missing required parts
 *
 * @example Parse standard schema ref
 * ```typescript
 * const parsed = parseComponentRef('#/components/schemas/Pet');
 * console.log(parsed.componentName); // 'Pet'
 * console.log(parsed.isExternal); // false
 * ```
 *
 * @example Parse x-ext ref from multi-file spec
 * ```typescript
 * const parsed = parseComponentRef('#/x-ext/425563c/components/schemas/Pet');
 * console.log(parsed.componentName); // 'Pet'
 * console.log(parsed.isExternal); // true
 * console.log(parsed.xExtKey); // '425563c'
 * ```
 *
 * @example Parse bare component name (backward compatibility)
 * ```typescript
 * const parsed = parseComponentRef('Pet');
 * console.log(parsed.componentName); // 'Pet'
 * console.log(parsed.componentType); // 'schemas'
 * console.log(parsed.isExternal); // false
 * ```
 *
 * @example Handle error cases
 * ```typescript
 * try {
 *   parseComponentRef('#invalid-ref-format');
 * } catch (error) {
 *   console.error(error.message);
 *   // "Invalid component $ref: #invalid-ref-format.
 *   //  Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}"
 * }
 * ```
 *
 * @see {@link ParsedRef} for returned structure
 * @see {@link getSchemaNameFromRef} for convenience function
 *
 * @public
 */
// Break down the logic into smaller, pure functions to make it easier to understand
export function parseComponentRef(ref: string): ParsedRef {
  const standard = tryParseStandardRef(ref);
  if (standard) {
    return standard;
  }

  const xExt = tryParseXExtRef(ref);
  if (xExt) {
    return xExt;
  }

  const legacy = tryParseLegacyRef(ref);
  if (legacy) {
    return legacy;
  }

  const bare = tryParseBareRef(ref);
  if (bare) {
    return bare;
  }

  throw new Error(
    `Invalid component $ref: ${ref}. ` +
      `Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}`,
  );
}

function tryParseStandardRef(ref: string): ParsedRef | null {
  // Standard format: #/components/{type}/{name}
  if (!startsWith(ref, STANDARD_PREFIX)) {
    return null;
  }

  const parts = split(ref, SLASH_TOKEN);
  if (parts.length < STANDARD_MIN_SEGMENT_COUNT) {
    return null;
  }

  if (
    parts[0] !== STANDARD_LEADING_SEGMENT ||
    parts[STANDARD_COMPONENTS_SEGMENT_INDEX] !== COMPONENTS_SEGMENT
  ) {
    return null;
  }

  const componentType = parts[STANDARD_COMPONENT_TYPE_INDEX] ?? '';
  const componentName = join(drop(parts, STANDARD_COMPONENT_NAME_START_INDEX), SLASH_TOKEN);

  if (componentType && componentName) {
    return {
      componentType,
      componentName,
      isExternal: false,
      originalRef: ref,
    };
  }
  return null;
}

function tryParseXExtRef(ref: string): ParsedRef | null {
  // X-ext format: #/x-ext/{hash}/components/{type}/{name}
  if (!startsWith(ref, X_EXT_PREFIX)) {
    return null;
  }

  const parts = split(ref, SLASH_TOKEN);
  if (parts.length < X_EXT_MIN_SEGMENT_COUNT) {
    return null;
  }

  if (!isValidXExtLeadingSegments(parts)) {
    return null;
  }

  const xExtKey = parts[X_EXT_KEY_INDEX];
  const componentType = parts[X_EXT_COMPONENT_TYPE_INDEX];
  const componentName = join(drop(parts, X_EXT_COMPONENT_NAME_START_INDEX), SLASH_TOKEN);

  if (xExtKey && componentType && componentName) {
    return {
      componentType,
      componentName,
      isExternal: true,
      xExtKey,
      originalRef: ref,
    };
  }
  return null;
}

function tryParseLegacyRef(ref: string): ParsedRef | null {
  // Legacy format: #components/{type}/{name} (without leading slash)
  if (!startsWith(ref, LEGACY_PREFIX)) {
    return null;
  }

  const parts = split(ref, SLASH_TOKEN);
  if (parts.length < LEGACY_MIN_SEGMENT_COUNT) {
    return null;
  }

  if (parts[0] !== LEGACY_LEADING_SEGMENT) {
    return null;
  }

  const componentType = parts[LEGACY_COMPONENT_TYPE_INDEX] ?? '';
  const componentName = join(drop(parts, LEGACY_COMPONENT_NAME_START_INDEX), SLASH_TOKEN);

  if (componentType && componentName) {
    return {
      componentType,
      componentName,
      isExternal: false,
      originalRef: ref,
    };
  }
  return null;
}

function tryParseBareRef(ref: string): ParsedRef | null {
  if (!startsWith(ref, HASH_PREFIX)) {
    return {
      componentType: STANDARD_BARE_COMPONENT_TYPE,
      componentName: ref,
      isExternal: false,
      originalRef: ref,
    };
  }
  return null;
}

/**
 * Extract the component name from a $ref string.
 *
 * Convenience wrapper around {@link parseComponentRef} that returns only the name.
 * Works with both standard and x-ext ref formats.
 *
 * @param ref - The $ref string to extract the name from
 * @returns The component name
 *
 * @throws {Error} When ref format is invalid
 *
 * @example Standard ref
 * ```typescript
 * const name = getSchemaNameFromRef('#/components/schemas/Pet');
 * console.log(name); // 'Pet'
 * ```
 *
 * @example X-ext ref
 * ```typescript
 * const name = getSchemaNameFromRef('#/x-ext/425563c/components/schemas/Pet');
 * console.log(name); // 'Pet'
 * ```
 *
 * @see {@link parseComponentRef} for full parsing with metadata
 *
 * @public
 */
export function getSchemaNameFromRef(ref: string): string {
  const parsed = parseComponentRef(ref);
  return parsed.componentName;
}
