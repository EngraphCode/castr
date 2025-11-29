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
  const standardPattern = /^#\/components\/([^/]+)\/(.+)$/;
  const match = standardPattern.exec(ref);

  if (match && match[1] && match[2]) {
    return {
      componentType: match[1],
      componentName: match[2],
      isExternal: false,
      originalRef: ref,
    };
  }
  return null;
}

function tryParseXExtRef(ref: string): ParsedRef | null {
  const xExtPattern = /^#\/x-ext\/([^/]+)\/components\/([^/]+)\/(.+)$/;
  const match = xExtPattern.exec(ref);

  if (match && match[1] && match[2] && match[3]) {
    return {
      componentType: match[2],
      componentName: match[3],
      isExternal: true,
      xExtKey: match[1],
      originalRef: ref,
    };
  }
  return null;
}

function tryParseLegacyRef(ref: string): ParsedRef | null {
  const legacyPattern = /^#components\/([^/]+)\/(.+)$/;
  const match = legacyPattern.exec(ref);

  if (match && match[1] && match[2]) {
    return {
      componentType: match[1],
      componentName: match[2],
      isExternal: false,
      originalRef: ref,
    };
  }
  return null;
}

function tryParseBareRef(ref: string): ParsedRef | null {
  if (!ref.startsWith('#')) {
    return {
      componentType: 'schemas',
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
