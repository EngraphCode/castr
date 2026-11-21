import { createCastrConvert } from './castr-convert.js';
import { runCase } from './run-case.js';
import type { SchemaCase } from './schema-case.js';
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
 * The rows whose cell has a given verdict, in the order of the cases.
 */
export function rowsWith(cells: ReadonlyMap<string, Cell>, verdict: Cell['verdict']): string[] {
  return [...cells].filter(([, cell]) => cell.verdict === verdict).map(([rowId]) => rowId);
}
