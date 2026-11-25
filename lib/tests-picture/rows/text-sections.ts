/**
 * The pinned section numbers of the specification texts the hand lists were read from.
 *
 * A pin records where a text is served, the size and digest of the bytes served on the
 * day it was read, and the number of every section in it. Only numbers are kept, so no
 * text of a specification is reproduced. The hand lists cite sections by these numbers,
 * and their tests prove each cited number is here.
 *
 * A recorded digest that nothing recomputes proves nothing. `checkTextPin` recomputes
 * both the digest and the section numbers from a text's bytes and says how they differ
 * from the pin. The texts are not kept in the repository, so that check needs the
 * network: `pnpm picture:check-texts` fetches each text and runs it.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { isJsonObject, type JsonObject } from './json.js';

/** How a text marks its section numbers. */
const MARKUPS = ['respec-html', 'internet-draft-text'] as const;
type TextMarkup = (typeof MARKUPS)[number];

/** One text, pinned. */
export interface TextPin {
  /** A name unique among the pins: `3.2.1`, or `2020-12 core`. */
  readonly text: string;
  readonly markup: TextMarkup;
  readonly url: string;
  readonly fetchedAt: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly sections: readonly string[];
}

/** How the bytes of a text differ from its pin; empty where they do not. */
export interface TextPinDrift {
  readonly text: string;
  readonly differences: readonly string[];
}

const FILE_KEYS = ['note', 'texts'];
const PIN_KEYS = ['text', 'markup', 'url', 'fetchedAt', 'bytes', 'sha256', 'sections'];

function refuseOtherKeys(entry: JsonObject, allowed: readonly string[], what: string): void {
  const others = Object.keys(entry).filter((key) => !allowed.includes(key));
  if (others.length > 0) {
    throw new TypeError(`${what} holds a key a pin does not have: ${others.join(', ')}`);
  }
}

function requireString(entry: JsonObject, key: string, what: string): string {
  const value = entry[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${what} has no ${key}`);
  }
  return value;
}

function readPin(entry: unknown, index: number): TextPin {
  const what = `pin ${String(index + 1)} of the texts`;
  if (!isJsonObject(entry)) {
    throw new TypeError(`${what} is not an object`);
  }
  refuseOtherKeys(entry, PIN_KEYS, what);
  const { bytes, sections } = entry;
  const markup = MARKUPS.find((candidate) => candidate === entry['markup']);
  if (markup === undefined) {
    throw new TypeError(`${what} has a markup that is not one of ${MARKUPS.join(', ')}`);
  }
  if (typeof bytes !== 'number' || !Number.isInteger(bytes) || bytes <= 0) {
    throw new TypeError(`${what} has no count of bytes`);
  }
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new TypeError(`${what} has no sections`);
  }
  if (!sections.every((section) => typeof section === 'string')) {
    throw new TypeError(`${what} has a section that is not a string`);
  }
  return {
    text: requireString(entry, 'text', what),
    markup,
    url: requireString(entry, 'url', what),
    fetchedAt: requireString(entry, 'fetchedAt', what),
    bytes,
    sha256: requireString(entry, 'sha256', what),
    sections,
  };
}

/**
 * Reads pins from a parsed file, refusing anything that is not of their shape.
 */
export function readTextPins(parsed: JsonObject): readonly TextPin[] {
  refuseOtherKeys(parsed, FILE_KEYS, 'the file of pinned texts');
  const { texts } = parsed;
  if (!Array.isArray(texts)) {
    throw new TypeError('the file of pinned texts holds no list of texts');
  }
  return texts.map((entry: unknown, index) => readPin(entry, index));
}

/**
 * Reads the pins in one file of `__fixtures__/texts/`.
 */
export function readTextPinFile(file: string): readonly TextPin[] {
  const parsed: unknown = JSON.parse(
    readFileSync(new URL(`../__fixtures__/texts/${file}`, import.meta.url), 'utf8'),
  );
  if (!isJsonObject(parsed)) {
    throw new TypeError(`${file} is not an object`);
  }
  return readTextPins(parsed);
}

/**
 * The section numbers of one pinned text.
 *
 * @throws when no pin has that name
 */
export function sectionsOfText(pins: readonly TextPin[], text: string): readonly string[] {
  const found = pins.find((pin) => pin.text === text);
  if (found === undefined) {
    throw new Error(`no text is pinned as ${text}`);
  }
  return found.sections;
}

/** A section number in a ReSpec page: the content of a heading's `secno` element. */
const RESPEC_SECTION = /<h[2-6][^>]*><bdi class="secno">([^<]+)<\/bdi>/g;

/** A numbered heading in the body of a plain-text Internet-Draft, at the left margin. */
const DRAFT_SECTION = /^((?:\d+|Appendix [A-Z]|[A-Z])(?:\.\d+)*)\. {2}\S/gm;

/** Where the body of a plain-text Internet-Draft begins, after its table of contents. */
const DRAFT_BODY = /^1\. {2}Introduction$/m;

/**
 * Reads the section numbers out of a text, in document order.
 */
export function sectionNumbers(source: string, markup: TextMarkup): readonly string[] {
  if (markup === 'respec-html') {
    return [...source.matchAll(RESPEC_SECTION)].map((match) =>
      (match[1] ?? '').trim().replace(/\.$/, ''),
    );
  }
  const body = DRAFT_BODY.exec(source);
  if (body === null) {
    return [];
  }
  return [...source.slice(body.index).matchAll(DRAFT_SECTION)].map((match) =>
    (match[1] ?? '').replace('Appendix ', ''),
  );
}

/**
 * Recomputes a pin from the bytes of its text and says how they differ.
 */
export function checkTextPin(pin: TextPin, bytes: Uint8Array): TextPinDrift {
  const differences: string[] = [];
  if (bytes.byteLength !== pin.bytes) {
    differences.push(`${String(bytes.byteLength)} bytes, pinned as ${String(pin.bytes)}`);
  }
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== pin.sha256) {
    differences.push(`digest ${digest}, pinned as ${pin.sha256}`);
  }
  const sections = sectionNumbers(new TextDecoder().decode(bytes), pin.markup);
  const pinned = new Set(pin.sections);
  const found = new Set(sections);
  const added = sections.filter((section) => !pinned.has(section));
  const removed = pin.sections.filter((section) => !found.has(section));
  if (added.length > 0) {
    differences.push(`sections not pinned: ${added.join(', ')}`);
  }
  if (removed.length > 0) {
    differences.push(`pinned sections not found: ${removed.join(', ')}`);
  }
  const sameList =
    sections.length === pin.sections.length &&
    sections.every((section, index) => section === pin.sections[index]);
  if (added.length === 0 && removed.length === 0 && !sameList) {
    differences.push('the same sections, in another order or a different number of times');
  }
  return { text: pin.text, differences };
}
