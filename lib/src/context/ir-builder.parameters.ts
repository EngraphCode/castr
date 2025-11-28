/**
 * IR Builder - Parameter Processing
 *
 * Handles conversion of OpenAPI parameter objects to IR parameter structures.
 *
 * @module
 */

import type { ParameterObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import type { IRParameter, IRSchema } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { isReferenceObject } from '../validation/type-guards.js';
import { buildIRSchema, buildIRSchemaNode } from './ir-builder.core.js';

/**
 * Safely convert OpenAPI example value (typed as 'any') to unknown.
 * This explicit function documents the `any` boundary from the OpenAPI library.
 * @internal
 */
function toUnknownExample(value: unknown): unknown {
  return value;
}

/**
 * Build IR parameters from OpenAPI parameter definitions.
 *
 * Converts OpenAPI parameter objects into IRParameter structures, handling
 * both direct parameter objects and reference objects. Parameters are validated
 * and schemas are built recursively.
 *
 * @param parameters - Array of OpenAPI parameters (may contain references)
 * @param context - Build context for schema resolution and path tracking
 * @returns Array of IR parameters with resolved schemas
 *
 * @remarks
 * - Reference objects currently return placeholder structures
 * - Path parameters are automatically marked as required
 * - Schema defaults to string type if not specified
 *
 * @internal
 */
export function buildIRParameters(
  parameters: (ParameterObject | ReferenceObject)[] | undefined,
  context: IRBuildContext,
): IRParameter[] {
  if (!parameters) {
    return [];
  }

  return parameters.map((param): IRParameter => {
    return buildSingleParameter(param, context);
  });
}

/**
 * Build a single IR parameter from a parameter object or reference.
 * @internal
 */
export function buildSingleParameter(
  param: ParameterObject | ReferenceObject,
  context: IRBuildContext,
): IRParameter {
  // Handle $ref parameters
  if (isReferenceObject(param)) {
    const resolved = resolveParameter(param, context);
    if (resolved) {
      return buildConcreteParameter(resolved, context);
    }
    return createPlaceholderParameter(context);
  }

  return buildConcreteParameter(param, context);
}

/**
 * Resolve a parameter reference.
 *
 * @param ref - Reference object
 * @param context - Build context containing the full document
 * @returns Resolved parameter object or undefined if not found
 */
function resolveParameter(
  ref: ReferenceObject,
  context: IRBuildContext,
): ParameterObject | undefined {
  const refPath = ref.$ref;
  if (!refPath.startsWith('#/components/parameters/')) {
    return undefined;
  }

  const paramName = refPath.split('/').pop();
  if (!paramName || !context.doc.components?.parameters) {
    return undefined;
  }

  const param = context.doc.components.parameters[paramName];
  if (isReferenceObject(param)) {
    // Recursive resolution (though typically parameters aren't nested refs)
    return resolveParameter(param, context);
  }

  return param;
}

/**
 * Create a placeholder parameter for unresolved references.
 *
 * @param context - Build context for schema resolution
 * @returns Minimal IR parameter structure
 *
 * @internal
 */
function createPlaceholderParameter(context: IRBuildContext): IRParameter {
  const placeholderSchema: SchemaObject = {};
  return {
    name: 'ref',
    in: 'query',
    required: false,
    schema: {
      type: 'string' as const,
      metadata: buildIRSchemaNode(placeholderSchema, context),
    },
  };
}

/**
 * Build IR parameter from a concrete (non-reference) OpenAPI parameter object.
 *
 * @param param - OpenAPI parameter object
 * @param context - Build context for schema resolution
 * @returns IR parameter with extracted metadata
 *
 * @internal
 */
function buildConcreteParameter(param: ParameterObject, context: IRBuildContext): IRParameter {
  const parameterContext: IRBuildContext = {
    ...context,
    required: param.required ?? param.in === 'path',
    path: [...context.path, param.name],
  };

  const schema = buildParameterSchema(param, parameterContext);
  const irParameter = buildBaseParameter(param, schema);

  return addOptionalParameterFields(irParameter, param);
}

/**
 * Build schema for a parameter, defaulting to string if not specified.
 *
 * @param param - OpenAPI parameter object
 * @param context - Build context for schema resolution
 * @returns IR schema
 *
 * @internal
 */
function buildParameterSchema(param: ParameterObject, context: IRBuildContext): IRSchema {
  if (param.schema) {
    return buildIRSchema(param.schema, context);
  }

  // Default to string schema if not specified
  const emptySchema: SchemaObject = {};
  return {
    type: 'string' as const,
    metadata: buildIRSchemaNode(emptySchema, context),
  };
}

/**
 * Build base IR parameter structure with required fields.
 *
 * @param param - OpenAPI parameter object
 * @param schema - Resolved IR schema
 * @returns Base IR parameter structure
 *
 * @internal
 */
function buildBaseParameter(param: ParameterObject, schema: IRSchema): IRParameter {
  return {
    name: param.name,
    in: param.in,
    required: param.required ?? param.in === 'path', // Path parameters are always required
    schema,
    // Populate metadata from schema's metadata (if available)
    metadata: schema.metadata,
  };
}

/**
 * Add optional fields to IR parameter if present in source.
 *
 * @param irParameter - Base IR parameter structure
 * @param param - Source OpenAPI parameter object
 * @returns IR parameter with optional fields added
 *
 * @internal
 */
function addOptionalParameterFields(irParameter: IRParameter, param: ParameterObject): IRParameter {
  const result = { ...irParameter };

  if (param.description) {
    result.description = param.description;
  }

  if (param.deprecated) {
    result.deprecated = param.deprecated;
  }

  if (param.example !== undefined) {
    // OpenAPI library types param.example as 'any' (spec allows any JSON value)
    // Use helper to explicitly handle the `any` boundary
    result.example = toUnknownExample(param.example);
  }

  if (param.examples) {
    result.examples = param.examples;
  }

  if (param.style) {
    result.style = param.style;
  }

  if (param.explode !== undefined) {
    result.explode = param.explode;
  }

  if (param.allowReserved !== undefined) {
    result.allowReserved = param.allowReserved;
  }

  return result;
}
