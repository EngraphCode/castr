/**
 * IR Builder - Parameter Processing
 *
 * Handles conversion of OpenAPI parameter objects to IR parameter structures.
 *
 * @module
 */

import type { ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { CastrParameter, CastrSchema } from '../../ir/schema.js';
import type { IRBuildContext } from './builder.types.js';
import { isReferenceObject } from '../../../validation/type-guards.js';
import { buildCastrSchema } from './builder.core.js';

/**
 * Safely convert OpenAPI example value (typed as 'any') to unknown.
 * This explicit function documents the `any` boundary from the OpenAPI library.
 * @internal
 */
function toUnknownExample(value: unknown): unknown {
  return value;
}

/**
 * Extract example value from parameter, handling Scalar's normalization.
 *
 * Scalar normalizes `example` to `examples.default.value` during OpenAPI 3.0→3.1 upgrade.
 * This helper extracts from either location.
 *
 * @param param - OpenAPI parameter object
 * @returns Example value or undefined if not present
 * @internal
 */
function extractExampleValue(param: ParameterObject): unknown | undefined {
  // Direct example field takes precedence
  if (param.example !== undefined) {
    return toUnknownExample(param.example);
  }

  // Check Scalar-normalized format: examples.default.value
  const defaultExample = param.examples?.['default'];
  if (defaultExample && !isReferenceObject(defaultExample) && defaultExample.value !== undefined) {
    return toUnknownExample(defaultExample.value);
  }

  return undefined;
}

/**
 * Build IR parameters from OpenAPI parameter definitions.
 *
 * Converts OpenAPI parameter objects into CastrParameter structures, handling
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
export function buildCastrParameters(
  parameters: (ParameterObject | ReferenceObject)[] | undefined,
  context: IRBuildContext,
): CastrParameter[] {
  if (!parameters) {
    return [];
  }

  return parameters.map((param): CastrParameter => {
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
): CastrParameter {
  // Handle $ref parameters
  if (isReferenceObject(param)) {
    const resolved = resolveParameter(param, context);
    if (resolved) {
      return buildConcreteParameter(resolved, context);
    }
    return throwUnresolvedParameterRefError(param, context);
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
 * Throw error for unresolved parameter reference.
 * Enforces strictness: invalid specs must fail fast with helpful errors.
 *
 * @param ref - The unresolved reference object
 * @param context - Build context for error location
 * @throws Error with descriptive message including reference path and location
 * @internal
 */
function throwUnresolvedParameterRefError(ref: ReferenceObject, context: IRBuildContext): never {
  const location = context.path.join('/');
  throw new Error(
    `Unresolvable parameter reference "${ref.$ref}" at ${location}. ` +
      'The referenced parameter does not exist in components.parameters.',
  );
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
function buildConcreteParameter(param: ParameterObject, context: IRBuildContext): CastrParameter {
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
 * Build schema for a parameter.
 * Per OpenAPI 3.0+ spec, parameters MUST have either 'schema' or 'content'.
 *
 * @param param - OpenAPI parameter object
 * @param context - Build context for schema resolution
 * @returns IR schema
 * @throws Error if parameter has neither schema nor content
 * @internal
 */
function buildParameterSchema(param: ParameterObject, context: IRBuildContext): CastrSchema {
  if (param.schema) {
    return buildCastrSchema(param.schema, context);
  }

  // OpenAPI spec requires either 'schema' or 'content' - validate this invariant
  if (param.content) {
    // Content-based parameter - extract schema from first media type
    const mediaTypes = Object.values(param.content);
    if (mediaTypes.length > 0 && mediaTypes[0]?.schema) {
      return buildCastrSchema(mediaTypes[0].schema, context);
    }
  }

  // Neither schema nor content - this is an invalid OpenAPI spec
  const location = context.path.join('/');
  throw new Error(
    `Parameter "${param.name}" at ${location} has neither 'schema' nor 'content'. ` +
      'Per OpenAPI 3.0+ specification, a parameter MUST contain either a schema or content.',
  );
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
function buildBaseParameter(param: ParameterObject, schema: CastrSchema): CastrParameter {
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
function addOptionalParameterFields(
  irParameter: CastrParameter,
  param: ParameterObject,
): CastrParameter {
  const result = { ...irParameter };

  if (param.description) {
    result.description = param.description;
  }

  if (param.deprecated) {
    result.deprecated = param.deprecated;
  }

  // Extract example, handling both direct and Scalar-normalized formats
  const example = extractExampleValue(param);
  if (example !== undefined) {
    result.example = example;
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
