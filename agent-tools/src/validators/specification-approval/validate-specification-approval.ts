#!/usr/bin/env node

/**
 * Standalone validator that makes the specification's change control enforceable
 * (docs/SPECIFICATION.md, SPEC-CC-3): it fails when the text above the change log does not
 * match the latest approval record, when the change log holds no record, and when an approval
 * record the base branch holds is missing here. The rules and the reading live in
 * `validate-specification-approval-helpers.ts`; this shell reads the committed bytes, asks
 * git for the base branch's copy and prints the outcome.
 *
 * The base branch is `origin/main`, read from the local object store: a checkout that has
 * not fetched it cannot conclude and exits 2, so the continuous-integration job fetches full
 * history.
 *
 * Wired into root `repo-validators:check`, which the continuous-integration `static-checks`
 * job runs inside the required `quality-gates` check.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { errnoCodeOf, isErrnoCode } from '../../core/errno.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { resolveTrustedGit } from '../../core/trusted-git.js';
import type { ValidatorOutcome } from '../../core/validator-outcome.js';

import {
  checkSpecificationAgainstBase,
  SPECIFICATION_FILE,
} from './validate-specification-approval-helpers.js';

/** The branch whose approval records may never be removed (SPEC-CC-3). */
const BASE_REF = 'origin/main';

const cannotRead = (reason: string): ValidatorOutcome => ({
  exitCode: 2,
  stdout: [],
  stderr: [`${SPECIFICATION_FILE}: cannot be read for change control: ${reason}.`],
});

type BaseCopy =
  | { readonly kind: 'bytes'; readonly bytes: Uint8Array }
  | { readonly kind: 'absent' }
  | { readonly kind: 'unknown'; readonly reason: string };

/**
 * The base branch's copy of the specification, from git's object store. Three answers, kept
 * apart: the bytes, a base that holds no specification, and a base this checkout cannot see.
 */
function readBaseCopy(repoRoot: string): BaseCopy {
  const git = resolveTrustedGit();
  const run = (args: readonly string[]) => spawnSync(git, args, { cwd: repoRoot });
  if (run(['rev-parse', '--verify', '--quiet', `${BASE_REF}^{commit}`]).status !== 0) {
    return {
      kind: 'unknown',
      reason: `${BASE_REF} is not in this checkout, so its approval records cannot be compared; fetch it with "git fetch origin main"`,
    };
  }
  const blob = `${BASE_REF}:${SPECIFICATION_FILE}`;
  if (run(['cat-file', '-e', blob]).status !== 0) {
    return { kind: 'absent' };
  }
  const shown = run(['show', blob]);
  return shown.status === 0
    ? { kind: 'bytes', bytes: shown.stdout }
    : { kind: 'unknown', reason: `git could not read ${blob}` };
}

/**
 * The committed bytes at the specification's path, checked with the base branch's copy.
 * `lstat` does not follow a symbolic link, so a link or a directory is refused rather than
 * read through to bytes that are not the file's.
 */
function checkCommittedSpecification(): ValidatorOutcome {
  const repoRoot = resolveRepoRoot(import.meta.url);
  const specificationPath = path.join(repoRoot, SPECIFICATION_FILE);
  try {
    if (!lstatSync(specificationPath).isFile()) {
      return cannotRead('the path is not a regular file');
    }
    const bytes = readFileSync(specificationPath);
    const base = readBaseCopy(repoRoot);
    if (base.kind === 'unknown') {
      return cannotRead(base.reason);
    }
    return checkSpecificationAgainstBase(bytes, base.kind === 'bytes' ? base.bytes : undefined);
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return cannotRead('the file does not exist');
    }
    // Any other file-system refusal (EACCES, ENOTDIR, EISDIR…) is also "cannot be read", so
    // the exit code stays 2; an error with no errno code is a defect and is thrown.
    const code = errnoCodeOf(error);
    if (code !== undefined) {
      return cannotRead(`the file system refused it (${code})`);
    }
    throw error;
  }
}

const outcome = checkCommittedSpecification();
outcome.stdout.forEach((line) => writeLine(line));
outcome.stderr.forEach((line) => writeErrorLine(line));
process.exit(outcome.exitCode);
