import { describe, expect, it } from 'vitest';

import {
  discoverWorkspaceManifestPaths,
  discoverWorkspaceTsconfigPaths,
  type WorkspaceDiscoveryIo,
} from './workspace-packages.js';

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

describe('discoverWorkspaceTsconfigPaths', () => {
  function dirEntry(name: string, isDir: boolean): { name: string; isDirectory: () => boolean } {
    return { name, isDirectory: () => isDir };
  }

  it('lists tsconfig*.json and tsdoc.json in the root and each workspace directory', async () => {
    const listings = new Map<string, readonly { name: string; isDirectory: () => boolean }[]>([
      [
        '/repo',
        [
          dirEntry('tsconfig.json', false),
          dirEntry('tsconfig.lint.json', false),
          dirEntry('tsdoc.json', false),
        ],
      ],
      [
        '/repo/lib',
        [
          dirEntry('tsconfig.json', false),
          dirEntry('tsconfig.build.json', false),
          dirEntry('tsdoc.json', false),
          dirEntry('src', true),
        ],
      ],
    ]);
    const io = fakeIo({
      readdir: async (dirPath) => {
        const listing = listings.get(dirPath);
        if (listing === undefined) {
          return enoent();
        }
        return listing;
      },
    });

    await expect(
      discoverWorkspaceTsconfigPaths('/repo', ['package.json', 'lib/package.json'], io),
    ).resolves.toStrictEqual([
      'tsconfig.json',
      'tsconfig.lint.json',
      'tsdoc.json',
      'lib/tsconfig.json',
      'lib/tsconfig.build.json',
      'lib/tsdoc.json',
    ]);
  });

  it('excludes files that merely contain but do not start with tsconfig, and directories', async () => {
    const io = fakeIo({
      readdir: async () => [
        dirEntry('tsconfig.json', false),
        dirEntry('not-tsconfig.json', false),
        dirEntry('tsconfig.json.bak', false),
        dirEntry('tsconfig.json', true),
      ],
    });

    await expect(
      discoverWorkspaceTsconfigPaths('/repo', ['package.json'], io),
    ).resolves.toStrictEqual(['tsconfig.json']);
  });

  it('skips a workspace directory that cannot be listed (ENOENT) but rethrows other errors', async () => {
    const io = fakeIo({});
    await expect(
      discoverWorkspaceTsconfigPaths('/repo', ['package.json'], io),
    ).resolves.toStrictEqual([]);

    const failing = fakeIo({
      readdir: async () => {
        throw new Error('EACCES');
      },
    });
    await expect(
      discoverWorkspaceTsconfigPaths('/repo', ['package.json'], failing),
    ).rejects.toThrow('EACCES');
  });
});
