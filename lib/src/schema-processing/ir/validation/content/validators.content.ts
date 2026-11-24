import { isReferenceObject } from '../../../../shared/openapi-types.js';
import { parseComponentRef } from '../../../../shared/ref-resolution.js';
import { type UnknownRecord, isRecord } from '../../../../shared/type-utils/types.js';
import type { IRMediaTypeReference } from '../../models/schema.operations.js';
import { isCastrSchema } from '../validators.schema.js';

const OPENAPI_COMPONENT_TYPE_MEDIA_TYPES = 'mediaTypes';

function hasOptionalValue(
  value: UnknownRecord,
  key: string,
  validator: (field: unknown) => boolean,
): boolean {
  return value[key] === undefined || validator(value[key]);
}

function hasOptionalBooleanValues(value: UnknownRecord, keys: string[]): boolean {
  return keys.every((key) => value[key] === undefined || typeof value[key] === 'boolean');
}

function isValidExamplesMap(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((example) => isRecord(example));
}

function isValidEncodingMap(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((encoding) => isRecord(encoding));
}

function isValidIRMediaType(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasOptionalValue(value, 'schema', isCastrSchema) &&
    hasOptionalValue(value, 'itemSchema', isCastrSchema) &&
    hasOptionalValue(value, 'examples', isValidExamplesMap) &&
    hasOptionalValue(value, 'encoding', isValidEncodingMap)
  );
}

function isValidMediaTypeReference(value: unknown): value is IRMediaTypeReference {
  if (!isReferenceObject(value)) {
    return false;
  }

  try {
    return parseComponentRef(value.$ref).componentType === OPENAPI_COMPONENT_TYPE_MEDIA_TYPES;
  } catch {
    return false;
  }
}

export function isValidMediaTypeEntry(value: unknown): boolean {
  return (
    isValidMediaTypeReference(value) || (!isReferenceObject(value) && isValidIRMediaType(value))
  );
}

export function isValidContentMap(value: unknown): boolean {
  return (
    isRecord(value) && Object.values(value).every((mediaType) => isValidMediaTypeEntry(mediaType))
  );
}

/** A reference kept beside the thing it gave is text where it is present. */
export function isOptionalText(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isValidResponseHeader(value: unknown): boolean {
  return (
    isRecord(value) &&
    isCastrSchema(value['schema']) &&
    hasOptionalValue(value, 'content', isValidContentMap) &&
    hasOptionalValue(value, 'description', (field) => typeof field === 'string') &&
    hasOptionalBooleanValues(value, ['required', 'deprecated']) &&
    hasOptionalValue(value, 'examples', isValidExamplesMap) &&
    isOptionalText(value['ref'])
  );
}

function isValidResponseHeaders(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((header) => isValidResponseHeader(header));
}

/** A response's headers, and the reference it was given by, where either is present. */
export function hasValidResponseHeadersAndReference(value: UnknownRecord): boolean {
  return (
    (value['headers'] === undefined || isValidResponseHeaders(value['headers'])) &&
    isOptionalText(value['ref'])
  );
}
