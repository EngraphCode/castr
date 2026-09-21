/**
 * Identifier Utilities
 *
 * Uses TypeScript's compiler API for identifier validation.
 * Uses lodash for identifier transformation.
 */

import { isIdentifierStart, isIdentifierPart, ScriptTarget } from 'typescript';
import { trim, words } from 'lodash-es';

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
 * Names that are valid identifiers and neither reserved words nor built-in
 * globals, but that TypeScript still rejects as a type-alias name (the
 * primitive type keywords) or as a binding in a module (`arguments`, `eval`).
 * @internal
 */
const UNNAMEABLE_TYPE_ALIASES = new Set([
  'string',
  'number',
  'boolean',
  'object',
  'symbol',
  'bigint',
  'any',
  'unknown',
  'never',
  'arguments',
  'eval',
]);

/**
 * Project a component's wire name to the symbol emitted for it.
 *
 * This is the single projection from the IR's wire names (the keys under
 * `#/components/schemas`, preserved verbatim in the IR) to the identifiers
 * written into generated TypeScript and Zod. It composes {@link toIdentifier}
 * (a valid identifier, reserved words suffixed) with a `Schema` suffix for
 * names that would shadow a JavaScript built-in global or that TypeScript
 * cannot use as a type-alias or module-binding name (`string`, `eval`). Every site that emits
 * a component's declaration or a reference to it uses this function and
 * nothing else, so the two agree; the projection is idempotent on its own
 * output. It is one-way: a wire name is not recoverable from its symbol, so
 * component identity survives OpenAPI → IR → OpenAPI, not a trip through
 * generated TypeScript.
 *
 * @param name - The component's wire name
 * @returns The identifier emitted for that component
 *
 * @example
 * ```typescript
 * safeSchemaName('User');                            // 'User'
 * safeSchemaName('Error');                           // 'ErrorSchema'
 * safeSchemaName('1Name-With-Special---Characters'); // '_1_Name_With_Special_Characters'
 * safeSchemaName('class');                           // 'class_'
 * safeSchemaName('Basic.Thing');                     // 'Basic_Thing'
 * ```
 *
 * @see {@link assertDistinctSafeSchemaNames} for the collision check a document runs before emission
 * @internal
 */
export function safeSchemaName(name: string): string {
  const identifier = toIdentifier(name);
  if (BUILTIN_GLOBALS.has(identifier) || UNNAMEABLE_TYPE_ALIASES.has(identifier)) {
    return `${identifier}Schema`;
  }
  return identifier;
}

/**
 * Assert that a document's component wire names project to distinct symbols
 * that collide with none of the writer's own generated declarations.
 *
 * Two wire names such as `a-b` and `a_b` both project to `a_b`; a repeated
 * wire name declares one symbol twice; a component named `endpoints` collides
 * with the generated endpoints array. Each would emit invalid TypeScript, so
 * generation fails fast here instead.
 *
 * @param names - Every schema component wire name the document will emit
 * @param reservedSymbols - Symbols the writer declares itself, which no component may take
 * @throws `Error` naming the colliding wire names (or the reserved symbol) and the shared symbol
 *
 * @internal
 */
export function assertDistinctSafeSchemaNames(
  names: readonly string[],
  reservedSymbols: readonly string[] = [],
): void {
  const wireNameBySymbol = new Map<string, string>();
  const reserved = new Set(reservedSymbols);
  for (const name of names) {
    const symbol = safeSchemaName(name);
    if (reserved.has(symbol)) {
      throw new Error(
        `Component name "${name}" emits the symbol "${symbol}", which the generated ` +
          'file already declares. Rename the component.',
      );
    }
    const existing = wireNameBySymbol.get(symbol);
    if (existing === name) {
      throw new Error(
        `Component name "${name}" is carried twice; one declaration would silently replace ` +
          'the other. A document names each component once.',
      );
    }
    if (existing !== undefined) {
      throw new Error(
        `Component names "${existing}" and "${name}" both emit the symbol "${symbol}". ` +
          'Rename one of them so every generated declaration is distinct.',
      );
    }
    wireNameBySymbol.set(symbol, name);
  }
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
 * toIdentifier('123test');             // '_123_test'
 * toIdentifier('class');               // 'class_'
 * ```
 *
 * @public
 */
export function toIdentifier(name: string): string {
  const trimmed = trim(name);

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
