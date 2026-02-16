/**
 * Schema Name Registry
 *
 * Centralized naming rules for deriving schema component names from
 * declaration identifiers.
 *
 * @module parsers/zod/schema-name-registry
 */

/**
 * Recognized schema variable suffixes, checked in order.
 *
 * @internal
 */
export const SCHEMA_SUFFIXES = ['Schema', 'schema'] as const;

function hasSuffix(value: string, suffix: string): boolean {
  if (value.length <= suffix.length) {
    return false;
  }

  for (let i = 1; i <= suffix.length; i++) {
    const valueCode = value.charCodeAt(value.length - i);
    const suffixCode = suffix.charCodeAt(suffix.length - i);

    if (valueCode !== suffixCode) {
      return false;
    }
  }

  return true;
}

function stripSuffix(value: string, suffixLength: number): string {
  const endIndex = value.length - suffixLength;
  let result = '';

  for (let i = 0; i < endIndex; i++) {
    result += value[i] ?? '';
  }

  return result;
}

/**
 * Derive a component name from a schema variable identifier.
 *
 * @param variableName - Source identifier name
 * @returns Component name with recognized suffix removed
 *
 * @example
 * ```typescript
 * deriveComponentName('UserSchema'); // 'User'
 * deriveComponentName('userSchema'); // 'user'
 * deriveComponentName('Pet'); // 'Pet'
 * ```
 *
 * @public
 */
export function deriveComponentName(variableName: string): string {
  for (const suffix of SCHEMA_SUFFIXES) {
    if (hasSuffix(variableName, suffix)) {
      return stripSuffix(variableName, suffix.length);
    }
  }

  return variableName;
}
