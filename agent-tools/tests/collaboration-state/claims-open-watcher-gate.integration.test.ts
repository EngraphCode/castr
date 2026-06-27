import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { resolveIdentity } from '../../src/collaboration-state/cli-identity';
import { parseOptions } from '../../src/collaboration-state/cli-options';
import { parseCollaborationRegistry } from '../../src/collaboration-state/state-io';
import { WATCHER_HEARTBEAT_SCHEMA_VERSION } from '../../src/collaboration-state/watcher-heartbeat';
import {
  commsSeenFileForCodename,
  DEFAULT_COMMS_SEEN_DIR,
  heartbeatFileForSeen,
} from '../../src/collaboration-state/watcher-presence';
import type { CollaborationAgentId } from '../../src/collaboration-state/types';
import {
  makeTempCollaborationRepo,
  removeDirectory,
} from '../test-helpers/temp-collaboration-state';

// LC1 (F-95) — `claims open` must REFUSE to stake a claim into a populated
// registry while this session is blind to the comms stream, and must reject a
// malformed `--now` rather than silently disabling the gate. The watcher-gate
// logic itself is unit-tested in `claims-open-watcher-gate.unit.test.ts`; this
// proves the WIRING fires at the real CLI surface (D->M->W->S loop closure).
//
// Hermeticity: each test `chdir`s into its temp repo so the gate's cwd-relative
// comms-seen path resolves under it (the verdict must come from the fixture, not
// from whatever ambient `.agent/` the runner's cwd happens to expose). Restored
// in `finally`; safe under vitest pool:forks + isolate:true (per-file process).

const NOW = '2026-06-20T10:00:00Z';

function activeClaimsPath(root: string): string {
  return join(root, '.agent/state/collaboration/active-claims.json');
}

function sessionEnv(seed: string): { readonly PRACTICE_AGENT_SESSION_ID_CLAUDE: string } {
  return { PRACTICE_AGENT_SESSION_ID_CLAUDE: `${seed}-aaaaaaaa` };
}

function openArgv(activePath: string, intent: string): readonly string[] {
  return [
    '--',
    'claims',
    'open',
    '--active',
    activePath,
    '--thread',
    'lc1-gate',
    '--area-kind',
    'files',
    '--area-pattern',
    'agent-tools/**',
    '--intent',
    intent,
    '--now',
    NOW,
    '--platform',
    'claude',
    '--model',
    'claude-opus-4-8',
  ];
}

/** Identity the CLI derives for a given session seed (path + identity-match). */
function identityForSeed(activePath: string, seed: string): CollaborationAgentId {
  return resolveIdentity(parseOptions(openArgv(activePath, 'identity')), sessionEnv(seed)).agent_id;
}

/**
 * Plant a fresh `live` heartbeat at `pathIdentity`'s canonical comms-seen path,
 * carrying `watcherIdentity` as its `watcher_identity`. When the two identities
 * differ, this models a foreign/copied heartbeat (the anti-spoof case). Relative
 * to cwd — call after `chdir(root)`.
 */
async function plantHeartbeat(
  pathIdentity: CollaborationAgentId,
  watcherIdentity: CollaborationAgentId,
): Promise<void> {
  const heartbeatPath = heartbeatFileForSeen(
    commsSeenFileForCodename(pathIdentity.agent_name, DEFAULT_COMMS_SEEN_DIR),
  );
  await mkdir(dirname(heartbeatPath), { recursive: true });
  const nowIso = new Date().toISOString();
  const heartbeat = {
    schema_version: WATCHER_HEARTBEAT_SCHEMA_VERSION,
    pid: process.pid,
    started_at: nowIso,
    last_drain_at: nowIso,
    last_emit_at: nowIso,
    last_error_at: null,
    emitted_count: 1,
    heartbeat_interval_ms: 30000,
    watcher_identity: watcherIdentity,
  };
  await writeFile(heartbeatPath, `${JSON.stringify(heartbeat, null, 2)}\n`, 'utf8');
}

async function withRepoCwd(fn: (root: string) => Promise<void>): Promise<void> {
  const root = await makeTempCollaborationRepo();
  const prevCwd = process.cwd();
  try {
    process.chdir(root);
    await fn(root);
  } finally {
    process.chdir(prevCwd);
    await removeDirectory(root);
  }
}

describe('claims open — F-95 watcher-presence gate (LC1)', () => {
  it('opens the bootstrap claim even when blind (no OTHER live agent — fast-path)', async () => {
    await withRepoCwd(async (root) => {
      const activePath = activeClaimsPath(root);
      const result = await runCollaborationStateCli({
        argv: openArgv(activePath, 'solo bootstrap'),
        env: sessionEnv('lc1-solo'),
      });

      expect(result.exitCode, result.stderr).toBe(0);
      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      expect(registry.claims).toHaveLength(1);
    });
  });

  it('refuses a blind claim when another live agent is present, leaving the registry unchanged', async () => {
    await withRepoCwd(async (root) => {
      const activePath = activeClaimsPath(root);
      // Peer A opens into the empty registry (solo fast-path) and becomes live.
      const peer = await runCollaborationStateCli({
        argv: openArgv(activePath, 'peer A present'),
        env: sessionEnv('lc1-peer-a'),
      });
      expect(peer.exitCode, peer.stderr).toBe(0);
      const afterPeer = await readFile(activePath, 'utf8');

      // Session B has no heartbeat under the temp repo -> blind.
      const blind = await runCollaborationStateCli({
        argv: openArgv(activePath, 'blind B with peer present'),
        env: sessionEnv('lc1-blind-b'),
      });

      expect(blind.exitCode).not.toBe(0);
      expect(blind.stderr).toMatch(/refusing to open a claim while blind/i);
      // The gate runs inside the transactional transform: no write on refusal.
      expect(await readFile(activePath, 'utf8')).toBe(afterPeer);
    });
  });

  it('opens a claim with a peer present when this session has a live, identity-matching watcher', async () => {
    await withRepoCwd(async (root) => {
      const activePath = activeClaimsPath(root);
      const peer = await runCollaborationStateCli({
        argv: openArgv(activePath, 'peer A present'),
        env: sessionEnv('lc1-peer-a2'),
      });
      expect(peer.exitCode, peer.stderr).toBe(0);

      // Session B arms its OWN watcher (identity matches) -> present -> allowed.
      const bIdentity = identityForSeed(activePath, 'lc1-present-b');
      await plantHeartbeat(bIdentity, bIdentity);
      const result = await runCollaborationStateCli({
        argv: openArgv(activePath, 'present B with peer'),
        env: sessionEnv('lc1-present-b'),
      });

      expect(result.exitCode, result.stderr).toBe(0);
      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      expect(registry.claims).toHaveLength(2);
    });
  });

  it('refuses despite a live heartbeat at the canonical path when its identity is foreign (anti-spoof)', async () => {
    await withRepoCwd(async (root) => {
      const activePath = activeClaimsPath(root);
      const peer = await runCollaborationStateCli({
        argv: openArgv(activePath, 'peer A present'),
        env: sessionEnv('lc1-peer-a3'),
      });
      expect(peer.exitCode, peer.stderr).toBe(0);
      const afterPeer = await readFile(activePath, 'utf8');

      // A LIVE heartbeat sits at B's canonical path, but it belongs to a
      // DIFFERENT session (copied/planted) -> must NOT count as B's watcher.
      const bIdentity = identityForSeed(activePath, 'lc1-foreign-b');
      const foreignIdentity = identityForSeed(activePath, 'lc1-foreign-other');
      await plantHeartbeat(bIdentity, foreignIdentity);

      const result = await runCollaborationStateCli({
        argv: openArgv(activePath, 'foreign-heartbeat B with peer'),
        env: sessionEnv('lc1-foreign-b'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/not this session|refusing to open a claim while blind/i);
      expect(await readFile(activePath, 'utf8')).toBe(afterPeer);
    });
  });

  it('rejects a malformed --now rather than silently disabling the gate', async () => {
    await withRepoCwd(async (root) => {
      const activePath = activeClaimsPath(root);
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'open',
          '--active',
          activePath,
          '--thread',
          'lc1-gate',
          '--area-kind',
          'files',
          '--area-pattern',
          'agent-tools/**',
          '--intent',
          'malformed now',
          '--now',
          'not-a-timestamp',
          '--platform',
          'claude',
          '--model',
          'claude-opus-4-8',
        ],
        env: sessionEnv('lc1-bad-now'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/--now must be a valid ISO-8601/i);
    });
  });
});
