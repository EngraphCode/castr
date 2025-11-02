import { sortBy } from 'lodash-es';

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
  const orderMap = new Map(dependencyOrder.map((key, idx) => [key, idx]));
  const entries = sortBy(Object.entries(schemas), ([key]) => orderMap.get(key) ?? Infinity);
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
