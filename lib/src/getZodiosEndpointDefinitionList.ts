import type { ZodiosEndpointDefinition } from "@zodios/core";
import type { OpenAPIObject, OperationObject, PathItemObject } from "openapi3-ts";
import type { ObjectLiteral } from "pastable";
import { match, P } from "ts-pattern";

import type { CodeMeta, ConversionTypeContext } from "./CodeMeta.js";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph.js";
import { isReferenceObject } from "./isReferenceObject.js";
import { makeSchemaResolver } from "./makeSchemaResolver.js";
import type { TemplateContext } from "./template-context.js";
import { getSchemaVarName } from "./zodiosEndpoint.helpers.js";
import { processOperation } from "./zodiosEndpoint.path.helpers.js";
import { asComponentSchema, pathToVariableName } from "./utils.js";

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
 * import { getZodiosEndpointDefinitionList } from "openapi-zod-client";
 *
 * const openApiDoc = await SwaggerParser.parse("./openapi.yaml");
 * const endpoints = getZodiosEndpointDefinitionList(openApiDoc);
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
 * const endpoints = getZodiosEndpointDefinitionList(openApiDoc, {
 *   withAlias: true,
 *   exportSchemas: true,
 *   complexityThreshold: 3,
 * });
 * ```
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const getZodiosEndpointDefinitionList = (doc: OpenAPIObject, options?: TemplateContext["options"]) => {
    const resolver = makeSchemaResolver(doc);
    const graphs = getOpenApiDependencyGraph(
        Object.keys(doc.components?.schemas ?? {}).map((name) => asComponentSchema(name)),
        resolver.getSchemaByRef
    );

    const endpoints = [];

    const getOperationAlias = match(options?.withAlias)
        .with(
            P.boolean,
            P.nullish,
            () => (path: string, method: string, operation: OperationObject) =>
                operation.operationId ?? method + pathToVariableName(path)
        )
        .otherwise((fn) => fn);

    const ctx: ConversionTypeContext = { resolver, zodSchemaByName: {}, schemaByName: {} };
    if (options?.exportAllNamedSchemas) {
        ctx.schemasByName = {};
    }

    const complexityThreshold = options?.complexityThreshold ?? 4;
    const getZodVarName = (input: CodeMeta, fallbackName?: string) =>
        getSchemaVarName(input, ctx, complexityThreshold, fallbackName, {
            exportAllNamedSchemas: options?.exportAllNamedSchemas,
        });

    const defaultStatusBehavior = options?.defaultStatusBehavior ?? "spec-compliant";

    const ignoredFallbackResponse = [] as string[];
    const ignoredGenericError = [] as string[];

    for (const path in doc.paths) {
        const pathItemObj = doc.paths[path] as PathItemObject;
        const pathItem = pick(pathItemObj, ["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
        const parametersMap = getParametersMap(pathItemObj.parameters ?? []);

        for (const method in pathItem) {
            const operation = pathItem[method as keyof typeof pathItem];
            if (!operation) continue;
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

            if (result.ignoredFallback) {
                ignoredFallbackResponse.push(result.ignoredFallback);
            }

            if (result.ignoredGeneric) {
                ignoredGenericError.push(result.ignoredGeneric);
            }
        }
    }

    if (options?.willSuppressWarnings !== true) {
        if (ignoredFallbackResponse.length > 0) {
            console.warn(
                `The following endpoints have no status code other than \`default\` and were ignored as the OpenAPI spec recommends. However they could be added by setting \`defaultStatusBehavior\` to \`auto-correct\`: ${ignoredGenericError.join(
                    ", "
                )}`
            );
        }

        if (ignoredGenericError.length > 0) {
            console.warn(
                `The following endpoints could have had a generic error response added by setting \`defaultStatusBehavior\` to \`auto-correct\` ${ignoredGenericError.join(
                    ", "
                )}`
            );
        }
    }

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

const getParametersMap = (parameters: NonNullable<PathItemObject["parameters"]>) => {
    return Object.fromEntries(
        (parameters ?? []).map((param) => [isReferenceObject(param) ? param.$ref : param.name, param] as const)
    );
};

export type EndpointDefinitionWithRefs = Omit<
    ZodiosEndpointDefinition<unknown>,
    "response" | "parameters" | "errors" | "description"
> & {
    response: string;
    description?: string | undefined;
    parameters: Array<
        Omit<Required<ZodiosEndpointDefinition<unknown>>["parameters"][number], "schema"> & { schema: string }
    >;
    errors: Array<Omit<Required<ZodiosEndpointDefinition<unknown>>["errors"][number], "schema"> & { schema: string }>;
    responses?: Array<{ statusCode: string; schema: string; description?: string }>;
};

/** Pick given properties in object */
function pick<T extends ObjectLiteral, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;

    Object.keys(obj).forEach((key) => {
        if (!paths.includes(key as K)) return;
        result[key as K] = obj[key as K];
    });

    return result;
}
