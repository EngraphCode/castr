/**
 * Registration of the `engraph-semantic-merge` git merge driver (LC2 stage-2)
 * in the repository's local git config, behind injected git and filesystem
 * seams.
 *
 * git merge-driver config lives in `.git/config` and is not committable, so the
 * install bootstrap (re-)establishes it. The `.gitattributes` map (committed)
 * points the memory markdown paths at the driver name; without the config
 * entry the name is unbound and git falls back to its default line-merge, which
 * is exactly the silent corruption the driver exists to convert into a loud
 * halt.
 *
 * The registered command names the built driver by its path within the
 * checkout ({@link SEMANTIC_MERGE_DRIVER_ENTRY}). git runs a merge driver with
 * the working directory at the top level of the checkout being merged, and
 * linked worktrees share one local config, so one registration arms every
 * worktree and each checkout runs its own build. A checkout whose
 * `agent-tools/dist` is not built halts its merges on the mapped paths with a
 * module-resolution error naming that path; the remedy is `pnpm install` in
 * that checkout, or `pnpm --filter @engraph/agent-tools build` when it is
 * already installed and only `dist` was cleaned.
 *
 * The pure decision (which entries to write, how to classify each outcome)
 * lives here; the composition root in `bootstrap.ts` supplies the real spawn,
 * the real filesystem and the logging.
 *
 * @packageDocumentation
 */

import path from 'node:path';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import type { GitSpawnResult, GitSpawnRunner } from './git-spawn-runner.js';

/**
 * The built driver entry as a POSIX path from the checkout top level: the build
 * of `src/bin/semantic-merge-driver.ts`. It is the single source for the
 * bootstrap, the derivation and the E2E fixture's copy step, which ties the
 * constant to what the build emits.
 */
export const SEMANTIC_MERGE_DRIVER_ENTRY = 'agent-tools/dist/src/bin/semantic-merge-driver.js';

/** Every git config key this registration may write, sourced from the driver name. */
export type DriverConfigKey = `merge.${typeof SEMANTIC_MERGE_DRIVER_NAME}.${'driver' | 'name'}`;

/** The key that binds the driver name to the command git runs. */
export const SEMANTIC_MERGE_DRIVER_KEY: DriverConfigKey = `merge.${SEMANTIC_MERGE_DRIVER_NAME}.driver`;

/** The key that carries the driver's human-readable description. */
const SEMANTIC_MERGE_NAME_KEY: DriverConfigKey = `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`;

/** One `[key, value]` pair written to the local git config. */
export type DriverConfigEntry = readonly [key: DriverConfigKey, value: string];

/** Inputs to {@link deriveSemanticMergeDriverConfig}. */
export interface DeriveSemanticMergeDriverConfigOptions {
  /**
   * The checkout top level as git reports it (`git rev-parse --show-toplevel`),
   * which is always a physical, symlink-free absolute path.
   */
  readonly worktreeTopLevel: string;
  /**
   * The repository root the bootstrap resolved, symlink-resolved so it compares
   * equal to git's physical path (on macOS the system temp directory is reached
   * through a symlink, so an unresolved path names the same directory by a
   * different string). An unresolved root would fail the comparison and leave
   * the tripwire unarmed with a misleading reason.
   */
  readonly repoRoot: string;
}

/** The derived entries, or the reason the driver cannot be registered. */
export type DerivedDriverConfig =
  | {
      readonly ok: true;
      /** The entries to write, driver binding first so a partial failure still arms it. */
      readonly entries: readonly DriverConfigEntry[];
    }
  | {
      readonly ok: false;
      /** Why no entry can be written, naming both paths. */
      readonly reason: string;
    };

/**
 * Derive the git config entries that bind the driver name to a command git can
 * run from any checkout of the repository. Pure: no filesystem or git access.
 *
 * The stored command must be portable across every checkout and machine that
 * shares the config, so it names the driver by its path within the checkout
 * and starts with `node` resolved from `PATH` at merge time. Absolute paths are
 * for transient spawns the tooling makes itself, never for stored commands.
 * The command is a constant by construction: the derivation only checks that
 * the repository root the bootstrap resolved is the checkout git will merge in.
 *
 * @example
 *
 * ```ts
 * deriveSemanticMergeDriverConfig({ worktreeTopLevel: '/srv/castr', repoRoot: '/srv/castr/' });
 * // {
 * //   ok: true,
 * //   entries: [
 * //     ['merge.engraph-semantic-merge.driver',
 * //      'node agent-tools/dist/src/bin/semantic-merge-driver.js %O %A %B %P'],
 * //     ['merge.engraph-semantic-merge.name', 'engraph concept-preserving …'],
 * //   ],
 * // }
 * ```
 *
 * @param options - The checkout top level git reports and the resolved repo root.
 * @returns The entries, or a failure naming both paths when they differ or
 *   either is not absolute.
 */
export function deriveSemanticMergeDriverConfig(
  options: DeriveSemanticMergeDriverConfigOptions,
): DerivedDriverConfig {
  if (!path.isAbsolute(options.worktreeTopLevel) || !path.isAbsolute(options.repoRoot)) {
    return {
      ok: false,
      reason: `checkout top level ${options.worktreeTopLevel} and repository root ${options.repoRoot} must both be absolute paths`,
    };
  }
  if (path.resolve(options.worktreeTopLevel) !== path.resolve(options.repoRoot)) {
    return {
      ok: false,
      reason: `checkout top level ${options.worktreeTopLevel} is not the repository root ${options.repoRoot}`,
    };
  }
  return {
    ok: true,
    entries: [
      [SEMANTIC_MERGE_DRIVER_KEY, `node ${SEMANTIC_MERGE_DRIVER_ENTRY} %O %A %B %P`],
      [SEMANTIC_MERGE_NAME_KEY, 'engraph concept-preserving memory/state merge (refuse-and-route)'],
    ],
  };
}

/** Inputs to {@link registerSemanticMergeDriver}. */
export interface RegisterSemanticMergeDriverOptions {
  /** The repository root the bootstrap resolved (the directory holding `agent-tools/`). */
  readonly repoRoot: string;
  /** Git seam bound to the checkout being armed. */
  readonly runGit: GitSpawnRunner;
  /** Resolves symlinks in a path; throws when the path does not exist. */
  readonly realpath: (target: string) => string;
  /** Reports whether a path exists. */
  readonly exists: (target: string) => boolean;
}

/** The result of one registration attempt; every case is handled by the caller. */
export type RegistrationOutcome =
  | {
      readonly kind: 'armed';
      /** The `[key, value]` entries written and read back, in order. */
      readonly entries: readonly DriverConfigEntry[];
    }
  | {
      readonly kind: 'skipped-not-a-work-tree';
      /** git's exit status for the work-tree probe. */
      readonly status: number;
    }
  | {
      readonly kind: 'failed';
      /** An environmental failure: git never ran, a write was refused, or a shadow wins. */
      readonly reason: string;
    }
  | {
      readonly kind: 'invalid';
      /** An impossible state for a built checkout: the driver or the root is not where it must be. */
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

/** The scope and value of every binding git reports for the driver key. */
function parseScopedValues(stdout: string): readonly { scope: string; value: string }[] {
  return stdout
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => {
      const separator = line.indexOf('\t');
      return separator === -1
        ? { scope: line, value: '' }
        : { scope: line.slice(0, separator), value: line.slice(separator + 1) };
    });
}

/**
 * Register the merge driver in the local git config of the checkout the seam is
 * bound to. The config is shared by every linked worktree of the repository and
 * the registered command is checkout-relative, so one registration arms them
 * all; each write replaces every existing value of its key, so a stray
 * duplicate cannot make a later install fail; and the effective driver value
 * is read back afterwards, so a value supplied from any other scope (for
 * example a worktree-scoped shadow under `extensions.worktreeConfig`) is a
 * failure, never a recorded success.
 *
 * Outcomes: a directory git does not recognise as a work tree is skipped (a
 * non-git environment is not a fatal install error; the semantic-merge skill's
 * human discipline remains the backstop). A git that never started, a refused
 * config write, or a shadowing scope is `failed`: environmental, reported
 * loudly, not fatal to the install. A missing built driver or a repository root
 * that is not the checkout git reports is `invalid`: the caller treats it as a
 * corrupt build and fails the install, because leaving the driver unbound would
 * let memory files line-merge silently.
 *
 * @param options - The repository root and the git and filesystem seams.
 * @returns The classified outcome; every non-armed kind carries its reason.
 */
export function registerSemanticMergeDriver(
  options: RegisterSemanticMergeDriverOptions,
): RegistrationOutcome {
  const probe = options.runGit(['rev-parse', '--show-toplevel']);
  const probeFailure = spawnFailure(probe);
  if (probeFailure !== undefined) {
    return { kind: 'failed', reason: probeFailure };
  }
  if (probe.status !== 0) {
    return { kind: 'skipped-not-a-work-tree', status: probe.status ?? 1 };
  }
  const worktreeTopLevel = probe.stdout.trim();
  if (worktreeTopLevel === '') {
    return { kind: 'failed', reason: 'git rev-parse --show-toplevel printed no path' };
  }

  let repoRoot: string;
  try {
    repoRoot = options.realpath(options.repoRoot);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      kind: 'invalid',
      reason: `repository root ${options.repoRoot} could not be resolved: ${message}`,
    };
  }
  const derived = deriveSemanticMergeDriverConfig({ worktreeTopLevel, repoRoot });
  if (!derived.ok) {
    return { kind: 'invalid', reason: derived.reason };
  }
  const builtDriver = path.join(repoRoot, ...SEMANTIC_MERGE_DRIVER_ENTRY.split('/'));
  if (!options.exists(builtDriver)) {
    return {
      kind: 'invalid',
      reason: `built driver missing at ${builtDriver}: the build did not produce it or SEMANTIC_MERGE_DRIVER_ENTRY is stale`,
    };
  }

  for (const [key, value] of derived.entries) {
    const write = options.runGit(['config', '--local', '--replace-all', key, value]);
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

  const readback = options.runGit([
    'config',
    '--get-all',
    '--show-scope',
    SEMANTIC_MERGE_DRIVER_KEY,
  ]);
  const readbackFailure = spawnFailure(readback);
  if (readbackFailure !== undefined || readback.status !== 0) {
    return {
      kind: 'failed',
      reason:
        readbackFailure ??
        `git config --get-all ${SEMANTIC_MERGE_DRIVER_KEY} exited with code ${readback.status ?? 'null'}`,
    };
  }
  const bindings = parseScopedValues(readback.stdout);
  const [driverEntry] = derived.entries;
  const expected = driverEntry?.[1] ?? '';
  const foreign = bindings.filter(
    (binding) => binding.scope !== 'local' || binding.value !== expected,
  );
  if (bindings.length !== 1 || foreign.length > 0) {
    const described = bindings.map((binding) => `${binding.scope}: ${binding.value}`).join('; ');
    return {
      kind: 'failed',
      reason: `${SEMANTIC_MERGE_DRIVER_KEY} is not bound solely by the local config (${described})`,
    };
  }
  return { kind: 'armed', entries: derived.entries };
}
