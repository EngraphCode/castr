import { describe, expect, it } from 'vitest';

import {
  ARC_SCHEMA_ADOPTION_DATE,
  channelDateFromFileName,
  deriveArcRoster,
  evaluateArcChannelStrictness,
  isCrossHostChannelName,
  parseArcChannel,
  resolveChannelColour,
  type ArcEntryHeader,
} from './arc-channel-grammar.js';

/**
 * Fixtures are corpus-faithful in SHAPE but clearly fake in identity: no real
 * agent display names or session prefixes appear. Every deviation encoded here
 * was observed first-hand in the live rapid-comms corpus on 2026-07-08 —
 * seconds-precision headers (the 90%+ case), minutes-precision headers (the
 * 2026-07-05 scrub-guard file), and one timestamp-less header with a
 * double-space before the em-dash.
 */
const PRE_ADOPTION_FILE = '2026-07-05-fixture-lane-amber-testing-beacon-brassy-fixture-gong.md';
const POST_ADOPTION_FILE = '2026-07-09-fixture-lane-amber-testing-beacon-brassy-fixture-gong.md';
const PALETTE_SIZE = 8;

const secondsHeader =
  '## [Amber Testing Beacon abc123] 2026-07-05T09:53:12Z — channel open: fixture';
const minutesHeader = '## [Brassy Fixture Gong def456] 2026-07-05T09:53Z — joined; minutes only';
const timestamplessHeader = '## [Brassy Fixture Gong def456]  — joined; no timestamp at all';

const conformingPostAdoption = [
  '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
  '',
  'Pair channel for the fixture team. Protocol: fixture.',
  'Channel-colour: 3',
  '',
  '## [Amber Testing Beacon abc123] 2026-07-09T10:00:00Z — channel open: fixture',
  '',
  'Body text, entirely free-form. Zero ceremony here.',
  '',
  '— Amber Testing Beacon (abc123)',
  '',
  '## [Brassy Fixture Gong def456] 2026-07-09T10:05:09Z — joined',
  '',
  'More free-form body.',
  '',
  '— Brassy Fixture Gong (def456)',
  '',
].join('\n');

describe('isCrossHostChannelName', () => {
  const FOUNDING_CROSS_HOST =
    '2026-07-09-cross-host-window-sparking-firing-cinder-starlit-threading-dawn.md';

  it('matches the founding cross-host guest-window instance', () => {
    expect(isCrossHostChannelName(FOUNDING_CROSS_HOST)).toBe(true);
  });

  it('does not match the token embedded inside an unrelated word (crossword-host)', () => {
    expect(isCrossHostChannelName('crossword-host-notes.md')).toBe(false);
  });

  it('does not match the token straddling unrelated boundaries (across-hosting)', () => {
    expect(isCrossHostChannelName('across-hosting.md')).toBe(false);
  });

  it('reads the basename, so a directory-shaped path with a cross-host basename matches', () => {
    expect(isCrossHostChannelName('arc-channels/2026-07-09-cross-host-window-foo.md')).toBe(true);
  });

  it('reads ONLY the basename, so a cross-host directory with a plain basename does not match', () => {
    expect(isCrossHostChannelName('cross-host-lane/regular-pair-notes.md')).toBe(false);
  });
});

describe('channelDateFromFileName', () => {
  it('extracts the YYYY-MM-DD prefix', () => {
    expect(channelDateFromFileName(PRE_ADOPTION_FILE)).toBe('2026-07-05');
  });

  it('returns undefined for an undated filename', () => {
    expect(channelDateFromFileName('fixture-notes.md')).toBeUndefined();
  });
});

describe('parseArcChannel', () => {
  it('parses title, entry headers, and colour lines from a conforming channel', () => {
    const parse = parseArcChannel(POST_ADOPTION_FILE, conformingPostAdoption);
    expect(parse.titleLine).toBe(
      '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
    );
    expect(parse.entries).toHaveLength(2);
    const expectedOpen: Partial<ArcEntryHeader> = {
      authorName: 'Amber Testing Beacon',
      sessionIdPrefix: 'abc123',
      timestampIso: '2026-07-09T10:00:00Z',
      subject: 'channel open: fixture',
    };
    expect(parse.entries[0]).toMatchObject(expectedOpen);
    expect(parse.colourLines).toEqual([{ index: 3, line: 4 }]);
    expect(parse.findings).toEqual([]);
  });

  it('accepts all three observed header timestamp shapes as parseable entries', () => {
    const content = [secondsHeader, '', minutesHeader, '', timestamplessHeader, ''].join('\n');
    const parse = parseArcChannel(PRE_ADOPTION_FILE, content);
    expect(parse.entries).toHaveLength(3);
    expect(parse.entries[1].timestampIso).toBe('2026-07-05T09:53Z');
    expect(parse.entries[2].timestampIso).toBeUndefined();
    expect(parse.entries[2].subject).toBe('joined; no timestamp at all');
  });

  it('flags a header-candidate line that fails the grammar instead of crashing', () => {
    const truncatedTail = '## [Amber Testing Be';
    const parse = parseArcChannel(PRE_ADOPTION_FILE, `${secondsHeader}\n\n${truncatedTail}`);
    expect(parse.entries).toHaveLength(1);
    expect(parse.findings).toHaveLength(1);
    expect(parse.findings[0]).toMatchObject({ code: 'malformed-entry-header', line: 3 });
  });

  it('flags a malformed colour value but keeps parsing', () => {
    const content = ['Channel-colour: blue', '', secondsHeader, ''].join('\n');
    const parse = parseArcChannel(PRE_ADOPTION_FILE, content);
    expect(parse.colourLines).toEqual([]);
    expect(parse.findings[0]).toMatchObject({ code: 'malformed-colour-line', line: 1 });
  });
});

describe('resolveChannelColour', () => {
  it('is none when no colour line exists', () => {
    const parse = parseArcChannel(PRE_ADOPTION_FILE, `${secondsHeader}\n`);
    expect(resolveChannelColour(parse)).toEqual({ kind: 'none' });
  });

  it('last colour line wins (append-only re-assignment)', () => {
    const content = ['Channel-colour: 2', '', secondsHeader, '', 'Channel-colour: 5', ''].join(
      '\n',
    );
    const parse = parseArcChannel(PRE_ADOPTION_FILE, content);
    expect(resolveChannelColour(parse)).toEqual({ kind: 'indexed', index: 5 });
  });
});

describe('deriveArcRoster', () => {
  it('derives the unique on-channel roster from entry headers', () => {
    const parse = parseArcChannel(POST_ADOPTION_FILE, conformingPostAdoption);
    expect(deriveArcRoster(parse)).toEqual([
      { authorName: 'Amber Testing Beacon', sessionIdPrefix: 'abc123' },
      { authorName: 'Brassy Fixture Gong', sessionIdPrefix: 'def456' },
    ]);
  });

  it('derives roster entries for authors regardless of the filename (roster derivation)', () => {
    const joinerOnly = [
      secondsHeader,
      '',
      '## [Cloudy Fixture Harbour 987fed] 2026-07-05T11:00:00Z — joined from outside the filename',
      '',
    ].join('\n');
    const parse = parseArcChannel(PRE_ADOPTION_FILE, joinerOnly);
    expect(deriveArcRoster(parse)).toContainEqual({
      authorName: 'Cloudy Fixture Harbour',
      sessionIdPrefix: '987fed',
    });
  });
});

describe('evaluateArcChannelStrictness — pre-adoption (grandfathered) tier', () => {
  const options = { adoptionDate: ARC_SCHEMA_ADOPTION_DATE, paletteSize: PALETTE_SIZE };

  it('passes the full observed-deviation corpus shape with zero violations', () => {
    const content = [
      '# ARC — fixture topic',
      '',
      secondsHeader,
      '',
      minutesHeader,
      '',
      timestamplessHeader,
      '',
    ].join('\n');
    const parse = parseArcChannel(PRE_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options)).toEqual([]);
  });

  it('still rejects a malformed entry-header candidate in any tier', () => {
    const parse = parseArcChannel(PRE_ADOPTION_FILE, '## [not a header\n');
    const violations = evaluateArcChannelStrictness(parse, options);
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe('malformed-entry-header');
  });

  it('validates a colour line when one is present, even pre-adoption', () => {
    const content = [`Channel-colour: ${PALETTE_SIZE}`, '', secondsHeader, ''].join('\n');
    const parse = parseArcChannel(PRE_ADOPTION_FILE, content);
    const violations = evaluateArcChannelStrictness(parse, options);
    expect(violations.map((v) => v.code)).toEqual(['colour-out-of-range']);
  });
});

describe('evaluateArcChannelStrictness — post-adoption (strict) tier', () => {
  const options = { adoptionDate: ARC_SCHEMA_ADOPTION_DATE, paletteSize: PALETTE_SIZE };

  it('passes a fully conforming post-adoption channel', () => {
    const parse = parseArcChannel(POST_ADOPTION_FILE, conformingPostAdoption);
    expect(evaluateArcChannelStrictness(parse, options)).toEqual([]);
  });

  it('requires seconds-precision timestamps on every entry header', () => {
    const content = conformingPostAdoption.replace('2026-07-09T10:05:09Z', '2026-07-09T10:05Z');
    const parse = parseArcChannel(POST_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options).map((v) => v.code)).toEqual([
      'timestamp-precision',
    ]);
  });

  it('requires a timestamp on every entry header', () => {
    const content = [
      conformingPostAdoption,
      '## [Brassy Fixture Gong def456]  — no timestamp in the strict era',
      '',
    ].join('\n');
    const parse = parseArcChannel(POST_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options).map((v) => v.code)).toEqual([
      'missing-timestamp',
    ]);
  });

  it('requires the canonical title shape', () => {
    const content = conformingPostAdoption.replace(
      '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
      '# ARC — fixture lane',
    );
    const parse = parseArcChannel(POST_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options).map((v) => v.code)).toEqual([
      'malformed-title',
    ]);
  });

  it('requires a colour line, and requires the first one before the first entry', () => {
    const missing = parseArcChannel(
      POST_ADOPTION_FILE,
      conformingPostAdoption.replace('Channel-colour: 3\n', ''),
    );
    expect(evaluateArcChannelStrictness(missing, options).map((v) => v.code)).toEqual([
      'missing-colour',
    ]);

    const late = parseArcChannel(
      POST_ADOPTION_FILE,
      `${conformingPostAdoption.replace('Channel-colour: 3\n', '')}Channel-colour: 3\n`,
    );
    expect(evaluateArcChannelStrictness(late, options).map((v) => v.code)).toEqual([
      'colour-after-first-entry',
    ]);
  });

  it('rejects an undated channel filename in every tier', () => {
    const parse = parseArcChannel('fixture-notes.md', conformingPostAdoption);
    const codes = evaluateArcChannelStrictness(parse, options).map((v) => v.code);
    expect(codes).toContain('undated-filename');
  });

  it('requires a preamble between title and first entry', () => {
    const content = [
      '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
      'Channel-colour: 3',
      '## [Amber Testing Beacon abc123] 2026-07-09T10:00:00Z — open',
      '',
    ].join('\n');
    const parse = parseArcChannel(POST_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options).map((v) => v.code)).toEqual([
      'missing-preamble',
    ]);
  });

  it('rejects a blanks-and-colour-only preamble — prose is required, not gaps', () => {
    const content = [
      '# ARC channel: fixture lane — Amber Testing Beacon × Brassy Fixture Gong',
      '',
      'Channel-colour: 3',
      '',
      '## [Amber Testing Beacon abc123] 2026-07-09T10:00:00Z — open',
      '',
    ].join('\n');
    const parse = parseArcChannel(POST_ADOPTION_FILE, content);
    expect(evaluateArcChannelStrictness(parse, options).map((v) => v.code)).toEqual([
      'missing-preamble',
    ]);
  });
});
