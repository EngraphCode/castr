import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine, writeErrorLine } from '../core/terminal-output.js';
import { resolveTrustedGit } from '../core/trusted-git.js';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import { interpretTscOutcome } from './bootstrap-helpers.js';
import { createGitSpawnRunner } from './git-spawn-runner.js';
import { registerSemanticMergeDriver } from './semantic-merge-driver-registration.js';

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

// The checkout being installed is the one this file lives in: the ambient
// project-directory variable a hook harness sets must not redirect the build
// and the driver registration to another checkout.
const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });
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

/** One line of diagnosis for a caught value, whatever was thrown. */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Arm the `engraph-semantic-merge` git merge driver: build the git seam (git by
 * its trusted absolute path, run from the repo root), hand the registration the
 * real filesystem, and report the outcome. The registered command is relative
 * to the checkout, so this one registration serves every linked worktree of
 * the repository. The decision logic and its tests live in
 * `semantic-merge-driver-registration.ts`.
 *
 * A git binary outside the trusted locations, a git that refuses the probe, and
 * any other environmental registration failure are reported loudly; none is
 * fatal to the install. An `invalid` outcome (the built driver is missing after
 * a successful build, or the repo root is not the top level git reports) is a
 * corrupt build and fails the install, matching the missing-compiler case.
 */
function armSemanticMergeDriver(): void {
  let gitBinary: string;
  try {
    gitBinary = resolveTrustedGit();
  } catch (error: unknown) {
    writeErrorLine(
      `[bootstrap-agent-tools] ${describeError(error)} — semantic-merge tripwire not armed`,
    );
    return;
  }

  const outcome = registerSemanticMergeDriver({
    repoRoot,
    runGit: createGitSpawnRunner({ gitBinary, cwd: repoRoot }),
    realpath: realpathSync,
    exists: existsSync,
  });
  switch (outcome.kind) {
    case 'armed':
      writeLine(
        `[bootstrap-agent-tools] armed git merge driver ${SEMANTIC_MERGE_DRIVER_NAME} in the local config of the repository at ${repoRoot}`,
      );
      return;
    case 'failed':
      writeErrorLine(
        `[bootstrap-agent-tools] ${outcome.reason} — semantic-merge tripwire not armed`,
      );
      return;
    case 'invalid':
      writeErrorLine(
        `[bootstrap-agent-tools] ${outcome.reason} — the build is not usable; failing the install`,
      );
      break;
    default: {
      const exhaustive: never = outcome;
      writeErrorLine(
        `[bootstrap-agent-tools] unhandled registration outcome ${JSON.stringify(exhaustive)} — semantic-merge tripwire not armed`,
      );
      return;
    }
  }
  process.exit(1);
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
