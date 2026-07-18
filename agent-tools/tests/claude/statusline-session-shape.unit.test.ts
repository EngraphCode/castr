/**
 * Fixture-matrix coverage for the pure session-shape resolver: team shape
 * (solo / peer / directed / observing / observing-directed), claim
 * freshness (fresh vs stale vs heartbeat-refreshed), own-role resolution,
 * ARC channel badges (indexed / invalid / overflow; liveness window;
 * roster-union membership), and soft degradation on missing inputs.
 *
 * All inputs are explicit literals — no filesystem, no clock, no env.
 */
import { describe, expect, it } from 'vitest';

import {
  ARC_CONTENT_READ_CAP,
  rankArcContentReads,
  resolveSessionShape,
  type ArcBadgeColour,
  type ExperimentsEntry,
} from '../../src/claude/statusline-session-shape';
import {
  type CollaborationClaim,
  type CollaborationRegistry,
} from '../../src/collaboration-state/types';

const NOW = '2026-06-12T12:00:00Z';
const FRESH = '2026-06-12T11:30:00Z'; // 30 min before NOW, inside the 4h default TTL
const STALE = '2026-06-12T06:00:00Z'; // 6h before NOW, outside the 4h default TTL

function claim(
  overrides: Partial<CollaborationClaim> & { agent_name: string },
): CollaborationClaim {
  const { agent_name, ...claimOverrides } = overrides;
  return {
    claim_id: '11111111-1111-4111-8111-111111111111',
    agent_id: {
      agent_name,
      platform: 'claude-code',
      model: 'Fable 5',
      session_id_prefix: agent_name.slice(0, 6).toLowerCase(),
    },
    thread: 'agentic-engineering-enhancements',
    areas: [{ kind: 'files', patterns: ['agent-tools/src/claude/statusline-render.ts'] }],
    claimed_at: FRESH,
    intent: 'Fixture claim for session-shape resolution.',
    ...claimOverrides,
  };
}

function registry(claims: readonly CollaborationClaim[]): CollaborationRegistry {
  return { schema_version: '1.3.0', commit_queue: [], claims };
}

function arc(name: string, mtimeIso: string, extra?: Partial<ExperimentsEntry>): ExperimentsEntry {
  return { name, mtimeIso, ...extra };
}

const INVALID_COLOUR: ArcBadgeColour = { kind: 'invalid' };

/**
 * A minimal channel body naming no colour. A colour-less in-window channel
 * renders the loud invalid badge regardless of file date — there is no
 * quiet grandfathered badge state (owner ruling: no compatibility layers).
 */
const COLOURLESS_CONTENT = [
  '# ARC — fixture topic',
  '',
  '## [Monsoon Fixture Cirrus a1b2c3] 2026-06-12T11:45:00Z — fixture entry',
  '',
].join('\n');

describe('resolveSessionShape — team shape', () => {
  it('resolves solo for an empty registry', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape).toStrictEqual({ ownRole: undefined, teamShape: 'solo', arcChannels: [] });
  });

  it('resolves solo when the only fresh claims are my own', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({
          agent_name: 'Monsoon Fixture Cirrus',
          claim_id: '22222222-2222-4222-8222-222222222222',
        }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('solo');
  });

  it('resolves peer for two distinct fresh identities with no director', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('peer');
  });

  it('resolves directed when any fresh claim carries the director role', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('directed');
  });

  it('ignores a stale director claim — staleness wins over role', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director', claimed_at: STALE }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('solo');
  });

  it('counts a stale-claimed_at but heartbeat-refreshed peer as live', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch', claimed_at: STALE, heartbeat_at: FRESH }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('peer');
  });

  it('counts a claim exactly at its freshness TTL as still live', () => {
    // Default TTL 14400s; claimed_at + TTL === NOW is not yet expired.
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch', claimed_at: '2026-06-12T08:00:00Z' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('peer');
  });

  it('treats a claim one second past its freshness TTL as stale', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch', claimed_at: '2026-06-12T07:59:59Z' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('solo');
  });

  it('drops to observing when my own claim expires past its TTL but a peer stays fresh', () => {
    // The membership gate pivots on my own claim's freshness: once mine is
    // stale I am no longer a member, so a still-fresh peer reads as observing,
    // not peer.
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus', claimed_at: '2026-06-12T07:59:59Z' }),
        claim({ agent_name: 'Fern Fixture Mulch' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing');
  });

  it('resolves observing when others are fresh but I hold no claim', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([claim({ agent_name: 'Fern Fixture Mulch' })]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing');
  });

  it('reports observing-directed — never directed — when a director is active but I am not a member', () => {
    // Re-pinned at the 2026-07-10 Director ruling: a non-member beside a
    // fresh director claim reads the DIRECTED estate (observing-directed),
    // but never `directed` itself — it is not this session's team.
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Fern Fixture Mulch' }),
        claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing-directed');
    expect(shape.teamShape).not.toBe('directed');
  });

  it('resolves solo — not observing — when the only other claims are stale', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([claim({ agent_name: 'Fern Fixture Mulch', claimed_at: STALE })]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('solo');
  });

  it('resolves the same shape regardless of commit_queue content', () => {
    const queued: CollaborationRegistry = {
      schema_version: '1.3.0',
      commit_queue: [
        {
          intent_id: '99999999-9999-4999-8999-999999999999',
          claim_id: '11111111-1111-4111-8111-111111111111',
          agent_id: {
            agent_name: 'Fern Fixture Mulch',
            platform: 'claude-code',
            model: 'Fable 5',
            session_id_prefix: 'fernli',
          },
          files: ['agent-tools/src/claude/statusline-render.ts'],
          commit_subject: 'feat: fixture queue entry',
          queued_at: FRESH,
          updated_at: FRESH,
          expires_at: '2026-06-12T12:30:00Z',
          phase: 'queued',
        },
      ],
      claims: [
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch' }),
      ],
    };

    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: queued,
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('peer');
  });
});

describe('resolveSessionShape — own role', () => {
  it('resolves my role from my fresh role-bearing claim', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([claim({ agent_name: 'Monsoon Fixture Cirrus', role: 'director' })]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.ownRole).toBe('director');
  });

  it('leaves ownRole undefined when my claims carry no role', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus' }),
        claim({ agent_name: 'Fern Fixture Mulch', role: 'curator' }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.ownRole).toBeUndefined();
  });

  it('does not take a role from my stale claim', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Monsoon Fixture Cirrus', role: 'marshal', claimed_at: STALE }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.ownRole).toBeUndefined();
  });

  it('resolves observing-directed for a non-member when a fresh claim positively carries the director role', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director' })]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing-directed');
  });

  it('keeps bare observing for a non-member when no fresh claim carries a role (honesty rider)', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Tempest Fixture Stratosphere' }),
        claim({
          agent_name: 'Fern Fixture Mulch',
          claim_id: '22222222-2222-4222-8222-222222222222',
        }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing');
  });

  it('degrades a stale director claim to bare observing for a non-member (fresh non-director co-present)', () => {
    // The rider's staleness leg: the directed signal requires a FRESH
    // positively-read director claim. The co-present fresh role-less claim
    // keeps the seat observing (an all-stale registry would read solo — a
    // different, already-pinned path).
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([
        claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director', claimed_at: STALE }),
        claim({
          agent_name: 'Fern Fixture Mulch',
          claim_id: '22222222-2222-4222-8222-222222222222',
        }),
      ]),
      experimentsListing: [],
      nowIso: NOW,
    });

    expect(shape.teamShape).toBe('observing');
  });

  it('forks the same director registry by membership: member reads directed, non-member observing-directed', () => {
    const directorRegistry = registry([
      claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director' }),
      claim({
        agent_name: 'Monsoon Fixture Cirrus',
        claim_id: '22222222-2222-4222-8222-222222222222',
      }),
    ]);

    const member = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: directorRegistry,
      experimentsListing: [],
      nowIso: NOW,
    });
    expect(member.teamShape).toBe('directed');

    const nonMember = resolveSessionShape({
      ownAgentName: 'Aurora Fixture Borealis',
      registry: directorRegistry,
      experimentsListing: [],
      nowIso: NOW,
    });
    expect(nonMember.teamShape).toBe('observing-directed');
  });

  it('matches on the BARE name only — a display-decorated name resolves as a non-member (the dual-use guard)', () => {
    // The identity string is display AND registry-matching key. The statusline
    // renders the name but any decorated form must never reach the resolver:
    // this pin shows what silently breaks if it does — both matchers (own role
    // AND team shape) miss in lockstep.
    const directorRegistry = registry([
      claim({ agent_name: 'Monsoon Fixture Cirrus', role: 'director' }),
    ]);

    const bare = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: directorRegistry,
      experimentsListing: [],
      nowIso: NOW,
    });
    expect(bare.ownRole).toBe('director');
    expect(bare.teamShape).toBe('directed');

    const decorated = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus (c32a7d)',
      registry: directorRegistry,
      experimentsListing: [],
      nowIso: NOW,
    });
    expect(decorated.ownRole).toBeUndefined();
    // Still a NON-member conclusion (the guard's point) — and a non-member
    // beside a fresh director claim reads the directed estate honestly.
    expect(decorated.teamShape).toBe('observing-directed');
  });
});

describe('resolveSessionShape — ARC channel badges', () => {
  it('raises the loud invalid badge for an in-window colour-less channel (no legacy state)', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T11:50:00Z', {
          content: COLOURLESS_CONTENT,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([
      {
        name: 'arc-monsoon-fixture-cirrus-and-fern/README.md',
        colour: INVALID_COLOUR,
        crossHost: false,
      },
    ]);
  });

  it('flags a cross-host guest window on its badge from the entry name alone', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('2026-07-09-cross-host-window-monsoon-fixture-cirrus.md', '2026-06-12T11:50:00Z', {
          content: COLOURLESS_CONTENT,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([
      {
        name: '2026-07-09-cross-host-window-monsoon-fixture-cirrus.md',
        colour: INVALID_COLOUR,
        crossHost: true,
      },
    ]);
  });

  it('flags a cross-host overflow (beyond-cap) entry from the name alone, no content read', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('2026-07-09-cross-host-window-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', {
          contentAbsent: 'beyond-cap',
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([
      {
        name: '2026-07-09-cross-host-window-monsoon-fixture-cirrus.md',
        colour: { kind: 'overflow' },
        crossHost: true,
      },
    ]);
  });

  it('shows no badge for a stale channel naming this agent', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T10:00:00Z'),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([]);
  });

  it('counts a channel written exactly at the window edge (inclusive)', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T11:30:00Z', {
          content: COLOURLESS_CONTENT,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toHaveLength(1);
  });

  it('shows no badge one second outside the window', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T11:29:59Z'),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([]);
  });

  it('shows no badge for a fresh channel naming only other participants', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-fern-fixture-mulch-and-tempest/README.md', '2026-06-12T11:59:00Z', {
          content: '# ARC — other pair\n',
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([]);
  });

  it('matches participant names across separator conventions', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('Monsoon_Fixture_Cirrus.gelling.md', '2026-06-12T11:59:00Z', {
          content: '# ARC — separator fixture\n',
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toHaveLength(1);
  });

  it('shows no badge for a future-dated channel (clock skew yields a negative age)', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T12:05:00Z'),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toStrictEqual([]);
  });

  it('badges a roster-accretion joiner the filename never names (the cure property)', () => {
    const joinedContent = [
      '# ARC channel — fern and tempest',
      '',
      '## [Fern Fixture Mulch b2c3d4] 2026-06-12T11:40:00Z — channel open',
      '',
      '## [Monsoon Fixture Cirrus a1b2c3] 2026-06-12T11:50:00Z — joined from outside the filename',
      '',
    ].join('\n');
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('2026-06-12-fern-fixture-mulch-and-tempest.md', '2026-06-12T11:55:00Z', {
          content: joinedContent,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toHaveLength(1);
    expect(shape.arcChannels[0].colour).toStrictEqual(INVALID_COLOUR);
  });

  it('carries the recorded palette index, and the last colour line wins', () => {
    const colouredContent = [
      '# ARC channel: fixture — Monsoon Fixture Cirrus × Fern Fixture Mulch',
      '',
      'Preamble prose.',
      'Channel-colour: 2',
      '',
      '## [Monsoon Fixture Cirrus a1b2c3] 2026-06-12T11:50:00Z — open',
      '',
      'Channel-colour: 5',
      '',
    ].join('\n');
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('2026-06-12-fixture-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', {
          content: colouredContent,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels[0].colour).toStrictEqual({ kind: 'indexed', index: 5 });
  });

  it('reads a colour-less channel as invalid regardless of file date (dated pre- and post-adoption)', () => {
    // The gate's dated strictness tiers govern FILE conformance; the badge
    // has no date-keyed quiet state — colour-less is loud everywhere.
    const preAdoption = arc(
      '2026-06-12-fixture-monsoon-fixture-cirrus.md',
      '2026-06-12T11:55:00Z',
      {
        content: '# ARC channel: fixture — names\n\nPreamble.\n',
      },
    );
    const postAdoption = arc(
      '2099-01-01-fixture-monsoon-fixture-cirrus.md',
      '2026-06-12T11:55:00Z',
      {
        content: '# ARC channel: fixture — names\n\nPreamble.\n',
      },
    );
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [preAdoption, postAdoption],
      nowIso: NOW,
    });

    expect(shape.arcChannels.map((badge) => badge.colour)).toStrictEqual([
      { kind: 'invalid' },
      { kind: 'invalid' },
    ]);
  });

  it('reads an out-of-range or malformed colour as invalid', () => {
    const outOfRange = arc('2026-06-12-a-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', {
      content: '# t\n\nChannel-colour: 99\n',
    });
    const malformed = arc('2026-06-12-b-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', {
      content: '# t\n\nChannel-colour: blue\n',
    });
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [outOfRange, malformed],
      nowIso: NOW,
    });

    expect(shape.arcChannels.map((badge) => badge.colour)).toStrictEqual([
      { kind: 'invalid' },
      { kind: 'invalid' },
    ]);
  });

  it('reads a truncated in-flight append as a parseable channel, never a crash', () => {
    const truncated = `${COLOURLESS_CONTENT}## [Monsoon guards Ci`;
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T11:55:00Z', {
          content: truncated,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels).toHaveLength(1);
  });

  it('marks a beyond-cap in-window channel as overflow and an unreadable one as invalid', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-a-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', {
          contentAbsent: 'beyond-cap',
        }),
        arc('arc-b-monsoon-fixture-cirrus.md', '2026-06-12T11:56:00Z', {
          contentAbsent: 'unreadable',
        }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels.map((badge) => badge.colour)).toStrictEqual([
      { kind: 'overflow' },
      { kind: 'invalid' },
    ]);
  });

  it('orders badges by channel name for a stable glance surface', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: registry([]),
      experimentsListing: [
        arc('arc-z-monsoon-fixture-cirrus.md', '2026-06-12T11:55:00Z', { content: '# t\n' }),
        arc('arc-a-monsoon-fixture-cirrus.md', '2026-06-12T11:56:00Z', { content: '# t\n' }),
      ],
      nowIso: NOW,
    });

    expect(shape.arcChannels.map((badge) => badge.name)).toStrictEqual([
      'arc-a-monsoon-fixture-cirrus.md',
      'arc-z-monsoon-fixture-cirrus.md',
    ]);
  });
});

describe('resolveSessionShape — soft degradation', () => {
  it('reads an unreadable registry as unknown, not a false solo', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: undefined,
      experimentsListing: undefined,
      nowIso: NOW,
    });

    expect(shape).toStrictEqual({ ownRole: undefined, teamShape: 'unknown', arcChannels: [] });
  });

  it('still raises the wing when the registry is unreadable but a channel is live', () => {
    const shape = resolveSessionShape({
      ownAgentName: 'Monsoon Fixture Cirrus',
      registry: undefined,
      experimentsListing: [
        arc('arc-monsoon-fixture-cirrus-and-fern/README.md', '2026-06-12T11:50:00Z', {
          content: COLOURLESS_CONTENT,
        }),
      ],
      nowIso: NOW,
    });

    expect(shape).toStrictEqual({
      ownRole: undefined,
      teamShape: 'unknown',
      arcChannels: [
        {
          name: 'arc-monsoon-fixture-cirrus-and-fern/README.md',
          colour: INVALID_COLOUR,
          crossHost: false,
        },
      ],
    });
  });

  it('reads others as observing-directed — never a team this session joined — without an identity', () => {
    // No resolved identity cannot be matched to any claim, so the session is a
    // non-member: other live claims read from the outside — with a positively
    // read fresh director claim, observing-directed (2026-07-10 ruling; an
    // absent identity is not a registry read error, so the honesty rider does
    // not suppress the directed signal) — never directed/peer, and there is
    // no own-role or participant-matched wing.
    const shape = resolveSessionShape({
      ownAgentName: undefined,
      registry: registry([
        claim({ agent_name: 'Fern Fixture Mulch' }),
        claim({ agent_name: 'Tempest Fixture Stratosphere', role: 'director' }),
      ]),
      experimentsListing: [arc('arc-fern-and-tempest/README.md', '2026-06-12T11:59:00Z')],
      nowIso: NOW,
    });

    expect(shape).toStrictEqual({
      ownRole: undefined,
      teamShape: 'observing-directed',
      arcChannels: [],
    });
  });
});

describe('rankArcContentReads — membership-first read budget', () => {
  const NOW_MS = Date.parse(NOW);

  it("keeps a seat's own oldest channel inside the budget when newer non-member channels abound", () => {
    // Nine in-window channels; the member channel is the OLDEST. Newest-first
    // alone would starve it (the gateway-review scenario); membership-first
    // must keep it readable.
    const member = arc('arc-monsoon-fixture-cirrus-own.md', '2026-06-12T11:31:00Z');
    const others = Array.from({ length: ARC_CONTENT_READ_CAP + 1 }, (_, i) =>
      arc(`arc-others-${String(i)}.md`, `2026-06-12T11:4${String(i % 10)}:00Z`),
    );
    const toRead = rankArcContentReads([...others, member], 'Monsoon Fixture Cirrus', NOW_MS);
    expect(toRead.has('arc-monsoon-fixture-cirrus-own.md')).toBe(true);
    expect(toRead.size).toBe(ARC_CONTENT_READ_CAP);
  });

  it('fills remaining budget newest-first and excludes out-of-window entries', () => {
    const stale = arc('arc-stale-monsoon-fixture-cirrus.md', '2026-06-12T10:00:00Z');
    const fresh = arc('arc-fresh.md', '2026-06-12T11:59:00Z');
    const toRead = rankArcContentReads([stale, fresh], 'Monsoon Fixture Cirrus', NOW_MS);
    expect(toRead.has('arc-stale-monsoon-fixture-cirrus.md')).toBe(false);
    expect(toRead.has('arc-fresh.md')).toBe(true);
  });
});
