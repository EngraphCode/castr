import { describe, expect, it } from 'vitest';

import { deriveWornColours, nextFreeColourIndex } from './arc-next-colour.js';

describe('nextFreeColourIndex', () => {
  it('returns 0 when nothing is worn', () => {
    expect(nextFreeColourIndex([], 8)).toBe(0);
  });

  it('returns the lowest unworn index', () => {
    expect(nextFreeColourIndex([0, 1, 3], 8)).toBe(2);
  });

  it('wraps to the least-worn lowest index when the palette is saturated', () => {
    // Index 0 worn twice, everything else once: the least-worn tiebreak must
    // pick 1, where a naive lowest-index or first-free-else-0 picks 0.
    expect(nextFreeColourIndex([0, 0, 1, 2, 3, 4, 5, 6, 7], 8)).toBe(1);
  });

  it('ignores out-of-range assignments rather than crashing', () => {
    expect(nextFreeColourIndex([0, 99], 8)).toBe(1);
  });
});

describe('deriveWornColours (occupancy by same-day filename date, mtime-immune)', () => {
  const channels = [
    { name: '2026-07-10-lane-a-x-y.md', colourIndex: 0 },
    { name: '2026-07-10-lane-b-x-y.md', colourIndex: 3 },
    { name: '2026-07-09-yesterlane-x-y.md', colourIndex: 1 },
    { name: 'undated-channel-x-y.md', colourIndex: 2 },
    { name: '2026-07-10-no-colour-x-y.md', colourIndex: undefined },
  ] as const;

  it('same-day channels occupy their colour regardless of any mtime', () => {
    const worn = deriveWornColours(channels, '2026-07-10');

    expect([...worn].sort()).toStrictEqual([0, 3]);
  });

  it('prior-day and undated channels never occupy; colourless same-day channels contribute nothing', () => {
    const worn = deriveWornColours(channels, '2026-07-11');

    expect(worn).toStrictEqual([]);
  });
});
