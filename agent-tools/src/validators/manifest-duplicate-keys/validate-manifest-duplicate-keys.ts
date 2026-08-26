import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { discoverWorkspaceManifestPaths } from '../../core/workspace-packages.js';
import { writeLine, writeErrorLine } from '../../core/terminal-output.js';

import {
  findDuplicateJsonKeys,
  type DuplicateKeyViolation,
} from './validate-manifest-duplicate-keys-helpers.js';

/**
 * Standalone validator that fails when a load-bearing JSON manifest carries a
 * duplicate key within one object scope. `JSON.parse` resolves duplicates
 * silently (last wins), prettier reprints both, and build warnings do not
 * block — so without this gate the defect class survives every green surface
 * (measured escape: PR #62 round 7 duplicated `test:coverage` in two
 * workspace manifests).
 *
 * Scanned estate: the root `package.json`, every workspace `package.json`
 * declared in `pnpm-workspace.yaml`, and `turbo.json`. A missing file is
 * skipped (the estate list is discovery, not existence assertion).
 *
 * Wired into root `repo-validators:check`, so it runs on every pre-commit and
 * pre-push alongside the sibling validators.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

/** Repo-relative JSON files scanned beyond the manifest estate. */
const EXTRA_SCANNED_FILES: readonly string[] = ['turbo.json'];

interface FileViolations {
  readonly relativePath: string;
  readonly violations: readonly DuplicateKeyViolation[];
}

function isEnoent(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'ENOENT'
  );
}

function formatViolations(files: readonly FileViolations[]): string {
  return files
    .flatMap((file) =>
      file.violations.map(
        (violation) =>
          `  ${file.relativePath}:${violation.line}  duplicate key "${violation.key}" ` +
          `(first occurrence at line ${violation.firstLine})`,
      ),
    )
    .join('\n');
}

async function main(): Promise<void> {
  const manifestPaths = await discoverWorkspaceManifestPaths(repoRoot);
  const scanPaths = [...manifestPaths, ...EXTRA_SCANNED_FILES];

  const failures: FileViolations[] = [];
  let scanned = 0;
  for (const relativePath of scanPaths) {
    let source: string;
    try {
      source = await fs.readFile(path.join(repoRoot, relativePath), 'utf8');
    } catch (error) {
      if (isEnoent(error)) {
        continue;
      }
      throw error;
    }
    scanned += 1;
    const violations = findDuplicateJsonKeys(source);
    if (violations.length > 0) {
      failures.push({ relativePath, violations });
    }
  }

  if (failures.length === 0) {
    writeLine(
      `validate-manifest-duplicate-keys: OK (${scanned} manifest(s) scanned, no duplicate keys)`,
    );
    return;
  }

  const total = failures.reduce((sum, file) => sum + file.violations.length, 0);
  writeErrorLine(
    `validate-manifest-duplicate-keys: ${total} duplicate key(s) across ${failures.length} file(s).\n\n` +
      `${formatViolations(failures)}\n\n` +
      `JSON.parse keeps only the LAST occurrence, so a duplicate silently shadows its sibling. ` +
      `Delete the redundant occurrence (or merge the two if their values differ).`,
  );
  process.exit(1);
}

await main();
