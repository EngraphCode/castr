import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { isPrimitiveSchemaType } from '../../shared/utils/index.js';
import { getZodChain } from './chain.js';
import {
  handleReferenceObject,
  handleArraySchema,
  handlePrimitiveSchema,
  handleMultipleTypeSchema,
  handleObjectSchema,
  getSchemaNameFromRef,
} from './handlers.js';
import { handleCompositionSchemaIfPresent } from './composition.js';

/**
 * Metadata for Zod code generation
 */
export interface CodeMetaData {
  /** Parent code result for inheritance */
  parent?: ZodCodeResult;
  /** Chain of references leading to this schema */
  referencedBy?: ZodCodeResult[];
  /** Whether this schema is required */
  isRequired?: boolean;
}

/**
 * Conversion context for tracking state during schema traversal
 */
export interface ConversionTypeContext {
  /** OpenAPI document being converted */
  doc: OpenAPIObject;
  /** Cache of generated Zod schemas by name */
  zodSchemaByName: Record<string, string>;
}

/**
 * Result of Zod code generation - replaces CodeMeta class
 * Plain object following functional programming principles
 */
export interface ZodCodeResult {
  /** Generated Zod code string */
  code: string;
  /** Source OpenAPI schema */
  schema: SchemaObject | ReferenceObject;
  /** Reference name if this is a $ref */
  ref?: string;
}

interface ConversionArgs {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}

/**
 * Extract ref name from a code result for circular reference detection
 * @internal
 */
function extractRefName(prev: ZodCodeResult, ctx: ConversionTypeContext | undefined): string {
  if (!prev.ref) {
    return '';
  }
  return ctx ? getSchemaNameFromRef(prev.ref) : prev.ref;
}

/**
 * Create initial code result object from schema
 * @internal
 */
function createCodeResult(schema: SchemaObject | ReferenceObject): ZodCodeResult {
  const ref = isReferenceObject(schema) ? schema.$ref : undefined;
  return ref ? { code: '', schema, ref } : { code: '', schema };
}

/**
 * Build metadata with reference chain
 * @internal
 */
function buildMetadata(code: ZodCodeResult, inheritedMeta: CodeMetaData | undefined): CodeMetaData {
  const referencedBy = inheritedMeta?.referencedBy ? [...inheritedMeta.referencedBy, code] : [code];
  const meta: CodeMetaData = { referencedBy };
  if (inheritedMeta?.parent) {
    meta.parent = inheritedMeta.parent;
  }
  if (inheritedMeta?.isRequired !== undefined) {
    meta.isRequired = inheritedMeta.isRequired;
  }
  return meta;
}

/**
 * Prepare schema conversion context
 * Pure function: validates schema, applies refiner, builds result object and metadata
 *
 * @returns Prepared schema, code result, meta, and refsPath for conversion
 */
function prepareSchemaContext(
  $schema: SchemaObject | ReferenceObject | null | undefined,
  ctx: ConversionTypeContext | undefined,
  inheritedMeta: CodeMetaData | undefined,
  options?: TemplateContext['options'],
): {
  schema: SchemaObject | ReferenceObject;
  code: ZodCodeResult;
  meta: CodeMetaData;
  refsPath: string[];
} {
  // Per OpenAPI spec: Schema is always an object, never null
  if (!$schema) {
    throw new Error(
      $schema === null
        ? "Invalid OpenAPI specification: Schema cannot be null. Use 'nullable: true' to indicate null values."
        : 'Schema is required',
    );
  }

  const schema = options?.schemaRefiner?.($schema, inheritedMeta) ?? $schema;
  const code = createCodeResult(schema);
  const meta = buildMetadata(code, inheritedMeta);

  // Extract refs path for circular reference detection
  const refsPath = (meta.referencedBy ?? [])
    .slice(0, -1)
    .map((prev) => extractRefName(prev, ctx))
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
}: ConversionArgs): ZodCodeResult {
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
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  refsPath: string[],
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): ZodCodeResult {
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
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): ZodCodeResult {
  if (Array.isArray(schema.type)) {
    return handleMultipleTypeSchema(schema, code, ctx, meta, getZodSchema, options);
  }

  if (schema.type === 'null') {
    return { ...code, code: 'z.null()' };
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
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
): ZodCodeResult {
  const rawType = schema.type;
  if (Array.isArray(rawType)) {
    // Already handled in handleTypedSchema
    return { ...code, code: 'z.unknown()' };
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
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options: TemplateContext['options'] | undefined,
  schemaType: string | undefined,
): ZodCodeResult {
  if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
    return handleObjectSchema(schema, code, ctx, meta, getZodSchema, getZodChain, options);
  }

  if (!schemaType) {
    return { ...code, code: 'z.unknown()' };
  }

  throw new Error(`Unsupported schema type: ${schemaType}`);
}

// Re-export for backward compatibility
export { getZodChain } from './chain.js';
