/**
 * MCP Parameter Helpers
 *
 * This file contains types and functions for extracting and processing
 * parameter groups for MCP tool generation.
 *
 * The IR-based functions read from `CastrOperation.parametersByLocation`,
 * eliminating the need to access raw OpenAPI.
 *
 * Legacy OpenAPI-dependent functions have been removed (IR-3.6 cleanup).
 *
 * @module template-context.mcp.parameters
 */

import type { SchemaObject } from 'openapi3-ts/oas31';
import { pathParamToVariableName } from '../../shared/utils/index.js';
import type { CastrOperation, CastrParameter, CastrSchema } from '../ir/schema.js';
import { CastrSchemaProperties } from '../ir/schema-properties.js';
import type { MutableJsonSchema } from '../conversion/json-schema/keyword-helpers.js';

export type SupportedParameterLocation = 'path' | 'query' | 'header';

const PARAM_LOCATION_PATH = 'path' as const;
const PARAM_LOCATION_QUERY = 'query' as const;
const PARAM_LOCATION_HEADER = 'header' as const;
const SCHEMA_TYPE_OBJECT = 'object' as const;
const SCHEMA_KEY_METADATA = 'metadata' as const;

/**
 * Accumulator for OpenAPI-based parameter extraction.
 * Uses SchemaObject from openapi3-ts.
 *
 * Note: Prefer IRParameterAccumulator for IR-based extraction in new code.
 */
export interface ParameterAccumulator {
  properties: Record<string, SchemaObject>;
  required: Set<string>;
}

/**
 * Accumulator for IR-based parameter extraction.
 * Uses CastrSchema from the IR, preserving full metadata for later JSON Schema conversion.
 *
 * @see collectParameterGroupsFromIR
 */
export interface IRParameterAccumulator {
  properties: Record<string, CastrSchema>;
  required: Set<string>;
}

/**
 * Creates a Schema object from a ParameterAccumulator.
 *
 * This is a simple helper that constructs a schema from the accumulator,
 * omitting the `required` array if there are no required parameters.
 *
 * @param group - The parameter accumulator
 * @returns SchemaObject representing the parameter section
 */
export const createParameterSectionSchema = (group: ParameterAccumulator): SchemaObject => {
  const schema: SchemaObject = {
    type: 'object',
    properties: group.properties,
  };
  if (group.required.size > 0) {
    schema.required = [...group.required];
  }
  return schema;
};

/**
 * Extracts parameter groups from a CastrOperation using the IR.
 *
 * This function reads from `operation.parametersByLocation` which is pre-grouped
 * by the IR builder, eliminating the need to access raw OpenAPI.
 *
 * @param operation - The CastrOperation (or partial with parametersByLocation)
 * @returns Parameter groups by location (path, query, header)
 *
 * @example
 * ```typescript
 * const groups = collectParameterGroupsFromIR(operation);
 * // { path: { properties: { userId: schema }, required: Set(['userId']) } }
 * ```
 *
 * @see IRParameterAccumulator
 */
export const collectParameterGroupsFromIR = (
  operation: Pick<CastrOperation, 'parametersByLocation'>,
): Partial<Record<SupportedParameterLocation, IRParameterAccumulator>> => {
  const groups: Partial<Record<SupportedParameterLocation, IRParameterAccumulator>> = {};

  const processLocationGroup = (
    location: SupportedParameterLocation,
    parameters: CastrParameter[],
  ): void => {
    if (parameters.length === 0) {
      return;
    }

    const accumulator: IRParameterAccumulator = {
      properties: {},
      required: new Set<string>(),
    };

    for (const param of parameters) {
      // Normalize path parameter names (e.g., 'profile.id' -> 'profileId')
      const normalizedName =
        location === PARAM_LOCATION_PATH ? pathParamToVariableName(param.name) : param.name;

      accumulator.properties[normalizedName] = param.schema;

      // Path parameters are always required; other locations use the required flag
      const isRequired = location === PARAM_LOCATION_PATH ? true : param.required;
      if (isRequired) {
        accumulator.required.add(normalizedName);
      }
    }

    groups[location] = accumulator;
  };

  // Process only supported locations (path, query, header)
  // Cookie is intentionally excluded as MCP doesn't support it
  processLocationGroup(PARAM_LOCATION_PATH, operation.parametersByLocation.path);
  processLocationGroup(PARAM_LOCATION_QUERY, operation.parametersByLocation.query);
  processLocationGroup(PARAM_LOCATION_HEADER, operation.parametersByLocation.header);

  return groups;
};

/**
 * Creates a JSON Schema object from an IR parameter group.
 *
 * This converts `CastrSchema` properties to plain objects suitable for
 * JSON Schema output, stripping IR-specific metadata.
 *
 * @param group - The IR parameter accumulator
 * @returns MutableJsonSchema representing the parameter section
 */
export const createParameterSectionSchemaFromIR = (
  group: IRParameterAccumulator,
): MutableJsonSchema => {
  const properties: Record<string, MutableJsonSchema> = {};

  for (const [name, castrSchema] of Object.entries(group.properties)) {
    // Strip IR metadata, keep only JSON Schema properties
    properties[name] = castrSchemaToJsonSchemaSimple(castrSchema);
  }

  const schema: MutableJsonSchema = {
    type: SCHEMA_TYPE_OBJECT,
    properties,
  };

  if (group.required.size > 0) {
    schema['required'] = [...group.required];
  }

  return schema;
};

/**
 * Type guard for CastrSchema values (has metadata property).
 */
const isCastrSchemaValue = (value: unknown): value is CastrSchema =>
  typeof value === 'object' && value !== null && 'metadata' in value;

/**
 * Convert CastrSchemaProperties to plain object.
 */
const convertPropertiesSimple = (
  props: CastrSchemaProperties,
  converter: (s: CastrSchema) => MutableJsonSchema,
): Record<string, MutableJsonSchema> => {
  const result: Record<string, MutableJsonSchema> = {};
  for (const [name, schema] of props.entries()) {
    result[name] = converter(schema);
  }
  return result;
};

/**
 * Convert array values for JSON Schema output.
 */
const convertArraySimple = (
  arr: unknown[],
  converter: (s: CastrSchema) => MutableJsonSchema,
): unknown[] => arr.map((item) => (isCastrSchemaValue(item) ? converter(item) : item));

/**
 * Process a single schema entry for JSON Schema output.
 */
const processSchemaEntrySimple = (value: unknown): MutableJsonSchema | unknown[] | unknown => {
  if (value instanceof CastrSchemaProperties) {
    return convertPropertiesSimple(value, castrSchemaToJsonSchemaSimple);
  }
  if (isCastrSchemaValue(value)) {
    return castrSchemaToJsonSchemaSimple(value);
  }
  if (Array.isArray(value)) {
    return convertArraySimple(value, castrSchemaToJsonSchemaSimple);
  }
  return value;
};

/**
 * Convert a CastrSchema to a plain JSON Schema object.
 * Strips IR-specific metadata and converts Map-based properties.
 */
const castrSchemaToJsonSchemaSimple = (schema: CastrSchema): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === SCHEMA_KEY_METADATA) {
      continue;
    }
    const processed = processSchemaEntrySimple(value);
    result[key] = processed;
  }

  return result;
};
