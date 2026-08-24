import {
  isReferenceObject,
  type ComponentsObject,
  type OpenAPIDocument,
  type SecurityRequirementObject,
  type SecuritySchemeObject,
} from '../../../../shared/openapi-types.js';
import {
  SECURITY_SELECTION_KIND_PUBLIC,
  SECURITY_SELECTION_KIND_REQUIREMENTS,
} from '../json-schema-constants.js';

/**
 * One resolved scheme reference inside a requirement set: the component name,
 * the resolved scheme object, and the scopes (or role names) verbatim.
 * Distinct from the IR-level `IRSecuritySchemeRequirement`, which carries the
 * name and scopes only.
 */
export interface SecuritySchemeRequirement {
  /** Security scheme name from components/securitySchemes. */
  schemeName: string;
  /** The resolved scheme definition (never a reference). */
  scheme: SecuritySchemeObject;
  /** OAuth2/OpenID scopes — or role names for other scheme types — verbatim. */
  scopes: string[];
}

/**
 * One OR alternative of an operation's security formula: every scheme in the
 * set must be satisfied together (AND). An empty set is the spec's empty
 * requirement (`{}`) — anonymous access is supported by this alternative.
 */
export interface SecurityRequirementSet {
  /** The AND members of this alternative, in authored order. */
  schemes: SecuritySchemeRequirement[];
}

/**
 * Resolved security metadata for one operation, shared by the raw-OpenAPI and
 * IR-based resolvers.
 */
export interface OperationSecurityMetadata {
  /**
   * True when the operation is satisfiable with no credentials: there are no
   * requirement sets, or at least one set has zero schemes (the spec's `{}`
   * alternative). `isPublic: true` therefore does NOT imply `requirementSets`
   * is empty — when both hold, the non-empty sets are optional credential
   * upgrades a consumer may still present.
   */
  isPublic: boolean;
  /** True when the requirements came from document-level defaults. */
  usesGlobalSecurity: boolean;
  /** The OR alternatives of the security formula, in authored order. */
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
 * - The empty requirement object (`{}`) means anonymous access is supported: the
 *   operation is public, and its requirement sets stay intact as optional
 *   credential upgrades — the same rule `resolveOperationSecurityFromIR` applies.
 * - Layer 1 (MCP protocol authentication) is out of scope for this helper and must be
 *   resolved by the MCP SDK during transport negotiation.
 */
export function resolveOperationSecurity({
  document,
  operationSecurity,
}: {
  document: OpenAPIDocument;
  operationSecurity: SecurityRequirementObject[] | undefined;
}): OperationSecurityMetadata {
  const securitySchemes = document.components?.securitySchemes ?? {};
  const selection = selectSecurityRequirements(operationSecurity, document.security ?? []);

  if (selection.kind === SECURITY_SELECTION_KIND_PUBLIC) {
    return { isPublic: true, usesGlobalSecurity: false, requirementSets: [] };
  }

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
      scopes: toValidatedScopes(schemeName, scopes),
    };
  });
}

/**
 * Validate one scheme entry's scope value at the vendor boundary.
 *
 * The vendor type declares `string[]`, but a malformed document can smuggle
 * `null` through (YAML `api_key:` with no value); invalid data throws rather
 * than being defaulted away — the same policy the OpenAPI parser applies.
 */
function toValidatedScopes(schemeName: string, scopes: unknown): string[] {
  if (
    !Array.isArray(scopes) ||
    !scopes.every((scope): scope is string => typeof scope === 'string')
  ) {
    throw new Error(
      `Security requirement scheme "${schemeName}" must map to an array of scope strings; ` +
        `received ${JSON.stringify(scopes)}.`,
    );
  }
  return scopes;
}

type SecuritySelection =
  | { kind: typeof SECURITY_SELECTION_KIND_PUBLIC }
  | {
      kind: typeof SECURITY_SELECTION_KIND_REQUIREMENTS;
      requirements: SecurityRequirementObject[];
      usesGlobalDefaults: boolean;
    };

function selectSecurityRequirements(
  operationSecurity: SecurityRequirementObject[] | undefined,
  globalSecurity: SecurityRequirementObject[],
): SecuritySelection {
  if (operationSecurity !== undefined) {
    if (operationSecurity.length === 0) {
      return { kind: SECURITY_SELECTION_KIND_PUBLIC };
    }
    return {
      kind: SECURITY_SELECTION_KIND_REQUIREMENTS,
      requirements: operationSecurity,
      usesGlobalDefaults: false,
    };
  }

  if (globalSecurity.length === 0) {
    return { kind: SECURITY_SELECTION_KIND_PUBLIC };
  }

  return {
    kind: SECURITY_SELECTION_KIND_REQUIREMENTS,
    requirements: globalSecurity,
    usesGlobalDefaults: true,
  };
}
