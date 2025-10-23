import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import SwaggerParser from "@apidevtools/swagger-parser";
import { Command } from "commander";
import type { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";

import { toBoolean } from "./utils.js";
import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI.js";

interface CliOptions {
    output?: string;
    template?: string;
    prettier?: string;
    baseUrl?: string;
    withAlias?: boolean;
    apiClientName?: string;
    errorExpr?: string;
    successExpr?: string;
    mediaTypeExpr?: string;
    exportSchemas?: boolean;
    exportTypes?: boolean;
    implicitRequired?: boolean;
    withDeprecated?: boolean;
    withDocs?: boolean;
    withDescription?: boolean;
    groupStrategy?: string;
    complexityThreshold?: string;
    defaultStatus?: string;
    allReadonly?: boolean;
    strictObjects?: boolean;
    additionalPropsDefaultValue?: boolean;
}

function getPackageVersion(): string {
    try {
        const packageJsonContent = readFileSync(resolve(__dirname, "../../package.json"), "utf8");
        const parsed = JSON.parse(packageJsonContent) as { version?: unknown };
        return typeof parsed.version === "string" ? parsed.version : "0.0.0";
    } catch {
        return "0.0.0";
    }
}

const program = new Command();

program
    .name("openapi-zod-client")
    .description("Generate a Zodios API client from an OpenAPI specification")
    .version(getPackageVersion())
    .argument("<input>", "path/url to OpenAPI/Swagger document as json/yaml")
    .option("-o, --output <path>", "Output path for the zodios api client ts file (defaults to `<input>.client.ts`)")
    .option(
        "-t, --template <path>",
        "Template path for the handlebars template that will be used to generate the output"
    )
    .option("-p, --prettier <path>", "Prettier config path that will be used to format the output client file")
    .option("-b, --base-url <url>", "Base url for the api")
    .option("--no-with-alias", "Disable alias as api client methods")
    .option("-a, --with-alias", "With alias as api client methods", true)
    .option(
        "--api-client-name <name>",
        "when using the default `template.hbs`, allow customizing the `export const {apiClientName}`"
    )
    .option("--error-expr <expr>", "Pass an expression to determine if a response status is an error")
    .option("--success-expr <expr>", "Pass an expression to determine which response status is the main success status")
    .option("--media-type-expr <expr>", "Pass an expression to determine which response content should be allowed")
    .option("--export-schemas", "When true, will export all `#/components/schemas`")
    .option(
        "--implicit-required",
        "When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set"
    )
    .option("--with-deprecated", "when true, will keep deprecated endpoints in the api output")
    .option("--with-description", "when true, will add z.describe(xxx)")
    .option("--with-docs", "when true, will add jsdoc comments to generated types")
    .option(
        "--group-strategy <strategy>",
        "groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'"
    )
    .option(
        "--complexity-threshold <number>",
        "schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable"
    )
    .option(
        "--default-status <behavior>",
        "when defined as `auto-correct`, will automatically use `default` as fallback for `response` when no status code was declared"
    )
    .option("--all-readonly", "when true, all generated objects and arrays will be readonly")
    .option("--export-types", "When true, will defined types for all object schemas in `#/components/schemas`")
    .option(
        "--additional-props-default-value [value]",
        "Set default value when additionalProperties is not provided. Default to true.",
        true
    )
    .option(
        "--strict-objects [value]",
        "Use strict validation for objects so we don't allow unknown keys. Defaults to false.",
        false
    )
    .action(async (input: string, options: CliOptions) => {
        console.log("Retrieving OpenAPI document from", input);
        // SwaggerParser uses its own OpenAPI types, cast to openapi3-ts types
        const openApiDoc = await SwaggerParser.bundle(input) as unknown as OpenAPIObject;
        const prettierConfig = await resolveConfig(options.prettier ?? "./");
        const distPath = options.output ?? input + ".client.ts";
        const withAlias = toBoolean(options.withAlias, true);
        const additionalPropertiesDefaultValue = toBoolean(options.additionalPropsDefaultValue, true);

        // Parse and validate CLI options
        const groupStrategy = options.groupStrategy as "none" | "tag" | "method" | "tag-file" | "method-file" | undefined;
        const complexityThreshold = options.complexityThreshold !== undefined 
            ? parseInt(options.complexityThreshold, 10) 
            : undefined;
        const defaultStatusBehavior = options.defaultStatus as "spec-compliant" | "auto-correct" | undefined;

        // Build generation options (for exactOptionalPropertyTypes: only include defined values)
        const generationOptions: Record<string, unknown> = {
            withAlias,
            additionalPropertiesDefaultValue,
        };

        if (options.baseUrl) generationOptions["baseUrl"] = options.baseUrl;
        if (options.apiClientName) generationOptions["apiClientName"] = options.apiClientName;
        if (options.errorExpr) generationOptions["isErrorStatus"] = options.errorExpr;
        if (options.successExpr) generationOptions["isMainResponseStatus"] = options.successExpr;
        if (options.exportSchemas) generationOptions["shouldExportAllSchemas"] = options.exportSchemas;
        if (options.exportTypes) generationOptions["shouldExportAllTypes"] = options.exportTypes;
        if (options.mediaTypeExpr) generationOptions["isMediaTypeAllowed"] = options.mediaTypeExpr;
        if (options.implicitRequired) generationOptions["withImplicitRequiredProps"] = options.implicitRequired;
        if (options.withDeprecated) generationOptions["withDeprecatedEndpoints"] = options.withDeprecated;
        if (options.withDocs) generationOptions["withDocs"] = options.withDocs;
        if (groupStrategy) generationOptions["groupStrategy"] = groupStrategy;
        if (complexityThreshold !== undefined) generationOptions["complexityThreshold"] = complexityThreshold;
        if (defaultStatusBehavior) generationOptions["defaultStatusBehavior"] = defaultStatusBehavior;
        if (options.withDescription) generationOptions["withDescription"] = options.withDescription;
        if (options.allReadonly) generationOptions["allReadonly"] = options.allReadonly;
        if (options.strictObjects) generationOptions["strictObjects"] = options.strictObjects;

        // Build generation args (only include defined properties)
        // Using Record<string, unknown> to dynamically build options from CLI
        // Type assertion is safe because we're matching the expected structure
        const generationArgs: Record<string, unknown> = {
            openApiDoc,
            distPath,
            options: generationOptions,
        };

        if (prettierConfig) generationArgs["prettierConfig"] = prettierConfig;
        if (options.template) generationArgs["templatePath"] = options.template;

        await generateZodClientFromOpenAPI(generationArgs as Parameters<typeof generateZodClientFromOpenAPI>[0]);
        console.log(`Done generating <${distPath}> !`);
    });

program.parse();
