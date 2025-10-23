/**
 * Pure helper functions for processing individual Zodios endpoint operations
 * Extracted to reduce cognitive complexity in getZodiosEndpointDefinitionList.ts main loop
 */

import type { OperationObject, ParameterObject, RequestBodyObject, ResponseObject, SchemaObject, ReferenceObject } from "openapi3-ts";
import { match, P } from "ts-pattern";

import type { CodeMeta, ConversionTypeContext } from "./CodeMeta.js";
import { isReferenceObject } from "./isReferenceObject.js";
import { getZodChain, getZodSchema } from "./openApiToZod.js";
import type { TemplateContext } from "./template-context.js";
import { pathParamToVariableName } from "./utils.js";

const voidSchema = "z.void()";

type GetZodVarNameFn = (input: CodeMeta, fallbackName?: string) => string;

type EndpointParameter = {
    name: string;
    type: "Body" | "Header" | "Query" | "Path";
    description?: string;
    schema: string;
};

type EndpointResponse = {
    statusCode: string;
    schema: string;
    description?: string;
};

type EndpointError = {
    schema: string;
    status: number | "default";
    description?: string;
};

const allowedPathInValues = ["path", "query", "header"];

const isAllowedParamMediaTypes = (mediaType: string) =>
    mediaType === "*/*" ||
    mediaType.includes("json") ||
    mediaType.includes("x-www-form-urlencoded") ||
    mediaType.includes("form-data") ||
    mediaType.includes("octet-stream") ||
    mediaType.includes("text/");

const isMediaTypeAllowed = (mediaType: string) => mediaType.includes("json") || mediaType.includes("text/");

const isMainResponseStatus = (status: number) => status >= 200 && status < 300;
const isErrorStatus = (status: number) => status >= 400 && status < 600;

/**
 * Processes request body for an endpoint
 * Returns the body parameter and request format
 */
export function processRequestBody(
    operation: OperationObject,
    ctx: ConversionTypeContext,
    operationName: string,
    getZodVarName: GetZodVarNameFn,
    options?: TemplateContext["options"]
): { parameter: EndpointParameter; requestFormat: "json" | "binary" | "form-url" | "form-data" | "text" } | undefined {
    if (!operation.requestBody) {
        return undefined;
    }

    const requestBody = (
        isReferenceObject(operation.requestBody)
            ? ctx.resolver.getSchemaByRef(operation.requestBody.$ref)
            : operation.requestBody
    ) as RequestBodyObject;

    const mediaTypes = Object.keys(requestBody.content ?? {});
    const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);
    const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;

    if (!bodySchema) {
        return undefined;
    }

    const requestFormat = match(matchingMediaType)
        .with("application/octet-stream", () => "binary" as const)
        .with("application/x-www-form-urlencoded", () => "form-url" as const)
        .with("multipart/form-data", () => "form-data" as const)
        .with(P.string.includes("json"), () => "json" as const)
        .otherwise(() => "text" as const);

    const bodyCode = getZodSchema({
        schema: bodySchema,
        ctx,
        meta: { isRequired: requestBody.required ?? true },
        options,
    });

    const schema =
        getZodVarName(bodyCode, operationName + "_Body") +
        getZodChain({
            schema: isReferenceObject(bodySchema) ? ctx.resolver.getSchemaByRef(bodySchema.$ref) : bodySchema,
            meta: bodyCode.meta,
        });

    return {
        parameter: {
            name: "body",
            type: "Body",
            description: requestBody.description ?? "",
            schema,
        },
        requestFormat,
    };
}

/**
 * Processes a single parameter for an endpoint
 * Returns the parameter definition or undefined if it should be skipped
 */
export function processParameter(
    param: ParameterObject | ReferenceObject,
    ctx: ConversionTypeContext,
    getZodVarName: GetZodVarNameFn,
    options?: TemplateContext["options"]
): EndpointParameter | undefined {
    const paramItem = (isReferenceObject(param) ? ctx.resolver.getSchemaByRef(param.$ref) : param) as ParameterObject;

    if (!allowedPathInValues.includes(paramItem.in)) {
        return undefined;
    }

    let paramSchema: SchemaObject | ReferenceObject | undefined;

    if (paramItem.content) {
        const mediaTypes = Object.keys(paramItem.content ?? {});
        const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);

        if (!matchingMediaType) {
            throw new Error(`Unsupported media type for param ${paramItem.name}: ${mediaTypes.join(", ")}`);
        }

        const mediaTypeObject = paramItem.content[matchingMediaType];
        if (!mediaTypeObject) {
            throw new Error(`No content with media type for param ${paramItem.name}: ${matchingMediaType}`);
        }

        // Fallback for OpenAPI spec violations where $ref is at wrong level
        // @ts-expect-error - OpenAPI spec violations: some docs incorrectly place $ref at mediaTypeObject level
        paramSchema = mediaTypeObject?.schema ?? mediaTypeObject;
    } else {
        paramSchema = isReferenceObject(paramItem.schema)
            ? ctx.resolver.getSchemaByRef(paramItem.schema.$ref)
            : paramItem.schema;
    }

    if (options?.withDescription && paramSchema) {
        (paramSchema as SchemaObject).description = (paramItem.description ?? "").trim();
    }

    // Resolve ref if needed, fallback to default (unknown) value if needed
    paramSchema = paramSchema
        ? isReferenceObject(paramSchema)
            ? ctx.resolver.getSchemaByRef(paramSchema.$ref)
            : paramSchema
        : {};

    const paramCode = getZodSchema({
        schema: paramSchema ?? {},
        ctx,
        meta: { isRequired: paramItem.in === "path" ? true : paramItem.required ?? false },
        options,
    });

    const name = match(paramItem.in)
        .with("path", () => pathParamToVariableName(paramItem.name))
        .otherwise(() => paramItem.name);

    const type = match(paramItem.in)
        .with("header", () => "Header")
        .with("query", () => "Query")
        .with("path", () => "Path")
        .run() as "Header" | "Query" | "Path";

    const schema = getZodVarName(
        paramCode.assign(paramCode.toString() + getZodChain({ schema: paramSchema, meta: paramCode.meta, options })),
        paramItem.name
    );

    return { name, type, schema };
}

/**
 * Processes a single response for an endpoint
 * Returns response data and updates to make to the endpoint
 */
export function processResponse(
    statusCode: string,
    responseObj: ResponseObject | ReferenceObject,
    ctx: ConversionTypeContext,
    getZodVarName: GetZodVarNameFn,
    options?: TemplateContext["options"]
): {
    responseEntry?: EndpointResponse;
    mainResponse?: string;
    mainResponseDescription?: string;
    error?: EndpointError;
} {
    const responseItem = (
        isReferenceObject(responseObj) ? ctx.resolver.getSchemaByRef(responseObj.$ref) : responseObj
    ) as ResponseObject;

    const mediaTypes = Object.keys(responseItem.content ?? {});
    const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);
    const maybeSchema = matchingMediaType ? responseItem.content?.[matchingMediaType]?.schema : null;

    let schemaString = matchingMediaType ? undefined : voidSchema;
    let schema: CodeMeta | undefined;

    if (maybeSchema) {
        schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
        schemaString =
            (schema.ref ? getZodVarName(schema) : schema.toString()) +
            getZodChain({
                schema: isReferenceObject(maybeSchema) ? ctx.resolver.getSchemaByRef(maybeSchema.$ref) : maybeSchema,
                meta: schema.meta,
            });
    }

    const result: ReturnType<typeof processResponse> = {};

    if (options?.withAllResponses) {
        result.responseEntry = {
            statusCode,
            schema: schemaString ?? voidSchema,
            description: responseItem.description,
        };
    }

    if (schemaString) {
        const status = Number(statusCode);

        if (isMainResponseStatus(status)) {
            result.mainResponse = schemaString;
            if (responseItem.description && options?.useMainResponseDescriptionAsEndpointDefinitionFallback) {
                result.mainResponseDescription = responseItem.description;
            }
        } else if (statusCode !== "default" && isErrorStatus(status)) {
            result.error = {
                schema: schemaString,
                status,
                description: responseItem.description,
            };
        }
    }

    return result;
}

/**
 * Processes the default response for an endpoint
 * Returns updates to make based on defaultStatusBehavior
 */
export function processDefaultResponse(
    defaultResponse: ResponseObject,
    ctx: ConversionTypeContext,
    getZodVarName: GetZodVarNameFn,
    hasMainResponse: boolean,
    defaultStatusBehavior: "spec-compliant" | "auto-correct",
    options?: TemplateContext["options"]
): {
    mainResponse?: string;
    error?: EndpointError;
    shouldIgnoreFallback?: boolean;
    shouldIgnoreGeneric?: boolean;
} {
    const mediaTypes = Object.keys(defaultResponse.content ?? {});
    const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);
    const maybeSchema = matchingMediaType && defaultResponse.content?.[matchingMediaType]?.schema;

    let schemaString = matchingMediaType ? undefined : voidSchema;
    let schema: CodeMeta | undefined;

    if (maybeSchema) {
        schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
        schemaString =
            (schema.ref ? getZodVarName(schema) : schema.toString()) +
            getZodChain({
                schema: isReferenceObject(maybeSchema) ? ctx.resolver.getSchemaByRef(maybeSchema.$ref) : maybeSchema,
                meta: schema.meta,
            });
    }

    if (!schemaString) {
        return {};
    }

    if (defaultStatusBehavior === "auto-correct") {
        if (hasMainResponse) {
            return {
                error: {
                    schema: schemaString,
                    status: "default",
                    description: defaultResponse.description,
                },
            };
        }
        return { mainResponse: schemaString };
    }

    // spec-compliant mode
    if (hasMainResponse) {
        return { shouldIgnoreFallback: true };
    }
    return { shouldIgnoreGeneric: true };
}

