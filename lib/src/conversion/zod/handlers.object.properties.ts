import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { wrapWithQuotesIfNeeded } from '../../shared/utils/index.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { getSchemaNameFromRef } from './handlers.core.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';

type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}) => ZodCodeResult;

type GetZodChainFn = (args: {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
}) => string;

/**
 * Determine if a property is required based on schema and options
 */
export function determinePropertyRequired(
  prop: string,
  schema: SchemaObject,
  isPartial: boolean,
  hasRequiredArray: boolean,
  options: TemplateContext['options'] | undefined,
): boolean | undefined {
  if (isPartial) {
    return true;
  }
  if (hasRequiredArray) {
    return schema.required?.includes(prop);
  }
  return options?.withImplicitRequiredProps;
}

/**
 * Build property metadata with required flag if defined
 */
export function buildPropertyMetadata(
  meta: CodeMetaData,
  propIsRequired: boolean | undefined,
): CodeMetaData {
  const propMetadata: CodeMetaData = {
    ...meta,
  };
  if (propIsRequired !== undefined) {
    propMetadata.isRequired = propIsRequired;
  }
  return propMetadata;
}

/**
 * Resolve schema reference for chain validation
 */
export function resolveSchemaForChain(
  propSchema: SchemaObject | ReferenceObject,
  ctx: ConversionTypeContext | undefined,
): SchemaObject | ReferenceObject {
  if (isReferenceObject(propSchema) && ctx?.doc) {
    return getSchemaFromComponents(ctx.doc, getSchemaNameFromRef(propSchema.$ref));
  }
  return propSchema;
}

/**
 * Build Zod code for a property
 */
export function buildPropertyZodCode(
  propSchema: SchemaObject | ReferenceObject,
  propActualSchema: SchemaObject | ReferenceObject,
  propMetadata: CodeMetaData,
  ctx: ConversionTypeContext | undefined,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options: TemplateContext['options'] | undefined,
): string {
  const propZodSchema = getZodSchema({
    schema: propSchema,
    ctx,
    meta: propMetadata,
    options,
  });
  const propChain = getZodChain({
    schema: propActualSchema,
    meta: propMetadata,
    options,
  });
  return `${propZodSchema.code}${propChain}`;
}

/**
 * Build a single property entry for z.object()
 * Pure function: converts one OpenAPI property to Zod code with metadata
 * Determines required/optional and resolves references
 *
 * @returns Tuple of [propertyName, zodCode]
 */
export function buildPropertyEntry(
  prop: string,
  propSchema: SchemaObject | ReferenceObject,
  schema: SchemaObject,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  isPartial: boolean,
  hasRequiredArray: boolean,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): [string, string] {
  const propIsRequired = determinePropertyRequired(
    prop,
    schema,
    isPartial,
    hasRequiredArray,
    options,
  );
  const propMetadata = buildPropertyMetadata(meta, propIsRequired);
  const propActualSchema = resolveSchemaForChain(propSchema, ctx);
  const propCode = buildPropertyZodCode(
    propSchema,
    propActualSchema,
    propMetadata,
    ctx,
    getZodSchema,
    getZodChain,
    options,
  );

  return [prop, propCode];
}

/**
 * Build properties string for z.object()
 * Pure function: converts OpenAPI properties to Zod object property definitions
 * Handles required/optional determination and reference resolution
 *
 * @returns Properties string like "{ prop1: z.string(), prop2: z.number().optional() }"
 */
export function buildObjectPropertiesString(
  properties: Record<string, SchemaObject | ReferenceObject>,
  schema: SchemaObject,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  isPartial: boolean,
  hasRequiredArray: boolean,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): string {
  const propsMap = Object.entries(properties).map(([prop, propSchema]) =>
    buildPropertyEntry(
      prop,
      propSchema,
      schema,
      ctx,
      meta,
      isPartial,
      hasRequiredArray,
      getZodSchema,
      getZodChain,
      options,
    ),
  );

  const validProps = propsMap.filter((entry): entry is [string, string] => {
    const [prop] = entry;
    return typeof prop === 'string' && prop.length > 0;
  });

  return (
    '{ ' +
    validProps
      .map(([prop, propSchema]) => `${wrapWithQuotesIfNeeded(prop)}: ${propSchema}`)
      .join(', ') +
    ' }'
  );
}
