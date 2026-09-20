import { describe, expect, it } from 'vitest';

import type { GitSpawnResult, GitSpawnRunner } from './git-spawn-runner.js';
import {
  deriveSemanticMergeDriverConfig,
  type DriverConfigEntry,
  registerSemanticMergeDriver,
  SEMANTIC_MERGE_DRIVER_ENTRY,
  SEMANTIC_MERGE_DRIVER_KEY,
} from './semantic-merge-driver-registration.js';

// The registration is exercised at its injected boundaries (the integration
// point per testing-strategy.md): a scripted git runner hands back one prepared
// result per git invocation and records the argv it was given, and the
// filesystem seams are identity and constant fakes. The contract under test is
// which config entries reach git and how each outcome is classified.

const top = '/checkout';
const ok: GitSpawnResult = { error: undefined, signal: null, status: 0, stdout: '' };
const topLevelReported: GitSpawnResult = { ...ok, stdout: `${top}\n` };
const refused: GitSpawnResult = { ...ok, status: 128 };
const neverStarted: GitSpawnResult = {
  error: new Error('spawnSync git ENOENT'),
  signal: null,
  status: null,
  stdout: '',
};

function expectedEntries(): readonly DriverConfigEntry[] {
  const derived = deriveSemanticMergeDriverConfig({ worktreeTopLevel: top, repoRoot: top });
  if (!derived.ok) {
    throw new Error(`derivation failed: ${derived.reason}`);
  }
  return derived.entries;
}

const boundLocally = (): GitSpawnResult => ({
  ...ok,
  stdout: `local\t${expectedEntries()[0]?.[1] ?? ''}\n`,
});

function scriptedGit(results: readonly GitSpawnResult[]): {
  readonly runGit: GitSpawnRunner;
  readonly calls: (readonly string[])[];
} {
  const queue = [...results];
  const calls: (readonly string[])[] = [];
  const runGit: GitSpawnRunner = (args) => {
    calls.push(args);
    const next = queue.shift();
    if (next === undefined) {
      throw new Error(`unscripted git call: ${args.join(' ')}`);
    }
    return next;
  };
  return { runGit, calls };
}

const identity = (target: string): string => target;
const present = (): boolean => true;
const absent = (): boolean => false;

const configWrites = (calls: readonly (readonly string[])[]): (readonly string[])[] =>
  calls.filter((args) => args[0] === 'config' && args[1] === '--local');

describe('registerSemanticMergeDriver', () => {
  it('writes the derived entries, driver first, replacing existing values, then reads them back', () => {
    const { runGit, calls } = scriptedGit([topLevelReported, ok, ok, boundLocally()]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    const entries = expectedEntries();
    expect(outcome).toStrictEqual({ kind: 'armed', entries });
    expect(configWrites(calls)).toStrictEqual(
      entries.map(([key, value]) => ['config', '--local', '--replace-all', key, value]),
    );
    expect(calls.at(-1)).toStrictEqual([
      'config',
      '--get-all',
      '--show-scope',
      SEMANTIC_MERGE_DRIVER_KEY,
    ]);
  });

  it('skips with the exit status, writing nothing, when git reports no work tree', () => {
    const { runGit, calls } = scriptedGit([refused]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({ kind: 'skipped-not-a-work-tree', status: 128 });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('fails loudly, writing nothing, when git never started for the probe', () => {
    const { runGit, calls } = scriptedGit([neverStarted]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({ kind: 'failed', reason: expect.stringContaining('ENOENT') });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('fails, writing nothing, when the probe succeeds but prints no path', () => {
    const { runGit, calls } = scriptedGit([ok]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({
      kind: 'failed',
      reason: expect.stringContaining('show-toplevel'),
    });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('is invalid, writing nothing, when the repository root is not the reported checkout', () => {
    const { runGit, calls } = scriptedGit([{ ...ok, stdout: '/other\n' }]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({ kind: 'invalid', reason: expect.stringContaining('/other') });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('is invalid, writing nothing, when the built driver is missing from the checkout', () => {
    const { runGit, calls } = scriptedGit([topLevelReported]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: absent,
    });

    expect(outcome).toStrictEqual({
      kind: 'invalid',
      reason: expect.stringContaining(SEMANTIC_MERGE_DRIVER_ENTRY),
    });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('fails naming the driver key when its write is refused, attempting no later write', () => {
    const { runGit, calls } = scriptedGit([topLevelReported, refused]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({
      kind: 'failed',
      reason: expect.stringContaining(SEMANTIC_MERGE_DRIVER_KEY),
    });
    expect(configWrites(calls)).toHaveLength(1);
  });

  it('fails naming the shadowing scope when another scope supplies the driver value', () => {
    const shadowed: GitSpawnResult = {
      ...ok,
      stdout: `${boundLocally().stdout}worktree\tnode elsewhere.js %O %A %B %P\n`,
    };
    const { runGit } = scriptedGit([topLevelReported, ok, ok, shadowed]);

    const outcome = registerSemanticMergeDriver({
      repoRoot: top,
      runGit,
      realpath: identity,
      exists: present,
    });

    expect(outcome).toStrictEqual({
      kind: 'failed',
      reason: expect.stringContaining('worktree: node elsewhere.js'),
    });
  });
});
