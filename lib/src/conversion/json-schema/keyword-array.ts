import type { SchemaObject } from 'openapi3-ts/oas31';

import {
  assignIfDefined,
  hasJsonSchemaKeyword,
  readSchemaKeyword,
  setKeyword,
  toSchemaLike,
  toSchemaLikeArray,
  type Converter,
  type MutableJsonSchema,
  type SchemaLike,
} from './keyword-helpers.js';

type ItemsKeywordResult =
  | { kind: 'boolean'; value: boolean }
  | { kind: 'array'; value: SchemaLike[] }
  | { kind: 'schema'; value: SchemaLike }
  | undefined;

type UnevaluatedItemsResult =
  | { kind: 'boolean'; value: boolean }
  | { kind: 'schema'; value: SchemaLike }
  | undefined;

export function applyArrayKeywords(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  if (!isArrayLikeSchema(schema)) {
    return;
  }

  target['type'] = 'array';

  const prefixItems = readPrefixItems(schema);
  if (prefixItems !== undefined) {
    setKeyword(
      target,
      'items',
      prefixItems.map((item) => convert(item)),
    );
    applyAdditionalItemsFromTuple(readItemsKeyword(schema), target, convert);
  } else {
    applyItemsKeyword(schema, target, convert);
  }

  assignIfDefined(schema.minItems, (value) => {
    setKeyword(target, 'minItems', value);
  });

  assignIfDefined(schema.maxItems, (value) => {
    setKeyword(target, 'maxItems', value);
  });

  assignIfDefined(schema.uniqueItems, (value) => {
    setKeyword(target, 'uniqueItems', value);
  });

  applyUnevaluatedItems(schema, target, convert);
}

function isArrayLikeSchema(schema: SchemaObject): boolean {
  return (
    schema.type === 'array' ||
    readPrefixItems(schema) !== undefined ||
    readItemsKeyword(schema) !== undefined ||
    readUnevaluatedItems(schema) !== undefined
  );
}

function applyItemsKeyword(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  const items = readItemsKeyword(schema);
  if (items === undefined) {
    return;
  }

  switch (items.kind) {
    case 'boolean': {
      if (!items.value) {
        setKeyword(target, 'items', []);
        setKeyword(target, 'additionalItems', false);
      } else {
        setKeyword(target, 'additionalItems', true);
      }
      break;
    }
    case 'array': {
      setKeyword(
        target,
        'items',
        items.value.map((item) => convert(item)),
      );
      break;
    }
    case 'schema': {
      setKeyword(target, 'items', convert(items.value));
      break;
    }
  }
}

function applyAdditionalItemsFromTuple(
  tupleItems: ItemsKeywordResult,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  if (tupleItems === undefined) {
    return;
  }

  if (tupleItems.kind === 'boolean') {
    if (!tupleItems.value) {
      setKeyword(target, 'additionalItems', false);
    }
    return;
  }

  if (tupleItems.kind === 'schema') {
    setKeyword(target, 'additionalItems', convert(tupleItems.value));
  }
}

function applyUnevaluatedItems(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  if (hasJsonSchemaKeyword(target, 'additionalItems')) {
    return;
  }

  const unevaluatedItems = readUnevaluatedItems(schema);
  if (unevaluatedItems === undefined) {
    return;
  }

  if (unevaluatedItems.kind === 'schema') {
    setKeyword(target, 'additionalItems', convert(unevaluatedItems.value));
  } else if (!unevaluatedItems.value) {
    setKeyword(target, 'additionalItems', false);
  } else {
    setKeyword(target, 'additionalItems', true);
  }
}

function readPrefixItems(schema: SchemaObject): SchemaLike[] | undefined {
  return toSchemaLikeArray(readSchemaKeyword(schema, 'prefixItems'));
}

function readItemsKeyword(schema: SchemaObject): ItemsKeywordResult {
  const candidate = readSchemaKeyword(schema, 'items');
  if (candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'boolean') {
    return { kind: 'boolean', value: candidate };
  }

  const arrayItems = toSchemaLikeArray(candidate);
  if (arrayItems !== undefined) {
    return { kind: 'array', value: arrayItems };
  }

  const schemaLike = toSchemaLike(candidate);
  return schemaLike === undefined ? undefined : { kind: 'schema', value: schemaLike };
}

function readUnevaluatedItems(schema: SchemaObject): UnevaluatedItemsResult {
  const candidate = readSchemaKeyword(schema, 'unevaluatedItems');
  if (candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'boolean') {
    return { kind: 'boolean', value: candidate };
  }

  const schemaLike = toSchemaLike(candidate);
  return schemaLike === undefined ? undefined : { kind: 'schema', value: schemaLike };
}
