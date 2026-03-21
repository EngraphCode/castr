import type { CastrDocument } from '../models/schema-document.js';
import type { IRComponent } from '../models/schema.components.js';
import type { CastrOperation } from '../models/schema.operations.js';
import { type UnknownRecord, isRecord } from '../../../shared/type-utils/types.js';
import { isCastrSchema, isCastrSchemaNode } from './validators.schema.js';

const VALID_HTTP_METHODS = new Set<string>([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
]);
const VALID_PARAMETER_LOCATIONS = new Set<string>(['path', 'query', 'header', 'cookie']);

/**
 * Cross-realm-safe Map detection.
 *
 * `instanceof Map` fails in vitest ESM module isolation where Map instances
 * may originate from a different realm boundary. This uses `Symbol.toStringTag`
 * which is reliable across realms.
 */
const MAP_TO_STRING_TAG = '[object Map]';

function isMapLike(value: unknown): boolean {
  return (
    value instanceof Map ||
    (typeof value === 'object' &&
      value !== null &&
      Object.prototype.toString.call(value) === MAP_TO_STRING_TAG)
  );
}

function isSupportedHttpMethod(method: unknown): boolean {
  return typeof method === 'string' && VALID_HTTP_METHODS.has(method);
}

function hasValidDocumentComponents(value: UnknownRecord): boolean {
  return (
    Array.isArray(value['components']) &&
    value['components'].every((component) => isIRComponent(component))
  );
}

function hasValidDocumentOperations(value: UnknownRecord): boolean {
  return (
    Array.isArray(value['operations']) &&
    value['operations'].every((operation) => isCastrOperation(operation))
  );
}

function hasValidDocumentCollections(value: UnknownRecord): boolean {
  return (
    Array.isArray(value['servers']) &&
    hasValidDocumentComponents(value) &&
    hasValidDocumentOperations(value) &&
    isRecord(value['dependencyGraph']) &&
    Array.isArray(value['schemaNames']) &&
    value['schemaNames'].every((schemaName) => typeof schemaName === 'string') &&
    isMapLike(value['enums'])
  );
}

export function isCastrDocument(value: unknown): value is CastrDocument {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['version'] === 'string' &&
    typeof value['openApiVersion'] === 'string' &&
    isRecord(value['info']) &&
    hasValidDocumentCollections(value)
  );
}

function isCastrSchemaComponent(value: UnknownRecord): boolean {
  return isCastrSchema(value['schema']) && isCastrSchemaNode(value['metadata']);
}

function isValidRawOpenApiComponentValue(
  component: UnknownRecord,
  key: 'header' | 'link' | 'callback' | 'pathItem' | 'example',
): boolean {
  return isRecord(component[key]);
}

const RAW_OPENAPI_COMPONENT_KEYS = {
  header: 'header',
  link: 'link',
  callback: 'callback',
  pathItem: 'pathItem',
  example: 'example',
} as const;

type RawOpenApiComponentType = keyof typeof RAW_OPENAPI_COMPONENT_KEYS;

function isRawOpenApiComponentType(value: unknown): value is RawOpenApiComponentType {
  return typeof value === 'string' && Object.hasOwn(RAW_OPENAPI_COMPONENT_KEYS, value);
}

const STRUCTURED_COMPONENT_VALIDATORS = {
  schema: isCastrSchemaComponent,
  parameter: (component: UnknownRecord) => isValidParameter(component['parameter']),
  response: (component: UnknownRecord) => isValidResponse(component['response']),
  requestBody: (component: UnknownRecord) => isValidRequestBody(component['requestBody']),
  securityScheme: (component: UnknownRecord) => isRecord(component['scheme']),
} as const;

type StructuredComponentType = keyof typeof STRUCTURED_COMPONENT_VALIDATORS;

function isStructuredComponentType(value: unknown): value is StructuredComponentType {
  return typeof value === 'string' && Object.hasOwn(STRUCTURED_COMPONENT_VALIDATORS, value);
}

export function isIRComponent(value: unknown): value is IRComponent {
  if (!isRecord(value) || typeof value['name'] !== 'string') {
    return false;
  }

  if (isRawOpenApiComponentType(value['type'])) {
    return isValidRawOpenApiComponentValue(value, RAW_OPENAPI_COMPONENT_KEYS[value['type']]);
  }

  if (isStructuredComponentType(value['type'])) {
    return STRUCTURED_COMPONENT_VALIDATORS[value['type']](value);
  }

  return false;
}

function isValidParameter(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['name'] === 'string' &&
    typeof value['in'] === 'string' &&
    VALID_PARAMETER_LOCATIONS.has(value['in']) &&
    typeof value['required'] === 'boolean' &&
    isCastrSchema(value['schema']) &&
    (value['metadata'] === undefined || isCastrSchemaNode(value['metadata']))
  );
}

function hasParameterGroup(
  value: UnknownRecord,
  key: 'query' | 'path' | 'header' | 'cookie',
): boolean {
  return Array.isArray(value[key]) && value[key].every((parameter) => isValidParameter(parameter));
}

function isValidParametersByLocation(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasParameterGroup(value, 'query') &&
    hasParameterGroup(value, 'path') &&
    hasParameterGroup(value, 'header') &&
    hasParameterGroup(value, 'cookie')
  );
}

function isValidSchemaContainer(value: unknown): boolean {
  return isRecord(value) && isCastrSchema(value['schema']);
}

function isValidContentMap(value: unknown): boolean {
  return (
    isRecord(value) && Object.values(value).every((mediaType) => isValidSchemaContainer(mediaType))
  );
}

function isValidRequestBody(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value['required'] === 'boolean' && isValidContentMap(value['content']);
}

function isValidResponseHeaders(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((header) => isValidSchemaContainer(header));
}

function hasValidOperationShape(value: UnknownRecord): boolean {
  return (
    typeof value['path'] === 'string' &&
    Array.isArray(value['parameters']) &&
    value['parameters'].every((parameter) => isValidParameter(parameter)) &&
    isValidParametersByLocation(value['parametersByLocation']) &&
    (value['requestBody'] === undefined || isValidRequestBody(value['requestBody'])) &&
    Array.isArray(value['responses']) &&
    value['responses'].every((response) => isValidResponse(response))
  );
}

export function isCastrOperation(value: unknown): value is CastrOperation {
  if (!isRecord(value) || !isSupportedHttpMethod(value['method'])) {
    return false;
  }

  return (
    (value['operationId'] === undefined || typeof value['operationId'] === 'string') &&
    hasValidOperationShape(value)
  );
}

function isValidResponse(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value['statusCode'] === 'string' &&
    (value['schema'] === undefined || isCastrSchema(value['schema'])) &&
    (value['content'] === undefined || isValidContentMap(value['content'])) &&
    (value['headers'] === undefined || isValidResponseHeaders(value['headers']))
  );
}
