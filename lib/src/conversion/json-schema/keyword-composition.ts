import type { SchemaObject } from 'openapi3-ts/oas31';

import {
  assignIfDefined,
  setKeyword,
  toSchemaLike,
  toSchemaLikeArray,
  type Converter,
  type MutableJsonSchema,
} from './keyword-helpers.js';

export function applyCompositionKeywords(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  assignIfDefined(schema.allOf, (value) => {
    const schemas = toSchemaLikeArray(value);
    if (schemas !== undefined) {
      setKeyword(
        target,
        'allOf',
        schemas.map((subSchema) => convert(subSchema)),
      );
    }
  });

  assignIfDefined(schema.anyOf, (value) => {
    const schemas = toSchemaLikeArray(value);
    if (schemas !== undefined) {
      setKeyword(
        target,
        'anyOf',
        schemas.map((subSchema) => convert(subSchema)),
      );
    }
  });

  assignIfDefined(schema.oneOf, (value) => {
    const schemas = toSchemaLikeArray(value);
    if (schemas !== undefined) {
      setKeyword(
        target,
        'oneOf',
        schemas.map((subSchema) => convert(subSchema)),
      );
    }
  });

  if (schema.not !== undefined) {
    const negatedSchema = toSchemaLike(schema.not);
    if (negatedSchema !== undefined) {
      setKeyword(target, 'not', convert(negatedSchema));
    }
  }
}
