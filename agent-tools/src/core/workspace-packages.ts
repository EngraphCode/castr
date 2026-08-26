import fs from 'node:fs/promises';
import path from 'node:path';

import { isErrnoCode } from './errno.js';

/**
 * Workspace-package discovery shared by validators that must cover the whole
 * manifest estate (root plus every workspace package). Lifted from the
 * loop-closure-references validator at its second consumer
 * (manifest-duplicate-keys) per `consolidate-at-second-consumer`.
 *
 * @packageDocumentation
 */

/**
 * Extract the `packages:` list from a `pnpm-workspace.yaml`. A minimal parser
 * for the block-sequence form this repo uses — `packages:` on its own line
 * followed by indented `- <entry>` items, terminated by the next non-indented
 * line. Pure (no IO) so consumers' recomputes are unit-testable.
 *
 * SUPPORTED: block sequence, single- or double-quoted entries, trailing
 * inline comments on an item (`- lib  # core`). NOT supported (would parse to
 * empty/partial — acceptable because this repo's file is plain block style):
 * flow style (`packages: [a, b]`) and anchors/aliases. Consumers always seed
 * the root `package.json` regardless, so an empty parse degrades to
 * root-only, never to a crash.
 *
 * @param yaml - Raw `pnpm-workspace.yaml` contents.
 * @returns The declared package globs/paths, in file order.
 */
export function parseWorkspacePackages(yaml: string): readonly string[] {
  const packages: string[] = [];
  const lines = yaml.split('\n');
  let inPackages = false;

  for (const line of lines) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const itemMatch = /^\s+-\s+(.+?)\s*$/.exec(stripInlineComment(line));
      if (itemMatch) {
        packages.push(stripQuotes(itemMatch[1]));
        continue;
      }
      // A non-indented, non-item line ends the block.
      if (/^\S/.test(line)) {
        inPackages = false;
      }
    }
  }

  return packages;
}

/** Strip a trailing ` # comment` from a YAML line (outside quotes). */
function stripInlineComment(line: string): string {
  return line.replace(/\s+#.*$/, '');
}

/** Remove a single matching pair of surrounding single/double quotes. */
export function stripQuotes(value: string): string {
  return value.replace(/^(['"])(.*)\1$/, '$2');
}

/**
 * Resolve the repo-relative `package.json` paths to read: the root, plus each
 * workspace package declared in `pnpm-workspace.yaml`. Glob entries ending in
 * `/*` are expanded one directory deep; literal entries are read directly. A
 * missing `pnpm-workspace.yaml` degrades to root-only.
 *
 * @param repoRoot - Absolute path of the repository root.
 * @returns Repo-relative manifest paths, root first, in discovery order.
 */
export interface WorkspaceDiscoveryIo {
  /** Read a UTF-8 file; same contract as `fs.readFile(path, 'utf8')`. */
  readonly readFile: (filePath: string) => Promise<string>;
  /** List a directory with file types; same contract as `fs.readdir`. */
  readonly readdir: (
    dirPath: string,
  ) => Promise<readonly { name: string; isDirectory: () => boolean }[]>;
}

const REAL_IO: WorkspaceDiscoveryIo = {
  readFile: (filePath) => fs.readFile(filePath, 'utf8'),
  readdir: (dirPath) => fs.readdir(dirPath, { withFileTypes: true }),
};

export async function discoverWorkspaceManifestPaths(
  repoRoot: string,
  io: WorkspaceDiscoveryIo = REAL_IO,
): Promise<readonly string[]> {
  const paths = new Set<string>(['package.json']);

  let workspaceYaml: string;
  try {
    workspaceYaml = await io.readFile(path.join(repoRoot, 'pnpm-workspace.yaml'));
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return [...paths];
    }
    throw error;
  }

  for (const entry of parseWorkspacePackages(workspaceYaml)) {
    if (entry.endsWith('/*')) {
      const parent = entry.slice(0, -2);
      let dirEntries: readonly { name: string; isDirectory: () => boolean }[];
      try {
        dirEntries = await io.readdir(path.join(repoRoot, parent));
      } catch (error) {
        if (isErrnoCode(error, 'ENOENT')) {
          continue;
        }
        throw error;
      }
      for (const dirEntry of dirEntries) {
        if (dirEntry.isDirectory()) {
          paths.add(`${parent}/${dirEntry.name}/package.json`);
        }
      }
    } else {
      paths.add(`${entry}/package.json`);
    }
  }

  return [...paths];
}
