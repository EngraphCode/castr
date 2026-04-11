import type {
  OperationObject,
  PathItemObject,
  SecurityRequirementObject,
} from '../../../../shared/openapi-types.js';
import { writeRequestBody, writeResponses } from './openapi-writer.bodies.js';
import { writeParameterObject } from '../openapi-writer.parameters.js';
import type { CastrParameter, IRSecurityRequirement } from '../../../ir/index.js';
import type { CastrOperationLike } from './openapi-writer.operations.entries.js';

function compareSecurityRequirements(
  left: IRSecurityRequirement,
  right: IRSecurityRequirement,
): number {
  return left.schemeName.localeCompare(right.schemeName);
}

function writeParameter(param: CastrParameter): ReturnType<typeof writeParameterObject> {
  return writeParameterObject(param);
}

function writeSecurity(security: IRSecurityRequirement[]): SecurityRequirementObject[] {
  const sortedSecurity = [...security].sort(compareSecurityRequirements);
  return sortedSecurity.map((req) => ({
    [req.schemeName]: req.scopes,
  }));
}

function writeCoreMetadata(operation: CastrOperationLike, result: OperationObject): void {
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

function writeExtendedMetadata(operation: CastrOperationLike, result: OperationObject): void {
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

function writeOperationMetadata(operation: CastrOperationLike, result: OperationObject): void {
  writeCoreMetadata(operation, result);
  writeExtendedMetadata(operation, result);
}

export function writeOperation(operation: CastrOperationLike): OperationObject {
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

function applyPathItemMetadata(operation: CastrOperationLike, pathItem: PathItemObject): void {
  if (operation.pathItemSummary && !pathItem.summary) {
    pathItem.summary = operation.pathItemSummary;
  }
  if (operation.pathItemDescription && !pathItem.description) {
    pathItem.description = operation.pathItemDescription;
  }
}

function applyPathItemExtras(operation: CastrOperationLike, pathItem: PathItemObject): void {
  if (operation.pathItemServers && !pathItem.servers) {
    pathItem.servers = operation.pathItemServers;
  }
  if (operation.pathItemParameterRefs && !pathItem.parameters) {
    pathItem.parameters = operation.pathItemParameterRefs.map((ref) => ({ $ref: ref }));
  }
}

export function applyPathItemFields(operation: CastrOperationLike, pathItem: PathItemObject): void {
  applyPathItemMetadata(operation, pathItem);
  applyPathItemExtras(operation, pathItem);
}
