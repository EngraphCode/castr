#!/usr/bin/env node
import { runSemanticMergeDriver } from '../semantic-merge/semantic-merge-driver.js';

/**
 * git merge-driver entry point. git invokes `<this> %O %A %B %P` on a conflict in
 * a `merge=engraph-semantic-merge` path; we refuse loudly and route to the skill.
 * The registered command names this file's build by its path within the checkout,
 * so a checkout without `agent-tools/dist` halts such merges with a module-resolution
 * error naming that path; run `pnpm install` in that checkout to build and bind it.
 * See `../semantic-merge/semantic-merge-driver.ts`.
 */
process.exit(
  runSemanticMergeDriver(process.argv.slice(2), (line) => process.stderr.write(`${line}\n`)),
);
