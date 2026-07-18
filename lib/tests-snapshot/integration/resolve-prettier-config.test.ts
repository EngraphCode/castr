import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { resolvePrettierConfigForOutput } from '../../src/cli/resolve-prettier-config.js';

/**
 * Real-filesystem behaviour proof for {@link resolvePrettierConfigForOutput}:
 * decoy configs on disk plus prettier's actual config search. The pure
 * anchoring contract (which path the resolver receives) is proven in
 * `src/cli/resolve-prettier-config.test.ts`; this suite proves that the
 * anchoring makes prettier's real resolution find the right config wherever
 * the checkout sits on disk.
 */
describe('resolvePrettierConfigForOutput (real prettier resolution)', () => {
  const tempDirs: string[] = [];

  async function makeTempDir(): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), 'castr-prettier-config-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  test('finds a config that sits in the output directory itself (file output)', async () => {
    // prettier's `resolveConfig` starts its search at the dirname of its
    // argument. Anchoring on the output FILE path keeps the search inside
    // the output directory; a directory argument would start the search at
    // the directory's PARENT and silently skip a config in the directory.
    const dir = await makeTempDir();
    await writeFile(path.join(dir, '.prettierrc.json'), JSON.stringify({ printWidth: 42 }));

    const config = await resolvePrettierConfigForOutput(path.join(dir, 'client.ts'));

    expect(config).toEqual({ printWidth: 42 });
  });

  test('finds a config INSIDE the output directory for directory outputs', async () => {
    // The tag-file / method-file grouping strategies make the output path a
    // DIRECTORY (the renderer writes index.ts and per-group files beneath
    // it). The parent directory stands in for an enclosing repository with
    // its own decoy config: resolution anchored on the directory path itself
    // would start the search at the parent and return the decoy, skipping
    // the config in the output directory.
    const parent = await makeTempDir();
    const outputDir = path.join(parent, 'generated');
    await mkdir(outputDir);
    await writeFile(path.join(parent, '.prettierrc.json'), JSON.stringify({ singleQuote: true }));
    await writeFile(path.join(outputDir, '.prettierrc.json'), JSON.stringify({ printWidth: 55 }));

    const config = await resolvePrettierConfigForOutput(outputDir, undefined, 'directory');

    expect(config).toEqual({ printWidth: 55 });
  });

  test('the nearest config wins over an ancestor config', async () => {
    // Environment-independent encoding of the nested-worktree escape: the
    // parent directory stands in for an enclosing repository, the child
    // directory for the checkout. Resolution anchored inside the child must
    // return the child's config, never the ancestor's.
    const parent = await makeTempDir();
    const child = path.join(parent, 'checkout');
    await mkdir(child);
    await writeFile(path.join(parent, '.prettierrc.json'), JSON.stringify({ singleQuote: true }));
    await writeFile(path.join(child, '.prettierrc.json'), JSON.stringify({ printWidth: 55 }));

    const config = await resolvePrettierConfigForOutput(path.join(child, 'client.ts'));

    expect(config).toEqual({ printWidth: 55 });
  });

  test('an explicit config path is loaded even under a non-discoverable filename', async () => {
    // The CLI's `--prettier <path>` names a specific config file. It must be
    // loaded directly (prettier's `config` option), not merely discovered by
    // filename convention in the searched directories.
    const dir = await makeTempDir();
    const configPath = path.join(dir, 'custom-prettier.json');
    await writeFile(configPath, JSON.stringify({ tabWidth: 7 }));

    const config = await resolvePrettierConfigForOutput(path.join(dir, 'client.ts'), configPath);

    expect(config).toEqual({ tabWidth: 7 });
  });

  test('an explicit config path overrides a discoverable config in the output directory', async () => {
    const dir = await makeTempDir();
    await writeFile(path.join(dir, '.prettierrc.json'), JSON.stringify({ printWidth: 42 }));
    const configPath = path.join(dir, 'custom-prettier.json');
    await writeFile(configPath, JSON.stringify({ tabWidth: 7 }));

    const config = await resolvePrettierConfigForOutput(path.join(dir, 'client.ts'), configPath);

    expect(config).toEqual({ tabWidth: 7 });
  });

  test('walks up over nonexistent path segments to the nearest real config', async () => {
    // A nonexistent subtree below a real directory exercises the walk-up
    // over path segments that do not exist on disk (URL-derived output
    // paths); the search must not throw and must find the nearest real
    // config above them.
    const dir = await makeTempDir();
    await writeFile(path.join(dir, '.prettierrc.json'), JSON.stringify({ semi: false }));

    const config = await resolvePrettierConfigForOutput(
      path.join(dir, 'https:', 'example.com', 'api.yaml.client.ts'),
    );

    expect(config).toEqual({ semi: false });
  });
});
