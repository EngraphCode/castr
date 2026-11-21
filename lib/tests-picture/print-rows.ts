/**
 * Prints the picture: every construct kind of an OpenAPI 3.1 or 3.2 document with its
 * proposed outcome in each of the three outputs, and, for the rows that have a case, what
 * each of Castr's outputs does for it today.
 *
 * Run with: `pnpm picture`
 */

import { runSchemaCases, runStructureCases, runTypeScriptCases } from './cases/run-schema-cases.js';
import { SCHEMA_CASES } from './cases/schema-cases.js';
import { SCHEMA_STRUCTURE_CASES } from './cases/schema-structure-cases.js';
import { ROWS_NO_CASE_ISOLATES, STRUCTURE_CASES } from './cases/structure-cases.js';
import { loadDefinition } from './rows/definitions.js';
import { pictureRows } from './rows/picture-rows.js';
import { renderRows, renderToday } from './rows/render.js';

const { rows, problems } = pictureRows(loadDefinition);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  const decided = await runSchemaCases(SCHEMA_CASES);
  const held = await runStructureCases(SCHEMA_STRUCTURE_CASES, 'Zod validators');
  const typescript = await runTypeScriptCases(SCHEMA_CASES, rows);
  const endpoints = await runStructureCases(
    STRUCTURE_CASES,
    'endpoint definitions',
    ROWS_NO_CASE_ISOLATES,
  );
  // A row has a deciding case or a structure case, never both, so the Zod column is the
  // two sets of cells together.
  const zod = new Map([...decided, ...held]);
  console.log(renderToday(rows, decided, "Castr's Zod output does"));
  console.log(renderToday(rows, held, "Castr's Zod output holds"));
  console.log(renderToday(rows, typescript, "Castr's TypeScript output does"));
  console.log(renderToday(rows, endpoints, "Castr's endpoint definitions hold"));
  console.log(renderRows(rows, { zod, typescript, endpoints }));
}
