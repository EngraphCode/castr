import { describe, expect, it } from 'vitest';

import { loadScopedContentBlocks } from '../../hook-policy/policy-loader.js';
import { type ScopedContentBlockGroup } from '../../hook-policy/types.js';

import {
  findMachineLocalPathHits,
  NUL,
  readScanFiles,
  resolveScanOutcome,
  scanForMachineLocalPaths,
  selectMachineLocalBlock,
  type FileReader,
  type ScanFile,
} from './validate-no-machine-local-paths-helpers.js';

/** A minimal synthetic block so the outcome tests stay pure (no policy.json IO). */
const SYNTHETIC_BLOCK: ScopedContentBlockGroup = {
  concept: 'machine-local-path',
  kind: 'regex',
  patterns: ['/Users/[A-Za-z0-9_-]+'],
  include_paths: [''],
  exclude_paths: [],
  citation: 'test',
};

/** Load the live machine-local block so the controls run against the real pattern set. */
async function loadBlock(): Promise<ScopedContentBlockGroup> {
  const block = selectMachineLocalBlock(await loadScopedContentBlocks());
  if (block === undefined) {
    throw new Error('machine-local-path block missing from .agent/hooks/policy.json');
  }
  return block;
}

describe('findMachineLocalPathHits', () => {
  it('reports the line and column of a hit', () => {
    const hits = findMachineLocalPathHits('f.md', 'ok\nsee /Users/alice/x here\nok', [
      '/Users/[A-Za-z0-9_-]+',
    ]);
    expect(hits).toStrictEqual([{ file: 'f.md', line: 2, column: 5, text: '/Users/alice' }]);
  });

  it('records at most one hit per line', () => {
    const hits = findMachineLocalPathHits('f', '/Users/alice and /Users/bob', [
      '/Users/[A-Za-z0-9_-]+',
    ]);
    expect(hits).toHaveLength(1);
  });
});

describe('machine-local-path patterns (live policy.json set)', () => {
  it('flags user-home and machine-temp absolute paths (positive controls)', async () => {
    const block = await loadBlock();
    const positives = [
      '/Users/alice/code/oak',
      '/home/user/project',
      'C:\\Users\\dev\\repo',
      '~/.claude/projects/-Users-alice-code-oak/memory', // flattened Claude project id
      '.cursor/projects/Users-alice-code-oak/transcripts', // flattened Cursor project id
      '/private/tmp/scratch',
      '/var/folders/ab/cd',
    ];
    for (const value of positives) {
      expect(findMachineLocalPathHits('f', value, block.patterns), value).not.toStrictEqual([]);
    }
  });

  it('does NOT flag portable system paths, placeholders, or repo-relative paths (negative controls)', async () => {
    const block = await loadBlock();
    const negatives = [
      '/usr/bin/git', // the S4036 fix — must never be flagged
      '/opt/homebrew/bin/git',
      '/usr/local/bin/git',
      '/tmp/scratch',
      '/Users/<user>/code', // teaching placeholder
      '/Users/<name>/x',
      '~/.claude/projects/<project>/memory', // flattened-id placeholder
      '~/.cache/oak',
      'agent-tools/src/foo.ts',
    ];
    for (const value of negatives) {
      expect(findMachineLocalPathHits('f', value, block.patterns), value).toStrictEqual([]);
    }
  });
});

describe('scanForMachineLocalPaths', () => {
  it('flags an in-scope file but skips a file matched by exclude_paths', async () => {
    const block = await loadBlock();
    const files: ScanFile[] = [
      { path: 'docs/example.md', content: 'path: /Users/alice/x' },
      { path: '.agent/rules/no-machine-local-paths.md', content: 'forbidden: /Users/alice/x' },
    ];
    const hits = scanForMachineLocalPaths(files, block);
    expect(hits.map((hit) => hit.file)).toStrictEqual(['docs/example.md']);
  });
});

describe('readScanFiles', () => {
  /** A reader backed by an in-memory map; absent paths throw (ENOENT-like). */
  function mapReader(contents: Record<string, string>): FileReader {
    return (absolutePath) => {
      const entry = Object.entries(contents).find(([rel]) => absolutePath.endsWith(rel));
      if (entry === undefined) {
        throw new Error(`ENOENT: ${absolutePath}`);
      }
      return entry[1];
    };
  }

  it('reads text files and skips binary extensions, generated files, and NUL content', () => {
    const reader = mapReader({
      'docs/a.md': 'path /Users/alice/x',
      'img/logo.png': 'irrelevant',
      'pnpm-lock.yaml': 'irrelevant',
      'bin/blob.txt': `has a ${NUL} byte`,
    });
    const files = readScanFiles(
      '/repo',
      ['docs/a.md', 'img/logo.png', 'pnpm-lock.yaml', 'bin/blob.txt'],
      reader,
    );
    expect(files).toStrictEqual([{ path: 'docs/a.md', content: 'path /Users/alice/x' }]);
  });

  it('fails loud when a tracked file cannot be read (no silent skip)', () => {
    const reader = mapReader({ 'docs/a.md': 'ok' });
    expect(() => readScanFiles('/repo', ['docs/missing.md'], reader)).toThrow(
      /Cannot read tracked file 'docs\/missing\.md'/,
    );
  });
});

describe('resolveScanOutcome', () => {
  it('exits 2 when the policy block is missing', () => {
    const outcome = resolveScanOutcome(undefined, []);
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr.join('\n')).toContain('no `machine-local-path` block');
  });

  it('exits 0 and reports the scanned count when clean', () => {
    const outcome = resolveScanOutcome(SYNTHETIC_BLOCK, [
      { path: 'docs/a.md', content: 'repo-relative only' },
      { path: 'docs/b.md', content: 'also clean' },
    ]);
    expect(outcome.exitCode).toBe(0);
    expect(outcome.stdout).toStrictEqual(['✓ no machine-local paths in 2 tracked files']);
  });

  it('exits 1 and lists each hit when a machine-local path is present', () => {
    const outcome = resolveScanOutcome(SYNTHETIC_BLOCK, [
      { path: 'docs/a.md', content: 'see /Users/alice/x' },
    ]);
    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr[0]).toContain('1 machine-local path(s) found');
    expect(outcome.stderr.some((line) => line.includes('docs/a.md:1:5  /Users/alice'))).toBe(true);
  });
});
