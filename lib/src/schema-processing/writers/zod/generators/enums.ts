/**
 * Enum Schema Writing
 *
 * Pure functions for writing Zod enum schemas.
 * Extracted from index.ts to reduce file size.
 *
 * @module writers/zod/enums
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchemaContext } from '../../../ir/index.js';

/**
 * Write a Zod enum schema from a CastrSchema with enum values.
 *
 * Handles three cases:
 * 1. Single enum value → z.literal(value)
 * 2. All string values → z.enum([...])
 * 3. Mixed types → z.union([z.literal(...), ...])
 *
 * @param context - Schema context with enum values
 * @param writer - ts-morph writer for code output
 *
 * @internal
 */
export function writeEnumSchema(context: CastrSchemaContext, writer: CodeBlockWriter): void {
  const schema = context.schema;
  if (!schema.enum || schema.enum.length === 0) {
    return;
  }

  // Check if all values are strings
  const allStrings = schema.enum.every((v: unknown) => typeof v === 'string');

  if (schema.enum.length === 1) {
    writeSingleValueEnum(schema.enum[0], writer);
  } else if (allStrings) {
    writeStringEnum(schema.enum, writer);
  } else {
    writeMixedTypeEnum(schema.enum, writer);
  }
}

/**
 * Write a single-value enum as z.literal().
 * @internal
 */
function writeSingleValueEnum(value: unknown, writer: CodeBlockWriter): void {
  writer.write('z.literal(');
  if (typeof value === 'string') {
    writer.quote(value);
  } else {
    writer.write(String(value));
  }
  writer.write(')');
}

/**
 * Write a string-only enum as z.enum([]).
 * @internal
 */
function writeStringEnum(values: unknown[], writer: CodeBlockWriter): void {
  writer.write('z.enum([');
  values.forEach((v, i) => {
    writer.quote(String(v));
    if (i < values.length - 1) {
      writer.write(', ');
    }
  });
  writer.write('])');
}

/**
 * Write a mixed-type enum as z.union([z.literal(), ...]).
 * @internal
 */
function writeMixedTypeEnum(values: unknown[], writer: CodeBlockWriter): void {
  writer.write('z.union([');
  values.forEach((v, i) => {
    writer.write('z.literal(');
    if (typeof v === 'string') {
      writer.quote(v);
    } else {
      writer.write(String(v));
    }
    writer.write(')');
    if (i < values.length - 1) {
      writer.write(', ');
    }
  });
  writer.write('])');
}
