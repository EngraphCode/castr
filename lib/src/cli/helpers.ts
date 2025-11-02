import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { resolveConfig } from 'prettier';

import type {
  GenerateZodClientFromOpenApiArgs,
  generateZodClientFromOpenAPI,
} from '../rendering/index.js';
import {
  hasVersionProperty,
  isGroupStrategy,
  isDefaultStatusBehavior,
} from '../validation/cli-type-guards.js';
import type { TemplateContextOptions } from '../context/index.js';
import { buildGenerationOptions, type CliOptions } from './helpers.options.js';

// Re-export for use by cli.ts
export type { CliOptions };
export { buildGenerationOptions };

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
