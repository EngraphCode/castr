/**
 * Utilities for extracting properties, unescaping pointers, and traversing JSON Pointer
 * paths strictly following ADR-026.
 *
 * @module
 * @internal
 */

const PROPERTY_PREFIX = 'Property ';
const IS_NOT_EXPECTED_SUFFIX = ' is not expected to be here';
const SLASH = '/';
const TILDE = '~';
const STR_ONE = '1';
const STR_ZERO = '0';
const EMPTY_STRING = '';

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

function processPointerSegment(
  currentObj: unknown,
  currentSegment: string,
): { readonly nextObj: unknown; readonly shouldReturn: boolean } {
  const decodedSegment = unescapePointerSegment(currentSegment);
  if (typeof currentObj !== 'object' || currentObj === null) {
    return { nextObj: undefined, shouldReturn: true };
  }
  if (!(decodedSegment in currentObj)) {
    return { nextObj: undefined, shouldReturn: true };
  }
  const nextObj: unknown = Reflect.get(currentObj, decodedSegment);
  return { nextObj, shouldReturn: false };
}

function processPathChar(
  char: string,
  isEnd: boolean,
  currentObj: unknown,
  currentSegment: string,
): { readonly nextObj: unknown; readonly nextSegment: string; readonly shouldReturn: boolean } {
  if (char === SLASH) {
    const result = processPointerSegment(currentObj, currentSegment);
    return {
      nextObj: result.nextObj,
      nextSegment: EMPTY_STRING,
      shouldReturn: result.shouldReturn,
    };
  }
  if (isEnd) {
    const finalSegment = currentSegment + char;
    if (finalSegment === EMPTY_STRING) {
      return { nextObj: currentObj, nextSegment: EMPTY_STRING, shouldReturn: false };
    }
    const result = processPointerSegment(currentObj, finalSegment);
    return {
      nextObj: result.nextObj,
      nextSegment: EMPTY_STRING,
      shouldReturn: result.shouldReturn,
    };
  }
  return { nextObj: currentObj, nextSegment: currentSegment + char, shouldReturn: false };
}

function getParentNodeUnsafe(
  root: unknown,
  path: string,
): { readonly parent: unknown | undefined } {
  let currentObj: unknown = root;
  let currentSegment: string = EMPTY_STRING;
  let i = 1;
  while (i < path.length) {
    const char = path[i] ?? EMPTY_STRING;
    const step = processPathChar(char, i === path.length - 1, currentObj, currentSegment);
    if (step.shouldReturn) {
      return { parent: undefined };
    }
    currentObj = step.nextObj;
    currentSegment = step.nextSegment;
    i++;
  }
  return { parent: currentObj };
}

/**
 * Traverse a JSON pointer path to reach the parent node of the final segment.
 */
export function traversePointerPath(document: unknown, path: string): { readonly parent: unknown } {
  if (path === EMPTY_STRING || path === SLASH) {
    return { parent: document };
  }
  return getParentNodeUnsafe(document, path);
}

/**
 * Traverse an AJV instancePath to reach the object that contains the offending property.
 * AJV instancePath is "" for root or "/foo/bar" for nested locations.
 */
export function traverseInstancePath(document: unknown, instancePath: string): unknown {
  if (instancePath === EMPTY_STRING) {
    return document;
  }
  const { parent } = getParentNodeUnsafe(document, instancePath + '/');
  return parent;
}
