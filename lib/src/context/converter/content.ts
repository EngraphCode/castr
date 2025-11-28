import type {
  MediaTypeObject,
  ExampleObject,
  ReferenceObject,
  RequestBodyObject,
} from 'openapi3-ts/oas31';
import type { IRSchema, IRRequestBody } from '../ir-schema.js';
import { convertSchema } from './schema.js';

export function convertContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, { schema: IRSchema; example?: unknown; examples?: Record<string, any> }>,
): Record<string, MediaTypeObject> {
  return Object.entries(content).reduce(
    (acc, [key, value]) => {
      const mediaType: MediaTypeObject = { schema: convertSchema(value.schema) };
      if (value.example !== undefined) {
        mediaType.example = value.example;
      }
      if (value.examples) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        mediaType.examples = value.examples as Record<string, ExampleObject | ReferenceObject>;
      }
      acc[key] = mediaType;
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Record<string, MediaTypeObject>,
  );
}

export function convertRequestBody(body: IRRequestBody): RequestBodyObject | ReferenceObject {
  return {
    required: body.required,
    ...(body.description ? { description: body.description } : {}),
    content: convertContent(body.content),
  };
}
