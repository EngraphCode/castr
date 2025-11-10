import type { OperationObject, ReferenceObject, ResponseObject } from 'openapi3-ts/oas31';

import type { ConversionTypeContext } from '../conversion/zod/index.js';
import type { EndpointDefinition } from './definition.types.js';
import type { TemplateContext } from '../context/template-context.js';
import type { DefaultStatusBehavior } from '../context/template-context.types.js';
import { getResponseByRef, assertNotReference } from '../shared/component-access.js';
import { isReferenceObject } from '../validation/type-guards.js';
import type { GetZodVarNameFn } from './operation.helpers.js';
import { processDefaultResponse, processResponse } from './operation.helpers.js';

/** Type guard: ensures value is ResponseObject (not ReferenceObject) @internal */
export function isResponseObject(value: unknown): value is ResponseObject {
  return typeof value === 'object' && value !== null && !isReferenceObject(value);
}

/** Resolve response reference to ResponseObject @internal */
export function resolveResponse(
  maybeResponseObj: unknown,
  statusCode: string,
  ctx: ConversionTypeContext,
): ResponseObject {
  if (!maybeResponseObj) {
    throw new Error(`Response object for status ${statusCode} is null/undefined`);
  }
  if (!isReferenceObject(maybeResponseObj)) {
    if (!isResponseObject(maybeResponseObj)) {
      throw new Error(`Invalid response object for status ${statusCode}`);
    }
    return maybeResponseObj;
  }
  const resolved = getResponseByRef(ctx.doc, maybeResponseObj.$ref);
  assertNotReference(
    resolved,
    `response ${statusCode} ${maybeResponseObj.$ref} (use SwaggerParser.bundle() to dereference)`,
  );
  return resolved;
}

/** Update endpoint definition with response results @internal */
export function updateEndpointWithResponse(
  endpointDefinition: EndpointDefinition,
  result: ReturnType<typeof processResponse>,
): void {
  if (result.responseEntry && endpointDefinition.responses !== undefined) {
    endpointDefinition.responses.push(result.responseEntry);
  }
  if (result.mainResponse && !endpointDefinition.response) {
    endpointDefinition.response = result.mainResponse;
    if (!endpointDefinition.description && result.mainResponseDescription) {
      endpointDefinition.description = result.mainResponseDescription;
    }
  }
  if (result.error) {
    endpointDefinition.errors.push(result.error);
  }
}

/** Resolve default response reference @internal */
export function resolveDefaultResponse(
  operation: OperationObject,
  ctx: ConversionTypeContext,
): ResponseObject | null {
  // OpenAPI 3.1 Note: operation.responses is optional per the spec
  // Use optional chaining to safely access responses (ADR-018)
  if (!operation.responses?.default) {
    return null;
  }
  const defaultResponseObj: ResponseObject | ReferenceObject = operation.responses.default;
  if (!isReferenceObject(defaultResponseObj)) {
    return defaultResponseObj;
  }
  const resolved = getResponseByRef(ctx.doc, defaultResponseObj.$ref);
  assertNotReference(
    resolved,
    `default response ${defaultResponseObj.$ref} (use SwaggerParser.bundle() to dereference)`,
  );
  return resolved;
}

/** Processes all responses for an operation @internal */
export function processResponses(
  operation: OperationObject,
  endpointDefinition: EndpointDefinition,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): void {
  for (const statusCode in operation.responses) {
    const maybeResponseObj: unknown = operation.responses[statusCode];
    if (!maybeResponseObj) {
      continue;
    }
    const responseObj = resolveResponse(maybeResponseObj, statusCode, ctx);
    const result = processResponse(statusCode, responseObj, ctx, getZodVarName, options);
    updateEndpointWithResponse(endpointDefinition, result);
  }
}

/** Update endpoint with default response results @internal */
export function updateEndpointWithDefaultResponse(
  endpointDefinition: EndpointDefinition,
  defaultResult: ReturnType<typeof processDefaultResponse>,
  operationName: string,
): { ignoredFallback?: string; ignoredGeneric?: string } {
  if (defaultResult.mainResponse) {
    endpointDefinition.response = defaultResult.mainResponse;
  }
  if (defaultResult.error) {
    endpointDefinition.errors.push(defaultResult.error);
  }
  return {
    ...(defaultResult.shouldIgnoreFallback && { ignoredFallback: operationName }),
    ...(defaultResult.shouldIgnoreGeneric && { ignoredGeneric: operationName }),
  };
}

/** Processes default response and returns warnings if needed @internal */
export function handleDefaultResponse(
  operation: OperationObject,
  endpointDefinition: EndpointDefinition,
  operationName: string,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  defaultStatusBehavior: DefaultStatusBehavior | undefined,
  options?: TemplateContext['options'],
): { ignoredFallback?: string; ignoredGeneric?: string } {
  const defaultResponse = resolveDefaultResponse(operation, ctx);
  if (!defaultResponse) {
    return {};
  }
  const defaultResult = processDefaultResponse(
    defaultResponse,
    ctx,
    getZodVarName,
    Boolean(endpointDefinition.response),
    defaultStatusBehavior ?? 'spec-compliant',
    options,
  );
  return updateEndpointWithDefaultResponse(endpointDefinition, defaultResult, operationName);
}
