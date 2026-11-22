/**
 * Holds what Castr does today with each input of the reader's cases: the verdict, and
 * Castr's own words. A cell that changes fails here, so that it is looked at; the words
 * are held because a refusal for another reason reads the same in the verdict.
 */

import { describe, it, expect } from 'vitest';

import { readerVerdict, READER_CASES, type ReaderVerdict } from './reader-cases.js';
import { runReaderCases } from './run-reader-cases.js';

const CASTR_TODAY: Readonly<Record<string, readonly [verdict: ReaderVerdict, words: string]>> = {
  'a 3.1 document with the required fields': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a 3.2 document with the required fields': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'the same 3.1 document written as YAML': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'JSON that stops before it closes': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-4.json): Failed to resolve input: Please provide a valid string value or pass a loader to process the input',
  ],
  'YAML with a mapping that does not close': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-5.yaml): Failed to resolve input: Please provide a valid string value or pass a loader to process the input',
  ],
  'an OpenAPI 2.0 document': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a `swagger` field beside `openapi: 3.1.0`': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-7.json): Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: Property openapi is not expected to be here ❌ Error 2: Location: (root) Issue: Property components is not expected to be here',
  ],
  'no `openapi` field': [
    'refuses, with no kind',
    "Failed to load OpenAPI document (input-8.json): Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
  ],
  'an OpenAPI 3.0.3 document': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  '`openapi: 4.0.0`': [
    'refuses, with no kind',
    "Failed to load OpenAPI document (input-10.json): Invalid OpenAPI 4.0.0 document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
  ],
  '`openapi: 3.1` written as a YAML number': [
    'refuses, with no kind',
    "Failed to load OpenAPI document (input-11.yaml): Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find supported Swagger/OpenAPI version in the provided document, version must be a string.",
  ],
  '`jsonSchemaDialect` naming Draft-07': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  '`jsonSchemaDialect` naming Draft 2020-12': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a component schema whose `$schema` names Draft-07': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a 3.2 document whose `jsonSchemaDialect` names the 3.1 dialect': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect at a revision': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a 3.1 document whose `jsonSchemaDialect` names the 3.1 dialect as `base`': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a `jsonSchemaDialect` with a path below the 3.1 dialect': [
    'reads it',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a `jsonSchemaDialect` that is a number': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-19.json): Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: jsonSchemaDialect Issue: type must be string',
  ],
  '`swagger: null` beside `openapi: 3.1.0`': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-20.json): Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: Property swagger is not expected to be here',
  ],
  'a list where the document stands': [
    'refuses, with no kind',
    "Failed to load OpenAPI document (input-21.json): Invalid OpenAPI document: ❌ Error 1: Location: (root) Issue: Can't find JSON, YAML or filename in data.",
  ],
  'a 3.1 document that passes the revision 0.8.0 names and fails the latest': [
    'right',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: 1 endpoint definition',
  ],
  'a number larger than a JavaScript number holds': [
    'not judged',
    'Zod: 1 validator; TypeScript: 1 type; endpoint definitions: the module holds no endpoint definitions',
  ],
  'a document with no `info`': [
    'refuses, with no kind',
    "Failed to load OpenAPI document (input-24.json): Invalid OpenAPI 3.1.0 document: ❌ Error 1: Location: (root) Issue: must have required property 'info'",
  ],
  'a field the root does not have': [
    'refuses, with no kind',
    'Failed to load OpenAPI document (input-25.json): Invalid OpenAPI 3.2.0 document: ❌ Error 1: Location: (root) Issue: Property bogus is not expected to be here',
  ],
};

describe('what Castr does with each input today', () => {
  it('is the verdict and the words recorded for every input', async () => {
    const lines = await runReaderCases(READER_CASES);

    const cells = Object.fromEntries(
      lines.map((line) => [line.name, [readerVerdict(line.holds, line.did), line.did.detail]]),
    );

    expect(cells).toEqual(CASTR_TODAY);
  });
});
