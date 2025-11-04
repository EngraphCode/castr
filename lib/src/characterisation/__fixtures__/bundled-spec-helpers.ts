/**
 * Helper functions for bundled spec characterisation tests
 * Extracted to reduce complexity and enable reuse across test cases
 */

import type { OpenAPIObject, OperationObject, PathItemObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

/**
 * Type guard to check if a path item value is an operation object
 */
export function isOperationObject(value: unknown): value is OperationObject {
  return typeof value === 'object' && value !== null && 'responses' in value && !('$ref' in value);
}

/**
 * Extract all operation objects from an OpenAPI spec
 * Flattens the nested structure while respecting nesting depth limits
 */
export function extractAllOperations(spec: OpenAPIObject): OperationObject[] {
  const operations: OperationObject[] = [];

  const paths = spec.paths || {};
  for (const pathItem of Object.values(paths)) {
    if (!pathItem) {
      continue;
    }

    const pathItemObj = pathItem as PathItemObject;
    const operationsInPath = [
      pathItemObj.get,
      pathItemObj.post,
      pathItemObj.put,
      pathItemObj.patch,
      pathItemObj.delete,
      pathItemObj.options,
      pathItemObj.head,
      pathItemObj.trace,
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
 * Assert that a parameter is defined and not a reference
 */
export function assertParameterNotRef(
  parameters: OperationObject['parameters'],
  index: number,
): void {
  if (!parameters || !parameters[index]) {
    throw new Error(`Parameter at index ${index} is undefined`);
  }
  if (isReferenceObject(parameters[index])) {
    throw new Error(`Parameter at index ${index} is still a reference`);
  }
}

/**
 * Assert that requestBody is defined and not a reference
 */
export function assertRequestBodyNotRef(requestBody: OperationObject['requestBody']): void {
  if (!requestBody) {
    throw new Error('requestBody is undefined');
  }
  if (isReferenceObject(requestBody)) {
    throw new Error('requestBody is still a reference');
  }
}

/**
 * Assert that a response is defined and not a reference
 */
export function assertResponseNotRef(
  responses: OperationObject['responses'],
  statusCode: string,
): void {
  const response = responses?.[statusCode];
  if (!response) {
    throw new Error(`Response ${statusCode} is undefined`);
  }
  if (isReferenceObject(response)) {
    throw new Error(`Response ${statusCode} is still a reference`);
  }
}

/**
 * Get operation from spec path, asserting it exists
 */
export function getOperation(
  spec: OpenAPIObject,
  path: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
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

/**
 * Verify that multiple operations have resolved their refs
 * Reduces complexity by extracting the verification logic
 */
interface OperationPath {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
}

export function verifyOperationsRefsResolved(
  spec: OpenAPIObject,
  operations: OperationPath[],
): void {
  for (const { path, method } of operations) {
    const operation = getOperation(spec, path, method);
    if (operation.parameters?.[0]) {
      assertParameterNotRef(operation.parameters, 0);
    }
    if (operation.responses?.['200']) {
      assertResponseNotRef(operation.responses, '200');
    }
  }
}

/**
 * Verify all parameters in an operation are not refs
 */
function verifyParametersNotRefs(parameters: OperationObject['parameters']): void {
  if (!parameters) {
    return;
  }
  for (const param of parameters) {
    if (isReferenceObject(param)) {
      throw new Error('Parameter is still a reference after dereference');
    }
  }
}

/**
 * Verify requestBody in an operation is not a ref
 */
function verifyRequestBodyNotRef(requestBody: OperationObject['requestBody']): void {
  if (!requestBody) {
    return;
  }
  if (isReferenceObject(requestBody)) {
    throw new Error('requestBody is still a reference after dereference');
  }
}

/**
 * Verify all parameters and requestBody in an operation are not refs
 */
export function verifyOperationRefsResolved(operation: OperationObject): void {
  verifyParametersNotRefs(operation.parameters);
  verifyRequestBodyNotRef(operation.requestBody);
}
