/**
 * Operation processing helpers for endpoint definition extraction
 * Extracted from getEndpointDefinitionList.ts to reduce file size
 *
 * @internal
 */

import type { OperationObject, ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';

import type { ZodCodeResult, ConversionTypeContext } from '../conversion/zod/index.js';
import type { EndpointDefinition } from './definition.types.js';
import type { TemplateContext } from '../context/template-context.js';
import type { getSchemaVarName } from './helpers.js';
import { processOperation } from './path.helpers.js';
import { getParametersMap } from './definition-list.context.js';
import type { AllowedMethod } from '../validation/type-guards.js';

/**
 * Check if an operation should be skipped.
 * @internal
 */
export function shouldSkipOperation(
  operation: OperationObject | undefined,
  options?: TemplateContext['options'],
): boolean {
  if (!operation) {
    return true;
  }

  if (options?.withDeprecatedEndpoints ? false : operation.deprecated) {
    return true;
  }

  return false;
}

/**
 * Process a single operation and collect results.
 * @internal
 */
export function processSingleOperation(
  path: string,
  method: AllowedMethod,
  operation: OperationObject,
  parametersMap: Record<string, ParameterObject | ReferenceObject>,
  ctx: Required<ConversionTypeContext>,
  getOperationAlias: (path: string, method: string, operation: OperationObject) => string,
  getZodVarName: (
    input: ZodCodeResult,
    fallbackName?: string,
  ) => ReturnType<typeof getSchemaVarName>,
  defaultStatusBehavior: NonNullable<TemplateContext['options']>['defaultStatusBehavior'],
  options?: TemplateContext['options'],
): {
  endpoint: EndpointDefinition;
  ignoredFallback?: string | undefined;
  ignoredGeneric?: string | undefined;
} {
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

  return {
    endpoint: result.endpoint,
    ...(result.ignoredFallback ? { ignoredFallback: result.ignoredFallback } : {}),
    ...(result.ignoredGeneric ? { ignoredGeneric: result.ignoredGeneric } : {}),
  };
}

/**
 * Collect ignored response information from operation result.
 * @internal
 */
export function collectIgnoredResponses(
  result: {
    ignoredFallback?: string | undefined;
    ignoredGeneric?: string | undefined;
  },
  ignoredFallbackResponse: string[],
  ignoredGenericError: string[],
): void {
  if (result.ignoredFallback !== undefined) {
    ignoredFallbackResponse.push(result.ignoredFallback);
  }

  if (result.ignoredGeneric !== undefined) {
    ignoredGenericError.push(result.ignoredGeneric);
  }
}
