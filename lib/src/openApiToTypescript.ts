import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';

import type { TemplateContext } from './template-context.js';
import { inferRequiredSchema } from './inferRequiredOnly.js';

/**
 * Type representing the output of TypeScript conversion from OpenAPI schemas
 * Returns string-based TypeScript type expressions
 * MIGRATED: Now returns only strings (no more tanu nodes)
 */
export type TsConversionOutput = string;

import {
  convertSchemasToTypes,
  handleAnyOf,
  handleArraySchema,
  handleBasicPrimitive,
  handleOneOf,
  handlePrimitiveEnum,
  handleReferenceObject,
  handleTypeArray,
  isPrimitiveSchemaType,
  isPropertyRequired,
  resolveAdditionalPropertiesType,
} from './openApiToTypescript.helpers.js';
import {
  handleIntersection,
  handleObjectType,
  handlePartialObject,
  mergeObjectWithAdditionalProps,
  wrapNullable,
  wrapReadonly,
} from './openApiToTypescript.string-helpers.js';

type TsConversionArgs = {
  schema: SchemaObject | ReferenceObject;
  ctx?: TsConversionContext | undefined;
  meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
  options?: TemplateContext['options'];
};

export type TsConversionContext = {
  nodeByRef: Record<string, string>;
  doc: OpenAPIObject;
  rootRef?: string;
  visitedRefs?: Record<string, boolean>;
};

export const getTypescriptFromOpenApi = ({
  schema,
  meta: inheritedMeta,
  ctx,
  options,
}: TsConversionArgs): TsConversionOutput => {
  const meta: TsConversionArgs['meta'] = {};

  if (ctx?.visitedRefs && inheritedMeta?.$ref) {
    ctx.rootRef = inheritedMeta.$ref;
    ctx.visitedRefs[inheritedMeta.$ref] = true;
  }

  if (!schema) {
    throw new Error('Schema is required');
  }

  const getTs = (): string => {
    if (isReferenceObject(schema)) {
      return handleReferenceObject(schema, ctx, (actualSchema) =>
        getTypescriptFromOpenApi({ schema: actualSchema, meta, ctx, options }),
      );
    }

    if (Array.isArray(schema.type)) {
      return handleTypeArray(schema.type, schema, schema.nullable ?? false, (s) =>
        getTypescriptFromOpenApi({ schema: s, ctx, meta, options }),
      );
    }

    if (schema.type === 'null') {
      return 'null';
    }

    if (schema.oneOf) {
      return handleOneOf(schema.oneOf, schema.nullable ?? false, (s) =>
        getTypescriptFromOpenApi({ schema: s, ctx, meta, options }),
      );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
      return handleAnyOf(
        schema.anyOf,
        schema.nullable ?? false,
        options?.allReadonly ?? false,
        (s) => getTypescriptFromOpenApi({ schema: s, ctx, meta, options }),
      );
    }

    if (schema.allOf) {
      if (schema.allOf.length === 1) {
        return getTypescriptFromOpenApi({ schema: schema.allOf[0]!, ctx, meta, options });
      }

      const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
        inferRequiredSchema(schema);

      const types = convertSchemasToTypes(noRequiredOnlyAllof, (prop) => {
        const type = getTypescriptFromOpenApi({ schema: prop, ctx, meta, options });
        ctx?.doc && patchRequiredSchemaInLoop(prop, ctx.doc);
        return type; // Already a string
      });

      if (Object.keys(composedRequiredSchema.properties).length > 0) {
        const composedType = getTypescriptFromOpenApi({
          schema: composedRequiredSchema,
          ctx,
          meta,
          options,
        });
        types.push(composedType); // Already a string
      }

      const intersection = handleIntersection(types);
      return wrapNullable(intersection, schema.nullable ?? false);
    }

    // Handle primitive types (string, number, integer, boolean, null)
    const schemaType = schema.type;
    if (schemaType && isPrimitiveSchemaType(schemaType)) {
      // Try to handle as enum first
      const enumResult = handlePrimitiveEnum(schema, schemaType);
      if (enumResult) return enumResult;

      // Handle basic primitive types
      return handleBasicPrimitive(schemaType, schema.nullable ?? false);
    }

    if (schemaType === 'array') {
      return handleArraySchema(schema, options?.allReadonly ?? false, (items) =>
        getTypescriptFromOpenApi({ schema: items, ctx, meta, options }),
      );
    }

    if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
      if (!schema.properties) {
        return '{}';
      }

      const isPartial = !schema.required?.length;
      const shouldWrapReadonly = options?.allReadonly ?? false;

      // Convert properties to Record<string, string>
      const propsRecord: Record<string, string> = {};
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propType = getTypescriptFromOpenApi({ schema: propSchema, ctx, meta, options });
        const isRequired = isPropertyRequired(propName, schema, isPartial);
        const finalPropType = isRequired ? propType : `${propType}?`;
        propsRecord[propName] = finalPropType;
      }

      let objectType = handleObjectType(propsRecord);

      // Handle additional properties
      const additionalPropertiesType = resolveAdditionalPropertiesType(
        schema.additionalProperties,
        (additionalSchema) =>
          getTypescriptFromOpenApi({ schema: additionalSchema, ctx, meta, options }),
      );

      if (additionalPropertiesType) {
        const indexSig = `[key: string]: ${additionalPropertiesType}`;
        objectType = mergeObjectWithAdditionalProps(objectType, indexSig);
      }

      // Wrap with readonly if needed
      if (shouldWrapReadonly) {
        objectType = wrapReadonly(objectType, true);
      }

      // Wrap with Partial if needed
      if (isPartial) {
        objectType = handlePartialObject(objectType);
      }

      return objectType;
    }

    if (!schemaType) return 'unknown';
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema type: ${schemaType}`);
  };

  const tsResult = getTs();

  // Note: JSDoc comments are handled at declaration time by AstBuilder
  // String-based type expressions don't carry JSDoc metadata

  // If a name is provided, wrap as a type declaration
  // Otherwise return the inline type expression
  if (inheritedMeta?.name && !inheritedMeta?.isInline) {
    return `export type ${inheritedMeta.name} = ${tsResult};`;
  }

  return tsResult;
};
