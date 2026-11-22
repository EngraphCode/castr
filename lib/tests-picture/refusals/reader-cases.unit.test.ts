/**
 * The verdict for an input is what Castr did set against the case decided for it.
 */

import { describe, it, expect } from 'vitest';

import type { DocumentCell } from '../documents/document-cell.js';

import { readerVerdict, renderReaderCases, type CastrDid } from './reader-cases.js';
import { castrDid } from './run-reader-cases.js';

const READ = { outcome: 'read', detail: 'made' } satisfies CastrDid;
const REFUSED = { outcome: 'refused', detail: 'no' } satisfies CastrDid;

describe('readerVerdict', () => {
  it('is right when no case holds and Castr reads the input', () => {
    expect(readerVerdict('none', READ)).toBe('right');
  });

  it('says Castr reads it when a case holds and Castr reads the input', () => {
    expect(readerVerdict(2, READ)).toBe('reads it');
  });

  it('does not count a refusal right while Castr gives it no kind', () => {
    expect(readerVerdict(1, REFUSED)).toBe('refuses, with no kind');
  });

  it('says Castr refuses what it should read when no case holds', () => {
    expect(readerVerdict('none', REFUSED)).toBe('refuses what it should read');
  });

  it('is not judged where the case is not decided', () => {
    expect(readerVerdict('not decided', READ)).toBe('not judged');
  });

  it('is crashed, nothing or mixed whatever case holds', () => {
    expect([
      readerVerdict('none', { outcome: 'crashed', detail: 'fault' }),
      readerVerdict(4, { outcome: 'nothing', detail: 'none' }),
      readerVerdict('not decided', { outcome: 'mixed', detail: 'some' }),
    ]).toEqual(['crashed', 'makes nothing', 'differs by output']);
  });
});

describe('castrDid', () => {
  const made = { outcome: 'converted', detail: '1 validator' } satisfies DocumentCell;
  const nothing = { outcome: 'nothing', detail: 'none' } satisfies DocumentCell;
  const refused = { outcome: 'refused', detail: 'no' } satisfies DocumentCell;
  const crashed = { outcome: 'crashed', detail: 'fault' } satisfies DocumentCell;

  it('is read, in the words of each output, when one was made and none stopped', () => {
    expect(castrDid({ zod: made, typescript: made, endpoints: nothing })).toEqual({
      outcome: 'read',
      detail: 'Zod: 1 validator; TypeScript: 1 validator; endpoint definitions: none',
    });
  });

  it('is refused, in the one thing all three said, when every output was refused', () => {
    expect(castrDid({ zod: refused, typescript: refused, endpoints: refused })).toEqual({
      outcome: 'refused',
      detail: 'no',
    });
  });

  it('is nothing when no output was made and none stopped', () => {
    expect(castrDid({ zod: nothing, typescript: nothing, endpoints: nothing })).toEqual({
      outcome: 'nothing',
      detail: 'none',
    });
  });

  it('is mixed when some outputs were refused and others not', () => {
    expect(castrDid({ zod: refused, typescript: refused, endpoints: nothing })).toEqual({
      outcome: 'mixed',
      detail: 'Zod: no; TypeScript: no; endpoint definitions: none',
    });
  });

  it('is crashed when any output crashed, and says which', () => {
    expect(castrDid({ zod: made, typescript: crashed, endpoints: nothing })).toEqual({
      outcome: 'crashed',
      detail: 'Zod: 1 validator; TypeScript: fault; endpoint definitions: none',
    });
  });
});

describe('renderReaderCases', () => {
  it('counts the inputs that are right and gives each a row', () => {
    const rendered = renderReaderCases([
      { name: 'valid', holds: 'none', did: READ },
      { name: 'old', holds: 2, did: READ },
    ]);

    expect(rendered).toContain('(1 of 2 inputs right)');
    expect(rendered).toContain('| valid | none: it is read | right | made |');
    expect(rendered).toContain('| old | case 2, version | reads it | made |');
  });
});
