import { sortBy, snakeCase } from 'lodash-es';
import { getSchemaNameFromRef as getSchemaName } from '../ref-resolution.js';

/**
 * Extract and normalize schema name from a component schema $ref
 * Handles both full refs (#/components/schemas/Pet) and bare names (Pet)
 * @internal
 */
function getSchemaNameFromRef(ref: string): string {
  // If it's not a ref (doesn't start with #/), treat it as a bare name
  if (!ref.startsWith('#/')) {
    return snakeCase(ref);
  }

  const name = getSchemaName(ref);
  return snakeCase(name);
}

/**
 * Sort schema code dictionary by dependency order
 *
 * Ensures schemas appear in the correct order in generated files,
 * with dependencies before dependents.
 *
 * @param schemas - Dictionary mapping schema names to generated code strings
 * @param dependencyOrder - Array of schema reference paths in dependency order
 * @returns New dictionary with keys reordered
 *
 * @example
 * const schemas = { User: "z.object(...)", Pet: "z.object(...)" };
 * const ordered = sortSchemasByDependencyOrder(schemas, ["#/components/schemas/Pet", "#/components/schemas/User"]);
 * // Result: { Pet: "z.object(...)", User: "z.object(...)" }
 */
export function sortSchemasByDependencyOrder(
  schemas: Record<string, string>,
  dependencyOrder: readonly string[],
): Record<string, string> {
  // Convert refs to schema names for matching
  const orderMap = new Map(dependencyOrder.map((ref, idx) => [getSchemaNameFromRef(ref), idx]));
  // Also normalize schema keys when looking up in orderMap
  const entries = sortBy(
    Object.entries(schemas),
    ([key]) => orderMap.get(getSchemaNameFromRef(key)) ?? Infinity,
  );
  return Object.fromEntries(entries);
}

/**
 * Sort schema names by dependency order
 *
 * Orders schema names so dependencies appear before dependents.
 * Names not in the reference order are placed at the end.
 *
 * @param schemaNames - Array of schema names to sort
 * @param dependencyOrder - Reference array defining the correct order
 * @returns New array with names sorted by dependency order
 *
 * @example
 * sortSchemaNamesByDependencyOrder(["User", "Pet"], ["Pet", "User"])
 * // Result: ["Pet", "User"]
 */
export function sortSchemaNamesByDependencyOrder<T extends string>(
  schemaNames: T[],
  dependencyOrder: readonly T[],
): T[] {
  const orderMap = new Map(dependencyOrder.map((item, idx) => [item, idx]));
  return sortBy(schemaNames, (item) => orderMap.get(item) ?? Infinity);
}
