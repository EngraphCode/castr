#!/usr/bin/env node

/**
 * Pre-commit hook to prevent accidental major version bumps
 * Checks commit messages for breaking change indicators
 */

import { readFileSync } from 'node:fs';
import { argv, exit } from 'node:process';
import { writeErrorLine } from '../core/terminal-output.js';

import {
  checkForBangCommit,
  checkForBreakingChanges,
  majorBumpOverrideActive,
} from './prevent-accidental-major-version-helpers.js';

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function getCommitMessage(): string {
  // Get the commit message file from command line argument
  const commitMsgFile = argv[2];

  if (!commitMsgFile) {
    writeErrorLine('Error: No commit message file provided');
    exit(1);
    return '';
  }

  try {
    return readFileSync(commitMsgFile, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeErrorLine(`Error reading commit message file: ${message}`);
    exit(1);
    return '';
  }
}

function printErrorHeader(line: string): void {
  writeErrorLine(line);
  writeErrorLine(`${RED}⚠️  MAJOR VERSION BUMP DETECTED!${RESET}`);
  writeErrorLine(line);
  writeErrorLine('');
}

function printErrorCause(hasBreakingChange: boolean, hasBangCommit: boolean): void {
  if (hasBreakingChange) {
    writeErrorLine(`Your commit message contains a BREAKING CHANGE indicator.`);
  }

  if (hasBangCommit) {
    writeErrorLine(`Your commit uses the '!' syntax (e.g., feat!, fix!).`);
  }

  writeErrorLine(`This would trigger a major version bump (to 1.0.0 or higher).`);
  writeErrorLine('');
}

function printErrorAdvice(): void {
  writeErrorLine(`${YELLOW}Major-version signals are deliberate, owner-gated events:${RESET}`);
  writeErrorLine(`• If this change is NOT breaking, reword the message — drop the`);
  writeErrorLine(`  breaking marker rather than mislabelling the change.`);
  writeErrorLine(`• If it IS an intentional breaking change with owner approval,`);
  writeErrorLine(`  re-run the commit with ENGRAPH_ALLOW_MAJOR_VERSION=1 so the`);
  writeErrorLine(`  breaking marker is PRESERVED for semver tooling.`);
  writeErrorLine(`• Never strip a genuine BREAKING CHANGE footer to slip past this`);
  writeErrorLine(`  guard — that hides the semver signal from consumers.`);
  writeErrorLine('');
}

function printError(hasBreakingChange: boolean, hasBangCommit: boolean): void {
  const line = `${RED}${'━'.repeat(75)}${RESET}`;

  printErrorHeader(line);
  printErrorCause(hasBreakingChange, hasBangCommit);
  printErrorAdvice();
  writeErrorLine(`${RED}Commit blocked. Please modify your commit message and try again.${RESET}`);
  writeErrorLine(line);
}

function main(): void {
  const commitMessage = getCommitMessage();

  if (!commitMessage) {
    // No commit message yet, this is fine
    exit(0);
  }

  const hasBreakingChange = checkForBreakingChanges(commitMessage);
  const hasBangCommit = checkForBangCommit(commitMessage);

  if (hasBreakingChange || hasBangCommit) {
    if (majorBumpOverrideActive(process.env)) {
      writeErrorLine(
        `${YELLOW}⚠️  Major-version signal ALLOWED by ENGRAPH_ALLOW_MAJOR_VERSION=1 ` +
          `(owner-authorised override).${RESET}`,
      );
      exit(0);
    }
    printError(hasBreakingChange, hasBangCommit);
    exit(1);
  }

  exit(0);
}

main();
