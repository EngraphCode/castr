/**
 * What the JSON Schema documents of the cases accept and refuse, run under a validator.
 *
 * The cases note says of each document which values it accepts. Those statements are
 * data, in `__fixtures__/cases/json-schema-expectations.json`, and this module runs each
 * one. The validator is `@hyperjump/json-schema`: it agreed with the texts of both drafts
 * wherever the cases were checked against them, and Ajv does not (the note names where).
 * The texts decide what a schema accepts; the validator is how the statements are kept
 * from resting on the note's own word.
 */

import { readFileSync } from 'node:fs';

import {
  registerSchema,
  unregisterSchema,
  validate,
  type SchemaObject,
} from '@hyperjump/json-schema/draft-2020-12';
// Defines the Draft-07 dialect, which a document of that draft is read under.
import '@hyperjump/json-schema/draft-07';

import { isJsonValue, type JsonValue } from '../refusals/judge.js';
import { isJsonObject, type JsonObject } from '../rows/json.js';
import { oneOf, onlyKeys, text } from '../rows/text-constructs.js';

import { caseOf, type CaseDocuments } from './case-documents.js';

const DRAFTS = ['2020-12', 'draft-07'] as const;
type Draft = (typeof DRAFTS)[number];

const DIALECT: Readonly<Record<Draft, string>> = {
  '2020-12': 'https://json-schema.org/draft/2020-12/schema',
  'draft-07': 'http://json-schema.org/draft-07/schema#',
};

/** One statement of the note: this document, under this draft, accepts this value or not. */
export interface JsonSchemaExpectation {
  readonly case: string;
  /** Which JSON document of the case, counted from 0. */
  readonly document: number;
  readonly draft: Draft;
  /** Other documents of the case that are registered first, by their number. */
  readonly with: readonly number[];
  readonly instance: JsonValue;
  readonly accepts: boolean;
}

function wholeNumber(value: unknown, what: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${what} is not a count from 0`);
  }
  return value;
}

function readExpectation(entry: unknown, index: number): JsonSchemaExpectation {
  const what = `expectation ${String(index + 1)}`;
  if (!isJsonObject(entry)) {
    throw new TypeError(`${what} is not an object`);
  }
  onlyKeys(entry, ['case', 'document', 'draft', 'with', 'instance', 'accepts'], what);
  const { instance, accepts } = entry;
  const others: unknown = entry['with'] === undefined ? [] : entry['with'];
  if (!isJsonValue(instance)) {
    throw new TypeError(`${what} has no instance`);
  }
  if (typeof accepts !== 'boolean') {
    throw new TypeError(`${what} does not say whether the value is accepted`);
  }
  if (!Array.isArray(others)) {
    throw new TypeError(`${what}: with is not a list`);
  }
  return {
    case: text(entry['case'], `${what}: case`),
    document: wholeNumber(entry['document'], `${what}: document`),
    draft: oneOf(entry['draft'], DRAFTS, `${what}: draft`),
    with: others.map((other: unknown) => wholeNumber(other, `${what}: with`)),
    instance,
    accepts,
  };
}

/**
 * Reads expectations from a parsed file, refusing anything that is not of their shape.
 */
export function readJsonSchemaExpectationList(
  parsed: JsonObject,
): readonly JsonSchemaExpectation[] {
  onlyKeys(parsed, ['note', 'expectations'], 'the file of expectations');
  text(parsed['note'], 'the note of the file of expectations');
  const { expectations } = parsed;
  if (!Array.isArray(expectations)) {
    throw new TypeError('the file of expectations holds no list');
  }
  return expectations.map((entry: unknown, index) => readExpectation(entry, index));
}

/**
 * Reads the expectations of the JSON Schema cases.
 */
export function readJsonSchemaExpectations(): readonly JsonSchemaExpectation[] {
  const parsed: unknown = JSON.parse(
    readFileSync(
      new URL('../__fixtures__/cases/json-schema-expectations.json', import.meta.url),
      'utf8',
    ),
  );
  if (!isJsonObject(parsed)) {
    throw new TypeError('the file of expectations is not an object');
  }
  return readJsonSchemaExpectationList(parsed);
}

function schemaOf(document: JsonValue | undefined, what: string): SchemaObject | boolean {
  if (typeof document === 'boolean') {
    return document;
  }
  if (document === undefined || document === null || typeof document !== 'object') {
    throw new TypeError(`${what} is not a schema`);
  }
  if (Array.isArray(document)) {
    throw new TypeError(`${what} is not a schema`);
  }
  return { ...document };
}

let registered = 0;

/** Registers a schema under its own `$id` if it has an absolute one, or under a fresh address. */
function register(schema: SchemaObject | boolean, draft: Draft): string {
  const own = typeof schema === 'object' ? schema['$id'] : undefined;
  if (typeof own === 'string' && /^https?:/.test(own)) {
    registerSchema(schema, undefined, DIALECT[draft]);
    return own;
  }
  registered += 1;
  const address = `https://cases.invalid/${String(registered)}`;
  registerSchema(schema, address, DIALECT[draft]);
  return address;
}

/**
 * Says whether one document of a case accepts a value, under a draft.
 *
 * @param documents - the JSON documents of the case
 * @throws when the case has no document of that number, or the schema cannot be read
 */
export async function accepts(
  documents: readonly JsonValue[],
  expectation: Pick<JsonSchemaExpectation, 'document' | 'draft' | 'with' | 'instance'>,
): Promise<boolean> {
  const addresses: string[] = [];
  try {
    for (const other of [...expectation.with, expectation.document]) {
      addresses.push(
        register(schemaOf(documents[other], `document ${String(other)}`), expectation.draft),
      );
    }
    const output = await validate(addresses.at(-1) ?? '', expectation.instance);
    return output.valid;
  } finally {
    for (const used of addresses) {
      unregisterSchema(used);
    }
  }
}

/**
 * Runs every expectation against the cases, and names each that the validator contradicts.
 */
export async function contradictions(
  cases: readonly CaseDocuments[],
  expectations: readonly JsonSchemaExpectation[],
): Promise<readonly string[]> {
  const found: string[] = [];
  for (const expectation of expectations) {
    const result = await accepts(caseOf(cases, expectation.case).json, expectation);
    if (result !== expectation.accepts) {
      found.push(
        `${expectation.case} document ${String(expectation.document)} (${expectation.draft}) ` +
          `${result ? 'accepts' : 'refuses'} ${JSON.stringify(expectation.instance)}`,
      );
    }
  }
  return found;
}

/** One JSON document of a case, named by its case and its number among the case's JSON documents. */
export interface DocumentName {
  readonly case: string;
  readonly document: number;
}

function nameOf(name: DocumentName): string {
  return `${name.case} document ${String(name.document)}`;
}

/**
 * Reads the list of the JSON documents of the cases that are fragments of OpenAPI
 * documents. The kind of a document is stated in that list, never inferred from its
 * keys: a schema may hold any key, and a fragment may hold few.
 */
export function readOpenApiFragmentList(parsed: JsonObject): readonly DocumentName[] {
  onlyKeys(parsed, ['note', 'fragments'], 'the list of fragments');
  text(parsed['note'], 'the note of the list of fragments');
  const { fragments } = parsed;
  if (!Array.isArray(fragments)) {
    throw new TypeError('the list of fragments holds no list');
  }
  return fragments.map((entry: unknown, index) => {
    const what = `fragment ${String(index + 1)}`;
    if (!isJsonObject(entry)) {
      throw new TypeError(`${what} is not an object`);
    }
    onlyKeys(entry, ['case', 'document'], what);
    return {
      case: text(entry['case'], `${what}: case`),
      document: wholeNumber(entry['document'], `${what}: document`),
    };
  });
}

/**
 * Reads the list of OpenAPI fragments among the cases.
 */
export function readOpenApiFragments(): readonly DocumentName[] {
  const parsed: unknown = JSON.parse(
    readFileSync(new URL('../__fixtures__/cases/openapi-fragments.json', import.meta.url), 'utf8'),
  );
  if (!isJsonObject(parsed)) {
    throw new TypeError('the list of fragments is not an object');
  }
  return readOpenApiFragmentList(parsed);
}

/**
 * Says how the JSON documents of the cases are accounted for: each must be a fragment of
 * an OpenAPI document or a schema that an expectation runs, and never both.
 */
export function accountOfDocuments(
  cases: readonly CaseDocuments[],
  expectations: readonly JsonSchemaExpectation[],
  fragments: readonly DocumentName[],
): {
  readonly neither: readonly string[];
  readonly both: readonly string[];
  readonly absent: readonly string[];
} {
  const run = new Set(
    expectations.flatMap((expectation) =>
      [expectation.document, ...expectation.with].map((document) =>
        nameOf({ case: expectation.case, document }),
      ),
    ),
  );
  const openapi = new Set(fragments.map((fragment) => nameOf(fragment)));
  const held = cases.flatMap((entry) =>
    entry.json.map((_document, document) => nameOf({ case: entry.id, document })),
  );
  return {
    neither: held.filter((name) => !run.has(name) && !openapi.has(name)),
    both: held.filter((name) => run.has(name) && openapi.has(name)),
    absent: [...run, ...openapi].filter((name) => !held.includes(name)),
  };
}
