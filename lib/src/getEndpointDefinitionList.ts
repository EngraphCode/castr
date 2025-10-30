import type { OpenAPIObject, OperationObject, PathItemObject } from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import { pick } from 'lodash-es';
import { match, P } from 'ts-pattern';

import type { CodeMeta, ConversionTypeContext } from './CodeMeta.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import { getOpenApiDependencyGraph } from './getOpenApiDependencyGraph.js';

/**
 * Result returned by getEndpointDefinitionList
 * Contains endpoints plus metadata needed for code generation
 */
export type EndpointDefinitionListResult = Required<ConversionTypeContext> & {
  refsDependencyGraph: Record<string, Set<string>>;
  deepDependencyGraph: Record<string, Set<string>>;
  endpoints: EndpointDefinition[];
  issues: {
    ignoredFallbackResponse: string[];
    ignoredGenericError: string[];
  };
};
import { logger } from './utils/logger.js';
import type { TemplateContext } from './template-context.js';
import { getSchemaVarName } from './endpoint.helpers.js';
import { processOperation } from './endpoint.path.helpers.js';
import { asComponentSchema, pathToVariableName } from './utils.js';
import {
  ALLOWED_METHODS,
  type AllowedMethod,
  type PathItem,
  isAllowedMethod,
} from './openapi-type-guards.js';

// Helper type guard for PathItemObject
function isPathItemObject(maybePathItemObj: unknown): maybePathItemObj is PathItemObject {
  if (!maybePathItemObj || typeof maybePathItemObj !== 'object') {
    return false;
  }
  // PathItemObject is any object that's not a ReferenceObject
  // PathItemObject can have: HTTP methods (get, put, post, etc.), parameters, summary, description, servers
  // ReferenceObject only has: $ref, summary, description
  // We distinguish by checking for $ref - if it doesn't have $ref, it's a PathItemObject
  return !('$ref' in maybePathItemObj);
}

/**
 * Prepare conversion context for endpoint processing
 * Pure function: initializes context, operation alias resolver, and helper functions
 * 
 * @returns Processing context with helpers and configuration
 */
function prepareEndpointContext(
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
) {
  const getOperationAlias = match(options?.withAlias)
    .with(
      P.boolean,
      P.nullish,
      () => (path: string, method: string, operation: OperationObject) =>
        operation.operationId ?? method + pathToVariableName(path),
    )
    .otherwise((fn) => fn);

  const ctx: ConversionTypeContext = { doc, zodSchemaByName: {}, schemaByName: {} };
  if (options?.exportAllNamedSchemas) {
    ctx.schemasByName = {};
  }

  const complexityThreshold = options?.complexityThreshold ?? 4;
  const getZodVarName = (input: CodeMeta, fallbackName?: string) =>
    getSchemaVarName(
      input,
      ctx,
      complexityThreshold,
      fallbackName,
      options?.exportAllNamedSchemas !== undefined
        ? { exportAllNamedSchemas: options.exportAllNamedSchemas }
        : undefined,
    );

  const defaultStatusBehavior = options?.defaultStatusBehavior ?? 'spec-compliant';

  return { ctx, getOperationAlias, getZodVarName, defaultStatusBehavior };
}

/**
 * Process all endpoints from OpenAPI paths
 * Pure function: iterates all paths/operations and builds endpoint list
 * 
 * @returns Endpoints and arrays of ignored responses
 */
function processAllEndpoints(
  doc: OpenAPIObject,
  ctx: ConversionTypeContext,
  getOperationAlias: (path: string, method: string, operation: OperationObject) => string,
  getZodVarName: (input: CodeMeta, fallbackName?: string) => ReturnType<typeof getSchemaVarName>,
  defaultStatusBehavior: NonNullable<TemplateContext['options']>['defaultStatusBehavior'],
  options?: TemplateContext['options'],
): {
  endpoints: EndpointDefinition[];
  ignoredFallbackResponse: string[];
  ignoredGenericError: string[];
} {
  const endpoints: EndpointDefinition[] = [];
  const ignoredFallbackResponse: string[] = [];
  const ignoredGenericError: string[] = [];

  for (const path in doc.paths) {
    const maybePathItemObj = doc.paths[path];
    if (!isPathItemObject(maybePathItemObj)) {
      throw new TypeError(`Invalid path item object: ${path}`);
    }
    const pathItemObj: PathItemObject = maybePathItemObj;
    const pathItem: PathItem = pick(pathItemObj, ALLOWED_METHODS);
    const parametersMap = getParametersMap(pathItemObj.parameters ?? []);

    for (const maybeMethod in pathItem) {
      if (!isAllowedMethod(maybeMethod)) {
        throw new TypeError(`Invalid method: ${maybeMethod}`);
      }
      const method: AllowedMethod = maybeMethod;
      const operation = pathItem[method];

      // Is this behaviour compliant with the OpenAPI schema?
      if (!operation) continue;

      // Design choice: Skip deprecated endpoints by default (OpenAPI best practice)
      // Users can include them by setting withDeprecatedEndpoints: true
      if (options?.withDeprecatedEndpoints ? false : operation.deprecated) continue;

      const parameters = Object.values({
        ...parametersMap,
        ...getParametersMap(operation.parameters ?? []),
      });
      const operationName = getOperationAlias(path, method, operation);

      const result = processOperation({
        path,
        method,
        operation,
        operationName,
        parameters,
        ctx,
        getZodVarName,
        defaultStatusBehavior,
        options,
      });

      endpoints.push(result.endpoint);

      // Track endpoints with only 'default' status code
      // Will warn users later (they can enable via defaultStatusBehavior: 'auto-correct')
      if (result.ignoredFallback) {
        ignoredFallbackResponse.push(result.ignoredFallback);
      }

      // Track endpoints where generic error responses could be added
      // Will warn users later (they can enable via defaultStatusBehavior: 'auto-correct')
      if (result.ignoredGeneric) {
        ignoredGenericError.push(result.ignoredGeneric);
      }
    }
  }

  return { endpoints, ignoredFallbackResponse, ignoredGenericError };
}

/**
 * Emit warnings for ignored responses
 * Pure function: logs conditional warnings based on configuration
 * 
 * @returns void (side effect: logger warnings)
 */
function emitResponseWarnings(
  ignoredFallbackResponse: string[],
  ignoredGenericError: string[],
  options?: TemplateContext['options'],
): void {
  if (options?.willSuppressWarnings === true) return;

  if (ignoredFallbackResponse.length > 0) {
    logger.warn(
      `The following endpoints have no status code other than \`default\` and were ignored as the OpenAPI spec recommends. However they could be added by setting \`defaultStatusBehavior\` to \`auto-correct\`: ${ignoredGenericError.join(
        ', ',
      )}`,
    );
  }

  if (ignoredGenericError.length > 0) {
    logger.warn(
      `The following endpoints could have had a generic error response added by setting \`defaultStatusBehavior\` to \`auto-correct\` ${ignoredGenericError.join(
        ', ',
      )}`,
    );
  }
}

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

  const { ctx, getOperationAlias, getZodVarName, defaultStatusBehavior } = prepareEndpointContext(doc, options);

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
    ...(ctx as Required<ConversionTypeContext>),
    ...graphs,
    endpoints,
    issues: {
      ignoredFallbackResponse,
      ignoredGenericError,
    },
  };
};

const getParametersMap = (parameters: NonNullable<PathItemObject['parameters']>) => {
  return Object.fromEntries(
    (parameters ?? []).map(
      (param) => [isReferenceObject(param) ? param.$ref : param.name, param] as const,
    ),
  );
};
