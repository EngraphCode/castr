import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import { CASE_COMPONENT } from './schema-case.js';

const DOCUMENT_ID = 'https://castr.invalid/case';

/**
 * The reference validator's reading of a case: a function that decides a value, or the
 * reason it could not read the schema.
 */
export type Reference =
  | { readonly readable: true; readonly accepts: (value: unknown) => boolean }
  | { readonly readable: false; readonly reason: string };

/**
 * Reads a case's schema with a validator that is independent of Castr: Ajv for JSON
 * Schema 2020-12, with `format` asserting (SPEC-P-3). It resolves references against the
 * whole document, as the document itself states them.
 */
export function referenceFor(document: UnknownRecord): Reference {
  // Keywords OpenAPI adds (`discriminator`, `xml`) are annotations to JSON Schema, so the
  // validator is told not to refuse a keyword it does not know.
  // The validator passes over a `format` it has no checker for and says so in a warning.
  // A case it read that way is not judged: its decisions would prove nothing.
  const warnings: string[] = [];
  const note = (...parts: readonly unknown[]): void => {
    warnings.push(parts.map(String).join(' '));
  };
  const ajv = new Ajv2020({
    strict: false,
    validateFormats: true,
    // JSON Schema speaks of the properties a value has. Without this the validator also
    // reads the members every JavaScript object inherits (`toString`, `constructor`).
    ownProperties: true,
    logger: { log: note, warn: note, error: note },
  });
  addFormats.default(ajv);
  try {
    ajv.addSchema({ $id: DOCUMENT_ID, ...document });
    const validate = ajv.getSchema(`${DOCUMENT_ID}#/components/schemas/${CASE_COMPONENT}`);
    if (validate === undefined) {
      return { readable: false, reason: 'the reference validator found no schema for the case' };
    }
    const [warning] = warnings;
    if (warning !== undefined) {
      return { readable: false, reason: `the reference validator does not check it: ${warning}` };
    }
    return { readable: true, accepts: (value) => validate(value) === true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { readable: false, reason };
  }
}
