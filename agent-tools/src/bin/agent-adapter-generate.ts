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
import { generateAdapters } from '../agent-adapter-generate/generator.js';

interface CliFlags {
  readonly clear: boolean;
  readonly check: boolean;
  readonly help: boolean;
}

const USAGE = `Usage: agent-adapter-generate [--check | --clear]

Generate Claude and Cursor adapters from the repository's canonical Codex sources.

Options:
  --check  Exit non-zero when generated adapters or rules are stale.
  --clear  Remove the generated estate before writing validated outputs.
  --help   Show this complete help text and exit.

Example:
  pnpm agents:adapter-generate --check
`;

class CliUsageError extends Error {}

function parseFlags(args: readonly string[]): CliFlags {
  const supported = new Set(['--check', '--clear', '--help']);
  const unsupported = args.filter((arg) => !supported.has(arg));
  if (unsupported.length > 0) {
    throw new CliUsageError(`Unsupported argument(s): ${unsupported.join(', ')}`);
  }
  if (new Set(args).size !== args.length) {
    throw new CliUsageError('Each option may be supplied at most once.');
  }
  if (args.includes('--help')) {
    if (args.length !== 1) {
      throw new CliUsageError('`--help` cannot be combined with another option.');
    }
    return { clear: false, check: false, help: true };
  }
  if (args.includes('--clear') && args.includes('--check')) {
    throw new CliUsageError('`--check` and `--clear` cannot be combined.');
  }
  return {
    clear: args.includes('--clear'),
    check: args.includes('--check'),
    help: false,
  };
}

function writeDiagnostics(label: string, paths: readonly string[]): void {
  if (paths.length === 0) return;
  stderr.write(`${label} adapters:\n`);
  for (const path of paths) stderr.write(`  ${path}\n`);
}

async function runCheck(repoRoot: string): Promise<number> {
  const result = await checkAdapters(repoRoot);
  if (
    result.drifted.length === 0 &&
    result.missing.length === 0 &&
    result.unexpected.length === 0
  ) {
    stdout.write('All agent adapters and cursor rules are up to date.\n');
    return 0;
  }
  writeDiagnostics('Missing', result.missing);
  writeDiagnostics('Drifted', result.drifted);
  writeDiagnostics('Unexpected', result.unexpected);
  if (result.unexpected.length > 0) {
    stderr.write(
      'Inspect the listed unexpected files, then run `pnpm agents:adapter-generate --clear` to replace generated outputs.\n',
    );
  } else {
    stderr.write('Run `pnpm agents:adapter-generate` to regenerate.\n');
  }
  return 1;
}

async function runGenerate(repoRoot: string, flags: CliFlags): Promise<number> {
  const outcome = await generateAdapters(repoRoot, { clear: flags.clear });
  if (flags.clear) {
    stdout.write('Cleared generated adapter directories.\n');
  }
  stdout.write(`Wrote ${String(outcome.written.length)} adapter files.\n`);
  return 0;
}

async function main(): Promise<number> {
  const flags = parseFlags(argv.slice(2));
  if (flags.help) {
    stdout.write(USAGE);
    return 0;
  }
  const repoRoot = cwd();
  return flags.check ? await runCheck(repoRoot) : await runGenerate(repoRoot, flags);
}

try {
  exit(await main());
} catch (error: unknown) {
  if (error instanceof CliUsageError) {
    stderr.write(`agent-adapter-generate failed: ${error.message}\n\n${USAGE}`);
  } else {
    stderr.write(`agent-adapter-generate failed: ${String(error)}\n`);
  }
  exit(1);
}
