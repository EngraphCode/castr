/**
 * OpenAPI operations writer — converts CastrOperation[] to OpenAPI PathsObject.
 *
 * This module handles the conversion of IR operation definitions to valid
 * OpenAPI 3.1 PathsObject. Operations are grouped by path, then by HTTP method.
 *
 * @module
 */

import type {
  PathsObject,
  PathItemObject,
  OperationObject,
  ParameterObject,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';
import { writeOpenApiSchema } from '../schema/openapi-writer.schema.js';
import { writeRequestBody, writeResponses } from './openapi-writer.bodies.js';
import type { CastrOperation, CastrParameter, IRSecurityRequirement } from '../../../ir/index.js';

function compareSecurityRequirements(
  left: IRSecurityRequirement,
  right: IRSecurityRequirement,
): number {
  return left.schemeName.localeCompare(right.schemeName);
}

/**
 * Converts a CastrParameter to OpenAPI ParameterObject.
 * @internal
 */
function writeParameter(param: CastrParameter): ParameterObject {
  const result: ParameterObject = {
    name: param.name,
    in: param.in,
    required: param.required,
    schema: writeOpenApiSchema(param.schema),
  };

  if (param.description !== undefined) {
    result.description = param.description;
  }
  if (param.deprecated !== undefined) {
    result.deprecated = param.deprecated;
  }
  if (param.example !== undefined) {
    result.example = param.example;
  }
  if (param.style !== undefined) {
    result.style = param.style;
  }
  if (param.explode !== undefined) {
    result.explode = param.explode;
  }
  if (param.allowReserved !== undefined) {
    result.allowReserved = param.allowReserved;
  }

  return result;
}

/**
 * Converts IRSecurityRequirement[] to OpenAPI SecurityRequirementObject[].
 * @internal
 */
function writeSecurity(security: IRSecurityRequirement[]): SecurityRequirementObject[] {
  const sortedSecurity = [...security].sort(compareSecurityRequirements);
  return sortedSecurity.map((req) => ({
    [req.schemeName]: req.scopes,
  }));
}

/**
 * Writes core operation metadata fields (operationId, summary, description, tags).
 * @internal
 */
function writeCoreMetadata(operation: CastrOperation, result: OperationObject): void {
  if (operation.operationId !== undefined) {
    result.operationId = operation.operationId;
  }
  if (operation.summary !== undefined) {
    result.summary = operation.summary;
  }
  if (operation.description !== undefined) {
    result.description = operation.description;
  }
  if (operation.tags !== undefined && operation.tags.length > 0) {
    result.tags = operation.tags;
  }
}

/**
 * Writes extended operation metadata fields (deprecated, externalDocs, callbacks, servers).
 * @internal
 */
function writeExtendedMetadata(operation: CastrOperation, result: OperationObject): void {
  if (operation.deprecated !== undefined) {
    result.deprecated = operation.deprecated;
  }
  if (operation.externalDocs !== undefined) {
    result.externalDocs = operation.externalDocs;
  }
  if (operation.callbacks !== undefined) {
    result.callbacks = operation.callbacks;
  }
  if (operation.servers !== undefined && operation.servers.length > 0) {
    result.servers = operation.servers;
  }
}

/**
 * Writes optional operation metadata fields.
 * @internal
 */
function writeOperationMetadata(operation: CastrOperation, result: OperationObject): void {
  writeCoreMetadata(operation, result);
  writeExtendedMetadata(operation, result);
}

/**
 * Converts a CastrOperation to OpenAPI OperationObject.
 * @internal
 */
function writeOperation(operation: CastrOperation): OperationObject {
  const result: OperationObject = {
    responses: writeResponses(operation.responses),
  };

  writeOperationMetadata(operation, result);

  if (operation.parameters.length > 0) {
    result.parameters = operation.parameters.map(writeParameter);
  }

  if (operation.requestBody !== undefined) {
    result.requestBody = writeRequestBody(operation.requestBody);
  }

  if (operation.security !== undefined && operation.security.length > 0) {
    result.security = writeSecurity(operation.security);
  }

  return result;
}

/** Setter function type for path item methods. @internal */
type PathItemMethodSetter = (pathItem: PathItemObject, op: OperationObject) => void;

/** Map of HTTP methods to path item setters. @internal */
const PATH_ITEM_METHOD_SETTERS: Record<string, PathItemMethodSetter> = {
  get: (p, op) => {
    p.get = op;
  },
  post: (p, op) => {
    p.post = op;
  },
  put: (p, op) => {
    p.put = op;
  },
  patch: (p, op) => {
    p.patch = op;
  },
  delete: (p, op) => {
    p.delete = op;
  },
  head: (p, op) => {
    p.head = op;
  },
  options: (p, op) => {
    p.options = op;
  },
  trace: (p, op) => {
    p.trace = op;
  },
};

const HTTP_METHOD_ORDER: string[] = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
];

const HTTP_METHOD_ORDER_INDEX: Record<string, number> = Object.fromEntries(
  HTTP_METHOD_ORDER.map((method, index) => [method, index]),
);

function compareOperationsByPathThenMethod(left: CastrOperation, right: CastrOperation): number {
  const pathComparison = left.path.localeCompare(right.path);
  if (pathComparison !== 0) {
    return pathComparison;
  }

  const leftOrder = HTTP_METHOD_ORDER_INDEX[left.method] ?? Number.POSITIVE_INFINITY;
  const rightOrder = HTTP_METHOD_ORDER_INDEX[right.method] ?? Number.POSITIVE_INFINITY;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.method.localeCompare(right.method);
}

/**
 * Assigns an operation to a path item based on method.
 * @internal
 */
function assignOperationToPath(
  pathItem: PathItemObject,
  op: OperationObject,
  method: string,
): void {
  const setter = PATH_ITEM_METHOD_SETTERS[method];
  if (setter) {
    setter(pathItem, op);
  }
}

/**
 * Applies PathItem-level metadata fields (only if not already set).
 * @internal
 */
function applyPathItemMetadata(operation: CastrOperation, pathItem: PathItemObject): void {
  if (operation.pathItemSummary && !pathItem.summary) {
    pathItem.summary = operation.pathItemSummary;
  }
  if (operation.pathItemDescription && !pathItem.description) {
    pathItem.description = operation.pathItemDescription;
  }
}

/**
 * Applies PathItem-level extras (servers, parameters) (only if not already set).
 * @internal
 */
function applyPathItemExtras(operation: CastrOperation, pathItem: PathItemObject): void {
  if (operation.pathItemServers && !pathItem.servers) {
    pathItem.servers = operation.pathItemServers;
  }
  if (operation.pathItemParameterRefs && !pathItem.parameters) {
    pathItem.parameters = operation.pathItemParameterRefs.map((ref) => ({ $ref: ref }));
  }
}

/**
 * Applies PathItem-level fields from an operation (only if not already set).
 * @internal
 */
function applyPathItemFields(operation: CastrOperation, pathItem: PathItemObject): void {
  applyPathItemMetadata(operation, pathItem);
  applyPathItemExtras(operation, pathItem);
}

/**
 * Converts IR operations to an OpenAPI PathsObject.
 *
 * Groups operations by path, then adds each operation under its HTTP method.
 *
 * @param operations - The IR operations to convert
 * @returns A valid OpenAPI 3.1 PathsObject
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
export function writeOpenApiPaths(operations: CastrOperation[]): PathsObject {
  const result: PathsObject = {};
  const sortedOperations = [...operations].sort(compareOperationsByPathThenMethod);

  for (const operation of sortedOperations) {
    const pathKey = operation.path;
    const pathItem: PathItemObject = result[pathKey] ?? {};

    const op = writeOperation(operation);
    assignOperationToPath(pathItem, op, operation.method);
    applyPathItemFields(operation, pathItem);

    result[pathKey] = pathItem;
  }

  return result;
}
