import { split } from 'lodash-es';

const OPENAPI_VERSION_SEPARATOR = '.';
const OPENAPI_VERSION_MAJOR_3 = '3';
const OPENAPI_VERSION_MINOR_1 = '1';
const OPENAPI_VERSION_MINOR_2 = '2';
const SUPPORTED_BUNDLED_OPENAPI_MINOR_VERSIONS = new Set([
  OPENAPI_VERSION_MINOR_1,
  OPENAPI_VERSION_MINOR_2,
]);

export const CANONICAL_OPENAPI_VERSION = '3.2.0';
export const CANONICAL_OPENAPI_TARGET_LABEL = 'OpenAPI 3.2';

export type OpenApiPreflightSchemaVersion = '3.1' | '3.2';

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface UnknownKeyedObject {
  readonly [key: string]: unknown;
}

function isRecord(value: unknown): value is UnknownKeyedObject {
  return typeof value === 'object' && value !== null;
}

function getStringProperty(value: UnknownKeyedObject, key: string): string | undefined {
  const propertyValue = value[key];
  return typeof propertyValue === 'string' ? propertyValue : undefined;
}

export interface ParsedOpenApiVersion {
  readonly raw: string;
  readonly major: string;
  readonly minor: string;
  readonly patch?: string;
}

export function parseOpenApiVersion(version: string): ParsedOpenApiVersion {
  const versionSegments = split(version, OPENAPI_VERSION_SEPARATOR);
  const patch = versionSegments[2];

  return {
    raw: version,
    major: versionSegments[0] ?? '',
    minor: versionSegments[1] ?? '',
    ...(patch === undefined ? {} : { patch }),
  };
}

export function isSupportedBundledOpenApiVersion(version: string): boolean {
  const parsedVersion = parseOpenApiVersion(version);
  return (
    parsedVersion.major === OPENAPI_VERSION_MAJOR_3 &&
    SUPPORTED_BUNDLED_OPENAPI_MINOR_VERSIONS.has(parsedVersion.minor)
  );
}

export function detectOpenApiPreflightSchemaVersion(
  document: unknown,
): OpenApiPreflightSchemaVersion | undefined {
  if (!isRecord(document)) {
    return undefined;
  }

  const openapiVersion = getStringProperty(document, 'openapi');
  if (openapiVersion === undefined) {
    return undefined;
  }

  const parsedVersion = parseOpenApiVersion(openapiVersion);
  if (parsedVersion.major !== OPENAPI_VERSION_MAJOR_3) {
    return undefined;
  }

  if (parsedVersion.minor === OPENAPI_VERSION_MINOR_1) {
    return '3.1';
  }

  if (parsedVersion.minor === OPENAPI_VERSION_MINOR_2) {
    return '3.2';
  }

  return undefined;
}
