import { isJsonObject, membersOf } from '../rows/json.js';

import { referenceFor } from './reference.js';
import { documentFor, type SchemaCase } from './schema-case.js';

/**
 * The keyword a case's row names, where it names one: the keyword itself, `format` for a
 * row of a `format` value, `type` for a row of a `type` value. Rows for a construct that
 * is not a keyword (a boolean schema, a list of types) name none.
 */
export function namedKeywordOf(rowId: string): string | undefined {
  if (rowId.startsWith('keyword:')) {
    return rowId.slice('keyword:'.length);
  }
  if (rowId.startsWith('text:format: ')) {
    return 'format';
  }
  if (rowId.startsWith('type:')) {
    return 'type';
  }
  return undefined;
}

/**
 * A schema with every use of one keyword taken out: the control for a case. Whatever the
 * case's schema decides differently from its control, the keyword decided.
 */
export function withoutKeyword(schema: unknown, keyword: string): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item: unknown) => withoutKeyword(item, keyword));
  }
  if (!isJsonObject(schema)) {
    return schema;
  }
  return Object.fromEntries(
    membersOf(schema)
      .filter(([key]) => key !== keyword)
      .map(([key, value]) => [key, withoutKeyword(value, keyword)]),
  );
}

/**
 * The cases whose named keyword decides nothing: the reference validator decides every
 * sample the same with the keyword as without it. Such a case could certify a row it
 * never exercises. A case that names no keyword, or that the reference cannot check with
 * or without the keyword, is not counted.
 */
export function casesTheirKeywordDoesNotDecide(cases: readonly SchemaCase[]): readonly string[] {
  const undecided: string[] = [];
  for (const schemaCase of cases) {
    const keyword = namedKeywordOf(schemaCase.rowId);
    if (keyword !== undefined) {
      const control = { ...schemaCase, schema: withoutKeyword(schemaCase.schema, keyword) };
      const withIt = referenceFor(documentFor(schemaCase));
      const withoutIt = referenceFor(documentFor(control));
      if (
        withIt.readable &&
        withoutIt.readable &&
        schemaCase.samples.every((sample) => withIt.accepts(sample) === withoutIt.accepts(sample))
      ) {
        undecided.push(schemaCase.rowId);
      }
    }
  }
  return undecided;
}
