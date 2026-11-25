/**
 * The hand list of what the JSON Schema texts define, proved against the texts' own
 * sections.
 *
 * This test reads the pinned lists of section numbers from the repository, so it is an
 * end-to-end test. It proves that every row cites sections that exist in the text it was
 * read from. It cannot prove a row says what its section says; that was read.
 */

import { describe, it, expect } from 'vitest';

import {
  citedTextOf,
  readJsonSchemaTextConstructList,
  readJsonSchemaTextConstructs,
  type JsonSchemaTextConstruct,
} from './json-schema-text-constructs.js';
import type { TextDisposition } from './text-constructs.js';
import { readTextPinFile, sectionsOfText, unpinnedCitations } from './text-sections.js';

const constructs = readJsonSchemaTextConstructs();

const pins = readTextPinFile('json-schema-sections.json');

describe('the pinned sections of the JSON Schema texts', () => {
  it('holds the numbered sections of the four texts', () => {
    expect(sectionsOfText(pins, '2020-12 core')).toHaveLength(132);
    expect(sectionsOfText(pins, '2020-12 validation')).toHaveLength(69);
    expect(sectionsOfText(pins, 'draft-07 core')).toHaveLength(47);
    expect(sectionsOfText(pins, 'draft-07 validation')).toHaveLength(85);
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
    expect(readJsonSchemaTextConstructList({ note: 'A list.', constructs: [row] })).toHaveLength(1);
  });

  it('refuses a draft the list does not have', () => {
    const wrong = { note: 'A list.', constructs: [{ ...row, drafts: 'draft-04' }] };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow('row 1 of the hand list: drafts');
  });

  it('refuses a row that cites no section', () => {
    const wrong = { note: 'A list.', constructs: [{ ...row, sections: [] }] };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow('cites no section');
  });

  it('refuses a row with a key the list does not have', () => {
    const wrong = { note: 'A list.', constructs: [{ ...row, quote: 'x' }] };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow(
      'holds a key the list does not have: quote',
    );
  });

  it('refuses a list with a key the list does not have', () => {
    const wrong = { note: 'A list.', constructs: [row], extra: 1 };

    expect(() => readJsonSchemaTextConstructList(wrong)).toThrow(
      'the hand list holds a key the list does not have: extra',
    );
  });

  it('refuses a list with no note', () => {
    expect(() => readJsonSchemaTextConstructList({ constructs: [row] })).toThrow('note');
  });

  it('cites the 2020-12 text for a row true of both drafts, and Draft-07 for one true of it alone', () => {
    const read = readJsonSchemaTextConstructList({
      note: 'A list.',
      constructs: [row, { ...row, drafts: 'draft-07', document: 'validation' }],
    });

    expect(read.map((construct) => citedTextOf(construct))).toEqual([
      '2020-12 core',
      'draft-07 validation',
    ]);
  });
});

describe('the hand list of what the JSON Schema texts define', () => {
  it('cites only sections the text has, in the draft and the text each row is read from', () => {
    const missing = constructs.flatMap((construct) =>
      unpinnedCitations(pins, citedTextOf(construct), construct.sections),
    );

    expect(missing).toEqual([]);
  });

  it('says nothing twice', () => {
    const said = constructs.map((construct) => construct.says);

    expect(new Set(said).size).toBe(said.length);
  });

  it('counts its 134 rows by the drafts they are true of', () => {
    const count = (drafts: JsonSchemaTextConstruct['drafts']): number =>
      constructs.filter((construct) => construct.drafts === drafts).length;

    expect(constructs).toHaveLength(134);
    expect({ both: count('both'), new: count('2020-12'), old: count('draft-07') }).toEqual({
      both: 34,
      new: 68,
      old: 32,
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
      holds: 86,
      default: 3,
      reading: 12,
      runtime: 4,
      validity: 3,
      grammar: 18,
      undefined: 8,
    });
  });
});
