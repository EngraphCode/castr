/**
 * Holds, for each input of the reader's cases, the case of SPEC-FV-1 decided outside
 * Castr, and what Castr does with the input today: the verdict and Castr's own words. A
 * cell that changes fails here, so that it is looked at. The words are held because a
 * refusal for another reason reads the same in the verdict.
 */

import { describe, it, expect } from 'vitest';

import {
  caseThatHolds,
  readerVerdict,
  READER_CASES,
  type CaseThatHolds,
  type ReaderVerdict,
} from './reader-cases.js';
import { runReaderCases } from './run-reader-cases.js';

/** What Castr says of an input it reads that holds one schema and no operation. */
const READS =
  'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions';

function notLoaded(why: string): string {
  return `Failed to load OpenAPI document (the input): ${why}`;
}

type Expected = readonly [
  name: string,
  decided: CaseThatHolds,
  castrToday: ReaderVerdict,
  castrSays: string,
];

const EXPECTED: readonly Expected[] = [
  ['a 3.1 document with the required fields', 'none', 'right', READS],
  ['a 3.2 document with the required fields', 'none', 'right', READS],
  ['the same 3.1 document written as YAML', 'none', 'right', READS],
  [
    'JSON that stops before it closes',
    1,
    'refuses, with no kind',
    notLoaded(
      'Failed to resolve input: Please provide a valid string value or pass a loader to process the input',
    ),
  ],
  [
    'YAML with a mapping that does not close',
    1,
    'refuses, with no kind',
    notLoaded(
      'Failed to resolve input: Please provide a valid string value or pass a loader to process the input',
    ),
  ],
  ['an OpenAPI 2.0 document', 2, 'reads it', READS],
  [
    'a `swagger` field beside `openapi: 3.1.0`',
    2,
    'refuses, with no kind',
    notLoaded(
      'Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: Property openapi is not expected to be here ❌ Error 2: Location: (root) Issue: Property components is not expected to be here',
    ),
  ],
  [
    'no `openapi` field',
    2,
    'refuses, with no kind',
    notLoaded(
      "Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
    ),
  ],
  ['an OpenAPI 3.0.3 document', 2, 'reads it', READS],
  [
    '`openapi: 4.0.0`',
    2,
    'refuses, with no kind',
    notLoaded(
      "Invalid OpenAPI 4.0.0 document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
    ),
  ],
  [
    '`openapi: 3.1` written as a YAML number',
    2,
    'refuses, with no kind',
    notLoaded(
      "Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
    ),
  ],
  ['`jsonSchemaDialect` naming Draft-07', 3, 'reads it', READS],
  ['`jsonSchemaDialect` naming Draft 2020-12', 'none', 'right', READS],
  ['a component schema whose `$schema` names Draft-07', 3, 'reads it', READS],
  ['a component schema whose `$schema` is a number', 'not decided', 'not judged', READS],
  ['a 3.2 document whose `jsonSchemaDialect` names the 3.1 dialect', 3, 'reads it', READS],
  [
    'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect at a revision',
    'none',
    'right',
    READS,
  ],
  [
    'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect as `base`',
    'none',
    'right',
    READS,
  ],
  [
    'a `jsonSchemaDialect` naming the 3.1 dialect at a date no pinned file names',
    'not decided',
    'not judged',
    READS,
  ],
  ['a `jsonSchemaDialect` with a path below the 3.1 dialect', 3, 'reads it', READS],
  [
    'a `jsonSchemaDialect` that is a number',
    4,
    'refuses, with no kind',
    notLoaded(
      'Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: jsonSchemaDialect Issue: type must be string',
    ),
  ],
  [
    '`swagger: null` beside `openapi: 3.1.0`',
    2,
    'refuses, with no kind',
    notLoaded(
      'Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: Property swagger is not expected to be here',
    ),
  ],
  [
    'a list where the document stands',
    2,
    'refuses, with no kind',
    notLoaded(
      "Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find JSON, YAML or filename in data.",
    ),
  ],
  [
    'a 3.1 document that passes the revision 0.8.0 names and fails the latest',
    'none',
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: 1 endpoint definition',
  ],
  ['a number larger than a JavaScript number holds', 'not decided', 'not judged', READS],
  [
    'a document with no `info`',
    4,
    'refuses, with no kind',
    notLoaded(
      "Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: must have required property 'info'",
    ),
  ],
  [
    'a field the root does not have',
    4,
    'refuses, with no kind',
    notLoaded(
      'Invalid OpenAPI 3.2.0 document: ❌ Error 1: Location: (root) Issue: Property bogus is not expected to be here',
    ),
  ],
];

describe('the cases of SPEC-FV-1, decided outside Castr', () => {
  it('are the case recorded for every input', async () => {
    const decided = await Promise.all(
      READER_CASES.map(async ({ name, text }) => [name, await caseThatHolds(text)]),
    );

    expect(decided).toEqual(EXPECTED.map(([name, holds]) => [name, holds]));
  });
});

describe('what Castr does with each input today', () => {
  it('is the verdict and the words recorded for every input', async () => {
    const lines = await runReaderCases(READER_CASES);

    const cells = lines.map((line) => [
      line.name,
      readerVerdict(line.holds, line.did),
      line.did.detail,
    ]);

    expect(cells).toEqual(EXPECTED.map(([name, , verdict, says]) => [name, verdict, says]));
  }, 120_000);
});
