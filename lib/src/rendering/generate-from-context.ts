/* eslint-disable max-lines */
// File contains main public API function with comprehensive parameter handling
import path from 'node:path';
import fs from 'node:fs/promises';

import type { OpenAPIObject } from 'openapi3-ts/oas30';
import type { Options } from 'prettier';
import { getHandlebars } from './handlebars.js';
import type { TemplateContext, TemplateContextOptions } from '../context/index.js';
import { getZodClientTemplateContext } from '../context/index.js';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { handleFileGrouping, handleSingleFileOutput } from './templating.js';

type TemplateName = 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client';

export type GenerateZodClientFromOpenApiArgs<
  TOptions extends TemplateContext['options'] = TemplateContext['options'],
> = {
  /**
   * Template name to use for generation
   * - "schemas-only": Pure Zod schemas
   * - "schemas-with-metadata": Schemas + endpoint metadata (default)
   * - "schemas-with-client": Full client with openapi-fetch + Zod validation
   */
  template?: 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client';
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
      /** File path or URL to OpenAPI document. Mutually exclusive with openApiDoc. */
      input: string | URL;
      openApiDoc?: never;
      distPath?: never;
      /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
      disableWriteToFile: true;
    }
  | {
      /** File path or URL to OpenAPI document. Mutually exclusive with openApiDoc. */
      input: string | URL;
      openApiDoc?: never;
      distPath: string;
      disableWriteToFile?: false;
    }
  | {
      /** In-memory OpenAPI document. Mutually exclusive with input. */
      openApiDoc: OpenAPIObject;
      input?: never;
      distPath?: never;
      /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
      disableWriteToFile: true;
    }
  | {
      /** In-memory OpenAPI document. Mutually exclusive with input. */
      openApiDoc: OpenAPIObject;
      input?: never;
      distPath: string;
      disableWriteToFile?: false;
    }
);

/**
 * Determine the effective template to use based on inputs
 */
function determineEffectiveTemplate(
  noClient: boolean | undefined,
  template: GenerateZodClientFromOpenApiArgs['template'],
  optionsTemplate: TemplateContextOptions['template'] | undefined,
): TemplateName {
  if (noClient) {
    return 'schemas-with-metadata';
  }
  if (template) {
    return template;
  }
  // optionsTemplate is 'schemas-only' | 'schemas-with-metadata' | undefined
  // Both non-undefined values are valid TemplateName values
  if (optionsTemplate === 'schemas-only') {
    return 'schemas-only';
  }
  if (optionsTemplate === 'schemas-with-metadata') {
    return 'schemas-with-metadata';
  }
  return 'schemas-with-metadata';
}

/**
 * Build effective options with auto-enabled features for schemas-with-metadata template
 */
function buildEffectiveOptions<TOptions extends TemplateContext['options']>(
  effectiveTemplate: TemplateName,
  options: TOptions | undefined,
): TemplateContextOptions {
  // Base defaults that should always be present in options
  const baseDefaults: TemplateContextOptions = {
    baseUrl: '',
    withAlias: false,
  };

  if (effectiveTemplate === 'schemas-with-metadata') {
    return {
      ...baseDefaults,
      ...options,
      withAllResponses: true,
      strictObjects: true,
      withAlias: true,
      shouldExportAllSchemas: true,
    };
  }

  // For other templates, merge with base defaults but don't add template-specific options
  // unless they're explicitly set by the user
  return {
    ...baseDefaults,
    ...options,
  };
}

/**
 * Resolve template path from template name or custom path
 */
function resolveTemplatePath(
  templatePath: string | undefined,
  effectiveTemplate: TemplateName,
): string {
  if (templatePath) {
    return templatePath;
  }
  return path.join(__dirname, `./templates/${effectiveTemplate}.hbs`);
}

/**
 * Generate a Zod client from an OpenAPI specification.
 *
 * Supports multiple output templates:
 * - **schemas-with-metadata**: Schemas + endpoint metadata (default, perfect for custom clients)
 * - **schemas-only**: Pure Zod schemas without endpoint metadata
 * - **schemas-with-client**: Full client with openapi-fetch + Zod validation
 *
 * **Input Sources:**
 * You can provide the OpenAPI document either as:
 * - File path or URL via `input` parameter (string or URL object)
 * - In-memory object via `openApiDoc` parameter (OpenAPIObject)
 *
 * You cannot provide both `input` and `openApiDoc` at the same time.
 *
 * @param args - Generation arguments
 * @param args.input - Optional file path or URL to OpenAPI document. Mutually exclusive with openApiDoc.
 * @param args.openApiDoc - Optional in-memory OpenAPI document. Mutually exclusive with input.
 * @param args.distPath - Output file path (required unless disableWriteToFile is true)
 * @param args.disableWriteToFile - When true, returns string instead of writing file
 * @param args.template - Template name to use for generation
 * @param args.noClient - Skip HTTP client generation (uses schemas-with-metadata template)
 * @param args.prettierConfig - Prettier configuration for output formatting
 * @param args.options - Template context options (groupStrategy, withAlias, etc.)
 *
 * @example Using file path input
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   input: './api.yaml',
 *   distPath: './api-client.ts',
 * });
 * ```
 *
 * @example Using in-memory object
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   openApiDoc: myOpenApiObject,
 *   distPath: './api-client.ts',
 * });
 * ```
 *
 * @example Using URL input (returns string, doesn't write file)
 * ```typescript
 * const result = await generateZodClientFromOpenAPI({
 *   input: new URL('https://api.example.com/openapi.json'),
 *   disableWriteToFile: true,
 * });
 * // result is a string containing the generated TypeScript code
 * ```
 */
/* eslint-disable max-lines-per-function, complexity */
// Function handles multiple input types and template options - complexity is necessary for public API
export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext['options']>({
  openApiDoc,
  input,
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
  // Mutual exclusion guard: cannot provide both input and openApiDoc
  if (input !== undefined && openApiDoc !== undefined) {
    throw new Error(
      'Cannot provide both input and openApiDoc parameters. Provide either input (file path/URL) or openApiDoc (in-memory object), not both.',
    );
  }

  // Prepare OpenAPI document using unified pipeline (validates and bundles)
  const docToPrepare = input ?? openApiDoc;
  if (!docToPrepare) {
    throw new Error('Either input or openApiDoc must be provided.');
  }
  const preparedDoc = await prepareOpenApiDocument(docToPrepare);

  const effectiveTemplate = determineEffectiveTemplate(noClient, template, options?.template);
  const effectiveOptions = buildEffectiveOptions(effectiveTemplate, options);
  const data = getZodClientTemplateContext(preparedDoc, effectiveOptions);
  const groupStrategy = effectiveOptions?.groupStrategy ?? 'none';
  const resolvedTemplatePath = resolveTemplatePath(templatePath, effectiveTemplate);
  const source = await fs.readFile(resolvedTemplatePath, 'utf8');
  const hbs = handlebars ?? getHandlebars();
  const compiledTemplate = hbs.compile(source);
  const willWriteToFile = Boolean(!disableWriteToFile && distPath);

  if (groupStrategy.includes('file')) {
    return handleFileGrouping(
      data,
      effectiveOptions,
      compiledTemplate,
      withValidationHelpers,
      withSchemaRegistry,
      distPath,
      prettierConfig,
      hbs,
      willWriteToFile,
    );
  }

  return handleSingleFileOutput(
    data,
    effectiveOptions,
    compiledTemplate,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );
};
/* eslint-enable max-lines-per-function, complexity */
