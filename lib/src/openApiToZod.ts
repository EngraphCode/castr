import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import type { CodeMetaData, ConversionTypeContext } from './CodeMeta.js';
import { CodeMeta } from './CodeMeta.js';
import type { TemplateContext } from './template-context.js';
import { isPrimitiveSchemaType } from './utils.js';
import { getZodChain } from './openApiToZod.chain.js';
import {
  handleReferenceObject,
  handleArraySchema,
  handlePrimitiveSchema,
  handleMultipleTypeSchema,
  handleObjectSchema,
  getSchemaNameFromRef,
} from './openApiToZod.handlers.js';
import { handleCompositionSchemaIfPresent } from './openApiToZod.composition.js';

interface ConversionArgs {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}

/**
 * Prepare schema conversion context
 * Pure function: validates schema, applies refiner, builds CodeMeta and metadata
 *
 * @returns Prepared schema, code, meta, and refsPath for conversion
 */
function prepareSchemaContext(
  $schema: SchemaObject | ReferenceObject | null | undefined,
  ctx: ConversionTypeContext | undefined,
  inheritedMeta: CodeMetaData | undefined,
  options?: TemplateContext['options'],
): {
  schema: SchemaObject | ReferenceObject;
  code: CodeMeta;
  meta: CodeMetaData;
  refsPath: string[];
} {
  // Per OpenAPI spec: Schema is always an object, never null
  // Empty schema {} is valid and represents "any value" (z.unknown())
  if (!$schema) {
    throw new Error(
      $schema === null
        ? "Invalid OpenAPI specification: Schema cannot be null. Use 'nullable: true' to indicate null values."
        : 'Schema is required',
    );
  }

  const schema = options?.schemaRefiner?.($schema, inheritedMeta) ?? $schema;
  const code = new CodeMeta(schema, ctx, inheritedMeta);
  const meta = {
    parent: code.inherit(inheritedMeta?.parent),
    referencedBy: [...code.meta.referencedBy],
  };

  const refsPath = code.meta.referencedBy
    .slice(0, -1)
    .map((prev) => {
      if (!prev.ref) {
        return '';
      }
      if (!ctx) {
        return prev.ref;
      }
      return getSchemaNameFromRef(prev.ref);
    })
    .filter((path): path is string => Boolean(path));

  return { schema, code, meta, refsPath };
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
/**
 * Convert an OpenAPI Schema to a Zod schema
 *
 * Per OAS 3.0+ spec: A Schema is always an object (possibly empty), never null.
 * The 'nullable' property indicates the VALUE can be null, not the schema itself.
 */
export function getZodSchema({
  schema: $schema,
  ctx,
  meta: inheritedMeta,
  options,
}: ConversionArgs): CodeMeta {
  const { schema, code, meta, refsPath } = prepareSchemaContext(
    $schema,
    ctx,
    inheritedMeta,
    options,
  );

  if (isReferenceObject(schema)) {
    return handleReferenceSchema(schema, code, ctx, refsPath, meta, options);
  }

  return handleTypedSchema(schema, code, ctx, meta, options);
}

/**
 * Handle reference object schema
 */
function handleReferenceSchema(
  schema: ReferenceObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  refsPath: string[],
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): CodeMeta {
  if (!ctx) {
    throw new Error('Context is required');
  }
  return handleReferenceObject(schema, code, ctx, refsPath, meta, getZodSchema, options);
}

/**
 * Handle typed schema (non-reference)
 */
function handleTypedSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): CodeMeta {
  if (Array.isArray(schema.type)) {
    return handleMultipleTypeSchema(schema, code, ctx, meta, getZodSchema, options);
  }

  if (schema.type === 'null') {
    return code.assign('z.null()');
  }

  const compositionResult = handleCompositionSchemaIfPresent(
    schema,
    code,
    ctx,
    meta,
    getZodSchema,
    options,
  );
  if (compositionResult) {
    return compositionResult;
  }

  return handleSchemaByType(schema, code, ctx, meta, options);
}

/**
 * Handle schema by its type
 */
function handleSchemaByType(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): CodeMeta {
  const rawType = schema.type;
  if (Array.isArray(rawType)) {
    // Already handled in handleTypedSchema
    return code.assign('z.unknown()');
  }

  const schemaType = rawType?.toLowerCase();

  if (schemaType && isPrimitiveSchemaType(schemaType)) {
    return handlePrimitiveSchema(schema, code, schemaType);
  }

  if (schemaType === 'array') {
    return handleArraySchema(schema, code, ctx, meta, getZodSchema, getZodChain, options);
  }

  return handleObjectOrUnknownSchema(schema, code, ctx, meta, options, schemaType);
}

/**
 * Handle object schema or unknown schema type
 */
function handleObjectOrUnknownSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
  schemaType: string | undefined,
): CodeMeta {
  if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
    return handleObjectSchema(schema, code, ctx, meta, getZodSchema, getZodChain, options);
  }

  if (!schemaType) {
    return code.assign('z.unknown()');
  }

  throw new Error(`Unsupported schema type: ${schemaType}`);
}

// Re-export for backward compatibility
export { getZodChain } from './openApiToZod.chain.js';
