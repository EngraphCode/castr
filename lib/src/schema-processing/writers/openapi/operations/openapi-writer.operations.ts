/**
 * OpenAPI operations writer — converts CastrOperation[] to OpenAPI PathsObject.
 *
 * This module handles the conversion of IR operation definitions to valid
 * canonical OpenAPI 3.2 PathsObject. Operations are grouped by path, then by HTTP method.
 *
 * @module
 */

import type { PathsObject, PathItemObject } from '../../../../shared/openapi-types.js';
import type { CastrAdditionalOperation, CastrOperation } from '../../../ir/index.js';
import { applyPathItemFields, writeOperation } from './openapi-writer.operations.fields.js';
import {
  assignOperationToPath,
  buildOperationWriteEntries,
} from './openapi-writer.operations.entries.js';

/**
 * Converts IR operations to an OpenAPI PathsObject.
 *
 * Groups operations by path, then adds each operation under its HTTP method.
 *
 * @param operations - The IR operations to convert
 * @returns A valid canonical OpenAPI 3.2 PathsObject
 *
 * @example
 * ```typescript
 * const operations: CastrOperation[] = [
 *   { method: 'get', path: '/users', operationId: 'getUsers', ... },
 *   { method: 'post', path: '/users', operationId: 'createUser', ... },
 * ];
 *
 * const paths = writeOpenApiPaths(operations);
 * // {
 * //   '/users': {
 * //     get: { operationId: 'getUsers', ... },
 * //     post: { operationId: 'createUser', ... },
 * //   },
 * // }
 * ```
 *
 * @public
 */
export function writeOpenApiPaths(
  operations: CastrOperation[],
  additionalOperations: CastrAdditionalOperation[] = [],
): PathsObject {
  const result: PathsObject = {};
  const sortedOperations = buildOperationWriteEntries(operations, additionalOperations);

  for (const entry of sortedOperations) {
    const operation = entry.operation;
    const pathKey = operation.path;
    const pathItem: PathItemObject = result[pathKey] ?? {};

    const op = writeOperation(operation);
    assignOperationToPath(pathItem, op, entry);
    applyPathItemFields(operation, pathItem);

    result[pathKey] = pathItem;
  }

  return result;
}
