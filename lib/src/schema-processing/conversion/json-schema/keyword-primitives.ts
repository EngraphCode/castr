import type { SchemaObject } from 'openapi3-ts/oas31';

import {
  assignIfDefined,
  isLegacyExclusiveValue,
  isNumericSchema,
  setKeyword,
  type MutableJsonSchema,
} from './keyword-helpers.js';
import { SCHEMA_TYPE_STRING } from './json-schema-constants.js';

export function applyTypeInformation(schema: SchemaObject, target: MutableJsonSchema): void {
  if (typeof schema.type === 'string') {
    target['type'] = schema.type;
  }

  assignIfDefined(schema.enum, (value) => {
    setKeyword(target, 'enum', value);
  });

  assignIfDefined(schema.const, (value) => {
    setKeyword(target, 'const', value);
  });
}

export function applyStringKeywords(schema: SchemaObject, target: MutableJsonSchema): void {
  if (schema.type !== SCHEMA_TYPE_STRING) {
    return;
  }

  assignIfDefined(schema.minLength, (value) => {
    setKeyword(target, 'minLength', value);
  });

  assignIfDefined(schema.maxLength, (value) => {
    setKeyword(target, 'maxLength', value);
  });

  assignIfDefined(schema.pattern, (value) => {
    setKeyword(target, 'pattern', value);
  });

  assignIfDefined(schema.format, (value) => {
    setKeyword(target, 'format', value);
  });
}

export function applyNumericKeywords(schema: SchemaObject, target: MutableJsonSchema): void {
  if (!isNumericSchema(schema)) {
    return;
  }

  assignIfDefined(schema.multipleOf, (value) => {
    setKeyword(target, 'multipleOf', value);
  });

  applyMinimum(schema, target);
  applyMaximum(schema, target);
}

function applyMinimum(schema: SchemaObject, target: MutableJsonSchema): void {
  let minimum = schema.minimum;

  if (typeof schema.exclusiveMinimum === 'number') {
    setKeyword(target, 'exclusiveMinimum', schema.exclusiveMinimum);
    minimum = undefined;
  } else if (isLegacyExclusiveValue(schema.exclusiveMinimum) && minimum !== undefined) {
    setKeyword(target, 'exclusiveMinimum', minimum);
    minimum = undefined;
  }

  assignIfDefined(minimum, (value) => {
    setKeyword(target, 'minimum', value);
  });
}

function applyMaximum(schema: SchemaObject, target: MutableJsonSchema): void {
  let maximum = schema.maximum;

  if (typeof schema.exclusiveMaximum === 'number') {
    setKeyword(target, 'exclusiveMaximum', schema.exclusiveMaximum);
    maximum = undefined;
  } else if (isLegacyExclusiveValue(schema.exclusiveMaximum) && maximum !== undefined) {
    setKeyword(target, 'exclusiveMaximum', maximum);
    maximum = undefined;
  }

  assignIfDefined(maximum, (value) => {
    setKeyword(target, 'maximum', value);
  });
}
