import { describe, expect, it } from 'vitest';

import { findDuplicateJsonKeys } from './validate-manifest-duplicate-keys-helpers.js';

describe('findDuplicateJsonKeys', () => {
  it('flags the escaped class: an identical sibling script key duplicated in scripts', () => {
    // The exact defect shape that escaped in PR #62 round 7.
    const source = [
      '{',
      '  "scripts": {',
      '    "test": "vitest run",',
      '    "test:coverage": "vitest run --coverage",',
      '    "test:watch": "vitest",',
      '    "test:coverage": "vitest run --coverage"',
      '  }',
      '}',
    ].join('\n');

    expect(findDuplicateJsonKeys(source)).toStrictEqual([
      { key: 'test:coverage', line: 6, firstLine: 4 },
    ]);
  });

  it('flags duplicates whose values differ', () => {
    const source = '{ "a": 1, "a": 2 }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([{ key: 'a', line: 1, firstLine: 1 }]);
  });

  it('returns empty for a duplicate-free document', () => {
    const source = '{ "a": 1, "b": { "a": 2 }, "c": [1, 2] }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([]);
  });

  it('does not report the same key in different sibling objects', () => {
    const source = '{ "lib": { "test": 1 }, "tools": { "test": 2 } }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([]);
  });

  it('does not report the same key in sibling objects inside an array', () => {
    const source = '{ "items": [ { "name": "a" }, { "name": "b" } ] }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([]);
  });

  it('is not confused by braces, colons, or quotes inside string values', () => {
    const source = '{ "a": "x{y}:\\"z\\",{", "b": "{\\"a\\": 1, \\"a\\": 2}" }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([]);
  });

  it('treats escaped-differently spellings of the same key text as duplicates', () => {
    // "abc" and "abc" denote the same key; JSON.parse would last-win them.
    const source = '{ "abc": 1, "a\\u0062c": 2 }';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([{ key: 'abc', line: 1, firstLine: 1 }]);
  });

  it('reports each duplicate occurrence beyond the first', () => {
    const source = '{\n  "k": 1,\n  "k": 2,\n  "k": 3\n}';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([
      { key: 'k', line: 3, firstLine: 2 },
      { key: 'k', line: 4, firstLine: 2 },
    ]);
  });

  it('detects duplicates in nested object scopes', () => {
    const source = '{\n  "outer": {\n    "x": 1,\n    "y": { "z": 1, "z": 2 },\n    "x": 3\n  }\n}';

    expect(findDuplicateJsonKeys(source)).toStrictEqual([
      { key: 'z', line: 4, firstLine: 4 },
      { key: 'x', line: 5, firstLine: 3 },
    ]);
  });

  it('returns empty for an empty document and for non-object roots', () => {
    expect(findDuplicateJsonKeys('')).toStrictEqual([]);
    expect(findDuplicateJsonKeys('[1, 2, 3]')).toStrictEqual([]);
    expect(findDuplicateJsonKeys('"just a string: {\\"a\\": 1}"')).toStrictEqual([]);
  });
});
