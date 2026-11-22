/**
 * The judge of an OpenAPI document against the schema its publisher gives.
 *
 * SPEC-FV-1 case 4 asks whether a document "fails the schema its publisher gives for its
 * version line, at the revision this section names". This module answers that from
 * outside Castr. The schemas of the OpenAPI Initiative it judges by are the pinned copies
 * and no others, and it never reads the network. The JSON Schema 2020-12 meta-schema,
 * which the two dialects refer to, is the copy the validator carries.
 *
 * The validator is `@hyperjump/json-schema`. Ajv, which judges the picture's values, cannot
 * judge these schemas: they reach a Schema Object through `"$dynamicRef": "#meta"` with the
 * anchor under `$defs`, and Ajv honours a dynamic anchor only at a schema's root.
 */

import { removeUriSchemePlugin } from '@hyperjump/browser';
import { registerSchema, validate } from '@hyperjump/json-schema/draft-2020-12';
// Each of these defines the vocabulary its line's dialect names. Without them the
// `schema-base` files cannot be read.
import '@hyperjump/json-schema/openapi-3-1';
import '@hyperjump/json-schema/openapi-3-2';

import { loadDefinition, readPins } from '../rows/definitions.js';

/**
 * A JSON value, as the judge receives a document or a schema.
 */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * One place a document fails a schema.
 */
interface Failure {
  /** Where in the document, as the validator reports it. */
  readonly at: string;
  /** The keyword of the schema that refused it, as an absolute location. */
  readonly keyword: string;
}

/**
 * What a published schema says of one document.
 */
export interface Judgement {
  readonly passes: boolean;
  readonly failures: readonly Failure[];
}

const PUBLISHER = 'https://spec.openapis.org/oas/';

function isPlainObject(value: object): boolean {
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isJsonWithin(value: unknown, seen: ReadonlySet<unknown>): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value !== 'object' || seen.has(value)) {
    return false;
  }
  const within = new Set([...seen, value]);
  if (Array.isArray(value)) {
    // A hole is not a JSON value, and `every` would skip it.
    return Array.from(value, (member: unknown) => member).every((member) =>
      isJsonWithin(member, within),
    );
  }
  return (
    isPlainObject(value) && Object.values(value).every((member) => isJsonWithin(member, within))
  );
}

/**
 * Narrows a parsed value to JSON: plain objects, arrays without holes, and finite
 * numbers. A value that holds itself is not JSON.
 */
export function isJsonValue(value: unknown): value is JsonValue {
  return isJsonWithin(value, new Set());
}

const pinned = new Set<string>();

/**
 * Registers every pinned definition the publisher of OpenAPI gives, once, and stops the
 * validator from loading anything else.
 */
function prepare(): void {
  if (pinned.size > 0) {
    return;
  }
  // A schema that is not pinned here must be an error, never a fetch or a file read.
  for (const scheme of ['http', 'https', 'file']) {
    removeUriSchemePlugin(scheme);
  }
  for (const pin of readPins()) {
    if (!pin.id.startsWith(PUBLISHER)) {
      continue;
    }
    const { schema } = loadDefinition(pin.file);
    if (!isJsonValue(schema) || typeof schema !== 'object' || Array.isArray(schema)) {
      throw new TypeError(`${pin.file} is not a JSON object`);
    }
    registerSchema({ ...schema });
    pinned.add(pin.id);
  }
}

interface OutputUnit {
  readonly keyword: string;
  readonly absoluteKeywordLocation: string;
  readonly instanceLocation: string;
  readonly errors?: readonly OutputUnit[];
}

function failuresIn(units: readonly OutputUnit[]): readonly Failure[] {
  return units.flatMap((unit) => [
    { at: unit.instanceLocation, keyword: unit.absoluteKeywordLocation },
    ...failuresIn(unit.errors ?? []),
  ]);
}

/**
 * Judges a document against one pinned schema, named by its identifier.
 *
 * @param schemaId - the `$id` of a pinned schema of the publisher's
 * @param document - the document as parsed
 * @throws when the schema is not pinned here, or the document is not JSON
 */
export async function judgeDocument(schemaId: string, document: unknown): Promise<Judgement> {
  prepare();
  // The library carries copies of the publisher's schemas under undated addresses. Only
  // a schema pinned here may judge.
  if (!pinned.has(schemaId)) {
    throw new Error(`${schemaId} is not a schema pinned here`);
  }
  if (!isJsonValue(document)) {
    throw new TypeError('the document is not a JSON value');
  }
  const output = await validate(schemaId, document, 'BASIC');
  if (output.valid) {
    return { passes: true, failures: [] };
  }
  return { passes: false, failures: failuresIn(output.errors ?? []) };
}
