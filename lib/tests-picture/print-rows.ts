/**
 * Prints the picture's rows as Markdown tables: every construct kind of an OpenAPI 3.1
 * or 3.2 document with its proposed outcome in each of the three outputs.
 *
 * Run with: `pnpm picture`
 */

import { loadDefinition } from './rows/definitions.js';
import { pictureRows } from './rows/picture-rows.js';
import { renderRows } from './rows/render.js';

const { rows, problems } = pictureRows(loadDefinition);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(renderRows(rows));
}
