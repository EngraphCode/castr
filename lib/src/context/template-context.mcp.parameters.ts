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

export type SupportedParameterLocation = 'path' | 'query' | 'header';

export interface ParameterAccumulator {
  properties: Record<string, SchemaObject>;
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
  const required = group.required.size > 0 ? [...group.required] : undefined;
  return {
    type: 'object',
    properties: group.properties,
    required,
  } satisfies SchemaObject;
};
