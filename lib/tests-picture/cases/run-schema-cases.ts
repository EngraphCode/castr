import type { Row } from '../rows/table.js';

import { createCastrConvert } from './castr-convert.js';
import { typescriptReadingFor } from './coverage.js';
import { runCase } from './run-case.js';
import { runStructureCase } from './run-structure-case.js';
import type { SchemaCase } from './schema-case.js';
import type { StructureCase } from './structure-case.js';
import type { Cell } from './verdict.js';

/**
 * Runs every case through Castr and the reference validator, and gives the cell for each
 * by the identity of its row. The files Castr's output is written to are removed before
 * it returns, whether or not a case failed.
 */
export async function runSchemaCases(
  cases: readonly SchemaCase[],
): Promise<ReadonlyMap<string, Cell>> {
  const cells = new Map<string, Cell>();
  const castr = await createCastrConvert();
  try {
    for (const schemaCase of cases) {
      cells.set(schemaCase.rowId, await runCase(schemaCase, castr.convert));
    }
  } finally {
    await castr.dispose();
  }
  return cells;
}

/**
 * Runs every case through Castr and has the TypeScript compiler check each sample
 * against the type Castr generated, read as the proposal for the case's row says. A case
 * whose row has no reading for a type is given no cell.
 */
export async function runTypeScriptCases(
  cases: readonly SchemaCase[],
  rows: readonly Row[],
): Promise<ReadonlyMap<string, Cell>> {
  const rowOf = new Map(rows.map((row) => [row.id, row]));
  const cells = new Map<string, Cell>();
  const castr = await createCastrConvert();
  try {
    for (const schemaCase of cases) {
      const row = rowOf.get(schemaCase.rowId);
      const reading = row === undefined ? undefined : typescriptReadingFor(row);
      if (reading !== undefined) {
        cells.set(schemaCase.rowId, await runCase(schemaCase, castr.convertType, reading));
      }
    }
  } finally {
    await castr.dispose();
  }
  return cells;
}

/**
 * Runs every structure case through Castr, and gives the cell for each by the identity of
 * its row: whether the endpoint definitions hold what the case's construct states. A row
 * that no case can isolate is given a cell that is not judged, with the reason.
 */
export async function runStructureCases(
  cases: readonly StructureCase[],
  noCaseIsolates: ReadonlyMap<string, string> = new Map(),
): Promise<ReadonlyMap<string, Cell>> {
  const cells = new Map<string, Cell>();
  const castr = await createCastrConvert();
  try {
    for (const structureCase of cases) {
      cells.set(structureCase.rowId, await runStructureCase(structureCase, castr.convertEndpoints));
    }
  } finally {
    await castr.dispose();
  }
  for (const [rowId, reason] of noCaseIsolates) {
    cells.set(rowId, { verdict: 'not judged', detail: reason });
  }
  return cells;
}

/**
 * The rows whose cell has a given verdict, in the order of the cases.
 */
export function rowsWith(cells: ReadonlyMap<string, Cell>, verdict: Cell['verdict']): string[] {
  return [...cells].filter(([, cell]) => cell.verdict === verdict).map(([rowId]) => rowId);
}
