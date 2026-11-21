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

/**
 * A row needs a structure case where it is part of a document outside a schema and the
 * endpoint definitions are proposed to carry it as structure: a case can show that what
 * the construct states is held there.
 */
export function needsStructureCase(row: Row): boolean {
  return row.group === 'document' && row.proposal.endpoints === 'carried as structure';
}

/**
 * A row needs a structure case in the Zod column where it is part of a schema and the Zod
 * output is proposed to carry it as structure: the construct decides no value, and a case
 * can show that the validators hold what it states.
 */
export function needsZodStructureCase(row: Row): boolean {
  return row.group !== 'document' && row.proposal.zod === 'carried as structure';
}

/**
 * Sets the structure cases against the rows that `needs` one. A case for a row that
 * needs none is a stray, as is a case for a row that does not exist.
 */
export function structureCoverageOf(
  rows: readonly Row[],
  cases: readonly { readonly rowId: string }[],
  needs: (row: Row) => boolean = needsStructureCase,
): Coverage {
  const needing = rows.filter(needs).map((row) => row.id);
  const cased = cases.map((structureCase) => structureCase.rowId);
  return {
    uncased: needing.filter((id) => !cased.includes(id)),
    strays: cased.filter((id) => !needing.includes(id)),
    repeated: [...new Set(cased.filter((id, index) => cased.indexOf(id) !== index))],
  };
}
