import { normalizeFileList } from './path-list.js';

const ACTIVE_CLAIMS_PATH = '.agent/state/collaboration/active-claims.json';

/**
 * Return the operator warning for the intentional active-claims split state.
 */
export function activeClaimsSplitWarning(input: {
  readonly intentFiles: readonly string[];
  readonly worktreeShortStatus?: string;
}): string | undefined {
  if (
    stagesActiveClaimsRegistry(input.intentFiles) &&
    input.worktreeShortStatus !== undefined &&
    hasStagedAndUnstagedActiveClaims(input.worktreeShortStatus)
  ) {
    return (
      `${ACTIVE_CLAIMS_PATH} has an unstaged commit-queue fingerprint after ` +
      'record-staged; do not re-stage it.'
    );
  }

  return undefined;
}

/**
 * Return the corrective error when active-claims was re-staged after recording.
 */
export function activeClaimsRestagedReason(files: readonly string[]): string | undefined {
  if (!stagesActiveClaimsRegistry(files)) {
    return undefined;
  }

  return (
    'active-claims.json was re-staged after record-staged; the queue ' +
    'fingerprint changes its own staged payload. Leave the working-tree ' +
    'fingerprint unstaged and rerun verify-staged.'
  );
}

/**
 * Return the intent files whose worktree content diverges from the staged
 * index. `git commit -- <pathspec>` commits the WORKTREE version of the
 * pathspec, so any such divergence means the commit would land content the
 * staged-bundle fingerprint verification never saw. The active-claims
 * registry is exempt: its record-staged fingerprint write is a sanctioned,
 * deliberately-unstaged split state (see the warning above).
 */
export function worktreeDivergentIntentFiles(input: {
  readonly intentFiles: readonly string[];
  readonly worktreeShortStatus?: string;
}): readonly string[] {
  if (input.worktreeShortStatus === undefined) {
    return [];
  }
  const intentFiles = new Set(normalizeFileList(input.intentFiles.join('\n')));

  return input.worktreeShortStatus
    .split(/\r?\n/u)
    .filter((line) => line.length > 3 && !isWorktreeCleanStatus(line[1]))
    .map((line) => statusLinePath(line))
    .filter((path) => path !== ACTIVE_CLAIMS_PATH && intentFiles.has(path));
}

function isWorktreeCleanStatus(worktreeColumn: string | undefined): boolean {
  return worktreeColumn === ' ' || worktreeColumn === '?';
}

function statusLinePath(line: string): string {
  const path = line.slice(3);
  const renameArrow = path.indexOf(' -> ');
  return renameArrow === -1 ? path : path.slice(renameArrow + 4);
}

function stagesActiveClaimsRegistry(files: readonly string[]): boolean {
  return normalizeFileList(files.join('\n')).includes(ACTIVE_CLAIMS_PATH);
}

function hasStagedAndUnstagedActiveClaims(shortStatus: string): boolean {
  return shortStatus
    .split(/\r?\n/u)
    .some((line) => line.slice(0, 2).trim().length === 2 && line.slice(3) === ACTIVE_CLAIMS_PATH);
}
