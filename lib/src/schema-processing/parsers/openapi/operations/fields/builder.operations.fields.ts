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
  addExtendedOperationFields(irOperation, operation);
}

function addExtendedOperationFields(
  irOperation: CastrOperationLike,
  operation: OperationObject,
): void {
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

export function addPathItemFields(irOperation: CastrOperationLike, pathItem: PathItemObject): void {
  if (pathItem.summary) {
    irOperation.pathItemSummary = pathItem.summary;
  }
  if (pathItem.description) {
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

export function buildIRSecurity(security: SecurityRequirementObject[]): IRSecurityRequirement[] {
  return security.flatMap((securityRequirement): IRSecurityRequirement[] => {
    return Object.entries(securityRequirement).map(([schemeName, scopes]) => ({
      schemeName,
      scopes: scopes ?? [],
    }));
  });
}

export type { CastrOperationLike, HttpMethod };
