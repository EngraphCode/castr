/**
 * What the hand lists of what a specification's text defines have in common: the kinds a
 * row may be, and the checks that refuse a row of the wrong shape.
 */

import type { JsonObject } from './json.js';

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
export const DISPOSITIONS = [
  'holds',
  'default',
  'reading',
  'runtime',
  'validity',
  'grammar',
  'undefined',
] as const;

export type TextDisposition = (typeof DISPOSITIONS)[number];

export function strings(value: unknown, what: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new TypeError(`${what} is not a list of strings`);
  }
  return value;
}

/** The sections a row cites: at least one, each a string. */
export function citedSections(value: unknown, what: string): readonly string[] {
  const sections = strings(value, what);
  if (sections.length === 0) {
    throw new TypeError(`${what} cites no section`);
  }
  return sections;
}

/**
 * A row's key: the list's prefix, a hyphen and three digits. A key never changes and is
 * never reused, so a map from rows to anything else survives a row being reworded.
 */
export function rowKey(value: unknown, prefix: string, what: string): string {
  if (typeof value !== 'string' || !new RegExp(`^${prefix}-\\d{3}$`).test(value)) {
    throw new TypeError(`${what} has no key of the form ${prefix}-000`);
  }
  return value;
}

/** Refuses a list in which two rows share a key. */
export function refuseRepeatedKeys(keys: readonly string[]): void {
  const twice = keys.filter((key, index) => keys.indexOf(key) !== index);
  if (twice.length > 0) {
    throw new TypeError(`more than one row of the hand list has the key ${twice.join(', ')}`);
  }
}

export function oneOf<const Allowed extends string>(
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

export function text(value: unknown, what: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${what} is not a string that says something`);
  }
  return value;
}

/** Refuses an object that holds a key its list does not have. */
export function onlyKeys(entry: JsonObject, allowed: readonly string[], what: string): void {
  const unknownKeys = Object.keys(entry).filter((key) => !allowed.includes(key));
  if (unknownKeys.length > 0) {
    throw new TypeError(`${what} holds a key the list does not have: ${unknownKeys.join(', ')}`);
  }
}
