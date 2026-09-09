import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execPath } from 'node:process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resolveTrustedGit } from '../src/core/trusted-git.js';

const agentToolsRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validatorCli = path.join(
  agentToolsRoot,
  'src/validators/fitness-vocabulary/validate-fitness-vocabulary.ts',
);
const validatorArguments = ['--import', import.meta.resolve('tsx'), validatorCli];

async function withRepository(run: (repository: string) => Promise<void> | void): Promise<void> {
  const repository = mkdtempSync(path.join(tmpdir(), 'fitness-vocabulary-'));
  try {
    execFileSync(resolveTrustedGit(), ['init', '--quiet'], { cwd: repository });
    await run(repository);
  } finally {
    rmSync(repository, { force: true, recursive: true });
  }
}

function write(repository: string, relativePath: string, content: string): void {
  const absolutePath = path.join(repository, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function track(repository: string, relativePath: string, content: string): void {
  write(repository, relativePath, content);
  execFileSync(resolveTrustedGit(), ['add', '--', relativePath], { cwd: repository });
}

function runValidator(repository: string, environment: Readonly<NodeJS.ProcessEnv> = {}) {
  return spawnSync(execPath, [...validatorArguments, '--root', repository], {
    cwd: agentToolsRoot,
    encoding: 'utf8',
    env: { ...environment },
  });
}

describe('fitness-vocabulary validator CLI', () => {
  it('ignores forbidden vocabulary outside the tracked live-document set', async () => {
    await withRepository((repository) => {
      track(repository, 'README.md', 'Current vocabulary only.');
      track(repository, '.agent/experience/history.md', 'The two-threshold model is historical.');
      write(repository, 'untracked.md', 'The two-threshold model is machine-local.');

      const result = runValidator(repository);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('All surfaces use the three-zone vocabulary.');
    });
  });

  it('reports forbidden vocabulary in a tracked path containing spaces', async () => {
    await withRepository((repository) => {
      track(repository, 'tracked note.md', 'The two-threshold model remains here.');

      const result = runValidator(repository);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('tracked note.md');
    });
  });

  it('reports indexed content hidden by assume-unchanged and a clean working-tree rewrite', async () => {
    await withRepository((repository) => {
      track(repository, 'staged.md', 'This is a blocking violation.');
      execFileSync(resolveTrustedGit(), ['update-index', '--assume-unchanged', '--', 'staged.md'], {
        cwd: repository,
      });
      write(repository, 'staged.md', 'Current vocabulary only.');

      const result = runValidator(repository);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('staged.md (Git index)');
    });
  });

  it('ignores repository-local replacement refs when reading indexed content', async () => {
    await withRepository((repository) => {
      track(repository, 'replaced.md', 'This is a blocking violation.');
      const indexedObject = execFileSync(resolveTrustedGit(), ['rev-parse', ':replaced.md'], {
        cwd: repository,
        encoding: 'utf8',
      }).trim();
      const cleanObject = execFileSync(resolveTrustedGit(), ['hash-object', '-w', '--stdin'], {
        cwd: repository,
        encoding: 'utf8',
        input: 'Current vocabulary only.',
      }).trim();
      execFileSync(resolveTrustedGit(), ['replace', indexedObject, cleanObject], {
        cwd: repository,
      });
      write(repository, 'replaced.md', 'Current vocabulary only.');

      const result = runValidator(repository);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('replaced.md (Git index)');
    });
  });

  it('cannot be redirected to an alternate index through the inherited environment', async () => {
    await withRepository((repository) => {
      track(repository, 'redirected.md', 'This is a blocking violation.');

      const result = runValidator(repository, {
        GIT_INDEX_FILE: path.join(repository, 'alternate-index'),
      });

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('redirected.md');
    });
  });

  it('fails with actionable context when a tracked candidate cannot be read', async () => {
    await withRepository((repository) => {
      track(repository, 'missing.md', 'Current vocabulary only.');
      rmSync(path.join(repository, 'missing.md'));

      const result = runValidator(repository);

      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(
        /Cannot read tracked file 'missing\.md'.*Restore it or commit its deletion/su,
      );
    });
  });

  it('rejects an eligible tracked symlink instead of following its machine-local target', async () => {
    await withRepository((repository) => {
      write(repository, 'untracked-target.txt', 'This is a blocking violation.');
      symlinkSync('untracked-target.txt', path.join(repository, 'linked.md'));
      execFileSync(resolveTrustedGit(), ['add', '--', 'linked.md'], { cwd: repository });

      const result = runValidator(repository);

      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/Cannot scan tracked path 'linked\.md' with Git mode 120000/u);
    });
  });

  it('fails when Git cannot enumerate the requested repository', () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'fitness-vocabulary-not-git-'));
    try {
      const result = runValidator(directory);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        'Cannot read the tracked-file index for the fitness-vocabulary scan',
      );
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});
