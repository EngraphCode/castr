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
  IRSecuritySchemeRequirement,
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

/**
 * Build the IR security formula from an OpenAPI `security` array.
 *
 * Grouping is preserved exactly: each Security Requirement Object becomes one
 * {@link IRSecurityRequirement} whose `schemes` are that object's entries in
 * authored order (AND within the group, OR across the array). The spec's
 * empty requirement (`{}`, anonymous access supported) survives as a
 * requirement with no schemes; duplicate alternatives are never merged.
 *
 * @param security - The document- or operation-level `security` array
 * @returns One IR requirement per OR alternative, grouping intact
 *
 * @throws `Error` when a scheme's scope value is not an array of strings —
 * the declared vendor type promises `string[]`, so a violating document
 * (for example YAML `api_key:` with no value) fails fast here rather than
 * being silently canonicalised.
 *
 * @example `[{ a: [], b: [] }]` (a AND b) stays one group of two schemes
 * ```typescript
 * const ir = buildIRSecurity([{ a: [], b: [] }]);
 * // [{ schemes: [{ schemeName: 'a', scopes: [] }, { schemeName: 'b', scopes: [] }] }]
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#security-requirement-object | OpenAPI Security Requirement Object}
 */
export function buildIRSecurity(security: SecurityRequirementObject[]): IRSecurityRequirement[] {
  return security.map((securityRequirement): IRSecurityRequirement => ({
    schemes: Object.entries(securityRequirement).map(([schemeName, scopes]) =>
      buildIRSecuritySchemeRequirement(schemeName, scopes),
    ),
  }));
}

/**
 * Validate one scheme entry's scope value at the vendor boundary.
 *
 * The vendor type declares `string[]`, but a malformed document can smuggle
 * `null` through (YAML `api_key:` with no value); invalid data throws rather
 * than being defaulted away.
 */
function buildIRSecuritySchemeRequirement(
  schemeName: string,
  scopes: unknown,
): IRSecuritySchemeRequirement {
  if (
    !Array.isArray(scopes) ||
    !scopes.every((scope): scope is string => typeof scope === 'string')
  ) {
    throw new Error(
      `Security requirement scheme "${schemeName}" must map to an array of scope strings; ` +
        `received ${JSON.stringify(scopes)}.`,
    );
  }
  return { schemeName, scopes };
}

export type { CastrOperationLike, HttpMethod };
