import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { StructureCase } from './structure-case.js';
import { judgeStructure, type ConvertedEndpoints } from './structure-verdict.js';
import type { Cell } from './verdict.js';

/**
 * Runs Castr on a document and takes the endpoint definitions it generated. It rejects
 * only where the harness itself fails: that stops the run, and is never a cell.
 */
export type ConvertEndpoints = (document: UnknownRecord) => Promise<ConvertedEndpoints>;

/**
 * Runs one case: Castr reads the document and its control, and the cell is what judging
 * the two gives.
 */
export async function runStructureCase(
  structureCase: StructureCase,
  convert: ConvertEndpoints,
): Promise<Cell> {
  const converted = await convert(structureCase.document);
  const control = await convert(structureCase.control);
  return judgeStructure(structureCase.expects, converted, control);
}
