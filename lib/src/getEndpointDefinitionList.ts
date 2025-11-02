import type { OpenAPIObject } from 'openapi3-ts/oas30';

import type { ConversionTypeContext } from './CodeMeta.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import { getOpenApiDependencyGraph } from './getOpenApiDependencyGraph.js';
import { prepareEndpointContext } from './getEndpointDefinitionList.context.js';
import { processAllEndpoints } from './getEndpointDefinitionList.paths.js';
import { emitResponseWarnings } from './getEndpointDefinitionList.warnings.js';
import type { TemplateContext } from './template-context.js';
import { asComponentSchema } from './utils.js';

/**
 * Result returned by getEndpointDefinitionList
 * Contains endpoints plus metadata needed for code generation
 */
export type EndpointDefinitionListResult = Required<
  Omit<ConversionTypeContext, 'schemasByName'>
> & {
  schemasByName?: Record<string, string[]>;
} & {
  refsDependencyGraph: Record<string, Set<string>>;
  deepDependencyGraph: Record<string, Set<string>>;
  endpoints: EndpointDefinition[];
  issues: {
    ignoredFallbackResponse: string[];
    ignoredGenericError: string[];
  };
};

/**
 * Extract endpoint definitions with runtime Zod schemas from an OpenAPI specification.
 *
 * This function returns an array of endpoint definitions where each endpoint includes:
 * - Method, path, and description
 * - Parameters with runtime Zod schemas
 * - Response and error schemas
 *
 * **Note:** This is the primary function for extracting runtime validation schemas.
 *
 * @example Basic usage
 * ```typescript
 * import SwaggerParser from "@apidevtools/swagger-parser";
 * import { getEndpointDefinitionList } from "openapi-zod-client";
 *
 * const openApiDoc = await SwaggerParser.parse("./openapi.yaml");
 * const endpoints = getEndpointDefinitionList(openApiDoc);
 *
 * // Each endpoint contains runtime Zod schemas:
 * endpoints.forEach(endpoint => {
 *   console.log(endpoint.method, endpoint.path);
 *   endpoint.parameters?.forEach(param => {
 *     // param.schema is a runtime Zod schema object
 *     const validated = param.schema.parse(inputData);
 *   });
 * });
 * ```
 *
 * @example With options
 * ```typescript
 * const endpoints = getEndpointDefinitionList(openApiDoc, {
 *   withAlias: true,
 *   exportSchemas: true,
 *   complexityThreshold: 3,
 * });
 * ```
 */

export const getEndpointDefinitionList = (
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): EndpointDefinitionListResult => {
  const graphs = getOpenApiDependencyGraph(
    Object.keys(doc.components?.schemas ?? {}).map((name) => asComponentSchema(name)),
    doc,
  );

  const { ctx, getOperationAlias, getZodVarName, defaultStatusBehavior } = prepareEndpointContext(
    doc,
    options,
  );

  const { endpoints, ignoredFallbackResponse, ignoredGenericError } = processAllEndpoints(
    doc,
    ctx,
    getOperationAlias,
    getZodVarName,
    defaultStatusBehavior,
    options,
  );

  emitResponseWarnings(ignoredFallbackResponse, ignoredGenericError, options);

  return {
    doc: ctx.doc,
    zodSchemaByName: ctx.zodSchemaByName,
    schemaByName: ctx.schemaByName,
    ...(options?.exportAllNamedSchemas ? { schemasByName: ctx.schemasByName } : {}),
    ...graphs,
    endpoints,
    issues: {
      ignoredFallbackResponse,
      ignoredGenericError,
    },
  };
};
