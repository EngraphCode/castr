import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile, type ExecFileOptions } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const libRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = path.resolve(libRoot, '..');
const cliPath = path.join(libRoot, 'dist', 'cli', 'index.js');
const compilerPath = fileURLToPath(import.meta.resolve('typescript/bin/tsc'));
const childOptions = {
  cwd: repoRoot,
  timeout: 5_000,
  killSignal: 'SIGKILL',
} satisfies ExecFileOptions;

describe('committed local User workflow', () => {
  let scratchDir: string | undefined;

  beforeAll(async () => {
    const scratchParent = path.join(libRoot, 'tmp');
    await fs.mkdir(scratchParent, { recursive: true });
    scratchDir = await fs.mkdtemp(path.join(scratchParent, 'local-user-workflow-'));
  });

  afterAll(async () => {
    if (scratchDir !== undefined) {
      await fs.rm(scratchDir, { recursive: true, force: true });
    }
  });

  function outputPath(filename: string): string {
    if (scratchDir === undefined) {
      throw new Error('The local User workflow scratch directory was not created');
    }
    return path.join(scratchDir, filename);
  }

  it('generates deterministic TypeScript that compiles and preserves the User contract', async () => {
    const generatedPath = outputPath('local-user.ts');
    const repeatedPath = outputPath('local-user-again.ts');
    const fixturePath = path.join(repoRoot, 'examples', 'local-user.json');

    await execFileAsync(
      process.execPath,
      [cliPath, fixturePath, '-o', generatedPath],
      childOptions,
    );
    await execFileAsync(process.execPath, [cliPath, fixturePath, '-o', repeatedPath], childOptions);
    expect(await fs.readFile(repeatedPath)).toEqual(await fs.readFile(generatedPath));

    await execFileAsync(
      process.execPath,
      [
        compilerPath,
        '--ignoreConfig',
        '--strict',
        '--noEmit',
        '--target',
        'es2022',
        '--module',
        'nodenext',
        '--moduleResolution',
        'nodenext',
        generatedPath,
      ],
      { ...childOptions, cwd: libRoot, timeout: 10_000 },
    );

    const runtimeChecks = [
      `import assert from "node:assert/strict";`,
      `import { User } from ${JSON.stringify(pathToFileURL(generatedPath).href)};`,
      `assert.deepEqual(User.parse({ id: "user-1" }), { id: "user-1" });`,
      `assert.equal(User.safeParse({ id: "" }).success, false, "empty id must be rejected");`,
      `assert.equal(User.safeParse({}).success, false, "missing id must be rejected");`,
      `assert.equal(User.safeParse({ id: 1 }).success, false, "numeric id must be rejected");`,
      `assert.equal(User.safeParse({ id: "user-1", extra: true }).success, false, "extra keys must be rejected");`,
    ].join('\n');

    await execFileAsync(
      process.execPath,
      ['--input-type=module', '-e', runtimeChecks],
      childOptions,
    );
  }, 30_000);

  it('rejects a missing input with an actionable diagnostic and no output', async () => {
    const missingInput = outputPath('does-not-exist.json');
    const unwantedOutput = outputPath('must-not-exist.ts');

    await expect(
      execFileAsync(process.execPath, [cliPath, missingInput, '-o', unwantedOutput], childOptions),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(missingInput),
    });
    await expect(fs.access(unwantedOutput)).rejects.toMatchObject({ code: 'ENOENT' });
  }, 10_000);
});
