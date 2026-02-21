/**
 * Utilities for extracting properties and unescaping pointers strictly following ADR-026.
 *
 * @module
 * @internal
 */

const PROPERTY_PREFIX = 'Property ' as const;
const IS_NOT_EXPECTED_SUFFIX = ' is not expected to be here' as const;
const SLASH = '/' as const;
const TILDE = '~' as const;
const STR_ONE = '1' as const;
const STR_ZERO = '0' as const;
const EMPTY_STRING = '' as const;

function hasExactPrefix(message: string): boolean {
  for (let i = 0; i < PROPERTY_PREFIX.length; i++) {
    if (message[i] !== PROPERTY_PREFIX[i]) {
      return false;
    }
  }
  return true;
}

function hasExactSuffix(message: string, suffixStart: number): boolean {
  for (let i = 0; i < IS_NOT_EXPECTED_SUFFIX.length; i++) {
    if (message[suffixStart + i] !== IS_NOT_EXPECTED_SUFFIX[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Extracts the property name from a validation error string like:
 * "Property extraDocs is not expected to be here"
 * Does so without RegExp or string manipulation methods banned by ADR-026.
 */
export function extractPropertyName(message: string): string | undefined {
  if (message.length <= PROPERTY_PREFIX.length + IS_NOT_EXPECTED_SUFFIX.length) {
    return undefined;
  }

  if (!hasExactPrefix(message)) {
    return undefined;
  }

  const suffixStart = message.length - IS_NOT_EXPECTED_SUFFIX.length;
  if (!hasExactSuffix(message, suffixStart)) {
    return undefined;
  }

  // Extract the inner property name character by character
  let propName = '';
  for (let i = PROPERTY_PREFIX.length; i < suffixStart; i++) {
    propName += message[i];
  }

  return propName;
}

function processTildeEscape(
  segment: string,
  currentIndex: number,
): { readonly char: string; readonly jump: number } | undefined {
  if (segment[currentIndex] !== TILDE || currentIndex + 1 >= segment.length) {
    return undefined;
  }

  if (segment[currentIndex + 1] === STR_ONE) {
    return { char: SLASH, jump: 2 };
  }

  if (segment[currentIndex + 1] === STR_ZERO) {
    return { char: TILDE, jump: 2 };
  }

  return undefined;
}

/**
 * Unescapes a JSON pointer segment according to RFC6901 without using replace() or Regex.
 * ~1 -> /
 * ~0 -> ~
 */
export function unescapePointerSegment(segment: string): string {
  let result = EMPTY_STRING;
  let i = 0;
  while (i < segment.length) {
    const escape = processTildeEscape(segment, i);
    if (escape) {
      result += escape.char;
      i += escape.jump;
    } else {
      result += segment[i] ?? EMPTY_STRING;
      i++;
    }
  }
  return result;
}
