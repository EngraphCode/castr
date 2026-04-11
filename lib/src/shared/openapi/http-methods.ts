/**
 * Canonical standard HTTP method list for OpenAPI Path Item fixed fields.
 *
 * The list stays closed even though OAS 3.2 also allows custom methods via
 * `additionalOperations`.
 */
export const STANDARD_HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
  'query',
] as const;

export type StandardHttpMethod = (typeof STANDARD_HTTP_METHODS)[number];
const CHAR_CODE_0 = 0x30;
const CHAR_CODE_9 = 0x39;
const CHAR_CODE_UPPER_A = 0x41;
const CHAR_CODE_UPPER_Z = 0x5a;
const CHAR_CODE_LOWER_A = 0x61;
const CHAR_CODE_LOWER_Z = 0x7a;
const ASCII_CASE_OFFSET = 0x20;
const HEX_MASK = 0x0f;
const HTTP_METHOD_TOKEN_PUNCTUATION = new Set<number>([
  0x21, // !
  0x23, // #
  0x24, // $
  0x25, // %
  0x26, // &
  0x27, // '
  0x2a, // *
  0x2b, // +
  0x2d, // -
  0x2e, // .
  0x5e, // ^
  0x5f, // _
  0x60, // `
  0x7c, // |
  0x7e, // ~
]);
const HEX_DIGITS = '0123456789abcdef';
const CUSTOM_METHOD_IDENTIFIER_PREFIX = 'method_';
const CUSTOM_METHOD_IDENTIFIER_SEPARATOR = '__';
const CUSTOM_METHOD_IDENTIFIER_FALLBACK = 'custom';
const IDENTIFIER_SEPARATOR = '_';

const STANDARD_HTTP_METHOD_SET = new Set<string>(STANDARD_HTTP_METHODS);

export function isStandardHttpMethod(value: unknown): value is StandardHttpMethod {
  return typeof value === 'string' && STANDARD_HTTP_METHOD_SET.has(value);
}

/**
 * Resolve a case-insensitive standard method spelling to its canonical fixed-field form.
 *
 * Returns `undefined` for truly custom methods.
 */
export function getCanonicalStandardHttpMethod(method: string): StandardHttpMethod | undefined {
  return STANDARD_HTTP_METHODS.find((standardMethod) =>
    equalsAsciiCaseInsensitive(method, standardMethod),
  );
}

function isAsciiDigit(code: number): boolean {
  return code >= CHAR_CODE_0 && code <= CHAR_CODE_9;
}

function isAsciiUppercaseLetter(code: number): boolean {
  return code >= CHAR_CODE_UPPER_A && code <= CHAR_CODE_UPPER_Z;
}

function isAsciiLowercaseLetter(code: number): boolean {
  return code >= CHAR_CODE_LOWER_A && code <= CHAR_CODE_LOWER_Z;
}

function toAsciiCaseInsensitiveCode(code: number): number {
  return isAsciiUppercaseLetter(code) ? code + ASCII_CASE_OFFSET : code;
}

function toAsciiLowercaseCode(code: number): number {
  return isAsciiUppercaseLetter(code) ? code + ASCII_CASE_OFFSET : code;
}

function isHttpMethodTokenPunctuation(code: number): boolean {
  return HTTP_METHOD_TOKEN_PUNCTUATION.has(code);
}

function isHttpMethodToken(method: string): boolean {
  if (method.length === 0) {
    return false;
  }

  for (let index = 0; index < method.length; index++) {
    const code = method.charCodeAt(index);
    if (
      isAsciiDigit(code) ||
      isAsciiUppercaseLetter(code) ||
      isAsciiLowercaseLetter(code) ||
      isHttpMethodTokenPunctuation(code)
    ) {
      continue;
    }

    return false;
  }

  return true;
}

function equalsAsciiCaseInsensitive(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index++) {
    const leftCode = toAsciiCaseInsensitiveCode(left.charCodeAt(index));
    const rightCode = toAsciiCaseInsensitiveCode(right.charCodeAt(index));
    if (leftCode !== rightCode) {
      return false;
    }
  }

  return true;
}

export function isReservedAdditionalOperationMethodName(method: string): boolean {
  return getCanonicalStandardHttpMethod(method) !== undefined;
}

export function getAdditionalOperationMethodValidationError(method: string): string | undefined {
  if (method.length === 0) {
    return 'Invalid additionalOperations method "": custom method names must not be empty.';
  }

  if (!isHttpMethodToken(method)) {
    return (
      `Invalid additionalOperations method "${method}": custom method names must be valid ` +
      'HTTP method tokens without spaces.'
    );
  }

  if (isReservedAdditionalOperationMethodName(method)) {
    return (
      `Invalid additionalOperations method "${method}": methods covered by fixed ` +
      'Path Item fields must not appear in additionalOperations.'
    );
  }

  return undefined;
}

function trimTrailingIdentifierSeparators(value: string): string {
  let endIndex = value.length;

  while (endIndex > 0 && value[endIndex - 1] === IDENTIFIER_SEPARATOR) {
    endIndex--;
  }

  let result = '';

  for (let index = 0; index < endIndex; index++) {
    result += value[index] ?? '';
  }

  return result;
}

function appendIdentifierSeparator(value: string): string {
  if (value.length === 0 || value[value.length - 1] === IDENTIFIER_SEPARATOR) {
    return value;
  }

  return `${value}${IDENTIFIER_SEPARATOR}`;
}

function appendCustomMethodIdentifierFragment(base: string, fragment: string): string {
  return fragment === IDENTIFIER_SEPARATOR ? appendIdentifierSeparator(base) : `${base}${fragment}`;
}

function getCustomMethodIdentifierFragment(code: number): { fragment: string; changed: boolean } {
  if (isAsciiDigit(code) || isAsciiLowercaseLetter(code)) {
    return { fragment: String.fromCharCode(code), changed: false };
  }

  if (isAsciiUppercaseLetter(code)) {
    return { fragment: String.fromCharCode(toAsciiLowercaseCode(code)), changed: true };
  }

  return { fragment: IDENTIFIER_SEPARATOR, changed: true };
}

function createCustomMethodIdentifierBase(method: string): {
  base: string;
  changed: boolean;
  startsWithDigit: boolean;
} {
  let base = '';
  let changed = false;
  let startsWithDigit = false;

  for (let index = 0; index < method.length; index++) {
    const code = method.charCodeAt(index);

    if (index === 0 && isAsciiDigit(code)) {
      startsWithDigit = true;
    }

    const fragment = getCustomMethodIdentifierFragment(code);
    base = appendCustomMethodIdentifierFragment(base, fragment.fragment);
    changed ||= fragment.changed;
  }

  const trimmedBase = trimTrailingIdentifierSeparators(base);
  return {
    base: trimmedBase.length > 0 ? trimmedBase : CUSTOM_METHOD_IDENTIFIER_FALLBACK,
    changed,
    startsWithDigit,
  };
}

function toHexDigit(value: number): string {
  return HEX_DIGITS[value] ?? '0';
}

function toHexByte(code: number): string {
  return `${toHexDigit((code >> 4) & HEX_MASK)}${toHexDigit(code & HEX_MASK)}`;
}

function createCustomMethodIdentifierSignature(method: string): string {
  let signature = '';

  for (let index = 0; index < method.length; index++) {
    signature += toHexByte(method.charCodeAt(index));
  }

  return signature;
}

/**
 * Create a deterministic identifier-safe method token for downstream names and
 * grouping keys.
 *
 * Standard methods keep their canonical fixed-field names. Custom methods are
 * prefixed with `method_`, and a hex suffix is added whenever normalization
 * would otherwise lose case or punctuation fidelity.
 */
export function getHttpMethodIdentifier(method: string): string {
  const canonicalStandardMethod = getCanonicalStandardHttpMethod(method);
  if (canonicalStandardMethod !== undefined) {
    return canonicalStandardMethod;
  }

  const { base, changed, startsWithDigit } = createCustomMethodIdentifierBase(method);
  const signature =
    changed || startsWithDigit
      ? `${CUSTOM_METHOD_IDENTIFIER_SEPARATOR}${createCustomMethodIdentifierSignature(method)}`
      : '';

  return `${CUSTOM_METHOD_IDENTIFIER_PREFIX}${base}${signature}`;
}
