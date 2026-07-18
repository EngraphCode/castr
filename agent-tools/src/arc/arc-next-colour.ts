/**
 * Next-free colour assignment for the ARC channel-open ceremony: the opener
 * scans the colours worn by currently-active channels and takes the lowest
 * free palette index, so concurrently-live channels stay visually distinct
 * without a coordinator. Pure; the CLI (`arc-next-colour-cli.ts`) supplies
 * the live directory scan.
 *
 * @packageDocumentation
 */

/**
 * Lowest palette index worn by the fewest active channels (ties → lowest
 * index). With a free slot that is simply the lowest unworn index; on a
 * saturated palette it degrades honestly to the least-collided slot.
 * Out-of-range assignments (possible in a hand-edited file) are ignored.
 */
export function nextFreeColourIndex(worn: readonly number[], paletteSize: number): number {
  const counts = new Array<number>(paletteSize).fill(0);
  for (const index of worn) {
    if (index >= 0 && index < paletteSize) {
      counts[index] += 1;
    }
  }
  let best = 0;
  for (let index = 1; index < paletteSize; index += 1) {
    if (counts[index] < counts[best]) {
      best = index;
    }
  }
  return best;
}

/** One scanned channel's occupancy facts: filename plus its resolved colour. */
export interface ChannelColourFacts {
  readonly name: string;
  readonly colourIndex: number | undefined;
}

/**
 * Colours worn by SAME-DAY channels, derived from the filename's date prefix
 * and immune to every mtime class (worktree checkout times, quiet channels).
 *
 * @remarks
 * Occupancy deliberately outlives the 30-minute ACTIVITY window: a live pair
 * can go hours between appends, and reassigning a quiet channel's colour is
 * exactly the collision observed live on 2026-07-10 (two seats derived 0
 * "free" while a quiet channel legitimately wore it). A same-day filename is
 * the honest occupancy signal — channels are date-named at open by the
 * protocol convention, and an 8-colour palette comfortably covers one day's
 * channels. Prior-day and undated names never occupy.
 */
export function deriveWornColours(
  channels: readonly ChannelColourFacts[],
  todayIsoDate: string,
): readonly number[] {
  const worn: number[] = [];
  for (const channel of channels) {
    if (channel.name.startsWith(`${todayIsoDate}-`) && channel.colourIndex !== undefined) {
      worn.push(channel.colourIndex);
    }
  }
  return worn;
}
