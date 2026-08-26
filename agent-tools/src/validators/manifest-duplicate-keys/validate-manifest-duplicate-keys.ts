import fs from 'node:fs/promises';
import path from 'node:path';

import { isErrnoCode } from '../../core/errno.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import {
  discoverWorkspaceManifestPaths,
  discoverWorkspaceTsconfigPaths,
} from '../../core/workspace-packages.js';
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
 * declared in `pnpm-workspace.yaml`, every `tsconfig*.json` in those same
 * directories (TypeScript also resolves duplicated compiler options
 * last-wins — a duplicated `"strict"` silently disables strict checking),
 * and the extra load-bearing files below. A missing file is skipped (the
 * estate list is discovery, not existence assertion).
 *
 * Wired into root `repo-validators:check` AND invoked directly by source path
 * from `.husky/pre-commit`, `.husky/pre-push`, and the CI static-checks job —
 * the direct invocations exist because this gate scans the very manifests
 * that define the script keys: a duplicated script key (last-wins) could
 * otherwise disable the only gate that would have caught it.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

/**
 * Repo-relative JSON/JSONC files scanned beyond the manifest estate — every
 * load-bearing JSON surface where a silently-shadowed duplicate would change
 * behaviour: the turbo task graph (JSONC-capable upstream, either filename),
 * the Claude hook/permission settings (a duplicated `hooks` key silently
 * drops a guard), the hook policy, the skills lockfile, and the root configs
 * of the BLOCKING format/lint tools — markdownlint (both config forms) and
 * prettier gate every commit, and tsdoc.json feeds the TSDoc lint — where a
 * duplicated `globs`/`ignores`/option member is accepted last-wins and can
 * silently narrow or disable the gate. The scanner ignores JSONC comments,
 * so JSONC members are safe to include. (`api.json` is a sample OpenAPI
 * document — data, not a gate config — and is deliberately not listed.)
 */
const EXTRA_SCANNED_FILES: readonly string[] = [
  'turbo.json',
  'turbo.jsonc',
  '.claude/settings.json',
  '.agent/hooks/policy.json',
  'skills-lock.json',
  '.markdownlint-cli2.jsonc',
  '.markdownlint.json',
  '.prettierrc.json',
  'tsdoc.json',
];

interface FileViolations {
  readonly relativePath: string;
  readonly violations: readonly DuplicateKeyViolation[];
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
  const tsconfigPaths = await discoverWorkspaceTsconfigPaths(repoRoot, manifestPaths);
  const scanPaths = [...manifestPaths, ...tsconfigPaths, ...EXTRA_SCANNED_FILES];

  const failures: FileViolations[] = [];
  let scanned = 0;
  let scannedRoot = false;
  for (const relativePath of scanPaths) {
    let source: string;
    try {
      source = await fs.readFile(path.join(repoRoot, relativePath), 'utf8');
    } catch (error) {
      if (isErrnoCode(error, 'ENOENT')) {
        continue;
      }
      throw error;
    }
    scanned += 1;
    if (relativePath === 'package.json') {
      scannedRoot = true;
    }
    const violations = findDuplicateJsonKeys(source);
    if (violations.length > 0) {
      failures.push({ relativePath, violations });
    }
  }

  if (scanned === 0 || !scannedRoot) {
    writeErrorLine(
      'validate-manifest-duplicate-keys: the root package.json was not scanned — ' +
        'the estate discovery is broken, refusing to report green over nothing.',
    );
    process.exit(1);
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
