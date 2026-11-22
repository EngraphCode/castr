/**
 * Holds, for each input, the case of SPEC-FV-1 decided outside Castr.
 */

import { describe, it, expect } from 'vitest';

import { caseThatHolds, READER_CASES, type CaseThatHolds } from './reader-cases.js';

const DECIDED: Readonly<Record<string, CaseThatHolds>> = {
  'a 3.1 document with the required fields': 'none',
  'a 3.2 document with the required fields': 'none',
  'the same 3.1 document written as YAML': 'none',
  'JSON that stops before it closes': 1,
  'YAML with a mapping that does not close': 1,
  'an OpenAPI 2.0 document': 2,
  'a `swagger` field beside `openapi: 3.1.0`': 2,
  'no `openapi` field': 2,
  'an OpenAPI 3.0.3 document': 2,
  '`openapi: 4.0.0`': 2,
  '`openapi: 3.1` written as a YAML number': 2,
  '`jsonSchemaDialect` naming Draft-07': 3,
  '`jsonSchemaDialect` naming Draft 2020-12': 'none',
  'a component schema whose `$schema` names Draft-07': 3,
  'a 3.2 document whose `jsonSchemaDialect` names the 3.1 dialect': 3,
  'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect at a revision': 'none',
  'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect as `base`': 'none',
  'a `jsonSchemaDialect` with a path below the 3.1 dialect': 3,
  'a `jsonSchemaDialect` that is a number': 4,
  '`swagger: null` beside `openapi: 3.1.0`': 2,
  'a list where the document stands': 2,
  'a 3.1 document that passes the revision 0.8.0 names and fails the latest': 'none',
  'a number larger than a JavaScript number holds': 'not decided',
  'a document with no `info`': 4,
  'a field the root does not have': 4,
};

describe('the cases of SPEC-FV-1, decided outside Castr', () => {
  it('are the case recorded for every input', async () => {
    const decided = Object.fromEntries(
      await Promise.all(
        READER_CASES.map(async ({ name, text }) => [name, await caseThatHolds(text)] as const),
      ),
    );

    expect(decided).toEqual(DECIDED);
  });
});
