/**
 * Prints the picture: every construct kind of an OpenAPI 3.1 or 3.2 document with its
 * proposed outcome in each of the three outputs, and, for the rows that have a case, what
 * Castr's Zod output does for it today.
 *
 * Run with: `pnpm picture`
 */

import { runSchemaCases } from './cases/run-schema-cases.js';
import { SCHEMA_CASES } from './cases/schema-cases.js';
import { loadDefinition } from './rows/definitions.js';
import { pictureRows } from './rows/picture-rows.js';
import { renderRows, renderToday } from './rows/render.js';

const { rows, problems } = pictureRows(loadDefinition);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  const today = await runSchemaCases(SCHEMA_CASES);
  console.log(renderToday(rows, today));
  console.log(renderRows(rows, today));
}
