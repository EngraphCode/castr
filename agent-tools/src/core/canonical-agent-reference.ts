import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { isAbsolute, join, posix, relative, resolve, sep } from 'node:path';

const CANONICAL_AGENT_ROOT = '.agent';
const CANONICAL_PATH_PATTERN = /`(\.agent\/[^`]+)`/gu;

/** Extract the unique, sorted `.agent/...` references from instruction prose. */
export function extractCanonicalAgentPaths(developerInstructions: string): string[] {
  const referencedFiles = new Set<string>();
  for (const match of developerInstructions.matchAll(CANONICAL_PATH_PATTERN)) {
    if (match[1] !== undefined) referencedFiles.add(match[1]);
  }
  return [...referencedFiles].toSorted((left, right) => left.localeCompare(right));
}

/**
 * Return the canonical-path contract violation for a reference, if any.
 * Canonical references are normalized repository-relative POSIX paths beneath `.agent`.
 */
export function canonicalAgentReferenceIssue(reference: string): string | null {
  if (
    !reference.startsWith(`${CANONICAL_AGENT_ROOT}/`) ||
    reference.includes('\\') ||
    reference.includes('\0') ||
    reference.endsWith('/') ||
    posix.normalize(reference) !== reference
  ) {
    return `canonical reference "${reference}" must be a normalized path beneath ${CANONICAL_AGENT_ROOT}`;
  }
  return null;
}

/** Whether a valid canonical reference is a descendant of the supplied canonical directory. */
export function isCanonicalAgentReferenceInside(reference: string, directory: string): boolean {
  if (canonicalAgentReferenceIssue(reference) !== null) return false;
  const pathFromDirectory = posix.relative(directory, reference);
  return (
    pathFromDirectory !== '' &&
    pathFromDirectory !== '..' &&
    !pathFromDirectory.startsWith('../') &&
    !posix.isAbsolute(pathFromDirectory)
  );
}

function assertCanonicalAgentReference(reference: string): void {
  const issue = canonicalAgentReferenceIssue(reference);
  if (issue !== null) throw new Error(issue);
}

function isInside(parent: string, child: string): boolean {
  const pathFromParent = relative(parent, child);
  return (
    pathFromParent !== '' &&
    !isAbsolute(pathFromParent) &&
    pathFromParent !== '..' &&
    !pathFromParent.startsWith(`..${sep}`)
  );
}

function resolvedCanonicalPath(repoRoot: string, reference: string): string {
  assertCanonicalAgentReference(reference);
  const canonicalRoot = resolve(repoRoot, CANONICAL_AGENT_ROOT);
  const target = resolve(repoRoot, reference);
  if (!isInside(canonicalRoot, target)) {
    throw new Error(
      `canonical reference "${reference}" must resolve beneath ${CANONICAL_AGENT_ROOT}`,
    );
  }
  return target;
}

function unreadableReference(reference: string): Error {
  return new Error(`${reference}: canonical reference must be a readable file`);
}

function symbolicLinkReference(reference: string, traversedPath: string): Error {
  return new Error(
    `${reference}: canonical reference must not traverse symbolic link ${traversedPath}`,
  );
}

interface CanonicalPathWalk {
  readonly segments: readonly string[];
  readonly target: string;
  readonly traversedRoot: string;
}

function canonicalPathWalk(repoRoot: string, reference: string): CanonicalPathWalk {
  return {
    segments: reference.split('/'),
    target: resolvedCanonicalPath(repoRoot, reference),
    traversedRoot: resolve(repoRoot),
  };
}

function assertCanonicalPathEntry(
  reference: string,
  segments: readonly string[],
  index: number,
  metadata: { isDirectory(): boolean; isFile(): boolean; isSymbolicLink(): boolean },
): void {
  const traversedReference = segments.slice(0, index + 1).join('/');
  if (metadata.isSymbolicLink()) {
    throw symbolicLinkReference(reference, traversedReference);
  }
  const isTarget = index === segments.length - 1;
  if ((isTarget && !metadata.isFile()) || (!isTarget && !metadata.isDirectory())) {
    throw unreadableReference(reference);
  }
}

function assertRealContainment(reference: string, canonicalRoot: string, target: string): void {
  if (!isInside(canonicalRoot, target)) {
    throw new Error(
      `canonical reference "${reference}" must resolve beneath ${CANONICAL_AGENT_ROOT}`,
    );
  }
}

async function inspectCanonicalPath(repoRoot: string, reference: string): Promise<string> {
  const { segments, target, traversedRoot } = canonicalPathWalk(repoRoot, reference);
  let traversed = traversedRoot;
  for (const [index, segment] of segments.entries()) {
    traversed = join(traversed, segment);
    let metadata;
    try {
      metadata = await lstat(traversed);
    } catch {
      throw unreadableReference(reference);
    }
    assertCanonicalPathEntry(reference, segments, index, metadata);
  }

  const [realCanonicalRoot, realTarget] = await Promise.all([
    realpath(join(repoRoot, CANONICAL_AGENT_ROOT)),
    realpath(target),
  ]);
  assertRealContainment(reference, realCanonicalRoot, realTarget);
  return target;
}

/** Read a canonical source only after lexical containment and symlink-free traversal checks. */
export async function readCanonicalAgentFile(repoRoot: string, reference: string): Promise<string> {
  const target = await inspectCanonicalPath(repoRoot, reference);
  try {
    return await readFile(target, 'utf8');
  } catch {
    throw unreadableReference(reference);
  }
}

/** Synchronous counterpart used by the runtime reviewer resolver. */
export function readCanonicalAgentFileSync(repoRoot: string, reference: string): string {
  const { segments, target, traversedRoot } = canonicalPathWalk(repoRoot, reference);
  let traversed = traversedRoot;
  for (const [index, segment] of segments.entries()) {
    traversed = join(traversed, segment);
    let metadata;
    try {
      metadata = lstatSync(traversed);
    } catch {
      throw unreadableReference(reference);
    }
    assertCanonicalPathEntry(reference, segments, index, metadata);
  }

  const realCanonicalRoot = realpathSync(join(repoRoot, CANONICAL_AGENT_ROOT));
  const realTarget = realpathSync(target);
  assertRealContainment(reference, realCanonicalRoot, realTarget);
  try {
    return readFileSync(target, 'utf8');
  } catch {
    throw unreadableReference(reference);
  }
}
