/**
 * IR-based Security Resolution for MCP Tools.
 *
 * Resolves operation security requirements from IR types (`CastrDocument`, `CastrOperation`)
 * instead of raw OpenAPI objects, ensuring the IR remains the single source of truth.
 */

import type { SecuritySchemeObject } from '../../../shared/openapi-types.js';
import type {
  OperationSecurityMetadata,
  SecuritySchemeRequirement,
} from '../../conversion/json-schema/index.js';
import type { CastrDocument, CastrOperation, IRSecurityRequirement } from '../../ir/index.js';

const SECURITY_COMPONENT_TYPE = 'securityScheme';
const SECURITY_SELECTION_PUBLIC = 'public';
const SECURITY_SELECTION_REQUIREMENTS = 'requirements';

/**
 * Resolve the security requirements for an operation from the IR.
 *
 * This function reads entirely from IR types (`CastrDocument`, `CastrOperation`) and produces
 * `OperationSecurityMetadata` compatible with the existing MCP tool infrastructure.
 *
 * @remarks
 * - Operation-level `security` overrides document-level defaults.
 * - An explicit empty array (`security: []`) denotes a public endpoint.
 * - Each `IRSecurityRequirement` is one OR alternative; the schemes inside
 *   it are AND members that must all be satisfied together.
 * - A requirement with no schemes is the spec's empty requirement (`{}`):
 *   anonymous access is supported, so the operation is public — the
 *   requirement sets stay intact so consumers can still offer credentials
 *   for the non-empty alternatives.
 * - The function resolves scheme details from `ir.components` (filtered by `type: 'securityScheme'`).
 *
 * @param ir - The CastrDocument containing component security schemes and optional global security
 * @param operation - The CastrOperation with optional operation-level security
 * @returns OperationSecurityMetadata with resolved scheme details
 *
 * @throws `Error` When a referenced security scheme is not found in IR components
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
 * const operation = { security: [{ schemes: [{ schemeName: 'bearerAuth', scopes: [] }] }] };
 * const result = resolveOperationSecurityFromIR(ir, operation);
 * // { isPublic: false, usesGlobalSecurity: false, requirementSets: [...] }
 * ```
 *
 * @example Falling back to global security
 * ```typescript
 * const ir = { security: [{ schemes: [{ schemeName: 'bearerAuth', scopes: [] }] }], ... };
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

  if (selection.kind === SECURITY_SELECTION_PUBLIC) {
    return { isPublic: true, usesGlobalSecurity: false, requirementSets: [] };
  }

  // Resolve each requirement to include full scheme details
  const requirementSets = selection.requirements.map((requirement) => ({
    schemes: resolveRequirement(requirement, securitySchemes),
  }));

  // An empty scheme set is the spec's empty requirement ({}): the operation
  // is satisfiable with no credentials, so it is public — the sets stay
  // intact so consumers can still present the credentialed alternatives.
  const anonymousAccessSupported = requirementSets.some((set) => set.schemes.length === 0);

  return {
    isPublic: requirementSets.length === 0 || anonymousAccessSupported,
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
    if (component.type === SECURITY_COMPONENT_TYPE) {
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
 * One requirement is one OR alternative; every scheme it names (AND members)
 * resolves to one entry in the returned set, preserving IR order.
 *
 * @param requirement - The IR security requirement (one group of schemes)
 * @param schemes - Lookup map of security scheme definitions
 * @returns One resolved scheme requirement per AND member (empty for the spec's `{}` requirement)
 *
 * @throws `Error` When a named security scheme is not found in the lookup
 *
 * @internal
 */
function resolveRequirement(
  requirement: IRSecurityRequirement,
  schemes: Map<string, SecuritySchemeObject>,
): SecuritySchemeRequirement[] {
  return requirement.schemes.map((member) => {
    const scheme = schemes.get(member.schemeName);

    if (!scheme) {
      throw new Error(`Missing security scheme "${member.schemeName}" in IR components`);
    }

    return {
      schemeName: member.schemeName,
      scheme,
      scopes: member.scopes,
    };
  });
}

/**
 * Internal type for security selection result.
 * @internal
 */
type SecuritySelection =
  | { kind: typeof SECURITY_SELECTION_PUBLIC }
  | {
      kind: typeof SECURITY_SELECTION_REQUIREMENTS;
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
      return { kind: SECURITY_SELECTION_PUBLIC };
    }
    return {
      kind: SECURITY_SELECTION_REQUIREMENTS,
      requirements: operationSecurity,
      usesGlobalDefaults: false,
    };
  }

  // Fall back to global security
  if (!globalSecurity || globalSecurity.length === 0) {
    return { kind: SECURITY_SELECTION_PUBLIC };
  }

  return {
    kind: SECURITY_SELECTION_REQUIREMENTS,
    requirements: globalSecurity,
    usesGlobalDefaults: true,
  };
}
