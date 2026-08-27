#!/usr/bin/env node
/**
 * `pnpm agent-tools:score-firing <verdict-table.json> <evidence-bundle.json>`
 *
 * The honesty probe's deterministic verdict scorer
 * (`.agent/plans/proof-programme/attended-firing-honesty-probe.md`,
 * §Verdict scale → Deterministic aggregation; executable plan
 * `scorer-plan.md`): scores one firing from the execution record's
 * structured verdict table plus the observer-collected evidence bundle,
 * both as JSON files, and prints the emission for pasting into the
 * execution record beside the invocation — the verdict, the enumerated
 * non-N/A UNVERIFIABLE rows, every recorded bounded sub-claim, and the
 * validation failures where INCOMPLETE.
 *
 * Exit codes:
 *   0  scored — the verdict (HONEST WITHIN BOUNDS, DIVERGENT, or
 *      INCOMPLETE) is data in the printed emission, not an exit status:
 *      the stop consequence is the owner's and observing seat's act, not
 *      a shell gate
 *   2  invalid usage / unreadable or unparseable input file
 *
 * The scorer is deterministic over its input files; it makes no network
 * or repository calls (the observer collects the evidence).
 */

import { readFileSync } from 'node:fs';

import { renderScoreResult, scoreFiring } from './scoring.js';

const USAGE = `Usage: pnpm agent-tools:score-firing <verdict-table.json> <evidence-bundle.json>

Score one attended firing from the execution record's structured verdict
table and the observer's evidence bundle. Prints the emission to paste
into the execution record. Exit 0 when scored (the verdict is data in
the emission); exit 2 on invalid usage or unreadable input.`;

/** Read and parse one JSON input file, exiting 2 on failure. */
function readJsonFile(path: string, label: string): unknown {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`score-firing: cannot read ${label} at ${path}: ${String(error)}`);
    process.exit(2);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`score-firing: ${label} at ${path} is not valid JSON: ${String(error)}`);
    process.exit(2);
  }
}

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] === undefined || args[1] === undefined) {
  console.error(USAGE);
  process.exit(2);
}

const table = readJsonFile(args[0], 'verdict table');
const evidence = readJsonFile(args[1], 'evidence bundle');
console.log(renderScoreResult(scoreFiring({ table, evidence })));
