import type { SourceFile } from 'ts-morph';
import {
  assertDistinctSafeSchemaNames,
  safeSchemaName,
} from '../../../shared/utils/identifier-utils.js';

const REQUEST_INPUT_TYPE = `{
    pathParams?: unknown;
    queryParams?: unknown;
    queryString?: unknown;
    headers?: unknown;
    body?: unknown;
  }`;

const REQUEST_RETURN_TYPE = `{
  pathParams?: unknown;
  queryParams?: unknown;
  queryString?: unknown;
  headers?: unknown;
  body?: unknown;
}`;

export function addValidationHelpers(sourceFile: SourceFile): void {
  addValidateRequestHelper(sourceFile);
  addValidateResponseHelper(sourceFile);
}

function addValidateRequestHelper(sourceFile: SourceFile): void {
  sourceFile.addFunction({
    name: 'validateRequest',
    isExported: true,
    typeParameters: [{ name: 'T', constraint: '(typeof endpoints)[number]' }],
    parameters: [
      { name: 'endpoint', type: 'T' },
      { name: 'input', type: REQUEST_INPUT_TYPE },
    ],
    returnType: REQUEST_RETURN_TYPE,
    statements: `
  const result: Record<string, unknown> = {};
  
  if (endpoint.request.pathParams && input.pathParams !== undefined) {
    result.pathParams = endpoint.request.pathParams.parse(input.pathParams);
  }
  if (endpoint.request.queryParams && input.queryParams !== undefined) {
    result.queryParams = endpoint.request.queryParams.parse(input.queryParams);
  }
  if (endpoint.request.queryString && input.queryString !== undefined) {
    result.queryString = endpoint.request.queryString.parse(input.queryString);
  }
  if (endpoint.request.headers && input.headers !== undefined) {
    result.headers = endpoint.request.headers.parse(input.headers);
  }
  if (endpoint.request.body && input.body !== undefined) {
    result.body = endpoint.request.body.parse(input.body);
  }
  
  return result;`,
    docs: [
      {
        description: `Validates request parameters against endpoint schema.
 * 
 * Uses \`.parse()\` for fail-fast validation (throws on error). Each parameter type
 * (path, query, queryString, headers, body) is validated individually against the endpoint's schema.
 * 
 * @throws {z.ZodError} When validation fails`,
      },
    ],
  });
}

function addValidateResponseHelper(sourceFile: SourceFile): void {
  sourceFile.addFunction({
    name: 'validateResponse',
    isExported: true,
    typeParameters: [
      { name: 'T', constraint: '(typeof endpoints)[number]' },
      { name: 'S', constraint: 'keyof T["responses"] & number' },
    ],
    parameters: [
      { name: 'endpoint', type: 'T' },
      { name: 'status', type: 'S' },
      { name: 'data', type: 'unknown' },
    ],
    returnType: 'unknown',
    statements: `
  const responseSchema = endpoint.responses[status];
  if (!responseSchema) {
    throw new Error(\`No schema defined for status \${status} on \${endpoint.method.toUpperCase()} \${endpoint.path}\`);
  }
  return responseSchema.schema.parse(data);`,
    docs: [
      {
        description: `Validates response data against endpoint schema for given status code.`,
      },
    ],
  });
}

/**
 * Compute the default rename entries for the generated schema registry.
 *
 * Every entry is produced by the canonical {@link safeSchemaName} seam — the
 * SAME function that names the emitted schema symbols — so registry keys are
 * guaranteed to match the generated code symbols. Only names the seam actually
 * changes are included; all other names pass through unchanged, which is
 * exactly `safeSchemaName`'s output for them.
 *
 * Returned as entry tuples (emitted into a `Map`) rather than a plain-object
 * literal: component names are user-controlled, and plain-object storage
 * cannot faithfully carry keys that collide with `Object.prototype` members
 * (`__proto__`, `constructor`, `toString`, ...).
 *
 * @internal
 */
function computeDefaultRenameEntries(componentNames: readonly string[]): [string, string][] {
  const entries: [string, string][] = [];
  const sortedNames = [...new Set(componentNames)].sort((left, right) => left.localeCompare(right));
  for (const name of sortedNames) {
    const safeName = safeSchemaName(name);
    if (safeName !== name) {
      entries.push([name, safeName]);
    }
  }
  return entries;
}

export function addSchemaRegistryHelper(
  sourceFile: SourceFile,
  componentNames: readonly string[],
): void {
  // The registry maps emitted symbols back to schemas; a collision between
  // two raw names would leave one key silently validating the wrong schema.
  assertDistinctSafeSchemaNames(componentNames);

  const defaultRenameEntries = computeDefaultRenameEntries(componentNames);

  sourceFile.addFunction({
    name: 'buildSchemaRegistry',
    isExported: true,
    typeParameters: [{ name: 'T', constraint: 'Record<string, z.ZodSchema>' }],
    parameters: [
      { name: 'rawSchemas', type: 'T' },
      { name: 'options', type: '{ rename?: (key: string) => string }', hasQuestionToken: true },
    ],
    returnType: 'Record<string, z.ZodSchema>',
    statements: `
  const DEFAULT_SCHEMA_RENAMES: ReadonlyMap<string, string> = new Map<string, string>(${JSON.stringify(defaultRenameEntries)});
  const rename = options?.rename ?? ((key: string) => DEFAULT_SCHEMA_RENAMES.get(key) ?? key);

  return Object.fromEntries(
    Object.entries(rawSchemas).map(([key, value]): [string, z.ZodSchema] => [rename(key), value]),
  );`,
    docs: [
      {
        description: `Builds a schema registry with sanitized keys for runtime schema lookup.
 *
 * The default rename map is precomputed at generation time from the canonical
 * code-symbol sanitiser, so every schema this file emitted is keyed exactly by
 * its exported symbol name. Names outside the emitted set pass through
 * unchanged. Lookup and registry construction are own-property-safe, so keys
 * colliding with Object.prototype members round-trip faithfully. Pass a
 * custom rename to override the mapping.`,
      },
    ],
  });
}
