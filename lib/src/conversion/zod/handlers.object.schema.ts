import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { CodeMetaData, ConversionTypeContext, CodeMeta } from '../../shared/code-meta.js';
import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { getSchemaNameFromRef } from './handlers.core.js';
import { buildObjectPropertiesString } from './handlers.object.properties.js';

type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}) => CodeMeta;

type GetZodChainFn = (args: {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
}) => string;

/**
 * Handle additionalProperties when it's an object schema
 * Pure function: generates z.record() for object-type additionalProperties
 * Resolves references and applies validation chains
 *
 * @returns Zod code string for z.record() or undefined if not applicable
 */
export function handleAdditionalPropertiesAsRecord(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): CodeMeta | undefined {
  if (
    !(
      typeof schema.additionalProperties === 'object' &&
      Object.keys(schema.additionalProperties).length > 0
    )
  ) {
    return undefined;
  }

  // Resolve ref if needed for getZodChain (which needs .type property)
  const additionalPropsResolved: SchemaObject | ReferenceObject =
    isReferenceObject(schema.additionalProperties) && ctx?.doc
      ? getSchemaFromComponents(ctx.doc, getSchemaNameFromRef(schema.additionalProperties.$ref))
      : schema.additionalProperties;

  const additionalPropsZod = getZodSchema({
    schema: schema.additionalProperties,
    ctx,
    meta,
    options,
  });
  const additionalPropsChain = getZodChain({
    schema: additionalPropsResolved,
    meta: { ...meta, isRequired: true },
    options,
  });
  return code.assign(`z.record(${additionalPropsZod.toString()}${additionalPropsChain})`);
}

/**
 * Determine additional properties schema modifier
 */
function getAdditionalPropertiesModifier(
  schema: SchemaObject,
  options: TemplateContext['options'] | undefined,
): string {
  const additionalPropsDefaultValue =
    options?.additionalPropertiesDefaultValue === undefined
      ? true
      : options?.additionalPropertiesDefaultValue;
  const additionalProps =
    schema.additionalProperties == null ? additionalPropsDefaultValue : schema.additionalProperties;
  // When strictObjects is enabled, don't add .passthrough() (use .strict() instead)
  return additionalProps === false || options?.strictObjects ? '' : '.passthrough()';
}

/**
 * Build object schema modifiers
 */
function buildObjectModifiers(
  schema: SchemaObject,
  isPartial: boolean,
  options: TemplateContext['options'] | undefined,
): string {
  const partial = isPartial ? '.partial()' : '';
  const strict = options?.strictObjects ? '.strict()' : '';
  const readonly = options?.allReadonly ? '.readonly()' : '';
  const additionalPropsSchema = getAdditionalPropertiesModifier(schema, options);
  return `${partial}${strict}${additionalPropsSchema}${readonly}`;
}

/**
 * Determine if schema should be partial
 */
function determineIsPartial(
  schema: SchemaObject,
  options: TemplateContext['options'] | undefined,
): boolean {
  return !!(options?.withImplicitRequiredProps ? false : !schema.required?.length);
}

/**
 * Build properties string for object schema
 */
function buildObjectProperties(
  schema: SchemaObject,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  isPartial: boolean,
  hasRequiredArray: boolean,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options: TemplateContext['options'] | undefined,
): string {
  if (!schema.properties) {
    return '{}';
  }
  return buildObjectPropertiesString(
    schema.properties,
    schema,
    ctx,
    meta,
    isPartial,
    hasRequiredArray,
    getZodSchema,
    getZodChain,
    options,
  );
}

/**
 * Handle object type schema
 * Pure function: generates z.object() with properties, additionalProperties, and modifiers
 * Complex logic for required/optional props, partial, strict, readonly, passthrough
 *
 * @returns Zod code string for object type
 */
export function handleObjectSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): CodeMeta {
  // Check if additionalProperties is an object schema → z.record()
  const recordResult = handleAdditionalPropertiesAsRecord(
    schema,
    code,
    ctx,
    meta,
    getZodSchema,
    getZodChain,
    options,
  );
  if (recordResult) {
    return recordResult;
  }

  const hasRequiredArray = !!(schema.required && schema.required.length > 0);
  const isPartial = determineIsPartial(schema, options);
  const properties = buildObjectProperties(
    schema,
    ctx,
    meta,
    isPartial,
    hasRequiredArray,
    getZodSchema,
    getZodChain,
    options,
  );
  const modifiers = buildObjectModifiers(schema, isPartial, options);

  return code.assign(`z.object(${properties})${modifiers}`);
}
