/**
 * Schema type converters for OpenAPI schemas
 * Extracted from openApiToTypescript.core.ts to reduce file size
 *
 * These functions convert specific OpenAPI schema types to TypeScript type strings.
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

import type { TemplateContext } from '../../context/template-context.js';
import { inferRequiredSchema } from '../../shared/infer-required-only.js';
import {
  convertSchemasToTypes,
  handleAnyOf,
  handleArraySchema,
  handleOneOf,
  handleBasicPrimitive,
  handlePrimitiveEnum,
  handleReferenceObject,
  handleTypeArray,
  isPrimitiveSchemaType,
} from './helpers.js';
import { handleIntersection, wrapNullable } from './string-helpers.js';

import type { SchemaHandler, TsConversionArgs, TsConversionContext } from './core.js';

/**
 * Handle reference object schema.
 * @internal
 */
export function handleReferenceSchema(
  schema: ReferenceObject,
  ctx: TsConversionContext | undefined,
  meta: TsConversionArgs['meta'],
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  return handleReferenceObject(schema, ctx, (actualSchema) =>
    convertSchema(actualSchema, meta, ctx, options),
  );
}

/**
 * Handle type array schema (multiple types).
 * @internal
 */
export function handleTypeArraySchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (!Array.isArray(schema.type)) {
    throw new Error('Schema type must be an array');
  }
  return handleTypeArray(schema.type, schema, schema.nullable ?? false, (s) =>
    convertSchema(s, meta, ctx, options),
  );
}

/**
 * Handle null type schema.
 * @internal
 */
export function handleNullTypeSchema(): string {
  return 'null';
}

/**
 * Handle oneOf composition schema.
 * @internal
 */
export function handleOneOfSchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (!schema.oneOf) {
    throw new Error('Schema must have oneOf property');
  }
  return handleOneOf(schema.oneOf, schema.nullable ?? false, (s) =>
    convertSchema(s, meta, ctx, options),
  );
}

/**
 * Handle anyOf composition schema.
 * @internal
 */
export function handleAnyOfSchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (!schema.anyOf) {
    throw new Error('Schema must have anyOf property');
  }
  return handleAnyOf(schema.anyOf, schema.nullable ?? false, options?.allReadonly ?? false, (s) =>
    convertSchema(s, meta, ctx, options),
  );
}

/**
 * Handle allOf composition schema.
 * @internal
 */
export function handleAllOfSchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (!schema.allOf) {
    throw new Error('Schema must have allOf property');
  }

  if (schema.allOf.length === 1) {
    const firstSchema = schema.allOf[0];
    if (!firstSchema) {
      throw new Error('allOf array must contain at least one schema');
    }
    return convertSchema(firstSchema, meta, ctx, options);
  }

  const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
    inferRequiredSchema(schema);

  const types = convertSchemasToTypes(noRequiredOnlyAllof, (prop) => {
    const type = convertSchema(prop, meta, ctx, options);
    if (ctx?.doc) {
      patchRequiredSchemaInLoop(prop, ctx.doc);
    }
    return type;
  });

  if (Object.keys(composedRequiredSchema.properties).length > 0) {
    const composedType = convertSchema(composedRequiredSchema, meta, ctx, options);
    types.push(composedType);
  }

  const intersection = handleIntersection(types);
  return wrapNullable(intersection, schema.nullable ?? false);
}

/**
 * Handle primitive type schema (string, number, integer, boolean).
 * @internal
 */
export function handlePrimitiveTypeSchema(schema: SchemaObject): string {
  const schemaType = schema.type;
  if (!schemaType || !isPrimitiveSchemaType(schemaType)) {
    throw new Error('Schema must be a primitive type');
  }

  const enumResult = handlePrimitiveEnum(schema, schemaType);
  if (enumResult) {
    return enumResult;
  }

  return handleBasicPrimitive(schemaType, schema.nullable ?? false);
}

/**
 * Handle array type schema.
 * @internal
 */
export function handleArrayTypeSchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (schema.type !== 'array') {
    throw new Error('Schema must be an array type');
  }
  return handleArraySchema(schema, options?.allReadonly ?? false, (items) =>
    convertSchema(items, meta, ctx, options),
  );
}

export { handleObjectTypeSchema } from './core.object-helpers.js';
