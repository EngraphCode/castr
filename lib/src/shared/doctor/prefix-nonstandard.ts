/**
 * Utility to isolate non-standard unprefixed OpenAPI properties into an `x-nonstandard-` namespace.
 *
 * @module
 * @internal
 */

import { validate } from '@scalar/openapi-parser';
import type { ValidationError } from '../load-openapi-document/validation-errors.js';
import { preflightValidate } from './preflight-validator.js';
import type { PreflightValidationError } from './preflight-validator.js';
import { extractPropertyName, traverseInstancePath, traversePointerPath } from './pointer-utils.js';

type ScalarValidationResult = Awaited<ReturnType<typeof validate>>;

export interface NonStandardPropertyRescueDiagnostics {
  retryCount: number;
}

const X_NONSTANDARD_PREFIX = 'x-nonstandard-';
const UNEVALUATED_PROPERTIES_KEYWORD = 'unevaluatedProperties';
const SLASH = '/';
const EMPTY_STRING = '';
const UNKNOWN_ERROR = 'Unknown error';
const MAX_FALLBACK_RETRIES = 20;

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

function prefixProperty(
  parent: object,
  propName: string,
  path: string,
  warnings: { readonly message: string }[],
): boolean {
  const newPropName = X_NONSTANDARD_PREFIX + propName;
  if (assignAndRemove(parent, propName, newPropName)) {
    warnings.push({
      message: `Auto-prefixed non-standard property '${propName}' at '${path || SLASH}' to '${newPropName}'`,
    });
    return true;
  }
  return false;
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
  return prefixProperty(parent, propName, error.path, warnings);
}

function tryPrefixPreflightError(
  document: unknown,
  error: PreflightValidationError,
  warnings: { readonly message: string }[],
): boolean {
  if (error.keyword !== UNEVALUATED_PROPERTIES_KEYWORD) {
    return false;
  }
  const propName: unknown = error.params['unevaluatedProperty'];
  if (typeof propName !== 'string') {
    return false;
  }
  const parent = traverseInstancePath(document, error.instancePath);
  if (typeof parent !== 'object' || parent === null) {
    return false;
  }
  return prefixProperty(parent, propName, error.instancePath, warnings);
}

function processPreflightBatch(
  document: unknown,
  errors: readonly PreflightValidationError[],
  warnings: { readonly message: string }[],
): number {
  let prefixedCount = 0;
  for (const error of errors) {
    if (tryPrefixPreflightError(document, error, warnings)) {
      prefixedCount++;
    }
  }
  return prefixedCount;
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

async function runPreflightRescue(
  bundledDocument: object,
  warnings: { readonly message: string }[],
): Promise<number> {
  const preflight = await preflightValidate(bundledDocument);
  if (preflight.valid) {
    return 0;
  }
  return processPreflightBatch(bundledDocument, preflight.errors, warnings);
}

async function runScalarFallback(
  bundledDocument: object,
  validationResult: ScalarValidationResult,
  warnings: { readonly message: string }[],
): Promise<{ readonly result: ScalarValidationResult; readonly fallbackCount: number }> {
  let currentResult = validationResult;
  let fallbackCount = 0;
  while (!currentResult.valid && fallbackCount < MAX_FALLBACK_RETRIES) {
    if (!processErrorBatch(bundledDocument, currentResult, warnings)) {
      break;
    }
    currentResult = await validate(bundledDocument);
    fallbackCount++;
  }
  return { result: currentResult, fallbackCount };
}

/**
 * Batch-preflight rescue strategy for non-standard property errors.
 *
 * 1. Run repo-local AJV `allErrors: true` validator to harvest ALL errors in one pass.
 * 2. Batch-prefix all identified non-standard properties.
 * 3. Confirm with Scalar `validate()` once.
 * 4. If Scalar still reports fixable errors (safety net), do bounded Scalar-based passes.
 */
export async function attemptNonStandardPropertyRescue(
  bundledDocument: unknown,
  initialValidationResult: ScalarValidationResult,
  warnings: { readonly message: string }[],
  diagnostics?: NonStandardPropertyRescueDiagnostics,
): Promise<ScalarValidationResult> {
  if (diagnostics) {
    diagnostics.retryCount = 0;
  }
  if (typeof bundledDocument !== 'object' || bundledDocument === null) {
    return initialValidationResult;
  }

  const prefixedCount = await runPreflightRescue(bundledDocument, warnings);
  const scalarResult = await validate(bundledDocument);
  const { result, fallbackCount } = await runScalarFallback(
    bundledDocument,
    scalarResult,
    warnings,
  );

  if (diagnostics) {
    diagnostics.retryCount = (prefixedCount > 0 ? 1 : 0) + fallbackCount;
  }
  return result;
}
