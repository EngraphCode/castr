/**
 * Helpers for processing operations within getZodiosEndpointDefinitionList
 * Extracted to reduce cognitive complexity in the main function
 */

import type { OperationObject, ResponseObject } from "openapi3-ts";
import type { TemplateContext } from "./template-context.js";
import type { ConversionTypeContext } from "./CodeMeta.js";
import type { EndpointDefinitionWithRefs } from "./getZodiosEndpointDefinitionList.js";
import { replaceHyphenatedPath } from "./utils.js";
import type { GetZodVarNameFn } from "./zodiosEndpoint.operation.helpers.js";
import {
    processDefaultResponse,
    processParameter,
    processRequestBody,
    processResponse,
} from "./zodiosEndpoint.operation.helpers.js";

const voidSchema = "z.void()";

/**
 * Processes all responses for an operation, collecting main response, errors, and response entries
 */
function processResponses(
    operation: OperationObject,
    endpointDefinition: EndpointDefinitionWithRefs,
    ctx: ConversionTypeContext,
    getZodVarName: GetZodVarNameFn,
    options?: TemplateContext["options"]
): void {
    for (const statusCode in operation.responses) {
        const responseObj = operation.responses[statusCode];
        if (!responseObj) continue;

        const result = processResponse(statusCode, responseObj as ResponseObject, ctx, getZodVarName, options);

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
    defaultStatusBehavior: TemplateContext["options"]["defaultStatusBehavior"],
    options?: TemplateContext["options"]
): { ignoredFallback?: string; ignoredGeneric?: string } {
    if (!operation.responses?.default) {
        return {};
    }

    const defaultResult = processDefaultResponse(
        operation.responses.default as ResponseObject,
        ctx,
        getZodVarName,
        Boolean(endpointDefinition.response),
        defaultStatusBehavior,
        options
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
    method: string;
    operation: OperationObject;
    operationName: string;
    parameters: Array<unknown>;
    ctx: ConversionTypeContext;
    getZodVarName: GetZodVarNameFn;
    defaultStatusBehavior: TemplateContext["options"]["defaultStatusBehavior"];
    options?: TemplateContext["options"];
};

type ProcessOperationResult = {
    endpoint: EndpointDefinitionWithRefs;
    ignoredFallback?: string;
    ignoredGeneric?: string;
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
        method: method as EndpointDefinitionWithRefs["method"],
        path: replaceHyphenatedPath(path),
        ...(options?.withAlias && { alias: operationName }),
        description: operation.description,
        requestFormat: "json",
        parameters: [],
        errors: [],
        response: "",
    };

    const bodyResult = processRequestBody(operation, ctx, operationName, getZodVarName, options);
    if (bodyResult) {
        endpointDefinition.requestFormat = bodyResult.requestFormat;
        endpointDefinition.parameters.push(bodyResult.parameter);
    }

    for (const param of parameters) {
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
        options
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

