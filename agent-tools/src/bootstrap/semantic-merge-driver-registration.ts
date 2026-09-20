/**
 * Registration of the `engraph-semantic-merge` git merge driver (LC2 stage-2)
 * in the repository's local git config, behind an injected git seam.
 *
 * git merge-driver config lives in `.git/config` and is not committable, so the
 * install bootstrap (re-)establishes it. The `.gitattributes` map (committed)
 * points the `merge_class` memory paths at the driver name; without the config
 * entry the name is unbound and git falls back to its default line-merge, which
 * is exactly the silent corruption the driver exists to convert into a loud halt.
 *
 * The pure decision (which entries to write, how to classify each git outcome)
 * lives here; the composition root in `bootstrap.ts` supplies the real spawn and
 * the logging.
 *
 * @packageDocumentation
 */

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import type { SpawnOutcome } from './bootstrap-helpers.js';

/** One git invocation's result: the spawn triple plus captured stdout. */
export type GitSpawnResult = SpawnOutcome & {
  /** Captured stdout, empty when the process produced none or never started. */
  readonly stdout: string;
};

/**
 * Runs `git <args>` inside the checkout being armed and reports the outcome; it
 * never throws. This seam reports exit status because registration must tell a
 * git that said no (skip) from a git that never ran (loud failure). The
 * collaboration-state `GitRunner` is a different contract (returns stdout,
 * throws on failure) and is not interchangeable with this one.
 */
export type GitSpawnRunner = (args: readonly string[]) => GitSpawnResult;

/** Inputs to {@link registerSemanticMergeDriver}. */
export interface RegisterSemanticMergeDriverOptions {
  /** Absolute path of the built driver entry in the checkout being armed. */
  readonly driverBinPath: string;
  /** Git seam bound to the checkout being armed. */
  readonly runGit: GitSpawnRunner;
}

/** The result of one registration attempt; every case is handled by the caller. */
export type RegistrationOutcome =
  | {
      readonly kind: 'armed';
      /** The `[key, value]` entries written, in order. */
      readonly entries: readonly (readonly [string, string])[];
    }
  | { readonly kind: 'skipped-not-a-work-tree' }
  | {
      readonly kind: 'failed';
      /** What went wrong, naming the git config key when a write was refused. */
      readonly reason: string;
    };

/** A reason when the process did not run to a normal exit, else `undefined`. */
function spawnFailure(result: GitSpawnResult): string | undefined {
  if (result.error !== undefined) {
    return `git could not be started: ${result.error.message}`;
  }
  if (result.signal !== null) {
    return `git was killed by signal ${result.signal}`;
  }
  return undefined;
}

/**
 * Register the merge driver in the local git config of the checkout the seam is
 * bound to.
 *
 * A directory git does not recognise as a work tree is skipped: a non-git
 * environment is not a fatal install error, and the human discipline in the
 * semantic-merge skill remains the backstop. A git that never started, or a
 * refused config write, is a failure the caller reports loudly; the install
 * still completes (a postinstall that hard-fails in an odd sandbox would be
 * worse than an unarmed tripwire that is named in the install log).
 *
 * @param options - The driver location and the git seam.
 * @returns The classified outcome; `failed.reason` names the refused key.
 */
export function registerSemanticMergeDriver(
  options: RegisterSemanticMergeDriverOptions,
): RegistrationOutcome {
  const probe = options.runGit(['rev-parse', '--is-inside-work-tree']);
  const probeFailure = spawnFailure(probe);
  if (probeFailure !== undefined) {
    return { kind: 'failed', reason: probeFailure };
  }
  if (probe.status !== 0) {
    return { kind: 'skipped-not-a-work-tree' };
  }

  const entries: readonly (readonly [string, string])[] = [
    [
      `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`,
      'engraph concept-preserving memory/state merge (refuse-and-route)',
    ],
    [`merge.${SEMANTIC_MERGE_DRIVER_NAME}.driver`, `node "${options.driverBinPath}" %O %A %B %P`],
  ];
  for (const [key, value] of entries) {
    const write = options.runGit(['config', '--local', key, value]);
    const writeFailure = spawnFailure(write);
    if (writeFailure !== undefined) {
      return { kind: 'failed', reason: `${writeFailure} while setting ${key}` };
    }
    if (write.status !== 0) {
      return {
        kind: 'failed',
        reason: `git config ${key} exited with code ${write.status ?? 'null'}`,
      };
    }
  }
  return { kind: 'armed', entries };
}
