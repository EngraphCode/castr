#!/usr/bin/env node
/**
 * Claude Code SUBAGENT statusline shim.
 *
 * Delegates to the built subagent-statusline adapter inside agent-tools at
 * `agent-tools/dist/src/claude/subagent-statusline-adapter.js`. The adapter
 * parses the harness's per-refresh tasks payload and prints one
 * `{"id","content"}` row per visible subagent, each carrying the subagent's
 * resolved model.
 *
 * Soft surface: any failure (missing build artefact, spawn error, non-zero
 * child exit) results in exit 0 with no stdout, so the subagent status rows
 * fall back to the harness default rendering rather than breaking.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Prefer CLAUDE_PROJECT_DIR (set by Claude Code in newer versions) over
// positional path arithmetic, which would silently drift if `.claude/scripts/`
// or `agent-tools/` ever relocates.
const repoRoot =
  process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const adapterPath = resolve(repoRoot, 'agent-tools/dist/src/claude/subagent-statusline-adapter.js');

if (!existsSync(adapterPath)) {
  process.exit(0);
}

const child = spawn(process.execPath, [adapterPath], {
  stdio: 'inherit',
});

child.on('error', () => {
  process.exit(0);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
