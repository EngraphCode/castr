#!/usr/bin/env node

/**
 * Standalone validator that makes the specification's change control enforceable
 * (docs/SPECIFICATION.md, SPEC-CC-3): it fails when the text above the change log does not
 * match the latest approval record, and while no record exists it fails if the status is
 * `ratified`. The rules and the reading live in `validate-specification-approval-helpers.ts`;
 * this shell reads the committed bytes and prints the outcome.
 *
 * Wired into root `repo-validators:check`, which the continuous-integration `static-checks`
 * job runs inside the required `quality-gates` check.
 *
 * @packageDocumentation
 */

import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { isErrnoCode } from '../../core/errno.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import type { ValidatorOutcome } from '../../core/validator-outcome.js';

import {
  checkSpecificationBytes,
  SPECIFICATION_FILE,
} from './validate-specification-approval-helpers.js';

const cannotRead = (reason: string): ValidatorOutcome => ({
  exitCode: 2,
  stdout: [],
  stderr: [`${SPECIFICATION_FILE}: cannot be read for change control: ${reason}.`],
});

/**
 * The committed bytes at the specification's path. `lstat` does not follow a symbolic link, so
 * a link or a directory is refused rather than read through to bytes that are not the file's.
 */
function checkCommittedSpecification(): ValidatorOutcome {
  const specificationPath = path.join(resolveRepoRoot(import.meta.url), SPECIFICATION_FILE);
  try {
    if (!lstatSync(specificationPath).isFile()) {
      return cannotRead('the path is not a regular file');
    }
    return checkSpecificationBytes(readFileSync(specificationPath));
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return cannotRead('the file does not exist');
    }
    throw error;
  }
}

const outcome = checkCommittedSpecification();
outcome.stdout.forEach((line) => writeLine(line));
outcome.stderr.forEach((line) => writeErrorLine(line));
process.exit(outcome.exitCode);
