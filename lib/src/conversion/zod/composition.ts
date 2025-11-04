import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import { isSchemaObject } from 'openapi3-ts/oas31';

import type { CodeMetaData, ConversionTypeContext, CodeMeta } from '../../shared/code-meta.js';
import type { TemplateContext } from '../../context/template-context.js';
import { inferRequiredSchema } from '../../shared/infer-required-only.js';

type GetZodSchemaFn = (args: {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
}) => CodeMeta;

/**
 * Handle oneOf composition schema
 * Pure function: generates discriminated union or regular union based on schema
 *
 * @returns Zod code string for oneOf union
 */
export function handleOneOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.oneOf || schema.oneOf.length === 0) {
    throw new Error('Invalid oneOf: array is empty or undefined');
  }

  if (schema.oneOf.length === 1) {
    const firstSchema = schema.oneOf[0];
    if (!firstSchema) {
      throw new Error('oneOf array has invalid first element');
    }
    const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
    return code.assign(type.toString());
  }

  /* when there are multiple allOf we are unable to use a discriminatedUnion as this library adds an
   *   'z.and' to the schema that it creates which breaks type inference */
  const hasMultipleAllOf = schema.oneOf.some(
    (obj) => isSchemaObject(obj) && (obj?.allOf || []).length > 1,
  );

  if (schema.discriminator && !hasMultipleAllOf) {
    const propertyName = schema.discriminator.propertyName;

    return code.assign(`
                z.discriminatedUnion("${propertyName}", [${schema.oneOf
                  .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
                  .join(', ')}])
            `);
  }

  return code.assign(
    `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options })).join(', ')}])`,
  );
}

/**
 * Handle anyOf composition schema
 * Pure function: generates union of all anyOf options
 * anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
 *
 * @returns Zod code string for anyOf union
 */
export function handleAnyOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.anyOf || schema.anyOf.length === 0) {
    throw new Error('Invalid anyOf: array is empty or undefined');
  }

  if (schema.anyOf.length === 1) {
    const firstSchema = schema.anyOf[0];
    if (!firstSchema) {
      throw new Error('anyOf array has invalid first element');
    }
    const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
    return code.assign(type.toString());
  }

  const types = schema.anyOf
    .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
    .map((type) => type.toString())
    .join(', ');

  return code.assign(`z.union([${types}])`);
}

/**
 * Handle single allOf schema case
 * @internal
 */
function handleSingleAllOf(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
  const firstSchema = schema.allOf?.[0];
  if (!firstSchema) {
    throw new Error('allOf array has invalid first element');
  }
  const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
  return code.assign(type.toString());
}

/**
 * Process allOf schemas and compose with required schema
 * @internal
 */
function processAllOfSchemas(
  schema: SchemaObject,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta[] {
  const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
    inferRequiredSchema(schema);

  const types = noRequiredOnlyAllof.map((prop) => {
    const zodSchema = getZodSchema({ schema: prop, ctx, meta, options });
    if (ctx?.doc) {
      patchRequiredSchemaInLoop(prop, ctx.doc);
    }
    return zodSchema;
  });

  if (composedRequiredSchema.required.length > 0) {
    types.push(getZodSchema({ schema: composedRequiredSchema, ctx, meta, options }));
  }

  return types;
}

/**
 * Handle allOf composition schema
 * Pure function: generates intersection of all allOf schemas with .and()
 * Handles required schema inference for proper type composition
 *
 * @returns Zod code string for allOf intersection
 */
export function handleAllOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.allOf || schema.allOf.length === 0) {
    throw new Error('Invalid allOf: array is empty or undefined');
  }

  if (schema.allOf.length === 1) {
    return handleSingleAllOf(schema, code, ctx, meta, getZodSchema, options);
  }

  const types = processAllOfSchemas(schema, ctx, meta, getZodSchema, options);

  const first = types.at(0);
  if (!first) {
    throw new Error('allOf schemas list is empty');
  }
  const rest = types
    .slice(1)
    .map((type) => `and(${type.toString()})`)
    .join('.');

  return code.assign(`${first.toString()}.${rest}`);
}

/**
 * Route composition schemas (oneOf/anyOf/allOf) to their handlers
 * Pure router function: delegates to specific composition handler
 *
 * @returns Zod code string for composition or undefined if not a composition schema
 */
export function handleCompositionSchemaIfPresent(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta | undefined {
  if (schema.oneOf) {
    return handleOneOfSchema(schema, code, ctx, meta, getZodSchema, options);
  }
  if (schema.anyOf) {
    return handleAnyOfSchema(schema, code, ctx, meta, getZodSchema, options);
  }
  if (schema.allOf) {
    return handleAllOfSchema(schema, code, ctx, meta, getZodSchema, options);
  }
  return undefined;
}
