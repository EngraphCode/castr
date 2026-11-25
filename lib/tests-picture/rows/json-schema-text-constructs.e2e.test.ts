/**
 * The hand list of what the JSON Schema texts define, proved against the texts' own
 * sections.
 *
 * This test reads the pinned lists of section numbers from the repository, so it is an
 * end-to-end test. It proves that every row cites sections that exist in the text it was
 * read from. It cannot prove a row says what its section says; that was read.
 */

import { readFileSync } from 'node:fs';

import { describe, it, expect } from 'vitest';

import { isJsonObject } from './json.js';
import {
  readJsonSchemaTextConstructList,
  readJsonSchemaTextConstructs,
  type JsonSchemaTextConstruct,
} from './json-schema-text-constructs.js';
import type { TextDisposition } from './text-constructs.js';

const constructs = readJsonSchemaTextConstructs();

/** The pinned section numbers of one text of one draft. */
function sectionsOf(draft: string, document: string): readonly string[] {
  const pinned: unknown = JSON.parse(
    readFileSync(
      new URL('../__fixtures__/texts/json-schema-sections.json', import.meta.url),
      'utf8',
    ),
  );
  const texts = isJsonObject(pinned) && Array.isArray(pinned['texts']) ? pinned['texts'] : [];
  const found = texts.find(
    (entry) => isJsonObject(entry) && entry['draft'] === draft && entry['document'] === document,
  );
  const sections = isJsonObject(found) && Array.isArray(found['sections']) ? found['sections'] : [];
  return sections.filter((section) => typeof section === 'string');
}

/** The draft whose section numbers a row cites. */
function citedDraft(construct: JsonSchemaTextConstruct): string {
  return construct.drafts === 'draft-07' ? 'draft-07' : '2020-12';
}

describe('the pinned sections of the JSON Schema texts', () => {
  it('holds the numbered sections of the four texts', () => {
    expect(sectionsOf('2020-12', 'core')).toHaveLength(132);
    expect(sectionsOf('2020-12', 'validation')).toHaveLength(69);
    expect(sectionsOf('draft-07', 'core')).toHaveLength(47);
    expect(sectionsOf('draft-07', 'validation')).toHaveLength(85);
  });
});

describe('reading a hand list of the JSON Schema texts', () => {
  const row = {
    sections: ['4.2.1'],
    document: 'core',
    drafts: 'both',
    disposition: 'holds',
    says: 'A fact.',
  };

  it('reads a list of the right shape', () => {
    expect(readJsonSchemaTextConstructList({ constructs: [row] })).toHaveLength(1);
  });

  it('refuses a draft the list does not have', () => {
    const wrong = { constructs: [{ ...row, drafts: 'draft-04' }] };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow('row 1 of the hand list: drafts');
  });

  it('refuses a row with a key the list does not have', () => {
    const wrong = { constructs: [{ ...row, quote: 'x' }] };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow(
      'holds a key the list does not have: quote',
    );
  });
});

describe('the hand list of what the JSON Schema texts define', () => {
  it('cites only sections the text has, in the draft and the text each row is read from', () => {
    const missing = constructs.flatMap((construct) => {
      const sections = new Set(sectionsOf(citedDraft(construct), construct.document));
      return construct.sections
        .filter((section) => !sections.has(section))
        .map((section) => `${citedDraft(construct)} ${construct.document} ${section}`);
    });

    expect(missing).toEqual([]);
  });

  it('says nothing twice', () => {
    const said = constructs.map((construct) => construct.says);

    expect(new Set(said).size).toBe(said.length);
  });

  it('counts its 136 rows by the drafts they are true of', () => {
    const count = (drafts: JsonSchemaTextConstruct['drafts']): number =>
      constructs.filter((construct) => construct.drafts === drafts).length;

    expect(constructs).toHaveLength(136);
    expect({ both: count('both'), new: count('2020-12'), old: count('draft-07') }).toEqual({
      both: 36,
      new: 66,
      old: 34,
    });
  });

  it('counts its rows by kind', () => {
    const count = (disposition: TextDisposition): number =>
      constructs.filter((construct) => construct.disposition === disposition).length;

    expect({
      holds: count('holds'),
      default: count('default'),
      reading: count('reading'),
      runtime: count('runtime'),
      validity: count('validity'),
      grammar: count('grammar'),
      undefined: count('undefined'),
    }).toEqual({
      holds: 88,
      default: 3,
      reading: 13,
      runtime: 2,
      validity: 3,
      grammar: 18,
      undefined: 9,
    });
  });

  it('keeps the two locations of a definition apart', () => {
    const merged = constructs.filter(
      (construct) => construct.says.includes('#/definitions') && construct.says.includes('#/$defs'),
    );

    expect(merged).toEqual([]);
  });
});
