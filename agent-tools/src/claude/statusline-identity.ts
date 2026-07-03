#!/usr/bin/env node
/**
 * Claude Code statusline adapter.
 *
 * @remarks
 * Reads the JSON object Claude Code passes on stdin and prints the statusline:
 * the agent identity (with coordination glyphs), Claude.ai rate-limit gauges,
 * the model, context % and working branch, the working location, and — in a
 * team checkout with linked worktrees — the shared coordination branch on its
 * own row.
 *
 * The logo style is read from `ENGRAPH_STATUSLINE_LOGO` (default `none` — the
 * castr mark does not exist yet; when it lands in `engraph-logo.ts` the styles
 * become opt-in and the logo-column layout activates). The agent-identity name
 * (PDR-027) comes from the built `agent-identity` CLI. Git facts come from
 * {@link gatherGitFacts} against the working directory in the payload; the
 * session-shape glyphs from two cheap reads of the primary checkout's
 * coordination state.
 *
 * Failure handling is split by segment. The **location facts** (working branch,
 * coordination branch) fail LOUD — an unexpected git error renders a visible
 * token, never a silent fallback (see `statusline-git-io.ts`). **Cosmetic**
 * details (dirty mark, worktree name, coordination glyphs) degrade to absent. A
 * top-level guard renders a loud token rather than crashing the adapter to a
 * blank line.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCollaborationRegistry } from '../collaboration-state/state-parsers.js';
import { type CollaborationRegistry } from '../collaboration-state/types.js';
import { resolveLogoRows, resolveLogoStyle, type EngraphLogoStyle } from './engraph-logo.js';
import { readRegistryWithSoloFloor } from './statusline-registry-read.js';
import { BOLD, RED, RESET } from './statusline-ansi.js';
import { createFsFrameStore, LOGO_FRAME_STATE_DIR } from './statusline-frame-store.js';
import { gatherGitFacts } from './statusline-git-io.js';
import { planStatuslineExecution, type StatuslinePlan } from './statusline-identity-input.js';
import { isMotionDisabled, readAndAdvanceFrame } from './statusline-logo-cycle.js';
import { renderStatusline } from './statusline-render.js';
import {
  resolveSessionShape,
  type ExperimentsEntry,
  type SessionShape,
} from './statusline-session-shape.js';

const builtIdentityCliPath = resolveBuiltIdentityCliPath();

let stdinBuffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  stdinBuffer += chunk;
});
process.stdin.on('end', () => {
  emitStatusline(stdinBuffer);
});

function emitStatusline(rawJson: string): void {
  const plan: StatuslinePlan = planStatuslineExecution(rawJson);
  if (plan.kind === 'noop') {
    return;
  }
  try {
    process.stdout.write(renderFromInputs(plan.inputs));
  } catch (cause) {
    // Fail loud, never blank: an unexpected fault renders a visible token so the
    // issue is seen, rather than crashing the adapter to an empty statusline.
    process.stdout.write(`${RED}${BOLD}⚠ statusline: ${String(cause)}${RESET}`);
  }
}

function renderFromInputs(inputs: Extract<StatuslinePlan, { kind: 'render' }>['inputs']): string {
  const cwd = inputs.cwd ?? process.cwd();
  const identity = deriveIdentity(inputs.seed);
  const git = gatherGitFacts(cwd);
  const logoStyle = resolveLogoStyle(process.env.ENGRAPH_STATUSLINE_LOGO);
  return renderStatusline(
    {
      identity,
      dir: basename(cwd),
      branch: git.branch,
      dirty: git.dirty,
      worktree: git.worktree,
      coordinationBranch: git.coordinationBranch,
      coordinationPlace: git.coordinationPlace,
      error: git.error,
      usedPercentage: inputs.usedPercentage,
      fiveHourPercentage: inputs.fiveHourPercentage,
      fiveHourResetSeconds: secondsUntil(inputs.fiveHourResetsAt),
      sevenDayPercentage: inputs.sevenDayPercentage,
      sevenDayResetSeconds: secondsUntil(inputs.sevenDayResetsAt),
      model: inputs.model,
      sessionShape: gatherSessionShape(git.primaryRoot, identity),
    },
    { logoRows: resolveLogoRowsForTick(logoStyle, inputs.seed) },
  );
}

/**
 * Seconds from now until a Unix-epoch-seconds reset instant, or `undefined` when
 * the instant is absent. The clock read lives here, in the impure adapter, so the
 * downstream countdown formatting stays pure; a past instant yields a negative
 * value that the formatter clamps to zero.
 */
function secondsUntil(resetsAtEpochSeconds: number | undefined): number | undefined {
  return resetsAtEpochSeconds === undefined
    ? undefined
    : resetsAtEpochSeconds - Math.floor(Date.now() / 1000);
}

/**
 * Resolve the already-selected mark rows for this render tick (the renderer
 * consumes resolved rows — asset resolution and frame selection live here in
 * the composition root against `engraph-logo.ts`).
 *
 * A style with no rows (`none` — currently the only style) renders no logo and
 * writes no frame state. When a cycling castr mark lands, the frame advances
 * once per render per session unless motion is disabled via
 * `ENGRAPH_STATUSLINE_MOTION` or no session id is present (both pin frame 0).
 */
function resolveLogoRowsForTick(
  style: EngraphLogoStyle,
  sessionId: string | undefined,
): readonly string[] | undefined {
  const frameZeroRows = resolveLogoRows(style, 0);
  if (frameZeroRows === undefined || sessionId === undefined) {
    return frameZeroRows;
  }
  if (isMotionDisabled(process.env.ENGRAPH_STATUSLINE_MOTION)) {
    return frameZeroRows;
  }
  return resolveLogoRows(
    style,
    readAndAdvanceFrame(createFsFrameStore(LOGO_FRAME_STATE_DIR), sessionId),
  );
}

function deriveIdentity(seed: string | undefined): string | undefined {
  if (seed === undefined || !existsSync(builtIdentityCliPath)) {
    return undefined;
  }
  const result = spawnSync(
    process.execPath,
    [builtIdentityCliPath, '--seed', seed, '--format', 'display'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    return undefined;
  }
  const name = result.stdout.trim();
  return name.length === 0 ? undefined : name;
}

function resolveBuiltIdentityCliPath(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  return resolve(moduleDir, '..', 'bin', 'agent-identity.js');
}

/**
 * Gather the session-shape inputs and resolve the coordination indicators for
 * this tick, against the PRIMARY checkout root (resolved by {@link gatherGitFacts}
 * — a worktree seat must read the live registry, not its own checked-out copy).
 * These reads soft-fail to undefined: the coordination GLYPHS are best-effort
 * glances, distinct from the load-bearing location facts.
 */
function gatherSessionShape(
  primaryRoot: string | undefined,
  ownAgentName: string | undefined,
): SessionShape {
  return resolveSessionShape({
    ownAgentName,
    registry: primaryRoot === undefined ? undefined : readActiveClaimsRegistry(primaryRoot),
    experimentsListing: primaryRoot === undefined ? undefined : listExperiments(primaryRoot),
    nowIso: new Date().toISOString(),
  });
}

/**
 * Read the active-claims registry with the absent-registry solo floor. The
 * three-way classification (ENOENT → empty registry → truthful solo; other
 * read failure or corrupt content → undefined → `unknown`) is owned and
 * unit-proven by `statusline-registry-read.ts`; this wrapper just binds the
 * real filesystem reader and parser.
 */
function readActiveClaimsRegistry(primaryRoot: string): CollaborationRegistry | undefined {
  return readRegistryWithSoloFloor(
    join(primaryRoot, '.agent/state/collaboration/active-claims.json'),
    (path) => readFileSync(path, 'utf8'),
    parseCollaborationRegistry,
  );
}

function listExperiments(primaryRoot: string): readonly ExperimentsEntry[] | undefined {
  // ArcAngel channels live in the canonical rapid-comms home (absent in castr
  // until the ArcAngel bring lands; the wing indicator stays dark, gracefully).
  const experimentsDir = join(primaryRoot, '.agent/collaboration/rapid-comms');
  try {
    return readdirSync(experimentsDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => statExperimentsEntry(experimentsDir, join(entry.parentPath, entry.name)))
      .filter((entry) => entry !== undefined);
  } catch {
    return undefined;
  }
}

/**
 * Stat one experiments file, isolating per-entry failures: a file deleted
 * between the directory listing and its stat drops only that entry, not the
 * whole ARC listing for the tick.
 */
function statExperimentsEntry(
  experimentsDir: string,
  filePath: string,
): ExperimentsEntry | undefined {
  try {
    return {
      name: relative(experimentsDir, filePath),
      mtimeIso: statSync(filePath).mtime.toISOString(),
    };
  } catch {
    return undefined;
  }
}
