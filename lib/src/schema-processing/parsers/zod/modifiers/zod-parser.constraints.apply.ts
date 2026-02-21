import type { CastrSchema } from '../../../ir/index.js';
import type { ParsedConstraints } from './zod-parser.constraints.js';

function applyStringConstraints(schema: CastrSchema, constraints: ParsedConstraints): void {
  if (constraints.minLength !== undefined) {
    schema.minLength = constraints.minLength;
  }
  if (constraints.maxLength !== undefined) {
    schema.maxLength = constraints.maxLength;
  }
  if (constraints.pattern !== undefined) {
    schema.pattern = constraints.pattern;
  }
  if (constraints.format !== undefined) {
    schema.format = constraints.format;
  }
  if (constraints.contentEncoding !== undefined) {
    schema.contentEncoding = constraints.contentEncoding;
  }
}

function applyNumberConstraints(schema: CastrSchema, constraints: ParsedConstraints): void {
  if (constraints.minimum !== undefined) {
    schema.minimum = constraints.minimum;
  }
  if (constraints.maximum !== undefined) {
    schema.maximum = constraints.maximum;
  }
  if (constraints.exclusiveMinimum !== undefined) {
    schema.exclusiveMinimum = constraints.exclusiveMinimum;
  }
  if (constraints.exclusiveMaximum !== undefined) {
    schema.exclusiveMaximum = constraints.exclusiveMaximum;
  }
  if (constraints.multipleOf !== undefined) {
    schema.multipleOf = constraints.multipleOf;
  }
}

export function applyConstraints(schema: CastrSchema, constraints: ParsedConstraints): void {
  applyStringConstraints(schema, constraints);
  applyNumberConstraints(schema, constraints);
}

export function applyOptionalFields(
  schema: CastrSchema,
  defaultValue: unknown,
  description: string | undefined,
): void {
  if (defaultValue !== undefined) {
    schema.default = defaultValue;
  }
  if (description !== undefined) {
    schema.description = description;
  }
}
