import type {
  OperationObject,
  PathItemObject,
  SecurityRequirementObject,
} from '../../../../shared/openapi-types.js';
import { writeRequestBody, writeResponses } from './openapi-writer.bodies.js';
import { writeParameterObject } from '../openapi-writer.parameters.js';
import type {
  CastrParameter,
  IRSecurityRequirement,
  IRSecuritySchemeRequirement,
} from '../../../ir/index.js';
import type { CastrOperationLike } from './openapi-writer.operations.entries.js';

function compareSchemeRequirements(
  left: IRSecuritySchemeRequirement,
  right: IRSecuritySchemeRequirement,
): number {
  return left.schemeName.localeCompare(right.schemeName);
}

function securityRequirementSortKey(requirement: IRSecurityRequirement): string {
  return requirement.schemes.map((scheme) => scheme.schemeName).join(',');
}

function compareSecurityRequirements(
  left: IRSecurityRequirement,
  right: IRSecurityRequirement,
): number {
  return securityRequirementSortKey(left).localeCompare(securityRequirementSortKey(right));
}

function writeParameter(param: CastrParameter): ReturnType<typeof writeParameterObject> {
  return writeParameterObject(param);
}

/**
 * Converts IR security requirement sets to OpenAPI SecurityRequirementObject[].
 *
 * Reconstructs exactly ONE Security Requirement Object per AND-set so the
 * AND-grouping of schemes survives the round-trip. Schemes within each set
 * and the alternative sets themselves are sorted for deterministic output.
 *
 * @param security - The IR security requirement sets (OR alternatives)
 * @returns OpenAPI security requirement objects
 *
 * @internal
 */
export function writeSecurityRequirements(
  security: IRSecurityRequirement[],
): SecurityRequirementObject[] {
  const sortedRequirements = security
    .map((requirement) => [...requirement.schemes].sort(compareSchemeRequirements))
    .map((schemes): IRSecurityRequirement => ({ schemes }))
    .sort(compareSecurityRequirements);

  return sortedRequirements.map((requirement) => {
    const requirementObject: SecurityRequirementObject = {};
    for (const scheme of requirement.schemes) {
      requirementObject[scheme.schemeName] = scheme.scopes;
    }
    return requirementObject;
  });
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

  // An explicit empty array is a meaningful override (it disables
  // document-level security for this operation) and must be re-emitted
  // distinct from absent.
  if (operation.security !== undefined) {
    result.security = writeSecurityRequirements(operation.security);
  }

  return result;
}

function applyPathItemMetadata(operation: CastrOperationLike, pathItem: PathItemObject): void {
  if (operation.pathItemSummary !== undefined && pathItem.summary === undefined) {
    pathItem.summary = operation.pathItemSummary;
  }
  if (operation.pathItemDescription !== undefined && pathItem.description === undefined) {
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
