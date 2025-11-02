import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import { match } from 'ts-pattern';

import type { CodeMetaData, ConversionTypeContext, CodeMeta } from '../../shared/code-meta.js';
import {
  generateNonStringEnumZodCode,
  generateStringEnumZodCode,
  shouldEnumBeNever,
} from '../../shared/enum-helpers.js';
import type { TemplateContext } from '../../context/template-context.js';
import { getSchemaFromComponents } from '../../shared/component-access.js';

/**
 * Extract schema name from a component schema $ref
 */
export function getSchemaNameFromRef(ref: string): string {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    return ref; // Fallback to ref if can't extract name
  }
  return name;
}

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
 * Handle reference object resolution with circular reference detection
 * Pure function: only mutates ctx.zodSchemaByName (passed by reference)
 *
 * @returns CodeMeta with the resolved reference, or null if not a reference
 */
export function handleReferenceObject(
  schema: ReferenceObject,
  code: CodeMeta,
  ctx: ConversionTypeContext,
  refsPath: string[],
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
  const schemaName = getSchemaNameFromRef(schema.$ref);

  // circular(=recursive) reference
  if (refsPath.length > 1 && refsPath.includes(schemaName)) {
    // In circular references, code.ref and the schema must exist
    // The non-null assertions are safe here because we're inside a reference object check
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return code.assign(ctx.zodSchemaByName[code.ref!]!);
  }

  let result = ctx.zodSchemaByName[schema.$ref];
  if (!result) {
    const actualSchema = getSchemaFromComponents(ctx.doc, schemaName);
    if (!actualSchema) {
      throw new Error(`Schema ${schema.$ref} not found`);
    }

    result = getZodSchema({ schema: actualSchema, ctx, meta, options }).toString();
  }

  if (ctx.zodSchemaByName[schemaName]) {
    return code;
  }

  ctx.zodSchemaByName[schemaName] = result;

  return code;
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
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  getZodChain: GetZodChainFn,
  options?: TemplateContext['options'],
): CodeMeta {
  const readonly = options?.allReadonly ? '.readonly()' : '';

  if (!schema.items) {
    return code.assign(`z.array(z.any())${readonly}`);
  }

  // Resolve ref if needed for getZodChain (which needs .type property)
  const itemsSchema: SchemaObject | ReferenceObject =
    isReferenceObject(schema.items) && ctx?.doc
      ? getSchemaFromComponents(ctx.doc, getSchemaNameFromRef(schema.items.$ref))
      : schema.items;

  const itemZodSchema = getZodSchema({ schema: schema.items, ctx, meta, options }).toString();
  const zodChain = getZodChain({
    schema: itemsSchema,
    meta: { ...meta, isRequired: true },
    options,
  });

  return code.assign(`z.array(${itemZodSchema}${zodChain})${readonly}`);
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
  code: CodeMeta,
  schemaType: string,
): CodeMeta {
  if (schema.enum) {
    // Handle string enums
    if (schemaType === 'string') {
      return code.assign(generateStringEnumZodCode(schema.enum));
    }

    // Non-string enums with string values are invalid
    if (shouldEnumBeNever(schemaType, schema.enum)) {
      return code.assign('z.never()');
    }

    // Handle number/integer enums
    return code.assign(generateNonStringEnumZodCode(schema.enum));
  }

  return code.assign(
    match(schemaType)
      .with('integer', () => 'z.number()')
      .with('string', () =>
        match(schema.format)
          .with('binary', () => 'z.instanceof(File)')
          .otherwise(() => 'z.string()'),
      )
      .otherwise((type) => `z.${type}()`),
  );
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
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  getZodSchema: GetZodSchemaFn,
  options?: TemplateContext['options'],
): CodeMeta {
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

  return code.assign(
    `z.union([${schema.type
      .map((prop) => getZodSchema({ schema: { ...schema, type: prop }, ctx, meta, options }))
      .join(', ')}])`,
  );
}
