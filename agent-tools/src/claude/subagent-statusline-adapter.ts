/**
 * Impure stdin/stdout adapter for the Claude Code SUBAGENT statusline.
 *
 * @remarks
 * Reads the harness's one-payload-per-refresh JSON from stdin, plans via the
 * pure `subagent-statusline.ts`, and writes one `{"id","content"}` JSON line
 * per addressable task to stdout. A no-op plan writes nothing (default
 * harness rendering applies). Spawned by `.claude/scripts/subagent-statusline.mjs`.
 *
 * @packageDocumentation
 */

import { planSubagentStatusline } from './subagent-statusline.js';

let stdinBuffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  stdinBuffer += chunk;
});
process.stdin.on('end', () => {
  // COLUMNS is set by the harness before the script runs (platform contract:
  // code.claude.com/docs/en/statusline §how-status-lines-work, v2.1.153+).
  const plan = planSubagentStatusline(stdinBuffer, process.env['COLUMNS']);
  if (plan.kind === 'render' && plan.rows.length > 0) {
    process.stdout.write(`${plan.rows.join('\n')}\n`);
  }
});
