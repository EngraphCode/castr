/**
 * ARC feather-badge colour palette for the Claude Code statusline.
 *
 * @remarks
 * The palette INDEX is the cross-session contract: a channel records
 * `Channel-colour: <index>` once at open (see
 * `src/arc/arc-channel-grammar.ts`), and every participating seat's
 * statusline derives the same colour from the same index — colour
 * identity across panes is the entire feature. The VALUES here are
 * re-tunable centrally without touching any channel file.
 *
 * The colour renders as foreground INK on the zero-gap membership bar
 * beside the feather (truecolor `38;2`; carrier and adjacency owner-ruled
 * from live terminal probes, 2026-07-10). The eight values are the dark
 * single-bar candidates RULED at the 2026-07-10 owner sitting — hue-preserved
 * mid-tones legible on BOTH light and dark backgrounds (≥3:1 non-text
 * contrast each way). The tuning constraint for any future retune, enforced
 * by the unit test's recomputing invariant: relative luminance in
 * [0.14, 0.30] is the only band that clears 3:1 on both white and #1E1E1E
 * (4.5:1 on both is mathematically impossible — the bands are disjoint).
 * A TWO-TONE variant (light+dark pair per badge) was explored and ruled
 * not-now at the same sitting — recorded in the lane plan as a designed
 * follow-up only if hues prove hard to distinguish in daily use. The count
 * must equal {@link ARC_PALETTE_SIZE}, which the grammar owns and the unit
 * test binds.
 *
 * @packageDocumentation
 */

import { ARC_PALETTE_SIZE } from '../arc/arc-channel-grammar.js';
import { truecolorForeground } from './statusline-ansi.js';

/** Dark mid-tone ink per palette index; length bound to ARC_PALETTE_SIZE. */
const ARC_PALETTE: readonly [number, number, number][] = [
  [108, 133, 149], // 0 slate blue
  [103, 137, 117], // 1 moss green
  [147, 127, 94], // 2 bronze peach
  [160, 120, 116], // 3 clay pink
  [140, 124, 148], // 4 dusk lavender
  [98, 137, 129], // 5 deep mint
  [140, 130, 89], // 6 olive yellow
  [124, 130, 136], // 7 steel grey-blue
];

/**
 * Loud error foreground for the `invalid` badge state's red dot (owner-ruled
 * 2026-07-10: error is distinguished by SHAPE as well as colour) — the exact
 * red the owner saw and approved in the ruling probe, saturated enough to
 * read as ink on dark terminals, and no palette slot approaches it, so a
 * violation can never be misread as a channel identity.
 */
export const ARC_ERROR_FOREGROUND = truecolorForeground(220, 60, 60);

/**
 * The truecolor foreground for one palette index — the ink on the membership
 * bar beside the feather. Indices wrap mod {@link ARC_PALETTE_SIZE}: the
 * grammar's gate keeps RECORDED indices in range, but the glance surface
 * never crashes on a wild value — two channels sharing a wrapped colour is
 * degraded, honestly visible, and loud at the gate.
 */
export function arcBadgeForeground(index: number): string {
  const slot = ARC_PALETTE[((index % ARC_PALETTE_SIZE) + ARC_PALETTE_SIZE) % ARC_PALETTE_SIZE];
  return truecolorForeground(slot[0], slot[1], slot[2]);
}
