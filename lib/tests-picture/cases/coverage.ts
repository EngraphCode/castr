import type { Row } from '../rows/table.js';

import { ZOD_READING, type Reading } from './run-case.js';
import type { SchemaCase } from './schema-case.js';
import { judgeAdmits } from './verdict.js';

/**
 * A row needs a deciding case where it is part of a schema and Zod is proposed to carry
 * it: its construct decides which values are accepted, so a case can show Castr deciding
 * as the source does. Rows carried as structure or by companion need a different proof.
 */
export function needsDecidingCase(row: Row): boolean {
  return row.group !== 'document' && row.proposal.zod === 'carried';
}

/**
 * How the cases cover the rows.
 */
export interface Coverage {
  /** Rows that need a deciding case and have none. */
  readonly uncased: readonly string[];
  /** Cases whose row is not a row of the picture. */
  readonly strays: readonly string[];
  /** Rows with more than one case. */
  readonly repeated: readonly string[];
}

/**
 * Sets the cases against the rows.
 */
export function coverageOf(rows: readonly Row[], cases: readonly SchemaCase[]): Coverage {
  const rowIds = new Set(rows.map((row) => row.id));
  const cased = cases.map((schemaCase) => schemaCase.rowId);
  return {
    uncased: rows
      .filter((row) => needsDecidingCase(row) && !cased.includes(row.id))
      .map((row) => row.id),
    strays: cased.filter((id) => !rowIds.has(id)),
    repeated: [...new Set(cased.filter((id, index) => cased.indexOf(id) !== index))],
  };
}

const TYPE_DECIDES: Reading = { emits: 'type', judge: ZOD_READING.judge };
const TYPE_ADMITS: Reading = { emits: 'type', judge: judgeAdmits };

/**
 * How a case's type is held against the reference, from what is proposed for its row. A
 * construct TypeScript is proposed to carry must be decided by the type as the source
 * decides it. One proposed as carried by companion is the companion's to refuse, so the
 * type need only admit what the source accepts. Any other proposal has no reading: a
 * deciding case says nothing about it.
 */
export function typescriptReadingFor(row: Row): Reading | undefined {
  if (row.proposal.typescript === 'carried') {
    return TYPE_DECIDES;
  }
  return row.proposal.typescript === 'carried by companion' ? TYPE_ADMITS : undefined;
}
