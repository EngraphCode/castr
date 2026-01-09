import {
  isReferenceObject,
  type OpenAPIObject,
  type ParameterObject,
  type ReferenceObject,
  type SchemaObject,
} from 'openapi3-ts/oas31';
import {
  getParameterByRef,
  resolveSchemaRef,
  assertNotReference,
} from '../shared/component-access.js';
import { pathParamToVariableName } from '../shared/utils/index.js';
import type { CastrOperation, CastrParameter, CastrSchema } from './ir-schema.js';
import { CastrSchemaProperties } from './ir-schema-properties.js';
import type { MutableJsonSchema } from '../conversion/json-schema/keyword-helpers.js';

export type SupportedParameterLocation = 'path' | 'query' | 'header';

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

const SUPPORTED_PARAMETER_LOCATIONS: readonly SupportedParameterLocation[] = [
  'path',
  'query',
  'header',
];

const isSupportedParameterLocation = (location: string): location is SupportedParameterLocation =>
  SUPPORTED_PARAMETER_LOCATIONS.some((supported) => supported === location);

const resolveParameterObject = (
  parameter: ParameterObject | ReferenceObject,
  document: OpenAPIObject,
): ParameterObject => {
  if (!isReferenceObject(parameter)) {
    return parameter;
  }

  const resolved = getParameterByRef(document, parameter.$ref);
  assertNotReference(resolved, `parameter ${parameter.$ref}`);
  return resolved;
};

const extractParameterSchemaObject = (
  parameter: ParameterObject,
  document: OpenAPIObject,
): SchemaObject => {
  if (parameter.content) {
    const mediaTypes = Object.keys(parameter.content);
    const matchingMediaType = mediaTypes.find((mediaType) => {
      return (
        mediaType === '*/*' ||
        mediaType.includes('json') ||
        mediaType.includes('x-www-form-urlencoded') ||
        mediaType.includes('form-data') ||
        mediaType.includes('octet-stream') ||
        mediaType.includes('text/')
      );
    });

    if (matchingMediaType) {
      const schema = parameter.content[matchingMediaType]?.schema;
      if (schema) {
        return resolveSchemaRef(document, schema);
      }
    }
  }

  if (parameter.schema) {
    return resolveSchemaRef(document, parameter.schema);
  }

  throw new Error(
    `Parameter "${parameter.name}" (in: ${parameter.in}) must declare a schema or supported content type`,
  );
};

export const collectParameterGroups = (
  document: OpenAPIObject,
  pathParameters: readonly (ParameterObject | ReferenceObject)[] | undefined,
  operationParameters: readonly (ParameterObject | ReferenceObject)[] | undefined,
): Partial<Record<SupportedParameterLocation, ParameterAccumulator>> => {
  const groups: Partial<Record<SupportedParameterLocation, ParameterAccumulator>> = {};
  const parameterMap = new Map<string, ParameterObject>();

  const setParameter = (parameter: ParameterObject | ReferenceObject): void => {
    const resolved = resolveParameterObject(parameter, document);
    const location = resolved.in;

    if (!isSupportedParameterLocation(location)) {
      return;
    }

    const key = `${location}:${resolved.name}`;
    parameterMap.set(key, resolved);
  };

  pathParameters?.forEach(setParameter);
  operationParameters?.forEach(setParameter);

  const ensureGroup = (location: SupportedParameterLocation): ParameterAccumulator => {
    const existing = groups[location];
    if (existing) {
      return existing;
    }
    const created: ParameterAccumulator = { properties: {}, required: new Set() };
    groups[location] = created;
    return created;
  };

  const addParameterToGroup = (parameter: ParameterObject): void => {
    const location = parameter.in;
    if (!isSupportedParameterLocation(location)) {
      return;
    }

    const group = ensureGroup(location);
    const schema = extractParameterSchemaObject(parameter, document);
    const normalizedName =
      location === 'path' ? pathParamToVariableName(parameter.name) : parameter.name;

    group.properties[normalizedName] = schema;

    const isRequired = location === 'path' ? true : Boolean(parameter.required);
    if (isRequired) {
      group.required.add(normalizedName);
    }
  };

  parameterMap.forEach(addParameterToGroup);

  return groups;
};

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
      const normalizedName = location === 'path' ? pathParamToVariableName(param.name) : param.name;

      accumulator.properties[normalizedName] = param.schema;

      // Path parameters are always required; other locations use the required flag
      const isRequired = location === 'path' ? true : param.required;
      if (isRequired) {
        accumulator.required.add(normalizedName);
      }
    }

    groups[location] = accumulator;
  };

  // Process only supported locations (path, query, header)
  // Cookie is intentionally excluded as MCP doesn't support it
  processLocationGroup('path', operation.parametersByLocation.path);
  processLocationGroup('query', operation.parametersByLocation.query);
  processLocationGroup('header', operation.parametersByLocation.header);

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
    type: 'object',
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
    if (key === 'metadata') {
      continue;
    }
    const processed = processSchemaEntrySimple(value);
    result[key] = processed;
  }

  return result;
};
