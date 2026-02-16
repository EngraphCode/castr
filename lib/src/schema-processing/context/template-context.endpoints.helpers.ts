import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { EndpointDefinition } from '../../endpoints/definition.types.js';
import { logger } from '../../shared/utils/logger.js';

import { snakeCase, split } from 'lodash-es';
export type TemplateContextGroupStrategy = 'none' | 'tag' | 'method' | 'tag-file' | 'method-file';

const CHAR_CODE_0 = 0x30;
const CHAR_CODE_9 = 0x39;
const CHAR_CODE_A = 0x41;
const CHAR_CODE_Z = 0x5a;
const CHAR_CODE_a = 0x61;
const CHAR_CODE_z = 0x7a;
const CHAR_CODE_UNDERSCORE = 0x5f;
const COLON_TOKEN = ':' as const;
const OPEN_BRACE_TOKEN = '{' as const;
const CLOSE_BRACE_TOKEN = '}' as const;
const REF_SEPARATOR = '/' as const;
const DEFAULT_GROUP_NAME = 'Default' as const;
const GROUP_STRATEGY_TAG = 'tag' as const;
const GROUP_STRATEGY_TAG_FILE = 'tag-file' as const;
const GROUP_STRATEGY_METHOD = 'method' as const;
const GROUP_STRATEGY_METHOD_FILE = 'method-file' as const;

export interface MinimalTemplateContext {
  schemas: Record<string, string>;
  endpoints: EndpointDefinition[];
  types: Record<string, string>;
  imports?: Record<string, string>;
}

export const makeEndpointTemplateContext = (): MinimalTemplateContext => ({
  schemas: {},
  endpoints: [],
  types: {},
});

/**
 * Convert path with colons to OpenAPI bracket format.
 * Example: '/pet/:petId' -> '/pet/{petId}'
 *
 * @internal
 */
function isWordCharCode(code: number): boolean {
  return (
    (code >= CHAR_CODE_0 && code <= CHAR_CODE_9) || // 0-9
    (code >= CHAR_CODE_A && code <= CHAR_CODE_Z) || // A-Z
    (code >= CHAR_CODE_a && code <= CHAR_CODE_z) || // a-z
    code === CHAR_CODE_UNDERSCORE // _
  );
}

function findParamEnd(path: string, startIndex: number): number {
  let paramEnd = startIndex;
  while (paramEnd < path.length && isWordCharCode(path.charCodeAt(paramEnd))) {
    paramEnd++;
  }
  return paramEnd;
}

export const getOriginalPathWithBrackets = (path: string): string => {
  let result = '';
  let index = 0;

  while (index < path.length) {
    const char = path[index] ?? '';
    if (char !== COLON_TOKEN) {
      result += char;
      index++;
      continue;
    }

    const paramEnd = findParamEnd(path, index + 1);
    if (paramEnd === index + 1) {
      result += COLON_TOKEN;
      index++;
      continue;
    }

    result += OPEN_BRACE_TOKEN;
    for (let i = index + 1; i < paramEnd; i++) {
      result += path[i] ?? '';
    }
    result += CLOSE_BRACE_TOKEN;
    index = paramEnd;
  }

  return result;
};

/**
 * Extract pure schema names from full ref paths.
 * Example: '#/components/schemas/Category' -> 'Category'
 *
 * @internal
 */
export const getPureSchemaNames = (fullSchemaNames: string[]): string[] => {
  return fullSchemaNames.map((name) => {
    const parts = split(name, REF_SEPARATOR);
    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
      throw new Error(`Invalid schema name: ${name}`);
    }
    return lastPart;
  });
};

/**
 * Determine group name based on grouping strategy.
 * Data gathering function that extracts group name from endpoint.
 *
 * Uses endpoint.tags which is populated from IR (CastrOperation.tags),
 * eliminating the need to look up raw OpenAPI document.
 *
 * @param groupStrategy - The grouping strategy to use
 * @param endpoint - The endpoint definition (from IR)
 * @returns Group name (normalized)
 *
 * @internal
 */
export const determineGroupName = (
  groupStrategy: TemplateContextGroupStrategy,
  endpoint: EndpointDefinition,
): string => {
  if (groupStrategy === GROUP_STRATEGY_TAG || groupStrategy === GROUP_STRATEGY_TAG_FILE) {
    return snakeCase(endpoint.tags?.[0] ?? DEFAULT_GROUP_NAME);
  }
  if (groupStrategy === GROUP_STRATEGY_METHOD || groupStrategy === GROUP_STRATEGY_METHOD_FILE) {
    return snakeCase(endpoint.method);
  }
  return snakeCase(DEFAULT_GROUP_NAME);
};

export { collectEndpointDependencies } from './template-context.endpoints.dependencies.js';

/**
 * Get operation object from OpenAPI document for an endpoint.
 * Data gathering function that extracts operation from paths.
 *
 * @param openApiDoc - The OpenAPI document
 * @param endpoint - The endpoint definition
 * @returns Operation object or null if not found
 *
 * @internal
 */
export const getOperationForEndpoint = (
  openApiDoc: OpenAPIObject,
  endpoint: EndpointDefinition,
): OperationObject | null => {
  const operationPath = getOriginalPathWithBrackets(endpoint.path);
  const pathItem = openApiDoc.paths?.[endpoint.path] ?? openApiDoc.paths?.[operationPath];

  if (!pathItem || isReferenceObject(pathItem)) {
    logger.warn('Missing path', endpoint.path);
    return null;
  }

  const operation = pathItem[endpoint.method];
  if (!operation) {
    logger.warn(`Missing operation ${endpoint.method} for path ${endpoint.path}`);
    return null;
  }

  return operation;
};

/**
 * Ensure a group exists in endpointsGroups, creating it if needed.
 * Assembly function that manages group structure.
 *
 * @param groupName - Name of the group
 * @param endpointsGroups - Map of group names to template contexts
 * @returns The group template context
 *
 * @internal
 */
export const ensureGroupExists = (
  groupName: string,
  endpointsGroups: Record<string, MinimalTemplateContext>,
): MinimalTemplateContext => {
  if (!endpointsGroups[groupName]) {
    endpointsGroups[groupName] = makeEndpointTemplateContext();
  }
  const group = endpointsGroups[groupName];
  if (!group) {
    throw new Error(`Failed to create group: ${groupName}`);
  }
  return group;
};

/**
 * Ensure a dependencies set exists for a group, creating it if needed.
 * Assembly function that manages dependencies tracking.
 *
 * @param groupName - Name of the group
 * @param dependenciesByGroupName - Map of group names to dependency sets
 * @returns The dependencies set for the group
 *
 * @internal
 */
export const ensureDependenciesSetExists = (
  groupName: string,
  dependenciesByGroupName: Map<string, Set<string>>,
): Set<string> => {
  if (!dependenciesByGroupName.has(groupName)) {
    dependenciesByGroupName.set(groupName, new Set());
  }
  const dependencies = dependenciesByGroupName.get(groupName);
  if (!dependencies) {
    throw new Error(`Dependencies not found for group: ${groupName}`);
  }
  return dependencies;
};

/**
 * Add dependencies to a group's schemas.
 * Transformation function that adds schemas to group context.
 *
 * @param dependencies - Set of schema names
 * @param schemas - Map of all schemas
 * @param group - The group template context to update
 *
 * @internal
 */
export const addDependenciesToGroup = (
  dependencies: Set<string>,
  schemas: Record<string, string>,
  group: MinimalTemplateContext,
): void => {
  dependencies.forEach((schemaName) => {
    const schema = schemas[schemaName];
    if (schema) {
      group.schemas[schemaName] = schema;
    }
  });
};

export { processTransitiveDependenciesForGroup } from './template-context.endpoints.dependencies.js';
