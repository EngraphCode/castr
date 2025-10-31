import type {
  OperationObject,
  ParameterObject,
  ReferenceObject,
  ResponseObject,
} from 'openapi3-ts/oas30';
import type { TemplateContext } from './template-context.js';
import type { DefaultStatusBehavior } from './template-context.types.js';
import type { ConversionTypeContext } from './CodeMeta.js';
import type { EndpointDefinition } from './endpoint-definition.types.js';
import { replaceHyphenatedPath } from './utils.js';
import type { AllowedMethod } from './openapi-type-guards.js';
import { isReferenceObject } from './openapi-type-guards.js';
import type { GetZodVarNameFn } from './endpoint.operation.helpers.js';
import { getResponseByRef, assertNotReference } from './component-access.js';
import {
  processDefaultResponse,
  processParameter,
  processRequestBody,
  processResponse,
} from './endpoint.operation.helpers.js';

const voidSchema = 'z.void()';

/** Type guard: ensures value is ResponseObject (not ReferenceObject) @internal */
function isResponseObject(value: unknown): value is ResponseObject {
  return typeof value === 'object' && value !== null && !isReferenceObject(value);
}

/** Resolve response reference to ResponseObject @internal */
function resolveResponse(
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
function updateEndpointWithResponse(
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

/** Processes all responses for an operation @internal */
function processResponses(
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

/** Resolve default response reference @internal */
function resolveDefaultResponse(
  operation: OperationObject,
  ctx: ConversionTypeContext,
): ResponseObject | null {
  if (!operation.responses?.default) {
    return null;
  }
  const defaultResponseObj = operation.responses.default;
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

/** Update endpoint with default response results @internal */
function updateEndpointWithDefaultResponse(
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
function handleDefaultResponse(
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

interface ProcessOperationParams {
  path: string;
  method: AllowedMethod;
  operation: OperationObject;
  operationName: string;
  parameters: readonly (ParameterObject | ReferenceObject)[];
  ctx: ConversionTypeContext;
  getZodVarName: GetZodVarNameFn;
  defaultStatusBehavior: DefaultStatusBehavior | undefined;
  options?: TemplateContext['options'];
}

interface ProcessOperationResult {
  endpoint: EndpointDefinition;
  ignoredFallback?: string;
  ignoredGeneric?: string;
}

/** Create initial endpoint definition @internal */
function createInitialEndpoint(
  path: string,
  method: AllowedMethod,
  operation: OperationObject,
  operationName: string,
  options?: TemplateContext['options'],
): EndpointDefinition {
  return {
    method,
    path: replaceHyphenatedPath(path),
    ...(options?.withAlias && { alias: operationName }),
    ...(operation.description && { description: operation.description }),
    requestFormat: 'json',
    parameters: [],
    errors: [],
    response: '',
  };
}

/** Process parameters and add to endpoint @internal */
function addParametersToEndpoint(
  endpointDefinition: EndpointDefinition,
  parameters: readonly (ParameterObject | ReferenceObject)[],
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): void {
  for (const param of parameters) {
    const paramDef = processParameter(param, ctx, getZodVarName, options);
    if (paramDef) {
      endpointDefinition.parameters.push(paramDef);
    }
  }
}

/** Finalize endpoint definition @internal */
function finalizeEndpoint(
  endpointDefinition: EndpointDefinition,
  operation: OperationObject,
  options?: TemplateContext['options'],
): void {
  if (!endpointDefinition.response) {
    endpointDefinition.response = voidSchema;
  }
  if (options?.endpointDefinitionRefiner) {
    const refined = options.endpointDefinitionRefiner(endpointDefinition, operation);
    if (refined) {
      Object.assign(endpointDefinition, refined);
    }
  }
}

/** Processes a single operation to create an endpoint definition */
export function processOperation({
  path,
  method,
  operation,
  operationName,
  parameters,
  ctx,
  getZodVarName,
  defaultStatusBehavior,
  options,
}: ProcessOperationParams): ProcessOperationResult {
  const endpointDefinition = createInitialEndpoint(path, method, operation, operationName, options);
  const bodyResult = processRequestBody(operation, ctx, operationName, getZodVarName, options);
  if (bodyResult) {
    endpointDefinition.requestFormat = bodyResult.requestFormat;
    endpointDefinition.parameters.push(bodyResult.parameter);
  }
  addParametersToEndpoint(endpointDefinition, parameters, ctx, getZodVarName, options);
  if (options?.withAllResponses) {
    endpointDefinition.responses = [];
  }
  processResponses(operation, endpointDefinition, ctx, getZodVarName, options);
  const { ignoredFallback, ignoredGeneric } = handleDefaultResponse(
    operation,
    endpointDefinition,
    operationName,
    ctx,
    getZodVarName,
    defaultStatusBehavior,
    options,
  );
  finalizeEndpoint(endpointDefinition, operation, options);
  return {
    endpoint: endpointDefinition,
    ...(ignoredFallback && { ignoredFallback }),
    ...(ignoredGeneric && { ignoredGeneric }),
  };
}
