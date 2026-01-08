// File contains main public API function with comprehensive parameter handling

/**
 * Code Generation & Rendering Module
 *
 * Architecture Note:
 * This module orchestrates the complete code generation pipeline:
 * 1. Input Processing: prepareOpenApiDocument() (Scalar bundling + upgrade to 3.1)
 * 2. Context Building: getZodClientTemplateContext() (dependency graph, type conversion)
 * 3. Template Rendering: ts-morph based generation with grouped/single file output
 * 4. Post-Processing: Prettier formatting
 *
 * All input specs are guaranteed to be OpenAPI 3.1 by the time they reach the
 * template context builder, thanks to Scalar's auto-upgrade behavior.
 *
 * See:
 * - .agent/architecture/SCALAR-PIPELINE.md (input processing)
 * - .agent/architecture/OPENAPI-3.1-MIGRATION.md (type system)
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { Options } from 'prettier';
import type { TemplateContext, TemplateContextOptions } from '../context/index.js';
import { getZodClientTemplateContext } from '../context/index.js';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { renderOutput, handleDebugIR } from './templating.js';
import type { GenerationResult } from './generation-result.js';

type TemplateName = 'schemas-only' | 'schemas-with-metadata';

export type GenerateZodClientFromOpenApiArgs<
  TOptions extends TemplateContext['options'] = TemplateContext['options'],
> = {
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
  /**
   * When true, writes the Intermediate Representation (IR) to a JSON file alongside the output.
   * Useful for debugging and verifying the IR structure.
   */
  debugIR?: boolean;
  prettierConfig?: Options | null;
  options?: TOptions;
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
export function determineEffectiveTemplate(
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
export function buildEffectiveOptions<TOptions extends TemplateContext['options']>(
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

export const generateZodClientFromOpenAPI = async <TOptions extends TemplateContext['options']>({
  openApiDoc,
  input,
  distPath,
  template,

  noClient,
  withValidationHelpers,
  withSchemaRegistry,
  debugIR,
  prettierConfig,
  options,
  disableWriteToFile,
}: GenerateZodClientFromOpenApiArgs<TOptions>): Promise<GenerationResult> => {
  validateInputs(input, openApiDoc);

  // We know one of them is defined because of validateInputs, but TS needs help
  const docToPrepare = input ?? openApiDoc;
  if (!docToPrepare) {
    throw new Error('Either input or openApiDoc must be provided.');
  }

  const { effectiveTemplate, effectiveOptions, data } = await buildContext(
    docToPrepare,
    noClient,
    template,
    options,
  );

  // Inject template option into context options for the writer to use
  data.options = {
    ...data.options,
    template: effectiveTemplate,
    withValidationHelpers: withValidationHelpers ?? false,
    withSchemaRegistry: withSchemaRegistry ?? false,
  };

  await handleDebugIR(data, distPath, disableWriteToFile, debugIR);

  const willWriteToFile = Boolean(!disableWriteToFile && distPath);

  return renderOutput(
    data,
    effectiveOptions,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );
};

async function buildContext(
  docToPrepare: OpenAPIObject | string | URL,
  noClient: boolean | undefined,
  template: TemplateName | undefined,
  options: TemplateContextOptions | undefined,
): Promise<{
  effectiveTemplate: TemplateName;
  effectiveOptions: TemplateContextOptions;
  data: TemplateContext;
}> {
  const preparedDoc = await prepareOpenApiDocument(docToPrepare);
  const effectiveTemplate = determineEffectiveTemplate(noClient, template, options?.template);
  const effectiveOptions = buildEffectiveOptions(effectiveTemplate, options);
  const data = getZodClientTemplateContext(preparedDoc, effectiveOptions);

  return { effectiveTemplate, effectiveOptions, data };
}

function validateInputs(
  input: string | URL | undefined,
  openApiDoc: OpenAPIObject | undefined,
): void {
  if (input !== undefined && openApiDoc !== undefined) {
    throw new Error(
      'Cannot provide both input and openApiDoc parameters. Provide either input (file path/URL) or openApiDoc (in-memory object), not both.',
    );
  }
  if (!input && !openApiDoc) {
    throw new Error('Either input or openApiDoc must be provided.');
  }
}
