/**
 * IR Builder - Operations Orchestration
 *
 * Handles extraction and building of operations from OpenAPI paths.
 * Orchestrates parameter, request body, and response building.
 *
 * @module ir-builder.operations
 * @internal
 */

import type {
  PathsObject,
  PathItemObject,
  OperationObject,
  OpenAPIObject,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { IROperation, IRSecurityRequirement } from './ir-schema.js';
import type { HttpMethod } from '../endpoints/definition.types.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { buildIRParameters } from './ir-builder.parameters.js';
import { buildIRRequestBody } from './ir-builder.request-body.js';
import { buildIRResponses } from './ir-builder.responses.js';

/**
 * Build IR operations from OpenAPI paths object.
 *
 * Extracts all HTTP operations from the paths section, converting each
 * path+method combination into an IROperation structure with metadata.
 *
 * @param paths - OpenAPI paths object (may be undefined)
 * @param components - OpenAPI components for reference resolution (may be undefined)
 * @returns Array of IR operations
 *
 * @example
 * ```typescript
 * const paths: PathsObject = {
 *   '/users': {
 *     get: { operationId: 'getUsers', responses: { '200': { description: 'Success' } } },
 *     post: { operationId: 'createUser', responses: { '201': { description: 'Created' } } },
 *   },
 * };
 * const operations = buildIROperations(paths);
 * console.log(operations.length); // 2
 * ```
 *
 * @internal
 */
export function buildIROperations(paths: PathsObject | undefined): IROperation[] {
  if (!paths) {
    return [];
  }

  const operations: IROperation[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (pathItem) {
      const pathOperations = extractPathOperations(path, pathItem);
      operations.push(...pathOperations);
    }
  }

  return operations;
}

/**
 * Extract all operations for a single path.
 * @internal
 */
function extractPathOperations(path: string, pathItem: PathItemObject): IROperation[] {
  const operations: IROperation[] = [];
  const httpMethods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  for (const method of httpMethods) {
    const operation = pathItem[method];
    if (!operation || typeof operation !== 'object' || isReferenceObject(operation)) {
      continue;
    }

    const irOperation = buildIROperation(method, path, operation);
    operations.push(irOperation);
  }

  return operations;
}

/**
 * Build single IR operation from OpenAPI operation object.
 *
 * Converts an OpenAPI operation definition into an IROperation structure,
 * extracting operationId, method, path, parameters, responses, and metadata.
 *
 * @param method - HTTP method for this operation
 * @param path - API path with parameter placeholders
 * @param operation - OpenAPI operation object
 * @param components - OpenAPI components for reference resolution
 * @returns IR operation with extracted metadata
 *
 * @internal
 */
function buildIROperation(
  method: HttpMethod,
  path: string,
  operation: OperationObject,
): IROperation {
  // Build minimal context for schema resolution
  const minimalDoc: OpenAPIObject = {
    openapi: '3.1.0',
    info: { title: '', version: '' },
  };

  const context: IRBuildContext = {
    doc: minimalDoc,
    path: [path, method],
    required: false,
  };

  // Build core operation structure
  const irOperation: IROperation = {
    operationId: operation.operationId ?? `${method}${path.replace(/\W/g, '')}`,
    method,
    path,
    parameters: buildIRParameters(operation.parameters, context),
    responses: buildIRResponses(operation.responses, context),
  };

  // Add optional fields
  addOptionalOperationFields(irOperation, operation, context);

  return irOperation;
}

/**
 * Add optional fields to IR operation if present in source.
 * @internal
 */
function addOptionalOperationFields(
  irOperation: IROperation,
  operation: OperationObject,
  context: IRBuildContext,
): void {
  if (operation.summary) {
    irOperation.summary = operation.summary;
  }
  if (operation.description) {
    irOperation.description = operation.description;
  }
  if (operation.requestBody) {
    irOperation.requestBody = buildIRRequestBody(operation.requestBody, context);
  }
  if (operation.security) {
    irOperation.security = buildIRSecurity(operation.security);
  }
  if (operation.tags) {
    irOperation.tags = operation.tags;
  }
  // Check deprecated status - property is part of OpenAPI 3.1 spec
  // Using Reflect to avoid false-positive deprecation linter warnings
  const deprecatedKey = 'deprecated';
  if (Object.hasOwn(operation, deprecatedKey)) {
    const deprecatedValue = Reflect.get(operation, deprecatedKey);
    if (deprecatedValue === true) {
      Reflect.set(irOperation, deprecatedKey, true);
    }
  }
}

/**
 * Build IR security requirements from OpenAPI security array.
 *
 * Converts security requirement objects into IRSecurityRequirement structures
 * with scheme names and OAuth2 scopes.
 *
 * @param security - OpenAPI security requirements array
 * @returns Array of IR security requirements
 *
 * @internal
 */
function buildIRSecurity(security: SecurityRequirementObject[]): IRSecurityRequirement[] {
  return security.flatMap((securityReq): IRSecurityRequirement[] => {
    return Object.entries(securityReq).map(([schemeName, scopes]): IRSecurityRequirement => {
      return {
        schemeName,
        scopes: scopes ?? [],
      };
    });
  });
}
