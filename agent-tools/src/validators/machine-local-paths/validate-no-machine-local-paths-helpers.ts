/**
 * Pure helpers for the machine-local-path validator.
 *
 * @remarks
 * The validator enforces the `no-machine-local-paths` invariant over every
 * tracked file: a version-controlled file MUST NOT contain a user-home or
 * machine-temp absolute path (`/Users/<seg>`, `/home/<seg>`, `C:\Users\<seg>`,
 * `/private/tmp`, `/var/folders`). Such a path resolves only on one machine and
 * often leaks a username (PII).
 *
 * The pattern set + path scoping are single-sourced from the `machine-local-path`
 * `preToolUseContent` scoped block in `.agent/hooks/policy.json` (the same block
 * the PreToolUse write-hook uses), so the commit/CI gate and the write-time guard
 * cannot drift on WHAT they match (patterns) or WHERE they look (include/exclude
 * via {@link isPathInScope}). Two differences are deliberate, not drift:
 *
 * - **Scope of lines.** This scan is strict — it inspects every line, including
 *   fenced code blocks, because a machine-local path in a fenced command example
 *   is still a machine-local path in a committed file. The write-hook skips
 *   fences.
 * - **Case.** This scan is case-sensitive to the canonical forms (`/Users`,
 *   `/home`, `C:\Users`); the write-hook compiles case-insensitively. Case
 *   sensitivity is intentional: a lowercase `/users/<seg>` is far more often a
 *   URL / HTTP-route segment (e.g. an OpenAPI path `/users/search`) than a
 *   machine-local path, so matching it would false-positive on legitimate
 *   route fixtures. The canonical home directories are correctly cased.
 *
 * @packageDocumentation
 */

import path from 'node:path';

import { isPathInScope } from '../../hook-policy/matchers.js';
import { type ScopedContentBlockGroup } from '../../hook-policy/types.js';

/** Null byte: the `git ls-files -z` record separator, and the binary-content marker. */
export const NUL = '\u0000';

/**
 * File extensions that are genuinely binary — not worth scanning as text. SVG is
 * deliberately NOT here: it is plain text and can embed a machine-local path in
 * metadata, so it is scanned like any other text file.
 */
export const SKIP_EXTENSIONS: ReadonlySet<string> = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.map',
  '.lock',
]);

/** Specific large generated files with no human-authored paths to police. */
export const SKIP_FILES: ReadonlySet<string> = new Set(['pnpm-lock.yaml']);

/** A single machine-local path occurrence. */
export interface MachineLocalPathHit {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly text: string;
}

/** A file to scan: its repo-relative path and full text content. */
export interface ScanFile {
  readonly path: string;
  readonly content: string;
}

/** Reads a file's UTF-8 content given its absolute path. Injectable for tests. */
export type FileReader = (absolutePath: string) => string;

/**
 * The resolved verdict of a scan: a process exit code plus the lines to emit.
 * 0 = clean, 1 = at least one hit, 2 = the policy block is missing.
 */
export interface ScanOutcome {
  readonly exitCode: 0 | 1 | 2;
  readonly stdout: readonly string[];
  readonly stderr: readonly string[];
}

/** The policy concept name for the machine-local-path block. */
const MACHINE_LOCAL_PATH_CONCEPT = 'machine-local-path';

/**
 * Select the machine-local-path block from the policy's scoped content blocks.
 *
 * @returns the block, or `undefined` when the policy does not define it.
 */
export function selectMachineLocalBlock(
  blocks: readonly ScopedContentBlockGroup[],
): ScopedContentBlockGroup | undefined {
  return blocks.find((block) => block.concept === MACHINE_LOCAL_PATH_CONCEPT);
}

/**
 * Scan one file's content for machine-local path patterns.
 *
 * @remarks
 * Every line is inspected (fences included). At most one hit is recorded per
 * line — enough to flag the line — to keep output readable. Patterns are
 * compiled with the `u` flag, matching the validity guarantee the policy schema
 * enforces (`ScopedContentBlockGroupSchema` compiles each `kind: regex` pattern
 * with `u`), so the validator can never accept a pattern the schema rejected nor
 * mis-parse a `u`-mode construct. Matching is case-sensitive (see the module
 * remarks).
 */
export function findMachineLocalPathHits(
  file: string,
  content: string,
  patterns: readonly string[],
): MachineLocalPathHit[] {
  const regexes = patterns.map((pattern) => new RegExp(pattern, 'u'));
  const hits: MachineLocalPathHit[] = [];

  content.split('\n').forEach((rawLine, index) => {
    for (const regex of regexes) {
      const match = regex.exec(rawLine);
      if (match !== null) {
        hits.push({ file, line: index + 1, column: match.index + 1, text: match[0] });
        break;
      }
    }
  });

  return hits;
}

/**
 * Scan many files for machine-local paths, honouring the block's include /
 * exclude path scoping (via {@link isPathInScope}).
 */
export function scanForMachineLocalPaths(
  files: readonly ScanFile[],
  block: ScopedContentBlockGroup,
): MachineLocalPathHit[] {
  const hits: MachineLocalPathHit[] = [];

  for (const file of files) {
    if (!isPathInScope(file.path, block.include_paths, block.exclude_paths)) {
      continue;
    }
    hits.push(...findMachineLocalPathHits(file.path, file.content, block.patterns));
  }

  return hits;
}

/**
 * Read the scannable text files, skipping binary/generated content.
 *
 * @remarks
 * Fails loud if a tracked file cannot be read: a silently-skipped tracked file
 * could hide a machine-local path, so skipping it would be a green-gate bypass.
 * The reader is injectable so the skip/fail-loud logic is unit-testable without
 * a fixture tree.
 */
export function readScanFiles(
  repoRoot: string,
  relativePaths: readonly string[],
  readFile: FileReader,
): ScanFile[] {
  const files: ScanFile[] = [];
  for (const relativePath of relativePaths) {
    if (SKIP_FILES.has(path.basename(relativePath))) {
      continue;
    }
    if (SKIP_EXTENSIONS.has(path.extname(relativePath))) {
      continue;
    }
    let content: string;
    try {
      content = readFile(path.join(repoRoot, relativePath));
    } catch (error) {
      throw new Error(
        `Cannot read tracked file '${relativePath}' for the machine-local-path scan. ` +
          `Fix the file or its permissions — the scan must not skip a tracked file.`,
        { cause: error },
      );
    }
    if (content.includes(NUL)) {
      continue;
    }
    files.push({ path: relativePath, content });
  }
  return files;
}

/**
 * Resolve the scan verdict (exit code + output lines) from the policy block and
 * the files to scan. Pure: the runtime calls this, then prints and exits.
 *
 * @param block - the machine-local-path policy block, or `undefined` when the
 *   policy does not define it (a misconfiguration → exit 2).
 */
export function resolveScanOutcome(
  block: ScopedContentBlockGroup | undefined,
  files: readonly ScanFile[],
): ScanOutcome {
  if (block === undefined) {
    return {
      exitCode: 2,
      stdout: [],
      stderr: [
        'validate-no-machine-local-paths: no `machine-local-path` block in .agent/hooks/policy.json',
      ],
    };
  }

  const hits = scanForMachineLocalPaths(files, block);

  if (hits.length === 0) {
    return {
      exitCode: 0,
      stdout: [`✓ no machine-local paths in ${files.length} tracked files`],
      stderr: [],
    };
  }

  return {
    exitCode: 1,
    stdout: [],
    stderr: [
      `✖ ${hits.length} machine-local path(s) found in tracked files:`,
      ...hits.map((hit) => `  ${hit.file}:${hit.line}:${hit.column}  ${hit.text}`),
      '',
      'Machine-local absolute paths resolve only on one machine and may leak a username (PII). ' +
        'Use a repo-root-relative path for in-repo targets, or a platform variable / tilde (~) for ' +
        'per-user surfaces. See .agent/rules/no-machine-local-paths.md.',
    ],
  };
}
