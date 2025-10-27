import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import { t, ts } from 'tanu';

import type { TemplateContext } from './template-context.js';
import { inferRequiredSchema } from './inferRequiredOnly.js';

/**
 * Type representing the output of TypeScript conversion from OpenAPI schemas
 * This is the honest return type of getTypescriptFromOpenApi()
 */
export type TsConversionOutput = ts.Node | t.TypeDefinitionObject | string;

import generateJSDocArray from './generateJSDocArray.js';
import {
  buildObjectType,
  convertObjectProperties,
  convertSchemasToTypes,
  handleAnyOf,
  handleArraySchema,
  handleOneOf,
  handlePrimitiveEnum,
  handleReferenceObject,
  handleTypeArray,
  isPrimitiveSchemaType,
  resolveAdditionalPropertiesType,
  wrapObjectTypeForOutput,
  wrapTypeIfNeeded,
} from './openApiToTypescript.helpers.js';
import { handleBasicPrimitive } from './openApiToTypescript.string-helpers.js';

type TsConversionArgs = {
  schema: SchemaObject | ReferenceObject;
  ctx?: TsConversionContext | undefined;
  meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
  options?: TemplateContext['options'];
};

export type TsConversionContext = {
  nodeByRef: Record<string, ts.Node>;
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
  const isInline = !inheritedMeta?.name;

  if (ctx?.visitedRefs && inheritedMeta?.$ref) {
    ctx.rootRef = inheritedMeta.$ref;
    ctx.visitedRefs[inheritedMeta.$ref] = true;
  }

  if (!schema) {
    throw new Error('Schema is required');
  }

  let canBeWrapped = !isInline;
  const getTs = (): ts.Node | t.TypeDefinitionObject | string => {
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
      return t.reference('null');
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
        // Narrow ONCE: convert string to reference
        return typeof type === 'string' ? t.reference(type) : type;
      });

      if (Object.keys(composedRequiredSchema.properties).length > 0) {
        const composedType = getTypescriptFromOpenApi({
          schema: composedRequiredSchema,
          ctx,
          meta,
          options,
        });
        // Narrow ONCE: convert string to reference
        types.push(typeof composedType === 'string' ? t.reference(composedType) : composedType);
      }

      // TEMPORARY: Type assertion at tanu boundary - will be eliminated in architectural rewrite
      const intersection = t.intersection(types as t.TypeDefinition[]);
      return schema.nullable ? t.union([intersection, t.reference('null')]) : intersection;
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
      return handleArraySchema(
        schema,
        options?.allReadonly ?? false,
        (items) => getTypescriptFromOpenApi({ schema: items, ctx, meta, options }),
        ctx,
      );
    }

    if (schemaType === 'object' || schema.properties || schema.additionalProperties) {
      if (!schema.properties) {
        return {};
      }

      canBeWrapped = false;

      const isPartial = !schema.required?.length;
      const shouldWrapReadonly = options?.allReadonly ?? false;

      const additionalPropertiesType = resolveAdditionalPropertiesType(
        schema.additionalProperties,
        (additionalSchema) =>
          getTypescriptFromOpenApi({ schema: additionalSchema, ctx, meta, options }),
      );

      const props = convertObjectProperties(
        schema.properties,
        schema,
        isPartial,
        (propSchema) => getTypescriptFromOpenApi({ schema: propSchema, ctx, meta, options }),
        ctx,
      );

      const finalType = buildObjectType(props, additionalPropertiesType, shouldWrapReadonly);

      return wrapObjectTypeForOutput(finalType, isPartial, isInline, inheritedMeta?.name);
    }

    if (!schemaType) return t.unknown();
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema type: ${schemaType}`);
  };

  let tsResult = getTs();

  // Add JSDoc comments
  if (options?.withDocs && !isReferenceObject(schema)) {
    const jsDocComments = generateJSDocArray(schema);

    if (jsDocComments.length > 0) {
      // Convert string to node if needed before adding JSDoc
      if (typeof tsResult === 'string') {
        let node: ts.Node;
        if (tsResult === 'string') node = t.string();
        else if (tsResult === 'number') node = t.number();
        else if (tsResult === 'boolean') node = t.boolean();
        else if (tsResult === 'null') node = t.reference('null');
        else if (tsResult.includes(' | ')) {
          const types = tsResult.split(' | ').map((type) => {
            if (type === 'string') return t.string();
            if (type === 'number') return t.number();
            if (type === 'boolean') return t.boolean();
            if (type === 'null') return t.reference('null');
            return t.reference(type);
          });
          node = t.union(types as t.TypeDefinition[]);
        } else {
          node = t.reference(tsResult);
        }
        tsResult = t.comment(node, jsDocComments);
      } else if (
        typeof tsResult === 'object' &&
        tsResult.kind !== ts.SyntaxKind.TypeAliasDeclaration
      ) {
        tsResult = t.comment(tsResult, jsDocComments);
      }
    }
  }

  // wrapTypeIfNeeded now accepts the honest TsConversionOutput type and handles narrowing internally
  if (!canBeWrapped && typeof tsResult === 'string') {
    // When returning inline, convert string to appropriate node (temporary bridge for incremental migration)
    if (tsResult === 'string') return t.string();
    if (tsResult === 'number') return t.number();
    if (tsResult === 'boolean') return t.boolean();
    if (tsResult === 'null') return t.reference('null');
    if (tsResult.includes(' | ')) {
      // Handle union types
      const types = tsResult.split(' | ').map((type) => {
        if (type === 'string') return t.string();
        if (type === 'number') return t.number();
        if (type === 'boolean') return t.boolean();
        if (type === 'null') return t.reference('null');
        return t.reference(type);
      });
      return t.union(types as t.TypeDefinition[]);
    }
    return t.reference(tsResult);
  }

  return canBeWrapped ? wrapTypeIfNeeded(isInline, inheritedMeta?.name, tsResult) : tsResult;
};
