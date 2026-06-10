import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libRoot = path.resolve(__dirname, '..');

/**
 * Packaging integrity (deep-review finding C1).
 *
 * Proves the PUBLISHED package shape works: the tarball `pnpm pack` produces
 * must carry type declarations at every declared `types` target, and every
 * documented entrypoint — `.`, `./cli`, `./parsers/zod` — must resolve and
 * import at runtime exactly as a consumer would experience it.
 *
 * Mechanics: pack the workspace, extract the tarball into a scratch
 * `node_modules/@engraph/castr` nested inside `lib/` (so the package's own
 * runtime dependencies resolve by walking up to `lib/node_modules`), then
 * import each entrypoint from a child `node` process whose cwd is the
 * scratch directory. No network, no registry.
 */
describe('packaging integrity (C1)', () => {
  const scratchDir = path.join(libRoot, 'tests-e2e', 'temp-packaging-test');
  const installedPkgDir = path.join(scratchDir, 'node_modules', '@engraph', 'castr');

  beforeAll(async () => {
    await fs.rm(scratchDir, { recursive: true, force: true });
    await fs.mkdir(installedPkgDir, { recursive: true });

    const { stdout } = await execFileAsync('pnpm', ['pack', '--pack-destination', scratchDir], {
      cwd: libRoot,
    });
    const tarballName = stdout.trim().split('\n').at(-1);
    if (tarballName === undefined || !tarballName.endsWith('.tgz')) {
      throw new Error(`pnpm pack did not report a tarball path: ${stdout}`);
    }
    const tarballPath = path.isAbsolute(tarballName)
      ? tarballName
      : path.join(scratchDir, path.basename(tarballName));

    await execFileAsync('tar', [
      '-xzf',
      tarballPath,
      '--strip-components=1',
      '-C',
      installedPkgDir,
    ]);
  }, 120_000);

  afterAll(async () => {
    await fs.rm(scratchDir, { recursive: true, force: true });
  });

  async function importInChild(specifier: string, body: string): Promise<string> {
    const script = `const mod = await import(${JSON.stringify(specifier)});\n${body}`;
    const { stdout } = await execFileAsync('node', ['--input-type=module', '-e', script], {
      cwd: scratchDir,
    });
    return stdout.trim();
  }

  const PackedManifestSchema = z.object({
    types: z.string(),
    exports: z.record(z.string(), z.object({ types: z.string(), import: z.string() })),
  });

  it('packs a type declaration at every declared types target', async () => {
    const packageJsonRaw = await fs.readFile(path.join(installedPkgDir, 'package.json'), 'utf8');
    const packageJson = PackedManifestSchema.parse(JSON.parse(packageJsonRaw));

    const declaredTypeTargets = [
      packageJson.types,
      ...Object.values(packageJson.exports).map((entry) => entry.types),
    ];

    expect(declaredTypeTargets.length).toBeGreaterThanOrEqual(4);
    for (const target of declaredTypeTargets) {
      await expect(
        fs.access(path.join(installedPkgDir, target)),
        `declared types target ${target} is missing from the packed tarball`,
      ).resolves.toBeUndefined();
    }
  });

  it('resolves and imports the root entrypoint from the packed package', async () => {
    const out = await importInChild(
      '@engraph/castr',
      `if (typeof mod.generateZodClientFromOpenAPI !== 'function') throw new Error('missing root export');\nconsole.log('root-ok');`,
    );
    expect(out).toBe('root-ok');
  });

  it('executes the packed CLI bin with --help', async () => {
    // The CLI module self-executes (`program.parse()` at top level), so the
    // honest proof for the `./cli` target is bin execution, not import.
    const binPath = path.join(installedPkgDir, 'dist', 'cli', 'index.js');
    const { stdout } = await execFileAsync('node', [binPath, '--help'], { cwd: scratchDir });
    expect(stdout).toContain('Usage:');
  });

  it('resolves ./parsers/zod and runs the README parseZodSource example', async () => {
    const out = await importInChild(
      '@engraph/castr/parsers/zod',
      [
        `if (typeof mod.parseZodSource !== 'function') throw new Error('missing parseZodSource');`,
        `const result = await mod.parseZodSource('import { z } from "zod";\\nexport const Thing = z.object({ name: z.string() });');`,
        `if (result === null || typeof result !== 'object') throw new Error('parseZodSource returned no result');`,
        `console.log('zod-ok');`,
      ].join('\n'),
    );
    expect(out).toBe('zod-ok');
  });
});
