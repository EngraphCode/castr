import { describe, expect, it } from 'vitest';

import { discoverWorkspaceManifestPaths, type WorkspaceDiscoveryIo } from './workspace-packages.js';

function enoent(): never {
  const error: NodeJS.ErrnoException = new Error('ENOENT');
  error.code = 'ENOENT';
  throw error;
}

function fakeIo(overrides: Partial<WorkspaceDiscoveryIo>): WorkspaceDiscoveryIo {
  return {
    readFile: () => enoent(),
    readdir: () => enoent(),
    ...overrides,
  };
}

describe('discoverWorkspaceManifestPaths', () => {
  it('degrades to root-only when pnpm-workspace.yaml is absent', async () => {
    const io = fakeIo({});

    await expect(discoverWorkspaceManifestPaths('/repo', io)).resolves.toStrictEqual([
      'package.json',
    ]);
  });

  it('reads literal entries directly and expands /* globs one level', async () => {
    const io = fakeIo({
      readFile: async () => 'packages:\n  - lib\n  - packages/*\n',
      readdir: async () => [
        { name: 'alpha', isDirectory: () => true },
        { name: 'stray-file.txt', isDirectory: () => false },
        { name: 'beta', isDirectory: () => true },
      ],
    });

    await expect(discoverWorkspaceManifestPaths('/repo', io)).resolves.toStrictEqual([
      'package.json',
      'lib/package.json',
      'packages/alpha/package.json',
      'packages/beta/package.json',
    ]);
  });

  it('deduplicates entries and skips a glob whose parent directory is absent', async () => {
    const io = fakeIo({
      readFile: async () => 'packages:\n  - lib\n  - lib\n  - missing/*\n',
    });

    await expect(discoverWorkspaceManifestPaths('/repo', io)).resolves.toStrictEqual([
      'package.json',
      'lib/package.json',
    ]);
  });

  it('rethrows non-ENOENT read failures instead of degrading silently', async () => {
    const io = fakeIo({
      readFile: async () => {
        throw new Error('EACCES');
      },
    });

    await expect(discoverWorkspaceManifestPaths('/repo', io)).rejects.toThrow('EACCES');
  });
});
