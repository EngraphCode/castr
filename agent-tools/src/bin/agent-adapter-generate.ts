#!/usr/bin/env node
/**
 * CLI for the native agent-adapter + cursor-rule generator.
 *
 * Usage:
 *   agent-adapter-generate            # generate adapters into the current repo
 *   agent-adapter-generate --check    # exit non-zero if any adapter is stale
 *   agent-adapter-generate --clear    # clear generated dirs before generating
 *
 * Run from the repository root.
 */
import { argv, cwd, exit, stderr, stdout } from 'node:process';

import { checkAdapters } from '../agent-adapter-generate/checker.js';
import { clearGeneratedAdapters, generateAdapters } from '../agent-adapter-generate/generator.js';

interface CliFlags {
  readonly clear: boolean;
  readonly check: boolean;
}

function parseFlags(args: readonly string[]): CliFlags {
  return { clear: args.includes('--clear'), check: args.includes('--check') };
}

async function runCheck(repoRoot: string): Promise<number> {
  const result = await checkAdapters(repoRoot);
  if (result.drifted.length === 0 && result.missing.length === 0) {
    stdout.write('All agent adapters and cursor rules are up to date.\n');
    return 0;
  }
  if (result.missing.length > 0) {
    stderr.write(`Missing adapters:\n${result.missing.map((p) => `  ${p}`).join('\n')}\n`);
  }
  if (result.drifted.length > 0) {
    stderr.write(`Drifted adapters:\n${result.drifted.map((p) => `  ${p}`).join('\n')}\n`);
  }
  stderr.write('Run `pnpm agents:adapter-generate` to regenerate.\n');
  return 1;
}

async function runGenerate(repoRoot: string, flags: CliFlags): Promise<number> {
  if (flags.clear) {
    await clearGeneratedAdapters(repoRoot);
    stdout.write('Cleared generated adapter directories.\n');
  }
  const outcome = await generateAdapters(repoRoot);
  stdout.write(`Wrote ${String(outcome.written.length)} adapter files.\n`);
  return 0;
}

async function main(): Promise<number> {
  const flags = parseFlags(argv.slice(2));
  const repoRoot = cwd();
  return flags.check ? await runCheck(repoRoot) : await runGenerate(repoRoot, flags);
}

try {
  exit(await main());
} catch (error: unknown) {
  stderr.write(`agent-adapter-generate failed: ${String(error)}\n`);
  exit(1);
}
