import { describe, expect, it } from 'vitest';

import { type ArcFindingCode } from '../../arc/arc-channel-grammar.js';
import { validateArcChannelSurfaces } from './validate-arc-channels-helpers.js';

const GOOD_POST_ADOPTION = [
  '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
  '',
  'Pair channel for the fixture team.',
  'Channel-colour: 2',
  '',
  '## [Amber Testing Beacon abc123] 2026-07-09T10:00:00Z — channel open',
  '',
  'Free-form body.',
  '',
].join('\n');

const GRANDFATHERED = [
  '# ARC — old fixture topic',
  '',
  '## [Brassy Fixture Gong def456] 2026-07-05T09:53Z — minutes precision, no colour',
  '',
].join('\n');

describe('validateArcChannelSurfaces', () => {
  it('returns zero findings for a conforming mixed corpus', () => {
    const findings = validateArcChannelSurfaces([
      { name: '2026-07-09-fixture-lane-amber-brassy.md', content: GOOD_POST_ADOPTION },
      { name: '2026-07-05-old-fixture.md', content: GRANDFATHERED },
    ]);
    expect(findings).toEqual([]);
  });

  it('reds a post-adoption file with no colour line and cites the protocol doc', () => {
    const findings = validateArcChannelSurfaces([
      {
        name: '2026-07-09-fixture-lane-amber-brassy.md',
        content: GOOD_POST_ADOPTION.replace('Channel-colour: 2\n', ''),
      },
    ]);
    expect(findings).toHaveLength(1);
    const expected: ArcFindingCode = 'missing-colour';
    expect(findings[0].code).toBe(expected);
    expect(findings[0].remediation).toContain('.agent/reference/arc-rapid-communication.md');
  });

  it('aggregates findings across files, each anchored to its surface', () => {
    const findings = validateArcChannelSurfaces([
      { name: '2026-07-09-a.md', content: '## [broken\n' },
      { name: '2026-07-09-b.md', content: '## [also broken\n' },
    ]);
    expect(findings.map((f) => f.surface)).toEqual([
      '2026-07-09-a.md',
      '2026-07-09-a.md',
      '2026-07-09-a.md',
      '2026-07-09-b.md',
      '2026-07-09-b.md',
      '2026-07-09-b.md',
    ]);
  });
});
