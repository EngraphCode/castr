import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import { match } from 'ts-pattern';

import {
  generateNonStringEnumZodCode,
  generateStringEnumZodCode,
  shouldEnumBeNever,
} from '../../shared/enum-helpers.js';
import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';
import { getSchemaNameFromRef, parseComponentRef } from '../../shared/ref-resolution.js';
import type { ZodCodeResult, CodeMetaData, ConversionTypeContext } from './index.js';

// Re-export for backward compatibility
export { getSchemaNameFromRef };

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
 * Check if a schema reference is circular (recursive).
 * Pure predicate function.
 *
 * @param schemaName - Name of the schema being referenced
 * @param refsPath - Path of schema references traversed so far
 * @returns True if this creates a circular reference
 * @internal
 */
function isCircularReference(schemaName: string, refsPath: string[]): boolean {
  return refsPath.length > 1 && refsPath.includes(schemaName);
}

/**
 * Handle circular reference by returning existing schema.
 * Safe with non-null assertions because circular references are only detected
 * when the schema is already being processed higher in the call stack.
 *
 * @param code - ZodCodeResult with ref pointing to circular schema
 * @param ctx - Conversion context with registered schemas
 * @returns ZodCodeResult with assigned circular schema
 * @internal
 */
function handleCircularReference(code: ZodCodeResult, ctx: ConversionTypeContext): ZodCodeResult {
  // In circular references, code.ref and the schema must exist
  // Non-null assertions are safe because we're inside a circular reference check
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...code, code: ctx.zodSchemaByName[code.ref!]! };
}

/**
 * Resolve schema reference by looking up or generating Zod code.
 * Pure function - generates new schema if not cached.
 *
 * @param ref - Full $ref string (e.g., "#/components/schemas/User")
 * @param schemaName - Extracted schema name
 * @param ctx - Conversion context
 * @param meta - Metadata for code generation
 * @param getZodSchema - Function to generate Zod schema
 * @param options - Template options
 * @returns Resolved Zod schema string
 * @throws Error if schema not found in components
 * @internal
 */
function resolveSchemaReference(
  ref: string,
  schemaName: string,
  ctx: ConversionTypeContext,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): string {
  const cached = ctx.zodSchemaByName[ref];
  if (cached) {
    return cached;
  }

  // Parse ref to extract xExtKey (if it's an x-ext ref)
  const parsedRef = parseComponentRef(ref);
  const actualSchema = getSchemaFromComponents(ctx.doc, schemaName, parsedRef.xExtKey);
  if (!actualSchema) {
    throw new Error(`Schema ${ref} not found`);
  }

  return getZodSchema({ schema: actualSchema, ctx, meta, options }).code;
}

/**
 * Handle reference object resolution with circular reference detection.
 * Orchestrates circular detection, schema resolution, and caching.
 *
 * @param schema - ReferenceObject with $ref
 * @param code - ZodCodeResult to assign result to
 * @param ctx - Conversion context (mutated to cache schemas)
 * @param refsPath - Path of references traversed (for circular detection)
 * @param meta - Metadata for code generation
 * @param getZodSchema - Function to generate Zod schema
 * @param options - Template options
 * @returns ZodCodeResult with resolved reference
 * @public
 */
export function handleReferenceObject(
  schema: ReferenceObject,
  code: ZodCodeResult,
  ctx: ConversionTypeContext,
  refsPath: string[],
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): ZodCodeResult {
  const schemaName = getSchemaNameFromRef(schema.$ref);

  if (isCircularReference(schemaName, refsPath)) {
    return handleCircularReference(code, ctx);
  }

  const result = resolveSchemaReference(schema.$ref, schemaName, ctx, meta, getZodSchema, options);

  // If schema already registered, return schema name for reference
  if (ctx.zodSchemaByName[schemaName]) {
    return { ...code, code: schemaName };
  }

  // Register resolved schema
  ctx.zodSchemaByName[schemaName] = result;

  // Return schema name for reference
  return { ...code, code: schemaName };
}

/**
 * Handle array type schema
 * Pure function: generates z.array() with optional readonly modifier
 * Resolves item schema references and applies chain validations
 *
 * @returns Zod code string for array type
 */
export function handleArraySchema(
  schema: SchemaObject,
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): ZodCodeResult {
  const readonly = options?.allReadonly ? '.readonly()' : '';

  if (!schema.items) {
    return { ...code, code: `z.array(z.any())${readonly}` };
  }

  // Resolve ref if needed for getZodChain (which needs .type property)
  const itemsSchema: SchemaObject | ReferenceObject =
    isReferenceObject(schema.items) && ctx?.doc
      ? (() => {
          const parsedRef = parseComponentRef(schema.items.$ref);
          return getSchemaFromComponents(ctx.doc, parsedRef.componentName, parsedRef.xExtKey);
        })()
      : schema.items;

  const itemZodSchema = getZodSchema({ schema: schema.items, ctx, meta, options }).code;
  const zodChain = getZodChain({
    schema: itemsSchema,
    meta: { ...meta, isRequired: true },
    options,
  });

  return { ...code, code: `z.array(${itemZodSchema}${zodChain})${readonly}` };
}

/**
 * Handle primitive type schema (string, number, integer, boolean)
 * Pure function: generates z.string(), z.number(), etc. with enum support
 * Handles special formats (binary → File) and invalid enum combinations
 *
 * @returns Zod code string for primitive type
 */
export function handlePrimitiveSchema(
  schema: SchemaObject,
  code: ZodCodeResult,
  schemaType: string,
): ZodCodeResult {
  if (schema.enum) {
    // Handle string enums
    if (schemaType === 'string') {
      return { ...code, code: generateStringEnumZodCode(schema.enum) };
    }

    // Non-string enums with string values are invalid
    if (shouldEnumBeNever(schemaType, schema.enum)) {
      return { ...code, code: 'z.never()' };
    }

    // Handle number/integer enums
    return { ...code, code: generateNonStringEnumZodCode(schema.enum) };
  }

  return {
    ...code,
    code: match(schemaType)
      .with('integer', () => 'z.number()')
      .with('string', () =>
        match(schema.format)
          .with('binary', () => 'z.instanceof(File)')
          .otherwise(() => 'z.string()'),
      )
      .otherwise((type) => `z.${type}()`),
  };
}

/**
 * Handle multiple type schema (OpenAPI 3.1 feature)
 * Pure function: generates union of all possible types when type is an array
 * Single type arrays are simplified to just that type
 *
 * @returns Zod code string for multiple type union or single type
 */
export function handleMultipleTypeSchema(
  schema: SchemaObject,
  code: ZodCodeResult,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): ZodCodeResult {
  if (!Array.isArray(schema.type)) {
    throw new Error('handleMultipleTypeSchema requires schema.type to be an array');
  }

  if (schema.type.length === 1) {
    const firstType = schema.type[0];
    if (!firstType) {
      throw new Error('Schema type array has invalid first element');
    }
    return getZodSchema({ schema: { ...schema, type: firstType }, ctx, meta, options });
  }

  return {
    ...code,
    code: `z.union([${schema.type
      .map((prop) => getZodSchema({ schema: { ...schema, type: prop }, ctx, meta, options }).code)
      .join(', ')}])`,
  };
}
