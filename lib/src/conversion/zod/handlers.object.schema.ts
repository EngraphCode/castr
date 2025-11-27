import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { parseComponentRef } from '../../shared/ref-resolution.js';
import { buildObjectPropertiesString } from './handlers.object.properties.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';
import type { IRSchemaNode } from '../../context/ir-schema.js';

/**
 * Function type for Zod schema generation.
 * Uses library types (SchemaObject | ReferenceObject) per RULES.md "Library Types First".
 */
type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  irNode?: IRSchemaNode | undefined;
  options?: TemplateContext['options'] | undefined;
}) => ZodCodeResult;

/**
 * Function type for Zod chain generation.
 * Uses library types (SchemaObject | ReferenceObject) per RULES.md "Library Types First".
 */
type GetZodChainFn = (args: {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  irNode?: IRSchemaNode;
  options?: TemplateContext['options'];
}) => string;

/**
 * Handle additionalProperties when it's an object schema.
 * Pure function: generates z.record() for object-type additionalProperties.
 * Resolves references and applies validation chains.
 *
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
 *
 * @returns Zod code string for z.record() or undefined if not applicable
 */
export function handleAdditionalPropertiesAsRecord(
  schema: SchemaObject,
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): ZodCodeResult | undefined {
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
      ? (() => {
          const parsedRef = parseComponentRef(schema.additionalProperties.$ref);
          return getSchemaFromComponents(ctx.doc, parsedRef.componentName, parsedRef.xExtKey);
        })()
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
  return { ...code, code: `z.record(${additionalPropsZod.code}${additionalPropsChain})` };
}

/**
 * Determine additional properties schema modifier.
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
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
 * Build object schema modifiers.
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
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
 * Determine if schema should be partial.
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
 */
function determineIsPartial(
  schema: SchemaObject,
  options: TemplateContext['options'] | undefined,
): boolean {
  return !!(options?.withImplicitRequiredProps ? false : !schema.required?.length);
}

/**
 * Build properties string for object schema.
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
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

  // SchemaObject.properties is Record<string, SchemaObject | ReferenceObject>
  // Pass directly to buildObjectPropertiesString using library types
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
 * Handle object type schema.
 * Pure function: generates z.object() with properties, additionalProperties, and modifiers.
 * Complex logic for required/optional props, partial, strict, readonly, passthrough.
 *
 * Uses library types (SchemaObject) per RULES.md "Library Types First".
 *
 * @returns Zod code string for object type
 */
export function handleObjectSchema(
  schema: SchemaObject,
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): ZodCodeResult {
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

  return { ...code, code: `z.object(${properties})${modifiers}` };
}
