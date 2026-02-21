/**
 * Dependency tracking helpers for template context endpoints
 * Extracted from template-context.endpoints.helpers.ts to reduce file size
 *
 * @internal
 */

import type { EndpointDefinition } from '../../../endpoints/definition.types.js';
import type { CastrSchema } from '../../ir/index.js';
import { getSchemaNameFromRef } from '../template-context.common.js';
import { asComponentSchema } from '../../../shared/utils/index.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';

import type { MinimalTemplateContext } from './template-context.endpoints.types.js';

export type { MinimalTemplateContext };

const OPENAPI_COMPONENT_TYPE_SCHEMAS = 'schemas' as const;
const HASH_CHAR_CODE = 35;
const SLASH_CHAR_CODE = 47;
const EXPECTED_SCHEMA_REF_PATTERN =
  '#/components/schemas/{name} or #/x-ext/{hash}/components/schemas/{name}' as const;

function toRootSchemaName(schemaName: string): string {
  const DOT_CHAR_CODE = 46;
  let rootName = '';

  for (let i = 0; i < schemaName.length; i++) {
    const ch = schemaName.charCodeAt(i);
    if (ch === DOT_CHAR_CODE) {
      break;
    }

    rootName += schemaName[i] ?? '';
  }

  return rootName || schemaName;
}

/**
 * Normalize dependency name from a structural schema reference.
 *
 * @param schema - Minimal schema shape containing an optional `$ref`
 * @returns Root dependency name when reference exists, otherwise null
 *
 * @internal
 */
export const normalizeSchemaNameForDependency = (
  schema: Pick<CastrSchema, '$ref'>,
): string | null => {
  if (!schema.$ref) {
    return null;
  }

  const schemaName = getSchemaNameFromRef(schema.$ref);
  if (!schemaName) {
    return null;
  }

  return toRootSchemaName(schemaName);
};

/**
 * Collect schema dependencies from an endpoint.
 * Data gathering function that extracts dependency names.
 *
 * @param endpoint - The endpoint definition
 * @returns Array of schema names used by the endpoint
 *
 * @internal
 */

export const collectEndpointDependencies = (endpoint: EndpointDefinition): string[] => {
  const dependencies: string[] = [];
  const endpointContext = `${endpoint.method} ${endpoint.path}`;

  if (endpoint.response) {
    addDependenciesFromSchema(endpoint.response, 'response', endpointContext, dependencies);
  }

  endpoint.parameters.forEach((param, index) => {
    const sourceContext = `parameter "${param.name || String(index)}"`;
    addDependenciesFromSchema(param.schema, sourceContext, endpointContext, dependencies);
  });

  endpoint.errors.forEach((error) => {
    addDependenciesFromSchema(
      error.schema,
      `error response "${String(error.status)}"`,
      endpointContext,
      dependencies,
    );
  });

  return dependencies;
};

function addDependenciesFromSchema(
  schema: CastrSchema,
  sourceContext: string,
  endpointContext: string,
  dependencies: string[],
): void {
  if (!schema.metadata?.dependencyGraph?.references) {
    return;
  }

  schema.metadata.dependencyGraph.references.forEach((ref) => {
    dependencies.push(parseSchemaDependencyRef(ref, sourceContext, endpointContext));
  });
}

function parseSchemaDependencyRef(
  ref: string,
  sourceContext: string,
  endpointContext: string,
): string {
  if (!hasJsonPointerPrefix(ref)) {
    throw new Error(
      `Invalid schema dependency reference "${ref}" in endpoint ${endpointContext} ` +
        `at ${sourceContext}. Expected ${EXPECTED_SCHEMA_REF_PATTERN}.`,
    );
  }

  let parsedRef;
  try {
    parsedRef = parseComponentRef(ref);
  } catch (error) {
    throw new Error(
      `Invalid schema dependency reference "${ref}" in endpoint ${endpointContext} ` +
        `at ${sourceContext}. ${describeUnknownError(error)}`,
    );
  }

  if (parsedRef.componentType !== OPENAPI_COMPONENT_TYPE_SCHEMAS) {
    throw new Error(
      `Unsupported schema dependency reference "${ref}" in endpoint ${endpointContext} ` +
        `at ${sourceContext}. Expected ${EXPECTED_SCHEMA_REF_PATTERN}.`,
    );
  }

  return parsedRef.componentName;
}

function hasJsonPointerPrefix(ref: string): boolean {
  return ref.charCodeAt(0) === HASH_CHAR_CODE && ref.charCodeAt(1) === SLASH_CHAR_CODE;
}

function describeUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Process transitive dependencies for a schema and add them to group.
 * Transformation function that processes deep dependencies.
 *
 * @param schemaName - Name of the schema
 * @param dependencyGraph - The deep dependency graph
 * @param types - Map of all types
 * @param schemas - Map of all schemas
 * @param dependencies - Set to add transitive dependencies to
 * @param group - The group template context to update
 *
 * @internal
 */
export const processTransitiveDependenciesForGroup = (
  schemaName: string,
  dependencyGraph: Record<string, Set<string>>,
  types: Record<string, string>,
  schemas: Record<string, string>,
  dependencies: Set<string>,
  group: MinimalTemplateContext,
): void => {
  const resolvedRef = asComponentSchema(schemaName);
  const transitiveRefs = dependencyGraph[resolvedRef];

  if (!transitiveRefs) {
    return;
  }

  transitiveRefs.forEach((transitiveRef) => {
    const normalized = normalizeSchemaNameForDependency({ $ref: transitiveRef });
    if (normalized) {
      dependencies.add(normalized);
    }

    const transitiveSchemaName = getSchemaNameFromRef(transitiveRef);

    const transitiveType = types[transitiveSchemaName];
    if (transitiveType) {
      group.types[transitiveSchemaName] = transitiveType;
    }

    const transitiveSchema = schemas[transitiveSchemaName];
    if (transitiveSchema) {
      group.schemas[transitiveSchemaName] = transitiveSchema;
    }
  });
};
