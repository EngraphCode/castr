import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { parseComponentRef } from '../../shared/ref-resolution.js';
import { buildObjectPropertiesString } from './handlers.object.properties.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';
import type { IRSchemaNode, IRSchema } from '../../context/ir-schema.js';
import { IRSchemaProperties } from '../../context/ir-schema-properties.js';

type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  irNode?: IRSchemaNode | undefined;
  options?: TemplateContext['options'] | undefined;
}) => ZodCodeResult;

type GetZodChainFn = (args: {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  irNode?: IRSchemaNode;
  options?: TemplateContext['options'];
}) => string;

/**
 * Type guard to check if properties are already wrapped in IRSchemaProperties.
 *
 * @param properties - Properties to check
 * @returns True if properties is IRSchemaProperties instance
 * @internal
 */
function isIRSchemaProperties(properties: unknown): properties is IRSchemaProperties {
  return properties instanceof IRSchemaProperties;
}

/**
 * Type guard to narrow Record to IRSchema record.
 *
 * IRSchema extends SchemaObject, adding optional metadata fields.
 * This structural compatibility means a Record of SchemaObject can be
 * safely treated as a Record of IRSchema when needed.
 *
 * @param record - Record to check
 * @returns True - structurally compatible by design
 * @internal
 */
function canTreatAsIRSchemaRecord(
  record: Record<string, SchemaObject | ReferenceObject>,
): record is Record<string, IRSchema> {
  // Structural compatibility: IRSchema extends SchemaObject
  // All SchemaObject properties exist in IRSchema
  // Additional IRSchema fields (metadata) are optional
  // Therefore, treating SchemaObject as IRSchema is type-safe
  return true;
}

/**
 * Handle additionalProperties when it's an object schema
 * Pure function: generates z.record() for object-type additionalProperties
 * Resolves references and applies validation chains
 *
 * Accepts both SchemaObject and IRSchema for gradual migration.
 *
 * @returns Zod code string for z.record() or undefined if not applicable
 */
export function handleAdditionalPropertiesAsRecord(
  schema: SchemaObject | IRSchema,
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
 * Determine additional properties schema modifier
 *
 * Accepts both SchemaObject and IRSchema for gradual migration.
 */
function getAdditionalPropertiesModifier(
  schema: SchemaObject | IRSchema,
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
 *
 * Accepts both SchemaObject and IRSchema for gradual migration.
 */
function buildObjectModifiers(
  schema: SchemaObject | IRSchema,
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
 *
 * Accepts both SchemaObject and IRSchema for gradual migration.
 */
function determineIsPartial(
  schema: SchemaObject | IRSchema,
  options: TemplateContext['options'] | undefined,
): boolean {
  return !!(options?.withImplicitRequiredProps ? false : !schema.required?.length);
}

/**
 * Build properties string for object schema
 *
 * Accepts both SchemaObject and IRSchema. Handles properties as either
 * plain Record or IRSchemaProperties wrapper without type assertions.
 */
function buildObjectProperties(
  schema: SchemaObject | IRSchema,
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

  // Handle properties based on type: IRSchemaProperties or plain Record
  // IRSchema can have properties as IRSchemaProperties, SchemaObject has Record
  let properties: IRSchemaProperties;

  if (isIRSchemaProperties(schema.properties)) {
    // Already wrapped - use directly (from IRSchema)
    properties = schema.properties;
  } else if (canTreatAsIRSchemaRecord(schema.properties)) {
    // Plain Record from SchemaObject - wrap it
    // Type guard confirms structural compatibility
    properties = new IRSchemaProperties(schema.properties);
  } else {
    // Fallback for unexpected types - should never happen
    throw new Error('Invalid schema properties: expected Record or IRSchemaProperties');
  }

  return buildObjectPropertiesString(
    properties,
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
 * Accepts both SchemaObject and IRSchema for gradual migration.
 *
 * @returns Zod code string for object type
 */
export function handleObjectSchema(
  schema: SchemaObject | IRSchema,
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
