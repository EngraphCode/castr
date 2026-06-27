#!/usr/bin/env node

/**
 * Machine-local-path validator.
 *
 * Enforces the `no-machine-local-paths` invariant over every tracked file: a
 * version-controlled file MUST NOT contain a user-home or machine-temp absolute
 * path (it resolves only on one machine and often leaks a username = PII). The
 * pattern set + exclusions are single-sourced from the `machine-local-path`
 * `preToolUseContent` scoped block in `.agent/hooks/policy.json` — the same block
 * the PreToolUse write-hook uses — so the gate and the write-time guard never
 * drift on what they match (see the helper module for the two deliberate
 * scan/case differences).
 *
 * Wired into root `repo-validators:check`, which runs in the pre-push hook (via
 * `check:ci`) and in `pnpm check`. Exit 0 = clean; exit 1 = at least one
 * machine-local path found; exit 2 = the policy block is missing
 * (misconfiguration). The scan/skip/verdict logic lives in pure, unit-tested
 * helpers; this entrypoint is the thin IO + exit shell.
 *
 * @packageDocumentation
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { loadScopedContentBlocks } from '../../hook-policy/policy-loader.js';

import {
  NUL,
  readScanFiles,
  resolveScanOutcome,
  selectMachineLocalBlock,
} from './validate-no-machine-local-paths-helpers.js';

/** List every tracked file, NUL-delimited so paths with spaces survive. */
function listTrackedFiles(repoRoot: string): string[] {
  const stdout = execFileSync('git', ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout.split(NUL).filter((entry) => entry.length > 0);
}

const repoRoot = resolveRepoRoot(import.meta.url);
const block = selectMachineLocalBlock(await loadScopedContentBlocks());
const files = readScanFiles(repoRoot, listTrackedFiles(repoRoot), (absolutePath) =>
  readFileSync(absolutePath, 'utf8'),
);

const outcome = resolveScanOutcome(block, files);
outcome.stdout.forEach((line) => writeLine(line));
outcome.stderr.forEach((line) => writeErrorLine(line));
process.exit(outcome.exitCode);
