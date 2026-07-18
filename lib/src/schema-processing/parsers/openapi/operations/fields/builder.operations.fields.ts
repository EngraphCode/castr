import type { HttpMethod } from '../../../../../endpoints/definition.types.js';
import {
  type OperationObject,
  type PathItemObject,
  type SecurityRequirementObject,
  isReferenceObject,
} from '../../../../../shared/openapi-types.js';
import type {
  CastrAdditionalOperation,
  CastrOperation,
  IRSecurityRequirement,
} from '../../../../ir/index.js';
import type { IRBuildContext } from '../../builder.types.js';
import { buildIRRequestBody } from '../builder.request-body.js';

type CastrOperationLike = CastrOperation | CastrAdditionalOperation;

export function mergePathAndOperationParameters(
  pathItem: PathItemObject,
  operation: OperationObject,
): OperationObject {
  const pathLevelParams = pathItem.parameters || [];
  const nonRefPathParams = pathLevelParams.filter((parameter) => !isReferenceObject(parameter));
  const mergedParameters = [...nonRefPathParams, ...(operation.parameters || [])];

  const operationWithoutParams = { ...operation };
  delete operationWithoutParams.parameters;

  return {
    ...operationWithoutParams,
    ...(mergedParameters.length > 0 ? { parameters: mergedParameters } : {}),
  };
}

export function addOptionalOperationFields(
  irOperation: CastrOperationLike,
  operation: OperationObject,
  context: IRBuildContext,
): void {
  if (operation.summary !== undefined) {
    irOperation.summary = operation.summary;
  }
  if (operation.description !== undefined) {
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
  addExtendedOperationFields(irOperation, operation);
}

function addExtendedOperationFields(
  irOperation: CastrOperationLike,
  operation: OperationObject,
): void {
  if (operation.deprecated === true) {
    irOperation.deprecated = true;
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

export function addPathItemFields(irOperation: CastrOperationLike, pathItem: PathItemObject): void {
  if (pathItem.summary !== undefined) {
    irOperation.pathItemSummary = pathItem.summary;
  }
  if (pathItem.description !== undefined) {
    irOperation.pathItemDescription = pathItem.description;
  }
  if (pathItem.servers) {
    irOperation.pathItemServers = pathItem.servers;
  }

  const pathItemParameterRefs = collectPathItemParameterRefs(pathItem);
  if (pathItemParameterRefs.length > 0) {
    irOperation.pathItemParameterRefs = pathItemParameterRefs;
  }
}

function collectPathItemParameterRefs(pathItem: PathItemObject): string[] {
  if (!pathItem.parameters || pathItem.parameters.length === 0) {
    return [];
  }

  const parameterRefs: string[] = [];
  for (const parameter of pathItem.parameters) {
    if (isReferenceObject(parameter)) {
      parameterRefs.push(parameter.$ref);
    }
  }

  return parameterRefs;
}

/**
 * Build IR security requirement sets from OpenAPI security requirement objects.
 *
 * Each OpenAPI Security Requirement Object is one AND-set: every scheme in it
 * must be satisfied together. The outer array lists OR alternatives. Both
 * levels are preserved — flattening the inner object would silently weaken
 * "A AND B" to "A OR B".
 */
export function buildIRSecurity(security: SecurityRequirementObject[]): IRSecurityRequirement[] {
  return security.map((securityRequirement): IRSecurityRequirement => {
    return {
      schemes: Object.entries(securityRequirement).map(([schemeName, scopes]) => ({
        schemeName,
        scopes: scopes ?? [],
      })),
    };
  });
}

export type { CastrOperationLike, HttpMethod };
