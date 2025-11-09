import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { convertOpenApiSchemaToJsonSchema } from '../conversion/json-schema/convert-schema.js';
import { setKeyword, type MutableJsonSchema } from '../conversion/json-schema/keyword-helpers.js';

const INLINE_REF_PREFIX = '#/definitions/';

interface InlineResolutionContext {
  document: OpenAPIObject;
  cache: Map<string, MutableJsonSchema>;
  stack: Set<string>;
}

const isJsonSchemaObject = (value: unknown): value is SchemaObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const inlineJsonSchemaValue = (value: unknown, context: InlineResolutionContext): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => inlineJsonSchemaValue(item, context));
  }

  if (isJsonSchemaObject(value)) {
    const reference = value['$ref'];
    if (typeof reference === 'string') {
      return resolveSchemaReference(reference, context);
    }

    return inlineJsonSchemaObject(value, context);
  }

  return value;
};

const inlineJsonSchemaObject = (
  schema: SchemaObject,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, entryValue] of Object.entries(schema)) {
    if (key === 'definitions') {
      continue;
    }
    setKeyword(result, key, inlineJsonSchemaValue(entryValue, context));
  }

  return result;
};

const resolveSchemaReference = (
  ref: string,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  if (!ref.startsWith(INLINE_REF_PREFIX)) {
    return { $ref: ref };
  }

  const definitionName = ref.slice(INLINE_REF_PREFIX.length);
  const cached = context.cache.get(definitionName);
  if (cached !== undefined) {
    return cached;
  }

  if (context.stack.has(definitionName)) {
    return { $ref: ref };
  }

  const definition = context.document.components?.schemas?.[definitionName];
  if (!definition) {
    return { $ref: ref };
  }

  context.stack.add(definitionName);
  const inlined = inlineJsonSchema(convertOpenApiSchemaToJsonSchema(definition), context);
  context.stack.delete(definitionName);
  context.cache.set(definitionName, inlined);
  return inlined;
};

const inlineJsonSchema = (
  schema: MutableJsonSchema,
  context: InlineResolutionContext,
): MutableJsonSchema => {
  return inlineJsonSchemaObject(schema, context);
};

export const inlineJsonSchemaRefs = (
  schema: MutableJsonSchema,
  document: OpenAPIObject,
  cache = new Map<string, MutableJsonSchema>(),
  stack = new Set<string>(),
): MutableJsonSchema =>
  inlineJsonSchema(schema, {
    document,
    cache,
    stack,
  });
