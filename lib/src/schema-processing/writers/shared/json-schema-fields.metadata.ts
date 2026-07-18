/**
 * Shared JSON Schema metadata field writers.
 *
 * Extracted from json-schema-fields.ts to comply with the ADR-036
 * max-lines constraint. Handles annotation keywords that carry no
 * validation semantics.
 *
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import type { JsonSchemaObject } from './json-schema-object.js';

/**
 * Write core metadata (title, description, summary, default, example,
 * examples).
 *
 * `summary` is the OAS 3.1+ reference summary annotation, emitted as a
 * `$ref` sibling; JSON Schema 2020-12 permits it as an unknown annotation
 * keyword.
 * @internal
 */
export function writeCoreMetadata(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.title !== undefined) {
    result.title = schema.title;
  }
  if (schema.description !== undefined) {
    result.description = schema.description;
  }
  if (schema.summary !== undefined) {
    result.summary = schema.summary;
  }
  if (schema.default !== undefined) {
    result.default = schema.default;
  }
  if (schema.example !== undefined) {
    result.example = schema.example;
  }
  if (schema.examples !== undefined) {
    result.examples = schema.examples;
  }
}

/**
 * Write access metadata (deprecated, readOnly, writeOnly).
 * @internal
 */
export function writeAccessMetadata(schema: CastrSchema, result: JsonSchemaObject): void {
  if (schema.deprecated !== undefined) {
    result.deprecated = schema.deprecated;
  }
  if (schema.readOnly !== undefined) {
    result.readOnly = schema.readOnly;
  }
  if (schema.writeOnly !== undefined) {
    result.writeOnly = schema.writeOnly;
  }
}
