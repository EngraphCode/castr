/**
 * Render coverage for the session-shape indicators: every shape combination
 * (unknown/solo/peer/directed/observing/observing-directed × arc on/off ×
 * director/non-director own role),
 * the no-shape tick, the solo-vs-unknown distinction (a confident solo carries
 * its own marker; an unknown shape shows nothing), clean dropping of absent
 * indicator segments, and placement in both layouts — the no-logo two-line
 * layout (indicators on the coordination line) and the four-row mark layout
 * (indicators trailing the identity on row 0).
 */
import { describe, expect, it } from 'vitest';

import { CYAN, DIM, GREEN, MAGENTA, RESET } from '../../src/claude/statusline-ansi';
import { ARC_ERROR_FOREGROUND, arcBadgeForeground } from '../../src/claude/statusline-arc-palette';
import { renderStatusline, type StatuslineParts } from '../../src/claude/statusline-render';
import { type ArcChannelBadge, type SessionShape } from '../../src/claude/statusline-session-shape';

/** Brand-free four-row fixture mark (castr ships no logo art; the renderer consumes resolved rows). */
const FIXTURE_MARK = ['⠀⢀⣠⣞⣁⠀', '⣼⠋⠘⢧⡉⢷', '⢹⡅⠀⠀⢉⡍', '⠀⠻⣤⣤⠞⠁'] as const;

const SEP = `${DIM} · ${RESET}`;

const COMPASS = '\u{1F9ED}';
const FAMILY = '\u{1F46A}';
const PEER = '\u{1F91D}';
const SOLO = '\u{1F9CD}';
const OBSERVING = `${DIM}\u{1F440}${RESET}`;
// One DIM run for the one glance-unit; presentation PENDING owner-eye batch.
const OBSERVING_DIRECTED = `${DIM}\u{1F440}\u{1F9ED}${RESET}`;
const FEATHER = '\u{1FAB6}';
const CROSS_HOST = '\u{21C5}';
const MEMBERSHIP_BAR = '\u{258C}';
const INVALID_DOT = '\u{25CF}';

function parts(sessionShape: SessionShape | undefined): StatuslineParts {
  return {
    identity: 'Monsoon guards Cirrus',
    dir: 'repo',
    branch: undefined,
    dirty: false,
    worktree: undefined,
    usedPercentage: undefined,
    fiveHourPercentage: undefined,
    fiveHourResetSeconds: undefined,
    sevenDayPercentage: undefined,
    sevenDayResetSeconds: undefined,
    model: undefined,
    sessionShape,
    coordinationBranch: undefined,
    coordinationPlace: undefined,
    error: undefined,
  };
}

function shape(overrides: Partial<SessionShape>): SessionShape {
  return { ownRole: undefined, teamShape: 'solo', arcChannels: [], ...overrides };
}

/** One live channel this session participates in — renders one indexed badge. */
const FIXTURE_BADGE: ArcChannelBadge = {
  name: 'arc-fixture-monsoon.md',
  colour: { kind: 'indexed', index: 0 },
  crossHost: false,
};

/**
 * The fixture badge's exact rendered form: the full-size feather stays OUTSIDE
 * every styled run (emoji inside an SGR run rendered small/washed — owner
 * screenshots 2026-07-09); the zero-gap foreground-coloured membership bar
 * carries the channel colour (half-left U+258C flush against the feather box, re-ruled at the 2026-07-10 sitting).
 */
const FIXTURE_FEATHER = `${FEATHER}${arcBadgeForeground(0)}${MEMBERSHIP_BAR}${RESET}`;

const IDENTITY = `${MAGENTA}Monsoon guards Cirrus${RESET}`;
const PLACE = `${CYAN}repo${RESET}`;

describe('renderStatusline — session-shape indicators', () => {
  it('renders the solo marker for a confident solo session', () => {
    expect(renderStatusline(parts(shape({})))).toBe(`${IDENTITY}${SEP}${SOLO}\n${PLACE}`);
  });

  it('renders nothing for an unknown shape (unreadable registry)', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'unknown' })))).toBe(`${IDENTITY}\n${PLACE}`);
  });

  it('renders nothing for an unresolved (undefined) shape', () => {
    expect(renderStatusline(parts(undefined))).toBe(`${IDENTITY}\n${PLACE}`);
  });

  it('distinguishes a confident solo from an unknown shape', () => {
    const solo = renderStatusline(parts(shape({})));
    const unknown = renderStatusline(parts(shape({ teamShape: 'unknown' })));

    expect(solo).not.toBe(unknown);
    expect(solo).toContain(SOLO);
    expect(unknown).not.toContain(SOLO);
  });

  it('renders the peer icon for a peer window', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer' })))).toBe(
      `${IDENTITY}${SEP}${PEER}\n${PLACE}`,
    );
  });

  it('renders the dimmed eyes glyph for an observing non-member session', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'observing' })))).toBe(
      `${IDENTITY}${SEP}${OBSERVING}\n${PLACE}`,
    );
  });

  it('renders dim eyes + compass for a non-member observing a directed estate', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'observing-directed' })))).toBe(
      `${IDENTITY}${SEP}${OBSERVING_DIRECTED}\n${PLACE}`,
    );
  });

  it('renders the observing-directed icon and wing together (composed icon, then space-joined feather)', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'observing-directed',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${OBSERVING_DIRECTED} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders the family icon for a directed window without my demark', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed' })))).toBe(
      `${IDENTITY}${SEP}${FAMILY}\n${PLACE}`,
    );
  });

  it('suffixes the compass demark to the identity when I am the director', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed', ownRole: 'director' })))).toBe(
      `${IDENTITY} ${COMPASS}${SEP}${FAMILY}\n${PLACE}`,
    );
  });

  it('shows no demark for a non-director own role', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer', ownRole: 'curator' })))).toBe(
      `${IDENTITY}${SEP}${PEER}\n${PLACE}`,
    );
  });

  it('renders the solo marker and wing for a solo session with a live channel', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${SOLO} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders the wing alone for an unknown shape with a live channel', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'unknown',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders peer icon and wing together', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'peer',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${PEER} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders the dimmed eyes glyph and wing for an observing session with a live channel', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'observing',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${OBSERVING} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders family icon and wing for a directed window I am not directing', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'directed',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${FAMILY} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('renders the full directed-director-with-wing combination', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            teamShape: 'directed',
            ownRole: 'director',
            arcChannels: [FIXTURE_BADGE],
          }),
        ),
      ),
    ).toBe(`${IDENTITY} ${COMPASS}${SEP}${FAMILY} ${FIXTURE_FEATHER}\n${PLACE}`);
  });

  it('keeps indicators in the single-line layout, before the model segment', () => {
    const rendered = renderStatusline({
      ...parts(
        shape({
          teamShape: 'peer',
          arcChannels: [FIXTURE_BADGE],
        }),
      ),
      model: 'Fable 5',
      usedPercentage: 12,
      branch: 'feat/statusline-enhancements',
    });

    const indicatorsAt = rendered.indexOf(PEER);
    const modelAt = rendered.indexOf('Fable 5');
    const branchAt = rendered.indexOf('feat/statusline-enhancements');
    expect(indicatorsAt).toBeGreaterThan(-1);
    expect(indicatorsAt).toBeLessThan(modelAt);
    expect(modelAt).toBeLessThan(branchAt);
  });

  it('shows team indicators even when identity is unavailable', () => {
    const rendered = renderStatusline({
      ...parts(shape({ teamShape: 'peer' })),
      identity: undefined,
    });

    expect(rendered).toBe(`${PEER}\n${PLACE}`);
  });
});

describe('renderStatusline — session-shape indicators in the four-row layout', () => {
  const SEXTANT = FIXTURE_MARK;
  const mark = (row: string): string => `${GREEN}${row}${RESET}`;
  const GAP = '  ';

  it('trails the indicators and demark on the identity row (full combo)', () => {
    const out = renderStatusline(
      parts(
        shape({
          teamShape: 'directed',
          ownRole: 'director',
          arcChannels: [FIXTURE_BADGE],
        }),
      ),
      { logoRows: FIXTURE_MARK },
    );
    // model and context now share row 1, so the bare-dir πρ location lands on
    // row 2 (identity, empty model+context row, location) rather than row 3.
    expect(out.split('\n').slice(0, 4)).toEqual([
      `${mark(SEXTANT[0])}${GAP}${IDENTITY} ${COMPASS}${SEP}${FAMILY} ${FIXTURE_FEATHER}`,
      mark(SEXTANT[1]),
      `${mark(SEXTANT[2])}${GAP}${PLACE}`,
      mark(SEXTANT[3]),
    ]);
  });

  it('shows the peer icon on the identity row with no demark for a peer window', () => {
    const out = renderStatusline(parts(shape({ teamShape: 'peer' })), { logoRows: FIXTURE_MARK });
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${IDENTITY}${SEP}${PEER}`);
  });

  it('shows the composed observing-directed icon on the identity row', () => {
    const out = renderStatusline(parts(shape({ teamShape: 'observing-directed' })), {
      logoRows: FIXTURE_MARK,
    });
    expect(out.split('\n')[0]).toBe(
      `${mark(SEXTANT[0])}${GAP}${IDENTITY}${SEP}${OBSERVING_DIRECTED}`,
    );
  });

  it('shows the solo marker on the identity row for a confident solo session', () => {
    const out = renderStatusline(parts(shape({})), { logoRows: FIXTURE_MARK });
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${IDENTITY}${SEP}${SOLO}`);
  });

  it('leaves the identity row bare of indicators for an unknown shape', () => {
    const out = renderStatusline(parts(shape({ teamShape: 'unknown' })), {
      logoRows: FIXTURE_MARK,
    });
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${IDENTITY}`);
  });

  it('renders the team icon alone on the identity row when identity is unavailable', () => {
    const out = renderStatusline(
      { ...parts(shape({ teamShape: 'peer' })), identity: undefined },
      { logoRows: FIXTURE_MARK },
    );
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${PEER}`);
  });
});

describe('renderStatusline — coloured feather badges (feather + zero-gap colour bar)', () => {
  // Module invariant under test throughout this block: the feather emoji
  // never sits inside a styled run — colour identity travels as foreground
  // ink on the zero-gap BMP membership bar (indexed), the red invalid dot
  // (error by shape AND colour), or the styled `+` (overflow), so the glyph
  // renders identically to the bare feather the owner verified (adjacency
  // variant 1 + red-dot invalid, owner-ruled 2026-07-10).
  it('renders an indexed badge as a bare feather with a zero-gap palette bar', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              { name: '2026-07-09-a.md', colour: { kind: 'indexed', index: 3 }, crossHost: false },
            ],
          }),
        ),
      ),
    ).toBe(
      `${IDENTITY}${SEP}${SOLO} ${FEATHER}${arcBadgeForeground(3)}${MEMBERSHIP_BAR}${RESET}\n${PLACE}`,
    );
  });

  it('renders one badge per channel in resolver order, colours independent', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              { name: '2026-07-09-a.md', colour: { kind: 'indexed', index: 0 }, crossHost: false },
              { name: '2026-07-09-b.md', colour: { kind: 'indexed', index: 5 }, crossHost: false },
            ],
          }),
        ),
      ),
    ).toBe(
      `${IDENTITY}${SEP}${SOLO} ${FEATHER}${arcBadgeForeground(0)}${MEMBERSHIP_BAR}${RESET} ${FEATHER}${arcBadgeForeground(5)}${MEMBERSHIP_BAR}${RESET}\n${PLACE}`,
    );
  });

  it('renders the loud red dot for an invalid badge (error by shape and colour)', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              { name: '2026-07-09-a.md', colour: { kind: 'invalid' }, crossHost: false },
            ],
          }),
        ),
      ),
    ).toBe(
      `${IDENTITY}${SEP}${SOLO} ${FEATHER}${ARC_ERROR_FOREGROUND}${INVALID_DOT}${RESET}\n${PLACE}`,
    );
  });

  it('renders a bare feather with a dimmed plus for a beyond-cap overflow badge', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              { name: '2026-07-09-a.md', colour: { kind: 'overflow' }, crossHost: false },
            ],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${SOLO} ${FEATHER}${DIM}+${RESET}\n${PLACE}`);
  });
});

describe('renderStatusline — cross-host guest-window marker', () => {
  // A cross-host channel (PDR-138 guest window) wears a dim ⇅ immediately
  // after the feather, before the colour tail. The marker sits OUTSIDE the
  // emoji run (module invariant), and for overflow it folds into the single
  // DIM run that also carries the `+`. Non-cross-host shapes are unchanged
  // (pinned in the block above). The colour bar's ruled zero-gap adjacency
  // binds to the marker here, not the feather — queued for the owner-eye
  // follow-up alongside the hue retune.
  it('renders the dim cross-host marker before an indexed bar', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              {
                name: '2026-07-09-cross-host-window-a.md',
                colour: { kind: 'indexed', index: 3 },
                crossHost: true,
              },
            ],
          }),
        ),
      ),
    ).toBe(
      `${IDENTITY}${SEP}${SOLO} ${FEATHER}${DIM}${CROSS_HOST}${RESET}${arcBadgeForeground(3)}${MEMBERSHIP_BAR}${RESET}\n${PLACE}`,
    );
  });

  it('renders the dim cross-host marker before the loud invalid dot', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              {
                name: '2026-07-09-cross-host-window-a.md',
                colour: { kind: 'invalid' },
                crossHost: true,
              },
            ],
          }),
        ),
      ),
    ).toBe(
      `${IDENTITY}${SEP}${SOLO} ${FEATHER}${DIM}${CROSS_HOST}${RESET}${ARC_ERROR_FOREGROUND}${INVALID_DOT}${RESET}\n${PLACE}`,
    );
  });

  it('folds the cross-host marker and the plus into one dim run for overflow', () => {
    expect(
      renderStatusline(
        parts(
          shape({
            arcChannels: [
              {
                name: '2026-07-09-cross-host-window-a.md',
                colour: { kind: 'overflow' },
                crossHost: true,
              },
            ],
          }),
        ),
      ),
    ).toBe(`${IDENTITY}${SEP}${SOLO} ${FEATHER}${DIM}${CROSS_HOST}+${RESET}\n${PLACE}`);
  });
});
