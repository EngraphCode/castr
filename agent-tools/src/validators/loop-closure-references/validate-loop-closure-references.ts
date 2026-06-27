import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeLine, writeErrorLine } from '../../core/terminal-output.js';

import {
  findHollowScriptReferences,
  parseWorkspacePackages,
  type HollowScriptReferenceFinding,
} from './loop-closure-references-helpers.js';

/**
 * Loop-closure meta-validator (LC0) — first reference class: hollow
 * `pnpm <script>` references in doctrine surfaces.
 *
 * Walks the surfaces that AGENTS TRUST as enforcement contracts — `.agent/rules`,
 * `.agent/skills`, `.agent/directives` — and fails if any names a `pnpm <script>`
 * command whose resolved script does not exist in any workspace `package.json`.
 * A rule/skill/directive that cites an enforcement command which silently does
 * nothing is a feedback loop that only looks closed: doctrine present, mechanism
 * absent. The sibling `validate-no-stale-script-invocations` catches retired
 * root `scripts/<name>` paths but never resolved `pnpm <script>` names, so hollow
 * refs (`pnpm check:profile`, `pnpm markdownlint-check:root`, `pnpm run cruise`)
 * passed every gate green.
 *
 * The resolve universe is RECOMPUTED at run time from the workspace
 * `package.json` scripts plus `node_modules/.bin` (never a frozen literal):
 * root plus every `pnpm-workspace.yaml` package.
 *
 * PRECONDITION: dependencies must be installed. The universe includes
 * `node_modules/.bin` so `pnpm <bin>` fall-through references (e.g. `pnpm turbo`)
 * resolve; on a fresh, uninstalled checkout those bins are absent and would be
 * reported as hollow. Always invoked post-install inside `repo-validators:check`
 * (which runs after `pnpm build` in the gate), so this holds in practice.
 *
 * Wired into `pnpm repo-validators:check`.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

/**
 * Doctrine surfaces walked recursively. These are the surfaces whose prose
 * asserts enforcement; narrative/operational surfaces (plans, memory) quote
 * commands in discussion and are out of this validator's v1 scope.
 */
const SCANNED_ROOTS: readonly string[] = ['.agent/rules', '.agent/skills', '.agent/directives'];

/** Only authored markdown carries the doctrine prose this validator checks. */
const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set(['.md']);

/**
 * Path-fragment exclusions. `/archive/` is historical record; `/node_modules/`
 * is vendored.
 */
const EXCLUDED_PATH_FRAGMENTS: readonly string[] = ['/archive/', '/node_modules/'];

/**
 * Repo-relative paths exempted from the check — surfaces that legitimately
 * quote a hollow reference verbatim in prose. Empty by default; add a path
 * only with a one-line reason, never to silence a genuine false claim.
 */
const ALLOWLISTED_PATHS: readonly string[] = [];

interface ScannableFile {
  readonly path: string;
  readonly content: string;
}

function isEnoent(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

/**
 * Recompute the defined universe a `pnpm <name>` reference can resolve to: the
 * union of every `scripts` key across the root and workspace `package.json`
 * files, plus every installed `node_modules/.bin` binary (pnpm runs
 * `pnpm <bin>` by fall-through, e.g. `pnpm turbo`). Recomputed every run, never
 * a frozen literal.
 */
async function collectDefinedNames(): Promise<ReadonlySet<string>> {
  const names = new Set<string>();

  const packageJsonPaths = await discoverPackageJsonPaths();
  for (const relativePath of packageJsonPaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    let raw: string;
    try {
      raw = await fs.readFile(absolutePath, 'utf8');
    } catch (error) {
      if (isEnoent(error)) {
        continue;
      }
      throw error;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(
        `validate-loop-closure-references: failed to parse ${relativePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'scripts' in parsed &&
      typeof parsed.scripts === 'object' &&
      parsed.scripts !== null
    ) {
      for (const name of Object.keys(parsed.scripts)) {
        names.add(name);
      }
    }

    // The package directory's own .bin (pnpm hoists most binaries to the root
    // node_modules/.bin, but workspace-local ones live alongside the package).
    const packageDir = path.dirname(absolutePath);
    await addBinaries(path.join(packageDir, 'node_modules', '.bin'), names);
  }

  return names;
}

/** Add every entry of a `node_modules/.bin` directory to the name set. */
async function addBinaries(binDir: string, names: Set<string>): Promise<void> {
  let entries: readonly string[];
  try {
    entries = await fs.readdir(binDir);
  } catch (error) {
    if (isEnoent(error)) {
      return;
    }
    throw error;
  }
  for (const entry of entries) {
    names.add(entry);
  }
}

/**
 * Resolve the package.json paths to read: the root, plus each workspace
 * package declared in `pnpm-workspace.yaml`. Glob entries ending in `/*` are
 * expanded one directory deep; literal entries are read directly.
 */
async function discoverPackageJsonPaths(): Promise<readonly string[]> {
  const paths = new Set<string>(['package.json']);

  let workspaceYaml: string;
  try {
    workspaceYaml = await fs.readFile(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');
  } catch (error) {
    if (isEnoent(error)) {
      return [...paths];
    }
    throw error;
  }

  for (const entry of parseWorkspacePackages(workspaceYaml)) {
    if (entry.endsWith('/*')) {
      const parent = entry.slice(0, -2);
      let dirEntries: readonly { name: string; isDirectory: () => boolean }[];
      try {
        dirEntries = await fs.readdir(path.join(repoRoot, parent), { withFileTypes: true });
      } catch (error) {
        if (isEnoent(error)) {
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

async function discoverScannableFiles(): Promise<readonly ScannableFile[]> {
  const files: ScannableFile[] = [];
  for (const rootRelative of SCANNED_ROOTS) {
    await collectFiles(path.join(repoRoot, rootRelative), files);
  }
  return files;
}

async function collectFiles(absoluteDir: string, accumulator: ScannableFile[]): Promise<void> {
  let entries: readonly { name: string; isDirectory: () => boolean; isFile: () => boolean }[];
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if (isEnoent(error)) {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryAbsolute = path.join(absoluteDir, entry.name);
    const entryRelative = path.relative(repoRoot, entryAbsolute);
    const normalizedRelative = entryRelative.split(path.sep).join('/');

    if (EXCLUDED_PATH_FRAGMENTS.some((fragment) => normalizedRelative.includes(fragment))) {
      continue;
    }

    if (entry.isDirectory()) {
      await collectFiles(entryAbsolute, accumulator);
      continue;
    }

    if (entry.isFile() && SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      const content = await fs.readFile(entryAbsolute, 'utf8');
      accumulator.push({ path: normalizedRelative, content });
    }
  }
}

function formatFindings(findings: readonly HollowScriptReferenceFinding[]): string {
  return findings
    .map(
      (finding) =>
        `  ${finding.path}:${finding.line}  ${finding.match}  (script: ${finding.script})`,
    )
    .join('\n');
}

async function main(): Promise<void> {
  const [definedScripts, files] = await Promise.all([
    collectDefinedNames(),
    discoverScannableFiles(),
  ]);

  const findings = findHollowScriptReferences(files, {
    definedScripts,
    allowlistedPaths: ALLOWLISTED_PATHS,
  });

  if (findings.length === 0) {
    writeLine(
      'validate-loop-closure-references: OK (every `pnpm <script>` reference in rules/skills/directives resolves)',
    );
    return;
  }

  writeErrorLine(
    `validate-loop-closure-references: ${findings.length} hollow \`pnpm <script>\` reference(s) found.\n\n` +
      `${formatFindings(findings)}\n\n` +
      `A doctrine surface names an enforcement command whose script is not defined in any ` +
      `workspace package.json — the loop only looks closed. Fix each by BRINGING the missing ` +
      `script/mechanism (preferred) or correcting the reference to the real command. If a surface ` +
      `legitimately quotes a hollow reference in prose, add its path to ALLOWLISTED_PATHS with a reason.`,
  );
  process.exit(1);
}

await main();
