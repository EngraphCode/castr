import { topologicalSort } from './topologicalSort.js';
import {
  sortSchemaNamesByDependencyOrder,
  sortSchemasByDependencyOrder,
} from './utils/schema-sorting.js';

/**
 * Extract schema name from a component schema $ref
 * @param ref - Full ref like '#/components/schemas/User'
 * @returns Schema name like 'User'
 */
export const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid schema $ref: ${ref}`);
  }
  return name;
};

/**
 * Calculate dependency counts across all groups.
 * Data gathering function that counts how many groups use each schema.
 *
 * @internal
 */
export const calculateDependencyCounts = (
  dependenciesByGroupName: Map<string, Set<string>>,
): Map<string, number> => {
  const dependenciesCount = new Map<string, number>();
  dependenciesByGroupName.forEach((deps) => {
    deps.forEach((dep) => {
      dependenciesCount.set(dep, (dependenciesCount.get(dep) ?? -1) + 1);
    });
  });
  return dependenciesCount;
};

/**
 * Separate common schemas from group-specific schemas.
 * Transformation function that categorizes schemas for file grouping.
 *
 * @internal
 */
export const separateCommonAndGroupSchemas = (
  groupSchemas: Record<string, string>,
  dependencyCounts: Map<string, number>,
  groupTypes: Record<string, string>,
): {
  groupSchemas: Record<string, string>;
  groupTypes: Record<string, string>;
  commonSchemaNames: Set<string>;
} => {
  const separatedSchemas: Record<string, string> = {};
  const separatedTypes: Record<string, string> = {};
  const commonSchemaNames = new Set<string>();

  Object.entries(groupSchemas).forEach(([name, schema]) => {
    const count = dependencyCounts.get(name) ?? 0;
    if (count >= 1) {
      commonSchemaNames.add(name);
    } else {
      separatedSchemas[name] = schema;
      const groupType = groupTypes[name];
      if (groupType) {
        separatedTypes[name] = groupType;
      }
    }
  });

  return {
    groupSchemas: separatedSchemas,
    groupTypes: separatedTypes,
    commonSchemaNames,
  };
};

/**
 * Process common schemas for file grouping strategy.
 * Transformation function that identifies and separates common schemas.
 *
 * @internal
 */
export const processCommonSchemasForGroups = (
  endpointsGroups: Record<string, MinimalTemplateContext>,
  dependenciesByGroupName: Map<string, Set<string>>,
  dependencyGraph: Record<string, Set<string>>,
): Set<string> => {
  const schemaOrderedByDependencies = topologicalSort(dependencyGraph);
  const dependenciesCount = calculateDependencyCounts(dependenciesByGroupName);
  const allCommonSchemaNames = new Set<string>();

  Object.keys(endpointsGroups).forEach((groupName) => {
    const group = endpointsGroups[groupName];
    if (!group) {
      return;
    }
    group.imports = {};

    const separated = separateCommonAndGroupSchemas(group.schemas, dependenciesCount, group.types);

    separated.commonSchemaNames.forEach((name) => {
      if (group.imports) {
        group.imports[name] = 'common';
      }
      allCommonSchemaNames.add(name);
    });

    group.schemas = sortSchemasByDependencyOrder(
      separated.groupSchemas,
      getPureSchemaNames(schemaOrderedByDependencies),
    );
    group.types = separated.groupTypes;
  });

  return new Set(
    sortSchemaNamesByDependencyOrder(
      [...allCommonSchemaNames],
      getPureSchemaNames(schemaOrderedByDependencies),
    ),
  );
};

// Local helpers/types to avoid circular imports
export interface MinimalTemplateContext {
  schemas: Record<string, string>;
  endpoints: unknown[];
  types: Record<string, string>;
  imports?: Record<string, string>;
}

export const getPureSchemaNames = (fullSchemaNames: string[]): string[] => {
  return fullSchemaNames.map((name) => {
    const parts = name.split('/');
    const lastPart = parts.at(-1);
    if (!lastPart) {
      throw new Error(`Invalid schema name: ${name}`);
    }
    return lastPart;
  });
};
