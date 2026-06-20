import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import {
  parseClosedClaimsArchive,
  parseCollaborationRegistry,
} from '../../src/collaboration-state/state-io';
import {
  makeTempCollaborationRepo,
  removeDirectory,
} from '../test-helpers/temp-collaboration-state';

// Phase 8 task 3b — multi-writer collision-safety of the live claims substrate.
//
// The existing `transaction.integration.test` proves the lock+retry on a bare
// counter, and the comms integration tests run against an in-memory fake
// runtime. Neither exercises the full `claims open`/`close` stack (identity
// derivation -> live-routing-collision assertion -> mkdir transaction lock ->
// optimistic re-read retry -> atomic temp-file publish) under real concurrent
// filesystem contention. This test does: it fires N distinct sessions at the
// same `active-claims.json` together and asserts no write is lost — the
// programmatic mirror of the separate-OS-process CLI demonstration recorded in
// `.agent/plans/transplant/08-collaboration-active.md` §As-built task 3b.

const NOW = '2026-06-20T10:00:00Z';
const SESSIONS = 8;

function activeClaimsPath(root: string): string {
  return join(root, '.agent/state/collaboration/active-claims.json');
}

function closedClaimsPath(root: string): string {
  return join(root, '.agent/state/collaboration/closed-claims.archive.json');
}

// Distinct env seed per session => distinct uuid-v5 identity => distinct
// routing key, so each is a genuinely separate concurrent agent rather than a
// same-identity collision (which the engine intentionally rejects).
function sessionEnv(index: number): { readonly PRACTICE_AGENT_SESSION_ID_CLAUDE: string } {
  return { PRACTICE_AGENT_SESSION_ID_CLAUDE: `concurrency-session-seed-${index}-aaaaaaaa` };
}

function openArgv(activePath: string, index: number): readonly string[] {
  return [
    '--',
    'claims',
    'open',
    '--active',
    activePath,
    '--thread',
    `lane-${index}`,
    '--area-kind',
    'files',
    '--area-pattern',
    `synthetic/agent-${index}/**`,
    '--intent',
    `concurrent session ${index}`,
    '--now',
    NOW,
    '--platform',
    'claude',
    '--model',
    'claude-opus-4-8',
  ];
}

function closeArgv(
  activePath: string,
  closedPath: string,
  claimId: string,
  index: number,
): readonly string[] {
  return [
    '--',
    'claims',
    'close',
    '--active',
    activePath,
    '--closed',
    closedPath,
    '--claim-id',
    claimId,
    '--summary',
    `concurrent session ${index} done`,
    '--now',
    NOW,
    '--platform',
    'claude',
    '--model',
    'claude-opus-4-8',
  ];
}

function claimIdFromOpenStdout(stdout: string): string {
  const parsed: unknown = JSON.parse(stdout);
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'claim_id' in parsed &&
    typeof parsed.claim_id === 'string'
  ) {
    return parsed.claim_id;
  }
  throw new Error(`claims open did not emit a claim_id: ${stdout}`);
}

describe('claims concurrency (real filesystem, full CLI stack)', () => {
  it('serializes concurrent claim opens without losing any write', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    try {
      const results = await Promise.all(
        Array.from({ length: SESSIONS }, (_, offset) => {
          const index = offset + 1;
          return runCollaborationStateCli({
            argv: openArgv(activePath, index),
            env: sessionEnv(index),
          });
        }),
      );

      for (const result of results) {
        expect(result.exitCode, result.stderr).toBe(0);
      }

      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      expect(registry.claims).toHaveLength(SESSIONS);
      expect(new Set(registry.claims.map((claim) => claim.claim_id)).size).toBe(SESSIONS);
      expect(new Set(registry.claims.map((claim) => claim.agent_id.id)).size).toBe(SESSIONS);
    } finally {
      await removeDirectory(root);
    }
  });

  it('archives every claim under concurrent close with no active residue', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    const closedPath = closedClaimsPath(root);
    try {
      const opened = await Promise.all(
        Array.from({ length: SESSIONS }, (_, offset) => {
          const index = offset + 1;
          return runCollaborationStateCli({
            argv: openArgv(activePath, index),
            env: sessionEnv(index),
          }).then((result) => ({ index, claimId: claimIdFromOpenStdout(result.stdout) }));
        }),
      );

      const closeResults = await Promise.all(
        opened.map(({ index, claimId }) =>
          runCollaborationStateCli({
            argv: closeArgv(activePath, closedPath, claimId, index),
            env: sessionEnv(index),
          }),
        ),
      );

      for (const result of closeResults) {
        expect(result.exitCode, result.stderr).toBe(0);
      }

      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      const archive = parseClosedClaimsArchive(await readFile(closedPath, 'utf8'));
      expect(registry.claims).toHaveLength(0);
      expect(archive.claims).toHaveLength(SESSIONS);
      expect(new Set(archive.claims.map((claim) => claim.claim_id)).size).toBe(SESSIONS);
    } finally {
      await removeDirectory(root);
    }
  });
});
