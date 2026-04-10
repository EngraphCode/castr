import type { MediaTypeObject, ReferenceObject } from '../../../shared/openapi-types.js';
import type { IRMediaType, IRMediaTypeEntry } from '../../ir/index.js';
import { writeOpenApiSchema } from './schema/openapi-writer.schema.js';

function writeInlineMediaType(mediaType: IRMediaType): MediaTypeObject {
  const result: MediaTypeObject = {};

  if (mediaType.schema !== undefined) {
    result.schema = writeOpenApiSchema(mediaType.schema);
  }

  if (mediaType.example !== undefined) {
    result.example = mediaType.example;
  }
  if (mediaType.examples !== undefined) {
    result.examples = mediaType.examples;
  }
  if (mediaType.encoding !== undefined) {
    result.encoding = mediaType.encoding;
  }

  return result;
}

export function writeMediaTypeEntry(
  mediaType: IRMediaTypeEntry,
): ReferenceObject | MediaTypeObject {
  return '$ref' in mediaType ? mediaType : writeInlineMediaType(mediaType);
}

export function writeMediaTypeEntries(
  content: Record<string, IRMediaTypeEntry>,
): Record<string, ReferenceObject | MediaTypeObject> {
  return Object.fromEntries(
    Object.entries(content)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([mediaTypeName, mediaType]) => [mediaTypeName, writeMediaTypeEntry(mediaType)]),
  );
}
