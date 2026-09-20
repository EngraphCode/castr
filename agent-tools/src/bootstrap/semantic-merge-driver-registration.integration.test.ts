import { describe, expect, it } from 'vitest';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import {
  type GitSpawnResult,
  type GitSpawnRunner,
  registerSemanticMergeDriver,
} from './semantic-merge-driver-registration.js';

// The registration is exercised at its injected git boundary (the integration
// point per testing-strategy.md): a scripted runner hands back one prepared
// result per git invocation and records the argv it was given. The contract
// under test is which config entries reach git and how each git outcome is
// classified — never how many times the seam was called.

const ok: GitSpawnResult = { error: undefined, signal: null, status: 0, stdout: 'true\n' };
const refused: GitSpawnResult = { error: undefined, signal: null, status: 128, stdout: '' };
const neverStarted: GitSpawnResult = {
  error: new Error('spawnSync git ENOENT'),
  signal: null,
  status: null,
  stdout: '',
};

function scriptedGit(results: readonly GitSpawnResult[]): {
  readonly runGit: GitSpawnRunner;
  readonly calls: (readonly string[])[];
} {
  const queue = [...results];
  const calls: (readonly string[])[] = [];
  const runGit: GitSpawnRunner = (args) => {
    calls.push(args);
    return queue.shift() ?? ok;
  };
  return { runGit, calls };
}

const configWrites = (calls: readonly (readonly string[])[]): (readonly string[])[] =>
  calls.filter((args) => args[0] === 'config');

describe('registerSemanticMergeDriver', () => {
  it('arms the driver by writing the name and driver entries to the local git config', () => {
    const { runGit, calls } = scriptedGit([ok, ok, ok]);

    const outcome = registerSemanticMergeDriver({
      driverBinPath: '/checkout/agent-tools/dist/src/bin/semantic-merge-driver.js',
      runGit,
    });

    expect(outcome.kind).toBe('armed');
    const writes = configWrites(calls);
    expect(writes.map((args) => args[2])).toStrictEqual([
      `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`,
      `merge.${SEMANTIC_MERGE_DRIVER_NAME}.driver`,
    ]);
    for (const args of writes) {
      expect(args.slice(0, 2)).toStrictEqual(['config', '--local']);
    }
    const driverCommand = writes[1]?.[3] ?? '';
    expect(driverCommand).toContain('semantic-merge-driver.js');
    expect(driverCommand).toMatch(/ %O %A %B %P$/u);
  });

  it('skips without writing when git reports the directory is not a work tree', () => {
    const { runGit, calls } = scriptedGit([refused]);

    const outcome = registerSemanticMergeDriver({
      driverBinPath: '/checkout/agent-tools/dist/src/bin/semantic-merge-driver.js',
      runGit,
    });

    expect(outcome).toStrictEqual({ kind: 'skipped-not-a-work-tree' });
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('fails loudly, without writing, when git never started for the probe', () => {
    const { runGit, calls } = scriptedGit([neverStarted]);

    const outcome = registerSemanticMergeDriver({
      driverBinPath: '/checkout/agent-tools/dist/src/bin/semantic-merge-driver.js',
      runGit,
    });

    expect(outcome.kind).toBe('failed');
    expect(outcome.kind === 'failed' && outcome.reason).toContain('ENOENT');
    expect(configWrites(calls)).toStrictEqual([]);
  });

  it('fails naming the key on the first refused write and attempts no later write', () => {
    const { runGit, calls } = scriptedGit([ok, refused, ok]);

    const outcome = registerSemanticMergeDriver({
      driverBinPath: '/checkout/agent-tools/dist/src/bin/semantic-merge-driver.js',
      runGit,
    });

    expect(outcome.kind).toBe('failed');
    expect(outcome.kind === 'failed' && outcome.reason).toContain(
      `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`,
    );
    expect(configWrites(calls)).toHaveLength(1);
  });
});
