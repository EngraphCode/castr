/**
 * Every string the prototype's types can hold, listed with why it is a string.
 *
 * The check reads `model.ts` through the compiler, so a string added to the model
 * without an entry here fails, and so does an entry for a string that is gone. It reads
 * a source file of the repository, so it is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { stringLeaves } from './string-leaves.js';

/**
 * Why a place holds a string.
 *
 * - `text`: words for a person. No grammar.
 * - `data`: a string a document states as a value or a key. Any string is one.
 * - `grammar`: text in a grammar a specification defines, kept as text. The
 *   specification allows that only as an exception its owner approves, so each of these
 *   is a request the amendment must carry, and none is granted.
 */
type Reason =
  | { readonly why: 'text' | 'data'; readonly what: string }
  | { readonly why: 'grammar'; readonly what: string; readonly grammar: string };

const LEAVES: Readonly<Record<string, Reason>> = {
  'Constant[object].members': { why: 'data', what: 'the keys of an object a schema states' },
  'Constant[string].value': { why: 'data', what: 'a string a schema states' },
  'Definition.aliases': {
    why: 'grammar',
    what: 'the names a source gave a definition: a key, an anchor, an identifier',
    grammar: 'an anchor (JSON Schema core 8.2.2) and a URI (RFC 3986) are among them',
  },
  'ObjectPart.fields': { why: 'data', what: 'the names of an object’s fields' },
  'ObjectPart.required': { why: 'data', what: 'the names of keys that must be present' },
  'Pattern.source': {
    why: 'grammar',
    what: 'a regular expression',
    grammar: 'ECMA-262 regular expressions, in the dialect the pattern names',
  },
  'Resource.dynamicAnchors': {
    why: 'grammar',
    what: 'the dynamic anchors a resource declares',
    grammar: 'an anchor (JSON Schema core 8.2.2): one token, with no parts',
  },
  'ResourceId.resource': {
    why: 'grammar',
    what: 'the identifier of a resource',
    grammar: 'a URI (RFC 3986)',
  },
  'Said.description': { why: 'text', what: 'a description' },
  'Said.title': { why: 'text', what: 'a title' },
  'Shape[reference-in-scope].anchor': {
    why: 'grammar',
    what: 'the dynamic anchor a reference in scope looks for',
    grammar: 'an anchor (JSON Schema core 8.2.2): one token, with no parts',
  },
  'Step[data].path': { why: 'data', what: 'the keys that lead to a schema inside other data' },
  'Step[field].name': { why: 'data', what: 'the name of a field' },
  'Step[named].name': { why: 'data', what: 'the key a definition is filed under' },
  'Written.as': {
    why: 'grammar',
    what: 'a reference as its source wrote it, in the record and never read again',
    grammar: 'a URI reference (RFC 3986), whose fragment may be a JSON Pointer (RFC 6901)',
  },
};

describe('the strings of the prototype', () => {
  it('are each listed with a reason, and no entry is for a string that is gone', () => {
    expect(stringLeaves()).toEqual(Object.keys(LEAVES));
  });

  it('include six kept as text in a grammar a specification defines', () => {
    const kept = Object.entries(LEAVES)
      .filter(([, reason]) => reason.why === 'grammar')
      .map(([name]) => name);

    expect(kept).toEqual([
      'Definition.aliases',
      'Pattern.source',
      'Resource.dynamicAnchors',
      'ResourceId.resource',
      'Shape[reference-in-scope].anchor',
      'Written.as',
    ]);
  });
});
