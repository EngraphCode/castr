#!/usr/bin/env node
import { runSemanticMergeDriver } from '../semantic-merge/semantic-merge-driver.js';

/**
 * git merge-driver entry point. git invokes `<this> %O %A %B %P` on a conflict in
 * a `merge=engraph-semantic-merge` path; we refuse loudly and route to the skill.
 * See `../semantic-merge/semantic-merge-driver.ts`.
 */
process.exit(
  runSemanticMergeDriver(process.argv.slice(2), (line) => process.stderr.write(`${line}\n`)),
);
