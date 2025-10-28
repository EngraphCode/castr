import path from 'node:path';
import fs from 'node:fs/promises';

import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { pick } from 'lodash-es';
import { capitalize } from './utils.js';
import type { Options } from 'prettier';

import { getHandlebars } from './getHandlebars.js';
import { maybePretty } from './maybePretty.js';
import type { TemplateContext } from './template-context.js';
import { getZodClientTemplateContext } from './template-context.js';
import { validateOpenApiSpec } from './validateOpenApiSpec.js';

export type GenerateZodClientFromOpenApiArgs<
  TOptions extends TemplateContext['options'] = TemplateContext['options'],
> = {
  openApiDoc: OpenAPIObject;
  /**
   * Template name to use for generation
   * - "schemas-only": Pure Zod schemas
   * - "schemas-with-metadata": Schemas + endpoint metadata (default)
   */
  template?: 'schemas-only' | 'schemas-with-metadata';
  /** Path to a custom template file (overrides template name) */
  templatePath?: string;
  /**
   * When true, automatically uses schemas-with-metadata template (no HTTP client)
   * Overrides template parameter if set
   */
  noClient?: boolean;
  /**
   * When true, generates validation helper functions (validateRequest, validateResponse)
   * Only applicable to schemas-with-metadata template
   */
  withValidationHelpers?: boolean;
  /**
   * When true, generates schema registry builder function
   * Only applicable to schemas-with-metadata template
   */
  withSchemaRegistry?: boolean;
  prettierConfig?: Options | null;
  options?: TOptions;
  handlebars?: ReturnType<typeof getHandlebars>;
} & (
  | {
      distPath?: never;
      /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
      disableWriteToFile: true;
    }
  | { distPath: string; disableWriteToFile?: false }
);

/**
 * Generate a Zod client from an OpenAPI specification.
 *
 * Supports multiple output templates:
 * - **schemas-with-metadata**: Schemas + endpoint metadata (default, perfect for custom clients)
 * - **schemas-only**: Pure Zod schemas without HTTP client
 *
 * @example Basic usage (default template - schemas with metadata)
 * ```typescript
 * import SwaggerParser from "@apidevtools/swagger-parser";
 * import { generateZodClientFromOpenAPI } from "openapi-zod-client";
 * import { resolveConfig } from "prettier";
 *
 * const openApiDoc = await SwaggerParser.parse("./openapi.yaml");
 * const prettierConfig = await resolveConfig("./");
 *
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./api-client.ts",
 *   prettierConfig,
 * });
 * ```
 *
 * @example Schemas only (no HTTP client)
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./schemas.ts",
 *   template: "schemas-only",
 * });
 * ```
 *
 * @example With validation helpers (default template)
 * ```typescript
 * // Generate schemas + metadata with validation helpers
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./api.ts",
 *   withValidationHelpers: true, // Generate validateRequest/validateResponse functions
 *   withSchemaRegistry: true, // Generate buildSchemaRegistry helper
 * });
 *
 * // Use the generated code with your own HTTP client
 * import { endpoints, validateRequest, validateResponse } from "./api.ts";
 * const endpoint = endpoints.find(e => e.alias === "getPet");
 * const validated = validateRequest(endpoint, { pathParams: { id: "123" } });
 * const response = await fetch(`https://api.example.com${endpoint.path}`, validated);
 * const data = validateResponse(endpoint, response.status, await response.json());
 * ```
 *
 * @example With grouping options
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./api-client.ts",
 *   options: {
 *     withAlias: true,
 *     baseUrl: "https://api.example.com",
 *     exportSchemas: true,
 *     groupStrategy: "tag", // Group endpoints by OpenAPI tag
 *   },
 * });
 * ```
 *
 * @example With custom template
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   distPath: "./schemas.ts",
 *   templatePath: "./custom-template.hbs",
 *   options: {
 *     exportSchemas: true,
 *   },
 * });
 * ```
 *
 * @example For testing (no file write)
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc,
 *   disableWriteToFile: true,
 *   template: "schemas-with-metadata",
 * });
 * // result is a string containing the generated code
 * ```
 */
export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext['options']>({
  openApiDoc,
  distPath,
  template,
  templatePath,
  noClient,
  withValidationHelpers,
  withSchemaRegistry,
  prettierConfig,
  options,
  disableWriteToFile,
  handlebars,
}: GenerateZodClientFromOpenApiArgs<TOptions>): Promise<string | Record<string, string>> => {
  // Validate OpenAPI spec structure at entry point (fail fast)
  // This ensures both CLI and programmatic APIs have consistent validation
  validateOpenApiSpec(openApiDoc);

  // Auto-switch to schemas-with-metadata template if noClient is set
  // Default to schemas-with-metadata if no template specified
  const effectiveTemplate = noClient
    ? 'schemas-with-metadata'
    : template || options?.template || 'schemas-with-metadata';

  // Auto-enable required options for schemas-with-metadata template:
  // - withAllResponses: Include all response status codes (not just errors)
  // - strictObjects: Use strict schemas for fail-fast validation
  // - withAlias: Include operationId for endpoint identification
  // - shouldExportAllSchemas: Export all component schemas (even if unused)
  const effectiveOptions: TemplateContext['options'] =
    effectiveTemplate === 'schemas-with-metadata'
      ? {
          ...options,
          withAllResponses: true,
          strictObjects: true,
          withAlias: true,
          shouldExportAllSchemas: true,
        }
      : options;

  const data = getZodClientTemplateContext(openApiDoc, effectiveOptions);
  const groupStrategy = effectiveOptions?.groupStrategy ?? 'none';

  if (!templatePath) {
    // Template name is always defined (has default), so use it directly
    templatePath = path.join(__dirname, `../src/templates/${effectiveTemplate}.hbs`);
  }

  // TypeScript needs to know templatePath is definitely defined here
  if (!templatePath) {
    throw new Error('No template path could be determined');
  }

  const source = await fs.readFile(templatePath, 'utf8');
  const hbs = handlebars ?? getHandlebars();
  const compiledTemplate = hbs.compile(source);
  const willWriteToFile = !disableWriteToFile && distPath;

  if (groupStrategy.includes('file')) {
    const outputByGroupName: Record<string, string> = {};

    if (willWriteToFile) {
      await fs.mkdir(path.dirname(distPath), { recursive: true });
    }

    const groupNames = Object.fromEntries(
      Object.keys(data.endpointsGroups).map((groupName) => [
        `${capitalize(groupName)}Api`,
        groupName,
      ]),
    );

    const indexSource = await fs.readFile(
      path.join(__dirname, '../src/templates/grouped-index.hbs'),
      'utf8',
    );
    const indexTemplate = hbs.compile(indexSource);
    const indexOutput = await maybePretty(indexTemplate({ groupNames }), prettierConfig);
    outputByGroupName['__index'] = indexOutput;

    if (willWriteToFile) {
      await fs.writeFile(path.join(distPath, 'index.ts'), indexOutput);
    }

    const commonSource = await fs.readFile(
      path.join(__dirname, '../src/templates/grouped-common.hbs'),
      'utf8',
    );
    const commonTemplate = hbs.compile(commonSource);
    const commonSchemaNames = [...(data.commonSchemaNames ?? [])];

    if (commonSchemaNames.length > 0) {
      const commonOutput = await maybePretty(
        commonTemplate({
          schemas: pick(data.schemas, commonSchemaNames),
          types: pick(data.types, commonSchemaNames),
        }),
        prettierConfig,
      );
      outputByGroupName['__common'] = commonOutput;

      if (willWriteToFile) {
        await fs.writeFile(path.join(distPath, 'common.ts'), commonOutput);
      }
    }

    for (const groupName in data.endpointsGroups) {
      const groupOutput = compiledTemplate({
        ...data,
        ...data.endpointsGroups[groupName],
        options: {
          ...effectiveOptions,
          groupStrategy: 'none',
          apiClientName: `${capitalize(groupName)}Api`,
          withValidationHelpers,
          withSchemaRegistry,
        },
      });
      const prettyGroupOutput = await maybePretty(groupOutput, prettierConfig);
      outputByGroupName[groupName] = prettyGroupOutput;

      if (willWriteToFile) {
        console.log('Writing to', path.join(distPath, `${groupName}.ts`));
        await fs.writeFile(path.join(distPath, `${groupName}.ts`), prettyGroupOutput);
      }
    }

    return outputByGroupName;
  }

  const output = compiledTemplate({
    ...data,
    options: {
      ...effectiveOptions,
      apiClientName: effectiveOptions?.apiClientName ?? 'api',
      withValidationHelpers,
      withSchemaRegistry,
    },
  });
  const prettyOutput = await maybePretty(output, prettierConfig);

  if (willWriteToFile) {
    await fs.writeFile(distPath, prettyOutput);
  }

  return prettyOutput;
};
