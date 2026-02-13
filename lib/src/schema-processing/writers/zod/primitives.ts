/**
 * Zod Writer - Primitive Schema Types
 *
 * Handles generation of Zod schemas for primitive types (string, number, integer, boolean, null).
 * Uses Zod 4 format-specific functions for improved precision and tree-shakability.
 *
 * @module writers/zod/primitives
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';

/**
 * Write Zod schema for primitive types.
 *
 * @param schema - The CastrSchema to write
 * @param writer - The ts-morph writer
 * @returns true if schema was a primitive type, false otherwise
 *
 * @internal
 */
export function writePrimitiveSchema(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  switch (schema.type) {
    case 'string':
      writeStringSchema(schema, writer);
      return true;
    case 'number':
      writer.write('z.number()');
      return true;
    case 'integer':
      writeIntegerSchema(schema, writer);
      return true;
    case 'boolean':
      writer.write('z.boolean()');
      return true;
    case 'null':
      writer.write('z.null()');
      return true;
    default:
      return false;
  }
}

/**
 * Write integer schema with format-specific Zod 4 functions.
 *
 * - int32 → z.int32() (range: [-2147483648, 2147483647])
 * - int64 → z.int64() (returns bigint with int64 bounds)
 * - default → z.int() (safe integer range)
 *
 * @internal
 */
function writeIntegerSchema(schema: CastrSchema, writer: CodeBlockWriter): void {
  switch (schema.format) {
    case 'int32':
      writer.write('z.int32()');
      break;
    case 'int64':
      // Warning: z.int64() returns bigint, not number
      // This may require downstream type handling
      writer.write('z.int64()');
      break;
    default:
      writer.write('z.int()');
      break;
  }
}

/**
 * Maps OpenAPI string formats to their Zod 4 function equivalents.
 * @internal
 */
const STRING_FORMAT_TO_ZOD: Readonly<Record<string, string>> = {
  email: 'z.email()',
  uri: 'z.url()',
  url: 'z.url()',
  uuid: 'z.uuidv4()',
  date: 'z.iso.date()',
  'date-time': 'z.iso.datetime()',
  time: 'z.iso.time()',
  duration: 'z.iso.duration()',
  ipv4: 'z.ipv4()',
  ipv6: 'z.ipv6()',
};

/**
 * Write string schema with format-specific Zod 4 functions.
 *
 * Zod 4 provides top-level format functions that are more tree-shakable
 * and replace the deprecated z.string().email() syntax.
 *
 * @internal
 */
function writeStringSchema(schema: CastrSchema, writer: CodeBlockWriter): void {
  const zodCall = schema.format !== undefined ? STRING_FORMAT_TO_ZOD[schema.format] : undefined;
  writer.write(zodCall ?? 'z.string()');
}

/**
 * Filter out validations that are already included in Zod 4 format functions.
 *
 * Zod 4 format functions like z.int(), z.email(), z.url() already include
 * the validation. We skip these to avoid duplicates like z.int().int().
 *
 * @internal
 */
export function filterRedundantValidations(validations: string[], schema: CastrSchema): string[] {
  return validations.filter((v) => {
    // Integer: z.int() already includes .int() validation
    if (schema.type === 'integer' && v === '.int()') {
      return false;
    }

    // String formats: format functions already include validation
    if (schema.type === 'string' && schema.format) {
      const formatToValidation: Record<string, string> = {
        email: '.email()',
        uuid: '.uuid()',
        uri: '.url()',
        url: '.url()',
        'date-time': '.datetime()',
        ipv4: '.ip({ version: "v4" })',
        ipv6: '.ip({ version: "v6" })',
      };

      if (formatToValidation[schema.format] === v) {
        return false;
      }
    }

    return true;
  });
}
