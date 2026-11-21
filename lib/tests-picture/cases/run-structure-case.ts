import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { StructureCase } from './structure-case.js';
import {
  judgeStructure,
  type ConvertedStructure,
  type StructureOutput,
} from './structure-verdict.js';
import type { Cell } from './verdict.js';

/**
 * Runs Castr on a document and takes one of the outputs it generated. It rejects
 * only where the harness itself fails: that stops the run, and is never a cell.
 */
export type ConvertStructure = (document: UnknownRecord) => Promise<ConvertedStructure>;

/**
 * Runs one case: Castr reads the document, its control and each document that gives the
 * construct another value, and the cell is what judging them gives. `output` names what
 * `convert` reads, as a cell writes it.
 */
export async function runStructureCase(
  structureCase: StructureCase,
  convert: ConvertStructure,
  output: StructureOutput,
): Promise<Cell> {
  const converted = await convert(structureCase.document);
  const control = await convert(structureCase.control);
  const others: ConvertedStructure[] = [];
  for (const other of structureCase.apartFrom ?? []) {
    others.push(await convert(other));
  }
  return judgeStructure(output, structureCase.expects, converted, control, others);
}
