/**
 * Holds what each schema of each line says of each document.
 *
 * The outcomes below were computed on 22 November 2026 by two validators with no code in
 * common, `@hyperjump/json-schema` 1.18.1 and the Python `jsonschema` 4.25.1, which agreed
 * on every one. This test recomputes them with the first.
 */

import { describe, it, expect } from 'vitest';

import { judgeDocument } from './judge.js';
import {
  documentWithoutInfo,
  judgeRevisionCases,
  renderRevisionDifferences,
  REVISION_CASES,
  REVISIONS,
  WITH_DIALECT,
  type Line,
  type RevisionOutcome,
} from './revision-cases.js';

/**
 * For each document, six letters: `p` for passes and `f` for fails, at the revision
 * 0.8.0 names, at the latest, and at the latest with the dialect; for 3.1 and then 3.2.
 */
const EXPECTED: Readonly<Record<string, string>> = {
  'nothing besides the required fields': 'ppp ppp',
  'a Schema Object `{"type": "string"}`': 'ppp ppp',
  'a Schema Object `true`': 'ppp ppp',
  'a Schema Object `{}`': 'ppp ppp',
  'a Parameter whose `schema` is `{}`': 'ppp ppp',
  'a Schema Object `{"type": 5}`': 'ppf ppf',
  'a number where a Schema Object stands': 'fff fff',
  'a Schema Object whose `discriminator` is a string': 'ppf ppf',
  'a field the root does not have': 'fff fff',
  'a path that does not start with a slash': 'fff fff',
  'a Parameter with no `name`': 'fff fff',
  'a Responses Object holding only an `x-` field': 'pff fff',
  '`allowReserved` on a header parameter': 'fff pff',
  '`allowReserved` on a Header Object': 'fff pff',
  'a cookie parameter with `style: cookie` and `allowReserved`': 'fff pff',
  '`allowReserved` on a cookie parameter with no `style`': 'fff ppp',
  'a header parameter whose name is not a token': 'ppp pff',
  'a response header whose name is not a token': 'ppp pff',
  'a Media Type Object with `description`': 'fff pff',
  'a path parameter named `a{b}`': 'pff pff',
  '`example` beside `examples` on a Parameter': 'pff fff',
  '`example` beside `examples` on a Media Type Object': 'pff fff',
  '`$ref` on a Path Item under `paths`': 'fpp ppp',
  '`$ref` on a Path Item beside an operation': 'fpp ppp',
  'a Reference Object with a field it does not have': 'fpp ppp',
  'a Reference Object with `summary`': 'ppp ppp',
  'a Link Object with `server`': 'fpp ppp',
  'a Link Object with `body`': 'pff fff',
};

function letters(outcome: RevisionOutcome): string {
  return [outcome.named, outcome.latest, outcome.withDialect]
    .map((passes) => (passes ? 'p' : 'f'))
    .join('');
}

describe('the publisher’s schemas, at the revisions named and the latest', () => {
  it('judge every document as recorded', async () => {
    const outcomes = await judgeRevisionCases(REVISION_CASES);

    const computed = Object.fromEntries(
      REVISION_CASES.map(({ name }) => [
        name,
        outcomes
          .filter((outcome) => outcome.name === name)
          .map(letters)
          .join(' '),
      ]),
    );

    expect(computed).toEqual(EXPECTED);
  });

  it('refuse a document with no `info` at every revision', async () => {
    // A `schema-base` file judges the document through the plain schema of its revision,
    // so that is where its failure is.
    const schemas: readonly (readonly [schema: string, line: Line, failsIn: string])[] = [
      [REVISIONS['3.1'].named, '3.1', REVISIONS['3.1'].named],
      [REVISIONS['3.1'].latest, '3.1', REVISIONS['3.1'].latest],
      [WITH_DIALECT['3.1'], '3.1', REVISIONS['3.1'].latest],
      [REVISIONS['3.2'].named, '3.2', REVISIONS['3.2'].named],
      [REVISIONS['3.2'].latest, '3.2', REVISIONS['3.2'].latest],
      [WITH_DIALECT['3.2'], '3.2', REVISIONS['3.2'].latest],
    ];

    const judgements = await Promise.all(
      schemas.map(async ([schema, line]) => judgeDocument(schema, documentWithoutInfo(line))),
    );

    expect(judgements.map((judgement) => judgement.failures)).toEqual(
      schemas.map(([, , failsIn]) => [{ at: '#', keyword: `${failsIn}#/required` }]),
    );
  });
});

describe('renderRevisionDifferences', () => {
  it('lists only the documents the two revisions judge differently', () => {
    const rendered = renderRevisionDifferences([
      { name: 'same', line: '3.1', named: true, latest: true, withDialect: true },
      { name: 'now refused', line: '3.2', named: true, latest: false, withDialect: false },
    ]);

    expect(rendered).toContain('(1 of 2 documents differ)');
    expect(rendered).toContain('| now refused | 3.2 | passes | fails |');
    expect(rendered).not.toContain('| same |');
  });
});
