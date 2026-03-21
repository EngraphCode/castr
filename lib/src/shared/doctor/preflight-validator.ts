/**
 * Preflight OpenAPI validator with `allErrors: true`.
 *
 * This module provides a repo-local AJV validator that uses the same OpenAPI 3.1.x
 * JSON Schema that `@scalar/openapi-parser` uses internally, but configured with
 * `allErrors: true` to harvest ALL validation errors in a single pass.
 *
 * This avoids the one-error-per-pass bottleneck of Scalar's validator (which uses
 * AJV's default `allErrors: false`) and enables batch rescue of non-standard properties.
 *
 * @module
 * @internal
 */

import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import Ajv2020Factory from 'ajv/dist/2020.js';
import addFormatsFactory from 'ajv-formats/dist/index.js';
import type { AnySchemaObject, ValidateFunction } from 'ajv';

type Ajv2020Constructor = typeof Ajv2020Factory.default;
type AjvInstance = InstanceType<Ajv2020Constructor>;

/**
 * Preflight validation error with the AJV error shape we need for rescue.
 */
export interface PreflightValidationError {
  readonly message: string;
  readonly instancePath: string;
  readonly keyword: string;
  readonly params: Readonly<PreflightErrorParams>;
}

export interface PreflightValidationResult {
  readonly valid: boolean;
  readonly errors: readonly PreflightValidationError[];
}

/**
 * Params shape from AJV validation errors.
 * Uses a named type to satisfy both no-Record-string-unknown and consistent-indexed-object-style rules.
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface PreflightErrorParams {
  readonly [key: string]: unknown;
}

function isAnySchemaObject(value: unknown): value is AnySchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasDefaultExport(value: unknown): value is { readonly default: unknown } {
  return typeof value === 'object' && value !== null && 'default' in value;
}

/**
 * Lazily compiled AJV validator with `allErrors: true`.
 */
let cachedValidator: ValidateFunction | undefined;

async function getOpenApi31Schema(): Promise<AnySchemaObject> {
  // Resolve the @scalar/openapi-parser package root via its public entrypoint,
  // then navigate to the bundled OpenAPI 3.1 schema on disk.
  const require = createRequire(import.meta.url);
  const scalarEntrypoint = require.resolve('@scalar/openapi-parser');
  const scalarDist = dirname(scalarEntrypoint);
  const schemaPath = resolve(scalarDist, 'schemas', 'v3.1', 'schema.js');

  // Use dynamic import with file:// URL to load the ESM schema module,
  // bypassing the package exports map.
  const schemaModule: unknown = await import(pathToFileURL(schemaPath).href);
  const moduleObj: unknown = hasDefaultExport(schemaModule) ? schemaModule.default : schemaModule;

  if (!isAnySchemaObject(moduleObj)) {
    throw new Error('Failed to load OpenAPI 3.1 schema from @scalar/openapi-parser');
  }
  return moduleObj;
}

async function compileValidator(): Promise<ValidateFunction> {
  if (cachedValidator) {
    return cachedValidator;
  }

  const schema = await getOpenApi31Schema();

  const ajv: AjvInstance = new Ajv2020Factory.default({
    strict: false,
    allErrors: true,
  });

  addFormatsFactory.default(ajv);

  // OpenAPI 3.1 uses media-range format
  ajv.addFormat('media-range', true);

  const validator = ajv.compile(schema);
  cachedValidator = validator;
  return validator;
}

function buildPreflightError(e: {
  readonly message?: string;
  readonly instancePath: string;
  readonly keyword: string;
  readonly params: PreflightErrorParams;
}): PreflightValidationError {
  return {
    message: typeof e.message === 'string' ? e.message : 'Unknown error',
    instancePath: e.instancePath,
    keyword: e.keyword,
    params: e.params,
  };
}

/**
 * Validate a document against the OpenAPI 3.1 schema with `allErrors: true`.
 *
 * Returns ALL validation errors in a single pass, enabling batch rescue
 * of non-standard properties without repeated revalidation.
 */
export async function preflightValidate(document: unknown): Promise<PreflightValidationResult> {
  const validator = await compileValidator();
  const valid = validator(document);

  if (valid || !validator.errors || validator.errors.length === 0) {
    return { valid: true, errors: [] };
  }

  const errors: PreflightValidationError[] = validator.errors.map(buildPreflightError);
  return { valid: false, errors };
}
