/**
 * Pure Helper Functions for Object Schema Handling
 *
 * This module contains pure functions extracted from handlers.object.properties.ts
 * and handlers.object.schema.ts to eliminate code duplication and promote reusability.
 *
 * All functions in this module are:
 * - Pure (no side effects)
 * - Well-tested (100% coverage)
 * - Type-safe (no type assertions)
 * - Single responsibility
 *
 * @module handlers.object.helpers
 * @public
 */

import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { parseComponentRef } from '../../shared/ref-resolution.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';

/**
 * Type signature for getZodSchema function - used to avoid circular dependencies.
 */
type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}) => ZodCodeResult;

/**
 * Type signature for getZodChain function - used to avoid circular dependencies.
 */
type GetZodChainFn = (args: {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
}) => string;

/**
 * Determine if a property is required based on schema and options.
 *
 * Pure function that implements the property requirement logic:
 * - If schema is partial, all properties are optional (returns true)
 * - If schema has required array, check if property is in it
 * - Otherwise, use withImplicitRequiredProps option
 *
 * @param prop - Property name to check
 * @param schema - Parent schema containing the property
 * @param isPartial - Whether the schema is partial (all props optional)
 * @param hasRequiredArray - Whether schema has a required array
 * @param options - Template options
 * @returns true if required, false if optional, undefined if implicit
 *
 * @example
 * ```typescript
 * const schema = { type: 'object', required: ['name'] };
 * determinePropertyRequired('name', schema, false, true, undefined); // true
 * determinePropertyRequired('age', schema, false, true, undefined); // false
 * ```
 *
 * @public
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
 * Build property metadata with required flag if defined.
 *
 * Pure function that creates a new CodeMetaData object with the isRequired
 * flag set if propIsRequired is defined. Preserves all existing metadata fields.
 *
 * @param meta - Base metadata to extend
 * @param propIsRequired - Whether property is required (true/false/undefined)
 * @returns New metadata object (does not mutate input)
 *
 * @example
 * ```typescript
 * const meta = { parent: someCodeResult };
 * const newMeta = buildPropertyMetadata(meta, true);
 * // newMeta: { parent: someCodeResult, isRequired: true }
 * ```
 *
 * @public
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
 * Resolve schema reference for chain validation.
 *
 * Pure function that dereferences a ReferenceObject to get the actual schema.
 * If the schema is not a reference or context is not provided, returns as-is.
 *
 * @param propSchema - Schema or reference to resolve
 * @param ctx - Conversion context with document
 * @returns Resolved schema (or original if not a reference)
 *
 * @example
 * ```typescript
 * const ref = { $ref: '#/components/schemas/User' };
 * const resolved = resolveSchemaForChain(ref, ctx);
 * // resolved: { type: 'object', properties: {...} }
 * ```
 *
 * @public
 */
export function resolveSchemaForChain(
  propSchema: SchemaObject | ReferenceObject,
  ctx: ConversionTypeContext | undefined,
): SchemaObject | ReferenceObject {
  if (isReferenceObject(propSchema) && ctx?.doc) {
    const parsedRef = parseComponentRef(propSchema.$ref);
    return getSchemaFromComponents(ctx.doc, parsedRef.componentName, parsedRef.xExtKey);
  }
  return propSchema;
}

/**
 * Build Zod code for a property.
 *
 * Pure function that generates the complete Zod code string for a property
 * by combining the schema code and validation chain.
 *
 * @param propSchema - Property schema
 * @param propActualSchema - Resolved property schema (dereferenced)
 * @param propMetadata - Property metadata (required/optional, etc.)
 * @param ctx - Conversion context
 * @param getZodSchema - Function to convert schema to Zod code
 * @param getZodChain - Function to generate validation chain
 * @param options - Template options
 * @returns Complete Zod code string for property
 *
 * @example
 * ```typescript
 * const code = buildPropertyZodCode(
 *   { type: 'string' },
 *   { type: 'string' },
 *   { isRequired: false },
 *   ctx,
 *   getZodSchema,
 *   getZodChain,
 *   options,
 * );
 * // code: "z.string().optional()"
 * ```
 *
 * @public
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
