/**
 * Path processing helpers for endpoint definition extraction
 * Extracted from getEndpointDefinitionList.ts to reduce file size
 *
 * @internal
 */

import type { OpenAPIObject, OperationObject, PathItemObject } from 'openapi3-ts/oas30';
import { pick } from 'lodash-es';

import type { CodeMeta, ConversionTypeContext } from './CodeMeta.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import type { TemplateContext } from './template-context.js';
import type { getSchemaVarName } from './endpoint.helpers.js';
import {
  ALLOWED_METHODS,
  type AllowedMethod,
  type PathItem,
  isAllowedMethod,
} from './openapi-type-guards.js';
import {
  collectIgnoredResponses,
  processSingleOperation,
  shouldSkipOperation,
} from './getEndpointDefinitionList.operations.js';
import { getParametersMap, isPathItemObject } from './getEndpointDefinitionList.context.js';

/**
 * Process all operations for a single path item.
 * @internal
 */
export function processPathItemOperations(
  path: string,
  pathItemObj: PathItemObject,
  ctx: Required<ConversionTypeContext>,
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

  const pathItem: PathItem = pick(pathItemObj, ALLOWED_METHODS);
  const parametersMap = getParametersMap(pathItemObj.parameters ?? []);

  for (const maybeMethod in pathItem) {
    if (!isAllowedMethod(maybeMethod)) {
      throw new TypeError(`Invalid method: ${maybeMethod}`);
    }
    const method: AllowedMethod = maybeMethod;
    const operation = pathItem[method];

    if (!operation || shouldSkipOperation(operation, options)) {
      continue;
    }

    const result = processSingleOperation(
      path,
      method,
      operation,
      parametersMap,
      ctx,
      getOperationAlias,
      getZodVarName,
      defaultStatusBehavior,
      options,
    );

    endpoints.push(result.endpoint);
    collectIgnoredResponses(result, ignoredFallbackResponse, ignoredGenericError);
  }

  return { endpoints, ignoredFallbackResponse, ignoredGenericError };
}

/**
 * Process all endpoints from OpenAPI paths
 * Pure function: iterates all paths/operations and builds endpoint list
 *
 * @returns Endpoints and arrays of ignored responses
 */
export function processAllEndpoints(
  doc: OpenAPIObject,
  ctx: Required<ConversionTypeContext>,
  getOperationAlias: (path: string, method: string, operation: OperationObject) => string,
  getZodVarName: (input: CodeMeta, fallbackName?: string) => ReturnType<typeof getSchemaVarName>,
  defaultStatusBehavior: NonNullable<TemplateContext['options']>['defaultStatusBehavior'],
  options?: TemplateContext['options'],
): {
  endpoints: EndpointDefinition[];
  ignoredFallbackResponse: string[];
  ignoredGenericError: string[];
} {
  const allEndpoints: EndpointDefinition[] = [];
  const allIgnoredFallbackResponse: string[] = [];
  const allIgnoredGenericError: string[] = [];

  for (const path in doc.paths) {
    const maybePathItemObj = doc.paths[path];
    if (!isPathItemObject(maybePathItemObj)) {
      throw new TypeError(`Invalid path item object: ${path}`);
    }

    const pathResult = processPathItemOperations(
      path,
      maybePathItemObj,
      ctx,
      getOperationAlias,
      getZodVarName,
      defaultStatusBehavior,
      options,
    );

    allEndpoints.push(...pathResult.endpoints);
    allIgnoredFallbackResponse.push(...pathResult.ignoredFallbackResponse);
    allIgnoredGenericError.push(...pathResult.ignoredGenericError);
  }

  return {
    endpoints: allEndpoints,
    ignoredFallbackResponse: allIgnoredFallbackResponse,
    ignoredGenericError: allIgnoredGenericError,
  };
}
