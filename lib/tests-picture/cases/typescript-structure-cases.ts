import type { Row } from '../rows/table.js';

import { needsTypeScriptStructureCase } from './coverage.js';
import { SCHEMA_STRUCTURE_CASES } from './schema-structure-cases.js';
import type { StructureCase } from './structure-case.js';
import { NAMED_SCHEMA_CASE, ROWS_NO_CASE_ISOLATES, STRUCTURE_CASES } from './structure-cases.js';

const EVERY_PAIR: readonly StructureCase[] = [
  ...STRUCTURE_CASES,
  NAMED_SCHEMA_CASE,
  ...SCHEMA_STRUCTURE_CASES,
];

/**
 * The cases the TypeScript column is read from, for a construct that decides no value:
 * the pairs of documents the other two columns use, for each row the TypeScript output
 * is proposed to carry. The documents are the same; what is read from them is the types.
 */
export function typescriptStructureCases(rows: readonly Row[]): readonly StructureCase[] {
  const needing = new Set(rows.filter(needsTypeScriptStructureCase).map((row) => row.id));
  return EVERY_PAIR.filter((structureCase) => needing.has(structureCase.rowId));
}

/**
 * The rows of the TypeScript column that no pair of documents can isolate, each with the
 * reason.
 */
export function typescriptRowsNoCaseIsolates(rows: readonly Row[]): ReadonlyMap<string, string> {
  const needing = new Set(rows.filter(needsTypeScriptStructureCase).map((row) => row.id));
  return new Map([...ROWS_NO_CASE_ISOLATES].filter(([rowId]) => needing.has(rowId)));
}
