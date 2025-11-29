import type { MediaTypeObject, ReferenceObject, RequestBodyObject } from 'openapi3-ts/oas31';
import type { IRRequestBody, IRMediaType } from '../ir-schema.js';
import { convertSchema } from './schema.js';

export function convertContent(
  content: Record<string, IRMediaType>,
): Record<string, MediaTypeObject> {
  return Object.entries(content).reduce<Record<string, MediaTypeObject>>((acc, [key, value]) => {
    const mediaType: MediaTypeObject = { schema: convertSchema(value.schema) };
    if (value.example !== undefined) {
      mediaType.example = value.example;
    }
    if (value.examples) {
      mediaType.examples = value.examples;
    }
    acc[key] = mediaType;
    return acc;
  }, {});
}

export function convertRequestBody(body: IRRequestBody): RequestBodyObject | ReferenceObject {
  return {
    required: body.required,
    ...(body.description ? { description: body.description } : {}),
    content: convertContent(body.content),
  };
}
