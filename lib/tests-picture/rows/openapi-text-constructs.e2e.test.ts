/**
 * The hand list of what the OpenAPI text defines, proved against the text's own sections.
 *
 * This test reads the pinned list of section numbers from the repository, so it is an
 * end-to-end test. It proves what a list made by hand can be proved to do: cite sections
 * that exist, and leave no section of chapter 4 unaccounted for. It cannot prove a row
 * says what its section says; that was read.
 */

import { readFileSync } from 'node:fs';

import { describe, it, expect } from 'vitest';

import { isJsonObject } from './json.js';
import {
  readOpenApiTextConstructs,
  readTextConstructList,
  type TextConstruct,
} from './openapi-text-constructs.js';
import type { TextDisposition } from './text-constructs.js';

const list = readOpenApiTextConstructs();
const OPENAPI_TEXT_CONSTRUCTS = list.constructs;
const OPENAPI_TEXT_READ_WITH_NOTHING_TO_HOLD = list.readWithNothingToHold;
const OPENAPI_TEXT_VERSIONS = list.versionsRead;

/** The pinned section numbers of one version of the text. */
function sectionsOf(version: string): readonly string[] {
  const pinned: unknown = JSON.parse(
    readFileSync(new URL('../__fixtures__/texts/openapi-sections.json', import.meta.url), 'utf8'),
  );
  const texts = isJsonObject(pinned) && Array.isArray(pinned['texts']) ? pinned['texts'] : [];
  const found = texts.find((text) => isJsonObject(text) && text['version'] === version);
  const sections = isJsonObject(found) && Array.isArray(found['sections']) ? found['sections'] : [];
  return sections.filter((section) => typeof section === 'string');
}

/** The version whose section numbers a row cites. */
function citedVersion(construct: TextConstruct): string {
  return construct.versions === '3.1' ? OPENAPI_TEXT_VERSIONS['3.1'] : OPENAPI_TEXT_VERSIONS['3.2'];
}

function isWithin(section: string, parent: string): boolean {
  return section === parent || section.startsWith(`${parent}.`);
}

describe('the pinned sections of the OpenAPI text', () => {
  it('holds 216 numbered sections of 3.1.2 and 267 of 3.2.1', () => {
    expect(sectionsOf('3.1.2')).toHaveLength(216);
    expect(sectionsOf('3.2.1')).toHaveLength(267);
  });
});

describe('reading a hand list', () => {
  const valid = {
    versionsRead: { '3.1': '3.1.2', '3.2': '3.2.1' },
    readWithNothingToHold: ['4.2'],
    constructs: [{ sections: ['4.1.1'], versions: 'both', disposition: 'holds', says: 'A fact.' }],
  };

  it('reads a list of the right shape', () => {
    expect(readTextConstructList(valid).constructs).toHaveLength(1);
  });

  it('refuses a kind the list does not have', () => {
    const wrong = { ...valid, constructs: [{ ...valid.constructs[0], disposition: 'maybe' }] };

    expect(() => readTextConstructList(wrong)).toThrow('row 1 of the hand list: disposition');
  });

  it('refuses a row with a key the list does not have', () => {
    const wrong = { ...valid, constructs: [{ ...valid.constructs[0], note: 'x' }] };

    expect(() => readTextConstructList(wrong)).toThrow('holds a key the list does not have: note');
  });

  it('refuses a row that says nothing', () => {
    const wrong = { ...valid, constructs: [{ ...valid.constructs[0], says: '' }] };

    expect(() => readTextConstructList(wrong)).toThrow('says');
  });
});

describe('the hand list of what the OpenAPI text defines', () => {
  it('was read from the latest patch of each line', () => {
    expect(OPENAPI_TEXT_VERSIONS).toEqual({ '3.1': '3.1.2', '3.2': '3.2.1' });
  });

  it('cites only sections the text has, in the version each row is read from', () => {
    const missing = OPENAPI_TEXT_CONSTRUCTS.flatMap((construct) => {
      const sections = new Set(sectionsOf(citedVersion(construct)));
      return construct.sections
        .filter((section) => !sections.has(section))
        .map((section) => `${citedVersion(construct)} ${section}: ${construct.says}`);
    });

    expect(missing).toEqual([]);
  });

  it('gives every row at least one section and something it says', () => {
    const empty = OPENAPI_TEXT_CONSTRUCTS.filter(
      (construct) => construct.sections.length === 0 || construct.says.length === 0,
    );

    expect(empty).toEqual([]);
  });

  it('says nothing twice', () => {
    const said = OPENAPI_TEXT_CONSTRUCTS.map((construct) => construct.says);

    expect(new Set(said).size).toBe(said.length);
  });

  it('accounts for every object of chapter 4 of 3.2.1', () => {
    const objects = sectionsOf('3.2.1').filter((section) => /^4\.\d+$/.test(section));
    const cited = OPENAPI_TEXT_CONSTRUCTS.filter(
      (construct) => construct.versions !== '3.1',
    ).flatMap((construct) => construct.sections);
    const unaccounted = objects.filter(
      (object) =>
        !cited.some((section) => isWithin(section, object)) &&
        !OPENAPI_TEXT_READ_WITH_NOTHING_TO_HOLD.includes(object),
    );

    expect(objects).toHaveLength(30);
    expect(unaccounted).toEqual([]);
  });

  it('names no section as holding nothing that a row cites', () => {
    const cited = OPENAPI_TEXT_CONSTRUCTS.flatMap((construct) => construct.sections);
    const both = OPENAPI_TEXT_READ_WITH_NOTHING_TO_HOLD.filter((parent) =>
      cited.some((section) => isWithin(section, parent)),
    );

    expect(both).toEqual([]);
  });

  it('counts its 140 rows by kind', () => {
    const count = (disposition: TextDisposition): number =>
      OPENAPI_TEXT_CONSTRUCTS.filter((construct) => construct.disposition === disposition).length;

    expect({
      holds: count('holds'),
      default: count('default'),
      reading: count('reading'),
      runtime: count('runtime'),
      validity: count('validity'),
      grammar: count('grammar'),
      undefined: count('undefined'),
    }).toEqual({
      holds: 52,
      default: 11,
      reading: 31,
      runtime: 14,
      validity: 9,
      grammar: 11,
      undefined: 12,
    });
  });
});
