/**
 * Zod 4 format and encoding inference.
 *
 * Maps Zod 4-specific primitive method names to OpenAPI format/encoding values.
 * Extracted from zod-parser.primitives.ts to reduce file size.
 *
 * @module parsers/zod/zod4-formats
 */

import type { CastrSchema } from '../../ir/schema.js';

/**
 * Maps Zod 4 primitive names to their OpenAPI format strings.
 * @internal
 */
const FORMAT_MAP: Readonly<Record<string, string>> = {
  int32: 'int32',
  int64: 'int64',
  float32: 'float',
  float64: 'double',
  'iso.date': 'date',
  'iso.datetime': 'date-time',
  'iso.time': 'time',
  'iso.duration': 'duration',
  uuidv4: 'uuid',
  email: 'email',
  url: 'uri',
  uuid: 'uuid',
  ipv4: 'ipv4',
  ipv6: 'ipv6',
  hostname: 'hostname',
};

/**
 * Maps Zod 4 primitive names to their content encoding strings.
 * @internal
 */
const ENCODING_MAP: Readonly<Record<string, string>> = {
  base64: 'base64',
  base64url: 'base64url',
};

/**
 * Apply inferred format/encoding from Zod 4 primitive name.
 * @internal
 */
export function applyZod4Formats(schema: CastrSchema, baseMethod: string): void {
  const format = FORMAT_MAP[baseMethod];
  if (format) {
    schema.format = format;
  }

  const encoding = ENCODING_MAP[baseMethod];
  if (encoding) {
    schema.contentEncoding = encoding;
  }
}
