#!/usr/bin/env node

/**
 * Fitness-Vocabulary Consistency Check
 *
 * Enforces ADR-144 §Key Principles #1 ("one scale, one vocabulary everywhere")
 * and Principle #6 ("no backward compatibility"). Scans live surfaces for the
 * retired two-threshold vocabulary and fails if any forbidden phrase appears.
 *
 * Exit 0 = clean. Exit 1 = drift found.
 *
 * Scope: all tracked `.md`, `.ts`, and `.mjs` files minus the documented
 * exclusions. Candidates come from `git ls-files`, so untracked reference
 * clones, worktrees, build output, and other machine-local files cannot alter
 * the result.
 *
 * Forbidden phrases list (case-sensitive unless noted):
 * - "two-threshold", "Two-Threshold", "Two Threshold" (model name retired)
 * - "advisory, not a blocking gate" (replaced by the four-zone scale)
 * - "informational, not gates" (same)
 * - "blocking violation" (replaced by "hard" / "critical" zone semantics)
 * - "soft-ceiling" (replaced by the `soft` zone label)
 * - "Soft-ceiling" (same)
 * - "not a blocking gate" (same)
 *
 * Each forbidden phrase is matched as a literal substring. The list is
 * intentionally narrow: these are the exact phrases the pre-rewrite ADR-144
 * used and that the three-zone revision retired.
 */

import { execFileSync } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { readRequiredRepositorySource } from '../../core/required-repository-source.js';
import { writeLine } from '../../core/terminal-output.js';
import { resolveTrustedGit } from '../../core/trusted-git.js';

const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });

const FORBIDDEN_PHRASES = [
  'two-threshold',
  'Two-Threshold',
  'Two Threshold',
  'advisory, not a blocking gate',
  'informational, not gates',
  'blocking violation',
  'soft-ceiling',
  'Soft-ceiling',
  'not a blocking gate',
];

const EXCLUDED_PATH_PREFIXES = ['.agent/practice-core-backup-', '.agent/practice-core/incoming/'];
const EXCLUDED_PATH_SEGMENTS = ['/archive/'];
const EXCLUDED_PATH_PREFIXES_EXTRA = ['.agent/experience/', '.remember/'];

/**
 * Files where the retired vocabulary is permitted by design (because they
 * explicitly discuss the evolution from two-threshold to three-zone).
 */
const ALLOWED_FILES = new Set([
  'docs/architecture/architectural-decisions/144-two-threshold-fitness-model.md',
  'agent-tools/src/validators/fitness-vocabulary/validate-fitness-vocabulary.ts',
  'agent-tools/src/validators/fitness-vocabulary/validate-fitness-vocabulary.unit.test.ts',
  'agent-tools/e2e-tests/fitness-vocabulary.e2e.test.ts',
]);

/**
 * The ADR-144 filename is preserved as `144-two-threshold-fitness-model.md`
 * for URL/link stability (git history preserves the evolution). Any line that
 * references the filename directly — a markdown link, an import path, a JSDoc
 * `@see` — must be exempt from the `two-threshold` forbidden-phrase match,
 * otherwise every cross-reference to the ADR would trigger a false positive.
 */
const ADR_144_FILENAME = '144-two-threshold-fitness-model.md';

/**
 * Decide whether a match of a forbidden phrase should be reported.
 * Exempts matches that only appear because the line references the preserved
 * ADR-144 filename.
 *
 * @param phrase - the forbidden phrase that matched
 * @param line - the full line the phrase appeared in
 * @returns true if the match should be reported
 */
export function shouldReportMatch(phrase: string, line: string): boolean {
  if (phrase !== 'two-threshold') {
    return true;
  }
  // Re-check without filename references; a match only inside the filename is permitted.
  const withoutFilename = line.split(ADR_144_FILENAME).join('');
  return withoutFilename.includes(phrase);
}

function normalizeRelativePath(relPath: string): string {
  return relPath.split(path.sep).join('/');
}

/**
 * Decide whether a file should be scanned for forbidden vocabulary.
 *
 * @param relPath - repo-relative path
 * @returns true if the file should be scanned
 */
export function shouldInspectFile(relPath: string): boolean {
  const normalized = normalizeRelativePath(relPath);

  if (!normalized.endsWith('.md') && !normalized.endsWith('.ts') && !normalized.endsWith('.mjs')) {
    return false;
  }

  if (EXCLUDED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  if (EXCLUDED_PATH_PREFIXES_EXTRA.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  if (EXCLUDED_PATH_SEGMENTS.some((segment) => normalized.includes(segment))) {
    return false;
  }
  if (ALLOWED_FILES.has(normalized)) {
    return false;
  }

  return true;
}

interface ForbiddenPhraseMatch {
  readonly phrase: string;
  readonly lineNumber: number;
  readonly line: string;
}

export interface TrackedFile {
  readonly mode: string;
  readonly objectId: string;
  readonly path: string;
}

/**
 * Scan a single file's content for forbidden phrases.
 *
 * @param content - file contents
 * @returns array of matches with phrase, line number, and trimmed line text
 */
export function findForbiddenPhrases(content: string): readonly ForbiddenPhraseMatch[] {
  const lines = content.split('\n');
  const findings: ForbiddenPhraseMatch[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    for (const phrase of FORBIDDEN_PHRASES) {
      if (line.includes(phrase) && shouldReportMatch(phrase, line)) {
        findings.push({ phrase, lineNumber: index + 1, line: line.trim() });
      }
    }
  }

  return findings;
}

/**
 * Remove ambient variables that can redirect Git away from the requested repository.
 *
 * @param environment - environment inherited by the validator process
 * @returns a copy without any case variant of a `GIT_*` variable
 */
export function sanitiseGitEnvironment(
  environment: Readonly<NodeJS.ProcessEnv>,
): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(environment).filter(([name]) => !name.toUpperCase().startsWith('GIT_')),
  );
}

/**
 * Parse the NUL-delimited output of `git ls-files --stage`.
 *
 * @param output - Git index records
 * @returns validated stage-zero file records
 * @throws when a record is malformed or the index contains an unresolved merge stage
 */
export function parseTrackedFiles(output: string): readonly TrackedFile[] {
  return output
    .split('\u0000')
    .filter((record) => record.length > 0)
    .map((record) => {
      const separator = record.indexOf('\t');
      const metadata = separator >= 0 ? record.slice(0, separator) : '';
      const filePath = separator >= 0 ? record.slice(separator + 1) : '';
      const match = /^(?<mode>[0-7]{6}) (?<objectId>[0-9a-f]{40,64}) (?<stage>[0-3])$/u.exec(
        metadata,
      );
      if (match?.groups === undefined || filePath.length === 0) {
        throw new Error('Cannot parse a tracked-file record from the Git index.');
      }
      if (match.groups.stage !== '0') {
        throw new Error(
          `Cannot validate '${filePath}' while the Git index contains unresolved merge stages.`,
        );
      }
      return {
        mode: match.groups.mode ?? '',
        objectId: match.groups.objectId ?? '',
        path: filePath,
      };
    });
}

function runGit(
  root: string,
  arguments_: readonly string[],
  purpose: string,
  environment: Readonly<NodeJS.ProcessEnv>,
): string {
  try {
    return execFileSync(resolveTrustedGit(), arguments_, {
      cwd: root,
      encoding: 'utf8',
      env: sanitiseGitEnvironment(environment),
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    throw new Error(`Cannot ${purpose} for the fitness-vocabulary scan in '${root}'.`, {
      cause: error,
    });
  }
}

function runGitBytes(
  root: string,
  arguments_: readonly string[],
  purpose: string,
  input: string,
  environment: Readonly<NodeJS.ProcessEnv>,
): Buffer {
  try {
    return execFileSync(resolveTrustedGit(), arguments_, {
      cwd: root,
      env: sanitiseGitEnvironment(environment),
      input,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    throw new Error(`Cannot ${purpose} for the fitness-vocabulary scan in '${root}'.`, {
      cause: error,
    });
  }
}

function listScanCandidates(
  root: string,
  environment: Readonly<NodeJS.ProcessEnv>,
): readonly TrackedFile[] {
  const trackedFiles = parseTrackedFiles(
    runGit(
      root,
      ['ls-files', '--cached', '--stage', '-z'],
      'read the tracked-file index',
      environment,
    ),
  );
  const candidates = trackedFiles.filter((file) => shouldInspectFile(file.path));
  for (const candidate of candidates) {
    if (candidate.mode !== '100644' && candidate.mode !== '100755') {
      throw new Error(
        `Cannot scan tracked path '${candidate.path}' with Git mode ${candidate.mode}; ` +
          'fitness-vocabulary candidates must be regular files.',
      );
    }
  }
  return candidates;
}

async function assertRepositoryRoot(
  root: string,
  environment: Readonly<NodeJS.ProcessEnv>,
): Promise<void> {
  const topLevel = runGit(
    root,
    ['rev-parse', '--show-toplevel'],
    'resolve the repository top level',
    environment,
  ).trim();
  if (topLevel.length === 0 || topLevel.includes('\n')) {
    throw new Error(`Cannot resolve the repository top level for the fitness-vocabulary scan.`);
  }
  const [requestedRoot, repositoryTopLevel] = await Promise.all([
    realpath(root),
    realpath(topLevel),
  ]);
  if (requestedRoot !== repositoryTopLevel) {
    throw new Error(
      `Cannot scan '${root}': the requested path must be the repository top level '${topLevel}'.`,
    );
  }
}

function readIndexFiles(
  root: string,
  files: readonly TrackedFile[],
  environment: Readonly<NodeJS.ProcessEnv>,
): ReadonlyMap<string, string> {
  if (files.length === 0) {
    return new Map();
  }

  const input = `${files.map((file) => file.objectId).join('\n')}\n`;
  const output = runGitBytes(
    root,
    ['--no-replace-objects', 'cat-file', '--batch'],
    'read indexed file content',
    input,
    environment,
  );
  const contents = new Map<string, string>();
  let offset = 0;

  for (const file of files) {
    const headerEnd = output.indexOf(0x0a, offset);
    if (headerEnd < 0) {
      throw new Error(`Cannot parse indexed content header for '${file.path}'.`);
    }
    const header = output.subarray(offset, headerEnd).toString('utf8');
    const match = /^(?<objectId>[\da-f]{40,64}) blob (?<size>\d+)$/u.exec(header);
    const size = Number(match?.groups?.size);
    if (match?.groups?.objectId !== file.objectId || !Number.isSafeInteger(size) || size < 0) {
      throw new Error(`Cannot parse indexed content header for '${file.path}'.`);
    }
    const contentStart = headerEnd + 1;
    const contentEnd = contentStart + size;
    if (contentEnd >= output.length || output[contentEnd] !== 0x0a) {
      throw new Error(`Cannot parse indexed content body for '${file.path}'.`);
    }
    contents.set(file.path, output.subarray(contentStart, contentEnd).toString('utf8'));
    offset = contentEnd + 1;
  }

  if (offset !== output.length) {
    throw new Error('Cannot parse the complete indexed content response.');
  }
  return contents;
}

function formatFileFindings(
  file: string,
  findings: readonly ForbiddenPhraseMatch[],
): readonly string[] {
  const lines: string[] = [];
  lines.push(`  \x1b[31m${file}\x1b[0m`);
  for (const finding of findings) {
    lines.push(
      `    line ${String(finding.lineNumber).padStart(4)}: "${finding.phrase}" — ${finding.line.slice(0, 100)}${finding.line.length > 100 ? '…' : ''}`,
    );
  }
  lines.push('');
  return lines;
}

type FileFindings = {
  readonly file: string;
  readonly findings: readonly ForbiddenPhraseMatch[];
};

async function readWorktreeFile(root: string, file: TrackedFile): Promise<string> {
  try {
    return await readRequiredRepositorySource(root, file.path);
  } catch (error) {
    throw new Error(
      `Cannot read tracked file '${file.path}' for the fitness-vocabulary scan. ` +
        'Restore it or commit its deletion; tracked files cannot be skipped.',
      { cause: error },
    );
  }
}

function requireIndexContent(indexContents: ReadonlyMap<string, string>, file: string): string {
  const content = indexContents.get(file);
  if (content === undefined) {
    throw new Error(`Indexed content is missing for tracked file '${file}'.`);
  }
  return content;
}

function contentFindings(file: string, content: string): FileFindings | undefined {
  const findings = findForbiddenPhrases(content);
  return findings.length === 0 ? undefined : { file, findings };
}

function trackedFileFindings(
  file: string,
  worktreeContent: string,
  indexContent: string,
): readonly FileFindings[] {
  if (indexContent === worktreeContent) {
    const findings = contentFindings(file, worktreeContent);
    return findings === undefined ? [] : [findings];
  }

  return [
    contentFindings(`${file} (working tree)`, worktreeContent),
    contentFindings(`${file} (Git index)`, indexContent),
  ].filter((findings): findings is FileFindings => findings !== undefined);
}

function reportFindings(
  allFindings: readonly FileFindings[],
  output: (line: string) => void,
): number {
  output('\nFitness Vocabulary Consistency Check (ADR-144)');
  output('════════════════════════════════════════════════\n');

  if (allFindings.length === 0) {
    output('\x1b[32m✓ All surfaces use the three-zone vocabulary.\x1b[0m\n');
    return 0;
  }

  const totalOccurrences = allFindings.reduce((sum, item) => sum + item.findings.length, 0);
  output(
    `\x1b[31m✗ Found ${totalOccurrences} retired-vocabulary occurrence${totalOccurrences === 1 ? '' : 's'} across ${allFindings.length} file${allFindings.length === 1 ? '' : 's'}:\x1b[0m\n`,
  );

  for (const { file, findings } of allFindings) {
    for (const outputLine of formatFileFindings(file, findings)) {
      output(outputLine);
    }
  }

  output(
    '\x1b[33mRemediation: translate each occurrence to the three-zone vocabulary.\nSee ADR-144 §Decision for the canonical zone names.\x1b[0m\n',
  );
  return 1;
}

/**
 * Validate the tracked live-document vocabulary of one repository.
 *
 * @param root - absolute repository path whose tracked files are validated
 * @param output - output sink for the human-readable report
 * @param environment - process environment supplied to Git after sanitisation
 * @returns zero when clean, otherwise one when forbidden vocabulary is found
 * @throws when Git enumeration or a tracked-file read fails
 */
export async function validateFitnessVocabulary(
  root: string,
  output: (line: string) => void = writeLine,
  environment: Readonly<NodeJS.ProcessEnv> = process.env,
): Promise<number> {
  await assertRepositoryRoot(root, environment);
  const files = listScanCandidates(root, environment);
  const indexContents = readIndexFiles(root, files, environment);
  const allFindings: FileFindings[] = [];

  for (const file of files) {
    const worktreeContent = await readWorktreeFile(root, file);
    const indexContent = requireIndexContent(indexContents, file.path);
    allFindings.push(...trackedFileFindings(file.path, worktreeContent, indexContent));
  }

  return reportFindings(allFindings, output);
}

/**
 * Resolve the repository root requested at the executable boundary.
 *
 * @param arguments_ - command-line arguments after the script path
 * @returns the default repository root or the explicit `--root` value
 * @throws for malformed or unsupported arguments
 */
export function parseCliRoot(arguments_: readonly string[]): string {
  if (arguments_.length === 0) {
    return repoRoot;
  }
  if (arguments_.length === 2 && arguments_[0] === '--root' && arguments_[1] !== undefined) {
    return path.resolve(arguments_[1]);
  }
  throw new Error('Usage: validate-fitness-vocabulary [--root <repository-path>]');
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  const exitCode = await validateFitnessVocabulary(parseCliRoot(process.argv.slice(2)));
  process.exit(exitCode);
}
