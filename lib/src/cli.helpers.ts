import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { resolveConfig } from 'prettier';

import { toBoolean } from './utils.js';
import type {
  GenerateZodClientFromOpenApiArgs,
  generateZodClientFromOpenAPI,
} from './generateZodClientFromOpenAPI.js';
import { hasVersionProperty, isGroupStrategy, isDefaultStatusBehavior } from './cli-type-guards.js';
import type { TemplateContextOptions } from './template-context.js';

/**
 * CLI options interface matching commander option definitions.
 * @internal
 */
export interface CliOptions {
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

/**
 * Get package version from package.json.
 * @returns Package version string or "0.0.0" if not found
 * @internal
 */
export function getPackageVersion(): string {
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
 * Parse and validate CLI options (groupStrategy, complexityThreshold, defaultStatus).
 * @param options - Raw CLI options
 * @returns Parsed and validated options
 * @internal
 */
export function parseCliOptions(options: CliOptions): {
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
 * Add optional string properties to generation options.
 * @param options - CLI options
 * @param generationOptions - Generation options to modify
 * @internal
 */
export function addStringOptions(
  options: CliOptions,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  if (options.baseUrl) {
    generationOptions.baseUrl = options.baseUrl;
  }
  if (options.apiClientName) {
    generationOptions.apiClientName = options.apiClientName;
  }
  if (options.errorExpr) {
    generationOptions.isErrorStatus = options.errorExpr;
  }
  if (options.successExpr) {
    generationOptions.isMainResponseStatus = options.successExpr;
  }
  if (options.mediaTypeExpr) {
    generationOptions.isMediaTypeAllowed = options.mediaTypeExpr;
  }
}

/**
 * Add optional boolean properties to generation options.
 * @param options - CLI options
 * @param generationOptions - Generation options to modify
 * @internal
 */
export function addBooleanOptions(
  options: CliOptions,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  if (options.exportSchemas) {
    generationOptions.shouldExportAllSchemas = options.exportSchemas;
  }
  if (options.exportTypes) {
    generationOptions.shouldExportAllTypes = options.exportTypes;
  }
  if (options.implicitRequired) {
    generationOptions.withImplicitRequiredProps = options.implicitRequired;
  }
  if (options.withDeprecated) {
    generationOptions.withDeprecatedEndpoints = options.withDeprecated;
  }
}

/**
 * Add parsed options to generation options.
 * @param parsedOptions - Parsed CLI options
 * @param generationOptions - Generation options to modify
 * @internal
 */
export function addParsedOptions(
  parsedOptions: ReturnType<typeof parseCliOptions>,
  generationOptions: Partial<TemplateContextOptions>,
): void {
  const { groupStrategy, complexityThreshold, defaultStatusBehavior } = parsedOptions;
  if (groupStrategy) {
    generationOptions.groupStrategy = groupStrategy;
  }
  if (complexityThreshold !== undefined) {
    generationOptions.complexityThreshold = complexityThreshold;
  }
  if (defaultStatusBehavior) {
    generationOptions.defaultStatusBehavior = defaultStatusBehavior;
  }
}

/**
 * Build generation options from CLI options.
 * Only includes defined values to satisfy exactOptionalPropertyTypes.
 *
 * @param options - CLI options
 * @param parsedOptions - Parsed CLI options
 * @returns Generation options for the generator
 * @internal
 */
export function buildGenerationOptions(
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
  if (options.withDocs) {
    generationOptions.withDocs = options.withDocs;
  }
  if (options.withDescription) {
    generationOptions.withDescription = options.withDescription;
  }
  if (options.allReadonly) {
    generationOptions.allReadonly = options.allReadonly;
  }
  if (options.strictObjects) {
    generationOptions.strictObjects = options.strictObjects;
  }
  addParsedOptions(parsedOptions, generationOptions);

  return generationOptions;
}

/**
 * Type guard to check if a template string is a valid template name.
 * @param template - Template string to check
 * @returns True if template is a valid template name
 * @internal
 */
export function isTemplateName(
  template: string | undefined,
): template is 'schemas-only' | 'schemas-with-metadata' | 'schemas-with-client' {
  return (
    template === 'schemas-only' ||
    template === 'schemas-with-metadata' ||
    template === 'schemas-with-client'
  );
}

/**
 * Build generation args from CLI options and parsed data.
 *
 * @param openApiDoc - Parsed OpenAPI document
 * @param distPath - Output file path
 * @param prettierConfig - Prettier configuration
 * @param options - CLI options
 * @param generationOptions - Generation options
 * @returns Complete generation arguments
 * @internal
 */
export function buildGenerationArgs(
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
