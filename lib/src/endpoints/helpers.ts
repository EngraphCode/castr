/**
 * Pure helper functions for endpoint generation
 * Extracted to reduce cognitive complexity in getEndpointDefinitionList.ts
 *
 * Each function has a single responsibility and is < 50 lines
 */

export type { EndpointContext } from './helpers.naming.js';
export {
  findExistingSchemaVar,
  generateUniqueVarName,
  getSchemaVarName,
  handleInlineEverything,
  handleRefSchema,
  registerSchemaName,
} from './helpers.naming.js';

/**
 * Checks if schema should be inlined (no variable extraction)
 * Returns true if complexity is below threshold or threshold is -1
 */
export function shouldInlineSchema(complexity: number, complexityThreshold: number): boolean {
  // Special case: -1 means always inline everything
  if (complexityThreshold === -1) {
    return true;
  }

  // Simple schemas below threshold should be inlined
  return complexity < complexityThreshold;
}
