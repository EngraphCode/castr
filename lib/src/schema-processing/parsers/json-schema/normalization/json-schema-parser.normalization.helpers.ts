import type { JsonSchema2020 } from '../json-schema-parser.types.js';
import type { Draft07Input } from './json-schema-parser.normalization.types.js';
import type { ReferenceObject } from '../../../../shared/openapi-types.js';
import {
  applyClassifiedKeywords,
  applyNumericBounds,
  applyNormalizedItems,
} from './json-schema-parser.normalization.apply.js';

type NormalizeFn = (input: Draft07Input) => JsonSchema2020;

/** Draft 07 input minus the flat keys handled directly by `stripDraft07Keys`. */
type Draft07SubSchemaInput = Omit<
  Draft07Input,
  'definitions' | 'dependencies' | 'exclusiveMinimum' | 'exclusiveMaximum' | 'items'
>;

/**
 * Narrow a normalized Draft 07 input back to a typed `JsonSchema2020`.
 *
 * Destructures every widened keyword (see `Draft07SubSchemaKeywords`) and
 * re-applies it with recursive normalization. Completeness is
 * compiler-enforced: a widened keyword left in the rest-spread fails the
 * `JsonSchema2020` assignment in `rebuildSubSchemaKeywords`.
 */
export function stripDraft07Keys(
  input: Draft07Input,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  const {
    definitions: _definitions,
    dependencies: _dependencies,
    exclusiveMinimum,
    exclusiveMaximum,
    items,
    ...rest
  } = input;

  let result = rebuildSubSchemaKeywords(rest, normalizeDraft07);
  result = applyNumericBounds(result, exclusiveMinimum, exclusiveMaximum);
  return applyNormalizedItems(result, items, normalizeDraft07);
}

/**
 * Re-apply every sub-schema-bearing keyword with recursive normalization,
 * grouped by the value-shape classification on `Draft07SubSchemaKeywords`.
 */
function rebuildSubSchemaKeywords(
  input: Draft07SubSchemaInput,
  normalizeDraft07: NormalizeFn,
): JsonSchema2020 {
  const {
    $defs,
    dependentSchemas,
    properties,
    patternProperties,
    allOf,
    oneOf,
    anyOf,
    prefixItems,
    not,
    propertyNames,
    contains,
    contentSchema,
    additionalProperties,
    if: ifSchema,
    then: thenSchema,
    else: elseSchema,
    unevaluatedProperties,
    unevaluatedItems,
    ...clean
  } = input;

  return applyClassifiedKeywords(
    { ...clean },
    {
      maps: { $defs, dependentSchemas, properties, patternProperties },
      arrays: { allOf, oneOf, anyOf, prefixItems },
      singles: { not, propertyNames, contains, contentSchema },
      boolOrSchemas: {
        additionalProperties,
        if: ifSchema,
        then: thenSchema,
        else: elseSchema,
        unevaluatedProperties,
        unevaluatedItems,
      },
    },
    normalizeDraft07,
  );
}

export function liftDefinitions(input: Draft07Input): Draft07Input {
  if (input.definitions === undefined) {
    return input;
  }
  return { ...input, $defs: { ...(input.$defs ?? {}), ...input.definitions } };
}

export function splitDependencies(input: Draft07Input): Draft07Input {
  if (input.dependencies === undefined) {
    return input;
  }
  const dependentRequired: Record<string, string[]> = {};
  const dependentSchemas: Record<string, Draft07Input | ReferenceObject> = {};

  for (const [key, value] of Object.entries(input.dependencies)) {
    if (Array.isArray(value)) {
      dependentRequired[key] = value;
    } else {
      dependentSchemas[key] = value;
    }
  }

  let result: Draft07Input = { ...input };
  if (Object.keys(dependentRequired).length > 0) {
    result = { ...result, dependentRequired };
  }
  if (Object.keys(dependentSchemas).length > 0) {
    result = { ...result, dependentSchemas };
  }
  return result;
}
