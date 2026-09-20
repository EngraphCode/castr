// Proves the registered merge-driver command resolves to the checkout being
// merged: one registration arms every linked worktree, a deleted worktree
// cannot disarm the survivors, a checkout without a build halts with a located
// error instead of borrowing another checkout's driver, and a value supplied
// from another config scope is reported instead of recorded as armed.
//
// Every case builds its own temporary repository under the OS temp directory
// and removes it afterwards. The fixture never registers a worktree against
// the repository this test file lives in.
//
// The built driver is copied from this repository's `agent-tools/dist`, so the
// suite needs `pnpm --filter @engraph/agent-tools build` first; `pnpm test:e2e`
// builds through turbo before running. The stored command starts with `node`,
// so the driver runs with whatever `node` git's child shell finds on `PATH`.

import { execFileSync, spawnSync } from 'node:child_process';
import {
  accessSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createGitSpawnRunner } from '../src/bootstrap/git-spawn-runner.js';
import {
  deriveSemanticMergeDriverConfig,
  registerSemanticMergeDriver,
  SEMANTIC_MERGE_DRIVER_ENTRY,
  SEMANTIC_MERGE_DRIVER_KEY,
} from '../src/bootstrap/semantic-merge-driver-registration.js';
import { resolveRepoRoot } from '../src/core/repo-root.js';
import { resolveTrustedGit } from '../src/core/trusted-git.js';
import { SEMANTIC_MERGE_DRIVER_NAME } from '../src/semantic-merge/semantic-merge-driver.js';

const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });
// The entry imports `../semantic-merge/semantic-merge-driver.js`; both files
// are the driver's whole module closure.
const DRIVER_MODULE = path.posix.join(
  path.posix.dirname(SEMANTIC_MERGE_DRIVER_ENTRY),
  '..',
  'semantic-merge',
  'semantic-merge-driver.js',
);
const BUILT_DRIVER_FILES = [SEMANTIC_MERGE_DRIVER_ENTRY, DRIVER_MODULE] as const;
for (const relative of BUILT_DRIVER_FILES) {
  try {
    accessSync(path.join(repoRoot, relative));
  } catch (error: unknown) {
    throw new Error(
      `built driver artefact ${relative} is missing; run: pnpm --filter @engraph/agent-tools build`,
      { cause: error },
    );
  }
}

const git = resolveTrustedGit();
const GIT_IDENTITY = [
  '-c',
  'user.name=e2e',
  '-c',
  'user.email=e2e@example.invalid',
  '-c',
  'commit.gpgsign=false',
] as const;
const MEMORY_FILE = '.agent/memory/note.md';
const BASE = 'first\nmiddle\nlast\n';
const OURS = 'first (main)\nmiddle\nlast\n';
const THEIRS = 'first\nmiddle\nlast (side)\n';
const ROUTING_PHRASE = 'refusing to line-merge';

function expectedDriverCommand(checkout: string): string {
  const derived = deriveSemanticMergeDriverConfig({
    worktreeTopLevel: checkout,
    repoRoot: checkout,
  });
  if (!derived.ok) {
    throw new Error(`derivation failed: ${derived.reason}`);
  }
  return derived.entries[0]?.[1] ?? '';
}

function run(cwd: string, args: readonly string[]): string {
  return execFileSync(git, [...GIT_IDENTITY, ...args], { cwd, encoding: 'utf8' });
}

function attempt(cwd: string, args: readonly string[]) {
  return spawnSync(git, [...GIT_IDENTITY, ...args], { cwd, encoding: 'utf8' });
}

function write(root: string, relative: string, content: string): void {
  const absolute = path.join(root, relative);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function commitMemoryFile(checkout: string, content: string, message: string): void {
  write(checkout, MEMORY_FILE, content);
  run(checkout, ['add', '--', MEMORY_FILE]);
  run(checkout, ['commit', '--quiet', '--message', message]);
}

interface Repository {
  readonly root: string;
  readonly primary: string;
}

/** A primary checkout on `main` and a `side` branch that both edited the memory file. */
function seedRepository(root: string): Repository {
  const primary = path.join(root, 'primary');
  mkdirSync(primary);
  run(primary, ['init', '--quiet', '--initial-branch=main']);
  write(primary, '.gitattributes', `.agent/memory/**/*.md merge=${SEMANTIC_MERGE_DRIVER_NAME}\n`);
  run(primary, ['add', '--', '.gitattributes']);
  commitMemoryFile(primary, BASE, 'base');
  run(primary, ['branch', 'side']);
  commitMemoryFile(primary, OURS, 'main edit');
  run(primary, ['switch', '--quiet', 'side']);
  commitMemoryFile(primary, THEIRS, 'side edit');
  run(primary, ['switch', '--quiet', 'main']);
  return { root, primary };
}

async function withRepository(
  body: (repository: Repository) => Promise<void> | void,
): Promise<void> {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'semantic-merge-driver-')));
  try {
    await body(seedRepository(root));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

/** A linked worktree on its own branch from `main`. */
function addWorktree(repository: Repository, name: string): string {
  const directory = path.join(repository.root, name);
  run(repository.primary, ['worktree', 'add', '--quiet', '-b', name, directory, 'main']);
  return directory;
}

/** Give a checkout its own built driver, exactly where the build would put it. */
function installBuiltDriver(checkout: string): void {
  for (const relative of BUILT_DRIVER_FILES) {
    mkdirSync(path.dirname(path.join(checkout, relative)), { recursive: true });
    copyFileSync(path.join(repoRoot, relative), path.join(checkout, relative));
  }
  write(checkout, 'agent-tools/package.json', '{ "type": "module" }\n');
}

/** Register through the product's own path assembly, git seam and filesystem. */
function register(checkout: string) {
  return registerSemanticMergeDriver({
    repoRoot: checkout,
    runGit: createGitSpawnRunner({ gitBinary: git, cwd: checkout }),
    realpath: realpathSync,
    exists: existsSync,
  });
}

/** The driver value this checkout's merges will use, from the repository-local config only. */
function localDriver(checkout: string): string {
  return run(checkout, ['config', '--local', '--get', SEMANTIC_MERGE_DRIVER_KEY]).trim();
}

function mergeSide(checkout: string) {
  return attempt(checkout, ['merge', '--no-edit', 'side']);
}

function unmergedStages(checkout: string): string[] {
  return run(checkout, ['ls-files', '--unmerged']).trim().split('\n');
}

describe('semantic-merge driver registration across linked worktrees', () => {
  it('arms every checkout with one checkout-relative command, whichever worktree registered', async () => {
    await withRepository((repository) => {
      const w1 = addWorktree(repository, 'w1');
      const w2 = addWorktree(repository, 'w2');
      installBuiltDriver(w1);
      installBuiltDriver(w2);

      expect(register(w1).kind).toBe('armed');
      expect(register(w2).kind).toBe('armed');

      const values = [repository.primary, w1, w2].map(localDriver);
      expect(values).toStrictEqual([
        expectedDriverCommand(w1),
        expectedDriverCommand(w1),
        expectedDriverCommand(w1),
      ]);
      expect(values[0]).toBe(`node ${SEMANTIC_MERGE_DRIVER_ENTRY} %O %A %B %P`);
    });
  });

  it('keeps routing conflicts in the survivors after the registering worktree is deleted', async () => {
    await withRepository((repository) => {
      const w1 = addWorktree(repository, 'w1');
      const w2 = addWorktree(repository, 'w2');
      installBuiltDriver(repository.primary);
      installBuiltDriver(w1);
      installBuiltDriver(w2);
      expect(register(w2).kind).toBe('armed');
      rmSync(w2, { force: true, recursive: true });

      for (const survivor of [w1, repository.primary]) {
        const merge = mergeSide(survivor);
        expect(merge.status).not.toBe(0);
        expect(merge.stderr).toContain(ROUTING_PHRASE);
        expect(merge.stderr).toContain(MEMORY_FILE);
        expect(unmergedStages(survivor)).toHaveLength(3);
        const onDisk = readFileSync(path.join(survivor, MEMORY_FILE), 'utf8');
        expect(onDisk).toBe(OURS);
        expect(onDisk).not.toContain('<<<<<<<');
      }
    });
  });

  it('halts a checkout without a build at its own missing driver instead of borrowing one', async () => {
    await withRepository((repository) => {
      const w1 = addWorktree(repository, 'w1');
      installBuiltDriver(w1);
      expect(register(w1).kind).toBe('armed');
      const unbuilt = addWorktree(repository, 'unbuilt');

      const merge = mergeSide(unbuilt);
      expect(merge.status).not.toBe(0);
      expect(merge.stderr).toContain(path.posix.join('unbuilt', SEMANTIC_MERGE_DRIVER_ENTRY));
      expect(merge.stderr).not.toContain(ROUTING_PHRASE);
      expect(unmergedStages(unbuilt)).toHaveLength(3);
    });
  });

  it('re-registers over a stray duplicate value instead of failing', async () => {
    await withRepository((repository) => {
      const w1 = addWorktree(repository, 'w1');
      installBuiltDriver(w1);
      expect(register(w1).kind).toBe('armed');
      run(w1, ['config', '--local', '--add', SEMANTIC_MERGE_DRIVER_KEY, 'stray value']);

      expect(register(w1).kind).toBe('armed');
      expect(
        run(w1, ['config', '--local', '--get-all', SEMANTIC_MERGE_DRIVER_KEY]).trim().split('\n'),
      ).toHaveLength(1);
    });
  });

  it('reports a worktree-scoped shadow instead of recording the checkout as armed', async () => {
    await withRepository((repository) => {
      const w1 = addWorktree(repository, 'w1');
      installBuiltDriver(w1);
      run(repository.primary, ['config', '--local', 'extensions.worktreeConfig', 'true']);
      run(w1, ['config', '--worktree', SEMANTIC_MERGE_DRIVER_KEY, 'node elsewhere.js %O %A %B %P']);

      expect(register(w1)).toStrictEqual({
        kind: 'failed',
        reason: expect.stringContaining('worktree: node elsewhere.js'),
      });
    });
  });
});
