import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine } from '../core/terminal-output.js';

import {
  ARC_ACTIVE_WINDOW_SECONDS,
  ARC_PALETTE_SIZE,
  isArcChannelFileName,
  parseArcChannel,
  resolveChannelColour,
} from './arc-channel-grammar.js';
import { deriveWornColours, nextFreeColourIndex } from './arc-next-colour.js';
import type { ChannelColourFacts } from './arc-next-colour.js';

/**
 * `pnpm agent-tools:arc-next-colour` — the channel-open assignment helper the
 * protocol convention names: prints each of TODAY'S channels with its worn
 * colour and the next free palette index, so the opener computes the
 * assignment instead of eyeballing it. Occupancy is same-day-by-filename and
 * mtime-immune (a quiet-but-live channel keeps its colour — the 2026-07-10
 * double-collision class; see `arc-next-colour.ts`); the 30-minute mtime
 * window survives only as the per-channel `active`/`quiet` DISPLAY label.
 * Reads the directory as-present (statusline semantics — assignment must see
 * live channels).
 *
 * @packageDocumentation
 */

const CHANNELS_DIR = '.agent/collaboration/rapid-comms';

/**
 * Collaboration surfaces anchor to the PRIMARY checkout, never a worktree: a
 * fresh worktree's checked-out mtimes are all "now", which would read every
 * old channel as active and poison the assignment scan. In the main tree
 * `--git-common-dir` equals the git dir; in a linked worktree it points into
 * the primary checkout's `.git`, whose parent is the primary root.
 */
function resolvePrimaryRoot(): string {
  const fromHere = resolveRepoRoot(import.meta.url);
  const commonDir = execFileSync(
    'git',
    ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    { cwd: fromHere, encoding: 'utf8' },
  ).trim();
  return path.dirname(commonDir);
}

const repoRoot = resolvePrimaryRoot();

async function main(): Promise<void> {
  const dir = path.join(repoRoot, CHANNELS_DIR);
  const names = (await fs.readdir(dir)).filter((n) => isArcChannelFileName(n));
  const nowMs = Date.now();
  const todayIsoDate = new Date(nowMs).toISOString().slice(0, 10);
  const facts: ChannelColourFacts[] = [];

  for (const name of names.sort()) {
    if (!name.startsWith(`${todayIsoDate}-`)) {
      continue;
    }
    const filePath = path.join(dir, name);
    const stat = await fs.stat(filePath);
    const ageSeconds = (nowMs - stat.mtime.getTime()) / 1000;
    const colour = resolveChannelColour(parseArcChannel(name, await fs.readFile(filePath, 'utf8')));
    const colourIndex = colour.kind === 'indexed' ? colour.index : undefined;
    facts.push({ name, colourIndex });
    // Occupancy is same-day by filename (mtime-immune — a quiet-but-live
    // channel keeps its colour: the 2026-07-10 double-collision class);
    // the 30-minute window survives only as the activity DISPLAY marker.
    const activity =
      ageSeconds >= 0 && ageSeconds <= ARC_ACTIVE_WINDOW_SECONDS ? 'active' : 'quiet';
    const wornText = colourIndex === undefined ? 'no colour' : `colour ${String(colourIndex)}`;
    writeLine(`${activity} (worn today): ${name} — ${wornText}`);
  }

  const worn = deriveWornColours(facts, todayIsoDate);
  writeLine(`next free index: ${String(nextFreeColourIndex(worn, ARC_PALETTE_SIZE))}`);
}

await main();
