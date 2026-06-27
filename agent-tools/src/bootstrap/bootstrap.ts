import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine, writeErrorLine } from '../core/terminal-output.js';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import { interpretTscOutcome } from './bootstrap-helpers.js';

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
 * Register the `engraph-semantic-merge` git merge driver in the local repo config
 * (LC2 stage-2). git merge-driver config lives in `.git/config` and is NOT
 * committable, so it must be (re-)established per checkout at install time. The
 * `.gitattributes` map (committed) points the `merge_class` memory/state paths at
 * this driver name; without the config the driver name is unbound and git falls
 * back to its default line-merge — so this registration is what makes the
 * conflict-time tripwire actually FIRE.
 *
 * Idempotent (`git config` overwrites the same key) and guarded: a non-git or
 * git-less environment is not a fatal install error — the human discipline in the
 * semantic-merge skill remains the backstop.
 */
function registerSemanticMergeDriver(): void {
  const insideWorkTree = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });
  if (insideWorkTree.status !== 0) {
    writeLine('[bootstrap-agent-tools] not a git work tree — skipped semantic-merge driver config');
    return;
  }

  const driverBin = path.join(agentToolsDir, 'dist', 'src', 'bin', 'semantic-merge-driver.js');
  const settings: readonly (readonly [string, string])[] = [
    [
      `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`,
      'engraph concept-preserving memory/state merge (refuse-and-route)',
    ],
    [`merge.${SEMANTIC_MERGE_DRIVER_NAME}.driver`, `node "${driverBin}" %O %A %B %P`],
  ];
  for (const [key, value] of settings) {
    const result = spawnSync('git', ['config', '--local', key, value], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      writeErrorLine(
        `[bootstrap-agent-tools] failed to set git config ${key} — semantic-merge tripwire not armed`,
      );
      return;
    }
  }
  writeLine(`[bootstrap-agent-tools] armed git merge driver ${SEMANTIC_MERGE_DRIVER_NAME}`);
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
  registerSemanticMergeDriver();
  writeLine('[bootstrap-agent-tools] built agent-tools/dist');
}

main();
