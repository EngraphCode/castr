import type { SchemaObject } from '../../../../shared/openapi-types.js';

import {
  assignIfDefined,
  readSchemaKeyword,
  setKeyword,
  toSchemaLike,
  toSchemaLikeArray,
  type Converter,
  type MutableJsonSchema,
  type SchemaLike,
} from './keyword-helpers.js';
import {
  RESULT_KIND_ARRAY,
  RESULT_KIND_BOOLEAN,
  RESULT_KIND_SCHEMA,
  SCHEMA_TYPE_ARRAY,
} from '../json-schema-constants.js';

type ItemsKeywordResult =
  | { kind: typeof RESULT_KIND_BOOLEAN; value: boolean }
  | { kind: typeof RESULT_KIND_ARRAY; value: SchemaLike[] }
  | { kind: typeof RESULT_KIND_SCHEMA; value: SchemaLike }
  | undefined;

export function applyArrayKeywords(
  schema: SchemaObject,
  target: MutableJsonSchema,
  convert: Converter,
): void {
  rejectUnevaluatedItems(schema);

  if (!isArrayLikeSchema(schema)) {
    return;
  }

  target['type'] = SCHEMA_TYPE_ARRAY;

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
}

function isArrayLikeSchema(schema: SchemaObject): boolean {
  return (
    schema.type === SCHEMA_TYPE_ARRAY ||
    readPrefixItems(schema) !== undefined ||
    readItemsKeyword(schema) !== undefined
  );
}

/**
 * Fail fast on `unevaluatedItems` (L14, array-side parity).
 *
 * Like `unevaluatedProperties`, `unevaluatedItems` is composition-aware:
 * it applies only to items not evaluated by `prefixItems`/`items`/
 * `contains` in the same schema or by in-place applicator members
 * (`allOf`/`oneOf`/`anyOf`). Draft 07's `additionalItems` is local-only
 * and is ignored entirely unless `items` is tuple-form, so downgrading
 * either changes validation semantics or emits a dead keyword. The
 * downgrade is rejected instead of applied.
 */
function rejectUnevaluatedItems(schema: SchemaObject): void {
  if (readSchemaKeyword(schema, 'unevaluatedItems') === undefined) {
    return;
  }

  throw new Error(
    'Cannot convert unevaluatedItems to JSON Schema Draft 07: the target dialect has no ' +
      'composition-aware equivalent, and downgrading it to additionalItems would change ' +
      'validation semantics (additionalItems is ignored without tuple-form items). Remove ' +
      'the keyword or express the constraint with tuple items and additionalItems directly.',
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
    case RESULT_KIND_BOOLEAN: {
      if (!items.value) {
        setKeyword(target, 'items', []);
        setKeyword(target, 'additionalItems', false);
      } else {
        setKeyword(target, 'additionalItems', true);
      }
      break;
    }
    case RESULT_KIND_ARRAY: {
      setKeyword(
        target,
        'items',
        items.value.map((item) => convert(item)),
      );
      break;
    }
    case RESULT_KIND_SCHEMA: {
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

  if (tupleItems.kind === RESULT_KIND_BOOLEAN) {
    if (!tupleItems.value) {
      setKeyword(target, 'additionalItems', false);
    }
    return;
  }

  if (tupleItems.kind === RESULT_KIND_SCHEMA) {
    setKeyword(target, 'additionalItems', convert(tupleItems.value));
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
    return { kind: RESULT_KIND_BOOLEAN, value: candidate };
  }

  const arrayItems = toSchemaLikeArray(candidate);
  if (arrayItems !== undefined) {
    return { kind: RESULT_KIND_ARRAY, value: arrayItems };
  }

  const schemaLike = toSchemaLike(candidate);
  return schemaLike === undefined ? undefined : { kind: RESULT_KIND_SCHEMA, value: schemaLike };
}
