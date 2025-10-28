/**
 * Helpers for processing operations within getEndpointDefinitionList
 * Extracted to reduce cognitive complexity in the main function
 */

import type {
  OperationObject,
  ParameterObject,
  ReferenceObject,
  ResponseObject,
} from 'openapi3-ts/oas30';
import type { TemplateContext } from './template-context.js';
import type { DefaultStatusBehavior } from './template-context.types.js';
import type { ConversionTypeContext } from './CodeMeta.js';
import type { EndpointDefinitionWithRefs } from './getEndpointDefinitionList.js';
import { replaceHyphenatedPath } from './utils.js';
import type { AllowedMethod } from './openapi-type-guards.js';
import { isReferenceObject } from './openapi-type-guards.js';
import type { GetZodVarNameFn } from './endpoint.operation.helpers.js';
import { getResponseByRef } from './component-access.js';
import {
  processDefaultResponse,
  processParameter,
  processRequestBody,
  processResponse,
} from './endpoint.operation.helpers.js';

const voidSchema = 'z.void()';

/**
 * Processes all responses for an operation, collecting main response, errors, and response entries
 */
function processResponses(
  operation: OperationObject,
  endpointDefinition: EndpointDefinitionWithRefs,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  options?: TemplateContext['options'],
): void {
  for (const statusCode in operation.responses) {
    const maybeResponseObj: unknown = operation.responses[statusCode];

    if (!maybeResponseObj) {
      continue;
    }

    // Handle both ResponseObject and ReferenceObject (like handleDefaultResponse does)
    let responseObj: ResponseObject;
    if (isReferenceObject(maybeResponseObj)) {
      // Resolve the reference
      const resolved = getResponseByRef(ctx.doc, maybeResponseObj.$ref);
      if (isReferenceObject(resolved)) {
        throw new Error(
          `Nested $ref in response ${statusCode}: ${maybeResponseObj.$ref}. Use SwaggerParser.bundle() to dereference.`,
        );
      }
      responseObj = resolved;
    } else {
      // After checking it's not a ReferenceObject, maybeResponseObj must be ResponseObject
      responseObj = maybeResponseObj as ResponseObject;
    }

    // processResponse handles ResponseObject | ReferenceObject union
    const result = processResponse(statusCode, responseObj, ctx, getZodVarName, options);

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
}

/**
 * Processes default response and returns warnings if needed
 */
function handleDefaultResponse(
  operation: OperationObject,
  endpointDefinition: EndpointDefinitionWithRefs,
  operationName: string,
  ctx: ConversionTypeContext,
  getZodVarName: GetZodVarNameFn,
  defaultStatusBehavior: DefaultStatusBehavior | undefined,
  options?: TemplateContext['options'],
): { ignoredFallback?: string | undefined; ignoredGeneric?: string | undefined } {
  if (!operation.responses?.default) {
    return {};
  }

  const defaultResponseObj = operation.responses.default;

  // Resolve ReferenceObject if needed
  let defaultResponse: ResponseObject;
  if (isReferenceObject(defaultResponseObj)) {
    const resolved = getResponseByRef(ctx.doc, defaultResponseObj.$ref);
    if (isReferenceObject(resolved)) {
      throw new Error(
        `Nested $ref in default response: ${defaultResponseObj.$ref}. Use SwaggerParser.bundle() to dereference.`,
      );
    }
    defaultResponse = resolved;
  } else {
    defaultResponse = defaultResponseObj;
  }

  const defaultResult = processDefaultResponse(
    defaultResponse,
    ctx,
    getZodVarName,
    Boolean(endpointDefinition.response),
    defaultStatusBehavior ?? 'spec-compliant',
    options,
  );

  if (defaultResult.mainResponse) {
    endpointDefinition.response = defaultResult.mainResponse;
  }

  if (defaultResult.error) {
    endpointDefinition.errors.push(defaultResult.error);
  }

  return {
    ignoredFallback: defaultResult.shouldIgnoreFallback ? operationName : undefined,
    ignoredGeneric: defaultResult.shouldIgnoreGeneric ? operationName : undefined,
  };
}

type ProcessOperationParams = {
  path: string;
  method: AllowedMethod;
  operation: OperationObject;
  operationName: string;
  parameters: ReadonlyArray<ParameterObject | ReferenceObject>;
  ctx: ConversionTypeContext;
  getZodVarName: GetZodVarNameFn;
  defaultStatusBehavior: DefaultStatusBehavior | undefined;
  options?: TemplateContext['options'];
};

type ProcessOperationResult = {
  endpoint: EndpointDefinitionWithRefs;
  ignoredFallback?: string | undefined;
  ignoredGeneric?: string | undefined;
};

/**
 * Processes a single operation to create an endpoint definition
 * Handles request body, parameters, responses, and default responses
 */
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
  let endpointDefinition: EndpointDefinitionWithRefs = {
    method,
    path: replaceHyphenatedPath(path),
    ...(options?.withAlias && { alias: operationName }),
    ...(operation.description && { description: operation.description }),
    requestFormat: 'json',
    parameters: [],
    errors: [],
    response: '',
  };

  const bodyResult = processRequestBody(operation, ctx, operationName, getZodVarName, options);
  if (bodyResult) {
    endpointDefinition.requestFormat = bodyResult.requestFormat;
    endpointDefinition.parameters.push(bodyResult.parameter);
  }

  for (const param of parameters) {
    // processParameter handles ParameterObject | ReferenceObject union
    const paramDef = processParameter(param, ctx, getZodVarName, options);
    if (paramDef) {
      endpointDefinition.parameters.push(paramDef);
    }
  }

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

  if (!endpointDefinition.response) {
    endpointDefinition.response = voidSchema;
  }

  if (options?.endpointDefinitionRefiner) {
    const refined = options.endpointDefinitionRefiner(endpointDefinition, operation);
    if (refined) {
      endpointDefinition = refined;
    }
  }

  return { endpoint: endpointDefinition, ignoredFallback, ignoredGeneric };
}
