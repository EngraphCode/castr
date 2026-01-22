/**
 * Identifier Utilities
 *
 * Uses TypeScript's compiler API for identifier validation.
 * Uses lodash for identifier transformation.
 *
 * @module shared/utils/identifier-utils
 */

import { isIdentifierStart, isIdentifierPart, ScriptTarget } from 'typescript';
import { words } from 'lodash-es';

/**
 * TypeScript reserved words that cannot be used as identifiers.
 * @internal
 */
const RESERVED_WORDS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'let',
  'static',
  'await',
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
]);

/**
 * JavaScript built-in globals that should not be shadowed by generated code.
 * These are not reserved words but using them as variable names will
 * shadow the built-in and cause unexpected behavior.
 * @internal
 */
const BUILTIN_GLOBALS = new Set([
  // Error types
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'EvalError',
  'URIError',
  'AggregateError',
  // Fundamental objects
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'BigInt',
  'Function',
  // Collections
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  // Typed arrays and buffers
  'ArrayBuffer',
  'DataView',
  'Int8Array',
  'Uint8Array',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  // Other built-ins
  'Date',
  'RegExp',
  'Promise',
  'Proxy',
  'Reflect',
  'JSON',
  'Math',
  'Intl',
  'console',
  'undefined',
  'NaN',
  'Infinity',
]);

/**
 * Make a schema name safe by adding 'Schema' suffix if it would shadow
 * a JavaScript built-in global.
 *
 * Unlike toIdentifier, this function does NOT transform the name in any
 * other way — it only adds a suffix for built-in globals.
 *
 * @param name - Schema name to check
 * @returns Safe schema name (with 'Schema' suffix if needed)
 *
 * @example
 * ```typescript
 * safeSchemaName('Error');       // 'ErrorSchema'
 * safeSchemaName('Date');        // 'DateSchema'
 * safeSchemaName('User');        // 'User' (unchanged)
 * safeSchemaName('Basic.Thing'); // 'Basic.Thing' (unchanged)
 * ```
 *
 * @public
 */
export function safeSchemaName(name: string): string {
  if (BUILTIN_GLOBALS.has(name)) {
    return `${name}Schema`;
  }
  return name;
}

/**
 * Check if a string is a valid JavaScript identifier.
 * Uses TypeScript's built-in isIdentifierStart and isIdentifierPart.
 *
 * @param name - String to check
 * @returns true if the string is a valid identifier
 *
 * @example
 * ```typescript
 * isValidJsIdentifier('foo');     // true
 * isValidJsIdentifier('foo-bar'); // false
 * isValidJsIdentifier('123foo');  // false
 * ```
 *
 * @public
 */
export function isValidJsIdentifier(name: string): boolean {
  if (name.length === 0) {
    return false;
  }

  const firstCode = name.codePointAt(0);
  if (firstCode === undefined || !isIdentifierStart(firstCode, ScriptTarget.ESNext)) {
    return false;
  }

  for (let i = 1; i < name.length; i++) {
    const code = name.codePointAt(i);
    if (code === undefined || !isIdentifierPart(code, ScriptTarget.ESNext)) {
      return false;
    }
  }

  return true;
}

/**
 * Convert a string to a valid JavaScript identifier.
 * If already valid, returns unchanged (preserves original formatting).
 * Otherwise uses lodash's words for tokenization while preserving case.
 * Adds underscore prefix for names starting with digits.
 * Adds underscore suffix for reserved words.
 *
 * @param name - String to convert
 * @returns Valid JavaScript identifier
 *
 * @example
 * ```typescript
 * toIdentifier('User');                // 'User' (unchanged)
 * toIdentifier('IsActive');            // 'IsActive' (unchanged)
 * toIdentifier('perform-search_Body'); // 'perform_search_Body'
 * toIdentifier('123test');             // '_123test'
 * toIdentifier('class');               // 'class_'
 * ```
 *
 * @public
 */
export function toIdentifier(name: string): string {
  const trimmed = name.trim();

  // If already a valid identifier, return it (unless it's a reserved word)
  if (isValidJsIdentifier(trimmed) && !RESERVED_WORDS.has(trimmed)) {
    return trimmed;
  }

  // If it's a reserved word, add underscore suffix
  if (RESERVED_WORDS.has(trimmed)) {
    return `${trimmed}_`;
  }

  // Use lodash words to tokenize, then join with underscore (preserves case)
  const tokens = words(trimmed);
  const result = tokens.join('_');

  // Handle empty result
  if (result.length === 0) {
    return '_';
  }

  // Apply final fixes and return
  return applyIdentifierFixes(result);
}

/**
 * Apply final fixes to make an identifier valid.
 * @internal
 */
function applyIdentifierFixes(identifier: string): string {
  let result = identifier;

  // Handle starting with a digit
  const firstCode = result.codePointAt(0);
  if (firstCode !== undefined && firstCode >= 0x30 && firstCode <= 0x39) {
    result = `_${result}`;
  }

  // Handle reserved words (after transformation)
  if (RESERVED_WORDS.has(result)) {
    result = `${result}_`;
  }

  return result;
}
