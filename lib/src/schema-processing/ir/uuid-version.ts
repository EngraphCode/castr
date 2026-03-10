import type { CastrSchema, IRUuidVersion } from './models/schema.js';

export const UUID_SCHEMA_TYPE = 'string';
export const UUID_SCHEMA_FORMAT = 'uuid';

const VALID_UUID_VERSIONS: readonly IRUuidVersion[] = [1, 3, 4, 5, 6, 7, 8];

export const UUID_V4_PATTERN =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';

export const UUID_V7_PATTERN =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';

const UUID_VERSION_BY_PATTERN: ReadonlyMap<string, IRUuidVersion> = new Map([
  [UUID_V4_PATTERN, 4],
  [UUID_V7_PATTERN, 7],
]);

function formatUuidVersion(version: IRUuidVersion): string {
  return `UUID v${version}`;
}

function assertStringUuidCarrier(schema: CastrSchema, sourceDescription: string): void {
  if (schema.type !== UUID_SCHEMA_TYPE) {
    throw new Error(`${sourceDescription} requires a string schema.`);
  }

  if (schema.format !== undefined && schema.format !== UUID_SCHEMA_FORMAT) {
    throw new Error(
      `${sourceDescription} conflicts with explicit non-UUID format "${schema.format}".`,
    );
  }
}

function applyUuidVersion(
  schema: CastrSchema,
  version: IRUuidVersion,
  sourceDescription: string,
): void {
  assertStringUuidCarrier(schema, sourceDescription);

  if (schema.uuidVersion !== undefined && schema.uuidVersion !== version) {
    throw new Error(
      `${sourceDescription} conflicts with existing ${formatUuidVersion(schema.uuidVersion)} semantics.`,
    );
  }

  schema.format = UUID_SCHEMA_FORMAT;
  schema.uuidVersion = version;
}

export function isIRUuidVersion(value: unknown): value is IRUuidVersion {
  return typeof value === 'number' && VALID_UUID_VERSIONS.some((candidate) => candidate === value);
}

export function inferUuidVersionFromPattern(pattern: string): IRUuidVersion | undefined {
  return UUID_VERSION_BY_PATTERN.get(pattern);
}

export function applyExplicitUuidVersion(schema: CastrSchema, version: IRUuidVersion): void {
  applyUuidVersion(schema, version, `Explicit ${formatUuidVersion(version)}`);
}

export function applyInferredUuidVersionFromPattern(
  schema: CastrSchema,
): IRUuidVersion | undefined {
  if (schema.type !== UUID_SCHEMA_TYPE || schema.pattern === undefined) {
    return undefined;
  }

  const inferredVersion = inferUuidVersionFromPattern(schema.pattern);
  if (inferredVersion === undefined) {
    return undefined;
  }

  applyUuidVersion(
    schema,
    inferredVersion,
    `Pattern-implied ${formatUuidVersion(inferredVersion)}`,
  );

  return inferredVersion;
}
