import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { wrapWithQuotesIfNeeded } from '../../shared/utils/index.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';
import type { IRSchemaNode } from '../../context/ir-schema.js';
import {
  determinePropertyRequired,
  buildPropertyMetadata,
  resolveSchemaForChain,
  buildPropertyZodCode,
} from './handlers.object.helpers.js';

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
 * Build a single property entry for z.object()
 * Pure function: converts one OpenAPI property to Zod code with metadata
 * Determines required/optional and resolves references
 *
 * Accepts IRSchema for full IR integration (IRSchema extends SchemaObject).
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
 * Build properties string for z.object().
 * Pure function: converts OpenAPI properties to Zod object property definitions.
 * Handles required/optional determination and reference resolution.
 *
 * Uses library types (Record<string, SchemaObject | ReferenceObject>) per
 * RULES.md "Library Types First".
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
  // Process each property using library types
  const propEntries = Object.entries(properties).map(([prop, propSchema]) => {
    return buildPropertyEntry(
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
    );
  });

  const validProps = propEntries.filter((entry): entry is [string, string] => {
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
