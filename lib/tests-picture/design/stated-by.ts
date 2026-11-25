/**
 * Which formats state each element of the prototype: the coverage map, turned round.
 *
 * An element only one format can state is a risk: it may be that format's keyword under
 * a neutral name. So each must say, in a sentence, what meaning it is that the others
 * have no way to write. This module computes who states what from the coverage map, so
 * the list cannot drift from it.
 */

import {
  DIALECT_2020_12_OWN_NAMES,
  DRAFT_07,
  DRAFT_2020_12,
  JSON_SCHEMA_TEXT,
  OPENAPI,
  OPENAPI_TEXT,
  TYPE_VALUES,
  ZOD_CHECKS,
  ZOD_SCHEMAS,
  type Coverage,
} from './coverage.js';

type FormatName = 'JSON Schema' | 'OpenAPI' | 'Zod';

const MAPS: readonly (readonly [FormatName, Readonly<Record<string, Coverage>>])[] = [
  ['JSON Schema', DRAFT_2020_12],
  ['JSON Schema', DRAFT_07],
  ['JSON Schema', TYPE_VALUES],
  ['JSON Schema', DIALECT_2020_12_OWN_NAMES],
  ['JSON Schema', JSON_SCHEMA_TEXT],
  ['OpenAPI', OPENAPI],
  ['OpenAPI', OPENAPI_TEXT],
  ['Zod', ZOD_SCHEMAS],
  ['Zod', ZOD_CHECKS],
];

/**
 * For each element the coverage map names, the formats with a kind it holds.
 */
export function statedBy(): ReadonlyMap<string, ReadonlySet<FormatName>> {
  const found = new Map<string, Set<FormatName>>();
  for (const [format, map] of MAPS) {
    for (const entry of Object.values(map)) {
      for (const element of 'held' in entry ? entry.held : []) {
        const formats = found.get(element) ?? new Set<FormatName>();
        formats.add(format);
        found.set(element, formats);
      }
    }
  }
  return found;
}

/** The elements exactly one format states, sorted, for that format. */
export function statedOnlyBy(format: FormatName): readonly string[] {
  return [...statedBy()]
    .filter(([, formats]) => formats.size === 1 && formats.has(format))
    .map(([element]) => element)
    .sort((left, right) => left.localeCompare(right, 'en'));
}
