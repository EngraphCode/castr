import { createHash } from 'node:crypto';

import { describe, it, expect } from 'vitest';

import { checkTextPin, readTextPins, sectionNumbers, sectionsOfText } from './text-sections.js';

const PAGE = [
  '<nav><a href="#x"><bdi class="secno">1. </bdi>Introduction</a></nav>',
  '<h2 id="a"><bdi class="secno">1. </bdi>Introduction</h2>',
  '<h3 id="b"><bdi class="secno">1.1 </bdi>Versions</h3>',
  '<h2 id="c"><bdi class="secno">A. </bdi>Appendix</h2>',
  '<h3 id="d"><bdi class="secno">A.1 </bdi>History</h3>',
].join('\n');

const DRAFT = [
  'Table of Contents',
  '',
  '   1.  Introduction  . . . . . . . . . 3',
  '   2.  Overview  . . . . . . . . . . . 4',
  '',
  '1.  Introduction',
  '',
  '   Text that mentions section 9.  It is not a heading.',
  '',
  '2.  Overview',
  '',
  '2.1.  Terms',
  '',
  'Appendix A.  Changes',
  '',
  'A.1.  First',
].join('\n');

const PAGE_SECTIONS = ['1', '1.1', 'A', 'A.1'];
const DRAFT_SECTIONS = ['1', '2', '2.1', 'A', 'A.1'];

/** A pin of a sample, with its sections written out and not read from it. */
function pinOf(
  source: string,
  markup: 'respec-html' | 'internet-draft-text',
  sections: readonly string[],
) {
  const bytes = new TextEncoder().encode(source);
  return {
    bytes,
    pin: {
      text: 'a text',
      markup,
      url: 'https://example.com/text',
      fetchedAt: '2026-11-24T00:00:00Z',
      bytes: bytes.byteLength,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      sections,
    },
  };
}

describe('reading section numbers out of a text', () => {
  it('reads each heading of a page once, and not its table of contents', () => {
    expect(sectionNumbers(PAGE, 'respec-html')).toEqual(PAGE_SECTIONS);
  });

  it('reads the headings of the body of an Internet-Draft, appendices by their letter', () => {
    expect(sectionNumbers(DRAFT, 'internet-draft-text')).toEqual(DRAFT_SECTIONS);
  });

  it('reads none from a draft with no body', () => {
    expect(sectionNumbers('Table of Contents', 'internet-draft-text')).toEqual([]);
  });
});

describe('recomputing a pin from the bytes of its text', () => {
  it('finds no difference in the bytes the pin was made from', () => {
    const { pin, bytes } = pinOf(PAGE, 'respec-html', PAGE_SECTIONS);

    expect(checkTextPin(pin, bytes).differences).toEqual([]);
  });

  it('reports bytes, digest and sections that differ', () => {
    const { pin } = pinOf(DRAFT, 'internet-draft-text', DRAFT_SECTIONS);
    const changed = new TextEncoder().encode(`${DRAFT}\n\n3.  Added`);

    const { differences } = checkTextPin(pin, changed);

    expect(differences).toHaveLength(3);
    expect(differences[2]).toBe('sections not pinned: 3');
  });

  it('reports the same sections pinned in another order', () => {
    const { pin, bytes } = pinOf(PAGE, 'respec-html', PAGE_SECTIONS);

    const { differences } = checkTextPin({ ...pin, sections: [...pin.sections].reverse() }, bytes);

    expect(differences).toEqual([
      'the same sections, in another order or a different number of times',
    ]);
  });

  it('reports a section pinned twice', () => {
    const { pin, bytes } = pinOf(PAGE, 'respec-html', PAGE_SECTIONS);

    const { differences } = checkTextPin({ ...pin, sections: [...pin.sections, '1'] }, bytes);

    expect(differences).toEqual([
      'the same sections, in another order or a different number of times',
    ]);
  });

  it('reports a pinned section the text no longer has', () => {
    const { pin, bytes } = pinOf(PAGE, 'respec-html', PAGE_SECTIONS);

    const { differences } = checkTextPin({ ...pin, sections: [...pin.sections, '9'] }, bytes);

    expect(differences).toEqual(['pinned sections not found: 9']);
  });
});

describe('reading pins', () => {
  const { pin } = pinOf(PAGE, 'respec-html', PAGE_SECTIONS);

  it('reads a pin of the right shape and finds its sections by name', () => {
    const pins = readTextPins({ texts: [{ ...pin }] });

    expect(sectionsOfText(pins, 'a text')).toEqual(['1', '1.1', 'A', 'A.1']);
  });

  it('refuses a pin with no sections', () => {
    expect(() => readTextPins({ texts: [{ ...pin, sections: [] }] })).toThrow('has no sections');
  });

  it('refuses a pin with no digest', () => {
    expect(() => readTextPins({ texts: [{ ...pin, sha256: '' }] })).toThrow('has no sha256');
  });

  it('refuses a pin with a key a pin does not have', () => {
    expect(() => readTextPins({ texts: [{ ...pin, version: '1' }] })).toThrow(
      'holds a key a pin does not have: version',
    );
  });

  it('refuses a file with a key the file does not have', () => {
    expect(() => readTextPins({ texts: [{ ...pin }], extra: true })).toThrow(
      'the file of pinned texts holds a key a pin does not have: extra',
    );
  });

  it('refuses two pins of one name', () => {
    expect(() => readTextPins({ texts: [{ ...pin }, { ...pin }] })).toThrow(
      'more than one text is pinned as a text',
    );
  });

  it('refuses a markup it cannot read', () => {
    expect(() => readTextPins({ texts: [{ ...pin, markup: 'pdf' }] })).toThrow('markup');
  });

  it('refuses to find a text that is not pinned', () => {
    expect(() => sectionsOfText(readTextPins({ texts: [{ ...pin }] }), 'another')).toThrow(
      'no text is pinned as another',
    );
  });
});
