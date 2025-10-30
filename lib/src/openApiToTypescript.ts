import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import type { TemplateContext } from './template-context.js';
import { inferRequiredSchema } from './inferRequiredOnly.js';

import {
  convertSchemasToTypes,
  handleAnyOf,
  handleArraySchema,
  handleBasicPrimitive,
  handleOneOf,
  handlePrimitiveEnum,
  handleReferenceObject,
  handleTypeArray,
  isPrimitiveSchemaType,
  isPropertyRequired,
  resolveAdditionalPropertiesType,
} from './openApiToTypescript.helpers.js';
import {
  handleIntersection,
  handleObjectType,
  handlePartialObject,
  mergeObjectWithAdditionalProps,
  wrapNullable,
  wrapReadonly,
} from './openApiToTypescript.string-helpers.js';

type TsConversionArgs = {
  schema: SchemaObject | ReferenceObject;
  ctx?: TsConversionContext | undefined;
  meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
  options?: TemplateContext['options'];
};

type SchemaHandler = (
  schema: SchemaObject | ReferenceObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
) => string;

export type TsConversionContext = {
  nodeByRef: Record<string, string>;
  doc: OpenAPIObject;
  rootRef?: string;
  visitedRefs?: Record<string, boolean>;
};

/**
 * Handle reference object schema.
 * @internal
 */
function handleReferenceSchema(
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
function handleTypeArraySchema(
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
function handleNullTypeSchema(): string {
  return 'null';
}

/**
 * Handle oneOf composition schema.
 * @internal
 */
function handleOneOfSchema(
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
function handleAnyOfSchema(
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
function handleAllOfSchema(
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
function handlePrimitiveTypeSchema(schema: SchemaObject): string {
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
function handleArrayTypeSchema(
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

/**
 * Build properties record from schema.
 * @internal
 */
function buildPropertiesRecord(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): Record<string, string> {
  if (!schema.properties) {
    return {};
  }

  const isPartial = !schema.required?.length;
  const propsRecord: Record<string, string> = {};

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const propType = convertSchema(propSchema, meta, ctx, options);
    const isRequired = isPropertyRequired(propName, schema, isPartial);
    const finalPropType = isRequired ? propType : `${propType}?`;
    propsRecord[propName] = finalPropType;
  }

  return propsRecord;
}

/**
 * Apply wrapping modifiers to object type (readonly, Partial).
 * @internal
 */
function applyObjectTypeModifiers(
  objectType: string,
  schema: SchemaObject,
  options: TemplateContext['options'] | undefined,
): string {
  const isPartial = !schema.required?.length;
  const shouldWrapReadonly = options?.allReadonly ?? false;

  let result = objectType;

  if (shouldWrapReadonly) {
    result = wrapReadonly(result, true);
  }

  if (isPartial) {
    result = handlePartialObject(result);
  }

  return result;
}

/**
 * Handle object type schema.
 * @internal
 */
function handleObjectTypeSchema(
  schema: SchemaObject,
  meta: TsConversionArgs['meta'],
  ctx: TsConversionContext | undefined,
  options: TemplateContext['options'] | undefined,
  convertSchema: SchemaHandler,
): string {
  if (!schema.properties) {
    return '{}';
  }

  const propsRecord = buildPropertiesRecord(schema, meta, ctx, options, convertSchema);
  let objectType = handleObjectType(propsRecord);

  const additionalPropertiesType = resolveAdditionalPropertiesType(
    schema.additionalProperties,
    (additionalSchema) => convertSchema(additionalSchema, meta, ctx, options),
  );

  if (additionalPropertiesType) {
    const indexSig = `[key: string]: ${additionalPropertiesType}`;
    objectType = mergeObjectWithAdditionalProps(objectType, indexSig);
  }

  return applyObjectTypeModifiers(objectType, schema, options);
}

/**
 * Setup conversion context for visited references.
 * @internal
 */
function setupConversionContext(
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
function handleCompositionSchemas(
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
function handleTypedSchemas(
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
function convertSchemaToType(
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
function formatTypeScriptResult(tsResult: string, inheritedMeta: TsConversionArgs['meta']): string {
  if (inheritedMeta?.name && !inheritedMeta?.isInline) {
    return `export type ${inheritedMeta.name} = ${tsResult};`;
  }

  return tsResult;
}

export const getTypescriptFromOpenApi = ({
  schema,
  meta: inheritedMeta,
  ctx,
  options,
}: TsConversionArgs): string => {
  const meta: TsConversionArgs['meta'] = {};

  setupConversionContext(ctx, inheritedMeta);

  if (!schema) {
    throw new Error('Schema is required');
  }

  const convertSchema: SchemaHandler = (s, m, c, o) =>
    getTypescriptFromOpenApi({ schema: s, meta: m, ctx: c, options: o });

  const tsResult = convertSchemaToType(schema, meta, ctx, options, convertSchema);
  return formatTypeScriptResult(tsResult, inheritedMeta);
};
