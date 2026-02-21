/**
 * Utility to isolate non-standard unprefixed OpenAPI properties into an `x-nonstandard-` namespace.
 *
 * @module
 * @internal
 */

import { validate } from '@scalar/openapi-parser';
import type { ValidationError } from '../load-openapi-document/validation-errors.js';

type ScalarValidationResult = Awaited<ReturnType<typeof validate>>;

import { extractPropertyName, unescapePointerSegment } from './pointer-utils.js';

const X_NONSTANDARD_PREFIX = 'x-nonstandard-' as const;
const SLASH = '/' as const;
const EMPTY_STRING = '' as const;
const UNKNOWN_ERROR = 'Unknown error' as const;

function extractSafeErrors(validationResult: ScalarValidationResult): readonly ValidationError[] {
  const rawErrors = validationResult.valid ? [] : (validationResult.errors ?? []);
  return rawErrors.map((e) => {
    if (!e || typeof e !== 'object') {
      return { message: UNKNOWN_ERROR, path: EMPTY_STRING };
    }
    const msg: unknown = Reflect.get(e, 'message');
    const pth: unknown = Reflect.get(e, 'path');
    return {
      message: typeof msg === 'string' ? msg : UNKNOWN_ERROR,
      path: typeof pth === 'string' ? pth : EMPTY_STRING,
    };
  });
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

  // Safe traversal since we proved it's an object and has the key
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

  return {
    nextObj: currentObj,
    nextSegment: currentSegment + char,
    shouldReturn: false,
  };
}

/**
 * Returns the parent node or undefined if traversal fails.
 * Internal helper to safely traverse to the parent of an offending property.
 */
function getParentNodeUnsafe(
  root: unknown,
  path: string,
): { readonly parent: unknown | undefined } {
  let currentObj: unknown = root;
  let currentSegment: string = EMPTY_STRING;

  // Start from index 1 to skip the initial '/'
  // The loop goes up to path.length - 1 to process all segments *except* the last one.
  // The last segment is handled by traversePointerPath to get the parent.
  let i = 1;
  while (i < path.length) {
    const char = path[i] ?? EMPTY_STRING;
    const isEndOfPath = i === path.length - 1; // This is the end of the *parent* path traversal

    const step = processPathChar(char, isEndOfPath, currentObj, currentSegment);
    if (step.shouldReturn) {
      return { parent: undefined };
    }

    currentObj = step.nextObj;
    currentSegment = step.nextSegment;
    i++;
  }

  // After the loop, currentObj should be the parent of the final segment
  return { parent: currentObj };
}

/**
 * Custom object traversal to satisfy ADR-026 string bans (no split).
 */
function traversePointerPath(document: unknown, path: string): { readonly parent: unknown } {
  if (path === EMPTY_STRING || path === SLASH) {
    return { parent: document };
  }
  return getParentNodeUnsafe(document, path);
}

/**
 * Assigns a property and removes the old one.
 */
function assignAndRemove(parent: object, oldPropName: string, newPropName: string): boolean {
  if (!(oldPropName in parent)) {
    return false;
  }

  const originalValue: unknown = Reflect.get(parent, oldPropName);

  Object.defineProperty(parent, newPropName, {
    value: originalValue,
    enumerable: true,
    writable: true,
    configurable: true,
  });

  Reflect.deleteProperty(parent, oldPropName);
  return true;
}

function processSingleErrorPrefixing(
  bundledDocument: unknown,
  error: ValidationError,
  warnings: { readonly message: string }[],
): boolean {
  const propName = extractPropertyName(error.message);
  if (propName === undefined) {
    return false;
  }

  const { parent } = traversePointerPath(bundledDocument, error.path);
  if (typeof parent !== 'object' || parent === null) {
    return false;
  }

  const newPropName = X_NONSTANDARD_PREFIX + propName;
  if (assignAndRemove(parent, propName, newPropName)) {
    const pathSuffix = error.path || SLASH;
    warnings.push({
      message: `Auto-prefixed non-standard property '${propName}' at '${pathSuffix}' to '${newPropName}'`,
    });
    return true;
  }

  return false;
}

function processErrorBatch(
  bundledDocument: unknown,
  validationResult: ScalarValidationResult,
  warnings: { readonly message: string }[],
): boolean {
  const safeErrors = extractSafeErrors(validationResult);
  let modified = false;

  for (const error of safeErrors) {
    if (processSingleErrorPrefixing(bundledDocument, error, warnings)) {
      modified = true;
    }
  }

  return modified;
}

/**
 * Higher order function to retry validation after prefixing errors.
 * Encapsulated here to satisfy strict complexity limits in orchestrator.ts
 */
export async function attemptNonStandardPropertyRescue(
  bundledDocument: unknown,
  initialValidationResult: ScalarValidationResult,
  warnings: { readonly message: string }[],
): Promise<ScalarValidationResult> {
  if (typeof bundledDocument !== 'object' || bundledDocument === null) {
    return initialValidationResult;
  }

  let validationResult = initialValidationResult;
  let retryCount = 0;
  // Documents like Finnhub have ~850 non-standard properties and AJV truncates to 1 error per pass.
  // 2000 validation passes take ~20s on massive documents, which is acceptable for codegen build-time repair.
  const MAX_RETRIES = 2000;

  while (!validationResult.valid && retryCount < MAX_RETRIES) {
    const modified = processErrorBatch(bundledDocument, validationResult, warnings);
    if (!modified) {
      break;
    }

    validationResult = await validate(bundledDocument);
    retryCount++;
  }

  return validationResult;
}
