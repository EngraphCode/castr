/**
 * Object type handling helpers for schema conversion
 * Extracted from openApiToTypescript.core.converters.ts to reduce file size
 *
 * @internal
 */

import type { SchemaObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { isPropertyRequired, resolveAdditionalPropertiesType } from './helpers.js';
import {
  handleObjectType,
  handlePartialObject,
  mergeObjectWithAdditionalProps,
  wrapReadonly,
} from './string-helpers.js';

import type { SchemaHandler, TsConversionArgs, TsConversionContext } from './core.js';

/**
 * Build properties record from schema.
 * @internal
 */
export function buildPropertiesRecord(
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
export function applyObjectTypeModifiers(
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
export function handleObjectTypeSchema(
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
