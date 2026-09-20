import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine, writeErrorLine } from '../core/terminal-output.js';
import { resolveTrustedGit } from '../core/trusted-git.js';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import { interpretTscOutcome } from './bootstrap-helpers.js';
import {
  type GitSpawnRunner,
  registerSemanticMergeDriver,
} from './semantic-merge-driver-registration.js';

/**
 * Install-time bootstrap, run by the root `postinstall` via `tsx`.
 *
 * Builds ONLY `@engraph/agent-tools` `dist` so the repo's PreToolUse guards
 * (`.claude/settings.json`) and agent CLIs are available immediately after
 * `pnpm install`. It reproduces agent-tools' own build script
 * (`tsc -p tsconfig.build.json` + the executable-bit chmod) by invoking `tsc`
 * directly, so the build orchestrator (`turbo`) and the package manager stay
 * out of the install lifecycle — enforced by the `validate-lifecycle-scripts`
 * validator.
 *
 * `typescript` is a direct dependency of agent-tools, so it is present in dev
 * and `--prod` installs alike; a missing compiler therefore signals a corrupt
 * install and fails loudly rather than silently leaving the fail-open guards
 * without `dist`. Set `ENGRAPH_SKIP_AGENT_TOOLS_BOOTSTRAP=1` to opt out deliberately.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);
const agentToolsDir = path.join(repoRoot, 'agent-tools');

/** Set the executable bit on every compiled CLI entry, mirroring the build script. */
function markExecutableArtifacts(): void {
  const binDir = path.join(agentToolsDir, 'dist', 'src', 'bin');
  if (existsSync(binDir)) {
    for (const entry of readdirSync(binDir)) {
      if (entry.endsWith('.js')) {
        chmodSync(path.join(binDir, entry), 0o755);
      }
    }
  }
  const statuslinePath = path.join(
    agentToolsDir,
    'dist',
    'src',
    'claude',
    'statusline-identity.js',
  );
  if (existsSync(statuslinePath)) {
    chmodSync(statuslinePath, 0o755);
  }
}

/**
 * Arm the `engraph-semantic-merge` git merge driver for this checkout: build the
 * git seam (git by its trusted absolute path, run from the repo root), hand it to
 * the registration, and report the outcome. The decision logic and its tests live
 * in `semantic-merge-driver-registration.ts`.
 *
 * A git binary outside the trusted locations is the documented git-less case:
 * reported loudly, not fatal to the install.
 */
function armSemanticMergeDriver(): void {
  let gitBinary: string;
  try {
    gitBinary = resolveTrustedGit();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    writeErrorLine(`[bootstrap-agent-tools] ${message} — semantic-merge tripwire not armed`);
    return;
  }
  const runGit: GitSpawnRunner = (args) => {
    const result = spawnSync(gitBinary, [...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    return {
      error: result.error,
      signal: result.signal,
      status: result.status,
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
    };
  };

  const outcome = registerSemanticMergeDriver({
    driverBinPath: path.join(agentToolsDir, 'dist', 'src', 'bin', 'semantic-merge-driver.js'),
    runGit,
  });
  switch (outcome.kind) {
    case 'armed':
      writeLine(
        `[bootstrap-agent-tools] armed git merge driver ${SEMANTIC_MERGE_DRIVER_NAME} for ${repoRoot}`,
      );
      return;
    case 'skipped-not-a-work-tree':
      writeLine(
        '[bootstrap-agent-tools] not a git work tree — skipped semantic-merge driver config',
      );
      return;
    case 'failed':
      writeErrorLine(
        `[bootstrap-agent-tools] ${outcome.reason} — semantic-merge tripwire not armed`,
      );
      return;
  }
}

function main(): void {
  if (process.env.ENGRAPH_SKIP_AGENT_TOOLS_BOOTSTRAP === '1') {
    writeLine('[bootstrap-agent-tools] skipped (ENGRAPH_SKIP_AGENT_TOOLS_BOOTSTRAP=1)');
    return;
  }

  let tscBin: string;
  try {
    tscBin = createRequire(path.join(agentToolsDir, 'package.json')).resolve('typescript/bin/tsc');
  } catch {
    writeErrorLine(
      '[bootstrap-agent-tools] cannot resolve "typescript" from agent-tools — the install looks incomplete.',
    );
    writeErrorLine(
      '[bootstrap-agent-tools] Re-run `pnpm install`, or set ENGRAPH_SKIP_AGENT_TOOLS_BOOTSTRAP=1 to bypass deliberately.',
    );
    process.exit(1);
  }

  const result = spawnSync(
    process.execPath,
    [tscBin, '-p', path.join(agentToolsDir, 'tsconfig.build.json')],
    { cwd: agentToolsDir, stdio: 'inherit' },
  );
  const verdict = interpretTscOutcome({
    error: result.error,
    signal: result.signal,
    status: result.status,
  });
  if (verdict.failed) {
    writeErrorLine(`[bootstrap-agent-tools] ${verdict.reason ?? 'tsc build failed'}`);
    process.exit(verdict.exitCode);
  }

  markExecutableArtifacts();
  armSemanticMergeDriver();
  writeLine('[bootstrap-agent-tools] built agent-tools/dist');
}

main();
