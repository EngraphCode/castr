/**
 * Pure helper functions for Zodios endpoint generation
 * Extracted to reduce cognitive complexity in getZodiosEndpointDefinitionList.ts
 *
 * Each function has a single responsibility and is < 50 lines
 */

import type { ReferenceObject, SchemaObject } from "openapi3-ts";

import type { CodeMeta } from "./CodeMeta.js";
import { getSchemaComplexity } from "./schema-complexity.js";
import { normalizeString } from "./utils.js";

type ZodiosContext = {
    zodSchemaByName: Record<string, string>;
    schemaByName: Record<string, string>;
    schemasByName?: Record<string, string[]>;
    resolver: {
        resolveRef: (ref: string) => { name: string };
        getSchemaByRef: (ref: string) => unknown;
    };
};

/**
 * Checks if schema should be inlined (no variable extraction)
 * Returns true if complexity is below threshold or threshold is -1
 */
export function shouldInlineSchema(complexity: number, complexityThreshold: number): boolean {
    // Special case: -1 means always inline everything
    if (complexityThreshold === -1) {
        return true;
    }

    // Simple schemas below threshold should be inlined
    return complexity < complexityThreshold;
}

/**
 * Generates a unique variable name with collision detection
 * Iteratively adds suffix numbers until a unique name is found
 */
export function generateUniqueVarName(
    baseName: string,
    existingNames: Record<string, string>,
    options?: {
        exportAllNamedSchemas?: boolean;
        schemasByName?: Record<string, string[]>;
        schemaKey?: string;
    }
): string {
    let formattedName = baseName;
    let reuseCount = 1;

    while (existingNames[formattedName]) {
        // Check if we can reuse this name
        if (options?.exportAllNamedSchemas && options.schemasByName && options.schemaKey) {
            if (options.schemasByName[options.schemaKey]?.includes(formattedName)) {
                return formattedName;
            }
        } else if (existingNames[formattedName] === baseName) {
            return formattedName;
        }

        // Name is taken, try with suffix
        reuseCount += 1;
        formattedName = `${baseName}__${reuseCount}`;
    }

    return formattedName;
}

/**
 * Registers a schema name in the context for reuse
 */
export function registerSchemaName(
    ctx: ZodiosContext,
    varName: string,
    schemaResult: string,
    exportAllNamedSchemas: boolean
): void {
    ctx.zodSchemaByName[varName] = schemaResult;
    ctx.schemaByName[schemaResult] = varName;

    if (exportAllNamedSchemas && ctx.schemasByName) {
        ctx.schemasByName[schemaResult] = (ctx.schemasByName[schemaResult] ?? []).concat(varName);
    }
}

/**
 * Handles inline-everything mode (complexityThreshold === -1)
 * Returns the full schema definition or resolved reference
 */
export function handleInlineEverything(input: CodeMeta, result: string, ctx: ZodiosContext): string {
    if (input.ref) {
        const zodSchema = ctx.zodSchemaByName[result];
        if (!zodSchema) {
            throw new Error(`Zod schema not found for ref: ${result}`);
        }
        return zodSchema;
    }
    return result;
}

/**
 * Checks if a schema variable already exists and can be reused
 * Returns the existing variable name if found, undefined otherwise
 */
export function findExistingSchemaVar(
    result: string,
    ctx: ZodiosContext,
    exportAllNamedSchemas: boolean
): string | undefined {
    if (!exportAllNamedSchemas && ctx.schemaByName[result]) {
        return ctx.schemaByName[result];
    }
    return undefined;
}

/**
 * Handles reference schema variable naming
 * Resolves refs and checks complexity
 */
export function handleRefSchema(
    input: CodeMeta,
    result: string,
    ctx: ZodiosContext,
    complexityThreshold: number
): string {
    let schema = ctx.zodSchemaByName[result];

    // Try to resolve ref if schema not found directly
    if (!schema && input.ref) {
        const refInfo = ctx.resolver.resolveRef(input.ref);
        schema = ctx.zodSchemaByName[refInfo.name];
    }

    if (input.ref && schema) {
        const complexity = getSchemaComplexity({
            current: 0,
            schema: ctx.resolver.getSchemaByRef(input.ref) as SchemaObject | ReferenceObject | undefined,
        });

        // Simple refs can be inlined
        if (complexity < complexityThreshold) {
            const zodSchema = ctx.zodSchemaByName[result];
            if (!zodSchema) {
                throw new Error(`Zod schema not found for ref: ${result}`);
            }
            return zodSchema;
        }

        return result;
    }

    console.log({ ref: input.ref, result });
    throw new Error("Invalid ref: " + input.ref);
}

/**
 * Main logic for determining variable name or inline schema
 * Orchestrates the various helper functions
 */
export function getSchemaVarName(
    input: CodeMeta,
    ctx: ZodiosContext,
    complexityThreshold: number,
    fallbackName: string | undefined,
    options: { exportAllNamedSchemas?: boolean } | undefined
): string {
    const result = input.toString();

    // Handle inline-everything mode
    if (complexityThreshold === -1) {
        return handleInlineEverything(input, result, ctx);
    }

    // Handle simple schemas with fallback names
    if ((result.startsWith("z.") || input.ref === undefined) && fallbackName) {
        // Inline if simple enough
        if (input.complexity < complexityThreshold) {
            return result;
        }

        const safeName = normalizeString(fallbackName);

        // Check if already exists
        const existing = findExistingSchemaVar(result, ctx, Boolean(options?.exportAllNamedSchemas));
        if (existing) {
            return existing;
        }

        // Generate unique name and register
        const varName = ctx.schemasByName
            ? generateUniqueVarName(safeName, ctx.zodSchemaByName, {
                  exportAllNamedSchemas: options?.exportAllNamedSchemas ?? false,
                  schemasByName: ctx.schemasByName,
                  schemaKey: result,
              })
            : generateUniqueVarName(safeName, ctx.zodSchemaByName);

        registerSchemaName(ctx, varName, result, options?.exportAllNamedSchemas ?? false);
        return varName;
    }

    // Handle reference schemas
    return handleRefSchema(input, result, ctx, complexityThreshold);
}
