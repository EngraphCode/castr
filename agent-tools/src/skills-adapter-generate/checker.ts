/**
 * Skills adapter drift checker.
 *
 * Generates adapter content in memory and compares it bytewise against the
 * on-disk adapters. Read-only. Used by `skills-adapter-generate --check` to
 * gate CI / pre-merge runs against drift between canonical sources and their
 * generated adapter pointers.
 *
 * I/O is injected through a minimal {@link CheckerFs} interface so unit tests
 * can pass a deterministic in-memory map without touching the real filesystem.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import {
  adapterTargetPath,
  parseFrontmatter,
  renderAdapter,
  type AdapterSurface,
  type GeneratorOptions,
  type ParsedCanonicalSkill,
} from './generator.js';

const CANONICAL_FILENAME = 'SKILL-CANONICAL.md';
const SURFACES: readonly AdapterSurface[] = ['claude', 'agents'];

export interface CheckOutcome {
  readonly drifted: readonly string[];
  readonly missing: readonly string[];
}

export interface CheckerFs {
  readFileOrUndefined(path: string): Promise<string | undefined>;
  listSubdirectoryNames(path: string): Promise<readonly string[]>;
}

const defaultCheckerFs: CheckerFs = {
  async readFileOrUndefined(path) {
    try {
      return await readFile(path, 'utf8');
    } catch {
      return undefined;
    }
  },
  async listSubdirectoryNames(path) {
    const dirents = await readdir(path, { withFileTypes: true });
    return dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  },
};

export async function checkAdapters(
  options: GeneratorOptions,
  fs: CheckerFs = defaultCheckerFs,
): Promise<CheckOutcome> {
  const drifted: string[] = [];
  const missing: string[] = [];
  const canonicalsRoot = join(options.repoRoot, '.agent', 'skills');
  const discovered = await discoverCanonicals(canonicalsRoot, '', fs);

  for (const parsed of discovered) {
    for (const surface of SURFACES) {
      const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
      const expected = renderAdapter(parsed, options.prefix, surface);
      const actual = await fs.readFileOrUndefined(target);
      if (actual === undefined) {
        missing.push(target);
      } else if (actual !== expected) {
        drifted.push(target);
      }
    }
  }

  return { drifted, missing };
}

/**
 * Recursive read-only canonical discovery mirroring the generator's walk: a
 * directory holding `SKILL-CANONICAL.md` is a skill (leaf name = adapter
 * id); any other directory is a group and is descended into.
 */
async function discoverCanonicals(
  canonicalsRoot: string,
  relativeDir: string,
  fs: CheckerFs,
): Promise<readonly ParsedCanonicalSkill[]> {
  const found: ParsedCanonicalSkill[] = [];
  const absoluteDir = relativeDir === '' ? canonicalsRoot : join(canonicalsRoot, relativeDir);
  const childNames = await fs.listSubdirectoryNames(absoluteDir);

  for (const childName of childNames) {
    const childRelative = relativeDir === '' ? childName : `${relativeDir}/${childName}`;
    const canonicalPath = join(canonicalsRoot, childRelative, CANONICAL_FILENAME);
    const text = await fs.readFileOrUndefined(canonicalPath);
    if (text !== undefined) {
      const frontmatter = parseFrontmatter(text);
      if (frontmatter !== undefined) {
        found.push({
          id: childName,
          relativeDir: childRelative,
          frontmatter,
          canonicalPath,
          canonicalFilename: CANONICAL_FILENAME,
        });
      }
      continue;
    }
    found.push(...(await discoverCanonicals(canonicalsRoot, childRelative, fs)));
  }

  return found;
}
