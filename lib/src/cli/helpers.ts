import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { resolveConfig } from 'prettier';
import type { OpenAPIDocument } from '../shared/openapi-types.js';

import type { GenerateZodClientFromOpenApiArgs } from '../rendering/index.js';
import {
  hasVersionProperty,
  isGroupStrategy,
  isDefaultStatusBehavior,
} from '../validation/cli-type-guards.js';
import type { TemplateContextOptions } from '../schema-processing/context/index.js';
import {
  buildGenerationOptions,
  type CliOptions,
  type ParsedCliOptions,
} from './helpers.options.js';
import { fileURLToPath } from 'node:url';

// Re-export for use by cli.ts
export type { CliOptions };
export { buildGenerationOptions };

const packageJsonPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json');
const TEMPLATE_SCHEMAS_ONLY = 'schemas-only';
const TEMPLATE_SCHEMAS_WITH_METADATA = 'schemas-with-metadata';

/**
 * Get package version from package.json.
 * @returns Package version string or "0.0.0" if not found
 * @internal
 */
export function getPackageVersion(): string {
  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const parsed: unknown = JSON.parse(packageJsonContent);
    if (hasVersionProperty(parsed) && typeof parsed.version === 'string') {
      return parsed.version;
    }
    return '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const GROUP_STRATEGY_ALLOWED_VALUES = 'none, tag, method, tag-file, method-file';
const DEFAULT_STATUS_ALLOWED_VALUES = 'spec-compliant, auto-correct';

function parseGroupStrategy(value: string | undefined): ParsedCliOptions['groupStrategy'] {
  if (value === undefined) {
    return undefined;
  }
  if (isGroupStrategy(value)) {
    return value;
  }
  throw new Error(
    `Invalid --group-strategy value '${value}'. Allowed values: ${GROUP_STRATEGY_ALLOWED_VALUES}.`,
  );
}

function parseDefaultStatusBehavior(
  value: string | undefined,
): ParsedCliOptions['defaultStatusBehavior'] {
  if (value === undefined) {
    return undefined;
  }
  if (isDefaultStatusBehavior(value)) {
    return value;
  }
  throw new Error(
    `Invalid --default-status value '${value}'. Allowed values: ${DEFAULT_STATUS_ALLOWED_VALUES}.`,
  );
}

function parseComplexityThreshold(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (value.length === 0 || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error(
      `Invalid --complexity-threshold value '${value}'. Expected a non-negative integer.`,
    );
  }
  return parsed;
}

/**
 * Parse and validate CLI options (groupStrategy, complexityThreshold, defaultStatus).
 *
 * Distinguishes "not provided" (returns `undefined` for that option) from
 * "provided-but-invalid" (throws an actionable error listing allowed values) —
 * a mistyped value must never be silently dropped.
 *
 * @param options - Raw CLI options
 * @returns Parsed and validated options
 * @internal
 */
export function parseCliOptions(options: CliOptions): ParsedCliOptions {
  return {
    groupStrategy: parseGroupStrategy(options.groupStrategy),
    complexityThreshold: parseComplexityThreshold(options.complexityThreshold),
    defaultStatusBehavior: parseDefaultStatusBehavior(options.defaultStatus),
  };
}

/**
 * Type guard to check if a template string is a valid template name.
 * @param template - Template string to check
 * @returns True if template is a valid template name
 * @internal
 */
export function isTemplateName(
  template: string | undefined,
): template is 'schemas-only' | 'schemas-with-metadata' {
  return template === TEMPLATE_SCHEMAS_ONLY || template === TEMPLATE_SCHEMAS_WITH_METADATA;
}

/**
 * Build generation args from CLI options and parsed data.
 *
 * @param openApiDoc - Parsed OpenAPI document (required for CLI path)
 * @param distPath - Output file path
 * @param prettierConfig - Prettier configuration
 * @param options - CLI options
 * @param generationOptions - Generation options
 * @returns Complete generation arguments
 * @internal
 */
export function buildGenerationArgs(
  openApiDoc: OpenAPIDocument,
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
    ...(options.template && isTemplateName(options.template) && { template: options.template }),
    ...(options.noClient && { noClient: options.noClient }),
    ...(options.withValidationHelpers && {
      withValidationHelpers: options.withValidationHelpers,
    }),
    ...(options.withSchemaRegistry && { withSchemaRegistry: options.withSchemaRegistry }),
  };

  return generationArgs;
}
