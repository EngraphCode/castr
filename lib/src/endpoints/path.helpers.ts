import type { OperationObject, ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { TemplateContext } from '../context/template-context.js';
import type { DefaultStatusBehavior } from '../context/template-context.types.js';
import type { ConversionTypeContext } from '../conversion/zod/index.js';
import type { EndpointDefinition } from './definition.types.js';
import { replaceHyphenatedPath } from '../shared/utils/index.js';
import type { AllowedMethod } from '../validation/type-guards.js';
import type { GetZodVarNameFn } from './operation.helpers.js';
import { processParameter, processRequestBody } from './operation.helpers.js';
import { handleDefaultResponse, processResponses } from './path.utilities.js';

const voidSchema = 'z.void()';

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
