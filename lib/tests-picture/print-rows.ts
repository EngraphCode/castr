/**
 * Prints the picture: every construct kind of an OpenAPI 3.1 or 3.2 document with its
 * proposed outcome in each of the three outputs, and, for the rows that have a case, what
 * Castr's Zod output does for it today.
 *
 * Run with: `pnpm picture`
 */

import { createCastrConvert } from './cases/castr-convert.js';
import { runCase } from './cases/run-case.js';
import { SCHEMA_CASES } from './cases/schema-cases.js';
import type { Cell } from './cases/verdict.js';
import { loadDefinition } from './rows/definitions.js';
import { pictureRows } from './rows/picture-rows.js';
import { renderRows, renderToday } from './rows/render.js';

const { rows, problems } = pictureRows(loadDefinition);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  const today = new Map<string, Cell>();
  const castr = await createCastrConvert();
  try {
    for (const schemaCase of SCHEMA_CASES) {
      today.set(schemaCase.rowId, await runCase(schemaCase, castr.convert));
    }
  } finally {
    await castr.dispose();
  }
  console.log(renderToday(rows, today));
  console.log(renderRows(rows, today));
}
