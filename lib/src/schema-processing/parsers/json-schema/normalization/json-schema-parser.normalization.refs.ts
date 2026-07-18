import type { ReferenceObject } from '../../../../shared/openapi-types.js';
import { split, join, drop } from 'lodash-es';
import { type UnknownRecord, isRecord } from '../../../../shared/type-utils/types.js';
import type {
  Draft07Input,
  Draft07SubSchemaKeywords,
} from './json-schema-parser.normalization.types.js';

const SLASH = '/';
const DEFINITIONS_REF_LEADING = '#';
const DEFINITIONS_REF_SEGMENT = 'definitions';
const DEFS_SEGMENT = '$defs';
const MINIMUM_REF_SEGMENT_COUNT = 3;
const PREFIX_SEGMENT_COUNT = 2;

export function rewriteRef(input: Draft07Input): Draft07Input {
  if (input.$ref === undefined) {
    return input;
  }
  const rewritten = rewriteRefPath(input.$ref);
  return rewritten === input.$ref ? input : { ...input, $ref: rewritten };
}

export function rewriteRefObject(ref: ReferenceObject): ReferenceObject {
  const rewritten = rewriteRefPath(ref.$ref);
  return rewritten === ref.$ref ? ref : { ...ref, $ref: rewritten };
}

/**
 * Rewrite a Draft 07 `#/definitions/...` pointer to `#/$defs/...` form.
 *
 * Swaps the leading `#/definitions/` prefix regardless of remaining depth,
 * so deep pointers such as `#/definitions/Outer/properties/inner` stay
 * resolvable after `definitions` is lifted to `$defs`.
 */
function rewriteRefPath(path: string): string {
  const segments = split(path, SLASH);
  if (
    segments.length < MINIMUM_REF_SEGMENT_COUNT ||
    segments[0] !== DEFINITIONS_REF_LEADING ||
    segments[1] !== DEFINITIONS_REF_SEGMENT
  ) {
    return path;
  }
  return join(
    [DEFINITIONS_REF_LEADING, DEFS_SEGMENT, ...drop(segments, PREFIX_SEGMENT_COUNT)],
    SLASH,
  );
}

// ---------------------------------------------------------------------------
// Draft 07 dialect guard for `$ref` sibling keywords
// ---------------------------------------------------------------------------

/** `$schema` URIs that declare the Draft 07 dialect. */
const DRAFT_07_SCHEMA_URIS: ReadonlySet<string> = new Set([
  'http://json-schema.org/draft-07/schema#',
  'http://json-schema.org/draft-07/schema',
  'https://json-schema.org/draft-07/schema#',
  'https://json-schema.org/draft-07/schema',
]);

/**
 * Keys that do not count as carried `$ref` siblings: the reference itself
 * plus document/bookkeeping keywords that carry no validation semantics.
 */
const NON_SIBLING_KEYS: ReadonlySet<string> = new Set([
  '$ref',
  '$schema',
  '$id',
  '$comment',
  'definitions',
  '$defs',
]);

/**
 * Traversal shapes of a sub-schema-bearing keyword position: `MAP_SHAPE`
 * values are records whose entry values are sub-schemas; `SCHEMA_SHAPE`
 * values are a sub-schema directly, or an array of sub-schemas
 * (composition lists and the Draft 07 tuple `items` form).
 */
const MAP_SHAPE = 'map';
const SCHEMA_SHAPE = 'schema';
type SubSchemaPositionShape = typeof MAP_SHAPE | typeof SCHEMA_SHAPE;

type SubSchemaPositionKeyword =
  keyof Draft07SubSchemaKeywords | 'definitions' | 'dependencies' | 'items' | 'additionalItems';

/**
 * Every keyword position on {@link Draft07Input} whose value carries
 * sub-schemas, keyed to its traversal shape.
 *
 * Derived from the single keyword-classification source
 * ({@link Draft07SubSchemaKeywords}) plus the flat Draft 07 keys
 * (`definitions`, `dependencies`, `items`, `additionalItems`): the
 * `Record` key type makes the compiler reject this table whenever a
 * classified keyword is added or removed, so the guard cannot drift from
 * the normalization pipeline.
 *
 * Instance-data keywords (`default`, `const`, `enum`, `examples`) are
 * deliberately absent: their values are data, not schemas, so a
 * `$ref`-shaped object inside them is not a reference.
 */
const SUB_SCHEMA_POSITIONS: Readonly<Record<SubSchemaPositionKeyword, SubSchemaPositionShape>> = {
  $defs: MAP_SHAPE,
  definitions: MAP_SHAPE,
  dependentSchemas: MAP_SHAPE,
  dependencies: MAP_SHAPE,
  properties: MAP_SHAPE,
  patternProperties: MAP_SHAPE,
  allOf: SCHEMA_SHAPE,
  oneOf: SCHEMA_SHAPE,
  anyOf: SCHEMA_SHAPE,
  prefixItems: SCHEMA_SHAPE,
  items: SCHEMA_SHAPE,
  additionalItems: SCHEMA_SHAPE,
  not: SCHEMA_SHAPE,
  propertyNames: SCHEMA_SHAPE,
  contains: SCHEMA_SHAPE,
  contentSchema: SCHEMA_SHAPE,
  additionalProperties: SCHEMA_SHAPE,
  if: SCHEMA_SHAPE,
  then: SCHEMA_SHAPE,
  else: SCHEMA_SHAPE,
  unevaluatedProperties: SCHEMA_SHAPE,
  unevaluatedItems: SCHEMA_SHAPE,
};

/**
 * Reject a declared Draft 07 document that places sibling keywords beside
 * `$ref` at any schema position.
 *
 * Draft 07 ignores every keyword beside `$ref`, while 2020-12 applies
 * them. The parser normalises all input to 2020-12 semantics, so carrying
 * siblings out of a document that DECLARES the Draft 07 dialect would
 * silently activate constraints the source dialect treats as dead. This
 * guard rejects that case explicitly instead of reinterpreting the
 * document. Documents that declare 2020-12 — or no dialect — are parsed
 * with 2020-12 semantics (the canonical ingress dialect), where sibling
 * carrying is correct.
 *
 * @throws Error naming the first offending position and the migration
 *   options (remove the siblings, or declare the 2020-12 dialect).
 * @internal
 */
export function assertNoDraft07RefSiblings(input: Draft07Input): void {
  if (typeof input.$schema !== 'string' || !DRAFT_07_SCHEMA_URIS.has(input.$schema)) {
    return;
  }

  const offence = findRefSiblings(input, '#');
  if (offence === undefined) {
    return;
  }

  throw new Error(
    `Draft 07 declares that keywords beside \`$ref\` are ignored, but this document places ` +
      `sibling keywords (${offence.siblings.join(', ')}) beside \`$ref\` at ${offence.path}. ` +
      `Parsing would apply 2020-12 semantics and silently activate them. Remove the siblings, ` +
      `or migrate the document to the 2020-12 dialect ` +
      `(\`"$schema": "https://json-schema.org/draft/2020-12/schema"\`), where siblings apply.`,
  );
}

interface RefSiblingOffence {
  path: string;
  siblings: string[];
}

/**
 * Depth-first scan of a schema position for an object that pairs `$ref`
 * with carried sibling keys, recursing ONLY through the sub-schema-bearing
 * keyword positions in {@link SUB_SCHEMA_POSITIONS}. Instance-data
 * positions (`default`, `const`, `enum`, `examples`) are never entered, so
 * annotation data that merely looks like a reference cannot trip the
 * guard. Returns the first offence found.
 */
function findRefSiblings(value: unknown, path: string): RefSiblingOffence | undefined {
  if (Array.isArray(value)) {
    return findRefSiblingsInArray(value, path);
  }
  if (!isRecord(value)) {
    return undefined;
  }
  const own = collectRefSiblingOffence(value, path);
  if (own !== undefined) {
    return own;
  }
  return findRefSiblingsInSubSchemaPositions(value, path);
}

function findRefSiblingsInArray(value: unknown[], path: string): RefSiblingOffence | undefined {
  for (const [index, item] of value.entries()) {
    const found = findRefSiblings(item, `${path}/${String(index)}`);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}

function collectRefSiblingOffence(
  value: UnknownRecord,
  path: string,
): RefSiblingOffence | undefined {
  if (typeof value['$ref'] !== 'string') {
    return undefined;
  }
  const siblings = Object.keys(value).filter((key) => !NON_SIBLING_KEYS.has(key));
  return siblings.length > 0 ? { path, siblings } : undefined;
}

function findRefSiblingsInSubSchemaPositions(
  value: UnknownRecord,
  path: string,
): RefSiblingOffence | undefined {
  for (const [keyword, shape] of Object.entries(SUB_SCHEMA_POSITIONS)) {
    const entry = value[keyword];
    if (entry === undefined) {
      continue;
    }
    const entryPath = `${path}/${keyword}`;
    const found =
      shape === MAP_SHAPE
        ? findRefSiblingsInMap(entry, entryPath)
        : findRefSiblings(entry, entryPath);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}

/**
 * Recurse into each entry value of a map-of-sub-schemas position
 * (`properties`, `$defs`, `definitions`, …). The map object itself is not
 * a schema; only its entry values are. `dependencies` entries in the
 * property-list form (arrays of strings) contain no records and fall
 * through harmlessly.
 */
function findRefSiblingsInMap(value: unknown, path: string): RefSiblingOffence | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  for (const [key, entry] of Object.entries(value)) {
    const found = findRefSiblings(entry, `${path}/${key}`);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}
