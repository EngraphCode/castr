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
// eslint-disable-next-line complexity -- Multiple ref formats require conditional checks
export function parseComponentRef(ref: string): ParsedRef {
  // Try standard format first: #/components/{type}/{name}
  const standardPattern = /^#\/components\/([^/]+)\/(.+)$/;
  const standardMatch = standardPattern.exec(ref);

  if (standardMatch && standardMatch[1] && standardMatch[2]) {
    return {
      componentType: standardMatch[1],
      componentName: standardMatch[2],
      isExternal: false,
      originalRef: ref,
    };
  }

  // Try x-ext format: #/x-ext/{hash}/components/{type}/{name}
  const xExtPattern = /^#\/x-ext\/([^/]+)\/components\/([^/]+)\/(.+)$/;
  const xExtMatch = xExtPattern.exec(ref);

  if (xExtMatch && xExtMatch[1] && xExtMatch[2] && xExtMatch[3]) {
    return {
      componentType: xExtMatch[2],
      componentName: xExtMatch[3],
      isExternal: true,
      xExtKey: xExtMatch[1],
      originalRef: ref,
    };
  }

  // Backward compatibility: Support malformed refs missing the leading slash
  // Pattern: #components/{type}/{name} (should be #/components/{type}/{name})
  const legacyPattern = /^#components\/([^/]+)\/(.+)$/;
  const legacyMatch = legacyPattern.exec(ref);

  if (legacyMatch && legacyMatch[1] && legacyMatch[2]) {
    return {
      componentType: legacyMatch[1],
      componentName: legacyMatch[2],
      isExternal: false,
      originalRef: ref,
    };
  }

  // Backward compatibility: Treat strings without '#/' as bare schema names
  // This maintains compatibility with existing code that passes bare names
  if (!ref.startsWith('#')) {
    return {
      componentType: 'schemas',
      componentName: ref,
      isExternal: false,
      originalRef: ref,
    };
  }

  // Neither format matched - throw with helpful error
  throw new Error(
    `Invalid component $ref: ${ref}. ` +
      `Expected format: #/components/{type}/{name} or #/x-ext/{hash}/components/{type}/{name}`,
  );
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
