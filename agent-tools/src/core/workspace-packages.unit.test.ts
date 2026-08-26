import { describe, expect, it } from 'vitest';

import {
  discoverWorkspaceManifestPaths,
  parseWorkspacePackages,
  stripQuotes,
  type WorkspaceDiscoveryIo,
} from './workspace-packages.js';

describe('parseWorkspacePackages', () => {
  it('parses the plain block-sequence form this repo uses', () => {
    const yaml = 'packages:\n  - lib\n  - agent-tools\n\noverrides:\n  esbuild: 1\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib', 'agent-tools']);
  });

  it('parses quoted entries and glob entries', () => {
    const yaml = 'packages:\n  - \'packages/*\'\n  - "lib"\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['packages/*', 'lib']);
  });

  it('returns empty when no packages block exists', () => {
    expect(parseWorkspacePackages('overrides:\n  esbuild: 1\n')).toStrictEqual([]);
  });

  it('ends the block at the next non-indented line', () => {
    const yaml = ['packages:', '  - lib', 'minimumReleaseAge: 1440', '  - not-a-package'].join(
      '\n',
    );
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib']);
  });

  it('strips trailing inline comments from items', () => {
    const yaml = 'packages:\n  - lib  # the core workspace\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib']);
  });
});

describe('stripQuotes', () => {
  it('removes one matching pair of surrounding quotes', () => {
    expect(stripQuotes("'lib'")).toBe('lib');
    expect(stripQuotes('"agent-tools"')).toBe('agent-tools');
  });

  it('leaves unquoted and mismatched values untouched', () => {
    expect(stripQuotes('lib')).toBe('lib');
    expect(stripQuotes('"lib\'')).toBe('"lib\'');
    expect(stripQuotes("mismatched'")).toBe("mismatched'");
  });
});

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
