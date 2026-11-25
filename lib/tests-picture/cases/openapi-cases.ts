/**
 * The OpenAPI fragments of the cases, judged by the schema the publisher gives.
 *
 * A case shows the part of an OpenAPI document that matters and leaves out `openapi` and
 * `info`. With those two supplied, each fragment is judged against the pinned schema of
 * a version line. This proves a fragment is a document the publisher's schema admits; it
 * proves nothing of what the text says the document means.
 */

import { judgeDocument, type JsonValue } from '../refusals/judge.js';

import { caseOf, type CaseDocuments } from './case-documents.js';
import type { DocumentName } from './json-schema-cases.js';

/** The pinned schema of each version line, and a version to state in `openapi`. */
const OPENAPI_LINES = {
  '3.1': { schema: 'https://spec.openapis.org/oas/3.1/schema/2026-11-05', version: '3.1.2' },
  '3.2': { schema: 'https://spec.openapis.org/oas/3.2/schema/2026-11-12', version: '3.2.1' },
} as const;

type OpenApiLine = keyof typeof OPENAPI_LINES;

/**
 * Makes a whole document of a fragment: the fragment's fields, with `openapi` and, where
 * the fragment has none, `info`.
 */
export function wholeDocument(fragment: JsonValue, version: string): JsonValue {
  if (fragment === null || typeof fragment !== 'object' || Array.isArray(fragment)) {
    throw new TypeError('a fragment of an OpenAPI document is an object');
  }
  return { info: { title: 'A case', version: '1' }, ...fragment, openapi: version };
}

/**
 * Names each case that holds a fragment the schema of a version line refuses.
 *
 * @throws when a fragment names a document its case does not have
 */
export async function casesRefused(
  cases: readonly CaseDocuments[],
  fragments: readonly DocumentName[],
  line: OpenApiLine,
): Promise<readonly string[]> {
  const refused: string[] = [];
  const { schema, version } = OPENAPI_LINES[line];
  for (const fragment of fragments) {
    const document = caseOf(cases, fragment.case).json[fragment.document];
    if (document === undefined) {
      throw new Error(`case ${fragment.case} has no document ${String(fragment.document)}`);
    }
    const judgement = await judgeDocument(schema, wholeDocument(document, version));
    if (!judgement.passes && !refused.includes(fragment.case)) {
      refused.push(fragment.case);
    }
  }
  return refused;
}
