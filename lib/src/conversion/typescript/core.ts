import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import type { TemplateContext } from '../../context/template-context.js';

import {
  handleAllOfSchema,
  handleAnyOfSchema,
  handleArrayTypeSchema,
  handleNullTypeSchema,
  handleObjectTypeSchema,
  handleOneOfSchema,
  handlePrimitiveTypeSchema,
  handleReferenceSchema,
  handleTypeArraySchema,
} from './core.converters.js';
import { isPrimitiveSchemaType } from './helpers.js';

/**
 * Type for conversion arguments passed through the conversion pipeline.
 * @internal
 */
export interface TsConversionArgs {
  schema: SchemaObject | ReferenceObject;
  ctx?: TsConversionContext | undefined;
  meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
  options?: TemplateContext['options'];
}

/**
 * Type for schema handler function that converts schemas to TypeScript types.
 * @internal
 */
export type SchemaHandler = (
  schema: SchemaObject | ReferenceObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
) => string;

/**
 * Context for TypeScript conversion tracking visited references and node mappings.
 * @public
 */
export interface TsConversionContext {
  nodeByRef: Record<string, string>;
  doc: OpenAPIObject;
  rootRef?: string;
  visitedRefs?: Record<string, boolean>;
}

/**
 * Setup conversion context for visited references.
 * @internal
 */
export function setupConversionContext(
  ctx: TsConversionContext | undefined,
  inheritedMeta: TsConversionArgs['meta'],
): void {
  if (ctx?.visitedRefs && inheritedMeta?.$ref) {
    ctx.rootRef = inheritedMeta.$ref;
    ctx.visitedRefs[inheritedMeta.$ref] = true;
  }
}

/**
 * Handle composition schemas (oneOf, anyOf, allOf).
 * @internal
 */
export function handleCompositionSchemas(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string | null {
  if (schema.oneOf) {
    return handleOneOfSchema(schema, meta, ctx, options, convertSchema);
  }

  if (schema.anyOf) {
    return handleAnyOfSchema(schema, meta, ctx, options, convertSchema);
  }

  if (schema.allOf) {
    return handleAllOfSchema(schema, meta, ctx, options, convertSchema);
  }

  return null;
}

/**
 * Handle typed schemas (primitive, array, object).
 * @internal
 */
export function handleTypedSchemas(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string | null {
  const schemaType = schema.type;

  if (schemaType && isPrimitiveSchemaType(schemaType)) {
    return handlePrimitiveTypeSchema(schema);
  }

  if (schemaType === 'array') {
    return handleArrayTypeSchema(schema, meta, ctx, options, convertSchema);
  }

  if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
    return handleObjectTypeSchema(schema, meta, ctx, options, convertSchema);
  }

  return null;
}

/**
 * Convert schema to TypeScript type string (core conversion logic).
 * @internal
 */
export function convertSchemaToType(
  schema: SchemaObject | ReferenceObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (isReferenceObject(schema)) {
    return handleReferenceSchema(schema, ctx, meta, options, convertSchema);
  }

  if (Array.isArray(schema.type)) {
    return handleTypeArraySchema(schema, meta, ctx, options, convertSchema);
  }

  if (schema.type === 'null') {
    return handleNullTypeSchema();
  }

  const compositionResult = handleCompositionSchemas(schema, meta, ctx, options, convertSchema);
  if (compositionResult !== null) {
    return compositionResult;
  }

  const typedResult = handleTypedSchemas(schema, meta, ctx, options, convertSchema);
  if (typedResult !== null) {
    return typedResult;
  }

  if (!schema.type) {
    return 'unknown';
  }

  throw new Error(`Unsupported schema type: ${schema.type}`);
}

/**
 * Format TypeScript result as type declaration or inline type.
 * @internal
 */
export function formatTypeScriptResult(
  tsResult: string,
  inheritedMeta: TsConversionArgs['meta'],
): string {
  if (inheritedMeta?.name && !inheritedMeta?.isInline) {
    return `export type ${inheritedMeta.name} = ${tsResult};`;
  }

  return tsResult;
}
