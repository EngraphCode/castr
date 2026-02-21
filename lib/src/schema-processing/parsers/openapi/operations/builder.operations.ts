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
  OpenAPIObject,
  PathItemObject,
  OperationObject,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { HttpMethod } from '../../../../endpoints/definition.types.js';
import type { IRBuildContext } from '../builder.types.js';
import { buildCastrParameters } from './builder.parameters.js';
import { buildIRRequestBody } from './builder.request-body.js';
import { buildCastrResponses } from './builder.responses.js';
import type { CastrOperation, IRSecurityRequirement } from '../../../ir/index.js';

/**
 * Build IR operations from OpenAPI paths object.
 *
 * Extracts all HTTP operations from the paths section, converting each
 * path+method combination into an CastrOperation structure with metadata.
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
 * const operations = buildCastrOperations(paths);
 * console.log(operations.length); // 2
 * ```
 *
 * @internal
 */
export function buildCastrOperations(doc: OpenAPIObject): CastrOperation[] {
  if (!doc.paths) {
    return [];
  }

  const operations: CastrOperation[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (pathItem) {
      const pathOperations = extractPathOperations(path, pathItem, doc);
      operations.push(...pathOperations);
    }
  }

  return operations;
}

/**
 * Extract all operations for a single path.
 * @internal
 */
function extractPathOperations(
  path: string,
  pathItem: PathItemObject,
  doc: OpenAPIObject,
): CastrOperation[] {
  const operations: CastrOperation[] = [];
  const httpMethods: HttpMethod[] = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'head',
    'options',
    'trace',
  ];

  for (const method of httpMethods) {
    const operation = pathItem[method];
    if (!operation || typeof operation !== 'object' || isReferenceObject(operation)) {
      continue;
    }

    // Merge path-level parameters with operation-level parameters
    // Operation-level parameters take precedence (though usually they are distinct)
    // Path-level $ref parameters are NOT merged here — they're tracked separately
    // as pathItemParameterRefs to preserve DRY structure
    const pathLevelParams = pathItem.parameters || [];
    const nonRefPathParams = pathLevelParams.filter((p) => !isReferenceObject(p));
    const mergedParameters = [...nonRefPathParams, ...(operation.parameters || [])];

    // Create a new operation object with merged parameters to avoid mutating the original
    const operationWithoutParams = { ...operation };
    delete operationWithoutParams.parameters;

    const operationWithParams: OperationObject = {
      ...operationWithoutParams,
      ...(mergedParameters.length > 0 ? { parameters: mergedParameters } : {}),
    };

    const irOperation = buildCastrOperation(method, path, operationWithParams, pathItem, doc);
    operations.push(irOperation);
  }

  return operations;
}

/**
 * Build single IR operation from OpenAPI operation object.
 *
 * Converts an OpenAPI operation definition into an CastrOperation structure,
 * extracting operationId, method, path, parameters, responses, and metadata.
 *
 * @param method - HTTP method for this operation
 * @param path - API path with parameter placeholders
 * @param operation - OpenAPI operation object
 * @param pathItem - OpenAPI path item object (for path-level fields)
 * @param doc - Full OpenAPI document for reference resolution
 * @returns IR operation with extracted metadata
 *
 * @internal
 */
function buildCastrOperation(
  method: HttpMethod,
  path: string,
  operation: OperationObject,
  pathItem: PathItemObject,
  doc: OpenAPIObject,
): CastrOperation {
  // Build minimal context for schema resolution
  const context: IRBuildContext = {
    doc,
    path: [path, method],
    required: false,
  };

  // Build core operation structure
  const irOperation: CastrOperation = {
    ...(operation.operationId ? { operationId: operation.operationId } : {}),
    method,
    path,
    parameters: buildCastrParameters(operation.parameters, context),
    parametersByLocation: {
      query: [],
      path: [],
      header: [],
      cookie: [],
    },
    responses: buildCastrResponses(operation.responses, context),
  };

  // Populate parametersByLocation
  for (const param of irOperation.parameters) {
    if (param.in in irOperation.parametersByLocation) {
      irOperation.parametersByLocation[param.in].push(param);
    }
  }

  // Add optional operation-level fields
  addOptionalOperationFields(irOperation, operation, context);

  // Add PathItem-level fields
  addPathItemFields(irOperation, pathItem);

  return irOperation;
}

/**
 * Add optional fields to IR operation if present in source.
 * @internal
 */
function addBasicOperationFields(
  irOperation: CastrOperation,
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
}

function addExtendedOperationFields(irOperation: CastrOperation, operation: OperationObject): void {
  // Check deprecated status - property is part of OpenAPI 3.1 spec
  // Using Reflect to avoid false-positive deprecation linter warnings
  const deprecatedKey = 'deprecated';
  if (Object.hasOwn(operation, deprecatedKey)) {
    const deprecatedValue = Reflect.get(operation, deprecatedKey);
    if (deprecatedValue === true) {
      Reflect.set(irOperation, deprecatedKey, true);
    }
  }
  if (operation.externalDocs) {
    irOperation.externalDocs = operation.externalDocs;
  }
  if (operation.callbacks) {
    irOperation.callbacks = operation.callbacks;
  }
  if (operation.servers) {
    irOperation.servers = operation.servers;
  }
}

function addOptionalOperationFields(
  irOperation: CastrOperation,
  operation: OperationObject,
  context: IRBuildContext,
): void {
  addBasicOperationFields(irOperation, operation, context);
  addExtendedOperationFields(irOperation, operation);
}

/**
 * Add PathItem-level metadata fields to IR operation.
 * @internal
 */
function addPathItemMetadata(irOperation: CastrOperation, pathItem: PathItemObject): void {
  if (pathItem.summary) {
    irOperation.pathItemSummary = pathItem.summary;
  }
  if (pathItem.description) {
    irOperation.pathItemDescription = pathItem.description;
  }
  if (pathItem.servers) {
    irOperation.pathItemServers = pathItem.servers;
  }
}

/**
 * Extract path-level parameter refs to preserve DRY structure.
 * @internal
 */
function extractPathItemParameterRefs(irOperation: CastrOperation, pathItem: PathItemObject): void {
  if (!pathItem.parameters || pathItem.parameters.length === 0) {
    return;
  }

  const paramRefs: string[] = [];
  for (const param of pathItem.parameters) {
    if (isReferenceObject(param)) {
      paramRefs.push(param.$ref);
    }
  }
  if (paramRefs.length > 0) {
    irOperation.pathItemParameterRefs = paramRefs;
  }
}

/**
 * Add PathItem-level fields to IR operation.
 * @internal
 */
function addPathItemFields(irOperation: CastrOperation, pathItem: PathItemObject): void {
  addPathItemMetadata(irOperation, pathItem);
  extractPathItemParameterRefs(irOperation, pathItem);
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
 * @public
 */
export function buildIRSecurity(security: SecurityRequirementObject[]): IRSecurityRequirement[] {
  return security.flatMap((securityReq): IRSecurityRequirement[] => {
    return Object.entries(securityReq).map(([schemeName, scopes]): IRSecurityRequirement => {
      return {
        schemeName,
        scopes: scopes ?? [],
      };
    });
  });
}
