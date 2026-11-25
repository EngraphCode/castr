import { describe, it, expect } from 'vitest';

import { caseOf, readCaseDocuments } from './case-documents.js';

const NOTE = [
  '## A. A section',
  '',
  '### A1. A first case',
  '',
  '```json',
  '{ "type": "string" }',
  '```',
  '',
  '- **Holds:** a line that mentions ### B9. and is not a heading.',
  '',
  '### A2. A second case',
  '',
  '```ts',
  'z.string();',
  '```',
  '',
  '```json',
  'true',
  '```',
  '',
  '```text',
  'not a document',
  '```',
].join('\n');

describe('reading the documents of the cases out of a note', () => {
  it('reads each case with its JSON and its Zod documents, in order', () => {
    expect(readCaseDocuments(NOTE)).toEqual([
      { id: 'A1', title: 'A first case', json: [{ type: 'string' }], zod: [] },
      { id: 'A2', title: 'A second case', json: [true], zod: ['z.string();'] },
    ]);
  });

  it('finds a case by its key', () => {
    expect(caseOf(readCaseDocuments(NOTE), 'A2').title).toBe('A second case');
  });

  it('refuses to find a case the note does not have', () => {
    expect(() => caseOf(readCaseDocuments(NOTE), 'Z9')).toThrow('the note has no case Z9');
  });

  it('refuses a JSON document that does not parse', () => {
    const broken = ['### A1. A case', '```json', '{ "type": ', '```'].join('\n');

    expect(() => readCaseDocuments(broken)).toThrow('a JSON document of case A1 does not parse');
  });

  it('refuses a note that ends inside a fence', () => {
    const open = ['### A1. A case', '```json', '{ "type": "string" }'].join('\n');

    expect(() => readCaseDocuments(open)).toThrow(
      'the note ends inside a fence that is not closed',
    );
  });

  it('refuses two cases of one key', () => {
    const twice = ['### A1. One', '### A1. Another'].join('\n');

    expect(() => readCaseDocuments(twice)).toThrow('more than one case has the key A1');
  });
});
