/**
 * Zod 3 Syntax Detection
 *
 * Detects Zod 3 syntax patterns that are not compatible with Zod 4.
 * Provides clear error messages with migration guidance.
 *
 * @module parsers/zod/detection
 *
 * @example
 * ```typescript
 * import { detectZod3Syntax, isZod3Method } from './zod-parser.detection.js';
 *
 * // Check a single method name
 * if (isZod3Method('nonempty')) {
 *   console.log('Zod 3 method detected!');
 * }
 *
 * // Scan source code for Zod 3 patterns
 * const errors = detectZod3Syntax(sourceCode);
 * for (const error of errors) {
 *   console.error(`[${error.code}] ${error.message}`);
 * }
 * ```
 */

import type { ZodParseError } from './zod-parser.types.js';

/**
 * Zod 3 methods that are not available in Zod 4.
 *
 * Maps deprecated method names to their Zod 4 replacements.
 *
 * @internal
 */
const ZOD3_METHODS: ReadonlyMap<string, string> = new Map([
  ['nonempty', '.min(1)'],
  ['nonnegative', '.min(0)'],
  ['nonpositive', '.max(0)'],
]);

/**
 * Check if a method name is a deprecated Zod 3 method.
 *
 * @param methodName - The method name to check (without dot or parentheses)
 * @returns true if this is a Zod 3-only method
 *
 * @example
 * ```typescript
 * isZod3Method('nonempty');    // true
 * isZod3Method('nonnegative'); // true
 * isZod3Method('min');         // false
 * isZod3Method('email');       // false
 * ```
 *
 * @public
 */
export function isZod3Method(methodName: string): boolean {
  return ZOD3_METHODS.has(methodName);
}

/**
 * Get the Zod 4 replacement for a Zod 3 method.
 *
 * @param methodName - The Zod 3 method name
 * @returns The Zod 4 replacement, or undefined if not a Zod 3 method
 *
 * @internal
 */
function getZod4Replacement(methodName: string): string | undefined {
  return ZOD3_METHODS.get(methodName);
}

/**
 * Regular expression pattern to detect Zod 3 method calls.
 *
 * Matches patterns like:
 * - `.nonempty()`
 * - `.nonnegative()`
 * - `.nonpositive()`
 *
 * Captures the method name for reporting.
 *
 * @internal
 */
const ZOD3_METHOD_PATTERN = /\.(?<method>nonempty|nonnegative|nonpositive)\s*\(/g;

/**
 * Scan source code for Zod 3 syntax patterns.
 *
 * Returns errors for each Zod 3 method call found, with:
 * - Clear error message explaining the problem
 * - Suggested Zod 4 replacement
 * - Source location (line and column)
 *
 * @param source - TypeScript/JavaScript source code to analyze
 * @returns Array of parse errors for Zod 3 syntax found
 *
 * @example
 * ```typescript
 * const errors = detectZod3Syntax(`const s = z.string().nonempty();`);
 * // errors[0].message: "Zod 3 method '.nonempty()' is not supported. Use '.min(1)' instead."
 * // errors[0].code: 'ZOD3_SYNTAX'
 * ```
 *
 * @public
 */
export function detectZod3Syntax(source: string): ZodParseError[] {
  const errors: ZodParseError[] = [];
  const lines = source.split('\n');

  let lineNumber = 0;
  for (const line of lines) {
    lineNumber++;
    const pattern = new RegExp(ZOD3_METHOD_PATTERN.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line)) !== null) {
      // Extract method name from capture group (index 1)
      const methodName = match[1];
      if (methodName === undefined) {
        continue;
      }

      const replacement = getZod4Replacement(methodName);
      const column = match.index + 1; // 1-indexed

      errors.push({
        message: `Zod 3 method '.${methodName}()' is not supported in Zod 4. Use '${replacement ?? methodName}' instead.`,
        code: 'ZOD3_SYNTAX',
        location: {
          line: lineNumber,
          column,
        },
      });
    }
  }

  return errors;
}

/**
 * Regular expression pattern to detect computed property keys in z.object().
 *
 * Matches patterns like:
 * - `z.object({ [key]: value })`
 * - `z.object({ [expr]: value })`
 *
 * @internal
 */
// eslint-disable-next-line sonarjs/slow-regex -- Pattern is bounded by input length, not user-controlled
const COMPUTED_KEY_PATTERN = /z\.object\s*\(\s*\{[^}]*\[[^\]]+\]/g;

/**
 * Regular expression pattern to detect spread operator in z.object().
 *
 * Matches patterns like:
 * - `z.object({ ...spread })`
 * - `z.object({ ...base, key: value })`
 *
 * @internal
 */

const SPREAD_PATTERN = /z\.object\s*\(\s*\{[^}]*\.\.\./g;

/**
 * Scan source code for dynamic schema patterns that cannot be statically analyzed.
 *
 * Returns errors for:
 * - Computed property keys in z.object()
 * - Spread operators in z.object()
 *
 * @param source - TypeScript/JavaScript source code to analyze
 * @returns Array of parse errors for dynamic schemas found
 *
 * @example
 * ```typescript
 * const errors = detectDynamicSchemas(`const s = z.object({ [key]: z.string() });`);
 * // errors[0].code: 'DYNAMIC_SCHEMA'
 * // errors[0].message: "Computed property keys cannot be statically analyzed..."
 * ```
 *
 * @public
 */
export function detectDynamicSchemas(source: string): ZodParseError[] {
  const errors: ZodParseError[] = [];
  const lines = source.split('\n');

  let lineNumber = 0;
  for (const line of lines) {
    lineNumber++;

    // Check for computed property keys
    const computedPattern = new RegExp(COMPUTED_KEY_PATTERN.source, 'g');
    let computedMatch: RegExpExecArray | null;

    while ((computedMatch = computedPattern.exec(line)) !== null) {
      errors.push({
        message:
          'Computed property keys in z.object() cannot be statically analyzed. Use literal property names instead.',
        code: 'DYNAMIC_SCHEMA',
        location: {
          line: lineNumber,
          column: computedMatch.index + 1,
        },
      });
    }

    // Check for spread operators
    const spreadPattern = new RegExp(SPREAD_PATTERN.source, 'g');
    let spreadMatch: RegExpExecArray | null;

    while ((spreadMatch = spreadPattern.exec(line)) !== null) {
      errors.push({
        message:
          'Spread operators in z.object() cannot be statically analyzed. Define all properties inline instead.',
        code: 'DYNAMIC_SCHEMA',
        location: {
          line: lineNumber,
          column: spreadMatch.index + 1,
        },
      });
    }
  }

  return errors;
}
