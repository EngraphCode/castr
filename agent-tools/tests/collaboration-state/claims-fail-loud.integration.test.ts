import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { parseCollaborationRegistry } from '../../src/collaboration-state/state-io';
import {
  makeTempCollaborationRepo,
  removeDirectory,
} from '../test-helpers/temp-collaboration-state';

// Oak-parity C2 — claims heartbeat/close must FAIL LOUD on a claim id that
// matches nothing, and `claims open --role` must persist the role.
//
// castr's `heartbeatClaim` mapped over the registry and silently produced an
// unchanged registry when no claim matched (e.g. a short prefix passed instead
// of the full UUID), and `closeClaim` likewise archived nothing — both reported
// success while the caller's belief diverged from the registry. That is a
// fail-fast regression against the Oak pin's `assertClaimMatches` guard. The
// `--role` declaration was also dropped from the open path.

const NOW = '2026-06-20T10:00:00Z';
const ABSENT_CLAIM_ID = '11111111-1111-4111-8111-111111111111';

function activeClaimsPath(root: string): string {
  return join(root, '.agent/state/collaboration/active-claims.json');
}

function closedClaimsPath(root: string): string {
  return join(root, '.agent/state/collaboration/closed-claims.archive.json');
}

function sessionEnv(seed: string): { readonly PRACTICE_AGENT_SESSION_ID_CLAUDE: string } {
  return { PRACTICE_AGENT_SESSION_ID_CLAUDE: `${seed}-aaaaaaaa` };
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

describe('claims fail-loud guard + role declaration', () => {
  it('fails loudly when heartbeat targets a claim id that matches nothing', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    try {
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'heartbeat',
          '--active',
          activePath,
          '--claim-id',
          ABSENT_CLAIM_ID,
          '--now',
          NOW,
        ],
        env: sessionEnv('heartbeat-noop'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/no active claim matches/i);
    } finally {
      await removeDirectory(root);
    }
  });

  it('fails loudly when close targets a claim id that matches nothing', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    const closedPath = closedClaimsPath(root);
    try {
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'close',
          '--active',
          activePath,
          '--closed',
          closedPath,
          '--claim-id',
          ABSENT_CLAIM_ID,
          '--summary',
          'closing a claim that does not exist',
          '--now',
          NOW,
          '--platform',
          'claude',
          '--model',
          'claude-opus-4-8',
        ],
        env: sessionEnv('close-noop'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/no active claim matches/i);
    } finally {
      await removeDirectory(root);
    }
  });

  it('persists the role declared via --role on claims open', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    try {
      const opened = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'open',
          '--active',
          activePath,
          '--thread',
          'parity',
          '--area-kind',
          'files',
          '--area-pattern',
          'agent-tools/**',
          '--intent',
          'role declaration',
          '--role',
          'director',
          '--now',
          NOW,
          '--platform',
          'claude',
          '--model',
          'claude-opus-4-8',
        ],
        env: sessionEnv('role-open'),
      });

      expect(opened.exitCode, opened.stderr).toBe(0);
      const claimId = claimIdFromOpenStdout(opened.stdout);

      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      const claim = registry.claims.find((entry) => entry.claim_id === claimId);
      expect(claim?.role).toBe('director');
    } finally {
      await removeDirectory(root);
    }
  });

  it('fails loudly when --role is passed with no value (no silent role="true")', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    try {
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'open',
          '--active',
          activePath,
          '--thread',
          'parity',
          '--area-kind',
          'files',
          '--area-pattern',
          'agent-tools/**',
          '--intent',
          'role with no value',
          '--now',
          NOW,
          '--platform',
          'claude',
          '--model',
          'claude-opus-4-8',
          '--role',
        ],
        env: sessionEnv('role-novalue'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/requires a value/i);

      const registry = parseCollaborationRegistry(await readFile(activePath, 'utf8'));
      expect(registry.claims).toHaveLength(0);
    } finally {
      await removeDirectory(root);
    }
  });

  it('fails loud and leaves the registry unchanged when heartbeat misses on a non-empty registry', async () => {
    const root = await makeTempCollaborationRepo();
    const activePath = activeClaimsPath(root);
    try {
      const opened = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'open',
          '--active',
          activePath,
          '--thread',
          'parity',
          '--area-kind',
          'files',
          '--area-pattern',
          'agent-tools/**',
          '--intent',
          'prefix-miss baseline',
          '--now',
          NOW,
          '--platform',
          'claude',
          '--model',
          'claude-opus-4-8',
        ],
        env: sessionEnv('prefix-miss'),
      });
      expect(opened.exitCode, opened.stderr).toBe(0);
      const claimId = claimIdFromOpenStdout(opened.stdout);
      const afterOpen = await readFile(activePath, 'utf8');

      // A truncated prefix of a real claim id matches nothing under exact ===.
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'heartbeat',
          '--active',
          activePath,
          '--claim-id',
          claimId.slice(0, 8),
          '--now',
          '2026-06-20T10:05:00Z',
        ],
        env: sessionEnv('prefix-miss'),
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/no active claim matches/i);
      // The guard runs inside the transactional transform: no write on a miss.
      expect(await readFile(activePath, 'utf8')).toBe(afterOpen);
    } finally {
      await removeDirectory(root);
    }
  });
});
