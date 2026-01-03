import { toBoolean } from '../shared/utils/index.js';
import type { TemplateContextOptions } from '../context/index.js';
import type { parseCliOptions } from './helpers.js';

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
  emitMcpManifest?: string;
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
