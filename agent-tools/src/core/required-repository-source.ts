import type { Stats } from 'node:fs';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { isAbsolute, join, posix, relative, resolve, sep } from 'node:path';

type RequiredSourceType = 'directory' | 'file';

function isInside(parent: string, child: string): boolean {
  const pathFromParent = relative(parent, child);
  return (
    pathFromParent !== '' &&
    !isAbsolute(pathFromParent) &&
    pathFromParent !== '..' &&
    !pathFromParent.startsWith(`..${sep}`)
  );
}

function assertRepositoryRelative(reference: string): void {
  if (
    reference === '' ||
    isAbsolute(reference) ||
    reference.includes('\\') ||
    reference.includes('\0') ||
    reference.endsWith('/') ||
    posix.normalize(reference) !== reference ||
    reference === '..' ||
    reference.startsWith('../')
  ) {
    throw new Error(`${reference}: required source must be a normalized repository-relative path`);
  }
}

function assertEntryType(
  reference: string,
  traversedReference: string,
  metadata: Stats,
  expectedType: RequiredSourceType,
  isTarget: boolean,
): void {
  if (metadata.isSymbolicLink()) {
    throw new Error(
      `${reference}: required source must not traverse symbolic link ${traversedReference}`,
    );
  }
  const validType = isTarget
    ? expectedType === 'file'
      ? metadata.isFile()
      : metadata.isDirectory()
    : metadata.isDirectory();
  if (!validType) {
    throw new Error(`${reference}: required source must be a ${expectedType}`);
  }
}

async function inspectRequiredSource(
  repoRoot: string,
  reference: string,
  expectedType: RequiredSourceType,
): Promise<string> {
  assertRepositoryRelative(reference);
  const root = resolve(repoRoot);
  const target = resolve(root, reference);
  if (!isInside(root, target)) {
    throw new Error(`${reference}: required source must resolve inside the repository`);
  }

  const segments = reference.split('/');
  let traversed = root;
  for (const [index, segment] of segments.entries()) {
    traversed = join(traversed, segment);
    let metadata: Stats;
    try {
      metadata = await lstat(traversed);
    } catch (error) {
      throw new Error(`${reference}: required source must be a readable ${expectedType}`, {
        cause: error,
      });
    }
    assertEntryType(
      reference,
      segments.slice(0, index + 1).join('/'),
      metadata,
      expectedType,
      index === segments.length - 1,
    );
  }

  const [realRoot, realTarget] = await Promise.all([realpath(root), realpath(target)]);
  if (!isInside(realRoot, realTarget)) {
    throw new Error(`${reference}: required source must resolve inside the repository`);
  }
  return target;
}

function inspectRequiredSourceSync(
  repoRoot: string,
  reference: string,
  expectedType: RequiredSourceType,
): string {
  assertRepositoryRelative(reference);
  const root = resolve(repoRoot);
  const target = resolve(root, reference);
  if (!isInside(root, target)) {
    throw new Error(`${reference}: required source must resolve inside the repository`);
  }

  const segments = reference.split('/');
  let traversed = root;
  for (const [index, segment] of segments.entries()) {
    traversed = join(traversed, segment);
    let metadata: Stats;
    try {
      metadata = lstatSync(traversed);
    } catch (error) {
      throw new Error(`${reference}: required source must be a readable ${expectedType}`, {
        cause: error,
      });
    }
    assertEntryType(
      reference,
      segments.slice(0, index + 1).join('/'),
      metadata,
      expectedType,
      index === segments.length - 1,
    );
  }

  const realRoot = realpathSync(root);
  const realTarget = realpathSync(target);
  if (!isInside(realRoot, realTarget)) {
    throw new Error(`${reference}: required source must resolve inside the repository`);
  }
  return target;
}

/** Read a required repository file only after rejecting linked ancestors and leaf entries. */
export async function readRequiredRepositorySource(
  repoRoot: string,
  reference: string,
): Promise<string> {
  const target = await inspectRequiredSource(repoRoot, reference, 'file');
  try {
    return await readFile(target, 'utf8');
  } catch (error) {
    throw new Error(`${reference}: required source must be a readable file`, { cause: error });
  }
}

/** Synchronous required-source reader for runtime resolver paths. */
export function readRequiredRepositorySourceSync(repoRoot: string, reference: string): string {
  const target = inspectRequiredSourceSync(repoRoot, reference, 'file');
  try {
    return readFileSync(target, 'utf8');
  } catch (error) {
    throw new Error(`${reference}: required source must be a readable file`, { cause: error });
  }
}

/**
 * List direct source files with one extension after a non-following directory walk.
 * Matching entries are each re-inspected without following symbolic links.
 */
export async function listRequiredRepositorySources(
  repoRoot: string,
  directory: string,
  extension: string,
): Promise<string[]> {
  const target = await inspectRequiredSource(repoRoot, directory, 'directory');
  const names = (await readdir(target))
    .filter((name) => name.endsWith(extension))
    .toSorted((left, right) => (left === right ? 0 : left < right ? -1 : 1));
  const references = names.map((name) => `${directory}/${name}`);
  for (const reference of references) {
    await inspectRequiredSource(repoRoot, reference, 'file');
  }
  return references;
}
