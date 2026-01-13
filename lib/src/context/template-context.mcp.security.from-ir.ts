/**
 * IR-based Security Resolution for MCP Tools.
 *
 * Resolves operation security requirements from IR types (`CastrDocument`, `CastrOperation`)
 * instead of raw OpenAPI objects, ensuring the IR remains the single source of truth.
 *
 * @module template-context.mcp.security.from-ir
 */

import type { SecuritySchemeObject } from 'openapi3-ts/oas31';
import type { CastrDocument, CastrOperation, IRSecurityRequirement } from '../ir/schema.js';
import type {
  OperationSecurityMetadata,
  SecuritySchemeRequirement,
} from '../conversion/json-schema/security/extract-operation-security.js';

/**
 * Resolve the security requirements for an operation from the IR.
 *
 * This function reads entirely from IR types (`CastrDocument`, `CastrOperation`) and produces
 * `OperationSecurityMetadata` compatible with the existing MCP tool infrastructure.
 *
 * @remarks
 * - Operation-level `security` overrides document-level defaults.
 * - An explicit empty array (`security: []`) denotes a public endpoint.
 * - Each `IRSecurityRequirement` in the operation's security array represents an OR clause.
 * - The function resolves scheme details from `ir.components` (filtered by `type: 'securityScheme'`).
 *
 * @param ir - The CastrDocument containing component security schemes and optional global security
 * @param operation - The CastrOperation with optional operation-level security
 * @returns OperationSecurityMetadata with resolved scheme details
 *
 * @throws {Error} When a referenced security scheme is not found in IR components
 *
 * @example Public endpoint (empty security array)
 * ```typescript
 * const operation = { security: [] };
 * const result = resolveOperationSecurityFromIR(ir, operation);
 * // { isPublic: true, usesGlobalSecurity: false, requirementSets: [] }
 * ```
 *
 * @example Operation with security
 * ```typescript
 * const operation = { security: [{ schemeName: 'bearerAuth', scopes: [] }] };
 * const result = resolveOperationSecurityFromIR(ir, operation);
 * // { isPublic: false, usesGlobalSecurity: false, requirementSets: [...] }
 * ```
 *
 * @example Falling back to global security
 * ```typescript
 * const ir = { security: [{ schemeName: 'bearerAuth', scopes: [] }], ... };
 * const operation = { security: undefined };
 * const result = resolveOperationSecurityFromIR(ir, operation);
 * // { isPublic: false, usesGlobalSecurity: true, requirementSets: [...] }
 * ```
 *
 * @see {@link OperationSecurityMetadata} for return type details
 * @public
 */
export function resolveOperationSecurityFromIR(
  ir: CastrDocument,
  operation: Pick<CastrOperation, 'security'>,
): OperationSecurityMetadata {
  // Build a lookup map of security schemes from IR components
  const securitySchemes = buildSecuritySchemeLookup(ir);

  // Select which security requirements to use (operation-level or global)
  const selection = selectSecurityRequirements(operation.security, ir.security);

  if (selection.kind === 'public') {
    return { isPublic: true, usesGlobalSecurity: false, requirementSets: [] };
  }

  // Resolve each requirement to include full scheme details
  const requirementSets = selection.requirements.map((requirement) => ({
    schemes: resolveRequirement(requirement, securitySchemes),
  }));

  return {
    isPublic: requirementSets.length === 0,
    usesGlobalSecurity: selection.usesGlobalDefaults,
    requirementSets,
  };
}

/**
 * Build a lookup map of security scheme names to their definitions.
 *
 * @param ir - The CastrDocument containing components
 * @returns Map from scheme name to SecuritySchemeObject
 *
 * @internal
 */
function buildSecuritySchemeLookup(ir: CastrDocument): Map<string, SecuritySchemeObject> {
  const lookup = new Map<string, SecuritySchemeObject>();

  for (const component of ir.components) {
    if (component.type === 'securityScheme') {
      // TypeScript narrows component to IRSecuritySchemeComponent here
      // IR security schemes should already be resolved (not references)
      // If it's a reference, we throw as that indicates a bug in IR building
      if ('$ref' in component.scheme) {
        throw new Error(
          `Security scheme "${component.name}" is a reference and should have been resolved during IR building`,
        );
      }
      lookup.set(component.name, component.scheme);
    }
  }

  return lookup;
}

/**
 * Resolve a single security requirement to include full scheme details.
 *
 * @param requirement - The IR security requirement (scheme name + scopes)
 * @param schemes - Lookup map of security scheme definitions
 * @returns Array of resolved scheme requirements (usually 1 element for single requirement)
 *
 * @throws {Error} When the security scheme is not found in the lookup
 *
 * @internal
 */
function resolveRequirement(
  requirement: IRSecurityRequirement,
  schemes: Map<string, SecuritySchemeObject>,
): SecuritySchemeRequirement[] {
  const scheme = schemes.get(requirement.schemeName);

  if (!scheme) {
    throw new Error(`Missing security scheme "${requirement.schemeName}" in IR components`);
  }

  return [
    {
      schemeName: requirement.schemeName,
      scheme,
      scopes: requirement.scopes,
    },
  ];
}

/**
 * Internal type for security selection result.
 * @internal
 */
type SecuritySelection =
  | { kind: 'public' }
  | {
      kind: 'requirements';
      requirements: IRSecurityRequirement[];
      usesGlobalDefaults: boolean;
    };

/**
 * Select which security requirements apply to an operation.
 *
 * Follows OpenAPI specification:
 * - Operation-level security overrides document-level defaults
 * - An empty array at operation level means public endpoint
 * - If no operation security, fall back to global security
 * - If no global security either, endpoint is public
 *
 * @param operationSecurity - Operation-level security (undefined = inherit, [] = public)
 * @param globalSecurity - Document-level default security
 * @returns Selection indicating public or specific requirements
 *
 * @internal
 */
function selectSecurityRequirements(
  operationSecurity: IRSecurityRequirement[] | undefined,
  globalSecurity: IRSecurityRequirement[] | undefined,
): SecuritySelection {
  // Operation-level security is defined (including empty array)
  if (operationSecurity !== undefined) {
    if (operationSecurity.length === 0) {
      return { kind: 'public' };
    }
    return { kind: 'requirements', requirements: operationSecurity, usesGlobalDefaults: false };
  }

  // Fall back to global security
  if (!globalSecurity || globalSecurity.length === 0) {
    return { kind: 'public' };
  }

  return { kind: 'requirements', requirements: globalSecurity, usesGlobalDefaults: true };
}
