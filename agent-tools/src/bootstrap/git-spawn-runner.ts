/**
 * The git seam shared by the install bootstrap and its E2E fixture: run
 * `git <args>` inside one checkout and report the spawn outcome plus stdout,
 * never throwing. Registration must tell a git that said no (skip) from a git
 * that never ran (loud failure), which is why the seam reports the spawn triple
 * rather than throwing. The collaboration-state `GitRunner` is a different
 * contract (returns stdout, throws on failure) and is not interchangeable.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';

import type { SpawnOutcome } from './bootstrap-helpers.js';

/** One git invocation's result: the spawn triple plus captured stdout. */
export interface GitSpawnResult extends SpawnOutcome {
  /** Captured stdout, empty when the process produced none or never started. */
  readonly stdout: string;
}

/** Runs `git <args>` inside the checkout the runner is bound to; never throws. */
export type GitSpawnRunner = (args: readonly string[]) => GitSpawnResult;

/** Inputs to {@link createGitSpawnRunner}. */
export interface CreateGitSpawnRunnerOptions {
  /** Absolute path of the git binary (from `resolveTrustedGit`), never a bare name. */
  readonly gitBinary: string;
  /** The checkout to run git in; git resolves the repository from here. */
  readonly cwd: string;
}

/**
 * Build a runner that spawns the given git binary in the given checkout with
 * stdout captured and stderr passed through to the caller's stderr.
 *
 * @param options - The git binary and the checkout.
 * @returns A runner reporting the spawn outcome and stdout for each call.
 */
export function createGitSpawnRunner(options: CreateGitSpawnRunnerOptions): GitSpawnRunner {
  return (args) => {
    const result = spawnSync(options.gitBinary, [...args], {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    return {
      error: result.error,
      signal: result.signal,
      status: result.status,
      // `@types/node` types `stdout` as `string` for the utf8 overload, but a
      // spawn that never started (for example ENOENT) yields `undefined` at
      // runtime. The guard keeps `stdout: string` an honest contract.
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
    };
  };
}
