/**
 * What the text of the OpenAPI specification defines that none of its published schemas
 * holds: a list made by hand, and a floor.
 *
 * The picture's other rows are computed from the publisher's schemas. A schema says what
 * fields an object has and what values a field may take. It does not say what an absent
 * field means, which of two fields wins, what a name refers to, or what a string's grammar
 * is. The text says those, and the list holds them, one row for each.
 *
 * The list is data, in `__fixtures__/texts/openapi-text-constructs.json`. Each row cites
 * the sections of the text it was read from, by number, and says in the seat's own words
 * what the text defines. No text of the specification is reproduced. This module reads
 * the file and refuses any row that is not of the shape below.
 *
 * The list was made from a reader's report of versions 3.1.2 and 3.2.0 and a comparison
 * of 3.2.1 with 3.2.0, kept under `.agent/research/model-design-2026-11-24/`. The seat
 * checked by program that every quotation in those reports is in the text it cites, and
 * read each row against its quotation. It is a floor: a construct found later is added,
 * and nothing here says the list is whole.
 */

import { readFileSync } from 'node:fs';

import { isJsonObject, type JsonObject } from './json.js';

/**
 * What kind of thing a row is.
 *
 * - `holds`: a fact a model of the document must hold, because no field states it.
 * - `default`: what an absent field means.
 * - `reading`: a rule for reading a document: what a name refers to, which of two wins,
 *   what is ignored. The model holds the result.
 * - `runtime`: what a field means when a request or a response is made. The model holds
 *   the field; the rule is for whoever serialises.
 * - `validity`: which documents are valid. It adds nothing to the model; these go to the
 *   sweep of validity rules (SPEC-FV-2).
 * - `grammar`: a string whose grammar a specification defines.
 * - `undefined`: something the text says is undefined or left to the implementation.
 */
const DISPOSITIONS = [
  'holds',
  'default',
  'reading',
  'runtime',
  'validity',
  'grammar',
  'undefined',
] as const;

/** Which version lines a row is true of. */
const VERSION_LINES = ['3.1', '3.2', 'both'] as const;

export type TextDisposition = (typeof DISPOSITIONS)[number];
type TextVersions = (typeof VERSION_LINES)[number];

/** One thing the text defines. */
export interface TextConstruct {
  /** The sections of 3.2.1 the row was read from; of 3.1.2 for a row true of 3.1 only. */
  readonly sections: readonly string[];
  readonly versions: TextVersions;
  readonly disposition: TextDisposition;
  readonly says: string;
}

/** The hand list, with the versions it was read from. */
export interface TextConstructList {
  /** The version of each line the rows were read from. */
  readonly versionsRead: Readonly<Record<'3.1' | '3.2', string>>;
  /**
   * The sections of chapter 4 of 3.2.1 that were read and hold nothing for the list: a
   * table of fields a published schema already states, an example, or guidance. A section
   * is named with its subsections.
   */
  readonly readWithNothingToHold: readonly string[];
  readonly constructs: readonly TextConstruct[];
}

function strings(value: unknown, what: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new TypeError(`${what} is not a list of strings`);
  }
  return value;
}

function oneOf<const Allowed extends string>(
  value: unknown,
  allowed: readonly Allowed[],
  what: string,
): Allowed {
  const found = allowed.find((candidate) => candidate === value);
  if (found === undefined) {
    throw new TypeError(`${what} is not one of ${allowed.join(', ')}`);
  }
  return found;
}

function text(value: unknown, what: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${what} is not a string that says something`);
  }
  return value;
}

function readConstruct(entry: unknown, index: number): TextConstruct {
  const what = `row ${String(index + 1)} of the hand list`;
  if (!isJsonObject(entry)) {
    throw new TypeError(`${what} is not an object`);
  }
  const unknownKeys = Object.keys(entry).filter(
    (key) => !['sections', 'versions', 'disposition', 'says'].includes(key),
  );
  if (unknownKeys.length > 0) {
    throw new TypeError(`${what} holds a key the list does not have: ${unknownKeys.join(', ')}`);
  }
  return {
    sections: strings(entry['sections'], `${what}: sections`),
    versions: oneOf(entry['versions'], VERSION_LINES, `${what}: versions`),
    disposition: oneOf(entry['disposition'], DISPOSITIONS, `${what}: disposition`),
    says: text(entry['says'], `${what}: says`),
  };
}

function readVersions(value: unknown): TextConstructList['versionsRead'] {
  if (!isJsonObject(value)) {
    throw new TypeError('the hand list does not say which versions it was read from');
  }
  return {
    '3.1': text(value['3.1'], 'the version read for 3.1'),
    '3.2': text(value['3.2'], 'the version read for 3.2'),
  };
}

/**
 * Reads a hand list from its parsed file, refusing anything that is not of its shape.
 */
export function readTextConstructList(parsed: JsonObject): TextConstructList {
  const { constructs } = parsed;
  if (!Array.isArray(constructs)) {
    throw new TypeError('the hand list holds no list of constructs');
  }
  return {
    versionsRead: readVersions(parsed['versionsRead']),
    readWithNothingToHold: strings(parsed['readWithNothingToHold'], 'readWithNothingToHold'),
    constructs: constructs.map(readConstruct),
  };
}

/**
 * Reads the hand list of what the OpenAPI text defines beyond its schemas.
 */
export function readOpenApiTextConstructs(): TextConstructList {
  const parsed: unknown = JSON.parse(
    readFileSync(
      new URL('../__fixtures__/texts/openapi-text-constructs.json', import.meta.url),
      'utf8',
    ),
  );
  if (!isJsonObject(parsed)) {
    throw new TypeError('the hand list is not an object');
  }
  return readTextConstructList(parsed);
}
