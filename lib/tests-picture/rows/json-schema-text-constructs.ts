/**
 * What the texts of JSON Schema Draft 2020-12 and Draft-07 define that neither
 * meta-schema holds: a list made by hand, and a floor.
 *
 * A meta-schema says what keywords a schema may hold and what shape each value has. It
 * does not say what a keyword means when it is absent, which keywords one depends on, how
 * an annotation reaches another keyword, what a reference is resolved against, or what a
 * string's grammar is. The texts say those, and the list holds them, one row for each.
 *
 * The list is data, in `__fixtures__/texts/json-schema-text-constructs.json`. Each row
 * cites the sections it was read from, by number, in the core or the validation text, and
 * says in the seat's own words what the text defines. No text of a specification is
 * reproduced. This module reads the file and refuses any row that is not of the shape
 * below.
 *
 * A row true of both drafts, or of 2020-12 alone, cites the sections of the 2020-12 text.
 * A row true of Draft-07 alone cites those of the Draft-07 text.
 */

import { readFileSync } from 'node:fs';

import { isJsonObject, type JsonObject } from './json.js';
import {
  DISPOSITIONS,
  citedSections,
  oneOf,
  onlyKeys,
  text,
  type TextDisposition,
} from './text-constructs.js';

/** Which of a draft's two texts a row was read from. */
const DOCUMENTS = ['core', 'validation'] as const;

/** Which drafts a row is true of. */
const DRAFTS = ['2020-12', 'draft-07', 'both'] as const;

/** One thing the texts define. */
export interface JsonSchemaTextConstruct {
  readonly sections: readonly string[];
  readonly document: (typeof DOCUMENTS)[number];
  readonly drafts: (typeof DRAFTS)[number];
  readonly disposition: TextDisposition;
  readonly says: string;
}

function readConstruct(entry: unknown, index: number): JsonSchemaTextConstruct {
  const what = `row ${String(index + 1)} of the hand list`;
  if (!isJsonObject(entry)) {
    throw new TypeError(`${what} is not an object`);
  }
  onlyKeys(entry, ['sections', 'document', 'drafts', 'disposition', 'says'], what);
  return {
    sections: citedSections(entry['sections'], `${what}: sections`),
    document: oneOf(entry['document'], DOCUMENTS, `${what}: document`),
    drafts: oneOf(entry['drafts'], DRAFTS, `${what}: drafts`),
    disposition: oneOf(entry['disposition'], DISPOSITIONS, `${what}: disposition`),
    says: text(entry['says'], `${what}: says`),
  };
}

/**
 * The name of the pinned text whose sections a row cites: the 2020-12 text for a row true
 * of both drafts or of 2020-12 alone, and the Draft-07 text for a row true of Draft-07
 * alone; the core or the validation text, as the row says.
 */
export function citedTextOf(construct: JsonSchemaTextConstruct): string {
  return `${construct.drafts === 'draft-07' ? 'draft-07' : '2020-12'} ${construct.document}`;
}

/**
 * Reads a hand list of what the JSON Schema texts define from its parsed file, refusing
 * anything that is not of its shape.
 */
export function readJsonSchemaTextConstructList(
  parsed: JsonObject,
): readonly JsonSchemaTextConstruct[] {
  onlyKeys(parsed, ['note', 'constructs'], 'the hand list');
  text(parsed['note'], 'the note of the hand list');
  const { constructs } = parsed;
  if (!Array.isArray(constructs)) {
    throw new TypeError('the hand list holds no list of constructs');
  }
  return constructs.map((entry: unknown, index) => readConstruct(entry, index));
}

/**
 * Reads the hand list of what the JSON Schema texts define beyond their meta-schemas.
 */
export function readJsonSchemaTextConstructs(): readonly JsonSchemaTextConstruct[] {
  const parsed: unknown = JSON.parse(
    readFileSync(
      new URL('../__fixtures__/texts/json-schema-text-constructs.json', import.meta.url),
      'utf8',
    ),
  );
  if (!isJsonObject(parsed)) {
    throw new TypeError('the hand list is not an object');
  }
  return readJsonSchemaTextConstructList(parsed);
}
