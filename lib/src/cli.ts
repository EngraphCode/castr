import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import SwaggerParser from '@apidevtools/swagger-parser';
import { Command } from 'commander';
import { resolveConfig } from 'prettier';

import { toBoolean } from './utils.js';
import {
  generateZodClientFromOpenAPI,
  type GenerateZodClientFromOpenApiArgs,
} from './generateZodClientFromOpenAPI.js';
import {
  hasVersionProperty,
  isGroupStrategy,
  isDefaultStatusBehavior,
  isOpenAPIObject,
} from './cli-type-guards.js';
import type { TemplateContextOptions } from './template-context.js';

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
  noClient?: boolean;
  withValidationHelpers?: boolean;
  withSchemaRegistry?: boolean;
}

function getPackageVersion(): string {
  try {
    const packageJsonContent = readFileSync(resolve(__dirname, '../../package.json'), 'utf8');
    const parsed: unknown = JSON.parse(packageJsonContent);
    if (hasVersionProperty(parsed) && typeof parsed.version === 'string') {
      return parsed.version;
    }
    return '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Parse and validate CLI options (groupStrategy, complexityThreshold, defaultStatus)
 */
function parseCliOptions(options: CliOptions): {
  groupStrategy: TemplateContextOptions['groupStrategy'];
  complexityThreshold: number | undefined;
  defaultStatusBehavior: TemplateContextOptions['defaultStatusBehavior'];
} {
  const groupStrategy = isGroupStrategy(options.groupStrategy) ? options.groupStrategy : undefined;
  const complexityThreshold =
    options.complexityThreshold !== undefined
      ? parseInt(options.complexityThreshold, 10)
      : undefined;
  const defaultStatusBehavior = isDefaultStatusBehavior(options.defaultStatus)
    ? options.defaultStatus
    : undefined;

  return { groupStrategy, complexityThreshold, defaultStatusBehavior };
}

/**
 * Add optional string properties to generation options
 */
function addStringOptions(
  options: CliOptions,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  if (options.baseUrl) generationOptions.baseUrl = options.baseUrl;
  if (options.apiClientName) generationOptions.apiClientName = options.apiClientName;
  if (options.errorExpr) generationOptions.isErrorStatus = options.errorExpr;
  if (options.successExpr) generationOptions.isMainResponseStatus = options.successExpr;
  if (options.mediaTypeExpr) generationOptions.isMediaTypeAllowed = options.mediaTypeExpr;
}

/**
 * Add optional boolean properties to generation options
 */
function addBooleanOptions(
  options: CliOptions,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  if (options.exportSchemas) generationOptions.shouldExportAllSchemas = options.exportSchemas;
  if (options.exportTypes) generationOptions.shouldExportAllTypes = options.exportTypes;
  if (options.implicitRequired)
    generationOptions.withImplicitRequiredProps = options.implicitRequired;
  if (options.withDeprecated) generationOptions.withDeprecatedEndpoints = options.withDeprecated;
}

/**
 * Add parsed options to generation options
 */
function addParsedOptions(
  parsedOptions: ReturnType<typeof parseCliOptions>,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  const { groupStrategy, complexityThreshold, defaultStatusBehavior } = parsedOptions;
  if (groupStrategy) generationOptions.groupStrategy = groupStrategy;
  if (complexityThreshold !== undefined)
    generationOptions.complexityThreshold = complexityThreshold;
  if (defaultStatusBehavior) generationOptions.defaultStatusBehavior = defaultStatusBehavior;
}

/**
 * Build generation options from CLI options
 * Only includes defined values to satisfy exactOptionalPropertyTypes
 */
function buildGenerationOptions(
  options: CliOptions,
  parsedOptions: ReturnType<typeof parseCliOptions>,
): Partial<TemplateContextOptions> {
  const withAlias = toBoolean(options.withAlias, true);
  const additionalPropertiesDefaultValue = toBoolean(options.additionalPropsDefaultValue, true);

  const generationOptions: Partial<TemplateContextOptions> = {
    withAlias,
    additionalPropertiesDefaultValue,
  };

  addStringOptions(options, generationOptions);
  addBooleanOptions(options, generationOptions);
  if (options.withDocs) generationOptions.withDocs = options.withDocs;
  if (options.withDescription) generationOptions.withDescription = options.withDescription;
  if (options.allReadonly) generationOptions.allReadonly = options.allReadonly;
  if (options.strictObjects) generationOptions.strictObjects = options.strictObjects;
  addParsedOptions(parsedOptions, generationOptions);

  return generationOptions;
}

/**
 * Type guard to check if a template string is a valid template name
 */
function isTemplateName(
  template: string | undefined,
): template is 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client' {
  return (
    template === 'schemas-only' ||
    template === 'schemas-with-metadata' ||
    template === 'schemas-with-client'
  );
}

/**
 * Build generation args from CLI options and parsed data
 */
function buildGenerationArgs(
  openApiDoc: Parameters<typeof generateZodClientFromOpenAPI>[0]['openApiDoc'],
  distPath: string,
  prettierConfig: Awaited<ReturnType<typeof resolveConfig>> | null,
  options: CliOptions,
  generationOptions: Partial<TemplateContextOptions>,
): GenerateZodClientFromOpenApiArgs {
  const generationArgs: GenerateZodClientFromOpenApiArgs = {
    openApiDoc,
    distPath,
    options: generationOptions,
    ...(prettierConfig && { prettierConfig }),
    ...(options.template &&
      (isTemplateName(options.template)
        ? { template: options.template }
        : { templatePath: options.template })),
    ...(options.noClient && { noClient: options.noClient }),
    ...(options.withValidationHelpers && {
      withValidationHelpers: options.withValidationHelpers,
    }),
    ...(options.withSchemaRegistry && { withSchemaRegistry: options.withSchemaRegistry }),
  };

  return generationArgs;
}

const program = new Command();

program
  .name('openapi-zod-client')
  .description('Generate a type-safe API client with Zod validation from an OpenAPI specification')
  .version(getPackageVersion())
  .argument('<input>', 'path/url to OpenAPI/Swagger document as json/yaml')
  .option(
    '-o, --output <path>',
    'Output path for the generated client ts file (defaults to `<input>.client.ts`)',
  )
  .option(
    '-t, --template <name|path>',
    'Template to use: "schemas-only", "schemas-with-metadata" (default), "schemas-with-client", or path to custom .hbs file',
  )
  .option(
    '-p, --prettier <path>',
    'Prettier config path that will be used to format the output client file',
  )
  .option('-b, --base-url <url>', 'Base url for the api')
  .option('--no-with-alias', 'Disable alias as api client methods')
  .option('-a, --with-alias', 'With alias as api client methods', true)
  .option(
    '--api-client-name <name>',
    'when using the default `template.hbs`, allow customizing the `export const {apiClientName}`',
  )
  .option('--error-expr <expr>', 'Pass an expression to determine if a response status is an error')
  .option(
    '--success-expr <expr>',
    'Pass an expression to determine which response status is the main success status',
  )
  .option(
    '--media-type-expr <expr>',
    'Pass an expression to determine which response content should be allowed',
  )
  .option('--export-schemas', 'When true, will export all `#/components/schemas`')
  .option(
    '--implicit-required',
    'When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set',
  )
  .option('--with-deprecated', 'when true, will keep deprecated endpoints in the api output')
  .option('--with-description', 'when true, will add z.describe(xxx)')
  .option('--with-docs', 'when true, will add jsdoc comments to generated types')
  .option(
    '--group-strategy <strategy>',
    "groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'",
  )
  .option(
    '--complexity-threshold <number>',
    'schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable',
  )
  .option(
    '--default-status <behavior>',
    'when defined as `auto-correct`, will automatically use `default` as fallback for `response` when no status code was declared',
  )
  .option('--all-readonly', 'when true, all generated objects and arrays will be readonly')
  .option(
    '--export-types',
    'When true, will defined types for all object schemas in `#/components/schemas`',
  )
  .option(
    '--additional-props-default-value [value]',
    'Set default value when additionalProperties is not provided. Default to true.',
    true,
  )
  .option(
    '--strict-objects [value]',
    "Use strict validation for objects so we don't allow unknown keys. Defaults to false.",
    false,
  )
  .option(
    '--no-client',
    'Generate schemas and metadata without HTTP client (auto-switches to schemas-with-metadata template). Perfect for using your own HTTP client (fetch, axios, etc.) while maintaining full Zod validation.',
  )
  .option(
    '--with-validation-helpers',
    'Generate validation helper functions (validateRequest, validateResponse) for manual request/response validation. Only applicable when using --no-client or schemas-with-metadata template.',
  )
  .option(
    '--with-schema-registry',
    'Generate schema registry builder function for dynamic schema access with optional key sanitization. Useful for SDK generation or runtime schema lookup. Only applicable when using --no-client or schemas-with-metadata template.',
  )
  .action(async (input: string, options: CliOptions) => {
    console.log('Retrieving OpenAPI document from', input);
    const bundled: unknown = await SwaggerParser.bundle(input);
    if (!isOpenAPIObject(bundled)) {
      throw new Error(
        `Invalid OpenAPI document: missing required properties (openapi, info, paths)`,
      );
    }
    const openApiDoc = bundled;
    const prettierConfig = await resolveConfig(options.prettier ?? './');
    const distPath = options.output ?? input + '.client.ts';

    const parsedOptions = parseCliOptions(options);
    const generationOptions = buildGenerationOptions(options, parsedOptions);
    const generationArgs = buildGenerationArgs(
      openApiDoc,
      distPath,
      prettierConfig,
      options,
      generationOptions,
    );

    await generateZodClientFromOpenAPI(generationArgs);
    console.log(`Done generating <${distPath}> !`);
  });

program.parse();
