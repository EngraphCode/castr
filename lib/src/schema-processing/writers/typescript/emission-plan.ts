import type { TemplateContext } from '../../context/index.js';

const TEMPLATE_SCHEMAS_ONLY = 'schemas-only';

/** The symbol every generated file imports from Zod. */
export const ZOD_IMPORT_SYMBOL = 'z';
/** The symbol of the generated endpoints array. */
export const ENDPOINTS_SYMBOL = 'endpoints';
/** The symbol of the generated MCP tools array. */
export const MCP_TOOLS_SYMBOL = 'mcpTools';
const VALIDATION_HELPER_SYMBOLS: readonly string[] = ['validateRequest', 'validateResponse'];
const SCHEMA_REGISTRY_SYMBOL = 'buildSchemaRegistry';

/**
 * What one generated file declares besides its schema components. The same
 * plan drives emission and symbol reservation, so a component name is refused
 * exactly when the file declares that symbol.
 *
 * @internal
 */
export interface EmissionPlan {
  readonly endpoints: boolean;
  readonly mcpTools: boolean;
  readonly validationHelpers: boolean;
  readonly schemaRegistry: boolean;
}

/**
 * The plan of a file that declares schema components alone: the schemas-only
 * template and the common file of grouped output.
 *
 * @internal
 */
export const COMPONENTS_ONLY_PLAN: EmissionPlan = {
  endpoints: false,
  mcpTools: false,
  validationHelpers: false,
  schemaRegistry: false,
};

function hasItems<T>(items: readonly T[] | undefined): boolean {
  return items !== undefined && items.length > 0;
}

/**
 * Decide what the single generated file declares for this context.
 *
 * @param context - The template context being written
 * @returns The declarations the file makes besides its schema components
 * @internal
 */
export function planEmission(context: TemplateContext): EmissionPlan {
  const options = context.options;
  if (options?.template === TEMPLATE_SCHEMAS_ONLY) {
    return COMPONENTS_ONLY_PLAN;
  }
  return {
    endpoints: hasItems(context.endpoints),
    mcpTools: hasItems(context.mcpTools),
    validationHelpers: options?.withValidationHelpers === true,
    schemaRegistry: options?.withSchemaRegistry === true,
  };
}

/**
 * The symbols a file with this plan declares besides its schema components.
 *
 * @param plan - The file's emission plan
 * @returns The declared symbols, which no component may emit
 * @internal
 */
export function declaredSymbolsOf(plan: EmissionPlan): readonly string[] {
  return [
    ZOD_IMPORT_SYMBOL,
    ...(plan.endpoints ? [ENDPOINTS_SYMBOL] : []),
    ...(plan.mcpTools ? [MCP_TOOLS_SYMBOL] : []),
    ...(plan.validationHelpers ? VALIDATION_HELPER_SYMBOLS : []),
    ...(plan.schemaRegistry ? [SCHEMA_REGISTRY_SYMBOL] : []),
  ];
}
