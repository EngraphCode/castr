/**
 * Helper functions for bundled spec characterisation tests
 * Extracted to reduce complexity and enable reuse across test cases
 */

import {
  type OpenAPIDocument,
  type OperationObject,
  isReferenceObject,
} from '../../shared/openapi-types.js';

type StandardOperationMethod =
  'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace' | 'query';

/**
 * Type guard to check if a path item value is an operation object
 */
function isOperationObject(value: unknown): value is OperationObject {
  return typeof value === 'object' && value !== null && 'responses' in value && !('$ref' in value);
}

/**
 * Extract all operation objects from an OpenAPI spec
 * Flattens the nested structure while respecting nesting depth limits
 */
export function extractAllOperations(spec: OpenAPIDocument): OperationObject[] {
  const operations: OperationObject[] = [];

  const paths = spec.paths;
  if (!paths) {
    return operations;
  }

  for (const pathItem of Object.values(paths)) {
    if (!pathItem || isReferenceObject(pathItem)) {
      continue;
    }

    const operationsInPath = [
      pathItem.get,
      pathItem.post,
      pathItem.put,
      pathItem.patch,
      pathItem.delete,
      pathItem.options,
      pathItem.head,
      pathItem.trace,
      pathItem.query,
    ];

    for (const operation of operationsInPath) {
      if (isOperationObject(operation)) {
        operations.push(operation);
      }
    }
  }

  return operations;
}

/**
 * Get operation from spec path, asserting it exists
 */
export function getOperation(
  spec: OpenAPIDocument,
  path: string,
  method: StandardOperationMethod,
): OperationObject {
  const pathItem = spec.paths?.[path];
  if (!pathItem) {
    throw new Error(`Path ${path} not found`);
  }

  const operation = pathItem[method];
  if (!operation || !isOperationObject(operation)) {
    throw new Error(`Operation ${method} not found at path ${path}`);
  }

  return operation;
}
