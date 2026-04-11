import { join, split } from 'lodash-es';

import { type ReferenceObject, isReferenceObject } from '../../openapi-types.js';
import {
  getAdditionalOperationMethodValidationError,
  STANDARD_HTTP_METHODS,
} from '../../openapi/http-methods.js';
import type { UnknownRecord } from '../../type-utils/types.js';
import type { ValidationError } from '../validation-errors.js';

const JSON_POINTER_SEPARATOR = '/';
const JSON_POINTER_ESCAPED_SLASH = '~1';
const JSON_POINTER_ESCAPED_TILDE = '~0';
const TILDE_TOKEN = '~';
const PATH_ITEM_MEMBER_KEYS = [
  ...STANDARD_HTTP_METHODS,
  'additionalOperations',
  'parameters',
  'servers',
] as const;

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return isObject(value);
}

function markSeen(value: object, seen: WeakSet<object>): boolean {
  if (seen.has(value)) {
    return false;
  }

  seen.add(value);
  return true;
}

function replaceTokenEverywhere(text: string, token: string, replacement: string): string {
  return join(split(text, token), replacement);
}

function escapeJsonPointerSegment(segment: string): string {
  const escapedTildes = replaceTokenEverywhere(segment, TILDE_TOKEN, JSON_POINTER_ESCAPED_TILDE);
  return replaceTokenEverywhere(escapedTildes, JSON_POINTER_SEPARATOR, JSON_POINTER_ESCAPED_SLASH);
}

function createPointer(pathSegments: string[]): string {
  return `${JSON_POINTER_SEPARATOR}${pathSegments.map(escapeJsonPointerSegment).join(JSON_POINTER_SEPARATOR)}`;
}

function hasPathItemMembers(pathItem: object): boolean {
  return PATH_ITEM_MEMBER_KEYS.some((key) => key in pathItem);
}

function isStandalonePathItemReference(pathItem: unknown): pathItem is ReferenceObject {
  return isReferenceObject(pathItem) && !hasPathItemMembers(pathItem);
}

function visitRecordValues(
  values: UnknownRecord | undefined,
  visitor: (value: unknown, key: string) => void,
): void {
  if (values === undefined) {
    return;
  }

  for (const [key, value] of Object.entries(values)) {
    visitor(value, key);
  }
}

function getNestedRecord(value: UnknownRecord, key: string): UnknownRecord | undefined {
  const nestedValue = value[key];
  return isRecord(nestedValue) ? nestedValue : undefined;
}

function validateAdditionalOperations(
  additionalOperations: unknown,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  if (!isRecord(additionalOperations)) {
    return;
  }

  for (const [method, operation] of Object.entries(additionalOperations)) {
    const message = getAdditionalOperationMethodValidationError(method);
    if (message !== undefined) {
      errors.push({
        message,
        path: createPointer([...pathSegments, 'additionalOperations', method]),
      });
    }

    visitOperation(operation, [...pathSegments, 'additionalOperations', method], seen, errors);
  }
}

function visitCallback(
  callback: unknown,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  if (!isRecord(callback) || isReferenceObject(callback) || !markSeen(callback, seen)) {
    return;
  }

  visitRecordValues(callback, (pathItem, expression) =>
    visitPathItem(pathItem, [...pathSegments, expression], seen, errors),
  );
}

function visitOperation(
  operation: unknown,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  if (!isRecord(operation) || isReferenceObject(operation) || !markSeen(operation, seen)) {
    return;
  }

  const callbacks = isRecord(operation['callbacks']) ? operation['callbacks'] : undefined;
  visitRecordValues(callbacks, (callback, callbackName) =>
    visitCallback(callback, [...pathSegments, 'callbacks', callbackName], seen, errors),
  );
}

function visitPathItem(
  pathItem: unknown,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  if (!isRecord(pathItem) || isStandalonePathItemReference(pathItem) || !markSeen(pathItem, seen)) {
    return;
  }

  validateAdditionalOperations(pathItem['additionalOperations'], pathSegments, seen, errors);

  for (const method of STANDARD_HTTP_METHODS) {
    visitOperation(pathItem[method], [...pathSegments, method], seen, errors);
  }
}

function visitPathItemCollection(
  values: UnknownRecord | undefined,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  visitRecordValues(values, (pathItem, key) =>
    visitPathItem(pathItem, [...pathSegments, key], seen, errors),
  );
}

function visitCallbackCollection(
  values: UnknownRecord | undefined,
  pathSegments: string[],
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  visitRecordValues(values, (callback, key) =>
    visitCallback(callback, [...pathSegments, key], seen, errors),
  );
}

function visitComponentCollections(
  components: UnknownRecord | undefined,
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  if (components === undefined) {
    return;
  }

  visitPathItemCollection(
    getNestedRecord(components, 'pathItems'),
    ['components', 'pathItems'],
    seen,
    errors,
  );
  visitCallbackCollection(
    getNestedRecord(components, 'callbacks'),
    ['components', 'callbacks'],
    seen,
    errors,
  );
}

function visitXExtComponentCollections(
  xExt: UnknownRecord | undefined,
  seen: WeakSet<object>,
  errors: ValidationError[],
): void {
  visitRecordValues(xExt, (extContent, xExtKey) => {
    if (!isRecord(extContent)) {
      return;
    }

    const components = getNestedRecord(extContent, 'components');
    if (!components) {
      return;
    }

    visitPathItemCollection(
      getNestedRecord(components, 'pathItems'),
      ['x-ext', xExtKey, 'components', 'pathItems'],
      seen,
      errors,
    );
    visitCallbackCollection(
      getNestedRecord(components, 'callbacks'),
      ['x-ext', xExtKey, 'components', 'callbacks'],
      seen,
      errors,
    );
  });
}

export function validateAdditionalOperationMethods(document: unknown): ValidationError[] {
  if (!isRecord(document)) {
    return [];
  }

  const errors: ValidationError[] = [];
  const seen = new WeakSet<object>();

  visitPathItemCollection(getNestedRecord(document, 'paths'), ['paths'], seen, errors);
  visitPathItemCollection(getNestedRecord(document, 'webhooks'), ['webhooks'], seen, errors);
  visitComponentCollections(getNestedRecord(document, 'components'), seen, errors);
  visitXExtComponentCollections(getNestedRecord(document, 'x-ext'), seen, errors);

  return errors;
}
