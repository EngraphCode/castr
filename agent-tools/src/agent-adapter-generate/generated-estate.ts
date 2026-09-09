/** Shared filesystem boundary for generated adapters and Cursor rules. */
import type { Stats } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { isErrnoCode } from '../core/errno.js';

const surfaces = [
  { parent: '.cursor', directory: 'agents', extension: '.md' },
  { parent: '.claude', directory: 'agents', extension: '.md' },
  { parent: '.cursor', directory: 'rules', extension: '.mdc' },
];

/** Preserve code-unit ordering independently of the host's locale. */
function comparePaths(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

/** Absence is valid for output roots; every other filesystem failure propagates. */
async function existingType(path: string): Promise<Stats | undefined> {
  try {
    const type = await lstat(path);
    if (type.isSymbolicLink()) {
      throw new Error(`${path}: generated estate must not contain a symbolic link`);
    }
    return type;
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) return undefined;
    throw error;
  }
}

async function directoryExists(path: string): Promise<boolean> {
  const type = await existingType(path);
  if (type === undefined) return false;
  if (!type.isDirectory()) throw new Error(`${path}: generated output root must be a directory`);
  return true;
}

async function inspectTree(
  directory: string,
  extension: string,
  expectedTargets: ReadonlySet<string>,
): Promise<string[]> {
  const files: string[] = [];
  for (const name of (await readdir(directory)).toSorted(comparePaths)) {
    const path = join(directory, name);
    const type = await lstat(path);
    if (type.isSymbolicLink()) {
      throw new Error(`${path}: generated estate must not contain a symbolic link`);
    }
    if (expectedTargets.has(path) && !type.isFile()) {
      throw new Error(`${path}: expected generated output must be a regular file`);
    }
    if (type.isDirectory()) {
      files.push(...(await inspectTree(path, extension, expectedTargets)));
    } else if (!type.isFile()) {
      throw new Error(`${path}: generated estate entries must be regular files or directories`);
    } else if (name.endsWith(extension)) {
      files.push(path);
    }
  }
  return files;
}

/**
 * Validate the whole generated filesystem estate without following symbolic links.
 *
 * @param repoRoot - Repository anchor; system aliases above this anchor are allowed.
 * @param expectedTargets - Planned output paths, each within one generated surface.
 * @returns Sorted absolute paths of existing regular generated files.
 * @throws If a generated ancestor, root or entry is a symbolic link, a root is not
 *   a directory, an expected file has another type, or a target escapes the estate.
 * @remarks Missing output roots and targets are valid. Other filesystem failures
 * propagate. Callers must complete this inspection before reading or changing outputs.
 * Generated paths must not be concurrently replaced between inspection and use;
 * this preflight does not lock the filesystem.
 */
export async function inspectGeneratedEstate(
  repoRoot: string,
  expectedTargets: readonly string[],
): Promise<string[]> {
  const root = resolve(repoRoot);
  const targets = new Set(expectedTargets.map((target) => resolve(target)));
  for (const target of targets) {
    const supported = surfaces.some(({ parent, directory, extension }) => {
      const path = relative(join(root, parent, directory), target);
      return (
        path !== '' &&
        path !== '..' &&
        !path.startsWith(`..${sep}`) &&
        !isAbsolute(path) &&
        path.endsWith(extension)
      );
    });
    if (!supported) throw new Error(`${target}: expected output is outside the generated estate`);
  }
  for (const parent of new Set(surfaces.map((surface) => surface.parent))) {
    await directoryExists(join(root, parent));
  }
  const files: string[] = [];
  for (const { parent, directory, extension } of surfaces) {
    const path = join(root, parent, directory);
    if (await directoryExists(path)) {
      files.push(...(await inspectTree(path, extension, targets)));
    }
  }
  return files.toSorted(comparePaths);
}
