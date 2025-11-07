import { isReferenceObject } from 'openapi3-ts/oas31';
import type {
  ComponentsObject,
  OpenAPIObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';

export interface SecuritySchemeRequirement {
  schemeName: string;
  scheme: SecuritySchemeObject;
  scopes: string[];
}

export interface SecurityRequirementSet {
  schemes: SecuritySchemeRequirement[];
}

export interface OperationSecurityMetadata {
  isPublic: boolean;
  usesGlobalSecurity: boolean;
  requirementSets: SecurityRequirementSet[];
}

/**
 * Resolve the Layer 2 (upstream API) security requirements for an operation.
 *
 * @remarks
 * - Operation-level `security` overrides document-level defaults.
 * - An explicit empty array (`security: []`) denotes a public endpoint.
 * - Each object in the security array represents an OR clause; keys inside the object
 *   represent AND requirements (all schemes must be satisfied together).
 * - Layer 1 (MCP protocol authentication) is out of scope for this helper and must be
 *   resolved by the MCP SDK during transport negotiation.
 */
export function resolveOperationSecurity({
  document,
  operationSecurity,
}: {
  document: OpenAPIObject;
  operationSecurity: SecurityRequirementObject[] | undefined;
}): OperationSecurityMetadata {
  const securitySchemes = document.components?.securitySchemes ?? {};
  const selection = selectSecurityRequirements(operationSecurity, document.security ?? []);

  if (selection.kind === 'public') {
    return { isPublic: true, usesGlobalSecurity: false, requirementSets: [] };
  }

  const requirementSets = selection.requirements.map((requirement) => ({
    schemes: resolveRequirement(requirement, securitySchemes),
  }));

  return {
    isPublic: requirementSets.length === 0,
    usesGlobalSecurity: selection.usesGlobalDefaults,
    requirementSets,
  };
}

function resolveRequirement(
  requirement: SecurityRequirementObject,
  schemes: ComponentsObject['securitySchemes'],
): SecuritySchemeRequirement[] {
  return Object.entries(requirement).map(([schemeName, scopes]) => {
    const scheme = schemes?.[schemeName];

    if (!scheme) {
      throw new Error(`Missing security scheme "${schemeName}" in OpenAPI components`);
    }

    if (isReferenceObject(scheme)) {
      throw new Error(`Security scheme "${schemeName}" must be resolved before extraction`);
    }

    return {
      schemeName,
      scheme,
      scopes: Array.isArray(scopes) ? scopes : [],
    };
  });
}

type SecuritySelection =
  | { kind: 'public' }
  | {
      kind: 'requirements';
      requirements: SecurityRequirementObject[];
      usesGlobalDefaults: boolean;
    };

function selectSecurityRequirements(
  operationSecurity: SecurityRequirementObject[] | undefined,
  globalSecurity: SecurityRequirementObject[],
): SecuritySelection {
  if (operationSecurity !== undefined) {
    if (operationSecurity.length === 0) {
      return { kind: 'public' };
    }
    return { kind: 'requirements', requirements: operationSecurity, usesGlobalDefaults: false };
  }

  if (globalSecurity.length === 0) {
    return { kind: 'public' };
  }

  return { kind: 'requirements', requirements: globalSecurity, usesGlobalDefaults: true };
}
