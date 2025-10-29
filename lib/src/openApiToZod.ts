import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject, isSchemaObject } from 'openapi3-ts/oas30';

import { match } from 'ts-pattern';

import type { CodeMetaData, ConversionTypeContext } from './CodeMeta.js';
import { CodeMeta } from './CodeMeta.js';
import {
  generateNonStringEnumZodCode,
  generateStringEnumZodCode,
  shouldEnumBeNever,
} from './enumHelpers.js';
import type { TemplateContext } from './template-context.js';
import { escapeControlCharacters, isPrimitiveSchemaType, wrapWithQuotesIfNeeded } from './utils.js';
import { inferRequiredSchema } from './inferRequiredOnly.js';
import { getSchemaFromComponents } from './component-access.js';

/**
 * Extract schema name from a component schema $ref
 */
const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  if (!name) {
    return ref; // Fallback to ref if can't extract name
  }
  return name;
};

type ConversionArgs = {
  schema: SchemaObject | ReferenceObject;
  ctx?: ConversionTypeContext | undefined;
  meta?: CodeMetaData | undefined;
  options?: TemplateContext['options'] | undefined;
};

/**
 * Handle reference object resolution with circular reference detection
 * Pure function: only mutates ctx.zodSchemaByName (passed by reference)
 * 
 * @returns CodeMeta with the resolved reference, or null if not a reference
 */
function handleReferenceObject(
  schema: ReferenceObject,
  code: CodeMeta,
  ctx: ConversionTypeContext,
  refsPath: string[],
  meta: CodeMetaData,
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
 * Handle oneOf composition schema
 * Pure function: generates discriminated union or regular union based on schema
 * 
 * @returns Zod code string for oneOf union
 */
function handleOneOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.oneOf || schema.oneOf.length === 0) {
    throw new Error('Invalid oneOf: array is empty or undefined');
  }

  if (schema.oneOf.length === 1) {
    const firstSchema = schema.oneOf[0];
    if (!firstSchema) throw new Error('oneOf array has invalid first element');
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
function handleAnyOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.anyOf || schema.anyOf.length === 0) {
    throw new Error('Invalid anyOf: array is empty or undefined');
  }

  if (schema.anyOf.length === 1) {
    const firstSchema = schema.anyOf[0];
    if (!firstSchema) throw new Error('anyOf array has invalid first element');
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
 * Handle allOf composition schema
 * Pure function: generates intersection of all allOf schemas with .and()
 * Handles required schema inference for proper type composition
 * 
 * @returns Zod code string for allOf intersection
 */
function handleAllOfSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!schema.allOf || schema.allOf.length === 0) {
    throw new Error('Invalid allOf: array is empty or undefined');
  }

  if (schema.allOf.length === 1) {
    const firstSchema = schema.allOf[0];
    if (!firstSchema) throw new Error('allOf array has invalid first element');
    const type = getZodSchema({ schema: firstSchema, ctx, meta, options });
    return code.assign(type.toString());
  }

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
    types.push(
      getZodSchema({
        schema: composedRequiredSchema,
        ctx,
        meta,
        options,
      }),
    );
  }

  const first = types.at(0);
  if (!first) throw new Error('allOf schemas list is empty');
  const rest = types
    .slice(1)
    .map((type) => `and(${type.toString()})`)
    .join('.');

  return code.assign(`${first.toString()}.${rest}`);
}

/**
 * Handle array type schema
 * Pure function: generates z.array() with optional readonly modifier
 * Resolves item schema references and applies chain validations
 * 
 * @returns Zod code string for array type
 */
function handleArraySchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
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
function handlePrimitiveSchema(
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
 * Build properties string for z.object()
 * Pure function: converts OpenAPI properties to Zod object property definitions
 * Handles required/optional determination and reference resolution
 * 
 * @returns Properties string like "{ prop1: z.string(), prop2: z.number().optional() }"
 */
function buildObjectPropertiesString(
  properties: Record<string, SchemaObject | ReferenceObject>,
  schema: SchemaObject,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  isPartial: boolean,
  hasRequiredArray: boolean,
  options?: TemplateContext['options'],
): string {
  const propsMap = Object.entries(properties).map(([prop, propSchema]) => {
    // Determine if this property is required
    let propIsRequired: boolean | undefined;
    if (isPartial) {
      propIsRequired = true;
    } else if (hasRequiredArray) {
      propIsRequired = schema.required?.includes(prop);
    } else {
      propIsRequired = options?.withImplicitRequiredProps;
    }

    // Build metadata, only including isRequired if defined (exactOptionalPropertyTypes)
    const propMetadata: CodeMetaData = {
      ...meta,
      name: prop,
    };
    if (propIsRequired !== undefined) {
      propMetadata.isRequired = propIsRequired;
    }

    // Resolve reference for getZodChain (which needs .type property)
    const propActualSchema: SchemaObject | ReferenceObject =
      isReferenceObject(propSchema) && ctx?.doc
        ? getSchemaFromComponents(ctx.doc, getSchemaNameFromRef(propSchema.$ref))
        : propSchema;

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
    const propCode = `${propZodSchema.toString()}${propChain}`;

    return [prop, propCode];
  });

  return (
    '{ ' +
    propsMap
      .filter((entry): entry is [string, string] => entry[0] !== undefined)
      .map(([prop, propSchema]) => `${wrapWithQuotesIfNeeded(prop)}: ${propSchema}`)
      .join(', ') +
    ' }'
  );
}

/**
 * Handle object type schema
 * Pure function: generates z.object() with properties, additionalProperties, and modifiers
 * Complex logic for required/optional props, partial, strict, readonly, passthrough
 * 
 * @returns Zod code string for object type
 */
function handleObjectSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta {
  const readonly = options?.allReadonly ? '.readonly()' : '';

  // additional properties default to true if additionalPropertiesDefaultValue not provided
  const additionalPropsDefaultValue =
    options?.additionalPropertiesDefaultValue === undefined
      ? true
      : options?.additionalPropertiesDefaultValue;
  const additionalProps =
    schema.additionalProperties == null
      ? additionalPropsDefaultValue
      : schema.additionalProperties;
  // When strictObjects is enabled, don't add .passthrough() (use .strict() instead)
  const additionalPropsSchema =
    additionalProps === false || options?.strictObjects ? '' : '.passthrough()';

  if (
    typeof schema.additionalProperties === 'object' &&
    Object.keys(schema.additionalProperties).length > 0
  ) {
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

  const hasRequiredArray = !!(schema.required && schema.required.length > 0);
  const isPartial = !!(options?.withImplicitRequiredProps ? false : !schema.required?.length);
  const properties = schema.properties
    ? buildObjectPropertiesString(schema.properties, schema, ctx, meta, isPartial, hasRequiredArray, options)
    : '{}';

  const partial = isPartial ? '.partial()' : '';
  const strict = options?.strictObjects ? '.strict()' : '';
  return code.assign(
    `z.object(${properties})${partial}${strict}${additionalPropsSchema}${readonly}`,
  );
}

/**
 * Handle multiple type schema (OpenAPI 3.1 feature)
 * Pure function: generates union of all possible types when type is an array
 * Single type arrays are simplified to just that type
 * 
 * @returns Zod code string for multiple type union or single type
 */
function handleMultipleTypeSchema(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta {
  if (!Array.isArray(schema.type)) {
    throw new Error('handleMultipleTypeSchema requires schema.type to be an array');
  }

  if (schema.type.length === 1) {
    const firstType = schema.type[0];
    if (!firstType) throw new Error('Schema type array has invalid first element');
    return getZodSchema({ schema: { ...schema, type: firstType }, ctx, meta, options });
  }

  return code.assign(
    `z.union([${schema.type
      .map((prop) => getZodSchema({ schema: { ...schema, type: prop }, ctx, meta, options }))
      .join(', ')}])`,
  );
}

/**
 * Route composition schemas (oneOf/anyOf/allOf) to their handlers
 * Pure router function: delegates to specific composition handler
 * 
 * @returns Zod code string for composition or undefined if not a composition schema
 */
function handleCompositionSchemaIfPresent(
  schema: SchemaObject,
  code: CodeMeta,
  ctx: ConversionTypeContext | undefined,
  meta: CodeMetaData,
  options?: TemplateContext['options'],
): CodeMeta | undefined {
  if (schema.oneOf) return handleOneOfSchema(schema, code, ctx, meta, options);
  if (schema.anyOf) return handleAnyOfSchema(schema, code, ctx, meta, options);
  if (schema.allOf) return handleAllOfSchema(schema, code, ctx, meta, options);
  return undefined;
}

/**
 * Prepare schema conversion context
 * Pure function: validates schema, applies refiner, builds CodeMeta and metadata
 * 
 * @returns Prepared schema, code, meta, and refsPath for conversion
 */
function prepareSchemaContext(
  $schema: SchemaObject | ReferenceObject | null | undefined,
  ctx: ConversionTypeContext | undefined,
  inheritedMeta: CodeMetaData | undefined,
  options?: TemplateContext['options'],
): {
  schema: SchemaObject | ReferenceObject;
  code: CodeMeta;
  meta: CodeMetaData;
  refsPath: string[];
} {
  // Per OpenAPI spec: Schema is always an object, never null
  // Empty schema {} is valid and represents "any value" (z.unknown())
  if (!$schema) {
    throw new Error(
      $schema === null
        ? "Invalid OpenAPI specification: Schema cannot be null. Use 'nullable: true' to indicate null values."
        : 'Schema is required',
    );
  }

  const schema = options?.schemaRefiner?.($schema, inheritedMeta) ?? $schema;
  const code = new CodeMeta(schema, ctx, inheritedMeta);
  const meta = {
    parent: code.inherit(inheritedMeta?.parent),
    referencedBy: [...code.meta.referencedBy],
  };

  const refsPath = code.meta.referencedBy
    .slice(0, -1)
    .map((prev) => {
      if (!prev.ref) return '';
      if (!ctx) return prev.ref;
      return getSchemaNameFromRef(prev.ref);
    })
    .filter(Boolean);

  return { schema, code, meta, refsPath };
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
/**
 * Convert an OpenAPI Schema to a Zod schema
 *
 * Per OAS 3.0+ spec: A Schema is always an object (possibly empty), never null.
 * The 'nullable' property indicates the VALUE can be null, not the schema itself.
 */
export function getZodSchema({
  schema: $schema,
  ctx,
  meta: inheritedMeta,
  options,
}: ConversionArgs): CodeMeta {
  const { schema, code, meta, refsPath } = prepareSchemaContext($schema, ctx, inheritedMeta, options);

  if (isReferenceObject(schema)) {
    if (!ctx) throw new Error('Context is required');
    return handleReferenceObject(schema, code, ctx, refsPath, meta, options);
  }

  if (Array.isArray(schema.type)) {
    return handleMultipleTypeSchema(schema, code, ctx, meta, options);
  }

  if (schema.type === 'null') {
    return code.assign('z.null()');
  }

  const compositionResult = handleCompositionSchemaIfPresent(schema, code, ctx, meta, options);
  if (compositionResult) return compositionResult;

  const schemaType = schema.type?.toLowerCase();
  if (schemaType && isPrimitiveSchemaType(schemaType)) {
    return handlePrimitiveSchema(schema, code, schemaType);
  }

  if (schemaType === 'array') {
    return handleArraySchema(schema, code, ctx, meta, options);
  }

  if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
    return handleObjectSchema(schema, code, ctx, meta, options);
  }

  if (!schemaType) return code.assign('z.unknown()');

  throw new Error(`Unsupported schema type: ${schemaType}`);
}

type ZodChainArgs = {
  schema: SchemaObject | ReferenceObject;
  meta?: CodeMetaData;
  options?: TemplateContext['options'];
};

export const getZodChain = ({ schema, meta, options }: ZodChainArgs) => {
  // ReferenceObjects don't have chainable properties, return empty
  if (isReferenceObject(schema)) {
    return '';
  }

  const chains: string[] = [];

  match(schema.type)
    .with('string', () => chains.push(getZodChainableStringValidations(schema)))
    .with('number', 'integer', () => chains.push(getZodChainableNumberValidations(schema)))
    .with('array', () => chains.push(getZodChainableArrayValidations(schema)))
    .otherwise(() => void 0);

  if (
    typeof schema.description === 'string' &&
    schema.description !== '' &&
    options?.withDescription
  ) {
    if (['\n', '\r', '\r\n'].some((c) => String.prototype.includes.call(schema.description, c))) {
      chains.push(`describe(\`${schema.description}\`)`);
    } else {
      chains.push(`describe("${schema.description}")`);
    }
  }

  const output = chains
    .concat(
      getZodChainablePresence(schema, meta),
      options?.withDefaultValues === false ? [] : getZodChainableDefault(schema),
    )
    .filter(Boolean)
    .join('.');
  return output ? `.${output}` : '';
};

const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
  if (schema.nullable && !meta?.isRequired) {
    return 'nullish()';
  }

  if (schema.nullable) {
    return 'nullable()';
  }

  if (!meta?.isRequired) {
    return 'optional()';
  }

  return '';
};

// NOTE: OpenAPI prefixItems support (z.tuple) is not yet implemented
// eslint-disable-next-line sonarjs/function-return-type
const unwrapQuotesIfNeeded = (value: string | number): string | number => {
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  return value;
};

const getZodChainableDefault = (schema: SchemaObject): string => {
  if (schema.default !== undefined) {
    const defaultValue: unknown = schema.default;
    const value: string | number = match(schema.type)
      .with('number', 'integer', (): string | number => {
        if (typeof defaultValue === 'number') return defaultValue;
        if (typeof defaultValue === 'string') return unwrapQuotesIfNeeded(defaultValue);
        return JSON.stringify(defaultValue);
      })
      .otherwise(() => JSON.stringify(defaultValue));
    return `default(${String(value)})`;
  }

  return '';
};

const formatPatternIfNeeded = (pattern: string) => {
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    pattern = pattern.slice(1, -1);
  }

  pattern = escapeControlCharacters(pattern);

  return pattern.includes(String.raw`\u`) || pattern.includes(String.raw`\p`)
    ? `/${pattern}/u`
    : `/${pattern}/`;
};

const getZodChainableStringValidations = (schema: SchemaObject) => {
  const validations: string[] = [];

  if (!schema.enum) {
    if (schema.minLength !== undefined) {
      validations.push(`min(${schema.minLength})`);
    }

    if (schema.maxLength !== undefined) {
      validations.push(`max(${schema.maxLength})`);
    }
  }

  if (schema.pattern) {
    validations.push(`regex(${formatPatternIfNeeded(schema.pattern)})`);
  }

  if (schema.format) {
    const chain = match(schema.format)
      .with('email', () => 'email()')
      .with('hostname', () => 'url()')
      .with('uri', () => 'url()')
      .with('uuid', () => 'uuid()')
      .with('date-time', () => 'datetime({ offset: true })')
      .otherwise(() => '');

    if (chain) {
      validations.push(chain);
    }
  }

  return validations.join('.');
};

const getZodChainableNumberValidations = (schema: SchemaObject) => {
  const validations: string[] = [];

  // none of the chains are valid for enums
  if (schema.enum) {
    return '';
  }

  if (schema.type === 'integer') {
    validations.push('int()');
  }

  if (schema.minimum !== undefined) {
    if (schema.exclusiveMinimum === true) {
      validations.push(`gt(${schema.minimum})`);
    } else {
      validations.push(`gte(${schema.minimum})`);
    }
  } else if (typeof schema.exclusiveMinimum === 'number') {
    validations.push(`gt(${schema.exclusiveMinimum})`);
  }

  if (schema.maximum !== undefined) {
    if (schema.exclusiveMaximum === true) {
      validations.push(`lt(${schema.maximum})`);
    } else {
      validations.push(`lte(${schema.maximum})`);
    }
  } else if (typeof schema.exclusiveMaximum === 'number') {
    validations.push(`lt(${schema.exclusiveMaximum})`);
  }

  if (schema.multipleOf) {
    validations.push(`multipleOf(${schema.multipleOf})`);
  }

  return validations.join('.');
};

const getZodChainableArrayValidations = (schema: SchemaObject) => {
  const validations: string[] = [];

  if (schema.minItems) {
    validations.push(`min(${schema.minItems})`);
  }

  if (schema.maxItems) {
    validations.push(`max(${schema.maxItems})`);
  }

  return validations.join('.');
};
