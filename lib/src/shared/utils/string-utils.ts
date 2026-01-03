/**
 * Capitalizes the first letter of a string, preserving the rest
 * @example capitalize("hello") → "Hello"
 * @example capitalize("mediaObjects") → "MediaObjects"
 * @example capitalize("world") → "World"
 */
export const capitalize = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function normalizeString(text: string): string {
  const prefixed = prefixStringStartingWithNumberIfNeeded(text);
  return prefixed
    .normalize('NFKD')
    .trim()
    .replaceAll(/\s+/g, '_')
    .replaceAll(/-+/g, '_')
    .replaceAll(/[^\w-]+/g, '_')
    .replaceAll(/--+/g, '-');
}

export const wrapWithQuotesIfNeeded = (str: string): string => {
  if (/^[a-zA-Z]\w*$/.test(str)) {
    return str;
  }
  return `"${str}"`;
};

/**
 * Check if a string is a valid JavaScript identifier.
 * Valid identifiers start with letter/underscore/$, followed by alphanumeric/underscore/$.
 * Used to determine if property names need quoting in generated code.
 */
export function isValidJsIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

const prefixStringStartingWithNumberIfNeeded = (str: string): string => {
  const firstAsNumber = Number(str[0]);
  if (typeof firstAsNumber === 'number' && !Number.isNaN(firstAsNumber)) {
    return '_' + str;
  }
  return str;
};

export const escapeControlCharacters = (str: string): string => {
  return str
    .replaceAll('\t', String.raw`\t`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
    .replaceAll(
      // eslint-disable-next-line no-control-regex, sonarjs/no-control-regex -- JC: required
      /([\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF])/g,
      (_m, p1: string) => {
        const codePoint = p1.codePointAt(0);
        if (codePoint === undefined) {
          return '';
        }
        const dec: number = codePoint;
        const hex: string = dec.toString(16);

        if (dec <= 0xff) {
          const paddedHex = `00${hex}`.slice(-2);
          return `\\x${paddedHex}`;
        }
        const paddedHex = `0000${hex}`.slice(-4);
        return `\\u${paddedHex}`;
      },
    )
    .replaceAll('/', String.raw`\/`);
};

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
 * Sanitize a string to be a valid JavaScript identifier.
 * Appends an underscore if the string is a reserved word.
 */
export function sanitizeIdentifier(name: string): string {
  // 1. Replace invalid characters with underscores
  // We allow alphanumeric and underscores. Everything else becomes an underscore.
  let sanitized = name.trim().replace(/\W/g, '_');

  // 2. Handle starting with a number
  if (/^\d/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }

  // 3. Handle reserved words
  if (RESERVED_WORDS.has(sanitized)) {
    return `${sanitized}_`;
  }

  return sanitized;
}
