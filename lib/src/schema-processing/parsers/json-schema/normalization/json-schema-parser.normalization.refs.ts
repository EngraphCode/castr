import type { ReferenceObject } from 'openapi3-ts/oas31';
import { split, join } from 'lodash-es';
import type { Draft07Input } from './json-schema-parser.normalization.types.js';

const SLASH = '/';
const DEFINITIONS_REF_LEADING = '#';
const DEFINITIONS_REF_SEGMENT = 'definitions';
const DEFS_SEGMENT = '$defs';
const EXPECTED_REF_SEGMENT_COUNT = 3;
const REF_SEGMENT_NAME_INDEX = 2;

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

function rewriteRefPath(path: string): string {
  const segments = split(path, SLASH);
  if (
    segments.length !== EXPECTED_REF_SEGMENT_COUNT ||
    segments[0] !== DEFINITIONS_REF_LEADING ||
    segments[1] !== DEFINITIONS_REF_SEGMENT
  ) {
    return path;
  }
  const name = segments[REF_SEGMENT_NAME_INDEX];
  return name !== undefined ? join([DEFINITIONS_REF_LEADING, DEFS_SEGMENT, name], SLASH) : path;
}
